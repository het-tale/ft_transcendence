import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as argon from 'argon2';
import { TSignupData, TSigninData } from 'src/auth/dto';
import { ConfirmationService } from 'src/confirmation/confirmation.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private conf: ConfigService,
    private confirmationService: ConfirmationService,
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
      this.confirmationService.sendConfirmationEmail(newUser.email);
      const token = await this.getJwtToken(
        newUser.id,
        newUser.username,
        newUser.email,
      );
      const obj = {
        token,
        message: 'check your email to confirm your account',
      };

      return obj;
    } catch (error) {
      console.log(error);

      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new HttpException(
            'duplicate unique data',
            HttpStatus.FORBIDDEN,
          );
      }

      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async confirm_register(token: string) {
    const email = await this.confirmationService.confirmEmail(token);
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user.IsEmailConfirmed) {
      throw new ForbiddenException('email already confirmed');
    }
    await this.prisma.user.update({
      where: { email },
      data: { IsEmailConfirmed: true },
    });
    const jwt = await this.getJwtToken(user.id, user.username, user.email);

    return jwt;
  }

  async resend_email(usery) {
    const user = await this.prisma.user.findUnique({ where: { id: usery.id } });
    if (user.IsEmailConfirmed) {
      throw new ForbiddenException('email already confirmed');
    }
    this.confirmationService.sendConfirmationEmail(user.email);
  }

  async signin(dto: TSigninData) {
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
      throw new HttpException('user not found', HttpStatus.NOT_FOUND);
    }

    const cmp = await argon.verify(user.hash, dto.password);

    if (!cmp) {
      throw new HttpException('wrong password', HttpStatus.FORBIDDEN);
    }
    const token = await this.getJwtToken(user.id, user.username, user.email);

    return token;
  }
  //TODO: add jwt refresh token
  getJwtToken(id: number, username: string, email: string): Promise<string> {
    const payload = {
      sub: id,
      username,
      email,
    };

    return this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: this.conf.get('ACCESS_TOKEN_JWT_SECRET'),
    });
  }
}
