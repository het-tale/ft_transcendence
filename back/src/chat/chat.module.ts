import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { DMService } from './dm.service';
import { JwtModule } from '@nestjs/jwt';
import { ChatController } from './chat.controller';
import { ChannelService } from './channel.service';
import { FriendsService } from './friends.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [JwtModule.register({}), CloudinaryModule],
  controllers: [ChatController],
  providers: [ChatGateway, DMService, ChannelService, FriendsService],
})
export class ChatModule {}
