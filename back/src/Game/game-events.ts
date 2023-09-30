import { Server, Socket } from 'socket.io';
import { startGame } from './Game_services';
import { GameData, Paddle, Player, Room } from './types';
import { PrismaService } from 'src/prisma/prisma.service';

export async function StartGameEvent(
  client: Socket,
  containerHeight: number,
  containerWidth: number,
  rooms: Map<string, Room>,
  activeSockets: Map<string, Socket>,
  prisma: PrismaService,
  server: Server,
) {
  let exist = false;
  const padd = new Paddle(10, containerHeight / 2, 8, 80, 3);
  const otherpadd = new Paddle(
    containerWidth - 10,
    containerHeight / 2,
    8,
    80,
    3,
  );

  for (const existRoom of rooms.values()) {
    console.log(
      'at room ',
      existRoom.roomName,
      ' players ',
      existRoom.players.length,
    );
    if (existRoom.players.length === 1) {
      exist = true;
      const playerNumber = existRoom.players.length + 1;
      const player = new Player(
        playerNumber,
        client.id,
        padd,
        existRoom.roomName,
        0,
      );
      existRoom.players.push(player);
      client.join(existRoom.roomName);
      const gamedata: GameData = {
        playerpad: player.paddle,
        otherpad: playerNumber === 1 ? otherpadd : padd,
        ball: existRoom.ball,
        playerScore: 0,
        otherScore: 0,
        rounds: existRoom.rounds,
        containerHeight: containerHeight,
        containerWidth: containerWidth,
        id: playerNumber,
      };
      client.emit('JoinRoom', existRoom.roomName);
      client.emit('InitGame', gamedata);
      server.to(existRoom.roomName).emit('StartGame', existRoom.roomName);
      startGame(existRoom, rooms, activeSockets, prisma, containerHeight);
      break;
    }
  }

  if (!exist) {
    const room = new Room(Math.random().toString(36).substring(7));
    rooms.set(room.roomName, room);
    console.log('new room created with name ', room.roomName);
    const playerNumber = room.players.length + 1;
    const player = new Player(
      playerNumber,
      client.id,
      otherpadd,
      room.roomName,
      0,
    );
    room.players.push(player);
    client.join(room.roomName);

    const gamedata: GameData = {
      playerpad: player.paddle,
      otherpad: playerNumber === 1 ? otherpadd : padd,
      ball: room.ball,
      playerScore: 0,
      otherScore: 0,
      rounds: room.rounds,
      containerHeight: containerHeight,
      containerWidth: containerWidth,
      id: playerNumber,
    };
    client.emit('JoinRoom', room.roomName);
    client.emit('InitGame', gamedata);
  }
}

export function findRoomByPlayerSocket(socket: Socket, rooms: Map<string, Room>) {
  for (const room of rooms.values()) {
    const playerInRoom = room.players.find(
      (player) => player.socket_id === socket.id,
    );
    if (playerInRoom) {
      return room;
    }
  }
  return undefined;
}

export async function UpdatePaddle(
  client: Socket,
  eventData: any,
  rooms: Map<string, Room>,
  containerHeight: number
) {
  const room = findRoomByPlayerSocket(client, rooms);

  if (room) {
    const player = room.players.find((p) => p.socket_id === client.id);

    if (player) {
      // Receive relative mouse position and container height from the client
      const relativeMouseYPercentage = eventData.relativeMouseY;
      // Calculate the new paddle position based on the received data
      player.paddle.y = (relativeMouseYPercentage / 100) * containerHeight;
    }
  }
}

export async function OtherAvatar(client: Socket, data: any, rooms: Map<string, Room>, activeSockets: Map<string, Socket>){
	const room = findRoomByPlayerSocket(client, rooms);
    if (room) {
      const otherPlayer = room.players.find(
        (player) => player.socket_id !== client.id,
      );
      const otherSocket = activeSockets.get(otherPlayer.socket_id);
      if (otherSocket) {
        otherSocket.emit('OTHER AVATAR', data);
      }
    }
}
