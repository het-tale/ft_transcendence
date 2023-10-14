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
import { cancelgamesart } from './start-game';

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
          //   client.disconnect();
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
      console.log('get an error while connection');
      console.log('error', e);
    }
  }

  @SubscribeMessage('StartGame')
  async handleStartGame(client: Socket) {
    try {
      const user = this.activeSockets.get(client);
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
      // this.activeSockets.delete(client);
    }
    if (room) {
      room.players = room.players.filter((player) => player.socket !== client);
      //
      if (room.players.length < 2) {
        cancelgamesart(room, this.rooms);
        room.gameActive = false;
        this.rooms.delete(room.roomName);
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

    const playerNumber = 1;
    const player = new Player(
      playerNumber,
      client,
      padd,
      invitationRoom.roomName,
      0,
    );

    invitationRoom.players.push(player);
    invitationRoom.rounds = 1;

    // Add the invitation room to the list
    this.invitrooms.set(invitationRoom.roomName, invitationRoom);

    // Update player statuses
    sender.status = 'Invited'; // i should change change this to another variable in  database
    receiver.status = 'Invited'; // the same here

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
      id: 1,
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
        const playerNumber = 2;
        const player = new Player(playerNumber, client, otherpadd, roomId, 0);
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
          id: 2,
        };
        client.emit('JoinRoom', roomId);
        client.emit('InitGame', gamedata);
        this.server.to(roomId).emit('StartGame', roomId);

        // Remove the invitation room from the list
        // this.invitrooms.delete(roomId); // room ned to be deleeted afert the game end
      }
    }
  }

  // Add a method to handle declining invitations if needed
  @SubscribeMessage('DeclineInvitation')
  async handleDeclineInvitation(client: Socket, roomId: string) {
    // Handle declining invitations (i don't know what to do here) :)
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
