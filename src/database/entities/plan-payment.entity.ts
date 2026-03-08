import { Column, Model, Table, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { PlanBusiness } from './plan-business.entity';

@Table({ tableName: 'plan_payment', underscored: true, timestamps: true })
export class PlanPayment extends Model {
  @ForeignKey(() => PlanBusiness)
  @Column(DataType.INTEGER)
  plan_business_id: number;

  @Column(DataType.DATEONLY)
  date_init: string;

  @Column(DataType.DATEONLY)
  date_end: string;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  days: number;

  @Column({ type: DataType.INTEGER, defaultValue: 1 })
  status_id: number;

  @Column(DataType.TEXT)
  support: string;

  @Column(DataType.DECIMAL)
  cost: number;

  @Column(DataType.INTEGER)
  payment_method_id: number;

  @BelongsTo(() => PlanBusiness)
  plan_business: PlanBusiness;
}
