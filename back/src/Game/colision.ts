import { PrismaService } from 'src/prisma/prisma.service';
import { Room, Ball, Paddle } from './types';
import { Socket } from 'socket.io';
import { User } from '@prisma/client';
import { stopGame } from './Game_services';

const MAX_ANGLE_CHANGE = Math.PI / 4;

export function resetBall(ball: Ball) {
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
    if (room.rounds === 0) {
      const winnerId =
        player.score > otherPlayer.score ? player.id : otherPlayer.id;
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
      if (player.score > otherPlayer.score) {
        playerSocket.emit('GAME OVER', { winner: true });
        otherPlayerSocket.emit('GAME OVER', { winner: false });
      } else {
        playerSocket.emit('GAME OVER', { winner: false });
        otherPlayerSocket.emit('GAME OVER', { winner: true });
      }
      room.gameActive = false;
	  stopGame(room, rooms, activeSockets, prisma);
    } else {
      resetBall(room.ball);
      playerSocket.emit('UPDATE SCORE', {
        playerScore: player.score,
        otherScore: otherPlayer.score,
      });
      otherPlayerSocket.emit('UPDATE SCORE', {
        playerScore: otherPlayer.score,
        otherScore: player.score,
      });
    }
  } else if (room.ball.x < otherPaddle.x - otherPaddle.width) {
    player.score++;
    room.rounds--;
    if (room.rounds === 0) {
      const winnerId =
        player.score > otherPlayer.score ? player.id : otherPlayer.id;
      if (player.score > otherPlayer.score) {
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
        playerSocket.emit('GAME OVER', { winner: true });
        otherPlayerSocket.emit('GAME OVER', { winner: false });
        //stop the game
      } else {
        playerSocket.emit('GAME OVER', { winner: false });
        otherPlayerSocket.emit('GAME OVER', { winner: true });
      }
      room.gameActive = false;
	  stopGame(room, rooms, activeSockets, prisma);
    } else {
      resetBall(room.ball);
      playerSocket.emit('UPDATE SCORE', {
        playerScore: player.score,
        otherScore: otherPlayer.score,
      });
      otherPlayerSocket.emit('UPDATE SCORE', {
        playerScore: otherPlayer.score,
        otherScore: player.score,
      });
    }
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
