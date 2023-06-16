import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LobbyStateService } from './lobby-state.service';

@Module({
    imports: [ConfigModule.forRoot()],
    providers: [LobbyStateService],
    exports: [LobbyStateService],
})
export class LobbyModule {}
