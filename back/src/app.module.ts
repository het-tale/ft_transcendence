import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { authModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { MailerModule } from './mailer/mailer.module';
import { ConfirmationModule } from './confirmation/confirmation.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { TwoFaModule } from './2fa/two-fa.module';
import { ChatGateway } from './chat/chat.gateway';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({}),
    PrismaModule,
    authModule,
    MailerModule,
    ConfirmationModule,
    TwoFaModule,
    CloudinaryModule,
  ],
  providers: [ChatGateway, JwtService],
})
export class AppModule {}
