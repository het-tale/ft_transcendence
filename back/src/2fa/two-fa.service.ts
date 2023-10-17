import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { authenticator } from 'otplib';

@Injectable()
export class TwoFaService {
  constructor(private conf: ConfigService) {}
  async generateSecret() {
    const secret = authenticator.generateSecret();

    return secret;
  }
  async generateQRCode(secret: string, email: string) {
    const otpAuthUrl = authenticator.keyuri(
      email,
      this.conf.get('AUTH_APP_NAME'),
      secret,
    );

    return otpAuthUrl;
  }
  async verifyToken(token: string, secret: string) {
    console.log(token, secret, 'token, secret');
    const isValid = authenticator.verify({ token, secret });
    console.log(isValid, 'isValid');

    return isValid;
  }
}
