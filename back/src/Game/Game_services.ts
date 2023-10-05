import { interval } from 'rxjs';
import { INCREASE_SPEED, INTERVAL, Room, SPEED_INTERVAL } from './types';
import { colision } from './colision';
import { PrismaService } from 'src/prisma/prisma.service';
import { Socket } from 'socket.io';
import { User } from '@prisma/client';
import { OtherAvatar } from './game-events';

export async function createMatch(
  room: Room,
  prisma: PrismaService,
  activeSockets: Map<Socket, User>,
) {
  try {
    await prisma.match
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

export async function startGame(
  room: Room,
  rooms: Map<string, Room>,
  activeSockets: Map<Socket, User>,
  prisma: PrismaService,
  containerHeight: number,
) {
  console.log('startGame');
  OtherAvatar(room.players[0].socket, rooms, activeSockets);
  if (!room.gameActive) {
    room.gameActive = true;
    room.gameInterval = interval(INTERVAL).subscribe(() => {
      if (!room.gameActive) {
        cancelgamesart(room, rooms);

        return;
      }
      updateGame(room,rooms, activeSockets, prisma, containerHeight);
    });
    createMatch(room, prisma, activeSockets);
  }
}


export function cancelgamesart(room: Room, rooms: Map<string, Room>) {
  console.log('cancelgamesart');
  //dell room from map
  rooms.delete(room.roomName);
  room.gameActive = false;
  if (room.gameInterval) {
	room.gameInterval.unsubscribe();
  }
}

export async function stopGame(room: Room, rooms: Map<string, Room>, activeSockets: Map<Socket, User>, prisma: PrismaService) {
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
	
	prisma.user.update({
		where: {
			id: playerUser.id,
		},
		data: {
			status: 'online',
		},
	});
	prisma.user.update({
		where: {
			id: otherPlayerUser.id,
		},
		data: {
			status: 'online',
		},
	});
	console.log('users updated status', playerUser, otherPlayerUser);
	if (room.gameInterval) {
		room.gameInterval.unsubscribe();
	  }
	room.gameActive = false;
	rooms.delete(room.roomName);
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

export async function getclient(client: Socket, activeSockets: Map<Socket, User>) {
  const user = activeSockets.get(client);
  if (!user) {
	console.log('user not found');
	return;
  }
  return user;

}
