import { createContext, useContext } from "react";
import type { LoginResource } from "../Resources";

interface LoginContextType {
    loginInfo: LoginResource | false | undefined;
    setLoginInfo: (loginInfo: LoginResource | false) => void
}

export const LoginContext = createContext<LoginContextType>({} as LoginContextType);

export const useLoginContext = () => useContext(LoginContext);