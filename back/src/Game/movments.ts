import { PrismaService } from 'src/prisma/prisma.service';
import { Room, Ball, Paddle, Player } from './types';
import { Socket } from 'socket.io';
import { User } from '@prisma/client';
import { stopGame } from './Game_services';
import { TAchievement } from 'src/dto';

const MAX_ANGLE_CHANGE = Math.PI / 4;

export function resetBall(ball: Ball, player: Player, otherPlayer: Player) {

  player.socket.emit('UPDATE SCORE', {
    playerScore: player.score,
    otherScore: otherPlayer.score,
  });
  otherPlayer.socket.emit('UPDATE SCORE', {
    playerScore: otherPlayer.score,
    otherScore: player.score,
  });
  ball.x = 720 / 2;
  ball.y = 480 / 2;
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
export async function getAchievement(name: string, prisma: PrismaService)
    {
        const achiev =  await prisma.achievement.findFirst({
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

export async function checkIfAchiever(user: User, achievement: TAchievement, checkOnline: boolean = true, prisma: PrismaService)
    {
        const ifAchiever = achievement.achievers.find((ach) => ach.id === user.id);
        if (ifAchiever) return false;
        await prisma.achievement.update({
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
                await prisma.achievement.update({
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
export async function changeLp(prisma: PrismaService, user: User, isWinner: boolean)
  {
    let lp = isWinner ? user.lp + user.add_nmr : user.lp - user.sub_nmr;
    if (lp < 0) lp = 0;
    await prisma.user.update({
      where: { id: user.id },
      data: { lp },
    });
  }

  export async function calculateNmr(prisma: PrismaService, user: User)
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
  export async function calculateWinRate(prisma: PrismaService, user: User)
  {
    if (user.matchnumber === 0) return 0;
    const rate = (user.matchwin * 100) / user.matchnumber;
    await prisma.user.update({
      where: { id: user.id },
      data: { win_rate: rate},
    });
  }
  export async function calculateRank(prisma: PrismaService)
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
        data: { g_rank: i + 1 },
      });
    }
  }


export async function checkFirstWin(username: string, prisma: PrismaService)
{
    const user = await prisma.user.findUnique({
        where: { username },
    });
    const achievement = await getAchievement("First Win", prisma);
    if (user.matchwin !== 1)
        return { achievement, isUnlocked: false };
    const isUnlocked = await checkIfAchiever(user, achievement, true, prisma);
    return { achievement, isUnlocked };
}
export async function checkFirstLoss(username: string, prisma: PrismaService)
{
    const user = await prisma.user.findUnique({
        where: { username },
    });
    const achievement = await getAchievement("First Loss", prisma);
    if (user.matchlose !== 1)
        return { achievement, isUnlocked: false };
    const isUnlocked = await checkIfAchiever(user, achievement, true, prisma);
    return { achievement, isUnlocked };
}

export async function checkRank(username: string, prisma: PrismaService)
{
    const user = await prisma.user.findUnique({
        where: { username },
    });
    let achievement: TAchievement;
    if (user.lp < 300)
        achievement = await getAchievement("Iron Curtain Crusher", prisma);
    else if (user.lp < 600)
        achievement = await getAchievement("Bronze Bounce Master", prisma);
    else if (user.lp < 900)
        achievement = await getAchievement("Silver Paddle Prodigy", prisma);
    else if (user.lp < 1200)
        achievement = await getAchievement("Golden Ball Wizard", prisma);
    else if (user.lp < 1500)
        achievement = await getAchievement("Diamond Duelist", prisma);
    else
        achievement = await getAchievement("Master of the Pongiverse", prisma);
    const isUnlocked = await checkIfAchiever(user, achievement, true, prisma);
    return { achievement, isUnlocked };
}
export async function dataupdatetostop(player: Player, otherPlayer: Player, room: Room, activeSockets: Map<Socket, User>, prisma: PrismaService)
{
  const winnerId =
  player.score > otherPlayer.score ? player.id : otherPlayer.id;
  const looserId = player.score < otherPlayer.score ? player.id : otherPlayer.id;
  const user1 = activeSockets.get(player.socket);
  const user2 = activeSockets.get(otherPlayer.socket);
  await prisma.match.update({
    where: { id: room.id },
    data: {
      result:
        'playerA ' +
        player.score.toString() +
        ' ' +
        otherPlayer.score.toString() +
        ' playerB',
      winnerId: winnerId,
      end: new Date(),
    },
  });
  await prisma.user.update({
    where: { id: winnerId },
    data: {
      matchwin: {
        increment: 1,
      },
    },
  });
  await prisma.user.update({
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
  await calculateWinRate(prisma, user1);
  await calculateWinRate(prisma, user2);
  await calculateNmr(prisma, user1);
  await calculateNmr(prisma, user2);
  user1.id === winnerId ? await changeLp(prisma, user1, true) : await changeLp(prisma, user1, false);
  user2.id === winnerId ? await changeLp(prisma, user2, true) : await changeLp(prisma, user2, false);
  const obj = await checkRank(user1.username, prisma);
  if (obj.isUnlocked)
    player.socket?.emit('achievementUnlocked', obj.achievement);
  const obj2 = await checkRank(user2.username, prisma);
  if (obj2.isUnlocked)
    otherPlayer.socket?.emit('achievementUnlocked', obj2.achievement);
  const obj3 = await checkFirstWin(user1.username, prisma);
  if (obj3.isUnlocked)
    player.socket?.emit('achievementUnlocked', obj3.achievement);
  const obj4 = await checkFirstWin(user2.username, prisma);
  if (obj4.isUnlocked)
    otherPlayer.socket?.emit('achievementUnlocked', obj4.achievement);
  const obj5 = await checkFirstLoss(user1.username, prisma);
  if (obj5.isUnlocked)
    player.socket?.emit('achievementUnlocked', obj5.achievement);
  const obj6 = await checkFirstLoss(user2.username, prisma);
  if (obj6.isUnlocked)
    otherPlayer.socket?.emit('achievementUnlocked', obj6.achievement);

stopGame(room, activeSockets);
}

export async function intersections(
  room: Room,
  playerPaddle: Paddle,
  otherPaddle: Paddle,
) {
  if (
    room.ball.x + room.ball.radius >= playerPaddle.x &&
    room.ball.y >= playerPaddle.y &&
    room.ball.y <= playerPaddle.y + playerPaddle.height
  ) {
    const relativeIntersectY =
      (room.ball.y - (playerPaddle.y + playerPaddle.height / 2)) /
      (playerPaddle.height / 2);
    const bounceAngle = relativeIntersectY * MAX_ANGLE_CHANGE;
    room.ball.dx = -room.ball.dx;
    room.ball.dy = Math.sin(bounceAngle) * 3;
  } else if (
    room.ball.x - room.ball.radius <= otherPaddle.x + otherPaddle.width &&
    room.ball.y >= otherPaddle.y &&
    room.ball.y <= otherPaddle.y + otherPaddle.height
  ) {
    const relativeIntersectY =
      (room.ball.y - (otherPaddle.y + otherPaddle.height / 2)) /
      (otherPaddle.height / 2);
    const bounceAngle = relativeIntersectY * MAX_ANGLE_CHANGE;
    room.ball.dx = -room.ball.dx;
    room.ball.dy = Math.sin(bounceAngle) * 3;
  }
}

export async function colision(
  room: Room,
  rooms: Map<string, Room>,
  activeSockets: Map<Socket, User>,
  prisma: PrismaService,
) {
  const player = room.players[0];
  const otherPlayer = room.players[1];
  const playerSocket = player.socket;
  const otherPlayerSocket = otherPlayer.socket;
  const playerPaddle = player.paddle;
  const otherPaddle = otherPlayer.paddle;
  intersections(room, playerPaddle, otherPaddle);
  if (room.ball.x + room.ball.radius > playerPaddle.x + playerPaddle.width) {
    otherPlayer.score++;
    room.rounds--;
    if (room.rounds === 0) dataupdatetostop(player, otherPlayer, room, activeSockets, prisma);
    else resetBall(room.ball, player, otherPlayer);
  } else if (room.ball.x < otherPaddle.x - otherPaddle.width) {
    player.score++;
    room.rounds--;
    if (room.rounds === 0) dataupdatetostop(player, otherPlayer, room, activeSockets, prisma);
    else resetBall(room.ball, player, otherPlayer);
  }
  playerSocket.emit('UPDATE', {
    ball: room.ball,
    paddle: playerPaddle,
    otherPaddle: otherPaddle,
  });
  otherPlayerSocket.emit('UPDATE', {
    ball: room.ball,
    paddle: otherPaddle,
    otherPaddle: playerPaddle,
  });
}
