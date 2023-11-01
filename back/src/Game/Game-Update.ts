import { Socket } from 'socket.io';
import {
  BALLDX,
  Ball,
  CONTAINERHIEGHT,
  CONTAINERWIDTH,
  INCREASE_SPEED,
  MAX_ANGLE_CHANGE,
  Paddle,
  Player,
  Room,
  SPEED_INTERVAL,
} from './types';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { stopGame } from './Game_Stop';
import { TAchievement } from 'src/dto';
import { Injectable } from '@nestjs/common';
import { GameInit } from './Game-Init';
import { Server } from 'socket.io';

@Injectable()
export class GameUpdate {
  constructor(private prisma: PrismaService, private serviceInit: GameInit) {}

  async intersections(room: Room, playerPaddle: Paddle, otherPaddle: Paddle) {
    if (Date.now() - room.ball.lastcolision < 100) return;

    if (
      room.ball.x - room.ball.radius <
        playerPaddle.x + playerPaddle.width / 2 &&
      room.ball.y > playerPaddle.y &&
      room.ball.y < playerPaddle.y + playerPaddle.height
    ) {
      room.ball.lastcolision = Date.now();
      const relativeIntersectY =
        (room.ball.y - (playerPaddle.y + playerPaddle.height / 2)) /
        (playerPaddle.height / 2);
      const bounceAngle = relativeIntersectY * MAX_ANGLE_CHANGE;

      const randomFactor = (Math.random() - 0.5) * 0.2;
      const finalBounceAngle = bounceAngle + randomFactor;

      room.ball.dx *= -1;
      room.ball.dy = Math.sin(finalBounceAngle) * 3;
    } else if (
      room.ball.x + room.ball.radius > otherPaddle.x - otherPaddle.width &&
      room.ball.y > otherPaddle.y &&
      room.ball.y < otherPaddle.y + otherPaddle.height
    ) {
      room.ball.lastcolision = Date.now();
      const relativeIntersectY =
        (room.ball.y - (otherPaddle.y + otherPaddle.height / 2)) /
        (otherPaddle.height / 2);
      const bounceAngle = relativeIntersectY * MAX_ANGLE_CHANGE;

      const randomFactor = (Math.random() - 0.5) * 0.2;
      const finalBounceAngle = bounceAngle + randomFactor;

      room.ball.dx *= -1;
      room.ball.dy = Math.sin(finalBounceAngle) * 3;
    }
  }

  async colisionrobot(room: Room, activeSockets: Map<Socket, User>, server: Server) {
    const player = room.players[0];
    const otherPlayer = room.players[1];
    const playerSocket = player.socket;
    const otherPlayerSocket = otherPlayer.socket;
    const playerPaddle = player.paddle;
    const otherPaddle = otherPlayer.paddle;
    this.intersections(room, playerPaddle, otherPaddle);
    if (room.ball.x + room.ball.radius > CONTAINERWIDTH) {
      player.score++;
      room.rounds--;
      if (room.rounds === 0) this.dataupdatetostop(room, activeSockets);
      else this.resetBall(room.ball, player, otherPlayer);
    }
    if (room.ball.x - room.ball.radius <= 0) {
      otherPlayer.score++;
      room.rounds--;
      if (room.rounds === 0) this.dataupdatetostop(room, activeSockets);
      else this.resetBall(room.ball, player, otherPlayer);
    }
    playerSocket?.emit('UPDATE', {
      ball: room.ball,
      paddle: playerPaddle,
      otherPaddle: otherPaddle,
      who: playerSocket?.id
    });
    otherPlayerSocket?.emit('UPDATE', {
      ball: room.ball,
      paddle: otherPaddle,
      otherPaddle: playerPaddle,
    });
  }

  async updateGamerobot(room: Room, activeSockets: Map<Socket, User>, server: Server) {
    const robotpaddle = room.players[1].paddle;
    const targetY = room.ball.y - robotpaddle.height / 2;
    room.ball.x > CONTAINERWIDTH / 2? room.players[1].paddle.y += (targetY - room.players[1].paddle.y) * 0.08 : null
    const maxY = CONTAINERHIEGHT - room.players[1].paddle.height;
    room.players[1].paddle.y = Math.max(0, Math.min(room.players[1].paddle.y, maxY));

    this.colisionrobot(room, activeSockets, server);
    if (Date.now() - room.lastspeedincrease > SPEED_INTERVAL) {
      room.lastspeedincrease = Date.now();
      room.ball.dx += room.ball.dx > 0 ? INCREASE_SPEED : -INCREASE_SPEED;
      room.ball.dy += room.ball.dy > 0 ? INCREASE_SPEED : -INCREASE_SPEED;
    }
    room.ball.x += room.ball.dx;
    room.ball.y += room.ball.dy;
    if (
      room.ball.y - room.ball.radius <= 0 ||
      room.ball.y + room.ball.radius >= CONTAINERHIEGHT
    ) {
      room.ball.dy *= -1;
    }
  }

