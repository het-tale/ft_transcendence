import { Socket } from 'socket.io';
import { Ball, CONTAINERHIEGHT, CONTAINERWIDTH, INCREASE_SPEED, MAX_ANGLE_CHANGE, Paddle, Player, Room, SPEED_INTERVAL } from './types';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { stopGame } from './Game_Stop';
import { TAchievement } from 'src/dto';
import { Injectable } from '@nestjs/common';
import { GameInit } from './Game-Init';


@Injectable()

export class GameUpdate {
  constructor(
    private prisma: PrismaService,
    private serviceInit: GameInit,
  ) {}


 async intersections(
  room: Room,
  playerPaddle: Paddle,
  otherPaddle: Paddle,
) {
  if (
    room.ball.x - room.ball.radius < playerPaddle.x + playerPaddle.width / 2 &&
    room.ball.y >= playerPaddle.y &&
    room.ball.y <= playerPaddle.y + playerPaddle.height
  ) {
    console.log('colision 1' + room.ball.x + 'player paddle ' + playerPaddle.x + 'other [adde ' +  otherPaddle.x);
    const relativeIntersectY =
      (room.ball.y - (playerPaddle.y + playerPaddle.height / 2)) /
      (playerPaddle.height / 2);
    const bounceAngle = relativeIntersectY * MAX_ANGLE_CHANGE;

    // Add a random factor to bounceAngle
    const randomFactor = (Math.random() - 0.5) * 0.5;
    const finalBounceAngle = bounceAngle + randomFactor;

    room.ball.dx *= -1;
    room.ball.dy = Math.sin(finalBounceAngle) * 3;
  } else if (
    room.ball.x + room.ball.radius > otherPaddle.x - otherPaddle.width &&
    room.ball.y >= otherPaddle.y &&
    room.ball.y <= otherPaddle.y + otherPaddle.height
  ) {
    console.log('colision 2');
    const relativeIntersectY =
      (room.ball.y - (otherPaddle.y + otherPaddle.height / 2)) /
      (otherPaddle.height / 2);
    const bounceAngle = relativeIntersectY * MAX_ANGLE_CHANGE;

    // Add a random factor to bounceAngle
    const randomFactor = (Math.random() - 0.5) * 0.5;
    const finalBounceAngle = bounceAngle + randomFactor;

    room.ball.dx *= -1;
    room.ball.dy = Math.sin(finalBounceAngle) * 3;
  }
}

async colisionrobot(
  room: Room,
  activeSockets: Map<Socket, User>,
) {
  const player = room.players[0];
  const otherPlayer = room.players[1];
  const playerSocket = player.socket;
  const otherPlayerSocket = otherPlayer.socket;
  const playerPaddle = player.paddle;
  const otherPaddle = otherPlayer.paddle;
  this.intersections(room, playerPaddle, otherPaddle);
  if (room.ball.x + room.ball.radius >= CONTAINERWIDTH) {
    player.score++;
    room.rounds--;
    if (room.rounds === 0) this.dataupdatetostop( room, activeSockets);
    else this.resetBall(room.ball, player, otherPlayer);
  }
  if (room.ball.x - room.ball.radius <= 0) {
    otherPlayer.score++;
    room.rounds--;
    if (room.rounds === 0) this.dataupdatetostop( room, activeSockets);
    else this.resetBall(room.ball, player, otherPlayer);
  }
  playerSocket.emit('UPDATE', {
    ball: room.ball,
    paddle: playerPaddle,
    otherPaddle: otherPaddle,
  });
  otherPlayerSocket?.emit('UPDATE', {
    ball: room.ball,
    paddle: otherPaddle,
    otherPaddle: playerPaddle,
  });
}

 async updateGamerobot(
  room: Room,
  activeSockets: Map<Socket, User>,
) {

  const robotpaddle = room.players[1].paddle;
  
  const randomError = Math.random();
  const errorFactor = 0.3;

const paddleCenterY = robotpaddle.y + robotpaddle.height / 2;
const ballY = room.ball.y;
const yDifference = ballY - paddleCenterY;

if (randomError < errorFactor) {
  // Apply random error to robot's movement
  room.players[1].paddle.y += Math.random() * 2 * robotpaddle.dy - robotpaddle.dy;
} else {
  // Maintain normal robot behavior
  room.players[1].paddle.y += yDifference > 0 ? robotpaddle.dy : -robotpaddle.dy;
}

const maxY = CONTAINERHIEGHT - room.players[1].paddle.height;
if (room.players[1].paddle.y < 0) {
  room.players[1].paddle.y = 0;
} else if (room.players[1].paddle.y > maxY) {
  room.players[1].paddle.y = maxY;
}
  // Check for collisions with top and bottom walls
  if (
    room.ball.y - room.ball.radius <= 0 ||
    room.ball.y + room.ball.radius >= CONTAINERHIEGHT
  ) {
    // Reverse the vertical velocity of the ball
    room.ball.dy *= -1;
  }
  this.colisionrobot(room, activeSockets);
  if (Date.now() - room.lastspeedincrease > SPEED_INTERVAL) {
    room.lastspeedincrease = Date.now();
    room.ball.dx += room.ball.dx > 0 ? INCREASE_SPEED : -INCREASE_SPEED;
    room.ball.dy += room.ball.dy > 0 ? INCREASE_SPEED : -INCREASE_SPEED;
  }
  // room.ball.setXY(room.ball.x + room.ball.dx, room.ball.y + room.ball.dy);
  room.ball.x += room.ball.dx;
  room.ball.y += room.ball.dy;
}

