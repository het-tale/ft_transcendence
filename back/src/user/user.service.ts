import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { TChangePassword } from 'src/dto';
import * as argon from 'argon2';
import { GameUpdate } from 'src/Game/Game-Update';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService, private gameService: GameUpdate) {}
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
    //sender should not be friend with receiver

    const friendRequests = await this.prisma.friendRequest.findMany({
      where: {
        receiverId: user.id,
        status: 'pending',
        sender: {
          NOT: {
            friends: {
              some: {
                id: user.id,
              },
            },
          },
        },
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
        roomName: true,
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
            playerA: {
              select: {
                username: true,
                avatar: true,
                id: true,
                status: true,
              },
            },
            playerB: {
              select: {
                username: true,
                avatar: true,
                id: true,
                status: true,
              },
            },
            winner: {
              select: {
                username: true,
                avatar: true,
                id: true,
                status: true,
              },
            },
          },
        },
        matchHistoryB: {
          include: {
            playerA: {
              select: {
                username: true,
                avatar: true,
                id: true,
                status: true,
              },
            },
            playerB: {
              select: {
                username: true,
                avatar: true,
                id: true,
                status: true,
              },
            },
            winner: {
              select: {
                username: true,
                avatar: true,
                id: true,
                status: true,
              },
            },
          },
        },
      },
    });

    return [...myUser.matchHistoryA, ...myUser.matchHistoryB];
  }

  async getLeaderBoard() {
    //if no match played yet?
    if ((await this.prisma.match.count()) === 0) {
      return [];
    }
    await this.gameService.calculateRank();
    const users = await this.prisma.user.findMany({
      where: {
        id: {
          not: 1,
        },
      },
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
        win_rate: true,
        status: true,
      },
      orderBy: {
        g_rank: 'asc',
      },
    });

    return users;
  }
}
