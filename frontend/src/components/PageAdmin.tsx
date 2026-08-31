import { Navigate } from "react-router";
import { useLoginContext } from "../auth/LoginContext";
import { LoadingIndicator } from "./LoadingIndicator";
import { Profs } from "./Profs";

export function PageAdmin(){
    const { loginInfo } = useLoginContext();

    if (loginInfo === undefined) {
        return <LoadingIndicator />;
    }

    if (!loginInfo || loginInfo.role !== "a") {
        return <Navigate to="/" replace />;
    }

    return (
        <Profs/>
    )
}