import { Injectable } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { AuthSocket } from './socket.adapter';
import { LobbyState, LobbyStateService } from 'src/lobby/lobby-state.service';

interface SocketState {
    sockets: Socket[];
}

@Injectable()
export class SocketStateService {
    private socketState = new Map<string, SocketState>();
    public socketServer: Server = null;

    public constructor(private readonly lobbyStateService: LobbyStateService) {}

    private getUserId(socket: AuthSocket) {
        return `user:${socket.user.userName}-device:${socket.id}`;
    }

    public connect(socket: AuthSocket): boolean {
        const userId = this.getUserId(socket);

        const existingSocketState = this.socketState.get(userId) || { sockets: [] };
        existingSocketState.sockets.push(socket);
        this.socketState.set(userId, existingSocketState);

        return true;
    }

    public async disconnect(socket: AuthSocket): Promise<boolean> {
        await this.leaveAllLobbies(socket);

        const userId = this.getUserId(socket);
        const existingSocketState = this.get(socket);
        if (!existingSocketState || !existingSocketState.sockets.length) {
            return true;
        }

        existingSocketState.sockets = existingSocketState.sockets.filter((s) => s.id !== socket.id);
        if (!existingSocketState.sockets.length) {
            this.socketState.delete(userId);
        } else {
            this.socketState.set(userId, existingSocketState);
        }

        return true;
    }

    public get(socket: AuthSocket): SocketState | undefined {
        const userId = this.getUserId(socket);
        return this.socketState.get(userId);
    }

    public getAll(): string[] {
        const all: string[] = [];
        this.socketState.forEach((sockets) => all.push(sockets.sockets.map((s) => s.id).join(' -- ')));
        return all;
    }

    public async createLobby(lobbyName: LobbyState['name'], socket: AuthSocket) {
        const newLobby = this.lobbyStateService.create(lobbyName, socket);
        await this.leaveAllLobbies(socket);
        await socket.join(newLobby[0]);
        return newLobby;
    }

    public async joinLobby(lobbyId: string, socket: AuthSocket) {
        if (this.lobbyStateService.isValidToJoin(lobbyId)) {
            await this.leaveAllLobbies(socket);
            await socket.join(lobbyId);
            return await this.lobbyStateService.join(lobbyId, socket);
        }

        return false;
    }

    public async leaveLobby(lobbyId: string, socket: AuthSocket) {
        await socket.leave(lobbyId);
        return this.lobbyStateService.leave(lobbyId, socket);
    }

    public async leaveAllLobbies(socket: AuthSocket) {
        for (const lobby of socket.rooms) {
            // An item, usually the first, will be the socker id
            if (lobby !== socket.id) {
                const newLobby = await this.leaveLobby(lobby, socket);
                this.broadcast(socket, 'update-lobby-list', newLobby);
            }
        }
    }

    public getAllLobbies(safeForClient = false) {
        return this.lobbyStateService.getAll(safeForClient);
    }

    public broadcast(socket: AuthSocket, event: string, ...args: any[]) {
        const lobbies = this.lobbyStateService.getAll() as [string, LobbyState][];
        const excludeRooms = lobbies.map(([lobbyId]) => lobbyId);
        this.socketServer.except(excludeRooms).volatile.emit(event, args);
        // const existingSocket = this.get(socket);
        // if (existingSocket) {
        //     existingSocket.sockets[0].volatile.broadcast.emit(event, args);
        // }
    }
}
