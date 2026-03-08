import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { RedisService } from '../../redis/redis.service';

interface EmitPayload {
  event: string;
  room: string;
  data: unknown;
}

/**
 * Handles order-related socket events and the Redis pub/sub bridge.
 *
 * Old backend publishes to `socket:emit` channel:
 *   { event, room, data }
 * This gateway forwards it to connected clients.
 */
@Injectable()
@WebSocketGateway({ cors: { origin: '*' } })
export class OrdersGateway implements OnModuleInit {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(OrdersGateway.name);

  constructor(private readonly redis: RedisService) {}

  async onModuleInit() {
    await this.redis.subscribe('socket:emit', (message) => {
      try {
        const payload: EmitPayload = JSON.parse(message);
        this.logger.log(`Redis bridge → ${payload.event} to ${payload.room}`);
        this.server.to(payload.room).emit(payload.event, payload.data);
      } catch (err) {
        this.logger.error('Failed to parse socket:emit message', err);
      }
    });
  }

  // ---- Direct socket events (client → server → broadcast) ----

  @SubscribeMessage('created_order')
  handleCreatedOrder(@ConnectedSocket() client: Socket, @MessageBody() data: { business_id: string }) {
    this.server.to(`vds_${data.business_id}`).emit('created_order', data);
  }

  @SubscribeMessage('payment_order')
  handlePaymentOrder(@ConnectedSocket() client: Socket, @MessageBody() data: { business_id: string }) {
    this.server.to(`vds_${data.business_id}`).emit('payment_order', data);
  }

  @SubscribeMessage('finish_order')
  handleFinishOrder(@ConnectedSocket() client: Socket, @MessageBody() data: { business_id: string }) {
    this.server.to(`vds_${data.business_id}`).emit('finish_order', data);
  }

  @SubscribeMessage('worker-updated')
  handleWorkerUpdated(@ConnectedSocket() client: Socket, @MessageBody() data: { business_id: string }) {
    this.server.to(`customer_${data.business_id}`).emit('worker-updated', data);
  }

  @SubscribeMessage('permission-updated')
  handlePermissionUpdated(@ConnectedSocket() client: Socket, @MessageBody() data: { business_id: string }) {
    this.server.to(`customer_${data.business_id}`).emit('permission-updated', data);
  }

  @SubscribeMessage('client-updated')
  handleClientUpdated(@ConnectedSocket() client: Socket, @MessageBody() data: { business_id: string }) {
    this.server.to(`customer_${data.business_id}`).emit('client-updated', data);
  }

  @SubscribeMessage('category-created')
  handleCategoryCreated(@ConnectedSocket() client: Socket, @MessageBody() data: { business_id: string }) {
    this.server.to(`customer_${data.business_id}`).emit('category-created', data);
  }

  @SubscribeMessage('category-deleted')
  handleCategoryDeleted(@ConnectedSocket() client: Socket, @MessageBody() data: { business_id: string }) {
    this.server.to(`customer_${data.business_id}`).emit('category-deleted', data);
  }
}
