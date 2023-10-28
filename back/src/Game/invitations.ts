import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Socket } from 'socket.io';
import { User } from '@prisma/client';
import { GameData, OTHERPADDLE, PADDLE, Player, Room } from './types';
import { GameStartEvent } from './game-start-event';

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
  ) {
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
      sender === receiver ||
      sender.status === 'InGame'
    ) {
      setTimeout(() => {
        client.emit('InvitationDeclined');
      }, 2000);

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
    rooms.set(invitationRoom.roomName, invitationRoom);

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

    const [key, value] = Array.from(activeSockets.entries()).find(
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
      client.emit('GAME INVITE', true);
      client.emit('InitGame', gamedata);
      client.emit('JoinRoom', invitationRoom.roomName);
    }, 1000);

    await this.prisma.user.update({
      where: {
        id: sender.id,
      },
      data: {
        status: 'InGame',
      },
    });
  }

  async acceptInvitation(
    client: Socket,
    rooms: Map<string, Room>,
    roomId: string,
    activeSockets: Map<Socket, User>,
  ) {
    const invitationRoom = rooms.get(roomId);
    if (!invitationRoom) {
      const pendingInvitation = await this.prisma.invitation.findFirst({
        where: {
          receiverId: activeSockets.get(client).id,
          isGame: true,
          status: 'pending',
        },
      });
      if (!pendingInvitation) {
        setTimeout(() => {
          client.emit('InvitationDeclined');
        }, 1000);

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
      }, 1000);

      return;
    }
    const sender_player = invitationRoom.players.find(
      (player) => player.socket !== client,
    );
    const receiver_player = activeSockets.get(client);
    if (!sender_player || !receiver_player) {
      setTimeout(() => {
        client.emit('InvitationDeclined');
        sender_player.socket?.emit('InvitationDeclined');
      }, 1000);

      return;
    }
    const otheruser = activeSockets.get(sender_player.socket);

    const pendingInvitation = await this.prisma.invitation.findFirst({
      where: {
        receiverId: receiver_player.id,
        senderId: otheruser.id,
        isGame: true,
        status: 'pending',
      },
    });
    if (!pendingInvitation) {
      sender_player.socket.leave(roomId);
      rooms.delete(roomId);
      setTimeout(() => {
        client.emit('InvitationDeclined');
        sender_player.socket?.emit('InvitationDeclined');
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
    const player = new Player(2, receiver_player.id, client, PADDLE, roomId, 0);
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
    await this.prisma.user.update({
      where: {
        id: receiver_player.id,
      },
      data: {
        status: 'InGame',
      },
    });
    setTimeout(() => {
      invitationRoom.players.forEach((player) => {
        player.socket?.emit('GAME STARTED', true);
        this.serviceStart.startGame(
          false,
          invitationRoom,
          client,
          rooms,
          activeSockets,
        );
      });
    }, 1000);
  }

  async declineInvitation(
    client: Socket,
    rooms: Map<string, Room>,
    roomId: string,
    activeSockets: Map<Socket, User>,
  ) {
    const room = rooms.get(roomId);
    const sender_player = room.players.find(
      (player) => player.socket !== client,
    );
    const receiver = room.players.find((player) => player.socket === client);
    const sender_user = activeSockets.get(sender_player.socket);
    const receiver_user = activeSockets.get(client);
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
      rooms.delete(roomId);

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
    rooms.delete(roomId);
  }
}
