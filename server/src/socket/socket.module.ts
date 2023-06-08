import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SocketStateService } from './socket-state.service';

@Module({
    imports: [ConfigModule.forRoot()],
    providers: [SocketStateService],
    exports: [SocketStateService],
})
export class SocketModule {}
