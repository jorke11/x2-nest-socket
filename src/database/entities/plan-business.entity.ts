import { Column, Model, Table, DataType, HasOne } from 'sequelize-typescript';
import { PlanPayment } from './plan-payment.entity';

@Table({ tableName: 'plan_businesses', underscored: true, timestamps: true })
export class PlanBusiness extends Model {
  @Column(DataType.INTEGER)
  plan_id: number;

  @Column(DataType.INTEGER)
  business_id: number;

  @Column(DataType.INTEGER)
  branch_id: number;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  status: boolean;

  @HasOne(() => PlanPayment, { sourceKey: 'id', foreignKey: 'plan_business_id', as: 'payment' })
  payment: PlanPayment;
}
