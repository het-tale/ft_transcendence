import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-42';

@Injectable()
export class Strategy42 extends PassportStrategy(Strategy, '42') {
  constructor() {
    super({
      clientID: process.env.APP_ID,
      clientSecret: process.env.APP_SECRET,
      callbackURL: 'http://127.0.0.1:3000/auth/42/callback',
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
    const user = {
      email,
      login,
    };
    // const payload = {
    //   user,
    //   accessToken,
    // };

    return user;
  }
}
