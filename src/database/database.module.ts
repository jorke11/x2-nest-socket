import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import { PlanBusiness } from './entities/plan-business.entity';
import { PlanPayment } from './entities/plan-payment.entity';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        dialect: 'postgres',
        host: config.get('db.host'),
        port: config.get<number>('db.port'),
        database: config.get('db.name'),
        username: config.get('db.user'),
        password: config.get('db.password'),
        models: [PlanBusiness, PlanPayment],
        timezone: 'America/Bogota',
        dialectOptions: {
          useUTC: false,
          dateStrings: true,
          typeCast: true,
        },
        pool: { max: 10, min: 2, acquire: 30000, idle: 10000 },
        logging: false,
      }),
    }),
  ],
})
export class DatabaseModule {}
