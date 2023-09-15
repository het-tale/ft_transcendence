import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { authModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { MailerModule } from './mailer/mailer.module';
import { ConfirmationModule } from './confirmation/confirmation.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { TwoFaModule } from './2fa/two-fa.module';
import { JwtModule } from '@nestjs/jwt';
import { ChatModule } from './chat/chat.module';

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
    ChatModule,
  ],
})
export class AppModule {}
