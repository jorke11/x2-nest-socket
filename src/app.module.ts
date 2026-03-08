import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { LicenseModule } from './license/license.module';
import { SocketModule } from './socket/socket.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    RedisModule,
    AuthModule,
    DatabaseModule,
    LicenseModule,
    SocketModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
