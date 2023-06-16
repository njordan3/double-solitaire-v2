import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SocketStateService } from './socket-state.service';
import { LobbyModule } from 'src/lobby/lobby.module';

@Module({
    imports: [ConfigModule.forRoot(), LobbyModule],
    providers: [SocketStateService],
    exports: [SocketStateService],
})
export class SocketModule {}
