import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from 'src/mailer/mailer.service';
export declare class ConfirmationService {
    private jwt;
    private mailer;
    private conf;
    constructor(jwt: JwtService, mailer: MailerService, conf: ConfigService);
    sendConfirmationEmail(email: string): Promise<void>;
    confirmEmail(token: string): Promise<any>;
}
