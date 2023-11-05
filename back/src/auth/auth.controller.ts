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
import { UseZodGuard } from 'nestjs-zod';
import {
  AuthSignInDto,
  AuthSignUpDto,
  ForgetPassworddto,
  SetPasswordDto,
  TSetPasswordData,
  TSigninData,
  TSignupData,
  TforgetPasswordData,
} from 'src/dto';
import { AuthService } from './auth.service';
import _42AuthenticationGuard from '../guards/42-authentication.guard';
import { Response } from 'express';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import JwtAuthenticationGuard from 'src/guards/jwt-authentication.guard';

@ApiTags('Authentication non protected routes')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiBody({ type: AuthSignUpDto })
  @UseZodGuard('body', AuthSignUpDto)
  @Post('signup')
  async signup(@Body() dto: TSignupData) {
    return await this.authService.signup(dto);
  }

  @ApiQuery({ name: 'token', type: 'string' })
  @Get('confirm-email')
  async confirm(@Query('token') token: string) {
    return await this.authService.confirmRegister(token);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Get('resend-email')
  async resend(@Req() request: { user: User }) {
    return await this.authService.resendEmail(request.user);
  }
  @ApiBody({ type: AuthSignInDto })
  @UseZodGuard('body', AuthSignInDto)
  @Post('signin')
  async signin(@Body() dto: TSigninData) {
    return await this.authService.signin(dto);
  }

  @UseGuards(_42AuthenticationGuard)
  @Get('42signin')
  signin42() {
    return;
  }

  @UseGuards(_42AuthenticationGuard)
  @Get('42/callback')
  async signin42Callback(@Req() request: { user: User }, @Res() res: Response) {
    const token = await this.authService.signin42(request.user);
    const url = `${process.env.FRONTEND_URL}/signin42?token=${token}`;

    return res.redirect(url);
  }

  @ApiBody({ type: ForgetPassworddto })
  @UseZodGuard('body', ForgetPassworddto)
  @Post('forget-password')
  async forgetPassword(@Body() dto: TforgetPasswordData) {
    return await this.authService.forgetPassword(dto);
  }

  @ApiBody({ type: SetPasswordDto })
  @ApiQuery({ name: 'token', type: 'string' })
  @UseZodGuard('body', SetPasswordDto)
  @Post('change-password')
  async confirmChangePassword(
    @Body() dto: TSetPasswordData,
    @Query('token') token: string,
  ) {
    return await this.authService.confirmChangePassword(token, dto);
  }
  @UseGuards(JwtAuthenticationGuard)
  @Get('me')
  async me(@Req() request: { user: User }) {
    return await this.authService.getUser(request.user.id);
  }
}
