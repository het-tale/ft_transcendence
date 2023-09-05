import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from 'src/mailer/mailer.service';

@Injectable()
export class ConfirmationService {
  constructor(
    private jwt: JwtService,
    private mailer: MailerService,
    private conf: ConfigService,
  ) {}
  async sendConfirmationEmail(email: string) {
    try {
      const token = this.jwt.sign(
        { email },
        {
          expiresIn: '15m',
          secret: this.conf.get('EMAIL_VERIFICATION_JWT_SECRET'),
        },
      );
      console.log(token);
      const url = `${this.conf.get(
        'FRONTEND_URL',
      )}/confirm-email/?token=${token}`;
      const html = `<a href="${url}">Confirm your email</a>`;
      console.log(html);
      await this.mailer.sendMail({
        from: this.conf.get('EMAIL_USER'),
        to: email,
        subject: 'Confirm your email',
        html,
      });
    } catch (error) {
      console.log(error);
      throw new HttpException('Sending confirmation email failed', 500);
    }
  }
  async confirmEmail(token: string) {
    try {
      const payload = await this.jwt.verify(token, {
        secret: this.conf.get('EMAIL_VERIFICATION_JWT_SECRET'),
      });
      if (typeof payload === 'object' && 'email' in payload) {
        return payload.email;
      }
      throw new BadRequestException();
    } catch (error) {
      if (error?.name === 'TokenExpiredError') {
        throw new BadRequestException('Email confirmation token expired');
      }
      throw new BadRequestException('Bad confirmation token');
    }
  }
}
