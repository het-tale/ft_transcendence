import { Server, Socket } from 'socket.io';
import { GameData, Paddle, Player, Room } from './types';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { startGame, startGamerobot } from './start-game';

export async function StartGameEvent(
  client: Socket,
  containerHeight: number,
  containerWidth: number,
  rooms: Map<string, Room>,
  activeSockets: Map<Socket, User>,
  prisma: PrismaService,
  server: Server,
) {
  let exist = false;
  const padd = new Paddle(
    (containerWidth * 2) / 100,
    containerHeight / 2,
    8,
    containerHeight * 0.15,
    3,
  );
  const otherpadd = new Paddle(
    containerWidth - (containerWidth * 2) / 100,
    containerHeight / 2,
    8,
    containerHeight * 0.15,
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
      const user = activeSockets.get(client);
      const player = new Player(2, user.id, client, padd, existRoom.roomName, 0);
      existRoom.players.push(player);
      client.join(existRoom.roomName);
      const gamedata: GameData = {
        playerpad: player.paddle,
        otherpad: otherpadd,
        ball: existRoom.ball,
        playerScore: 0,
        otherScore: 0,
        rounds: existRoom.rounds,
        containerHeight: containerHeight,
        containerWidth: containerWidth,
        id: 2,
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

    //find the user id by activ socket
    const user = activeSockets.get(client);
    const player = new Player(1, user.id, client, otherpadd, room.roomName, 0);
    room.players.push(player);
    client.join(room.roomName);

    const gamedata: GameData = {
      playerpad: player.paddle,
      otherpad: padd,
      ball: room.ball,
      playerScore: 0,
      otherScore: 0,
      rounds: room.rounds,
      containerHeight: containerHeight,
      containerWidth: containerWidth,
      id: player.number,
    };
    client.emit('JoinRoom', room.roomName);
    client.emit('InitGame', gamedata);
  }
}

export async function StartGameEventRobot(
  client: Socket,
  rooms: Map<string, Room>,
  activeSockets: Map<Socket, User>,
  prisma: PrismaService,
  server: Server,
  containerHeight: number,
  containerWidth: number,
) {
  // the same as StartGameEvent but with a robot as second player
  const padd = new Paddle(containerWidth * 0.02, containerHeight / 2, 8, containerHeight * 0.15, 3);
  const otherpadd = new Paddle(
    containerWidth - containerWidth * 0.02,
    containerHeight / 2,
    8,
    containerHeight * 0.15,
    3,
  );
  const room = new Room(Math.random().toString(36).substring(7));
  rooms.set(room.roomName, room);
  console.log('new room created with name ', room.roomName);
  const user = activeSockets.get(client);
  const player = new Player(1, user.id, client, otherpadd, room.roomName, 0);
  const robotUser = await prisma.user.findUnique({
    where: {
      username: 'ROBOT',
    },
  });
  const robot = new Player(2, robotUser.id, client, padd, room.roomName, 0);
  room.players.push(player);
  room.players.push(robot);
  client.join(room.roomName);
  const gamedata: GameData = {
    playerpad: player.paddle,
    otherpad: padd,
    ball: room.ball,
    playerScore: 0,
    otherScore: 0,
    rounds: room.rounds,
    containerHeight: containerHeight,
    containerWidth: containerWidth,
    id: player.number,
  };
  client.emit('JoinRoom', room.roomName);
  client.emit('InitGame', gamedata);
  server.to(room.roomName).emit('StartGame', room.roomName);
  startGamerobot(
    robotUser,
    room,
    rooms,
    activeSockets,
    prisma,
    containerHeight,
  );
}
