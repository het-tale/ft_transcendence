import { Server, Socket } from 'socket.io';
import { GameData, INTERVAL, OTHERPADDLE, PADDLE, Player, Room, SPEED_INTERVAL } from './types';
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
    let exist = false;
    for (const existRoom of rooms.values()) {
      if (existRoom.players.length === 1 && !existRoom.isinvit) {
        exist = true;
        const user = activeSockets.get(client);
        const player = new Player(
          2,
          user.id,
          client,
          PADDLE,
          existRoom.roomName,
          0,
        );
        existRoom.players.push(player);
        client.join(existRoom.roomName);
        const gamedata: GameData = {
          playerpad: player.paddle,
          otherpad: OTHERPADDLE,
          ball: existRoom.ball,
          playerScore: 0,
          otherScore: 0,
          rounds: existRoom.rounds,
          id: 2,
        };
        client.emit('JoinRoom', existRoom.roomName);
        client.emit('InitGame', gamedata);
        server.to(existRoom.roomName).emit('StartGame', existRoom.roomName);
        this.startGame(false, existRoom, client, rooms, activeSockets);
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
        OTHERPADDLE,
        room.roomName,
        0,
      );
      room.players.push(player);
      client.join(room.roomName);

      const gamedata: GameData = {
        playerpad: player.paddle,
        otherpad: PADDLE,
        ball: room.ball,
        playerScore: 0,
        otherScore: 0,
        rounds: room.rounds,
        id: player.number,
      };
      client.emit('JoinRoom', room.roomName);
      client.emit('InitGame', gamedata);
    }
  }

  async StartGameEventRobot(
    client: Socket,
    rooms: Map<string, Room>,
    activeSockets: Map<Socket, User>,
    server: Server,
  ) {
    const room = new Room(Math.random().toString(36).substring(7));
    rooms.set(room.roomName, room);
    const user = activeSockets.get(client);
    const player = new Player(
      1,
      user.id,
      client,
      OTHERPADDLE,
      room.roomName,
      0,
    );
    const robotUser = await this.prisma.user.findUnique({
      where: {
        username: 'ROBOT',
      },
    });
    const robot = new Player(2, robotUser.id, null, PADDLE, room.roomName, 0);
    room.players.push(player);
    room.players.push(robot);
    client.join(room.roomName);
    const gamedata: GameData = {
      playerpad: player.paddle,
      otherpad: OTHERPADDLE,
      ball: room.ball,
      playerScore: 0,
      otherScore: 0,
      rounds: room.rounds,
      id: player.number,
    };
    client.emit('JoinRoom', room.roomName);
    client.emit('InitGame', gamedata);
    server.to(room.roomName).emit('StartGame', room.roomName);
    this.startGame(true, room, client, rooms, activeSockets);
  }

  async startGame(
    robot: boolean,
    room: Room,
    client: Socket,
    rooms: Map<string, Room>,
    activeSockets: Map<Socket, User>,
  ) {
    this.serviceUpdate.OtherAvatar(client, room, activeSockets);
    if (!room.gameActive) {
      room.gameActive = true;
      let speed = INTERVAL;
      room.gameInterval = interval(speed).subscribe(() => {
        if (!room.gameActive) {
          cancelgamesart(room, rooms);

          return;
        }
        robot
          ? this.serviceUpdate.updateGamerobot(room, activeSockets)
          : this.serviceUpdate.updateGame(room, activeSockets);
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
