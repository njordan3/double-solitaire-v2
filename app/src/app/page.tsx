"use client"

import { useIsSocketConnected, useSocketConnect, useSocketDisconnect, useSocketEmit } from "./contexts/socket.context";
import { useUserNameState } from "./contexts/user.context";

export default function Home() {
    const isConnected = useIsSocketConnected();
    const connect = useSocketConnect();
    const disconnect = useSocketDisconnect();
    const emit = useSocketEmit();

    const [userName, setUserName] = useUserNameState();

    return (
        <>
            <p>{isConnected ? 'Connected' : 'Not Connected'}</p>
            <input value={userName} onChange={(e) => setUserName(e.target.value)} className="border border-gray-300 rounded-md px-2" />
            <button onClick={connect} className="border border-gray-300 rounded-md px-2">Connect</button>
            <button onClick={disconnect} className="border border-gray-300 rounded-md px-2">Disconnect</button>
            <button onClick={() => emit('join-lobby', { lobby: 'testlobby' })} className="border border-gray-300 rounded-md px-2">Join Lobby</button>
        </>
    );
}
