import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { LicenseModule } from '../license/license.module';
import { CoreGateway } from './core/core.gateway';
import { OrdersGateway } from './orders/orders.gateway';
import { PrinterGateway } from './printer/printer.gateway';
import { VisionGateway } from './vision/vision.gateway';

@Module({
  imports: [AuthModule, LicenseModule],
  providers: [CoreGateway, OrdersGateway, PrinterGateway, VisionGateway],
})
export class SocketModule {}
