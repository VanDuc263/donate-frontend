import {createContext, useContext, useState} from "react";

interface User {
    username : string
}

interface AuthContextType {
    user : User | null;
    login: (username: string) => void;
    logout : () => void;
}

const AuthContext = createContext<AuthContextType | null >(null)

export const AuthProvider  = ({children} : any) => {
    const [user,setUser] = useState<User | null>(null);

    const login = (username: string) => {
        setUser({ username });
    };


    const logout = () => {
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    return useContext(AuthContext)!;
}
