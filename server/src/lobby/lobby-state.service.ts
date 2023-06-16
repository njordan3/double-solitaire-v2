import { Injectable } from '@nestjs/common';
import { AuthSocket } from 'src/socket/socket.adapter';
import { UtilityService } from 'src/utility/utility.service';

export interface LobbyUserState {
    id: string;
    name: string;
}

export interface LobbyState {
    name: string;
    owner: LobbyUserState;
    partner?: LobbyUserState;
    spectators?: Map<string, LobbyUserState['name']>;
}

export interface SafeLobbyState {
    name: string;
    owner: LobbyUserState['name'];
    partner: LobbyUserState['name'];
    spectators: LobbyUserState['name'][];
}

@Injectable()
export class LobbyStateService {
    private lobbyState = new Map<string, LobbyState>();

    public constructor(private readonly utilityService: UtilityService) {}

    public create(name: string, socket: AuthSocket): [string, SafeLobbyState] {
        const lobbyId = crypto.randomUUID();
        const newLobby: LobbyState = { name, owner: { id: socket.id, name: socket.user.userName } };
        this.lobbyState.set(lobbyId, newLobby);
        return [lobbyId, this.toSafeState(newLobby)];
    }

    public join(lobbyId: string, socket: AuthSocket): [string, SafeLobbyState] | false {
        const existingLobby = this.get(lobbyId);
        if (existingLobby) {
            const newLobby: LobbyState = { ...existingLobby };
            const newLobbyUser = { id: socket.id, name: socket.user.userName };
            if (!newLobby.partner) {
                newLobby.partner = newLobbyUser;
            } else {
                newLobby.spectators.set(newLobbyUser.id, newLobbyUser.name);
            }

            this.lobbyState.set(lobbyId, newLobby);
            return [lobbyId, this.toSafeState(newLobby)];
        }
        return false;
    }

    public leave(lobbyId: string, socket: AuthSocket): [string, SafeLobbyState] {
        const existingLobby = this.get(lobbyId);
        if (existingLobby) {
            const newLobby: LobbyState = { ...existingLobby };
            if (existingLobby.owner.id === socket.id) {
                this.delete(lobbyId);
                return [lobbyId, null];
            } else if (existingLobby?.partner?.id === socket.id) {
                newLobby.partner = undefined;
            } else {
                newLobby?.spectators?.delete(socket.id);
            }

            this.lobbyState.set(lobbyId, newLobby);
            return [lobbyId, this.toSafeState(newLobby)];
        }

        return [lobbyId, null];
    }

    public delete(lobbyId: string) {
        const existingLobby = this.get(lobbyId);
        if (existingLobby) {
            this.lobbyState.delete(lobbyId);
        }
    }

    public get(lobbyId: string): LobbyState {
        return this.lobbyState.get(lobbyId);
    }

    private toSafeState(lobbyState: LobbyState): SafeLobbyState {
        const { owner, partner, spectators, ...rest } = lobbyState;
        const safeSpectators: SafeLobbyState['spectators'] = [];
        if (spectators) {
            spectators.forEach((userName) => {
                safeSpectators.push(userName);
            });
        }

        return {
            ...rest,
            owner: owner.name,
            partner: partner?.name || '?',
            spectators: safeSpectators,
        };
    }

    public getAll(safeForClient = false) {
        if (safeForClient) {
            const safeLobbies: [string, SafeLobbyState][] = [];
            this.lobbyState.forEach((lobby, lobbyId) => {
                safeLobbies.push([lobbyId, this.toSafeState(lobby)]);
            });
            return safeLobbies;
        }

        const lobbies: [string, LobbyState][] = [];
        this.lobbyState.forEach((lobby, lobbyId) => {
            lobbies.push([lobbyId, lobby]);
        });
        return lobbies;
    }

    public isLobbyFull(lobbyId: string) {
        const existingLobby = this.get(lobbyId);
        if (existingLobby) {
            const { owner, partner = false, spectators } = existingLobby;
            return owner && partner && spectators?.size >= 12;
        }

        return false;
    }

    public isValidToJoin(lobbyId: string): boolean {
        const lobbyIdString = this.utilityService.toString(lobbyId);
        if (lobbyIdString.length) {
            return this.isLobbyFull(lobbyIdString);
        }

        return false;
    }
}
