import { Navigate } from "react-router";
import { useLoginContext } from "../auth/LoginContext";
import { ChangePassword } from "./ChangePassword";
import { LoadingIndicator } from "./LoadingIndicator";

export function PagePrefs(){
    const { loginInfo } = useLoginContext();

    if (loginInfo === undefined) {
        return <LoadingIndicator />;
    }

    if (!loginInfo) {
        return <Navigate to="/" replace />;
    }
    
    return (
        <ChangePassword/>
    )
}