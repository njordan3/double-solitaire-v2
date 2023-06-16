import { Dispatch, PropsWithChildren, createContext, useCallback, useContext, useMemo, useReducer } from "react";
import { Socket, io } from "socket.io-client";
import { useUserName } from "./user.context";

export interface LobbyState {
    name: string;
    owner: string;
    partner: string;
    spectators: string[];
}

// Socket State
interface SocketState {
    connected: boolean;
    lobbyList: Map<string, LobbyState>;
    socket: Socket|null;
};

const initialSocketState: SocketState = { connected: false, socket: null, lobbyList: new Map() };
const SocketStateContext = createContext<SocketState>(initialSocketState);
export function useSocketState(): SocketState {
    return useContext(SocketStateContext);
}

export function useIsSocketConnected(useSocketObject: boolean = true): boolean {
    const socketState = useSocketState();
    return useMemo(() => useSocketObject ? (socketState.socket?.connected ?? false) : socketState.connected, [socketState, useSocketObject]);
}

export function useSocketEmit() {
    const { socket } = useSocketState();
    return useCallback(async (event: string, ...args: any[]) => socket?.emitWithAck(event, args), [socket]);
}

export function useLobbyList() {
    const { lobbyList } = useSocketState();
    return lobbyList;
}

// Socket Dispatch
interface SocketAction {
    type: string;
    lobbyList?: SocketState['lobbyList'];
    updatedLobby?: [string, LobbyState];
    userName?: string;
};
function socketStateReducer(socketState: SocketState, action: SocketAction): SocketState {
    const { type, lobbyList = [], userName = '', updatedLobby } = action;
    const { socket } = socketState;

    switch (type) {
        case 'connect': {
            let newSocket: Socket | null = null;
            if (socket) {
                socket.disconnect();
            }

            if (userName.length) {
                newSocket = io(`http://localhost:5001`, { query: { userName } });
                newSocket.connect();
            }
            
            return { ...socketState, socket: newSocket };
        }
        case 'leave': {
            if (socket) {
                socket.disconnect();
            }
            return { ...socketState, connected: false, socket: null };
        }
        case 'connected': { // connected and disconnected are for react state management about the socket's connection state
            return { ...socketState, connected: true } as SocketState;
        }
        case 'disconnected': {
            return { ...socketState, connected: false } as SocketState;
        }
        case 'set-lobby-list': {
            const newLobbyList = new Map(lobbyList);
            return { ...socketState, lobbyList: newLobbyList } as SocketState;
        }
        case 'update-lobby-list': {
            const newLobbyList = new Map(socketState.lobbyList);
            if (updatedLobby) {
                if (updatedLobby[1] !== null) {
                    newLobbyList.set(updatedLobby[0], updatedLobby[1]);
                } else {
                    newLobbyList.delete(updatedLobby[0]);
                }
                
            }
            return { ...socketState, lobbyList: newLobbyList } as SocketState;
        }
        default: {
            throw Error('Unknown SocketState action: ' + action.type);
        }
    }
}

const SocketDispatchContext = createContext<Dispatch<SocketAction>>((value) => { return; });
export function useSocketDispatch(): Dispatch<SocketAction> {
    return useContext(SocketDispatchContext);
}

export function useSocketConnect(): Dispatch<SocketAction> {
    const dispatch = useSocketDispatch();
    const userName = useUserName();
    return () => dispatch({ type: 'connect', userName });
}

export function useSocketDisconnect(): Dispatch<SocketAction> {
    const dispatch = useSocketDispatch();
    return () => dispatch({ type: 'leave' });
}

export function useCreateLobby(): Dispatch<SocketAction> {
    const emit = useSocketEmit();
    return useCallback(() => {
        emit('create-lobby', { name: 'Test Lobby' })
            .then((response) => {
                console.log(response);
            });
    }, [emit]);
}

export function useJoinLobby(): Dispatch<SocketAction> {
    const emit = useSocketEmit();
    return useCallback(() => {
        emit('join-lobby', { lobby: 'testlobby' });
    }, [emit]);
}

// Provider
function SocketStateManager() {
    const { socket } = useSocketState();
    const dispatch = useSocketDispatch();
    if (socket) {
        socket.removeAllListeners();
        socket.on('connect', () => {
            dispatch({ 'type': 'connected' });
        });
        socket.on('disconnect', () => {
            dispatch({ 'type': 'disconnected' });
        });
        socket.on('update-lobby-list', ([updatedLobby, ...rest]) => {
            dispatch({ type: 'update-lobby-list', updatedLobby });
        });
        socket.on('get-lobby-list', (lobbyList) => {
            dispatch({ type: 'set-lobby-list', lobbyList });
        })
    }

    return <></>;
}

export function SocketProvider({ children } : PropsWithChildren ) {
    const [socketState, dispatch] = useReducer(socketStateReducer, initialSocketState);

    return (
        <SocketStateContext.Provider value={socketState}>
            <SocketDispatchContext.Provider value={dispatch}>
                <SocketStateManager />
                {children}
            </SocketDispatchContext.Provider>
        </SocketStateContext.Provider>
    );
}