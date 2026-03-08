import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class VisionGateway {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(VisionGateway.name);

  @SubscribeMessage('joinRoomVision')
  handleJoinRoomVision(@ConnectedSocket() client: Socket, @MessageBody() business: string) {
    const roomName = `server_vision_${business}`;
    client.join(roomName);
    client.emit('confirm-join-vision', roomName);
    this.logger.log(`${client.id} joined ${roomName}`);
  }

  @SubscribeMessage('found-plate')
  handleFoundPlate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { business: string; [key: string]: unknown },
  ) {
    this.logger.log(`found-plate from ${client.id}: ${JSON.stringify(data)}`);
    try {
      this.server.to(`server_vision_${data.business}`).emit('found-plate', data);
      return { ok: true };
    } catch (err) {
      this.logger.error('Error emitting found-plate', err);
      return { ok: false, error: (err as Error).message };
    }
  }
}
