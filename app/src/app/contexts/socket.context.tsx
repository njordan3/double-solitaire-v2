import { Dispatch, PropsWithChildren, createContext, useCallback, useContext, useMemo, useReducer } from "react";
import { Socket, io } from "socket.io-client";
import { useUserName } from "./user.context";

// Socket State
interface SocketState {
    connected: boolean;
    socket: Socket|null;
}

const initialSocketState: SocketState = { connected: false, socket: null };
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
    return useCallback((event: string, ...args: any[]) => socket?.emit(event, args), [socket]);
}

// Socket Dispatch
interface SocketAction {
    type: string;
    lobby?: string;
    userName?: string;
};
function socketStateReducer(socketState: SocketState, action: SocketAction): SocketState {
    const { type, lobby = '', userName = '' } = action;
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

// Provider
function SocketStateManager() {
    const { socket } = useSocketState();
    const dispatch = useSocketDispatch();
    if (socket) {
        socket.on('connect', () => {
            dispatch({ 'type': 'connected' });
        });
        socket.on('disconnect', () => {
            dispatch({ 'type': 'disconnected' });
        });
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