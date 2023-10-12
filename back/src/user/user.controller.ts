import {
  Body,
  Controller,
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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { EmailConfirmationGuard } from 'src/guards/email-confirmation.guard';
import JwtAuthenticationGuard from 'src/guards/jwt-authentication.guard';
import { UserService } from './user.service';
import { TwoFaVerificationGuard } from 'src/guards/two-fa-verification.guard';
import { User } from '@prisma/client';
import { SecurityService } from 'src/auth/security.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChangePasswordDto, TChangePassword, Tname, NameDto } from 'src/dto';
import { UseZodGuard } from 'nestjs-zod';

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(TwoFaVerificationGuard)
@UseGuards(EmailConfirmationGuard)
@UseGuards(JwtAuthenticationGuard)
@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private authService: SecurityService,
  ) {}
  @Get('me')
  me(@Req() request: { user: User }) {
    return request.user;
  }
  @Get(':id')
  async getUserById(@Param('id') idString: string) {
    const id = Number(idString);

    return await this.userService.getUserById(id);
  }

  @Get('search-users/:beginWith')
  async searchUsers(
    @Req() request: { user: User },
    @Param('beginWith') beginWith: string,
  ) {
    const users = await this.userService.searchUsers(beginWith, request.user);

    return users;
  }

  @Post('change-avatar')
  @UseInterceptors(FileInterceptor('file'))
  async changeAvatar(
    @Req() request: { user: User },
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file || file.originalname !== 'file') {
      throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
    }

    return this.authService.uploadAvatar(file, request.user);
  }

  @UseZodGuard('body', NameDto)
  @Post('change-username')
  async changeUsername(@Req() request: { user: User }, @Body() dto: Tname) {
    return this.userService.changeUsername(dto.name, request.user);
  }

  @UseZodGuard('body', ChangePasswordDto)
  @Post('change-password')
  async changePassword(
    @Req() request: { user: User },
    @Body() dto: TChangePassword,
  ) {
    return this.userService.changePassword(dto, request.user);
  }
}
