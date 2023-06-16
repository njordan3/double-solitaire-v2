import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SocketStateAdapter } from './socket/socket.adapter';
import { SocketStateService } from './socket/socket-state.service';
import { LobbyStateService } from './lobby/lobby-state.service';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const lobbyStateService = app.get(LobbyStateService);
    const socketStateService = app.get(SocketStateService);
    app.useWebSocketAdapter(new SocketStateAdapter(app, socketStateService, lobbyStateService)); // Add our custom socket adapter.
    await app.listen(Number(process.env.PORT));
}
bootstrap();
