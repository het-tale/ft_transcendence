import { ForbiddenException, Injectable } from '@nestjs/common';
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
          expiresIn: '10min',
          secret: this.conf.get('EMAIL_VERIFICATION_JWT_SECRET'),
        },
      );
      console.log(token);
      const url = `${this.conf.get('FRONTEND_URL')}/confirm/?token=${token}`;
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
      console.log("couldn't send email");
    }
  }
  async confirmEmail(token: string) {
    try {
      const payload = await this.jwt.verify(token, {
        secret: this.conf.get('EMAIL_VERIFICATION_JWT_SECRET'),
      });

      return payload.email;
    } catch (error) {
      throw new ForbiddenException('invalid token');
    }
  }
}
