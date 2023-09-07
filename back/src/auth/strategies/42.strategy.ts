import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-42';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class Strategy42 extends PassportStrategy(Strategy, '42') {
  constructor(
    private prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    super({
      clientID: configService.get('UID_42'),
      clientSecret: configService.get('SECRET_42'),
      callbackURL: 'http://localhost:3001/auth/42/callback',
      profileFields: {
        login: 'login',
        email: 'email',
      },
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<any> {
    console.log('validate called');
    const { login, email } = profile;
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    let payload: {
      id: number;
      createdAt: Date;
      updatedAt: Date;
      email: string;
      IsEmailConfirmed: boolean;
      username: string;
      hash: string;
      avatar: string;
      login: string;
      isPasswordRequired: boolean;
      is2faEnabled: boolean;
      twofaSecret: string;
      userId: number;
    };
    if (!user) {
      payload = await this.prisma.user.create({
        data: {
          email,
          login,
          isPasswordRequired: true,
          IsEmailConfirmed: true,
        },
      });
    } else {
      payload = await this.prisma.user.update({
        where: { email },
        data: {
          login,
          IsEmailConfirmed: true,
        },
      });
    }
    console.log(payload);

    return { payload, accessToken };
  }
}
