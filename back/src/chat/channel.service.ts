import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { Invitation, Message, User } from '@prisma/client';
import { Server } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Tadmin, Troom } from 'src/dto';

@Injectable()
export class ChannelService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private cloud: CloudinaryService,
  ) {}
  async getChannelMessages(channelName: string, user: User) {
    const actualUser = await this.prisma.user.findUnique({
      where: {
        id: user.id,
      },
      include: {
        blocked: true,
        blockedBy: true,
      },
    });
    const channel = await this.prisma.channel.findUnique({
      where: {
        name: channelName,
      },
      include: {
        messages: true,
        banned: true,
        participants: true,
      },
    });
    if (!channel)
      throw new HttpException('channel not found', HttpStatus.NOT_FOUND);
    const isParticipant = channel.participants.some(
      (participant) => participant.id === actualUser.id,
    );
    const isBanned = channel.banned.some(
      (bannedUser) => bannedUser.id === actualUser.id,
    );
    if (isBanned || !isParticipant) {
      throw new HttpException(
        'user is not a participant',
        HttpStatus.NOT_FOUND,
      );
    }
    //filter messages that sender is either blocked or blocked by the user
    const messages = channel.messages.filter(
      (message) =>
        !actualUser.blocked.some(
          (blockedUser) => blockedUser.id === message.senderId,
        ) &&
        !actualUser.blockedBy.some(
          (blockedUser) => blockedUser.id === message.senderId,
        ),
    );

    return messages;
  }
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

  async changeOfflineInvitationsStatus(invitations: Invitation[]) {
    const updatedConversations = await Promise.all(
      invitations.map(async (invitation) => {
        const updatedConversation = await this.prisma.message.update({
          where: {
            id: invitation.id,
          },
          data: {
            isPending: false,
          },
        });

        return updatedConversation;
      }),
    );

    return updatedConversations;
  }
  async getOfflineChannelMessages(userId: number) {
    const messages = await this.prisma.message.findMany({
      where: {
        receiverId: userId,
        isDM: false,
        isPending: true,
      },
      orderBy: {
        sentAt: 'asc',
      },
    });

    return messages;
  }
  async deleteOfflineChannelMessages(messages: Message[]) {
    const deletedMessages = await Promise.all(
      messages.map(async (message) => {
        const deletedMessage = await this.prisma.message.delete({
          where: {
            id: message.id,
          },
        });

        return deletedMessage;
      }),
    );

    return deletedMessages;
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
        channelId: room.id,
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
        channelId: room.id,
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
    const avatar = this.config.get('CHANNEL_AVATAR');
    let hash = null;
    if (type == 'protected') hash = await argon.hash(password);
    await this.prisma.channel.create({
      data: {
        avatar,
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
  async joinChannel(channelName: string, username: string, password: string) {
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
      include: {
        participants: true,
      },
    });
    if (!channel) {
      throw new Error('channel not found');
    }
    //check if user is already in the channel
    const isParticipant = channel.participants.some(
      (participant) => participant.id === user.id,
    );
    if (channel.type === 'private')
      throw new Error('cannot join private channel');
    if (channel.type === 'protected') {
      if (password === null) throw new Error('password is required');
      const isPasswordValid = await argon.verify(channel.hash, password);
      if (!isPasswordValid) {
        throw new Error('invalid password');
      }
    }
    if (isParticipant) {
      throw new Error('user is already in the channel');
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
    const channel = await this.prisma.channel.findUnique({
      where: {
        name: data.room,
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
        channelId: channel.id,
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
      include: {
        participants: true,
        muted: true,
        banned: true,
      },
    });
    if (!user || !channel) {
      throw new Error('user or channel not found');
    }
    const isParticipant = channel.participants.some(
      (participant) => participant.id === user.id,
    );
    if (!isParticipant) {
      throw new Error('user is not a participant');
    }
    const isMuted = channel.muted.some((mutedUser) => mutedUser.id === user.id);
    const isBanned = channel.banned.some(
      (bannedUser) => bannedUser.id === user.id,
    );
    if (isMuted || isBanned) {
      throw new Error('user is muted or banned');
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
    await this.prisma.channel.update({
      where: {
        id: channel.id,
      },
      data: {
        updatedAt: data.date,
      },
    });

    return channel.id;
  }
  async createOfflineChannelMessages(
    connected: { clientId: string; username: string }[],
    channelName: string,
    message: string,
    senderUsername: string,
    sentAt: Date,
  ) {
    const sender = await this.prisma.user.findUnique({
      where: {
        username: senderUsername,
      },
    });
    const channel = await this.prisma.channel.findUnique({
      where: {
        name: channelName,
      },
      include: {
        participants: true,
      },
    });

    if (!channel) {
      throw new Error('Channel not found');
    }

    const participants = channel.participants;

    await Promise.all(
      participants.map(async (participant: User) => {
        const partticipantWithBlocked = await this.prisma.user.findUnique({
          where: {
            id: participant.id,
          },
          include: {
            blocked: true,
            blockedBy: true,
          },
        });
        const isBlocked = partticipantWithBlocked.blocked.some(
          (blockedUser) => blockedUser.id === sender.id,
        );
        const isBlockedBy = partticipantWithBlocked.blockedBy.some(
          (blockedUser) => blockedUser.id === sender.id,
        );
        if (isBlocked || isBlockedBy) {
          return;
        }
        const user = connected.find(
          (user) => user.username === participant.username,
        );
        if (!user) {
          await this.prisma.message.create({
            data: {
              content: message,
              senderId: sender.id,
              channelId: channel.id,
              isPending: true,
              isDM: false,
              sentAt,
              receiverId: participant.id,
            },
          });
        }
      }),
    );
  }
  async leaveChannel(data, username: string) {
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
        name: data.room,
      },
      include: {
        participants: true,
      },
    });
    if (!channel) {
      throw new Error('channel not found');
    }
    const isUserInChannel = channel.participants.some(
      (participant) => participant.id === user.id,
    );
    if (!isUserInChannel) {
      throw new Error('user is not in the channel');
    }
    const isOwner = channel.ownerId === user.id;
    console.log(channel.participants.length);
    if (
      (data.newOwner === undefined || data.newOwner === null) &&
      channel.participants.length > 1
    ) {
      throw new Error('new owner is required');
    }
    if (isOwner && channel.participants.length > 1) {
      const newOwner = await this.prisma.user.findUnique({
        where: {
          username: data.newOwner,
        },
      });
      if (!newOwner) {
        throw new Error('new owner not found');
      }
      const ifNewOwnerIsParticipant = channel.participants.some(
        (participant) => participant.id === newOwner.id,
      );
      if (!ifNewOwnerIsParticipant) {
        throw new Error('new owner is not a participant');
      }
      await this.prisma.channel.update({
        where: {
          name: data.room,
        },
        data: {
          ownerId: newOwner.id,
          admins: {
            connect: {
              id: newOwner.id,
            },
          },
        },
      });
    }
    await this.prisma.channel.update({
      where: {
        name: data.room,
      },
      data: {
        participants: {
          disconnect: {
            id: user.id,
          },
        },
        muted: {
          disconnect: {
            id: user.id,
          },
        },
        banned: {
          disconnect: {
            id: user.id,
          },
        },
      },
    });
  }
  async kickUser(
    channelName: string,
    kickerUsername: string,
    kickedUsername: string,
    isOnline: boolean,
  ) {
    const kicker = await this.prisma.user.findUnique({
      where: {
        username: kickerUsername,
      },
    });
    const kicked = await this.prisma.user.findUnique({
      where: {
        username: kickedUsername,
      },
    });
    const channel = await this.prisma.channel.findUnique({
      where: {
        name: channelName,
      },
      include: {
        participants: true,
        admins: true,
      },
    });
    if (!kicker || !kicked || !channel) {
      throw new Error('user or channel not found');
    }
    const isAdmin = channel.admins.some((admin) => admin.id === kicker.id);
    if (!isAdmin) {
      throw new Error('user is not an admin');
    }
    if (kicked.id === channel.ownerId) {
      throw new Error('cannot kick owner');
    }
    await this.prisma.channel.update({
      where: {
        id: channel.id,
      },
      data: {
        participants: {
          disconnect: {
            id: kicked.id,
          },
        },
        muted: {
          disconnect: {
            id: kicked.id,
          },
        },
        banned: {
          disconnect: {
            id: kicked.id,
          },
        },
      },
    });
    if (!isOnline) {
      await this.prisma.channel.update({
        where: {
          id: channel.id,
        },
        data: {
          offlineKicked: {
            connect: {
              id: kicked.id,
            },
          },
        },
      });
    }
  }
  async addAdmin(
    channelName: string,
    adderUsername: string,
    newAdminUsername: string,
  ) {
    const adder = await this.prisma.user.findUnique({
      where: {
        username: adderUsername,
      },
    });
    const newAdmin = await this.prisma.user.findUnique({
      where: {
        username: newAdminUsername,
      },
    });
    const channel = await this.prisma.channel.findUnique({
      where: {
        name: channelName,
      },
      include: {
        participants: true,
        admins: true,
      },
    });
    if (!adder || !newAdmin || !channel) {
      throw new Error('user or channel not found');
    }
    if (channel.ownerId !== adder.id) {
      throw new Error('user is not the owner');
    }
    const isAdmin = channel.admins.some((admin) => admin.id === newAdmin.id);
    if (isAdmin) throw new Error('user is already admin');
    await this.prisma.channel.update({
      where: {
        id: channel.id,
      },
      data: {
        admins: {
          connect: {
            id: newAdmin.id,
          },
        },
      },
    });
  }
  async banUser(
    channelName: string,
    clientUsername: string,
    bannedUsername: string,
    isOnline: boolean,
  ) {
    const { target, channel } = await this.checkInput(
      channelName,
      clientUsername,
      bannedUsername,
    );
    const isParticipant = channel.participants.some(
      (participant) => participant.id === target.id,
    );
    if (!isParticipant) {
      throw new Error('user is not a participant');
    }
    const isBanned = channel.banned.some(
      (bannedUser) => bannedUser.id === target.id,
    );
    if (isBanned) {
      throw new Error('user is already banned');
    }
    await this.prisma.channel.update({
      where: {
        id: channel.id,
      },
      data: {
        banned: {
          connect: {
            id: target.id,
          },
        },
        participants: {
          disconnect: {
            id: target.id,
          },
        },
      },
    });
    if (!isOnline) {
      await this.prisma.channel.update({
        where: {
          id: channel.id,
        },
        data: {
          offlineKicked: {
            connect: {
              id: target.id,
            },
          },
        },
      });
    }
  }
  async checkInput(
    clientUsername: string,
    channelName: string,
    targetUsername: string,
  ) {
    {
      const client = await this.prisma.user.findUnique({
        where: {
          username: clientUsername,
        },
      });
      const target = await this.prisma.user.findUnique({
        where: {
          username: targetUsername,
        },
      });
      const channel = await this.prisma.channel.findUnique({
        where: {
          name: channelName,
        },
        include: {
          participants: true,
          banned: true,
          admins: true,
          muted: true,
        },
      });
      if (!channel || !client || !target) {
        throw new Error('channel not found or user not found');
      }
      const isAdmin = channel.admins.some((admin) => admin.id === client.id);
      if (!isAdmin) {
        throw new Error('user is not an admin');
      }

      return { target, channel };
    }
  }
  async unbanUser(
    channelName: string,
    clientUsername: string,
    targetUsername: string,
    isOnline: boolean,
  ) {
    const { target, channel } = await this.checkInput(
      clientUsername,
      channelName,
      targetUsername,
    );
    const isBanned = channel.banned.some(
      (bannedUser) => bannedUser.id === target.id,
    );
    if (!isBanned) {
      throw new Error('user is not banned');
    }
    await this.prisma.channel.update({
      where: {
        id: channel.id,
      },
      data: {
        banned: {
          disconnect: {
            id: target.id,
          },
        },
        participants: {
          connect: {
            id: target.id,
          },
        },
      },
    });
    if (isOnline) {
      await this.prisma.channel.update({
        where: {
          id: channel.id,
        },
        data: {
          offlineUnbanned: {
            connect: {
              id: target.id,
            },
          },
        },
      });
    }
  }
  async muteUser(
    channelName: string,
    clientUsername: string,
    targetUsername: string,
  ) {
    const { target, channel } = await this.checkInput(
      clientUsername,
      channelName,
      targetUsername,
    );
    const ismuted = channel.muted.some(
      (mutedUser) => mutedUser.id === target.id,
    );
    if (ismuted) {
      throw new Error('user is already muted');
    }
    await this.prisma.channel.update({
      where: {
        id: channel.id,
      },
      data: {
        muted: {
          connect: {
            id: target.id,
          },
        },
      },
    });
  }
  async unmuteUser(
    channelName: string,
    clientUsername: string,
    targetUsername: string,
  ) {
    const { target, channel } = await this.checkInput(
      clientUsername,
      channelName,
      targetUsername,
    );
    const ismuted = channel.muted.some(
      (mutedUser) => mutedUser.id === target.id,
    );
    if (!ismuted) {
      throw new Error('user is not muted');
    }
    await this.prisma.channel.update({
      where: {
        id: channel.id,
      },
      data: {
        muted: {
          disconnect: {
            id: target.id,
          },
        },
      },
    });
  }
  async getMyChannelsList(user: User) {
    const channels = await this.prisma.channel.findMany({
      where: {
        participants: {
          some: {
            id: user.id,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        name: true,
        avatar: true,
        type: true,
        ownerId: true,
        participants: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        owner: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        admins: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        muted: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        updatedAt: true,
      },
    });

    return channels;
  }
  async getBrowseChannelsList(user: User) {
    //return all public or protected channels that the user is not in
    const channels = await this.prisma.channel.findMany({
      where: {
        type: {
          in: ['public', 'protected'],
        },
        participants: {
          none: {
            id: user.id,
          },
        },
        banned: {
          none: {
            id: user.id,
          },
        },
      },
    });

    return channels;
  }
  async deleteChannel(
    channelName: string,
    username: string,
    io: Server,
    connected: { clientId: string; username: string }[],
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
      include: {
        participants: true,
      },
    });
    if (!channel) {
      throw new Error('channel not found');
    }
    const isOwner = channel.ownerId === user.id;
    if (!isOwner) {
      throw new Error('user is not the owner');
    }
    await this.prisma.message.deleteMany({
      where: {
        channelId: channel.id,
      },
    });
    await this.prisma.invitation.deleteMany({
      where: {
        channelId: channel.id,
      },
    });
    await this.prisma.channel.update({
      where: {
        id: channel.id,
      },
      data: {
        isDeleted: true,
      },
    });
    await Promise.all(
      channel.participants.map(async (participant) => {
        const user = connected.find(
          (user) => user.username === participant.username,
        );
        const socket = io.of('/chat').sockets[user.clientId];
        if (user) {
          socket.leave(channelName);
        } else {
          await this.prisma.channel.update({
            where: {
              id: channel.id,
            },
            data: {
              offlineKicked: {
                connect: {
                  id: participant.id,
                },
              },
              participants: {
                disconnect: {
                  id: participant.id,
                },
              },
            },
          });
        }
      }),
    );
  }
  async getOfflineKickedChannels(userId: number) {
    return await this.prisma.channel.findMany({
      where: {
        participants: {
          some: {
            id: userId,
          },
        },
        offlineKicked: {
          some: {
            id: userId,
          },
        },
      },
    });
  }
  async deleteEmptyChannels(offlineChannels) {
    return await Promise.all(
      offlineChannels.map(async (channel) => {
        if (channel.participants.length === 1 && channel.isDeleted) {
          await this.prisma.channel.delete({
            where: {
              id: channel.id,
            },
          });

          return;
        }
      }),
    );
  }
  async getOfflineUnbannedChannels(userId: number) {
    return await this.prisma.channel.findMany({
      where: {
        participants: {
          some: {
            id: userId,
          },
        },
        offlineUnbanned: {
          some: {
            id: userId,
          },
        },
      },
    });
  }
  async deleteFromOfflineUnbannedChannels(offlineChannels, userId: number) {
    return await Promise.all(
      offlineChannels.map(async (channel) => {
        await this.prisma.channel.update({
          where: {
            id: channel.id,
          },
          data: {
            offlineUnbanned: {
              disconnect: {
                id: userId,
              },
            },
          },
        });
      }),
    );
  }
  async getRecipients(channelName: string, username: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
      include: {
        blocked: true,
        blockedBy: true,
      },
    });
    const channel = await this.prisma.channel.findUnique({
      where: {
        name: channelName,
      },
      include: {
        participants: true,
      },
    });
    if (!user || !channel) {
      throw new Error('user or channel not found');
    }
    //filter participants that sender is either blocked or blocked by the user
    const recipients = channel.participants.filter(
      (participant) =>
        !user.blocked.some(
          (blockedUser) => blockedUser.id === participant.id,
        ) &&
        !user.blockedBy.some(
          (blockedUser) => blockedUser.id === participant.id,
        ),
    );

    return recipients;
  }
  async uploadAvatar(
    file: Express.Multer.File,
    user: User,
    channelName: string,
  ) {
    const channel = await this.prisma.channel.findUnique({
      where: {
        name: channelName,
      },
      include: {
        admins: true,
      },
    });
    if (!channel) {
      throw new Error('channel not found');
    }
    const isAdmin = channel.admins.some((admin) => admin.id === user.id);
    if (!isAdmin) {
      throw new Error('user is not an admin');
    }
    const avatar = await this.cloud.uploadFile(file);
    await this.prisma.channel.update({
      where: {
        name: channelName,
      },
      data: {
        avatar,
      },
    });
  }
  async changeChannelName(oldName: string, newName: string, user: User) {
    const channel = await this.prisma.channel.findUnique({
      where: {
        name: oldName,
      },
      include: {
        admins: true,
      },
    });
    if (!channel) {
      throw new Error('channel not found');
    }
    const isAdmin = channel.admins.some((admin) => admin.id === user.id);
    if (!isAdmin) {
      throw new Error('user is not an admin');
    }
    await this.prisma.channel.update({
      where: {
        name: oldName,
      },
      data: {
        name: newName,
      },
    });
  }
  async changeChannelType(dto: Troom, user: User) {
    const channel = await this.prisma.channel.findUnique({
      where: {
        name: dto.name,
      },
    });
    if (!channel) {
      throw new Error('channel not found');
    }
    if (channel.type === dto.type)
      throw new HttpException(`channel is already ${dto.type}`, 400);
    if (channel.ownerId !== user.id)
      throw new HttpException('user is not the owner', 400);
    if (dto.type === 'protected' && dto.password === null)
      throw new HttpException('password is required', 400);
    let hash = null;
    if (dto.type == 'protected') hash = await argon.hash(dto.password);
    await this.prisma.channel.update({
      where: {
        name: dto.name,
      },
      data: {
        type: dto.type,
        hash,
      },
    });
  }
  async removeAdmin(user: User, dto: Tadmin) {
    const channel = await this.prisma.channel.findUnique({
      where: {
        name: dto.name,
      },
      include: {
        admins: true,
      },
    });
    if (!channel) {
      throw new Error('channel not found');
    }
    if (channel.ownerId !== user.id)
      throw new HttpException('user is not the owner', 400);
    const isAdmin = channel.admins.some(
      (admin) => admin.username === dto.admin,
    );
    if (!isAdmin) {
      throw new Error('user provided is not an admin');
    }
    await this.prisma.channel.update({
      where: {
        name: dto.name,
      },
      data: {
        admins: {
          disconnect: {
            username: dto.admin,
          },
        },
      },
    });
  }
}
