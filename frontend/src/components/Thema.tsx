import { Button, Container, Modal } from 'react-bootstrap';
import type { ThemaResource } from '../Resources.ts';
import { LinkContainer } from './LinkContainer.tsx';
import { useLoginContext } from '../auth/LoginContext.ts';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { deleteThema } from '../backend/api.ts';

export function Thema(
    props: {
        thema: ThemaResource
        onEdit?: () => void;
    }
) {
    const myThema = props.thema;

    const { loginInfo } = useLoginContext();
    const onEdit = props.onEdit;

    const [showDelete, setShowDelete] = useState(false);
    const navigate = useNavigate();
    

    const darfBearbeiten = loginInfo !== undefined && loginInfo !== false && (loginInfo.role === "a" || loginInfo.id === myThema.betreuer);

    async function handleDelete() {
        if (!myThema.id) return;

        try {
            await deleteThema(myThema.id);
            setShowDelete(false);
            navigate(`/gebiet/${myThema.gebiet}`);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Container>
            <h3 className='mt-4 mb-4'>{myThema.titel}</h3>
            <p>Abschluss: {myThema.abschluss}</p>
            <p>Status: {myThema.status}</p>
            <p>Betreuer: {myThema.betreuerName}</p>
            <p>Letzte Änderung: {myThema.updatedAt}</p>
            <p>Beschreibung: {myThema.beschreibung}</p>
            <LinkContainer to={`/gebiet/${myThema.gebiet}`}>
                <Button className='me-2'>Zurück zur Übersicht</Button>
            </LinkContainer>
            {darfBearbeiten && (
                <>
                    <Button className="me-2" onClick={onEdit}>
                        Editieren
                    </Button>

                    <Button className='me-2' variant='danger' onClick={() => setShowDelete(true)}>
                        Löschen
                    </Button>
                </> 
            )}

            <Modal
                show={showDelete}
                onHide={() => setShowDelete(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Thema löschen</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    Soll dieses Thema wirklich gelöscht werden?
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