import { User } from '@prisma/client';
import { Room } from './types';
import { Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { intersections, resetBall } from './movments';
import { stopGame } from './Game_services';

export async function colisionrobot(
  room: Room,
  rooms: Map<string, Room>,
  activeSockets: Map<Socket, User>,
  prisma: PrismaService,
) {
  const player = room.players[0];
  const otherPlayer = room.players[1];
  const playerSocket = player.socket;
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
      } else {
        playerSocket.emit('GAME OVER', { winner: false });
      }
      room.gameActive = false;
      const user1 = activeSockets.get(playerSocket);
      console.log('users in colision ', user1);
      stopGame(room, activeSockets);
    } else {
      resetBall(room.ball);
      playerSocket.emit('UPDATE SCORE', {
        playerScore: player.score,
        otherScore: otherPlayer.score,
      });
    }
  }
  playerSocket.emit('UPDATE', {
    ball: room.ball,
    paddle: playerPaddle,
    otherPaddle: otherPaddle,
  });
}
