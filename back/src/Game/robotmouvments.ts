import { User } from '@prisma/client';
import { CONTAINERWIDTH, Room } from './types';
import { Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { dataupdatetostop, intersections, resetBall } from './movments';

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
  if (room.ball.x + room.ball.radius >= CONTAINERWIDTH) {
    console.log('end game 1', room.ball.x, room.ball.dx, playerPaddle.x);
    player.score++;
    room.rounds--;
    if (room.rounds === 0) dataupdatetostop(player, otherPlayer, room, activeSockets, prisma);
    else resetBall(room.ball, player, otherPlayer);
  }
  if (room.ball.x - room.ball.radius <= 0) {
    console.log('end game 1', room.ball.x, playerPaddle.x);
    otherPlayer.score++;
    room.rounds--;
    if (room.rounds === 0) dataupdatetostop(player, otherPlayer, room, activeSockets, prisma);
    else resetBall(room.ball, player, otherPlayer);
  }
  playerSocket.emit('UPDATE', {
    ball: room.ball,
    paddle: playerPaddle,
    otherPaddle: otherPaddle,
  });
}
