import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as argon from 'argon2';
import { TSignupData, TSigninData } from 'src/auth/dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private conf: ConfigService,
  ) {}
  async signup(dto: TSignupData) {
    try {
      const hash = await argon.hash(dto.password);

      const newUser = await this.prisma.user.create({
        data: {
          email: dto.email,
          username: dto.username,
          hash,
        },
      });

      return this.getJwtToken(newUser.id, newUser.username, newUser.email);
    } catch (error) {
      console.log(error);

      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          return new ForbiddenException('duplicate unique data');
      }

      return error;
    }
  }

  async signin(dto: TSigninData) {
    try {
      const where: Prisma.UserWhereUniqueInput =
        'email' in dto
          ? {
              email: dto.email,
            }
          : { username: dto.username };

      const user = await this.prisma.user.findUnique({
        where,
      });
      console.log(user);
      if (!user) {
        throw new ForbiddenException('incorrect credentiels');
      }

      const cmp = await argon.verify(user.hash, dto.password);

      if (!cmp) {
        throw new ForbiddenException('wrong password');
      }

      const token = await this.getJwtToken(user.id, user.username, user.email);

      return token;
    } catch (error) {
      return error;
    }
  }

  getJwtToken(id: number, username: string, email: string): Promise<string> {
    const payload = {
      sub: id,
      username,
      email,
    };

    return this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: this.conf.get('SECRET'),
    });
  }
}
