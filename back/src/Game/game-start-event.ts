import { Server, Socket } from 'socket.io';
import { GameData, INTERVAL, OTHERPADDLE, PADDLE, Player, Room } from './types';
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
    const user_player = activeSockets.get(client);
    if (!user_player) throw new Error('undefined user ');
    const user = await this.prisma.user.findFirst({
      where: {
        id: user_player.id,
      },
    });
    if (user.status === 'InGame') {
      setTimeout(() => {
        client.emit('InvitationDeclined', 'you are already in an other game !!');
        activeSockets.delete(client)
      }, 2000);

      return;
    } else {
      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          status: 'InGame',
        },
      });
    }
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
      // console.log('gamedata about to be sent');
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
    try
    {
    const user_player = activeSockets.get(client);
    if (!user_player) throw new Error('undefined user ');
    const user = await this.prisma.user.findUnique({
      where: {
        id: user_player.id,
      },
    });
    if (!user) throw new Error('undefined user ');
    if (user.status === 'InGame') {
      setTimeout(() => {
        client.emit('InvitationDeclined', 'you are already in an other game !!');
        // activeSockets.delete(client);
      }, 2000);

      return;
    } else {
      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          status: 'InGame',
        },
      });
    }
    console.log('status changed to ingame ')
    const room = new Room(Math.random().toString(36).substring(7));
    rooms.set(room.roomName, room);
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
    console.log(user.username, 'startting game at ', room.roomName)
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
