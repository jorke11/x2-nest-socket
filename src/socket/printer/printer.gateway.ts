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
export class PrinterGateway {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(PrinterGateway.name);

  @SubscribeMessage('joinRoomPrinter')
  handleJoinRoomPrinter(@ConnectedSocket() client: Socket, @MessageBody() clientId: string) {
    const roomName = `server_printer_${clientId}`;
    client.join(roomName);
    client.emit('confirm-join', roomName);
    this.logger.log(`${client.id} joined ${roomName}`);
  }

  @SubscribeMessage('print-order')
  handlePrintOrder(@ConnectedSocket() client: Socket, @MessageBody() data: { business: string }) {
    this.logger.log(`print-order → server_printer_${data.business}`);
    this.server.to(`server_printer_${data.business}`).emit('print-order', data);
  }

  @SubscribeMessage('open-cash-drawer')
  handleOpenCashDrawer(@ConnectedSocket() client: Socket, @MessageBody() data: { business: string }) {
    this.logger.log(`open-cash-drawer → server_printer_${data.business}`);
    this.server.to(`server_printer_${data.business}`).emit('open-cash-drawer', data);
  }

  @SubscribeMessage('list-printer')
  handleListPrinter(@ConnectedSocket() client: Socket, @MessageBody() business: string) {
    this.server.to(`server_printer_${business}`).emit('list-printer-customer');
  }

  @SubscribeMessage('list-printer-response')
  handleListPrinterResponse(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { business: string; printers: unknown[] },
  ) {
    const room = `server_printer_${data.business}`;
    this.logger.log(`list-printer-response → ${room}`);
    this.server.to(room).emit('list-printer-response', data.printers);
  }
}
