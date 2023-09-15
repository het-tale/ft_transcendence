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
  Add42CredentialsDto,
  AuthSignInDto,
  AuthSignUpDto,
  ForgetPassworddto,
  SetPasswordDto,
  TAdd42CredentialsData,
  TSetPasswordData,
  TSigninData,
  TSignupData,
  TforgetPasswordData,
  TtwofaCodeData,
  TwofaCodeDto,
} from 'src/dto';
import { AuthService } from './auth.service';
import { EmailConfirmationGuard } from '../guards/email-confirmation.guard';
import JwtAuthenticationGuard from '../guards/jwt-authentication.guard';
import _42AuthenticationGuard from '../guards/42-authentication.guard';
import { TwoFaVerificationGuard } from '../guards/twofa-verification.guard';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiBody({ type: AuthSignUpDto })
  @ApiOperation({ summary: 'Register a new user' })
  @UseZodGuard('body', AuthSignUpDto)
  @Post('signup')
  signup(@Body() dto: TSignupData) {
    return this.authService.signup(dto);
  }

  @ApiQuery({ name: 'token', type: 'string' })
  @ApiOperation({ summary: 'Confirm email' })
  @Get('confirm-email')
  confirm(@Query('token') token: string) {
    return this.authService.confirm_register(token);
  }

  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Verify your 2FA first',
  })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resend email confirmation' })
  @UseGuards(TwoFaVerificationGuard)
  @UseGuards(JwtAuthenticationGuard)
  @Get('resend-email')
  resend(@Req() request: Request) {
    return this.authService.resend_email(request.user);
  }

  @ApiBody({ type: AuthSignInDto })
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
    const token = await this.authService.signin42(user);

    return res.redirect(`http://localhost:3000/signin42?token=${token}`);
  }

  @ApiBody({ type: Add42CredentialsDto })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Verify your 2FA first and confirm your email',
  })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add 42 credentials' })
  @UseZodGuard('body', Add42CredentialsDto)
  @UseGuards(EmailConfirmationGuard)
  @UseGuards(TwoFaVerificationGuard)
  @UseGuards(JwtAuthenticationGuard)
  @Post('set-new-username-password')
  setNewPassword(@Req() request: Request, @Body() dto: TAdd42CredentialsData) {
    return this.authService.setNewPasswordUsername(dto, request.user);
  }

  @ApiBody({ type: ForgetPassworddto })
  @UseZodGuard('body', ForgetPassworddto)
  @Post('forget-password')
  async forgetPassword(@Body() dto: TforgetPasswordData) {
    return this.authService.forgetPassword(dto);
  }

  @ApiBody({ type: SetPasswordDto })
  @ApiQuery({ name: 'token', type: 'string' })
  @UseZodGuard('body', SetPasswordDto)
  @Post('change-password')
  async confirmChangePassword(
    @Body() dto: TSetPasswordData,
    @Query('token') token: string,
  ) {
    return this.authService.confirmChangePassword(token, dto);
  }

  @ApiUnauthorizedResponse({
    description: 'Unauthorized - confirm your email first',
  })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate 2fa qrcode' })
  @UseGuards(EmailConfirmationGuard)
  @UseGuards(JwtAuthenticationGuard)
  @Get('2fa/generate')
  @Header('Content-Type', 'image/png')
  async generate2fa(@Req() request: Request, @Res() res: Response) {
    const code = await this.authService.generate2fa(request.user, res);

    return code;
  }

  @ApiBody({ type: TwofaCodeDto })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - confirm your email first',
  })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enable 2fa' })
  @UseGuards(EmailConfirmationGuard)
  @UseGuards(JwtAuthenticationGuard)
  @UseZodGuard('body', TwofaCodeDto)
  @Post('2fa/enable')
  async enable2fa(@Req() request: Request, @Body() dto: TtwofaCodeData) {
    return this.authService.enable2fa(dto.code, request.user);
  }

  @ApiBody({ type: TwofaCodeDto })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - confirm your email first',
  })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify 2fa with code' })
  @UseGuards(EmailConfirmationGuard)
  @UseGuards(JwtAuthenticationGuard)
  @UseZodGuard('body', TwofaCodeDto)
  @Post('2fa/verify')
  async verify2fa(@Req() request: Request, @Body() dto: TtwofaCodeData) {
    await this.authService.verify2fa(dto.code, request.user);
  }

  @ApiUnauthorizedResponse({
    description: 'Unauthorized - verify 2fa and confirm your email first',
  })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disable 2fa' })
  @UseGuards(TwoFaVerificationGuard)
  @UseGuards(EmailConfirmationGuard)
  @UseGuards(JwtAuthenticationGuard)
  @Get('2fa/disable')
  async disable2fa(@Req() request: Request) {
    await this.authService.disable2fa(request.user);
  }

  @ApiBody({ type: File })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - confirm your email first',
  })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload avatar' })
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
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - verify 2fa and confirm your email first',
  })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  @UseGuards(EmailConfirmationGuard)
  @UseGuards(TwoFaVerificationGuard)
  @UseGuards(JwtAuthenticationGuard)
  @Get('me')
  me(@Req() request: Request) {
    return request.user;
  }
}