 async UpdatePaddle(
  client: Socket,
  eventData: any,
  rooms: Map<string, Room>,
) {
  const room = this.serviceInit.findRoomByPlayerSocket(client, rooms);

  if (room) {
    const player = room.players.find((p) => p.socket === client);

    if (player) {
      const relativeMouseYPercentage = eventData.relativeMouseY;
      player.paddle.y = (relativeMouseYPercentage / 100) * CONTAINERHIEGHT;
    }
  }
}

async  OtherAvatar(
  client: Socket,
  room: Room,
  activeSockets: Map<Socket, User>,
) {
    const player = room.players.find((p) => p.socket === client);
    const otherPlayer = room.players.find((player) => player.socket !== client);
    console.log('player', player.socket);
    console.log('other player', otherPlayer.socket);
    const user = activeSockets.get(client);
    const otherUser = activeSockets.get(otherPlayer.socket);
    console.log('user', user);
    console.log('other user', otherUser);
    otherPlayer.socket?.emit('OTHER AVATAR', user.avatar, user.username);
    player.socket?.emit('OTHER AVATAR', otherUser.avatar, otherUser.username);
}

async updateGame(
  room: Room,
  activeSockets: Map<Socket, User>,
) {
  // Calculate the new ball position based on its current position and velocity
  if (Date.now() - room.lastspeedincrease > SPEED_INTERVAL) {
    room.lastspeedincrease = Date.now();
    room.ball.dx += room.ball.dx > 0 ? INCREASE_SPEED : -INCREASE_SPEED;
    room.ball.dy += room.ball.dy > 0 ? INCREASE_SPEED : -INCREASE_SPEED;
  }
  // room.ball.setXY(room.ball.x + room.ball.dx, room.ball.y + room.ball.dy);
  room.ball.x += room.ball.dx;
  room.ball.y += room.ball.dy;
  // Check for collisions with top and bottom walls
  if (
    room.ball.y - room.ball.radius <= 0 ||
    room.ball.y + room.ball.radius > CONTAINERHIEGHT
  ) {
    // Reverse the vertical velocity of the ball
    room.ball.dy *= -1;
  }
  this.colisionrobot(room, activeSockets);
}

async getclient(
  client: Socket,
  activeSockets: Map<Socket, User>,
) {
  const user = activeSockets.get(client);
  if (!user) {
    console.log('user not found');
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
  ball.x =  CONTAINERWIDTH/ 2;
  ball.y = CONTAINERHIEGHT / 2;
  const random = Math.random();
  switch (true) {
    case random < 0.25:
      ball.dx = 3;
      ball.dy = 3;
      break;
    case random < 0.5:
      ball.dx = 3;
      ball.dy = -3;
      break;
    case random < 0.75:
      ball.dx = -3;
      ball.dy = 3;
      break;
    default:
      ball.dx = -3;
      ball.dy = -3;
      break;
  }
}
 async getAchievement(name: string)
    {
        const achiev =  await this.prisma.achievement.findFirst({
            where: {
                name,
            },
            include: {
                achievers: true,
            },
        });
        if (!achiev) throw new Error("Achievement not found");
        return achiev;
    }

 async checkIfAchiever(user: User, achievement: TAchievement, checkOnline: boolean = true)
    {
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
        if (checkOnline)
        {
            if (user.status === 'offline')
            {
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
async changeLp( user: User, isWinner: boolean)
  {
    let lp = isWinner ? user.lp + user.add_nmr : user.lp - user.sub_nmr;
    if (lp < 0) lp = 0;
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lp },
    });
  }

async calculateNmr( user: User)
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
    await this.prisma.user.update({
      where: { id: user.id },
      data: { add_nmr: add, sub_nmr: sub},
    });
  }

