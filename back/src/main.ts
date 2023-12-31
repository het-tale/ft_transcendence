import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { patchNestJsSwagger } from 'nestjs-zod';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { RobotUserService } from './utils/robot-user.service';
import { AchievementService } from './utils/achievements-creation.service';
import { ValidationPipe } from '@nestjs/common';
import { CustomExceptionFilter } from './utils/custom-exception.filter';

async function bootstrap() {
  patchNestJsSwagger();
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.get(RobotUserService).createRobotUser();
  await app.get(AchievementService).createAchievements();

  app.enableCors({
    origin: [process.env.FRONTEND_URL, process.env.BACKEND_URL],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 200,
    preflightContinue: false,
    allowedHeaders: 'Authorization, Content-Type',
  });

  app.useGlobalFilters(new CustomExceptionFilter());
  app.useWebSocketAdapter(new IoAdapter(app));
  const config = new DocumentBuilder()
    .setTitle('ft_transcendence API')
    .setDescription('Showing all the routes of the API')
    .setVersion('1.0')
    .addTag('ft_transcendence')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3001);
}
bootstrap();
