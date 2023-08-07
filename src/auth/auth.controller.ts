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
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { UseZodGuard } from 'nestjs-zod';
import {
  AuthSignInDto,
  AuthSignUpDto,
  TSigninData,
  TSignupData,
} from 'src/auth/dto';
import { AuthService } from './auth.service';

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

  @UseZodGuard('body', AuthSignInDto)
  @Post('signin')
  signin(
    @Res({ passthrough: true }) response: Response,
    @Body() dto: TSigninData,
  ) {
    return this.authService.signin(dto);
  }
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  me(@Req() request: Request) {
    return request.user;
  }
}
