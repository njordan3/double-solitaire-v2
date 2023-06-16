import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, Socket, ServerOptions } from 'socket.io';
import { INestApplicationContext, WebSocketAdapter } from '@nestjs/common';
import { SocketStateService } from './socket-state.service';
import { LobbyStateService } from 'src/lobby/lobby-state.service';

export interface AuthSocket extends Socket {
    user: {
        userName: string;
    };
}

// https://dev.to/rukshanjs/part-23-how-to-create-a-server-side-timer-using-websockets-with-socketio-nestjs-and-flutter-4o3n
// https://blog.logrocket.com/scalable-websockets-with-nestjs-and-redis/
export class SocketStateAdapter extends IoAdapter implements WebSocketAdapter {
    public constructor(
        private readonly app: INestApplicationContext,
        private readonly socketStateService: SocketStateService,
        private readonly lobbyStateService: LobbyStateService,
    ) {
        super(app);
    }

    private server: Server;

    public create(port: number, options: ServerOptions): Server {
        this.server = super.createIOServer(port, options);
        this.server.use(async (socket: AuthSocket, next) => {
            const userName = (socket.handshake.query?.userName || '') as string;

            if (!userName || !userName.length) {
                socket.user = null;
                return next();
            }

            try {
                socket.user = { userName };

                return next();
            } catch (e) {
                return next(e);
            }
        });

        return this.server;
    }

    public bindClientConnect(server: Server, callback: (socket: AuthSocket) => void): void {
        server.on('connection', (socket: AuthSocket) => {
            if (socket.user) {
                this.socketStateService.connect(socket);

                // 'disconnect' event doesn't have rooms available
                socket.on('disconnecting', () => {
                    this.socketStateService.disconnect(socket);
                });

                socket.emit('get-lobby-list', this.socketStateService.getAllLobbies(true)); // Load lobbies when they connect
            }

            callback(socket);
        });
    }
}
