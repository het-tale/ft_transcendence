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
import { TwoFaService } from 'src/2fa/two-fa.service';
import {
  TSignupData,
  TSigninData,
  TSetPasswordData,
  TforgetPasswordData,
  TAdd42CredentialsData,
} from 'src/dto';
import { ConfirmationService } from 'src/confirmation/confirmation.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Response } from 'express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { generateRandomAvatar } from 'src/utils/generateRandomAvatar';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private conf: ConfigService,
    private confirmationService: ConfirmationService,
    private tw: TwoFaService,
    private cloudinary: CloudinaryService,
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
    const jwt = await this.getJwtToken(user.id, user.email);

    return jwt;
  }

  async resend_email(usery) {
    const user = await this.prisma.user.findUnique({ where: { id: usery.id } });
    if (user.IsEmailConfirmed) {
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

    return token;
  }
  async signin42(user) {
    const token = await this.getJwtToken(user.payload.id, user.payload.email);

    return token;
  }

  async setNewPasswordUsername(dto: TAdd42CredentialsData, user) {
    if (user.isPasswordRequired === false)
      throw new HttpException(
        'user already has a password',
        HttpStatus.FORBIDDEN,
      );
    const hash = await argon.hash(dto.password);
    await this.prisma.user.update({
      where: { email: user.email },
      data: {
        hash,
        isPasswordRequired: false,
        username: dto.username,
      },
    });
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
  //TODO: add jwt refresh token
  getJwtToken(id: number, email: string): Promise<string> {
    const payload = {
      sub: id,
      email,
    };

    return this.jwt.signAsync(payload, {
      expiresIn: '15m',
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

  async generate2fa(user, res: Response) {
    if (user.is2faEnabled)
      throw new HttpException('2fa already enabled', HttpStatus.FORBIDDEN);
    const secret = await this.tw.generateSecret();
    await this.prisma.user.update({
      where: { email: user.email },
      data: {
        twofaSecret: secret,
      },
    });
    const qr = await this.tw.generateQRCode(secret, user.email, res);
    console.log(user.email, secret);
    console.log('in generate function : email, secret');

    return qr;
  }
  async enable2fa(code: string, user) {
    if (user.twofaSecret === null)
      throw new HttpException('generate 2fa qr code', HttpStatus.FORBIDDEN);
    const isValid = await this.tw.verifyToken(code, user.twofaSecret);
    console.log(isValid);
    if (!isValid) throw new HttpException('invalid code', HttpStatus.FORBIDDEN);
    await this.prisma.user.update({
      where: { email: user.email },
      data: {
        is2faEnabled: true,
        is2faVerified: true,
      },
    });
  }
  async verify2fa(token: string, user) {
    if (!user.is2faEnabled)
      throw new HttpException('2fa not enabled', HttpStatus.FORBIDDEN);
    console.log(user.twofaSecret);
    console.log(token);
    const isValid = await this.tw.verifyToken(token, user.twofaSecret);
    if (!isValid) throw new HttpException('invalid code', HttpStatus.FORBIDDEN);
    await this.prisma.user.update({
      where: { email: user.email },
      data: {
        is2faVerified: true,
      },
    });
  }
  async disable2fa(user) {
    if (!user.is2faEnabled)
      throw new HttpException('2fa already disabled', HttpStatus.FORBIDDEN);
    await this.prisma.user.update({
      where: { email: user.email },
      data: {
        is2faEnabled: false,
        is2faVerified: false,
        twofaSecret: null,
      },
    });
  }
  async uploadAvatar(file: Express.Multer.File, user) {
    const result = await this.cloudinary.uploadFile(file);
    await this.prisma.user.update({
      where: { email: user.email },
      data: {
        avatar: result,
      },
    });
  }
}