  async UpdatePaddle(client: Socket, eventData: any, rooms: Map<string, Room>) {
    const room = this.serviceInit.findRoomByPlayerSocket(client, rooms);

    if (room) {
      const player = room.players.find((p) => p.socket === client);

      if (player) {
        const relativeMouseYPercentage = eventData.relativeMouseY;
        player.paddle.y = (relativeMouseYPercentage / 100) * CONTAINERHIEGHT;
      }
    }
  }

  async OtherAvatar(
    client: Socket,
    room: Room,
  ) {
    const player = room.players.find((p) => p.socket === client);
    const otherPlayer = room.players.find((player) => player.socket !== client);
    const user = await this.prisma.user.findUnique({
      where: {
        id: player?.id,
      },
    });
    const otherUser = await this.prisma.user.findUnique({
      where: {
        id: otherPlayer?.id,
      },
    });
    otherPlayer.socket?.emit('OTHER AVATAR', user.avatar, user.username);
    player.socket?.emit('OTHER AVATAR', otherUser.avatar, otherUser.username);
  }

  async updateGame(room: Room, activeSockets: Map<Socket, User>, server: Server) {
    this.colisionrobot(room, activeSockets, server);
    if (Date.now() - room.lastspeedincrease > SPEED_INTERVAL) {
      room.lastspeedincrease = Date.now();
      room.ball.dx += room.ball.dx > 0 ? INCREASE_SPEED : -INCREASE_SPEED;
      room.ball.dy += room.ball.dy > 0 ? INCREASE_SPEED : -INCREASE_SPEED;
    }
    room.ball.x += room.ball.dx;
    room.ball.y += room.ball.dy;
    if (
      room.ball.y - room.ball.radius <= 0 ||
      room.ball.y + room.ball.radius > CONTAINERHIEGHT
    ) {
      // Reverse the vertical velocity of the ball
      room.ball.dy *= -1;
    }
  }

  async getclient(client: Socket, activeSockets: Map<Socket, User>) {
    const user = activeSockets.get(client);
    if (!user) {
      return;
    }

    return user;
  }

