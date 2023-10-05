import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Conversation, FriendRequest, Message, User } from '@prisma/client';
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
  async getConversationByParticipants(
    id1: number,
    id2: number,
  ): Promise<Conversation> {
    {
      return this.prisma.conversation.findFirst({
        where: {
          AND: [
            {
              participants: {
                some: {
                  id: id1,
                },
              },
            },
            {
              participants: {
                some: {
                  id: id2,
                },
              },
            },
          ],
        },
      });
    }
  }
  async saveMessage(data) {
    const user1 = await this.prisma.user.findUnique({
      where: {
        username: data.sender,
      },
      include: {
        blocked: true,
      },
    });
    const user2 = await this.prisma.user.findUnique({
      where: {
        username: data.receiver,
      },
      include: {
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
    let conversation: Conversation;
    conversation = await this.getConversationByParticipants(user1.id, user2.id);
    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          participants: {
            connect: [
              {
                id: user1.id,
              },
              {
                id: user2.id,
              },
            ],
          },
        },
      });
    }
    const message = await this.prisma.message.create({
      data: {
        content: data.message,
        sentAt: data.date,
        senderId: user1.id,
        receiverId: user2.id,
        conversationId: conversation.id,
        isPending: data.isPending,
      },
    });
    console.log(message);
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
    const conversation = await this.getConversationByParticipants(
      user.id,
      user1.id,
    );
    const messages = await this.prisma.message.findMany({
      where: {
        isDM: true,
        conversationId: conversation.id,
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
        isDM: true,
        receiverId: userId,
        isPending: true,
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
    //return all conversations where user is a participant
    const conversations = await this.prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            id: user.id,
          },
        },
      },
      include: {
        participants: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
    if (!conversations || conversations.length === 0) {
      throw new HttpException('no conversations found', 404);
    }
    //return array of users that are not the current user ordered by updatedAt of the conversation
    const users = conversations.map((conversation) => {
      const user = conversation.participants.find(
        (participant) => participant.id !== user.id,
      );

      return user;
    });

    return users;
  }
}
