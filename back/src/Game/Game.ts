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
import { GameInit } from './Game-Init';
import { GameStartEvent } from './game-start-event';
import { User } from '@prisma/client';
import { GameUpdate } from './Game-Update';
import { set } from 'nestjs-zod/z';

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
    }
    catch (e) {
      console.log('error', e);
    }
  }

  async handleConnection(client: Socket) {
    try {
      !this.robot ? this.AddRobotToSOckets() : null;
      const token = client.handshake.auth.token;
      const user = await this.serviceInit.verifyToken(token);
      if (user) {
        if (user.status === 'InGame') {
          client.disconnect();

          return;
        }
        this.activeSockets.set(client, user);
      } else {
        client.disconnect();
      }
    } catch (e) {
      console.log('error', e);
      client.disconnect();
  
      return;
    }
  }

  @SubscribeMessage('StartGame')
  async handleStartGame(client: Socket) {
    try {
      const user = this.activeSockets.get(client);
      if (!user) throw new Error('undefined user ');
      if (user.status === 'InGame') {
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
      if (!user) throw new Error('undefined user ');
      if (user.status === 'InGame') {
        // console.log('user is already in game handle start game');
        // console.log('user is already in game handle start game');
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
    const room = this.serviceInit.findRoomByPlayerSocket(client, this.rooms);
    const user = this.activeSockets.get(client);
    if (user) {
      // console.log('disconnecting client ', user.login);
      // console.log('disconnecting client ', user.login);
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
      // console.log('room found to make force leave ');
      // console.log('room found to make force leave ');
      if (room.players.length === 2) {
        const playerindex = room.players.indexOf(
          room.players.find((player) => player.socket === client),
        );
        room.players[playerindex].score = 0;
        room.players[playerindex === 0 ? 1 : 0].score = 5;
        this.serviceUpdate.dataupdatetostop(room, this.activeSockets);
      } else {
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

  @SubscribeMessage('InvitePlayer')
  async handleInvitePlayer(client: Socket, targetUserId: number) {
    try{

      const sender = this.activeSockets.get(client);
      const receiver = Array.from(this.activeSockets.values()).find(
        (user) => user.id === targetUserId,
        );
        if (!receiver) {
          console.log('receiver not found ========== ');
          
          return;
        }
        
        const invitationRoom = new Room(`invite_${sender.id}_${receiver.id}`);
        invitationRoom.isinvit = true;
        const player = new Player(
          1,
          sender.id,
          client,
          OTHERPADDLE,
          invitationRoom.roomName,
          0,
          );
          
          invitationRoom.players.push(player);
          client.join(invitationRoom.roomName);
          this.rooms.set(invitationRoom.roomName, invitationRoom);
          
          await this.prisma.invitation.create({
            data: {
              senderId: sender.id,
              receiverId: receiver.id,
              isGame: true,
            },
          });
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
      otherpad: PADDLE,
      ball: invitationRoom.ball,
      playerScore: 0,
      otherScore: 0,
      rounds: invitationRoom.rounds,
      id: player.number,
    };
    setTimeout(() => {
      if (client.emit('GAME INVITE', true)) console.log('game invite sent');
      client.emit('InitGame', gamedata);
      client.emit('JoinRoom', invitationRoom.roomName);
    }, 1000);
    // client.emit('GAME STARTED', true);
  }
  catch(e){
    console.log('error', e);
  }
}
  
  @SubscribeMessage('AcceptInvitation')
  async handleAcceptInvitation(client: Socket, roomId: string) {
    try{

      const invitationRoom = this.rooms.get(roomId);
      if (!invitationRoom) {
        //sett colored console log
        console.log('\x1b[36m invitation room not found');
        const pendingInvitation = await this.prisma.invitation.findFirst({
          where: {
            receiverId: this.activeSockets.get(client).id,
            isGame: true,
            status: 'pending',
          },
        });
        if (!pendingInvitation) {
          console.log('pending invitation not found');
          return;
        }
        await this.prisma.invitation.update({
          where: {
            id: pendingInvitation.id,
          },
          data: {
            status: 'rejected',
          },
        });
        setTimeout(() => {
        client.emit('InvitationDeclined');
        } , 1000);
        return;
      }
      const sender = invitationRoom.players.find(
        (player) => player.socket !== client,
        );
        const user = this.activeSockets.get(client);
        const otheruser = this.activeSockets.get(sender.socket);
        
        const pendingInvitation = await this.prisma.invitation.findFirst({
          where: {
            receiverId: user.id,
            senderId: otheruser.id,
        isGame: true,
        status: 'pending',
      },
    });
    if (!pendingInvitation) {
      sender.socket.leave(roomId);
      this.rooms.delete(roomId);
      
      return;
    }
    await this.prisma.invitation.update({
      where: {
        id: pendingInvitation.id,
      },
      data: {
        status: 'accepted',
      },
    });
    if (invitationRoom) {
      const player = new Player(2, user.id, client, PADDLE, roomId, 0);
      invitationRoom.players.push(player);
      client.join(roomId);
      const gamedata: GameData = {
        playerpad: player.paddle,
        otherpad: OTHERPADDLE,
        ball: invitationRoom.ball,
        playerScore: 0,
        otherScore: 0,
        rounds: invitationRoom.rounds,
        id: player.number,
      };
      setTimeout(() => {
        client.emit('GAME INVITE', true);
        client.emit('InitGame', gamedata);
        client.emit('JoinRoom', roomId);
      }, 1000);
      // client.emit('GAME STARTED', true);
      // this.server.to(roomId).emit('StartGame', roomId);
      setTimeout(() => {
        invitationRoom.players.forEach((player) => {
          player.socket?.emit('GAME STARTED', true);
          this.serviceStart.startGame(
            false,
            invitationRoom,
            client,
            this.rooms,
            this.activeSockets,
            );
          });
        }, 1000);
      }
    }
    catch(e){
      console.log('error', e);
    }
    }
    
    // Add a method to handle declining invitations if needed
    @SubscribeMessage('DeclineInvitation')
    async handleDeclineInvitation(client: Socket, roomId: string) {
      try{
    const room = this.rooms.get(roomId);
    const sender_player = room.players.find((player) => player.socket !== client);
    const receiver = room.players.find(
      (player) => player.socket === client,
    );
    const sender_user = this.activeSockets.get(sender_player.socket);
    const receiver_user = this.activeSockets.get(client);
    const pendingInvitation = await this.prisma.invitation.findFirst({
      where: {
        receiverId: receiver_user.id,
        senderId: sender_user.id,
        isGame: true,
        status: 'pending',
      },
    });
    if (!pendingInvitation) {
      sender_player.socket?.leave(roomId);
      this.rooms.delete(roomId);

      return;
    }
    await this.prisma.invitation.update({
      where: {
        id: pendingInvitation.id,
      },
      data: {
        status: 'rejected',
      },
    });
    this.prisma.user.update({
      where: {
        id: sender_user.id,
      },
      data: {
        status: 'online',
      },
    });
    sender_player.socket?.emit('InvitationDeclined');
    sender_player.socket?.leave(roomId);
    this.rooms.delete(roomId);
  }
  catch(e){
    console.log('error', e);
  }
  }

  @SubscribeMessage('UpdatePlayerPaddle')
  handleUpdatePaddle(client: Socket, eventData: any) {
    try {
      this.serviceUpdate.UpdatePaddle(client, eventData, this.rooms);
    } catch (e) {
      console.log('error', e);
    }
  }
}
