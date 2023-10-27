import { Module } from '@nestjs/common';
import { TwoFaModule } from 'src/2fa/two-fa.module';
import { ConfirmationModule } from 'src/confirmation/confirmation.module';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { GameModule } from '../Game/Game.Module';
@Module({
  imports: [TwoFaModule, ConfirmationModule, GameModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
