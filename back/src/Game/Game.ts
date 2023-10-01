import { HttpException, Injectable } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameData, Room, Paddle, Player } from './types';

import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { is_playing, startGame, stopGame } from './Game_services';
import { verifyToken } from './Player-Init';
import {
  OtherAvatar,
  StartGameEvent,
  StartGameEventRobot,
  UpdatePaddle,
  findRoomByPlayerSocket,
} from './game-events';
import { subscribe } from 'diagnostics_channel';
import { User } from '@prisma/client';

@WebSocketGateway()
@Injectable()
export class Game implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private activeSockets: Map<Socket, User> = new Map();
  //   private activeusers: Map<User, Socket> = new Map();

  private rooms: Map<string, Room> = new Map();
  constructor(
    private prisma: PrismaService,
    private conf: ConfigService,
    private jwt: JwtService,
  ) {}

  //   onModuleInit() {}
  private containerWidth = 1080;
  private containerHeight = 720;

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.query.token;
      //   console.log('token', token);
      const user = await verifyToken(token, this.prisma, this.conf, this.jwt);
      if (user) {
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

  handleDisconnect(client: Socket) {
    const room = findRoomByPlayerSocket(client, this.rooms);
    console.log('disconnecting client ');
    this.activeSockets.delete(client);
    if (room) {
      room.players = room.players.filter((player) => player.socket !== client);
      //
      if (room.players.length < 2) {
        stopGame(room, this.rooms);
        room.gameActive = false;
        this.activeSockets.delete(client);
        this.rooms.delete(room.roomName); // Remove the room if it's empty
      }
    }
  }

  @SubscribeMessage('StartGame')
  handleStartGame(client: Socket) {
    try {
      StartGameEvent(
        client,
        this.containerHeight,
        this.containerWidth,
        this.rooms,
        this.activeSockets,
        this.prisma,
        this.server,
      );
    } catch (e) {
      console.log('error', e);
    }
  }

  @SubscribeMessage('OTHER AVATAR')
  handleOtherAvatar(client: Socket, data: any) {
    try {
      OtherAvatar(client, data, this.rooms, this.activeSockets);
    } catch (e) {
      console.log('error', e);
    }
  }

  //   @SubscribeMessage('StartGameRobot')
  //   handleStartGameRobot(client: Socket) {
  //     try {
  //       StartGameEventRobot(
  //         client,
  //         this.rooms,
  //         this.activeSockets,
  //         this.prisma,
  //         this.server,
  // 		this.containerHeight,
  // 		this.containerWidth,
  //       );
  //     } catch (e) {
  //       console.log('error', e);
  //     }
  //   }

  @SubscribeMessage('UpdatePlayerPaddle')
  handleUpdatePaddle(client: Socket, eventData: any) {
    try {
      UpdatePaddle(client, eventData, this.rooms, this.containerHeight);
    } catch (e) {
      console.log('error', e);
    }
  }
}
