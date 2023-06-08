import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

interface SocketState {
    sockets: Socket[];
}

@Injectable()
export class SocketStateService {
    private socketState = new Map<string, SocketState>();

    private getUserId(userName: string, socketId: string) {
        return `user:${userName}-device:${socketId}`;
    }

    public add(userName: string, socket: Socket): boolean {
        const userId = this.getUserId(userName, socket.id);

        const existingSocketState = this.socketState.get(userId) || { sockets: [] };
        existingSocketState.sockets.push(socket);
        this.socketState.set(userId, existingSocketState);

        return true;
    }

    public remove(userName: string, socket: Socket): boolean {
        const userId = this.getUserId(userName, socket.id);

        const existingSocketState = this.socketState.get(userId);
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

    public get(userName: string, socket: Socket): SocketState | false {
        const userId = this.getUserId(userName, socket.id);
        return this.socketState.get(userId) || false;
    }

    public getAll(): SocketState[] {
        const all: SocketState[] = [];
        this.socketState.forEach((sockets) => all.push(sockets));
        return all;
    }
}
