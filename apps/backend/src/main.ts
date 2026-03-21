import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from '@/app.module';
import { SwaggerConfig } from '@/common/config/swagger.config';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const corsOrigins = configService
    .get<string>('CORS_ORIGINS', 'http://localhost:3000,https://www.homerunnie.app')
    .split(',');

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.use(cookieParser());

  app.useWebSocketAdapter(new IoAdapter(app));

  const port = configService.get<number>('PORT') ?? 3000;

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  SwaggerConfig.setUp(app);
  await app.listen(port ?? 3030, '0.0.0.0');
}

bootstrap();
