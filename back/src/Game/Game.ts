import { Injectable } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CONTAINERHIEGHT, CONTAINERWIDTH, GameData, Paddle, Player, Room } from './types';

import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { verifyToken } from './Player-Init';
import { StartGameEvent, StartGameEventRobot } from './game-start-event';
import { User } from '@prisma/client';
import { UpdatePaddle, findRoomByPlayerSocket } from './Game-Update';
import { cancelgamesart, startGame } from './start-game';
import { stopGame } from './Game_services';
import { calculateRank } from './Game-Update';

@WebSocketGateway({ namespace: 'game' })
@Injectable()
export class Game implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private activeSockets: Map<Socket, User> = new Map();

  private rooms: Map<string, Room> = new Map();
  private invitrooms: Map<string, Room> = new Map();
  constructor(
    private prisma: PrismaService,
    private conf: ConfigService,
    private jwt: JwtService,
  ) {}

  //   onModuleInit() {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.query.token;
      //   console.log('token', token);
      const user = await verifyToken(token, this.prisma, this.conf, this.jwt);
      if (user) {
        if (user.status === 'InGame') {
          console.log('user connection ', user);
            client.disconnect();
          return;
        }
        console.log('user is found');
        this.activeSockets.set(client, user);
        console.log('connection established');
        client.emit('connected', 'the user is fount and the game will start ');
      } else {
        console.log('connection refused');
        client.disconnect();
      }
    } catch (e) {
      console.log('error', e);
    }
  }

  @SubscribeMessage('StartGame')
  async handleStartGame(client: Socket) {
    try {
      const user = this.activeSockets.get(client);
      if (!user)
        throw new Error("undefined user ");
      if (user.status === 'InGame') {
        console.log('user is already in game handle start game');
        return;
      } else {
        await this.prisma.user.update({
          where: {
            id: this.activeSockets.get(client).id,
          },
          data: {
            status: 'InGame',
          },
        });
        this.activeSockets.get(client).status = 'InGame';
      }
      StartGameEvent(
        client,
        CONTAINERHIEGHT,
        CONTAINERWIDTH,
        this.rooms,
        this.activeSockets,
        this.prisma,
        this.server,
      );
    } catch (e) {
      console.log('error', e);
    }
  }

  async handleDisconnect(client: Socket) {
    const room = findRoomByPlayerSocket(client, this.rooms);
    const user = this.activeSockets.get(client);
    if (user) {
      console.log('disconnecting client ', user);
      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          status: 'online',
        },
      });
      
    }
    if (room && room.gameActive) {

      console.log('room found to make force leave ');
      client.leave(room.roomName);
      room.players = room.players.filter((player) => player.socket !== client);

      if (room.players.length < 2) {
        const otherPlayerid = room.players
          .filter((player) => player.socket !== client)
          .map((player) => player.id)[0];
        this.prisma.match.update({
          where: {
            id: room.id,
          },
          data: {
            winnerId: otherPlayerid,
            result: 'aborted',
            end: new Date(),
          },
        });
        room.gameActive = false;
        this.rooms.delete(room.roomName);
        calculateRank(this.prisma);
      }
    }
  }

  @SubscribeMessage('InvitePlayer')
  async handleInvitePlayer(client: Socket, targetUserId: number) {
    const sender = this.activeSockets.get(client);
    const receiver = Array.from(this.activeSockets.values()).find(
      (user) => user.id === targetUserId,
    );

    if (!receiver) {
      console.log('receiver not found');
      return;
    }

    // Create an invitation room
    const invitationRoom = new Room(`invite_${sender.id}_${receiver.id}`);
    const padd = new Paddle(
      (CONTAINERWIDTH * 2) / 100,
      CONTAINERHIEGHT / 2,
      8,
      120,
      3,
    );
    const otherpadd = new Paddle(
      CONTAINERWIDTH - (CONTAINERWIDTH * 2) / 100,
      CONTAINERHIEGHT / 2,
      8,
      120,
      3,
    );

    const user = this.activeSockets.get(client);
    const player = new Player( 1, user.id , client, padd, invitationRoom.roomName, 0);

    invitationRoom.players.push(player);
    client.join(invitationRoom.roomName);
    this.invitrooms.set(invitationRoom.roomName, invitationRoom);

    await this.prisma.invitation.create({
      data: {
        senderId: sender.id,
        receiverId: receiver.id,
        isGame: true,
      }
    })

    // Send the invitation to the target user
    const invitationData = {
      senderId: sender.id,
      senderName: sender.username, // You should adjust this accordingly
      roomId: invitationRoom.roomName,
    };

    const [key, value] = Array.from(this.activeSockets.entries()).find(
      ([key, value]) => value.id === targetUserId,
    );
    key.emit('ReceiveInvitation', invitationData);
    const gamedata: GameData = {
      playerpad: player.paddle,
      otherpad: otherpadd,
      ball: invitationRoom.ball,
      playerScore: 0,
      otherScore: 0,
      rounds: invitationRoom.rounds,
      containerHeight: CONTAINERHIEGHT,
      containerWidth: CONTAINERWIDTH,
      id: player.number,
    };
    client.emit('JoinRoom', invitationRoom.roomName);
    client.emit('InitGame', gamedata);
  }

  @SubscribeMessage('AcceptInvitation')
  async handleAcceptInvitation(client: Socket, roomId: string) {
    const player = this.activeSockets.get(client);

    // Check if the player is invited to this room
    if (player.status === 'Invited') {
      const invitationRoom = this.invitrooms.get(roomId);
      const otherPlayer = invitationRoom.players.find(
        (player) => player.socket !== client,
        );
      const user = this.activeSockets.get(client);
      const otheruser = this.activeSockets.get(otherPlayer.socket);
      const pendingInvitation = await this.prisma.invitation.findFirst({
        where: {
          receiverId: user.id,
          senderId: otheruser.id,
          isGame: true,
          status: 'pending'
        }
      });
      if (!pendingInvitation) {
        otherPlayer.socket.leave(roomId);
        this.invitrooms.delete(roomId);
        return;
      }
      await this.prisma.invitation.update({
        where: {
          id: pendingInvitation.id
        },
        data: {
          status: 'accepted'
        }
      })
      if (invitationRoom) {

        // Assign the player to the invitation room
        const padd = new Paddle(
          (CONTAINERWIDTH * 2) / 100,
          CONTAINERHIEGHT / 2,
          8,
          80,
          3,
        );
        const otherpadd = new Paddle(
          CONTAINERWIDTH - (CONTAINERWIDTH * 2) / 100,
          CONTAINERHIEGHT / 2,
          8,
          80,
          3,
        );
        const player = new Player(2, user.id, client, otherpadd, roomId, 0);
        invitationRoom.players.push(player);
        client.join(roomId);

        // Notify both players that the game is starting
        const gamedata: GameData = {
          playerpad: player.paddle,
          otherpad: otherpadd,
          ball: invitationRoom.ball,
          playerScore: 0,
          otherScore: 0,
          rounds: invitationRoom.rounds,
          containerHeight: CONTAINERHIEGHT,
          containerWidth: CONTAINERWIDTH,
          id: player.number,
        };
        client.emit('JoinRoom', roomId);
        client.emit('InitGame', gamedata);
        this.server.to(roomId).emit('StartGame', roomId);
        startGame(invitationRoom, this.invitrooms, this.activeSockets, this.prisma, CONTAINERHIEGHT);
      }
    }
  }

  // Add a method to handle declining invitations if needed
  @SubscribeMessage('DeclineInvitation')
  async handleDeclineInvitation(client: Socket, roomId: string) {
    const room = this.invitrooms.get(roomId);
    const roomPlayer = room.players.find((player) => player.socket !== client);
    const playerdecline = room.players.find((player) => player.socket === client);
    const roomPlayerSocket = roomPlayer.socket;
    const roomPlayerUser = this.activeSockets.get(roomPlayerSocket);
    const playerdeclineUser = this.activeSockets.get(client);
    const pendingInvitation = await this.prisma.invitation.findFirst({
      where: {
        receiverId: playerdeclineUser.id,
        senderId: roomPlayerUser.id,
        isGame: true,
        status: 'pending'
      }
    });
    if (!pendingInvitation) {
      roomPlayerSocket.leave(roomId);
      this.invitrooms.delete(roomId);
      return;
    }
    await this.prisma.invitation.update({
      where: {
        id: pendingInvitation.id
      },
      data: {
        status: 'rejected'
      }
    })
    this.prisma.user.update({
      where: {
        id: roomPlayerUser.id,
      },
      data: {
        status: 'online',
      },
    });
    roomPlayerUser.status = 'online';
    roomPlayerSocket.emit('InvitationDeclined');
    roomPlayerSocket.leave(roomId);
    this.invitrooms.delete(roomId);
  }

  @SubscribeMessage('StartGameRobot')
  handleStartGameRobot(client: Socket) {
    try {
      StartGameEventRobot(
        client,
        this.rooms,
        this.activeSockets,
        this.prisma,
        this.server,
        CONTAINERHIEGHT,
        CONTAINERWIDTH,
      );
    } catch (e) {
      console.log('error', e);
    }
  }

  @SubscribeMessage('UpdatePlayerPaddle')
  handleUpdatePaddle(client: Socket, eventData: any) {
    try {
      UpdatePaddle(client, eventData, this.rooms, CONTAINERHIEGHT);
    } catch (e) {
      console.log('error', e);
    }
  }
}
