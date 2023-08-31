import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { authModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { MailerModule } from './mailer/mailer.module';
import { ConfirmationModule } from './confirmation/confirmation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    authModule,
    MailerModule,
    ConfirmationModule,
  ],
})
export class AppModule {}
