import { MessageBody, SubscribeMessage, WebSocketGateway, ConnectedSocket } from '@nestjs/websockets';
import 'dotenv/config';
import { AuthSocket } from './socket.adapter';

interface JoinLobbyData {
    lobby: string;
}

@WebSocketGateway(Number(process.env.WSPORT), {
    cors: { origin: 'http://localhost:3000', methods: ['OPTIONS', 'POST', 'GET'] },
})
export class SocketGateway {
    @SubscribeMessage('join-lobby')
    handleEvent(@MessageBody() data: [JoinLobbyData], @ConnectedSocket() client: AuthSocket) {
        const { lobby } = data[0];
        console.log(lobby);
        // client.join();

        return false; // Don't respond to client
    }
}
