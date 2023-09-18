import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { DMService } from './dm.service';
import JwtAuthenticationGuard from 'src/guards/jwt-authentication.guard';
import { EmailConfirmationGuard } from 'src/guards/email-confirmation.guard';
import { TwoFaVerificationGuard } from 'src/guards/two-fa-verification.guard';
import { ChannelService } from './channel.service';
import { User } from '@prisma/client';

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
  async getDms(
    @Param('username') username: string,
    @Req() request: { user: User },
  ) {
    return this.dmService.getDmConversation(username, request.user);
  }

  @Get('channels/:channelName')
  async getChannelMessages(
    @Param('channelName') channelName: string,
    @Req() request: { user: User },
  ) {
    return this.channelService.getChannelMessages(channelName, request.user);
  }
}
