import { MessageBody, SubscribeMessage, WebSocketGateway, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import 'dotenv/config';
import { AuthSocket } from './socket.adapter';
import { Server } from 'socket.io';
import { SocketStateService } from './socket-state.service';

interface CreateLobbyData {
    name: string;
}

interface JoinLobbyData {
    lobby: string;
}

@WebSocketGateway(Number(process.env.WSPORT), {
    cors: { origin: 'http://localhost:3000', methods: ['OPTIONS', 'POST', 'GET'] },
})
export class SocketGateway {
    @WebSocketServer() public socketServer: Server;

    public constructor(private readonly socketStateService: SocketStateService) {}

    afterInit() {
        this.socketStateService.socketServer = this.socketServer;
    }

    @SubscribeMessage('create-lobby')
    public async handleCreateLobby(@MessageBody() data: [CreateLobbyData], @ConnectedSocket() client: AuthSocket) {
        const { name } = data[0];
        const newLobby = await this.socketStateService.createLobby(name, client);
        this.socketStateService.broadcast(client, 'update-lobby-list', newLobby);

        return newLobby;
    }

    @SubscribeMessage('join-lobby')
    public async handleJoinLobby(@MessageBody() data: [JoinLobbyData], @ConnectedSocket() client: AuthSocket) {
        const { lobby } = data[0];
        const newLobby = await this.socketStateService.joinLobby(lobby, client);
        if (newLobby) {
            this.socketStateService.broadcast(client, 'update-lobby-list', newLobby);
        }

        return false; // Don't respond to client
    }

    @SubscribeMessage('leave-lobby')
    public async handleLeaveLobby(@MessageBody() data: [JoinLobbyData], @ConnectedSocket() client: AuthSocket) {
        const { lobby } = data[0];
        const newLobby = await this.socketStateService.leaveLobby(lobby, client);
        if (newLobby) {
            this.socketStateService.broadcast(client, 'update-lobby-list', newLobby);
        }

        return false; // Don't respond to client
    }

    @SubscribeMessage('get-lobby-list')
    public async handleGetLobbies() {
        return await this.socketStateService.getAllLobbies(true);
    }
}
