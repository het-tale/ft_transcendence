import { PrismaService } from 'src/prisma/prisma.service';
import { Room, Ball, Paddle, Player, CONTAINERWIDTH, CONTAINERHIEGHT } from './types';
import { Socket } from 'socket.io';
import { User } from '@prisma/client';
import { stopGame } from './Game_services';

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

export async function dataupdatetostop(player: Player, otherPlayer: Player, room: Room, activeSockets: Map<Socket, User>, prisma: PrismaService)
{
  const winnerId =
  player.score > otherPlayer.score ? player.id : otherPlayer.id;
  const looserId = player.score < otherPlayer.score ? player.id : otherPlayer.id;
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
