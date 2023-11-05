import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { Room } from './types';
import { Socket } from 'socket.io';

@Injectable()
export class GameInit {
  constructor(
    private prisma: PrismaService,
    private conf: ConfigService,
    private jwt: JwtService,
  ) {}

  async verifyToken(token: string | string[]) {
    if (token instanceof Array) {
      throw new HttpException('invalid token', 400);
    }
    const payload = await this.jwt.verify(token, {
      secret: this.conf.get('ACCESS_TOKEN_JWT_SECRET'),
    });
    const user = await this.prisma.user.findUnique({
      where: {
        email: payload.email,
      },
    });
    if (!user) {
      throw new HttpException('user not found', 404);
    }

    return user;
  }
  async createMatch(room: Room) {
    try {
      const playerid = room.players[0].id;
      const playerid2 = room.players[1].id;
      await this.prisma.match
        .create({
          data: {
            start: new Date(),
            playerAId: playerid,
            playerBId: playerid2,
          },
        })
        .then((match) => {
          room.id = match.id;
        })
        .catch((error) => {
          console.error('Error creating match:', error);
        });
      await this.prisma.user.update({
        where: { id: playerid },
        data: {
          matchnumber: {
            increment: 1,
          },
        },
      });
      await this.prisma.user.update({
        where: { id: playerid2 },
        data: {
          matchnumber: {
            increment: 1,
          },
        },
      });
    } catch (e) {
      //console.log(e);
    }
  }

  findRoomByPlayerSocket(socket: Socket, rooms: Map<string, Room>) {
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
}
