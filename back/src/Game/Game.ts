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
import { startGame, stopGame } from './Game_services';
import { verifyToken } from './Player-Init';
import { OtherAvatar, StartGameEvent, UpdatePaddle, findRoomByPlayerSocket } from './game-events';

@WebSocketGateway()
@Injectable()
export class Game implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private activeSockets: Map<string, Socket> = new Map();

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
      const user = await verifyToken(token, this.prisma, this.conf, this.jwt);
      //   console.log('user', user);
      if (user) {
        this.activeSockets.set(client.id, client);
        console.log('connection established');
        // this.game(client);
      } else {
        console.log('connection refused');
        client.disconnect();
      }
    } catch (e) {
      console.log('error', e);
    }
  }

  handleDisconnect(client: Socket) {
    const room = findRoomByPlayerSocket(client, this.rooms);

    if (room) {
      room.players = room.players.filter(
        (player) => player.socket_id !== client.id,
      );
	  // 
      if (room.players.length < 2) {
        stopGame(room, this.rooms);
        room.gameActive = false;
        this.activeSockets.delete(client.id);
        this.rooms.delete(room.roomName); // Remove the room if it's empty
      }
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

  @SubscribeMessage('UpdatePlayerPaddle')
  handleUpdatePaddle(client: Socket, eventData: any) {
    try {
      UpdatePaddle(
        client,
        eventData,
        this.rooms,
		this.containerHeight
      );
    } catch (e) {
      console.log('error', e);
    }
  }
}
