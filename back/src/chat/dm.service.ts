import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { FriendRequest, Message, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DMService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private conf: ConfigService,
  ) {}
  async verifyToken(token: string | string[]) {
    if (token instanceof Array) {
      throw new HttpException('invalid token', 400);
    }
    const payload = await this.jwt.verify(token, {
      secret: this.conf.get('ACCESS_TOKEN_JWT_SECRET'),
    });
    const user = await this.prisma.user.findUnique({
      where: {
        email: payload.email,
      },
    });
    if (!user) {
      throw new HttpException('user not found', 404);
    }

    return user;
  }
  async changeUserStatus(username: string, status: string) {
    const updatedUser = await this.prisma.user.update({
      where: {
        username,
      },
      data: {
        status,
      },
    });

    return updatedUser;
  }
  async saveMessage(data) {
    const user1 = await this.prisma.user.findUnique({
      where: {
        username: data.sender,
      },
      include: {
        blocked: true,
        dmsList: true,
      },
    });
    const user2 = await this.prisma.user.findUnique({
      where: {
        username: data.receiver,
      },
      include: {
        dmsList: true,
        blocked: true,
      },
    });
    if (!user1 || !user2) {
      throw new Error('User not found.');
    }
    const receiverIsBlocked = user1.blocked.find(
      (blockedUser) => blockedUser.id === user2.id,
    );
    if (receiverIsBlocked) {
      throw new Error('You blocked this user unblock to send messages.');
    }
    const senderIsBlocked = user2.blocked.find(
      (blockedUser) => blockedUser.id === user1.id,
    );
    if (senderIsBlocked) {
      throw new Error('You are blocked by this user.');
    }

    const message = await this.prisma.message.create({
      data: {
        content: data.message,
        sentAt: data.date,
        senderId: user1.id,
        receiverId: user2.id,
        isPending: data.isPending,
      },
    });
    console.log(message);
    const existingDmUser1 = user1.dmsList.find(
      (dm) => dm.username === user2.username,
    );
    const existingDmUser2 = user2.dmsList.find(
      (dm) => dm.username === user1.username,
    );
    if (!existingDmUser1) {
      await this.prisma.user.update({
        where: {
          id: user1.id,
        },
        data: {
          dmsList: {
            connect: {
              id: user2.id,
            },
          },
        },
      });
    }
    if (!existingDmUser2) {
      await this.prisma.user.update({
        where: {
          id: user2.id,
        },
        data: {
          dmsList: {
            connect: {
              id: user1.id,
            },
          },
        },
      });
    }
  }
  async getDmConversation(username: string, user: User) {
    const user1 = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });
    if (!user1) {
      throw new HttpException('user not found', 404);
    }
    const messages = await this.prisma.message.findMany({
      where: {
        isDM: true,
        OR: [
          {
            senderId: user1.id,
            receiverId: user.id,
          },
          {
            senderId: user.id,
            receiverId: user1.id,
          },
        ],
      },
      orderBy: {
        sentAt: 'asc',
      },
    });
    if (!messages || messages.length === 0) {
      throw new HttpException('no messages found', 404);
    }

    return messages;
  }
  async deleteDm(username: string, user: User) {
    try {
      const messages = await this.getDmConversation(username, user);
      await this.prisma.message.deleteMany({
        where: {
          id: {
            in: messages.map((message) => message.id),
          },
        },
      });
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }
      throw new HttpException(e.message, 400);
    }
  }

  async getOfflineMessages(userId: number) {
    const messages = await this.prisma.message.findMany({
      where: {
        receiverId: userId,
        isDM: true,
        isPending: true,
      },
      orderBy: {
        sentAt: 'asc',
      },
    });

    return messages;
  }
  async changeOfflineMessagesStatus(messages: Message[]) {
    const updatedMessages = await Promise.all(
      messages.map(async (message) => {
        const updatedMessage = await this.prisma.message.update({
          where: {
            id: message.id,
          },
          data: {
            isPending: false,
          },
        });

        return updatedMessage;
      }),
    );

    return updatedMessages;
  }
  async sendFriendRequest(
    clientUsername: string,
    receiverUsername: string,
    isOnline: boolean,
  ) {
    const client = await this.prisma.user.findUnique({
      where: {
        username: clientUsername,
      },
    });
    const receiver = await this.prisma.user.findUnique({
      where: {
        username: receiverUsername,
      },
    });
    if (!client || !receiver) {
      throw new Error('User not found.');
    }
    const existingFriendRequest = await this.prisma.friendRequest.findFirst({
      where: {
        senderId: client.id,
        receiverId: receiver.id,
        status: 'pending',
      },
    });

    if (existingFriendRequest) {
      throw new Error('A pending friend request already exists.');
    }

    return await this.prisma.friendRequest.create({
      data: {
        senderId: client.id,
        receiverId: receiver.id,
        status: 'pending',
        isReceiverOnline: isOnline,
      },
    });
  }
  async getOfflineFriendRequests(userId: number) {
    const friendRequests = await this.prisma.friendRequest.findMany({
      where: {
        receiverId: userId,
        isReceiverOnline: false,
      },
    });

    return friendRequests;
  }
  async changeOfflineFriendRequestsStatus(friendRequests: FriendRequest[]) {
    const updatedFriendRequests = await Promise.all(
      friendRequests.map(async (friendRequest) => {
        const updatedFriendRequest = await this.prisma.friendRequest.update({
          where: {
            id: friendRequest.id,
          },
          data: {
            isReceiverOnline: true,
          },
        });

        return updatedFriendRequest;
      }),
    );

    return updatedFriendRequests;
  }
  async getDmsList(user: User) {
    const dbUser = await this.prisma.user.findUnique({
      where: {
        id: user.id,
      },
      include: {
        dmsList: true,
      },
    });

    return dbUser.dmsList;
  }
}
