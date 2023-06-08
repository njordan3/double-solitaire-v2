import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, Socket, ServerOptions } from 'socket.io';
import { INestApplicationContext, WebSocketAdapter } from '@nestjs/common';
import { SocketStateService } from './socket-state.service';

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
                socket.user = {
                    userName,
                };

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
                this.socketStateService.add(socket.user.userName, socket);

                socket.on('disconnect', () => {
                    this.socketStateService.remove(socket.user.userName, socket);
                });
            }

            callback(socket);
        });
    }
}
