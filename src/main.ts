// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get ConfigService to access environment variables
  const configService = app.get(ConfigService);
  const appPort = configService.get<number>('APP_PORT') || 3000;

  // Global Validation Pipe for DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strips away properties that are not defined in the DTO
    forbidNonWhitelisted: true, // Throws an error if non-whitelisted properties are present
    transform: true, // Automatically transforms payloads to DTO instances
  }));

  // Swagger setup for API documentation
  const config = new DocumentBuilder()
    .setTitle('Voucher Pool API')
    .setDescription('API for managing and redeeming voucher codes.')
    .setVersion('1.0')
    .addTag('vouchers')
    .addTag('customers')
    .addTag('special-offers')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Access Swagger UI at /api

  // Enable CORS
  app.enableCors();

  await app.listen(appPort);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger UI available at: ${await app.getUrl()}/api`);
}
bootstrap();
