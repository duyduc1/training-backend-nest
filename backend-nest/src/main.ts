import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as morgan from 'morgan';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
  new ValidationPipe({
      whitelist: true,        
      transform: true,   
    }),
  );
  app.use(morgan('dev'));
  app.use(cors({ origin: '*', credentials: true }));

  const port = process.env.PORT;

  await app.listen(port);
  console.log(`Server running on port ${port}`);
}
bootstrap();
