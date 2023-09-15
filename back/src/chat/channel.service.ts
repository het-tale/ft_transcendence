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
  async joinChannel(
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
    const channel = await this.prisma.channel.findUnique({
      where: {
        name: channelName,
      },
    });
    if (!channel) {
      throw new Error('channel not found');
    }
    if (channel.type === 'protected') {
      const isPasswordValid = await argon.verify(channel.hash, password);
      if (!isPasswordValid) {
        throw new Error('invalid password');
      }
    }
    await this.prisma.channel.update({
      where: {
        name: channelName,
      },
      data: {
        participants: {
          connect: {
            id: user.id,
          },
        },
      },
    });
  }

  async handleChannelInvitation(data: {
    sender: string;
    receiver: string;
    room: string;
    isAccepted: boolean;
  }) {
    const userReceiver = await this.prisma.user.findUnique({
      where: {
        username: data.receiver,
      },
    });
    const userSender = await this.prisma.user.findUnique({
      where: {
        username: data.sender,
      },
    });
    if (!userReceiver || !userSender) {
      throw new Error('user not found');
    }
    const status: string = data.isAccepted ? 'accepted' : 'rejected';
    const invitation = await this.prisma.invitation.findFirst({
      where: {
        senderId: userSender.id,
        receiverId: userReceiver.id,
        room: data.room,
      },
    });
    if (!invitation) {
      throw new Error('Invitation not found');
    }
    await this.prisma.invitation.update({
      where: {
        id: invitation.id,
      },
      data: {
        status,
      },
    });
    //add user to room if accepted
    if (data.isAccepted) {
      const channelupdated = await this.prisma.channel.update({
        where: {
          name: data.room,
        },
        data: {
          participants: {
            connect: {
              id: userReceiver.id,
            },
          },
        },
      });
      if (!channelupdated) {
        throw new Error('room not found');
      }
    }
  }
  async saveMessagetoChannel(data: {
    sender: string;
    room: string;
    message: string;
    date: Date;
  }) {
    const user = await this.prisma.user.findUnique({
      where: {
        username: data.sender,
      },
    });
    const channel = await this.prisma.channel.findUnique({
      where: {
        name: data.room,
      },
    });
    if (!user || !channel) {
      throw new Error('user or channel not found');
    }
    await this.prisma.message.create({
      data: {
        content: data.message,
        senderId: user.id,
        channelId: channel.id,
        sentAt: data.date,
        isDM: false,
      },
    });
  }
}
