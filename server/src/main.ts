import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SocketStateAdapter } from './socket/socket.adapter';
import { SocketStateService } from './socket/socket-state.service';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const socketStateService = app.get(SocketStateService);
    app.useWebSocketAdapter(new SocketStateAdapter(app, socketStateService)); // Add our custom socket adapter.
    await app.listen(Number(process.env.PORT));
}
bootstrap();
