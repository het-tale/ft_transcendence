import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TSignupData, TSigninData } from 'src/auth/dto';
import { ConfirmationService } from 'src/confirmation/confirmation.service';
import { PrismaService } from 'src/prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private jwt;
    private conf;
    private confirmationService;
    constructor(prisma: PrismaService, jwt: JwtService, conf: ConfigService, confirmationService: ConfirmationService);
    signup(dto: TSignupData): Promise<{
        token: string;
        message: string;
    }>;
    confirm_register(token: string): Promise<string>;
    resend_email(usery: any): Promise<void>;
    signin(dto: TSigninData): Promise<string>;
    getJwtToken(id: number, username: string, email: string): Promise<string>;
}
