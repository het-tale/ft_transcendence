import { Module } from '@nestjs/common';
import { TwoFaModule } from 'src/2fa/two-fa.module';
import { ConfirmationModule } from 'src/confirmation/confirmation.module';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [TwoFaModule, ConfirmationModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
