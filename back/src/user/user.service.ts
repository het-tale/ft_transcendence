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
      include:{
        blocked: true,
      }

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
  async getPendingFriendRequests(user: User) {
    const friendRequests = await this.prisma.friendRequest.findMany({
      where: {
        receiverId: user.id,
        status: 'pending',
      },
      select: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });
    return friendRequests;
  }

  async getPendingInvitations(user: User) {
    const invitations = await this.prisma.friendRequest.findMany({
      where: {
        receiverId: user.id,
        status: 'pending',
      },
      select: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });
    return invitations;
  }





// game related functions
  async changeLp(prisma: PrismaService, user: User, isWinner: boolean)
  {
    let lp = isWinner ? user.lp + user.add_nmr : user.lp - user.sub_nmr;
    if (lp < 0) lp = 0;
    await prisma.user.update({
      where: { id: user.id },
      data: { lp },
    });
  }

  async calculateNmr(prisma: PrismaService, user: User)
  {
    const rate = user.win_rate;
    let add: number;
    let sub: number;
    if (rate <= 20)
      add = 7, sub = 3;
    else if (rate <= 30)
      add = 10, sub = 10;
    else if (rate <= 50)
      add = 15, sub = 9;
    else if (rate <= 70)
      add = 20, sub = 7;
    else
      add = 25, sub = 5;
    await prisma.user.update({
      where: { id: user.id },
      data: { add_nmr: add, sub_nmr: sub},
    });
  }
  async calculateWinRate(prisma: PrismaService, user: User)
  {
    if (user.matchnumber === 0) return 0;
    const rate = (user.matchwin * 100) / user.matchnumber;
    await prisma.user.update({
      where: { id: user.id },
      data: { win_rate: rate},
    });
  }
  async calculateRank(prisma: PrismaService)
  {
    const users = await prisma.user.findMany({
      select: {
        id: true,
      },
      orderBy: {
        lp: 'desc',
      },
    });
    for (let i = 0; i < users.length; i++) {
      await prisma.user.update({
        where: { id: users[i].id },
        data: { rank: i + 1 },
      });
    }
  }
}
