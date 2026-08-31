import { useState, useEffect } from 'react';
import { Navigate, useParams } from 'react-router';
import { Gebiet } from "./Gebiet";
import { getGebiet } from '../backend/api';
import { LoadingIndicator } from './LoadingIndicator';
import type { GebietResource } from '../Resources.ts';
import { useErrorBoundary } from "react-error-boundary";
import { GebietForm } from './forms/GebietForm.tsx';
import { useLoginContext } from '../auth/LoginContext.ts';

export function PageGebiet(){
    const {id} = useParams();
    const [gebiet, setGebiet] = useState<GebietResource | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const { showBoundary } = useErrorBoundary();
    const { loginInfo } = useLoginContext();
    const neuesGebiet = id === "neu";

    const [editing, setEditing] = useState(false);

    useEffect(() => {
        if (!id || id === "neu") {
            setLoading(false);
            return;
        }

        async function ladeGebiet() {
            try {
                setLoading(true);
                const daten = await getGebiet(id!);
                setGebiet(daten);
            } catch (error) {
                showBoundary(error);
            } finally {
                setLoading(false);
            }
        }

        ladeGebiet();
    }, [id]);

    if (neuesGebiet) {
        if (loginInfo === undefined) {
            return <LoadingIndicator />;
        }
        
        if (!loginInfo || loginInfo.role !== "a") {
            return <Navigate to="/" replace />;
        }

        return <GebietForm />;
    }

    if (loading) {
        return <LoadingIndicator />;
    }

    if (!gebiet) {
        return <div>Gebiet nicht gefunden</div>;
    }

    if (editing) {
        return (
            <GebietForm
                gebiet={gebiet}
                onCancel={() => setEditing(false)}
                onSave={(updatedGebiet) => {
                    setGebiet(updatedGebiet);
                    setEditing(false);
                }}
            />
        );
    }
    

    return (
        <>
            <Gebiet 
                gebiet={gebiet}
                onEdit={() => setEditing(true)}
            />
        </>
    )
}