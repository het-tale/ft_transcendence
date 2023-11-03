import { Injectable } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Room } from './types';
import { PrismaService } from 'src/prisma/prisma.service';
import { GameInit } from './Game-Init';
import { GameStartEvent } from './game-start-event';
import { User } from '@prisma/client';
import { GameUpdate } from './Game-Update';
import { Invitations } from './invitations';

@WebSocketGateway({ namespace: 'game' })
@Injectable()
export class Game implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private activeSockets: Map<Socket, User> = new Map();

  private rooms: Map<string, Room> = new Map();
  private robot: boolean;
  constructor(
    private prisma: PrismaService,
    private serviceStart: GameStartEvent,
    private serviceInit: GameInit,
    private serviceUpdate: GameUpdate,
    private serviceInvitations: Invitations,
  ) {
    this.robot = false;
  }

  async AddRobotToSOckets() {
    try {
      const robotUser = await this.prisma.user.findFirst({
        where: {
          id: 1,
        },
      });
      this.activeSockets.set(null, robotUser);
      this.robot = true;
    } catch (e) {
      return;
    }
  }

  async handleConnection(client: Socket) {
    try {
      !this.robot ? this.AddRobotToSOckets() : null;
      const token = client.handshake.auth.token;
      const user = await this.serviceInit.verifyToken(token);
      if (!user) throw new Error('undefined user ');
      // if (user.status === 'InGame') {
      //   setTimeout(() => {
      //   console.log('InvitationDeclined game 59' );
      //     client.emit('InvitationDeclined', 'You are in other game');
      //   }, 2000);

      //   return;
      // }

      this.activeSockets.set(client, user);
    } catch (e) {
      client.disconnect();

      return;
    }
  }

  @SubscribeMessage('StartGame')
  async handleStartGame(client: Socket) {
    try {
      this.serviceStart.StartGameEvent(
        client,
        this.rooms,
        this.activeSockets,
        this.server,
      );
    } catch (e) {
      return;
    }
  }

  @SubscribeMessage('StartGameRobot')
  async handleStartGameRobot(client: Socket) {
    try {
      this.serviceStart.StartGameEventRobot(
        client,
        this.rooms,
        this.activeSockets,
        this.server,
      );
    } catch (e) {
      return;
    }
  }

  @SubscribeMessage('InvitePlayer')
  async handleInvitePlayer(client: Socket, targetUserId: number) {
    try {
      this.serviceInvitations.sendInvitation(
        client,
        this.rooms,
        targetUserId,
        this.activeSockets,
        this.server,
      );
    } catch (e) {
      return;
    }
  }

  @SubscribeMessage('AcceptInvitation')
  async handleAcceptInvitation(client: Socket, roomId: string) {
    try {
      this.serviceInvitations.acceptInvitation(
        client,
        this.rooms,
        roomId,
        this.activeSockets,
        this.server,
      );
    } catch (e) {
      return;
    }
  }

  @SubscribeMessage('DeclineInvitation')
  async handleDeclineInvitation(client: Socket, roomId: string) {
    try {
      this.serviceInvitations.declineInvitation(
        client,
        this.rooms,
        roomId,
        this.activeSockets
      );
    } catch (e) {
      return;
    }
  }

  @SubscribeMessage('UpdatePlayerPaddle')
  handleUpdatePaddle(client: Socket, eventData: any) {
    try {
      this.serviceUpdate.UpdatePaddle(client, eventData, this.rooms);
    } catch (e) {
      return;
    }
  }

  async handleDisconnect(client: Socket, ...args: boolean[]) {
    const room = this.serviceInit.findRoomByPlayerSocket(client, this.rooms);
    const user = this.activeSockets.get(client);
    if (user && user.status === 'InGame') {
      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          status: 'online',
        },
      });
      client.broadcast.emit("OutGame");
    }
    if (room) {
      if (room.players.length === 2) {
        const playerindex = room.players.indexOf(
          room.players.find((player) => player.socket === client),
        );
        room.players[playerindex].score = 0;
        room.players[playerindex === 0 ? 1 : 0].score = 5;
        this.serviceUpdate.dataupdatetostop(room, this.activeSockets);
      } else {
        if (room.players.length === 1) client.leave(room.roomName);
        this.prisma.match.delete({
          where: {
            id: room.id,
          },
        });
      }
      this.rooms.delete(room.roomName);
    }
    this.activeSockets.delete(client);
  }
}
