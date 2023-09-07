import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';

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

    return toDataURL(otpAuthUrl);
  }
  async verifyToken(token: string, secret: string) {
    const isValid = authenticator.verify({ token, secret });

    return isValid;
  }
}
