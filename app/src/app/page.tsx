"use client"

import { useCallback, useMemo } from "react";
import { LobbyState, useCreateLobby, useIsSocketConnected, useJoinLobby, useLobbyList, useSocketConnect, useSocketDisconnect, useSocketEmit } from "./contexts/socket.context";
import { useUserNameState } from "./contexts/user.context";

export default function Home() {
    const isConnected = useIsSocketConnected();
    const connect = useSocketConnect();
    const disconnect = useSocketDisconnect();

    const [userName, setUserName] = useUserNameState();
    const disabled = useMemo(() => !userName.length, [userName]);

    const createLobby = useCreateLobby();
    const joinLobby = useJoinLobby();
    const lobbyList = useLobbyList();
    const lobbyListArray = useMemo(() => {
        const result: ({ lobbyId: string } & LobbyState)[] = [];
        lobbyList.forEach((lobby, lobbyId) => {
            result.push({ lobbyId, ...lobby });
        });
        return result;
    }, [lobbyList]);

    return (
        <>
            <p>{isConnected ? 'Connected' : 'Not Connected'}</p>
            <input value={userName} onChange={(e) => setUserName(e.target.value)} className="border border-gray-300 rounded-md px-2" />
            <button onClick={connect} className="border border-gray-300 hover:bg-gray-100 rounded-md px-2">Connect</button>
            <button onClick={disconnect} className="border border-gray-300 hover:bg-gray-100 rounded-md px-2">Disconnect</button>
            <button
                onClick={createLobby}
                disabled={disabled}
                className="border border-gray-300 hover:bg-gray-100 rounded-md px-2"
            >
                Create Lobby
            </button>
            <button
                onClick={joinLobby}
                disabled={disabled}
                className="border border-gray-300 hover:bg-gray-100 rounded-md px-2"
            >
                Join Lobby
            </button>
            {isConnected ? (
                <div className="max-w-lg overflow-y-auto">
                    <table className="table-auto w-full bg-white border border-gray-300 rounded-md">
                        <thead className="bg-gray-200">
                            <tr>
                                <th>Name</th>
                                <th>Players</th>
                                <th>Spectators</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lobbyListArray.map(({ lobbyId, name, owner, partner, spectators}) => (
                                <tr
                                    key={crypto.randomUUID()}
                                    onClick={() => console.log(lobbyId)}
                                    className="hover:cursor-pointer hover:bg-blue-300 even:bg-gray-100 text-center"
                                >
                                    <td>{name}</td>
                                    <td>
                                        <span className="px-1 border border-green-200 bg-green-100 rounded-sm">{owner}</span>
                                        <span className="px-1">vs.</span>
                                        <span className="px-1 border border-red-200 bg-red-100 rounded-sm">{partner}</span>
                                    </td>
                                    <td>
                                        {`${spectators.length}`}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                null
            )}
        </>
    );
}
