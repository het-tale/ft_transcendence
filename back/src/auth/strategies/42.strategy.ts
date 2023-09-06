import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-42';
import { PrismaService } from 'src/prisma/prisma.service';
import { exclude } from 'utils';

@Injectable()
export class Strategy42 extends PassportStrategy(Strategy, '42') {
  constructor(
    private prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    super({
      clientID: configService.get('UID_42'),
      clientSecret: configService.get('SECRET_42'),
      callbackURL: 'http://127.0.0.1:3001/auth/42/callback',
      scope: 'email',
      profileFields: ['email', 'login'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<any> {
    const { login, email } = profile;
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      await this.prisma.user.create({
        data: {
          email,
          login,
          isPasswordRequired: true,
        },
      });
    } else {
      await this.prisma.user.update({
        where: { email },
        data: {
          login,
        },
      });
    }
    if (user && user.hash) {
      exclude(user, 'hash');
    }
    const payload = {
      user,
      accessToken,
    };

    return payload;
  }
}
