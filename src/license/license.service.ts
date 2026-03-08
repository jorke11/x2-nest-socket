import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PlanBusiness } from '../database/entities/plan-business.entity';
import { PlanPayment } from '../database/entities/plan-payment.entity';

export interface LicenseInfo {
  days: number;
  date_end: string;
}

@Injectable()
export class LicenseService {
  private readonly logger = new Logger(LicenseService.name);

  constructor(
    @InjectModel(PlanBusiness)
    private readonly planBusinessModel: typeof PlanBusiness,
  ) {}

  /**
   * Replicates the request-license logic from sockets.js.
   * Returns { days, date_end } where positive days = expired, negative = still valid.
   */
  async getLicense(business_id: number): Promise<LicenseInfo | null> {
    try {
      const planBusiness = await this.planBusinessModel.findOne({
        include: [{ model: PlanPayment, as: 'payment' }],
        where: { business_id },
      });

      if (!planBusiness || !planBusiness.payment) {
        this.logger.warn(`No plan found for business_id=${business_id}`);
        return null;
      }

      const date_end = planBusiness.payment.date_end;
      const days = this.diffDays(new Date(), new Date(date_end));

      return { days, date_end };
    } catch (err) {
      this.logger.error('getLicense error', err);
      return null;
    }
  }

  /** Same as moment().diff(date_end, 'days') — positive when today is after date_end */
  private diffDays(from: Date, to: Date): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.floor((from.getTime() - to.getTime()) / msPerDay);
  }
}
