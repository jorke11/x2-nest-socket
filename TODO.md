# Pendientes

## [Seguridad] Falta autenticación en PrinterGateway, VisionGateway y OrdersGateway

`CoreGateway` (`src/socket/core/core.gateway.ts`) valida el JWT en `handleConnection`, pero
`PrinterGateway`, `VisionGateway` y `OrdersGateway` no implementan `OnGatewayConnection` ni
ningún otro chequeo de auth. Como NestJS registra todos los `@WebSocketGateway()` sin
namespace sobre el mismo socket por defecto, cualquier cliente conectado (sin token) puede
hoy mismo:

- Unirse al room de impresión de cualquier negocio adivinando/conociendo su `business_id`
  (`joinRoomPrinter`, `PrinterGateway`).
- Disparar `open-cash-drawer` (abrir la caja registradora) de cualquier negocio.
- Emitir `print-order` falsos hacia la impresora de cualquier negocio.
- Inyectar eventos falsos (`created_order`, `payment_order`, `finish_order`,
  `worker-updated`, `client-updated`, etc. en `OrdersGateway`) que se retransmiten como
  reales al dashboard en vivo de cualquier negocio.
- Unirse a `server_vision_${business}` (`VisionGateway`) y both escuchar/inyectar eventos
  `found-plate` de cualquier negocio.

Agravado por `cors: { origin: '*' }` sin restricción en los 4 gateways.

**Fix propuesto**: replicar en `PrinterGateway`, `VisionGateway` y `OrdersGateway` el mismo
patrón de `CoreGateway.handleConnection` (verificar JWT con `JwtService.verify`, y
`client.disconnect()` si no hay token válido), y/o validar que el `business_id` recibido en
cada evento (`joinRoomPrinter`, `print-order`, `open-cash-drawer`, etc.) coincida con el
`businessId` ya autenticado en `client.data` en vez de confiar en el valor que manda el
propio mensaje.

## [Escalabilidad] Puente Redis solo existe en OrdersGateway

Si en algún momento se necesita correr más de una instancia de este servicio (actualmente
`instances: 1` en `ecosystem.config.js`), `PrinterGateway` y `VisionGateway` van a fallar en
enviar eventos entre procesos distintos: el estado de las salas (`client.join()`) no se
comparte entre instancias, y solo `OrdersGateway` tiene el puente Redis pub/sub
(`socket:emit`) para reenviar eventos entre procesos. Si se escala horizontalmente, hay que
extender ese mismo puente (o usar `@socket.io/redis-adapter`) a los otros gateways.
