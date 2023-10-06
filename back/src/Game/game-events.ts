import { Server, Socket } from 'socket.io';
import { cancelgamesart, createMatch, startGame, stopGame, updateGame } from './Game_services';
import { GameData, INCREASE_SPEED, INTERVAL, Paddle, Player, Room, SPEED_INTERVAL } from './types';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { async, interval } from 'rxjs';
import e from 'express';
import { intersections, resetBall } from './colision';

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
    80,
    3,
  );
  const otherpadd = new Paddle(
    containerWidth - (containerWidth * 2) / 100,
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
      const playerId = activeSockets.get(client).id;
      const player = new Player(playerId, client, padd, existRoom.roomName, 0);
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
    const PlayerId = user.id;
    const player = new Player(PlayerId, client, otherpadd, room.roomName, 0);
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
      id: 1,
    };
    client.emit('JoinRoom', room.roomName);
    client.emit('InitGame', gamedata);
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
	  const avatar = user.avatar;
	  const otherAvatar = otherUser.avatar;
  
	  if (player.socket) {
		otherPlayer.socket.emit('OTHER AVATAR', avatar);
	  }
	  if (otherPlayer.socket) {
		player.socket.emit('OTHER AVATAR', otherAvatar);
	  }
	}
  }

//   export async function OtherAvatarrobot(
// 	client: Socket,
// 	rooms: Map<string, Room>,
// 	activeSockets: Map<Socket, User>,
//   ) {
// 	const room = findRoomByPlayerSocket(client, rooms);
// 	if (room) {
// 	  const player = room.players.find((p) => p.socket === client);
// 	  const otherPlayer = room.players.find((player) => player.socket !== client);
// 	  const user = activeSockets.get(player.socket);
// 	  const otherUser = activeSockets.get(otherPlayer.socket);
// 	  const avatar = user.avatar;
// 	  const otherAvatar = otherUser.avatar;
  
// 	  if (player.socket) {
// 		otherPlayer.socket.emit('OTHER AVATAR', avatar);
// 	  }
// 	  if (otherPlayer.socket) {
// 		player.socket.emit('OTHER AVATAR', otherAvatar);
// 	  }
// 	}
//   }



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
  const padd = new Paddle(10, containerHeight / 2, 8, 80, 3);
  const otherpadd = new Paddle(
	containerWidth - 10,
	containerHeight / 2,
	8,
	80,
	3,
  );
  const room = new Room(Math.random().toString(36).substring(7));
  rooms.set(room.roomName, room);
  console.log('new room created with name ', room.roomName);
  const playerNumber = activeSockets.get(client).id;
  const player = new Player(playerNumber, client, otherpadd, room.roomName, 0);
  const robot = new Player(1, client, padd, room.roomName, 0);
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
	id: playerNumber,
  };
  client.emit('JoinRoom', room.roomName);
  client.emit('InitGame', gamedata);
  server.to(room.roomName).emit('StartGame', room.roomName);
  startGamerobot(room, rooms, activeSockets, prisma, containerHeight);
}

async function startGamerobot(
  room: Room,
  rooms: Map<string, Room>,
  activeSockets: Map<Socket, User>,
  prisma: PrismaService,
  containerHeight: number,
) {
  console.log('startGame');
//   OtherAvatarrobot(room.players[0].socket, rooms, activeSockets);
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

export function cancelgamesartrobot(room: Room, rooms: Map<string, Room>) {
  console.log('cancelgamesart');
  //dell room from map
  rooms.delete(room.roomName);
  room.gameActive = false;
  if (room.gameInterval) {
	room.gameInterval.unsubscribe();
  }
}

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
	  room.players[1].paddle.y += yDifference > 0 ? robotpaddle.dy : -robotpaddle.dy;
	  const maxY = containerHeight - room.players[1].paddle.height;
	  if (room.players[1].paddle.y < 0) {
		room.players[1].paddle.y = 0;
	  } else if (room.players[1].paddle.y > maxY) {
		room.players[1].paddle.y = maxY;
	  }
	  colisionrobot(room, rooms, activeSockets, prisma);
	}


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
	  stopGame(room, rooms, activeSockets, prisma);
	}
	else {
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
