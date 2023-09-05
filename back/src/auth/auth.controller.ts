import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { UseZodGuard } from 'nestjs-zod';
import {
  AuthSignInDto,
  AuthSignUpDto,
  TSigninData,
  TSignupData,
} from 'src/auth/dto';
import { AuthService } from './auth.service';
import { EmailConfirmationGuard } from './guards/email-confirmation.guard';
import JwtAuthenticationGuard from './guards/jwt-authentication.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @UseZodGuard('body', AuthSignUpDto)
  @Post('signup')
  signup(@Req() request: Request, @Body() dto: TSignupData) {
    return this.authService.signup(dto);
  }

  @Get('confirm-email')
  confirm(@Query('token') token: string) {
    return this.authService.confirm_register(token);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Get('resend-email')
  resend(@Req() request: Request) {
    return this.authService.resend_email(request.user);
  }

  @UseZodGuard('body', AuthSignInDto)
  @Post('signin')
  signin(
    @Res({ passthrough: true }) response: Response,
    @Body() dto: TSigninData,
  ) {
    return this.authService.signin(dto);
  }

  // decorators resolve from bottom to top
  @UseGuards(EmailConfirmationGuard)
  @UseGuards(JwtAuthenticationGuard)
  @Get('me')
  me(@Req() request: Request) {
    return request.user;
  }
}
