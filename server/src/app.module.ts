import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config'; // load .env
import { SocketModule } from './socket/socket.module';
import { SocketGateway } from './socket/socket.gateway';

@Module({
    imports: [ConfigModule.forRoot(), SocketModule],
    controllers: [AppController],
    providers: [AppService, SocketGateway],
})
export class AppModule {}
