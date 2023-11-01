import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  Header,
} from '@nestjs/common';
import { SecurityService } from './security.service';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { EmailConfirmationGuard } from 'src/guards/email-confirmation.guard';
import JwtAuthenticationGuard from 'src/guards/jwt-authentication.guard';
import { User } from '@prisma/client';
import {
  Add42CredentialsDto,
  TAdd42CredentialsData,
  TtwofaCodeData,
  TwofaCodeDto,
} from 'src/dto';
import { UseZodGuard } from 'nestjs-zod';
import { TwoFaVerificationGuard } from 'src/guards/two-fa-verification.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidationPipe } from 'src/utils/file-validation.pipe';
@ApiTags('Authentication protected routes')
@ApiBearerAuth()
@UseGuards(EmailConfirmationGuard)
@UseGuards(JwtAuthenticationGuard)
@Controller('auth')
export class SecurityController {
  constructor(private securityService: SecurityService) {}
  @Get('2fa/generate')
  @Header('Content-Type', 'image/png')
  async generate2Fa(@Req() request: { user: User }) {
    const code = await this.securityService.generate2Fa(request.user);

    return code;
  }

  @ApiBody({ type: TwofaCodeDto })
  @UseZodGuard('body', TwofaCodeDto)
  @Post('2fa/enable')
  async enable2Fa(@Req() request: { user: User }, @Body() dto: TtwofaCodeData) {
    return await this.securityService.enable2Fa(dto.code, request.user);
  }

  @ApiBody({ type: TwofaCodeDto })
  @UseZodGuard('body', TwofaCodeDto)
  @Post('2fa/verify')
  async verify2Fa(@Req() request: { user: User }, @Body() dto: TtwofaCodeData) {
    await this.securityService.verify2Fa(dto.code, request.user);
  }

  @UseGuards(TwoFaVerificationGuard)
  @Get('2fa/disable')
  async disable2Fa(@Req() request: { user: User }) {
    await this.securityService.disable2Fa(request.user);
  }
  @ApiBody({ type: Add42CredentialsDto })
  @UseZodGuard('body', Add42CredentialsDto)
  @UseGuards(TwoFaVerificationGuard)
  @Post('set-new-username-password')
  async setNewPassword(
    @Req() request: { user: User },
    @Body() dto: TAdd42CredentialsData,
  ) {
    return await this.securityService.setNewPasswordUsername(dto, request.user);
  }

  @UseInterceptors(FileInterceptor('file'))
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(TwoFaVerificationGuard)
  @Post('upload-avatar')
  async uploadAvatar(
    @UploadedFile(new FileValidationPipe()) file: Express.Multer.File,
    @Req() request: { user?: User },
  ) {
    return await this.securityService.uploadAvatar(file, request?.user);
  }
}
