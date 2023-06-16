import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config'; // load .env
import { SocketModule } from './socket/socket.module';
import { SocketGateway } from './socket/socket.gateway';
import { UtilityModule } from './utility/utility.module';

@Module({
    imports: [ConfigModule.forRoot(), SocketModule, UtilityModule],
    controllers: [AppController],
    providers: [AppService, SocketGateway],
})
export class AppModule {}
