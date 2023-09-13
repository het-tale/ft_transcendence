import {
  Body,
  Controller,
  Get,
  Header,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
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
  TtwofaCodeData,
  TwofaCodeDto,
} from 'src/auth/dto';
import { AuthService } from './auth.service';
import { EmailConfirmationGuard } from './guards/email-confirmation.guard';
import JwtAuthenticationGuard from './guards/jwt-authentication.guard';
import _42AuthenticationGuard from './guards/42-authentication.guard';
import { TwoFaVerificationGuard } from './guards/twofa-verification.guard';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseZodGuard('body', AuthSignUpDto)
  @Post('signup')
  signup(@Body() dto: TSignupData) {
    return this.authService.signup(dto);
  }

  @Get('confirm-email')
  confirm(@Query('token') token: string) {
    return this.authService.confirm_register(token);
  }

  @UseGuards(TwoFaVerificationGuard)
  @UseGuards(JwtAuthenticationGuard)
  @Get('resend-email')
  resend(@Req() request: Request) {
    return this.authService.resend_email(request.user);
  }

  @UseZodGuard('body', AuthSignInDto)
  @Post('signin')
  signin(@Body() dto: TSigninData) {
    return this.authService.signin(dto);
  }

  @UseGuards(_42AuthenticationGuard)
  @Get('42signin')
  signin42() {
    return;
  }

  @UseGuards(_42AuthenticationGuard)
  @Get('42/callback')
  async signin42Callback(@Req() request: Request, @Res() res: Response) {
    const { user } = request;
      // return res.status(200).send({token : token}).redirect(`http://localhost:3000/signin42`);
    const token = await this.authService.signin42(user);
    return res.redirect(`http://localhost:3000/signin42?token=${token}`);
  }

  @UseZodGuard('body', SetPasswordDto)
  @UseGuards(TwoFaVerificationGuard)
  @UseGuards(JwtAuthenticationGuard)
  @Post('set-new-password')
  setNewPassword(@Req() request: Request, @Body() dto: TSetPasswordData) {
    return this.authService.setNewPassword(dto, request.user);
  }

  @UseZodGuard('body', ForgetPassworddto)
  @Post('forget-password')
  async forgetPassword(@Body() dto: TforgetPasswordData) {
    return this.authService.forgetPassword(dto);
  }

  @UseZodGuard('body', SetPasswordDto)
  @Post('change-password')
  async confirmChangePassword(
    @Body() dto: TSetPasswordData,
    @Query('token') token: string,
  ) {
    return this.authService.confirmChangePassword(token, dto);
  }

  @UseGuards(EmailConfirmationGuard)
  @UseGuards(JwtAuthenticationGuard)
  @Get('2fa/generate')
  @Header('Content-Type', 'image/png')
  async generate2fa(@Req() request: Request, @Res() res: Response) {
    const code = await this.authService.generate2fa(request.user, res);

    return code;
  }
  @UseGuards(EmailConfirmationGuard)
  @UseGuards(JwtAuthenticationGuard)
  @UseZodGuard('body', TwofaCodeDto)
  @Post('2fa/enable')
  async enable2fa(@Req() request: Request, @Body() dto: TtwofaCodeData) {
    return this.authService.enable2fa(dto.code, request.user);
  }

  @UseGuards(EmailConfirmationGuard)
  @UseGuards(JwtAuthenticationGuard)
  @UseZodGuard('body', TwofaCodeDto)
  @Post('2fa/verify')
  async verify2fa(@Req() request: Request, @Body() dto: TtwofaCodeData) {
    await this.authService.verify2fa(dto.code, request.user);
  }

  @UseGuards(TwoFaVerificationGuard)
  @UseGuards(EmailConfirmationGuard)
  @UseGuards(JwtAuthenticationGuard)
  @Get('2fa/disable')
  async disable2fa(@Req() request: Request) {
    await this.authService.disable2fa(request.user);
  }

  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(EmailConfirmationGuard)
  @UseGuards(JwtAuthenticationGuard)
  @Post('upload-avatar')
  uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() request: Request,
  ) {
    if (!file || !file.originalname) {
      return {
        message: 'Please provide a file named "file" in the request.',
        error: 'Bad Request',
        statusCode: 400,
      };
    }
    return this.authService.uploadAvatar(file, request.user);
  }
  // decorators resolve from bottom to top
  @UseGuards(EmailConfirmationGuard)
  @UseGuards(TwoFaVerificationGuard)
  @UseGuards(JwtAuthenticationGuard)
  @Get('me')
  me(@Req() request: Request) {
    return request.user;
  }
}
