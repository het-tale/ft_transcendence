import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ChatService } from './chat.service';
import JwtAuthenticationGuard from 'src/guards/jwt-authentication.guard';
import { EmailConfirmationGuard } from 'src/guards/email-confirmation.guard';
import { TwoFaVerificationGuard } from 'src/guards/twofa-verification.guard';

@Controller('chat')
@UseGuards(EmailConfirmationGuard)
@UseGuards(TwoFaVerificationGuard)
@UseGuards(JwtAuthenticationGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('dms/:username')
  async getDms(@Param('username') username: string, @Req() request: Request) {
    return this.chatService.getDms(username, request.user);
  }
}
