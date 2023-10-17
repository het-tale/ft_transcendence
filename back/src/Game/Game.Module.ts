import { Module } from '@nestjs/common';
import { Game } from './Game';
import { JwtModule } from '@nestjs/jwt';
import { GameStartEvent } from './game-start-event';

@Module({
  imports: [JwtModule.register({})],
  providers: [Game, GameStartEvent],
})
export class GameModule {}
