import { User } from '@prisma/client';
import { INTERVAL, Room } from './types';
import { Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { interval } from 'rxjs';
import { OtherAvatar, updateGamerobot } from './Game-Update';
import { updateGame } from './Game_services';

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
      updateGame(room, rooms, activeSockets, prisma, containerHeight);
    });
    createMatch(room, prisma, activeSockets);
  }
}

export async function startGamerobot(
  robotUser: User,
  room: Room,
  rooms: Map<string, Room>,
  activeSockets: Map<Socket, User>,
  prisma: PrismaService,
  containerHeight: number,
) {
  console.log('startGame');
  room.players[0].socket.emit('OTHER AVATAR', robotUser.avatar);
  if (!room.gameActive) {
    room.gameActive = true;
    room.gameInterval = interval(INTERVAL).subscribe(() => {
      if (!room.gameActive) {
        cancelgamesartrobot(room, rooms);
        return;
      }
      updateGamerobot(room, rooms, activeSockets, prisma, containerHeight);
    });
    createMatchrobot(room, prisma, activeSockets);
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

export function cancelgamesartrobot(room: Room, rooms: Map<string, Room>) {
  console.log('cancelgamesart');
  //dell room from map
  rooms.delete(room.roomName);
  room.gameActive = false;
  if (room.gameInterval) {
    room.gameInterval.unsubscribe();
  }
}

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

export async function createMatchrobot(
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
          playerBId: 1,
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
