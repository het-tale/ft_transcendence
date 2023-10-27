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

  generateEmailTemplate(link: string, type: string) {
    let title: string, message: string;
    if (type === 'confirmation') {
      title = 'Confirm Your Email';
      message =
        'Thank you for registering with us. To confirm your email address, please click the button below:';
    } else {
      title = 'Set a New Password';
      message =
        'You recently requested to reset your password. Click the button below to set a new password:';
    }

    return `
        <html>
            <body style="font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif; line-height: 1.6; background-color: #f6f6f6; text-align: center;">
                <div style="background-color: #f9f9f9; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                    <h2 style="color: #333333;">${title}</h2>
                    <p style="color: #666666;">Hello Folk,</p>
                    <p style="color: #666666;">${message}</p>
                    <p>
                        <a href="${link}" style="text-decoration: none;">
                            <button style="display: inline-block; background-color: #4CAF50; border: none; color: white; padding: 15px 32px; text-align: center; text-decoration: none; font-size: 16px; margin: 4px 2px; cursor: pointer; border-radius: 5px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);">
                                ${
                                  type === 'confirmation'
                                    ? 'Confirm Email'
                                    : 'Set New Password'
                                }
                            </button>
                        </a>
                    </p>
                    <p style="color: #666666;">${
                      type === 'confirmation'
                        ? 'If you did not register on our platform, please ignore this message.'
                        : "If you didn't make this request, please ignore this message."
                    }</p>
                    <p style="color: #666666;">Thank you,</p>
                    <p style="color: #666666;">The Team</p>
                </div>
            </body>
        </html>
    `;
  }

  async sendConfirmationEmail(email: string, subject: string) {
    try {
      const token = this.jwt.sign(
        { email },
        {
          expiresIn: '50m',
          secret: this.conf.get('EMAIL_VERIFICATION_JWT_SECRET'),
        },
      );

      const front_url: string =
        subject === 'Confirm your email'
          ? this.conf.get('FRONTEND_CONFIRM_EMAIL_URL')
          : this.conf.get('FRONTEND_SET_PASSWORD_URL');

      const url = `${front_url}/?token=${token}`;
      const html =
        subject === 'Confirm your email'
          ? this.generateEmailTemplate(url, 'confirmation')
          : this.generateEmailTemplate(url, 'set new password');
      await this.mailer.sendMail({
        from: this.conf.get('EMAIL_USER'),
        to: email,
        subject,
        html,
      });
    } catch (error) {
      console.error(error);

      throw new HttpException('Sending email failed', 400);
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
        throw new BadRequestException('Email token expired');
      }
      throw new BadRequestException('Bad email token');
    }
  }
}
