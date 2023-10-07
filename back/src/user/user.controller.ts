import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { EmailConfirmationGuard } from 'src/guards/email-confirmation.guard';
import JwtAuthenticationGuard from 'src/guards/jwt-authentication.guard';
import { UserService } from './user.service';
import { TwoFaVerificationGuard } from 'src/guards/two-fa-verification.guard';
import { User } from '@prisma/client';

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(TwoFaVerificationGuard)
@UseGuards(EmailConfirmationGuard)
@UseGuards(JwtAuthenticationGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @Get('me')
  me(@Req() request: { user: User }) {
    return request.user;
  }
  @Get(':id')
  async getUserById(@Param('id') idString: string) {
    const id = Number(idString);

    return await this.userService.getUserById(id);
  }
}
