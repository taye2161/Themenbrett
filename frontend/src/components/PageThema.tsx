import { useParams } from "react-router";
import { useState, useEffect } from 'react';
import { Thema } from "./Thema";
import { getThema } from '../backend/api';
import type { ThemaResource } from '../Resources.ts';
import { LoadingIndicator } from "./LoadingIndicator.tsx";
import { useErrorBoundary } from "react-error-boundary";
import { ThemaForm } from "./forms/ThemaForm.tsx";


export function PageThema(){
    const { gebietId, themaId } = useParams();
    const [thema, setThema] = useState<ThemaResource>();
    const [loading, setLoading] = useState<boolean>(true);
    const [editing, setEditing] = useState(false);
    const { showBoundary } = useErrorBoundary();

    const neuesThema = Boolean(gebietId) && themaId === undefined;

    useEffect(() => {
        if (neuesThema) {
            setLoading(false);
            return;
        }

        if (!themaId) {
            setLoading(false);
            return;
        }
        
        async function ladeThema() {
            try {
                setLoading(true);
                const daten = await getThema(themaId!);
                setThema(daten);
            } catch (error) {
                showBoundary(error);
            } finally {
                setLoading(false);
            }
        }

        ladeThema();
    }, [themaId, neuesThema, showBoundary]);

    if (neuesThema && gebietId) {
        return <ThemaForm gebietId={gebietId} />;
    }

    if (!themaId) {
        return <div>Ungültige URL</div>;
    }

    if (loading) {
        return <LoadingIndicator />;
    }

    if(!thema){
        return <div>Thema nicht gefunden</div>
    }

    if (editing) {
        return (
            <ThemaForm
                gebietId={thema.gebiet}
                thema={thema}
                onCancel={() => setEditing(false)}
                onSave={(updatedThema) => {
                    setThema(updatedThema);
                    setEditing(false);
                }}
            />
        );
    }

    return (
        <>
            <Thema 
                thema={thema}
                onEdit={() => setEditing(true)} 
            />
        </>
    )
}