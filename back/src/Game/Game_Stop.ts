import { Room } from './types';
import { Socket } from 'socket.io';
import { User } from '@prisma/client';

export async function stopGame(
  room: Room,
  activeSockets: Map<Socket, User>,
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
  if (room.gameActive) {
    room.gameActive = false;
    room.gameInterval.unsubscribe();
    playerSocket?.leave(room.roomName);
    otherPlayerSocket?.leave(room.roomName);
  }
  console.log('stopina lgame ghayerha ');
  // rooms.delete(room.roomName);
}


