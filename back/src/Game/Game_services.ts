import { INCREASE_SPEED, Room, SPEED_INTERVAL } from './types';
import { colision } from './movments';
import { PrismaService } from 'src/prisma/prisma.service';
import { Socket } from 'socket.io';
import { Prisma, User } from '@prisma/client';
import { calculateRank } from './Game-Update';

export async function stopGame(
  room: Room,
  activeSockets: Map<Socket, User>,
  prisma: PrismaService,
) {
  console.log('stopGame');
  const player = room.players[0];
  const otherPlayer = room.players[1];
  const playerSocket = player.socket;
  const otherPlayerSocket = otherPlayer.socket;
  const playerUser = activeSockets.get(playerSocket);
  const otherPlayerUser = activeSockets.get(otherPlayerSocket);
  if (!playerUser || !otherPlayerUser) {
    console.log('user not found');
    return;
  }
  if (room.gameInterval) {
    room.gameInterval.unsubscribe();
  }
  room.gameActive = false;
  console.log('stopina lgame ghayerha ');
  calculateRank(prisma);
  // rooms.delete(room.roomName);
}

export async function updateGame(
  room: Room,
  rooms: Map<string, Room>,
  activeSockets: Map<Socket, User>,
  prisma: PrismaService,
  containerHeight: number,
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
    room.ball.y + room.ball.radius > containerHeight
  ) {
    // Reverse the vertical velocity of the ball
    room.ball.dy *= -1;
  }
  colision(room, rooms, activeSockets, prisma);
}

export async function getclient(
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
