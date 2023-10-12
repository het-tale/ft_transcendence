import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { TChangePassword } from 'src/dto';
import * as argon from 'argon2';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        login: true,
        createdAt: true,
        updatedAt: true,
        status: true,
      },
    });
    if (!user) {
      throw new HttpException('User not found', 404);
    }

    return user;
  }
  async changeUsername(username: string, user: User) {
    try {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { username },
      });
    } catch (error) {
      if (error.code === 'P2002')
        throw new HttpException('Username already taken', 400);
      else throw new HttpException(error.message, 400);
    }
  }
  async changePassword(dto: TChangePassword, user: User) {
    const userWithHash = await this.prisma.user.findUnique({
      where: { id: user.id },
    });
    const isValid = await argon.verify(userWithHash.hash, dto.oldPassword);
    if (!isValid) {
      throw new HttpException('Incorrect password', 400);
    }
    const hash = await argon.hash(dto.newPassword);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { hash },
    });
  }
  async searchUsers(beginWith: string, user: User) {
    //search all users except the current user
    const users = await this.prisma.user.findMany({
      where: {
        username: {
          startsWith: beginWith,
          not: user.username,
        },
      },
      select: {
        id: true,
        username: true,
        avatar: true,
      },
    });

    return users;
  }
}
