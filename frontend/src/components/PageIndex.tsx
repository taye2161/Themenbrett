import { useEffect, useState } from "react";
import { AlleGebiete } from "./AlleGebiete";
import type { GebietResource } from "../Resources";
import { getAlleGebiete } from "../backend/api";
import { LoadingIndicator } from "./LoadingIndicator";
import { useLoginContext } from "../auth/LoginContext";

export function PageIndex(){
    const [gebiete, setGebiete] = useState<GebietResource[]>([]);
    const [loading, setLoading] = useState(true);
    const { loginInfo } = useLoginContext();

    useEffect(() => {
        if (loginInfo === undefined) {
            return;
        }


        async function ladeDaten() {
            try {
                const daten = await getAlleGebiete();
                setGebiete(daten);
            } finally {
                setLoading(false);
            }
        }

        ladeDaten();
    }, [loginInfo]);
    
    if (loading) {
        return <LoadingIndicator />;
    }
    
    return <AlleGebiete gebiete={gebiete} />;
}