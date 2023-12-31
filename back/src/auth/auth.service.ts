import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as argon from 'argon2';
import {
  TSignupData,
  TSigninData,
  TSetPasswordData,
  TforgetPasswordData,
} from 'src/dto';
import { ConfirmationService } from 'src/confirmation/confirmation.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateRandomAvatar } from 'src/utils/generate-random-avatar';
import { User } from '@prisma/client';
import { GameUpdate } from 'src/Game/Game-Update';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private conf: ConfigService,
    private confirmationService: ConfirmationService,
    private gameService: GameUpdate,
  ) {}
  async signup(dto: TSignupData) {
    try {
      const hash = await argon.hash(dto.password);
      const avatar = generateRandomAvatar(this.conf);
      const newUser = await this.prisma.user.create({
        data: {
          email: dto.email,
          username: dto.username,
          hash,
          avatar,
        },
      });
      await this.confirmationService.sendConfirmationEmail(
        newUser.email,
        'Confirm your email',
      );
      const token = await this.getJwtToken(newUser.id, newUser.email);
      const obj = {
        token,
        message: 'check your email to confirm your account',
      };

      return obj;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const field: string = error.meta?.target[0] ?? '';
          throw new HttpException(
            `this ${field} is already taken`,
            HttpStatus.FORBIDDEN,
          );
        }
      }

      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
  async confirmRegister(token: string) {
    const email = await this.confirmationService.confirmEmail(token);
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user.isEmailConfirmed) {
      throw new ForbiddenException('email already confirmed');
    }
    await this.prisma.user.update({
      where: { email },
      data: { isEmailConfirmed: true },
    });
    const jwt = await this.getJwtToken(user.id, user.email);

    return jwt;
  }
  async resendEmail(user: User) {
    if (user.isEmailConfirmed) {
      throw new ForbiddenException('email already confirmed');
    }
    this.confirmationService.sendConfirmationEmail(
      user.email,
      'Confirm your email',
    );
  }

  async signin(dto: TSigninData) {
    //if identifier is email then search by email else search by username
    const user =
      (await this.prisma.user.findUnique({
        where: {
          email: dto.identifier,
        },
      })) ||
      (await this.prisma.user.findUnique({
        where: {
          username: dto.identifier,
        },
      }));

    if (!user) {
      throw new HttpException('user not found', HttpStatus.NOT_FOUND);
    }
    if (user.hash === null)
      throw new HttpException(
        'user has no password please signin with intra and set a new one',
        HttpStatus.FORBIDDEN,
      );
    const cmp = await argon.verify(user.hash, dto.password);

    if (!cmp) {
      throw new HttpException('wrong password', HttpStatus.FORBIDDEN);
    }
    const token = await this.getJwtToken(user.id, user.email);
    await this.prisma.user.update({
      where: { email: user.email },
      data: {
        is2FaVerified: false,
      },
    });

    return token;
  }
  async signin42(user: User) {
    const token = await this.getJwtToken(user.id, user.email);

    return token;
  }

  async updatePassword(dto: TSetPasswordData, email: string) {
    const hash = await argon.hash(dto.password);
    await this.prisma.user.update({
      where: { email },
      data: {
        hash,
      },
    });
  }
  getJwtToken(id: number, email: string): Promise<string> {
    const payload = {
      sub: id,
      email,
    };

    return this.jwt.signAsync(payload, {
      expiresIn: '50m',
      secret: this.conf.get('ACCESS_TOKEN_JWT_SECRET'),
    });
  }

  async forgetPassword(dto: TforgetPasswordData) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) throw new HttpException('user not found', HttpStatus.NOT_FOUND);
    await this.confirmationService.sendConfirmationEmail(
      dto.email,
      'Set New Password',
    );

    return 'check your email to set new password';
  }
  async confirmChangePassword(token: string, dto: TSetPasswordData) {
    const email = await this.confirmationService.confirmEmail(token);
    await this.updatePassword(dto, email);
  }
  async getUser(userId: number) {
    await this.gameService.calculateRank();
    const myUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        login: true,
        status: true,

        g_rank: true,
        lp: true,
        win_rate: true,
        matchwin: true,
        matchlose: true,

        isEmailConfirmed: true,
        isPasswordRequired: true,

        is2FaVerified: true,
        is2FaEnabled: true,

        blocked: {
          select: {
            id: true,
            username: true,
            avatar: true,
            status: true,
          },
        },
        sentFriendRequests: true,
      },
    });
    if (!myUser)
      throw new HttpException('user not found', HttpStatus.NOT_FOUND);

    return myUser;
  }
}
