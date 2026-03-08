import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PlanBusiness } from '../database/entities/plan-business.entity';
import { PlanPayment } from '../database/entities/plan-payment.entity';
import { LicenseService } from './license.service';

@Module({
  imports: [SequelizeModule.forFeature([PlanBusiness, PlanPayment])],
  providers: [LicenseService],
  exports: [LicenseService],
})
export class LicenseModule {}
