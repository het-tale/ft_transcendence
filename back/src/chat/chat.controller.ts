import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { UseZodGuard } from 'nestjs-zod';
import { AdminDto, NameDto, RoomDto, Tadmin, Tname, Troom } from 'src/dto';
import { EmailConfirmationGuard } from 'src/guards/email-confirmation.guard';
import JwtAuthenticationGuard from 'src/guards/jwt-authentication.guard';
import { TwoFaVerificationGuard } from 'src/guards/two-fa-verification.guard';
import { FileValidationPipe } from 'src/utils/file-validation.pipe';
import { ChannelService } from './channel.service';
import { DMService } from './dm.service';
import { FriendsService } from './friends.service';

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
  @Get('search-channels/:startsWith')
  async searchChannels(
    @Param('startsWith') startsWith: string,
    @Req() request: { user: User },
  ) {
    return await this.channelService.searchChannels(startsWith, request.user);
  }

  @Get('room/:channelName')
  async getChannel(
    @Param('channelName') channelName: string,
    @Req() request: { user: User },
  ) {
    return await this.channelService.getChannel(channelName, request.user);
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
    @UploadedFile(new FileValidationPipe()) file: Express.Multer.File,
    @Req() request: { user: User },
    @Param('channelName') channelName: string,
  ) {
    return await this.channelService.uploadAvatar(
      file,
      request.user,
      channelName,
    );
  }
  @UseZodGuard('body', NameDto)
  @Post('change-channel-name/:channelName')
  async changeChannelName(
    @Req() request: { user: User },
    @Body() dto: Tname,
    @Param('channelName') channelName: string,
  ) {
    return await this.channelService.changeChannelName(
      channelName,
      dto.name,
      request.user,
    );
  }

  @UseZodGuard('body', RoomDto)
  @Post('change-channel-type')
  async changeChannelType(@Req() request: { user: User }, @Body() dto: Troom) {
    return await this.channelService.changeChannelType(dto, request.user);
  }

  @UseZodGuard('body', AdminDto)
  @Post('remove-admin')
  async removeAdmin(@Req() request: { user: User }, @Body() dto: Tadmin) {
    return await this.channelService.removeAdmin(request.user, dto);
  }
}
