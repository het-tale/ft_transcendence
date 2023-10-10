import { Socket } from 'socket.io';
import { INCREASE_SPEED, Room, SPEED_INTERVAL } from './types';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { colisionrobot } from './robotmouvments';
import { use } from 'passport';

export async function updateGamerobot(
  room: Room,
  rooms: Map<string, Room>,
  activeSockets: Map<Socket, User>,
  prisma: PrismaService,
  containerHeight: number,
) {
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
    room.ball.y + room.ball.radius >= containerHeight
  ) {
    // Reverse the vertical velocity of the ball
    room.ball.dy *= -1;
  }
  const robotpaddle = room.players[1].paddle;

  const paddleCenterY = robotpaddle.y + robotpaddle.height / 2;
  const ballY = room.ball.y;
  const yDifference = ballY - paddleCenterY;
  room.players[1].paddle.y +=
    yDifference > 0 ? robotpaddle.dy : -robotpaddle.dy;
  const maxY = containerHeight - room.players[1].paddle.height;
  if (room.players[1].paddle.y < 0) {
    room.players[1].paddle.y = 0;
  } else if (room.players[1].paddle.y > maxY) {
    room.players[1].paddle.y = maxY;
  }
  colisionrobot(room, rooms, activeSockets, prisma);
}

export async function UpdatePaddle(
  client: Socket,
  eventData: any,
  rooms: Map<string, Room>,
  containerHeight: number,
) {
  const room = findRoomByPlayerSocket(client, rooms);

  if (room) {
    const player = room.players.find((p) => p.socket === client);

    if (player) {
      const relativeMouseYPercentage = eventData.relativeMouseY;
      player.paddle.y = (relativeMouseYPercentage / 100) * containerHeight;
    }
  }
}

export async function OtherAvatar(
  client: Socket,
  rooms: Map<string, Room>,
  activeSockets: Map<Socket, User>,
) {
  const room = findRoomByPlayerSocket(client, rooms);
  if (room) {
    const player = room.players.find((p) => p.socket === client);
    const otherPlayer = room.players.find((player) => player.socket !== client);
    const user = activeSockets.get(player.socket);
    const otherUser = activeSockets.get(otherPlayer.socket);

    if (player.socket) {
      otherPlayer.socket.emit('OTHER AVATAR', user.avatar, user.username);
    }
    if (otherPlayer.socket) {
      player.socket.emit('OTHER AVATAR', otherUser.avatar, otherUser.username);
    }
  }
}

export function findRoomByPlayerSocket(
  socket: Socket,
  rooms: Map<string, Room>,
) {
  for (const room of rooms.values()) {
    const playerInRoom = room.players.find(
      (player) => player.socket === socket,
    );
    if (playerInRoom) {
      return room;
    }
  }

  return undefined;
}
