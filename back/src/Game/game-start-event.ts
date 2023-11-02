import { Server, Socket } from 'socket.io';
import { GameData, INTERVAL, OTHERPADDLE, PADDLE, Paddle, Player, Room } from './types';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { interval } from 'rxjs';
import { GameInit } from './Game-Init';
import { GameUpdate } from './Game-Update';

@Injectable()
export class GameStartEvent {
  constructor(
    private prisma: PrismaService,
    private serviceInit: GameInit,
    private serviceUpdate: GameUpdate,
  ) {}
  async StartGameEvent(
    client: Socket,
    rooms: Map<string, Room>,
    activeSockets: Map<Socket, User>,
    server: Server,
  ) {
    try{
    let exist = false;
    const user_player = activeSockets.get(client);
    if (!user_player)
    {
      console.log('gamedeclined start event 28' );
      client.emit('GameDeclined');
      throw new Error('undefined user ');
    }
    const user = await this.prisma.user.findFirst({
      where: {
        id: user_player.id,
      },
    });
    if (user.status === 'InGame') {
      setTimeout(() => {
      console.log('gamedeclined start event 39' );
        client.emit('GameDeclined', 'you are already in an other game !!');
      }, 2000);

      return;
    } else {
      const user = activeSockets.get(client);
      const updatedUser = { ...user, status: 'InGame' };
      activeSockets.set(client, updatedUser );
      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          status: 'InGame',
        },
      });
    }
    const padd = new Paddle(PADDLE.x, PADDLE.y, PADDLE.width, PADDLE.height, PADDLE.dy);
    const otherpad = new Paddle(OTHERPADDLE.x, OTHERPADDLE.y, OTHERPADDLE.width, OTHERPADDLE.height, OTHERPADDLE.dy);
    for (const existRoom of rooms.values()) {
      if (existRoom.players.length === 1 && !existRoom.isinvit) {
        exist = true;
        const user = activeSockets.get(client);
        const player = new Player(
          2,
          user.id,
          client,
          padd,
          existRoom.roomName,
          0,
        );
        existRoom.players.push(player);
        client.join(existRoom.roomName);
        const gamedata: GameData = {
          playerpad: player.paddle,
          otherpad: otherpad,
          ball: existRoom.ball,
          playerScore: 0,
          otherScore: 0,
          rounds: existRoom.rounds,
          id: 2,
        };
        server.to(client.id).emit('JoinRoom', existRoom.roomName);
        server.to(client.id).emit('InitGame', gamedata);
        server.to(existRoom.roomName).emit('StartGame', existRoom.roomName);
        this.startGame(false, existRoom, client, rooms, activeSockets, server);
        break;
      }
    }

    if (!exist) {
      const room = new Room(Math.random().toString(36).substring(7));
      rooms.set(room.roomName, room);

      const user = activeSockets.get(client);
      const player = new Player(
        1,
        user.id,
        client,
        otherpad,
        room.roomName,
        0,
      );
      room.players.push(player);
      client.join(room.roomName);

      const gamedata: GameData = {
        playerpad: player.paddle,
        otherpad: padd,
        ball: room.ball,
        playerScore: 0,
        otherScore: 0,
        rounds: room.rounds,
        id: player.number,
      };
      // console.log('gamedata about to be sent');
      client.emit('JoinRoom', room.roomName);
      client.emit('InitGame', gamedata);
    }
  } catch(error)
    {
    return ;
  }
  }


  async StartGameEventRobot(
    client: Socket,
    rooms: Map<string, Room>,
    activeSockets: Map<Socket, User>,
    server: Server,
  ) {
    try
    {
    const user_player = activeSockets.get(client);
    if (!user_player) {
      console.log('gamedeclined start event 136' );
      client.emit('GameDeclined');
      throw new Error('undefined user ');
    }
    const user = await this.prisma.user.findUnique({
      where: {
        id: user_player.id,
      },
    });
    if (!user) throw new Error('undefined user ');
    if (user.status === 'InGame') {
      setTimeout(() => {
      console.log('gamedeclined start event 148' );
        client.emit('GameDeclined', 'you are already in an other game !!');
      }, 2000);

      return;
    } else {
      const user = activeSockets.get(client);
      const updatedUser = { ...user, status: 'InGame' };
      activeSockets.set(client, updatedUser);
      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          status: 'InGame',
        },
      });
    }
    const room = new Room(Math.random().toString(36).substring(7));
    const padd = new Paddle(PADDLE.x, PADDLE.y, PADDLE.width, PADDLE.height, PADDLE.dy);
    const otherpad = new Paddle(OTHERPADDLE.x, OTHERPADDLE.y, OTHERPADDLE.width, OTHERPADDLE.height, OTHERPADDLE.dy);
    rooms.set(room.roomName, room);
    const player = new Player(
      1,
      user.id,
      client,
      otherpad,
      room.roomName,
      0,
    );
    const robotUser = await this.prisma.user.findUnique({
      where: {
        username: 'ROBOT',
      },
    });
    const robot = new Player(2, robotUser.id, null, padd, room.roomName, 0);
    room.players.push(player);
    room.players.push(robot);
    client.join(room.roomName);
    const gamedata: GameData = {
      playerpad: player.paddle,
      otherpad: otherpad,
      ball: room.ball,
      playerScore: 0,
      otherScore: 0,
      rounds: room.rounds,
      id: player.number,
    };
    client.emit('JoinRoom', room.roomName);
    client.emit('InitGame', gamedata);
    server.to(room.roomName).emit('StartGame', room.roomName);
    this.startGame(true, room, client, rooms, activeSockets, server);
  } catch(error)
    {
    return ;

  }
  }

  async startGame(
    robot: boolean,
    room: Room,
    client: Socket,
    rooms: Map<string, Room>,
    activeSockets: Map<Socket, User>,
    server: Server,
  ) {
    this.serviceUpdate.OtherAvatar(client, room );
    if (!room.gameActive) {
      room.gameActive = true;
      const speed = INTERVAL;
      room.gameInterval = interval(speed).subscribe(() => {
        if (!room.gameActive) {
          cancelgamesart(room, rooms);

          return;
        }
        robot
          ? this.serviceUpdate.updateGamerobot(room, activeSockets, server)
          : this.serviceUpdate.updateGame(room, activeSockets, server);
      });
      this.serviceInit.createMatch(room);
    }
  }
}

export function cancelgamesart(room: Room, rooms: Map<string, Room>) {
  rooms.delete(room.roomName);
  room.gameActive = false;
  if (room.gameInterval) {
    room.gameInterval.unsubscribe();
  }
}
