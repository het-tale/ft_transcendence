import { Module } from '@nestjs/common';
import { Game } from './Game';
import { JwtModule } from '@nestjs/jwt';
import { GameStartEvent } from './game-start-event';
import { GameInit } from './Game-Init';
import { GameUpdate } from './Game-Update';

@Module({
  imports: [JwtModule.register({})],
  providers: [Game, GameInit, GameStartEvent, GameUpdate],
})
export class GameModule {}