  async calculateWinRate(user: User)
  {
    if (user.matchnumber === 0) return 0;
    const rate = (user.matchwin * 100) / user.matchnumber;
    await this.prisma.user.update({
      where: { id: user.id },
      data: { win_rate: rate},
    });
  }

async  calculateRank(prisma: PrismaService)
  {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
      },
      orderBy: {
        lp: 'desc',
      },
    });
    for (let i = 0; i < users.length; i++) {
      await this.prisma.user.update({
        where: { id: users[i].id },
        data: { g_rank: i + 1 },
      });
    }
  }


 async checkFirstWin(username: string)
{
    const user = await this.prisma.user.findUnique({
        where: { username },
    });
    const achievement = await this.getAchievement("First Win");
    if (user.matchwin !== 1)
        return { achievement, isUnlocked: false };
    const isUnlocked = await this.checkIfAchiever(user, achievement, true);
    return { achievement, isUnlocked };
}
 async checkFirstLoss(username: string)
{
    const user = await this.prisma.user.findUnique({
        where: { username },
    });
    const achievement = await this.getAchievement("First Loss");
    if (user.matchlose !== 1)
        return { achievement, isUnlocked: false };
    const isUnlocked = await this.checkIfAchiever(user, achievement, true);
    return { achievement, isUnlocked };
}

 async checkRank(username: string)
{
    const user = await this.prisma.user.findUnique({
        where: { username },
    });
    let achievement: TAchievement;
    if (user.lp < 300)
        achievement = await this.getAchievement("Iron Curtain Crusher");
    else if (user.lp < 600)
        achievement = await this.getAchievement("Bronze Bounce Master");
    else if (user.lp < 900)
        achievement = await this.getAchievement("Silver Paddle Prodigy");
    else if (user.lp < 1200)
        achievement = await this.getAchievement("Golden Ball Wizard");
    else if (user.lp < 1500)
        achievement = await this.getAchievement("Diamond Duelist");
    else
        achievement = await this.getAchievement("Master of the Pongiverse");
    const isUnlocked = await this.checkIfAchiever(user, achievement, true);
    return { achievement, isUnlocked };
}
 async dataupdatetostop(room: Room, activeSockets: Map<Socket, User>)
{
  const player = room.players[0];
  const otherPlayer = room.players[1];
  const winnerId =
  player.score > otherPlayer.score ? player.id : otherPlayer.id;
  const looserId = player.score < otherPlayer.score ? player.id : otherPlayer.id;
  const user1 = activeSockets.get(player.socket);
  const user2 = activeSockets.get(otherPlayer.socket);

  await this.prisma.match.update({
    where: { id: room.id },
    data: {
      resultA: player.score,
      resultB: otherPlayer.score,
      winnerId: winnerId,
      end: new Date(),
    },
  });
  await this.prisma.user.update({
    where: { id: winnerId },
    data: {
      matchwin: {
        increment: 1,
      },
    },
  });
  await this.prisma.user.update({
    where: { id: looserId },
    data: {
      matchlose: {
        increment: 1,
      },
    },
  });
  if (player.score > otherPlayer.score) {
    player.socket?.emit('GAME OVER', { winner: true });
    otherPlayer.socket?.emit('GAME OVER', { winner: false });
  } else {
    player.socket?.emit('GAME OVER', { winner: false });
    otherPlayer.socket?.emit('GAME OVER', { winner: true });
  }
  room.gameActive = false;
  await this.calculateWinRate(user1);
  await this.calculateWinRate(user2);
  await this.calculateNmr(user1);
  await this.calculateNmr(user2);
  user1.id === winnerId ? await this.changeLp(user1, true) : await this.changeLp(user1, false);
  user2.id === winnerId ? await this.changeLp(user2, true) : await this.changeLp(user2, false);
  const obj = await this.checkRank(user1.username);
  if (obj.isUnlocked)
    player.socket?.emit('achievementUnlocked', obj.achievement);
  const obj2 = await this.checkRank(user2.username);
  if (obj2.isUnlocked)
    otherPlayer.socket?.emit('achievementUnlocked', obj2.achievement);
  const obj3 = await this.checkFirstWin(user1.username);
  if (obj3.isUnlocked)
    player.socket?.emit('achievementUnlocked', obj3.achievement);
  const obj4 = await this.checkFirstWin(user2.username);
  if (obj4.isUnlocked)
    otherPlayer.socket?.emit('achievementUnlocked', obj4.achievement);
  const obj5 = await this.checkFirstLoss(user1.username);
  if (obj5.isUnlocked)
    player.socket?.emit('achievementUnlocked', obj5.achievement);
  const obj6 = await this.checkFirstLoss(user2.username);
  if (obj6.isUnlocked)
    otherPlayer.socket?.emit('achievementUnlocked', obj6.achievement);

stopGame(room, activeSockets);
}

}