import { ConfigService } from '@nestjs/config';
import Mail from 'nodemailer/lib/mailer';
export declare class MailerService {
    private readonly configService;
    private nodemailerTransport;
    constructor(configService: ConfigService);
    sendMail(options: Mail.Options): Promise<any>;
}
