import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { authModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    authModule,
  ],
})
export class AppModule {}
