import { Module } from '@nestjs/common';
import { Game } from './Game';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule.register({})],
  providers: [Game],
})
export class GameModule {}
