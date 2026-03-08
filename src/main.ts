import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SocketIoAdapter } from './socket-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new SocketIoAdapter(app));

  const port = parseInt(process.env.PORT ?? '3001', 10);
  await app.listen(port);
  console.log(`x2-nest-socket running on port ${port}`);
}

bootstrap();
