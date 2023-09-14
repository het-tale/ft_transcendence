import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatService {
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
        id: payload.email,
      },
    });
    if (!user) {
      throw new HttpException('user not found', 404);
    }

    return user;
  }
  async saveMessage(data) {
    const user1 = await this.prisma.user.findUnique({
      where: {
        username: data.sender,
      },
    });
    const user2 = await this.prisma.user.findUnique({
      where: {
        username: data.receiver,
      },
    });

    return await this.prisma.message.create({
      data: {
        content: data.message,
        sentAt: data.date,
        senderId: user1.id,
        receiverId: user2.id,
        isOnline: data.isOnline,
      },
    });
  }
  async getDms(username: string, user) {
    const user1 = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });
    if (!user1) {
      throw new HttpException('user not found', 404);
    }
    const user2 = await this.prisma.user.findUnique({
      where: {
        email: user.email,
      },
    });
    const messages = await this.prisma.message.findMany({
      where: {
        isDM: true,
        OR: [
          {
            senderId: user1.id,
            receiverId: user2.id,
          },
          {
            senderId: user2.id,
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
  async getOfflineMessages(userId) {
    const messages = await this.prisma.message.findMany({
      where: {
        receiverId: userId,
        isOnline: false,
      },
      orderBy: {
        sentAt: 'asc',
      },
    });

    return messages;
  }
}