  resetBall(ball: Ball, player: Player, otherPlayer: Player) {
    player.socket?.emit('UPDATE SCORE', {
      playerScore: player.score,
      otherScore: otherPlayer.score,
    });
    otherPlayer.socket?.emit('UPDATE SCORE', {
      playerScore: otherPlayer.score,
      otherScore: player.score,
    });
    ball.x = CONTAINERWIDTH / 2;
    ball.y = CONTAINERHIEGHT / 2;
    ball.lastcolision = Date.now();
    const random = Math.random();
    switch (true) {
      case random < 0.25:
        ball.dx = BALLDX;
        ball.dy = BALLDX;
        break;
      case random < 0.5:
        ball.dx = BALLDX;
        ball.dy = -BALLDX;
        break;
      case random < 0.75:
        ball.dx = -BALLDX;
        ball.dy = BALLDX;
        break;
      default:
        ball.dx = -BALLDX;
        ball.dy = -BALLDX;
        break;
    }
  }
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
  async changeLp(userId: number, isWinner: boolean) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    let lp =
      isWinner === true ? user.lp + user.add_nmr : user.lp - user.sub_nmr;
    if (lp < 0) lp = 0;
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lp },
    });
  }

  async calculateNmr(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    const rate = user.win_rate;
    let add: number;
    let sub: number;
    const rates_dict: { [key: number]: number[] } = {
      20: [7, 9],
      30: [10, 10],
      50: [15, 9],
      70: [20, 7],
    };

    const default_values = [25, 5];

    for (const threshold in rates_dict) {
      if (rate <= parseInt(threshold)) {
        [add, sub] = rates_dict[threshold];
        break;
      }
    }

    if (!add && !sub) {
      [add, sub] = default_values;
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { add_nmr: add, sub_nmr: sub },
    });
  }

  async calculateWinRate(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    const rate = (user.matchwin * 100) / user.matchnumber;
    await this.prisma.user.update({
      where: { id: user.id },
      data: { win_rate: rate },
    });
  }

  async calculateRank() {
    const users = await this.prisma.user.findMany({
      where: {
        id: {
          not: 1,
        },
      },
      select: {
        id: true,
      },
      orderBy: [
        {
          lp: 'desc',
        },
        {
          id: 'asc',
        },
      ],
    });
    for (let i = 0; i < users.length; i++) {
      await this.prisma.user.update({
        where: { id: users[i].id },
        data: { g_rank: i + 1 },
      });
    }
  }

  async checkFirstWin(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    const achievement = await this.getAchievement('First Win');
    if (user.matchwin !== 1) return { achievement, isUnlocked: false };
    const isUnlocked = await this.checkIfAchiever(user, achievement, true);

    return { achievement, isUnlocked };
  }
  async checkFirstLoss(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    const achievement = await this.getAchievement('First Loss');
    if (user.matchlose !== 1) return { achievement, isUnlocked: false };
    const isUnlocked = await this.checkIfAchiever(user, achievement, true);

    return { achievement, isUnlocked };
  }

  async checkRank(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    let achievement: TAchievement;
    if (user.lp < 300)
      achievement = await this.getAchievement('Iron Curtain Crusher');
    else if (user.lp < 600)
      achievement = await this.getAchievement('Bronze Bounce Master');
    else if (user.lp < 900)
      achievement = await this.getAchievement('Silver Paddle Prodigy');
    else if (user.lp < 1200)
      achievement = await this.getAchievement('Golden Ball Wizard');
    else if (user.lp < 1500)
      achievement = await this.getAchievement('Diamond Duelist');
    else achievement = await this.getAchievement('Master of the Pongiverse');
    const isUnlocked = await this.checkIfAchiever(user, achievement, true);

    return { achievement, isUnlocked };
  }
  async dataupdatetostop(room: Room, activeSockets: Map<Socket, User>) {
    const winer =
      room.players[0].score > room.players[1].score
        ? room.players[0]
        : room.players[1];
    const looser =
      room.players[0].score < room.players[1].score
        ? room.players[0]
        : room.players[1];

    await this.prisma.match.update({
      where: { id: room.id },
      data: {
        resultA: room.players[0].score,
        resultB: room.players[1].score,
        winnerId: winer.id,
        end: new Date(),
      },
    });
    await this.prisma.user.update({
      where: { id: winer.id },
      data: {
        matchwin: {
          increment: 1,
        },
      },
    });
    await this.prisma.user.update({
      where: { id: looser.id },
      data: {
        matchlose: {
          increment: 1,
        },
      },
    });
    winer.socket?.emit('GAME OVER', { winner: true });
    looser.socket?.emit('GAME OVER', { winner: false });
    room.gameActive = false;
    await this.calculateWinRate(winer.id);
    await this.calculateWinRate(looser.id);
    await this.calculateNmr(winer.id);
    await this.calculateNmr(looser.id);
    await this.changeLp(winer.id, true);
    await this.changeLp(looser.id, false);
    await this.calculateRank();
    const obj = await this.checkRank(winer.id);
    if (obj.isUnlocked)
      winer.socket?.emit('achievementUnlocked', obj.achievement);
    const obj2 = await this.checkRank(looser.id);
    if (obj2.isUnlocked)
      looser.socket?.emit('achievementUnlocked', obj2.achievement);
    const obj3 = await this.checkFirstWin(winer.id);
    if (obj3.isUnlocked)
      winer.socket?.emit('achievementUnlocked', obj3.achievement);
    const obj4 = await this.checkFirstWin(looser.id);
    if (obj4.isUnlocked)
      looser.socket?.emit('achievementUnlocked', obj4.achievement);
    if (obj4.isUnlocked)
      looser.socket?.emit('achievementUnlocked', obj4.achievement);
    const obj5 = await this.checkFirstLoss(winer.id);
    if (obj5.isUnlocked)
      winer.socket?.emit('achievementUnlocked', obj5.achievement);
    const obj6 = await this.checkFirstLoss(looser.id);
    if (obj6.isUnlocked)
      looser.socket?.emit('achievementUnlocked', obj6.achievement);

    stopGame(room, activeSockets);
  }
}
