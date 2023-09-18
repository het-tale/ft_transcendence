import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { DMService } from './dm.service';
import JwtAuthenticationGuard from 'src/guards/jwt-authentication.guard';
import { EmailConfirmationGuard } from 'src/guards/email-confirmation.guard';
import { TwoFaVerificationGuard } from 'src/guards/two-fa-verification.guard';
import { ChannelService } from './channel.service';

@Controller('chat')
@UseGuards(EmailConfirmationGuard)
@UseGuards(TwoFaVerificationGuard)
@UseGuards(JwtAuthenticationGuard)
export class ChatController {
  constructor(
    private dmService: DMService,
    private channelService: ChannelService,
  ) {}

  @Get('dms/:username')
  async getDms(@Param('username') username: string, @Req() request: Request) {
    return this.dmService.getDmConversation(username, request.user);
  }

  @Get('channels/:channeName')
  async getChannelMessages(@Param('channeName') channelName: string) {
    return this.channelService.getChannelMessages(channelName);
  }
}
