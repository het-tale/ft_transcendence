import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';

@Injectable()
export class ChannelService {
  constructor(private prisma: PrismaService) {}
  async getOfflineInvitations(userId: number) {
    const invitations = await this.prisma.invitation.findMany({
      where: {
        receiverId: userId,
        isReceiverOnline: false,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return invitations;
  }
  async saveInvitation(data: {
    sender: string;
    receiver: string;
    room: string;
    isReceiverOnline: boolean;
  }) {
    const userSender = await this.prisma.user.findUnique({
      where: {
        username: data.sender,
      },
    });
    const userReceiver = await this.prisma.user.findUnique({
      where: {
        username: data.receiver,
      },
    });
    const room = await this.prisma.channel.findUnique({
      where: {
        name: data.room,
        admins: {
          some: {
            id: userSender.id,
          },
        },
      },
      include: {
        participants: true,
      },
    });

    if (!room) {
      throw new Error('room not found or user is not an admin');
    }

    const isReceiverInRoom = room.participants.some(
      (participant) => participant.id === userReceiver.id,
    );

    if (isReceiverInRoom) {
      throw new Error('user is already in the room');
    }
    const existingInvitation = await this.prisma.invitation.findFirst({
      where: {
        senderId: userSender.id,
        receiverId: userReceiver.id,
        room: data.room,
        status: 'pending', // Check for pending invitations
      },
    });

    if (existingInvitation) {
      throw new Error('A pending invitation already exists for this room.');
    }

    return await this.prisma.invitation.create({
      data: {
        senderId: userSender.id,
        receiverId: userReceiver.id,
        room: data.room,
        isReceiverOnline: data.isReceiverOnline,
      },
    });
  }
  async createChannel(
    channelName: string,
    username: string,
    type: string,
    password: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });
    if (!user) {
      throw new Error('user not found');
    }
    let hash = null;
    if (type == 'protected') hash = await argon.hash(password);
    await this.prisma.channel.create({
      data: {
        name: channelName,
        ownerId: user.id,
        type,
        hash,
        participants: {
          connect: {
            id: user.id,
          },
        },
        admins: {
          connect: {
            id: user.id,
          },
        },
      },
    });
  }
}
