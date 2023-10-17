import { Injectable } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameData, OTHERPADDLE, PADDLE, Player, Room } from './types';

import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { verifyToken } from './Game-Init';
import { GameStartEvent} from './game-start-event';
import { User } from '@prisma/client';
import { UpdatePaddle, dataupdatetostop, findRoomByPlayerSocket } from './Game-Update';

@WebSocketGateway({ namespace: 'game' })
@Injectable()
export class Game implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private activeSockets: Map<Socket, User> = new Map();

  private rooms: Map<string, Room> = new Map();
  constructor(
    private prisma: PrismaService,
    private conf: ConfigService,
    private jwt: JwtService,
    private serviceStart: GameStartEvent,
  ) {
    this.AddRobotToSOckets();
  }

  async AddRobotToSOckets() {
    const robotUser = await this.prisma.user.findFirst({
      where: {
        id: 1,
      },
    });
    console.log('robotUser', robotUser);
    this.activeSockets.set(null, robotUser);
  }


  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      //   console.log('token', token);
      const user = await verifyToken(token, this.prisma, this.conf, this.jwt);
      if (user) {
        if (user.status === 'InGame') {
          console.log('\x1b[33m user connection allready in game ', user, '\x1b[0m');
            client.disconnect();
          return;
        }
        console.log('\x1b[33m user is found \x1b[0m');
        this.activeSockets.set(client, user);
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
      }
      this.serviceStart.StartGameEvent(
        client,
        this.rooms,
        this.activeSockets,
        this.server,
      );
    } catch (e) {
      console.log('error', e);
      return;
    }
  }

  @SubscribeMessage('StartGameRobot')
  async handleStartGameRobot(client: Socket) {
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
      }
      this.serviceStart.StartGameEventRobot(
        client,
        this.rooms,
        this.activeSockets,
        this.server,
      );
    } catch (e) {
      console.log('error', e);
      return;
    }
  }

  async handleDisconnect(client: Socket) {
    const room = findRoomByPlayerSocket(client, this.rooms);
    const user = this.activeSockets.get(client);
    if (user) {
      console.log('disconnecting client ', user.login);
      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          status: 'online',
        },
      });
    }
    if (room) {
      console.log('room found to make force leave ');
      if (room.players.length === 2) {
        const player = room.players.find((player) => player.socket === client);
        const otherPlayer = room.players.find(
          (player) => player.socket !== client,
          console.log('other player', player.socket),
        );
        player.score = 0;
        otherPlayer.score = 5;
        dataupdatetostop(room, this.activeSockets, this.prisma);
      }
      else {
        this.prisma.match.delete({
          where: {
            id: room.id
          }
        })
      }
        this.rooms.delete(room.roomName);
    }
    this.activeSockets.delete(client);
  }

  @SubscribeMessage('InvitePlayer')
  async handleInvitePlayer(client: Socket, targetUserId: number) {
    console.log('invite player backend', targetUserId);
    const sender = this.activeSockets.get(client);
    const receiver = Array.from(this.activeSockets.values()).find(
      (user) => user.id === targetUserId,
    );
    console.log('invite player sender', sender);
    console.log('invite player receiver', receiver);

    if (!receiver) {
      console.log('receiver not found');
      return;
    }

    const invitationRoom = new Room(`invite_${sender.id}_${receiver.id}`);
    invitationRoom.isinvit = true;
  
    const user = this.activeSockets.get(client);
    const player = new Player( 1, user.id , client, PADDLE, invitationRoom.roomName, 0);

    invitationRoom.players.push(player);
    client.join(invitationRoom.roomName);
    this.rooms.set(invitationRoom.roomName, invitationRoom);

    await this.prisma.invitation.create({
      data: {
        senderId: sender.id,
        receiverId: receiver.id,
        isGame: true,
      }
    })
    const invitationData = {
      senderId: sender.id,
      senderName: sender.username,
      roomId: invitationRoom.roomName,
    };

    const [key, value] = Array.from(this.activeSockets.entries()).find(
      ([key, value]) => value.id === targetUserId,
    );
    key.emit('ReceiveInvitation', invitationData);
    const gamedata: GameData = {
      playerpad: player.paddle,
      otherpad: OTHERPADDLE,
      ball: invitationRoom.ball,
      playerScore: 0,
      otherScore: 0,
      rounds: invitationRoom.rounds,
      id: player.number,
    };
    client.emit('JoinRoom', invitationRoom.roomName);
    client.emit('InitGame', gamedata);
    client.emit('GAME STARTED', true);
  }

  @SubscribeMessage('AcceptInvitation')
  async handleAcceptInvitation(client: Socket, roomId: string) {
    const player = this.activeSockets.get(client);
      const invitationRoom = this.rooms.get(roomId);
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
        this.rooms.delete(roomId);
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
        console.log('invitation Game backend hereee');
        const player = new Player(2, user.id, client, PADDLE, roomId, 0);
        invitationRoom.players.push(player);
        client.join(roomId);

        // Notify both players that the game is starting
        const gamedata: GameData = {
          playerpad: PADDLE,
          otherpad: OTHERPADDLE,
          ball: invitationRoom.ball,
          playerScore: 0,
          otherScore: 0,
          rounds: invitationRoom.rounds,
          id: player.number,
        };
        client.emit('JoinRoom', roomId);
        client.emit('InitGame', gamedata);
        client.emit('GAME STARTED', true);
        this.server.to(roomId).emit('StartGame', roomId);
        this.serviceStart.startGame(false, invitationRoom, client, this.rooms, this.activeSockets);
      // }
    }
  }

  // Add a method to handle declining invitations if needed
  @SubscribeMessage('DeclineInvitation')
  async handleDeclineInvitation(client: Socket, roomId: string) {
    const room = this.rooms.get(roomId);
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
      this.rooms.delete(roomId);
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
    this.rooms.delete(roomId);
  }



  @SubscribeMessage('UpdatePlayerPaddle')
  handleUpdatePaddle(client: Socket, eventData: any) {
    try {
      UpdatePaddle(client, eventData, this.rooms);
    } catch (e) {
      console.log('error', e);
    }
  }
}
