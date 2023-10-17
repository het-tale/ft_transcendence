import { HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { Room } from './types';

export async function verifyToken(
  token: string | string[],
  prisma: PrismaService,
  conf: ConfigService,
  jwt: JwtService,
) {
  if (token instanceof Array) {
    throw new HttpException('invalid token', 400);
  }
  const payload = await jwt.verify(token, {
    secret: conf.get('ACCESS_TOKEN_JWT_SECRET'),
  });
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });
  if (!user) {
    throw new HttpException('user not found', 404);
  }

  return user;
}
export async function createMatch(
  room: Room,
  prisma: PrismaService,
) {
  try {
    const playerid = room.players[0].id;
    const playerid2 = room.players[1].id;
    await prisma.match
      .create({
        data: {
          start: new Date(),
          playerAId: playerid,
          playerBId: playerid2,
        },
      })
      .then((match) => {
        console.log(`Created match with ID: ${match.id}`);
        room.id = match.id;
      })
      .catch((error) => {
        console.error('Error creating match:', error);
      });
    await prisma.user.update({
      where: { id: playerid},
      data: {
        matchnumber: {
          increment: 1,
        },
      },
    });
    await prisma.user.update({
      where: { id: playerid2 },
      data: {
        matchnumber: {
          increment: 1,
        },
      },
    });
  } catch (e) {
    console.log(e);
  }
}

