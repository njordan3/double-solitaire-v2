import { useEffect } from "react";
import { useContext } from "react";
import { Dispatch, PropsWithChildren, createContext, useReducer } from "react";

// User State
interface UserState {
    userName: string;
}

const initialUserState: UserState = { userName: '' };
const UserStateContext = createContext<UserState>(initialUserState);

export function useUserState(): UserState {
    return useContext(UserStateContext);
}

export function useUserName(): UserState['userName'] {
    const { userName } = useUserState();
    return userName;
}

export function useSetUserName(): Dispatch<string> {
    const dispatch = useUserDispatch();
    return (userName: string) => dispatch({ type: 'set-username', userName });
}

export function useUserNameState(): [UserState['userName'], Dispatch<string>] {
    return [useUserName(), useSetUserName()];
}

// User Provider
interface UserAction {
    type: string;
    userName?: UserState['userName'];
    user?: UserState;
}
function userStateReducer(userState: UserState, action: UserAction): UserState {
    const {
        type,
        userName = '',
        user = initialUserState
    } = action;

    switch (type) {
        case 'set-username': {
            return { ...userState, userName };
        }
        case 'set-user': {
            return user;
        }
        default: {
            throw Error('Unknown UserState action: ' + action.type);
        }
    }
}
const UserDispatchContext = createContext<Dispatch<UserAction>>((value) => { return; });
export function useUserDispatch() {
    return useContext(UserDispatchContext);
}

function UserStateManager() {
    const dispatch = useUserDispatch();
    useEffect(() => {
        const existingUser = localStorage.getItem('double-solitaire-user-state');
        if (typeof window !== undefined && existingUser) {
            const user: UserState = JSON.parse(existingUser);
            dispatch({ type: 'set-user', user });
        }
    }, [dispatch]);

    return <></>
}

export function UserProvider({ children } : PropsWithChildren ) {
    const [userState, dispatch] = useReducer(userStateReducer, initialUserState);

    return (
        <UserStateContext.Provider value={userState}>
            <UserDispatchContext.Provider value={dispatch}>
                <UserStateManager />
                {children}
            </UserDispatchContext.Provider>
        </UserStateContext.Provider>
    );
}