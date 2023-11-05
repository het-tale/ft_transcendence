import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Socket } from 'socket.io';
import { User } from '@prisma/client';
import { GameData, OTHERPADDLE, PADDLE, Paddle, Player, Room } from './types';
import { GameStartEvent } from './game-start-event';
import { Server } from 'socket.io';

@Injectable()
export class Invitations {
  constructor(
    private prisma: PrismaService,
    private serviceStart: GameStartEvent,
  ) {}
  async sendInvitation(
    client: Socket,
    rooms: Map<string, Room>,
    targetUserId: number,
    activeSockets: Map<Socket, User>,
    server: Server,
  ) {
    try {

    const sender_player = activeSockets.get(client);
    if (!sender_player) throw new Error('undefined user ');
    const sender = await this.prisma.user.findUnique({
      where: {
        id: sender_player.id,
      },
    });
    const receiver = await this.prisma.user.findUnique({
      where: {
        id: targetUserId,
      },
    });

    if (
      !receiver ||
      !receiver ||
      sender === receiver 
    ) {
      setTimeout(() => {
        client.emit('GameDeclined', 'user not found !!');
      }, 2000);

      return;
    }
    if (sender.status === 'InGame'){
      setTimeout(() => {
        client.emit('InvitationDeclined', 'you are already in an other game !!');
      }, 2000);

      return;
    }
    if (receiver.username === 'ROBOT') {
      setTimeout(() => {
        this.serviceStart.StartGameEventRobot(client, rooms, activeSockets, server);
        client.emit('GAME STARTED', true);
      }, 2000);

      return;
    }
    const updatedUser = { ...sender, status: 'InGame' };
    activeSockets.set(client, updatedUser);
    await this.prisma.user.update({
      where: {
        id: sender.id,
      },
      data: {
        status: 'InGame',
      },
    });

    const name = Math.random().toString(36).substring(7)
    const invitationRoom = new Room(`${name}_${sender.id}_${receiver.id}`);
    invitationRoom.isinvit = true;
    const padd = new Paddle(PADDLE.x, PADDLE.y, PADDLE.width, PADDLE.height, PADDLE.dy);
    const otherpad = new Paddle(OTHERPADDLE.x, OTHERPADDLE.y, OTHERPADDLE.width, OTHERPADDLE.height, OTHERPADDLE.dy);
    const player = new Player(
      1,
      sender.id,
      client,
      otherpad,
      invitationRoom.roomName,
      0,
    );

    invitationRoom.players.push(player);
    client.join(invitationRoom.roomName);
    rooms.set(invitationRoom.roomName, invitationRoom);

    await this.prisma.invitation.create({
      data: {
        senderId: sender.id,
        receiverId: receiver.id,
        isGame: true,
        roomName: invitationRoom.roomName,
      },
    });
    const invitationData = {
      senderId: sender.id,
      senderName: sender.username,
      roomId: invitationRoom.roomName,
    };

    const [key, value] = Array.from(activeSockets.entries()).find(
      ([_, value]) => value.id === targetUserId
    ) || [null, null];
    key?.emit('ReceiveInvitation', invitationData);
    const gamedata: GameData = {
      playerpad: player.paddle,
      otherpad: padd,
      ball: invitationRoom.ball,
      playerScore: 0,
      otherScore: 0,
      rounds: invitationRoom.rounds,
      id: player.number,
    };
    setTimeout(() => {
      if (!key) client.emit('TargetUserOffline');
      client.emit('GAME INVITE', true);
      client.emit('InitGame', gamedata);
      client.emit('JoinRoom', invitationRoom.roomName);
    }, 1000);

  } catch (e) {
    }
  }

  async acceptInvitation(
    client: Socket,
    rooms: Map<string, Room>,
    roomName: string,
    activeSockets: Map<Socket, User>,
    server: Server
  ) {
    try {
    const receiver_user = activeSockets.get(client);
    const pendingInvitation = await this.prisma.invitation.findFirst({
        where: {
          receiverId: receiver_user?.id,
          isGame: true,
          status: 'pending',
        },
    });

    if (!pendingInvitation) {
        setTimeout(() => {
          client.emit('InvitationDeclined', "no pending invitation found !!");
        }, 2000);

        return;
      }

    const invitationRoom = rooms.get(roomName);
    if (!invitationRoom || invitationRoom.players.length === 0) {
      setTimeout(() => {
        client.emit('InvitationDeclined', "no room found the sender left the room !!");
      }, 2000);

      await this.prisma.invitation.update({
          where: {
            id: pendingInvitation.id,
          },
          data: {
            status: 'rejected',
          },
        });
      return;
    }
  
    const sender_player = invitationRoom.players.find(
      (player) => player.socket !== client,
    );
    if (!sender_player || !receiver_user) {
      setTimeout(() => {
        client.emit('InvitationDeclined');
        sender_player.socket?.emit('InvitationDeclined', "no room found the reciever left the room !!");
      }, 2000);

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
    const updatedUser = { ...receiver_user, status: 'InGame' };
    activeSockets.set(client, updatedUser);
    await this.prisma.user.update({
      where: {
        id: receiver_user.id,
      },
      data: {
        status: 'InGame',
      },
    });
    const padd = new Paddle(PADDLE.x, PADDLE.y, PADDLE.width, PADDLE.height, PADDLE.dy);
    const otherpad = new Paddle(OTHERPADDLE.x, OTHERPADDLE.y, OTHERPADDLE.width, OTHERPADDLE.height, OTHERPADDLE.dy);
    const player = new Player(2, receiver_user.id, client, padd, roomName, 0);
    invitationRoom.players.push(player);
    client.join(roomName);
    const gamedata: GameData = {
      playerpad: player.paddle,
      otherpad: otherpad,
      ball: invitationRoom.ball,
      playerScore: 0,
      otherScore: 0,
      rounds: invitationRoom.rounds,
      id: player.number,
    };
    setTimeout(() => {
      client.emit('GAME INVITE', true);
      client.emit('InitGame', gamedata);
      client.emit('JoinRoom', roomName);
    }, 2000);

    setTimeout(() => {
      invitationRoom.players.forEach((player) => {
        player.socket?.emit('GAME STARTED', true);
        this.serviceStart.startGame(
          false,
          invitationRoom,
          client,
          rooms,
          activeSockets,
          server,
        );
      });
    }, 2000);
  } catch (e) {
    }
  }

  async declineInvitation(
    client: Socket,
    rooms: Map<string, Room>,
    roomName: string,
    activeSockets: Map<Socket, User>
  ) {
    try {
      const receiver_user = activeSockets.get(client);
    const room = rooms.get(roomName);
    if (room) {
    const sender_player = room.players.find(
      (player) => player.socket !== client,
    );
    const sender_user = activeSockets.get(sender_player.socket);
    const pendingInvitation = await this.prisma.invitation.findFirst({
      where: {
        receiverId: receiver_user?.id,
        senderId: sender_user?.id,
        isGame: true,
        status: 'pending',
      },
    });
    if (!pendingInvitation) {
      sender_player?.socket?.leave(roomName);
      rooms.delete(roomName);

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
    sender_player?.socket?.emit('InvitationDeclined', "the reciever declined the invitation !!");
    sender_player?.socket?.leave(roomName);
  }
    rooms.delete(roomName);
  }
  catch (e) {
    }
  }
}
