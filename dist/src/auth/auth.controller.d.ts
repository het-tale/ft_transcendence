/// <reference types="passport" />
import { Request, Response } from 'express';
import { TSigninData, TSignupData } from 'src/auth/dto';
import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    signup(request: Request, dto: TSignupData): Promise<{
        token: string;
        message: string;
    }>;
    confirm(token: string): Promise<string>;
    resend(request: Request): Promise<void>;
    signin(response: Response, dto: TSigninData): Promise<string>;
    me(request: Request): Express.User;
}
