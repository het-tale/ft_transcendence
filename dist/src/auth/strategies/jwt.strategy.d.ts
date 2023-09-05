import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private prisma;
    private conf;
    constructor(prisma: PrismaService, conf: ConfigService);
    validate(payload: {
        sub: number;
        username: string;
        email: string;
    }): Promise<Omit<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        IsEmailConfirmed: boolean;
        username: string;
        hash: string;
        avatar: string;
        nickname: string;
        tfaStatus: boolean;
        userId: number;
    }, "username" | "email" | "avatar" | "id" | "createdAt" | "updatedAt" | "IsEmailConfirmed" | "hash" | "nickname" | "tfaStatus" | "userId">>;
}
export {};
