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
      include: {
        blocked: true,
        sentFriendRequests: true,
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
    console.log(user.username);

    const invitations = await this.prisma.invitation.findMany({
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
        channel: true,
        isGame: true,
      },
    });

    return invitations;
  }
  async getAchievements(username: string) {
    const achievements = await this.prisma.user.findUnique({
      where: { username },
      select: {
        achievements: true,
      },
    });
    const ranks = achievements.achievements.filter(
      (achievement) => achievement.rank,
    );
    if (ranks.length === 0) {
      return achievements.achievements;
    }
    const highestRank = ranks.reduce((prev, curr) =>
      prev.rank < curr.rank ? prev : curr,
    );
    const filteredAchievements = achievements.achievements.filter(
      (achievement) => !achievement.rank,
    );
    filteredAchievements.push(highestRank);

    return filteredAchievements;
  }
  async getMatchHistory(username: string) {
    const myUser = await this.prisma.user.findUnique({
      where: { username },
      select: {
        matchHistoryA: {
          include: {
            playerA: true,
            playerB: true,
            winner: true,
          },
        },
        matchHistoryB: {
          include: {
            playerA: true,
            playerB: true,
            winner: true,
          },
        },
      },
    });

    return [...myUser.matchHistoryA, ...myUser.matchHistoryB];
  }

  getLeaderBoard() {
    const users = this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        avatar: true,
        email: true,
        g_rank: true,
        lp: true,
        matchnumber: true,
        matchwin: true,
        matchlose: true,
        achievements: true,
      },
      orderBy: {
        g_rank: 'asc',
      },
    });

    return users;
  }
}
