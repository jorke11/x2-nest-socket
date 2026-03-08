import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot(): object {
    return {
      message: 'Bienvenido a x2-nest-socket',
      info: 'Este endpoint pertenece a x2',
      status: 'OK',
    };
  }
}
