import { useEffect, useState } from "react";
import { LoginContext } from "./LoginContext";
import type { LoginResource } from "../Resources";
import { getLogin } from "../backend/api";

type LoginProviderProps = {
    children: React.ReactNode;
};

export function LoginProvider({ children }: LoginProviderProps) {
    const [loginInfo, setLoginInfo] =
        useState<LoginResource | false | undefined>(undefined);

    useEffect(() => {
        async function loadLogin() {
            try {
                const login = await getLogin();
                setLoginInfo(login);
            } catch (error) {
                console.error(error);
                setLoginInfo(false);
            }
        }

        loadLogin();
    }, []);

    return (
        <LoginContext.Provider value={{ loginInfo, setLoginInfo }}>
            {children}
        </LoginContext.Provider>
    );
}