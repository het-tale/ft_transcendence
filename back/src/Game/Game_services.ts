import { interval } from 'rxjs';
import { INCREASE_SPEED, INTERVAL, Paddle, Player, Room, SPEED_INTERVAL } from './types';
import { colision } from './colision';
import { PrismaService } from 'src/prisma/prisma.service';
import { Socket } from 'socket.io';
import { User } from '@prisma/client';

export async function createMatch(room: Room, prisma: PrismaService, activeSockets: Map<Socket, User>) {
  try {
    const match = await prisma.match
      .create({
        data: {
          start: new Date(),
          result: 'ongoing',
		  playerAId: activeSockets.get(room.players[0].socket).id,
		  playerBId: activeSockets.get(room.players[1].socket).id,
        },
      })
      .then((match) => {
        console.log(`Created match with ID: ${match.id}`);
        room.id = match.id;
      })
      .catch((error) => {
        console.error('Error creating match:', error);
      });
  } catch (e) {
    console.log(e);
  }
}

export async function startGame(room: Room, rooms: Map<string, Room>, activeSockets: Map<Socket, User> ,  prisma: PrismaService, containerHeight: number) {
  console.log('startGame');
  if (!room.gameActive) {
    room.gameActive = true;
    room.gameInterval = interval(INTERVAL).subscribe(() => {
      if (!room.gameActive) {
		stopGame(room, rooms);

        return;
      }
      updateGame(room, activeSockets, prisma, containerHeight);
    });
    createMatch(room, prisma, activeSockets);
  }
}

export async function stopGame(room: Room, rooms: Map<string, Room>) {
  console.log('stopGame');
  //dell room from map
  rooms.delete(room.roomName);
  room.gameActive = false;
  if (room.gameInterval) {
    room.gameInterval.unsubscribe();
  }
}

export async function updateGame(room: Room, activeSockets: Map<Socket, User>, prisma: PrismaService, containerHeight: number) {
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
  colision(room, activeSockets, prisma);
}

export async function is_playing(client: Socket, user:User, activeSockets: Map<Socket, User>) {

  return (activeSockets.get(client) === user)
}