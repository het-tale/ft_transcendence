import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { TAchievement } from 'src/dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AchievementsService {
  constructor(private prisma: PrismaService) {}
  async getAchievement(name: string) {
    const achiev = await this.prisma.achievement.findFirst({
      where: {
        name,
      },
      include: {
        achievers: true,
      },
    });
    if (!achiev) throw new Error('Achievement not found');

    return achiev;
  }
  async checkIfAchiever(
    user: User,
    achievement: TAchievement,
    checkOnline = true,
  ) {
    const ifAchiever = achievement.achievers.find((ach) => ach.id === user.id);
    if (ifAchiever) return false;
    await this.prisma.achievement.update({
      where: {
        id: achievement.id,
      },
      data: {
        achievers: {
          connect: {
            id: user.id,
          },
        },
      },
    });
    if (checkOnline) {
      if (user.status === 'offline') {
        await this.prisma.achievement.update({
          where: {
            id: achievement.id,
          },
          data: {
            offlineAchievers: {
              connect: {
                id: user.id,
              },
            },
          },
        });

        return false;
      }
    }

    return true;
  }
  async getOfflineAchievements(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        offlineAchievements: true,
      },
    });
    const offlineAchievements = user.offlineAchievements;

    return offlineAchievements;
  }
  async removeOfflineAchievements(username: string) {
    await this.prisma.user.update({
      where: { username },
      data: {
        offlineAchievements: {
          set: [],
        },
      },
    });
  }
  async check20friends(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        friends: true,
      },
    });
    const achievement = await this.getAchievement('Social Pong Star');
    if (user.friends.length < 20) return { achievement, isUnlocked: false };
    const isUnlocked = await this.checkIfAchiever(user, achievement, true);

    return { achievement, isUnlocked };
  }
  async checkFirstBlock(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        blocked: true,
      },
    });
    const achievement = await this.getAchievement('Boundries Set');
    if (user.blocked.length < 1) return { achievement, isUnlocked: false };
    const isUnlocked = await this.checkIfAchiever(user, achievement, false);

    return { achievement, isUnlocked };
  }
  async check20blocks(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        blockedBy: true,
      },
    });
    const achievement = await this.getAchievement('The Unstoppable Block-nado');
    if (user.blockedBy.length < 20) return { achievement, isUnlocked: false };
    const isUnlocked = await this.checkIfAchiever(user, achievement, true);

    return { achievement, isUnlocked };
  }
  async check100SentMessages(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        sentMessages: true,
      },
    });
    const achievement = await this.getAchievement('Chat Chatterbox');
    if (user.sentMessages.length < 100)
      return { achievement, isUnlocked: false };
    const isUnlocked = await this.checkIfAchiever(user, achievement, false);

    return { achievement, isUnlocked };
  }
  async check20Channels(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        channels: true,
      },
    });
    const achievement = await this.getAchievement(
      'Channel Hopper Extraordinaire',
    );
    if (user.channels.length < 20) return { achievement, isUnlocked: false };
    const isUnlocked = await this.checkIfAchiever(user, achievement, false);

    return { achievement, isUnlocked };
  }
}
