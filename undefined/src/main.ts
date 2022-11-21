import { NestFactory } from '@nestjs/core';
import { Constants } from 'config/credentials';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(Constants.PORT);
}
bootstrap();
