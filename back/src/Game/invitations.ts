import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Socket } from 'socket.io';
import { User } from '@prisma/client';
import { GameData, OTHERPADDLE, PADDLE, Player, Room } from './types';
import { GameStartEvent } from './game-start-event';
import { Server } from 'socket.io';
import { set } from 'nestjs-zod/z';

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
    if (receiver.username === 'ROBOT') {
      setTimeout(() => {
        this.serviceStart.StartGameEventRobot(client, rooms, activeSockets, server);
        client.emit('GAME STARTED', true);
      }, 2000);

      return;
    }

    const name = Math.random().toString(36).substring(7)
    const invitationRoom = new Room(`${name}_${sender.id}_${receiver.id}`);
    invitationRoom.isinvit = true;


    console.log('\x1b[32m%s\x1b[0m', 'sending invit ' + invitationRoom.roomName);


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
      otherpad: PADDLE,
      ball: invitationRoom.ball,
      playerScore: 0,
      otherScore: 0,
      rounds: invitationRoom.rounds,
      id: player.number,
    };
    setTimeout(() => {
      if (!key) client.emit('TargetUserOffline'); // to be handled in frontend (show notification to sender)
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
    roomName: string,
    activeSockets: Map<Socket, User>,
    server: Server
  ) {

    console.log('\x1b[32m%s\x1b[0m', 'acceptInvitation' + roomName);

    const invitationRoom = rooms.get(roomName);
    if (!invitationRoom) {
      console.log('no room fond ');
      const pendingInvitation = await this.prisma.invitation.findFirst({
        where: {
          receiverId: activeSockets.get(client).id,
          isGame: true,
          status: 'pending',
        },
      });
      if (!pendingInvitation) {
        console.log('no pending invitation');
        setTimeout(() => {
          client.emit('InvitationDeclined', "no pending invitation found !!");
        }, 2000);

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
        client.emit('InvitationDeclined', "no room found the sender left the room !!");
      }, 2000);

      return;
    }
    const sender_player = invitationRoom.players.find(
      (player) => player.socket !== client,
    );
    const receiver_player = activeSockets.get(client);
    if (!sender_player || !receiver_player) {
      setTimeout(() => {
        client.emit('InvitationDeclined');
        sender_player.socket?.emit('InvitationDeclined', "no room found the reciever left the room !!");
      }, 2000);

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
      sender_player.socket.leave(roomName);
      rooms.delete(roomName);
      setTimeout(() => {
        client.emit('InvitationDeclined', "no pending invitation found !!");
        sender_player.socket?.emit('InvitationDeclined', "no pending invitation found !!");
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
    const player = new Player(2, receiver_player.id, client, PADDLE, roomName, 0);
    invitationRoom.players.push(player);
    client.join(roomName);
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
      client.emit('JoinRoom', roomName);
    }, 2000);
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
          server,
        );
      });
    }, 2000);
  }

  async declineInvitation(
    client: Socket,
    rooms: Map<string, Room>,
    roomName: string,
    activeSockets: Map<Socket, User>,
    server: Server
  ) {
    const room = rooms.get(roomName);
    if (room) {
    const sender_player = room.players.find(
      (player) => player.socket !== client,
    );
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
      sender_player.socket?.leave(roomName);
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
    sender_player.socket?.emit('InvitationDeclined', "the reciever declined the invitation !!");
    sender_player.socket?.leave(roomName);
  }
    rooms.delete(roomName);
  }
}
