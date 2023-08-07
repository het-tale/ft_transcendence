import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies';
import { ConfirmationModule } from 'src/confirmation/confirmation.module';

@Module({
  imports: [PassportModule, JwtModule.register({}), ConfirmationModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class authModule {}
