import type { GebietResource, ThemaResource } from '../Resources.ts';
import { ThemaDescription } from './ThemaDescription.tsx';
import { useState, useEffect } from 'react';
import { deleteGebiet, getAlleThemen } from '../backend/api';
import { LoadingIndicator } from './LoadingIndicator';
import Container  from 'react-bootstrap/Container';
import { LinkContainer } from './LinkContainer.tsx';
import { Button, Modal } from 'react-bootstrap';
import { MiniMap } from './MiniMap.tsx';
import { useLoginContext } from '../auth/LoginContext.ts';
import { useNavigate } from 'react-router';

export function Gebiet(
    props: {
        gebiet: GebietResource,
        onEdit?: () => void
    }
) {
    const { loginInfo } = useLoginContext();
    const myGebiet = props.gebiet;
    const onEdit = props.onEdit;
    const [themen, setThemen] = useState<ThemaResource[]>([]);
    const [loadingThemen, setLoadingThemen] = useState<boolean>(true);
    const [selectedThema, setSelectedThema] = useState<string | null>(null);

    const [showDelete, setShowDelete] = useState(false);

    const gebietId = myGebiet.id; 

    const darfBearbeiten = loginInfo && (loginInfo.role === "a" || loginInfo.id === myGebiet.verwalter);

    useEffect(() => {
        if (!gebietId) {
            setLoadingThemen(false);
            return;
        }
        

        async function ladeThemen() {
            try {
                setLoadingThemen(true);
                const daten = await getAlleThemen(gebietId!);
                
                setThemen(daten);
                
            } catch (error) {
                console.error("Fehler beim Laden der Themen:", error);
            } finally {
                
                setLoadingThemen(false);
                
            }
        }

        ladeThemen();        
    }, [gebietId]);

    useEffect(() => {
        if (!selectedThema) return;

        document
            .getElementById(selectedThema)
            ?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
    }, [selectedThema]);

    const navigate = useNavigate();

    async function handleDelete() {
        if (!gebietId) return;

        try {
            await deleteGebiet(gebietId);
            setShowDelete(false);
            navigate("/");
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <Container className='mt-4'>
            <h1>{myGebiet.name}</h1>
            <h4 className='mb-4'>{myGebiet.beschreibung}</h4>

            <MiniMap
                items={themen.map(thema => ({
                    id: thema.id,
                    text: thema.titel,
                }))}
                selectedId={selectedThema}
                onSelect={setSelectedThema}
            />

            <h4>Themen: {themen.length}</h4>
            
            {loadingThemen ? (
                <LoadingIndicator />
            ) : themen.length === 0 ? (
                <p>Keine Themen in diesem Gebiet vorhanden.</p>
            ) : (
                themen.map(thema => 
                    <ThemaDescription key={thema.id} thema={thema} selected={thema.id === selectedThema}/>
                )
            )}

            <LinkContainer to={"/"} >
                <Button className='mb-4 me-2'>
                    Zurück zur Übersicht
                </Button>
            </LinkContainer>

            {darfBearbeiten && (
                <>
                    <Button
                        className="mb-4 me-2"
                        onClick={onEdit}
                    >
                        Editieren
                    </Button>

                    {!loadingThemen && themen.length === 0 && (
                        <Button
                            variant="danger"
                            className="mb-4 me-2"
                            onClick={() => setShowDelete(true)}
                        >
                            Löschen
                        </Button>
                    )}
                </>
            )}

            {darfBearbeiten && (
                <LinkContainer to={`/gebiet/${myGebiet.id}/thema/neu`}>
                    <Button className="mb-4 me-2">
                        Neues Thema
                    </Button>
                </LinkContainer>
            )}

            <Modal
                show={showDelete}
                onHide={() => setShowDelete(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Gebiet löschen</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    Soll dieses Gebiet wirklich gelöscht werden?
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowDelete(false)}
                    >
                        Abbrechen
                    </Button>

                    <Button
                        variant="danger"
                        onClick={handleDelete}
                    >
                        OK
                    </Button>
                </Modal.Footer>
            </Modal>

        </Container>
    )
}