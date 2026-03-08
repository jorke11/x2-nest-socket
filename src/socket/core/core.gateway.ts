import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '../../auth/jwt.service';
import { LicenseService } from '../../license/license.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class CoreGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(CoreGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly licenseService: LicenseService,
  ) {}

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    const token = client.handshake.auth?.token as string | undefined;

    if (!token) return;

    const payload = this.jwtService.verify(token);
    if (!payload) {
      this.logger.warn(`Invalid token from ${client.id}, disconnecting`);
      client.disconnect();
      return;
    }

    const businessId = client.handshake.query?.business as string | undefined;
    if (businessId) {
      client.join(`customer_${businessId}`);
      this.logger.log(`${client.id} joined customer_${businessId}`);
    }

    client.data.uid = payload.uid;
    client.data.businessId = businessId;
  }

  handleDisconnect(client: Socket) {
    this.logger.warn(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('receive-message')
  handleReceiveMessage(@ConnectedSocket() client: Socket, @MessageBody() data: unknown) {
    this.logger.log(`receive-message from ${client.id}: ${JSON.stringify(data)}`);
  }

  @SubscribeMessage('request-license')
  async handleRequestLicense(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { business_id: number; branch_id?: number },
  ) {
    this.logger.log(`request-license from ${client.id}: business_id=${data.business_id}`);
    const result = await this.licenseService.getLicense(data.business_id);
    if (!result) return { days: null, date_end: null };
    return result;
  }

  @SubscribeMessage('test')
  handleTest(@ConnectedSocket() client: Socket, @MessageBody() data: unknown) {
    this.logger.log(`test from ${client.id}`);
    client.emit('test', data);
  }

  @SubscribeMessage('messages-without-read')
  handleMessagesWithoutRead(@ConnectedSocket() client: Socket) {
    const { businessId } = client.data as { businessId?: string };
    if (!businessId) return;
    this.logger.log(`messages-without-read requested by ${client.id} for room customer_${businessId}`);
  }

  @SubscribeMessage('client-read-message')
  handleClientReadMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { id: string; counter_whatsapp: number },
  ) {
    this.logger.log(`client-read-message from ${client.id}: ${JSON.stringify(data)}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() clientId: string) {
    const roomName = `vds_${clientId}`;
    client.join(roomName);
    this.logger.log(`${client.id} joined ${roomName}`);
  }
}
