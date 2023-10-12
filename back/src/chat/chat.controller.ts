import {
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { DMService } from './dm.service';
import JwtAuthenticationGuard from 'src/guards/jwt-authentication.guard';
import { EmailConfirmationGuard } from 'src/guards/email-confirmation.guard';
import { TwoFaVerificationGuard } from 'src/guards/two-fa-verification.guard';
import { ChannelService } from './channel.service';
import { User } from '@prisma/client';
import { FriendsService } from './friends.service';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

ApiTags('Chat');
@Controller('chat')
@UseGuards(EmailConfirmationGuard)
@UseGuards(TwoFaVerificationGuard)
@UseGuards(JwtAuthenticationGuard)
export class ChatController {
  constructor(
    private dmService: DMService,
    private channelService: ChannelService,
    private friendsService: FriendsService,
  ) {}

  @Get('dms/:username')
  async getDms(
    @Param('username') username: string,
    @Req() request: { user: User },
  ) {
    return await this.dmService.getDmConversation(username, request.user);
  }
  @Delete('clear-conversation/:username')
  async deleteDm(
    @Param('username') username: string,
    @Req() request: { user: User },
  ) {
    return await this.dmService.deleteDm(username, request.user);
  }

  @Get('search-conversations/:startsWith')
  async searchConversations(
    @Param('startsWith') startsWith: string,
    @Req() request: { user: User },
  ) {
    return await this.dmService.searchConversations(startsWith, request.user);
  }

  @Delete('delete-conversation/:username')
  async deleteConversation(
    @Param('username') username: string,
    @Req() request: { user: User },
  ) {
    return await this.dmService.deleteConversation(username, request.user);
  }
  @Get('channels/:channelName')
  async getChannelMessages(
    @Param('channelName') channelName: string,
    @Req() request: { user: User },
  ) {
    return await this.channelService.getChannelMessages(
      channelName,
      request.user,
    );
  }
  @Get('friends')
  async getFriends(@Req() request: { user: User }) {
    return await this.friendsService.getFriends(request.user);
  }
  @Get('blocked')
  async getBlockedUsers(@Req() request: { user: User }) {
    return await this.friendsService.getBlockedUsers(request.user);
  }
  @Get('mutual-friends/:username')
  async getMutualFriends(
    @Param('username') username: string,
    @Req() request: { user: User },
  ) {
    return await this.friendsService.getMutualFriends(username, request.user);
  }
  @Get('dms-list')
  async getDmsList(@Req() request: { user: User }) {
    return await this.dmService.getDmsList(request.user);
  }
  @Get('my-channels-list')
  async getMyChannelsList(@Req() request: { user: User }) {
    return await this.channelService.getMyChannelsList(request.user);
  }
  @Get('browse-channels-list')
  async getBrowseChannelsList(@Req() request: { user: User }) {
    return await this.channelService.getBrowseChannelsList(request.user);
  }
  @UseInterceptors(FileInterceptor('file'))
  @Post('channel-avatar/:channelName')
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Param('channelName') channelName: string,
    @Req() request: { user: User },
  ) {
    if (!file || !file.originalname) {
      throw new HttpException(
        'Please provide a file named "file" in the request.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.channelService.uploadAvatar(
      file,
      request.user,
      channelName,
    );
  }
}
