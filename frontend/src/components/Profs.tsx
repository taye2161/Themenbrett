import { useEffect, useState } from "react";
import { Button, Container, Modal, Table } from "react-bootstrap";
import { LoadingIndicator } from "./LoadingIndicator";
import type { ProfResource } from "../Resources";
import { useErrorBoundary } from "react-error-boundary";
import { deleteProf, getAlleProfs } from "../backend/api";
import { ProfForm } from "./forms/ProfForm";

export function Profs() {
    const [profs, setProfs] = useState<ProfResource[]>([]);
    const [loading, setLoading] = useState(true);
    const [profToDelete, setProfToDelete] = useState<ProfResource | null>(null);

    const { showBoundary } = useErrorBoundary();

    const [editingProfId, setEditingProfId] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        async function ladeProfs() {
            try {
                const daten = await getAlleProfs();
                setProfs(daten);
            } catch (error) {
                showBoundary(error);
            } finally {
                setLoading(false);
            }
        }

        ladeProfs();
    }, []);

    if (loading) {
        return <LoadingIndicator />;
    }

    async function handleDelete() {
        if (!profToDelete?.id) {
            return;
        }

        try {
            await deleteProf(profToDelete.id);

            setProfs(previous =>
                previous.filter(
                    current => current.id !== profToDelete.id
                )
            );

            setProfToDelete(null);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Container className="mt-4">
            <h2 className="mb-4">Professoren</h2>

            {creating ? (
                <ProfForm
                    onCancel={() => setCreating(false)}
                    onSave={(createdProf) => {
                        setProfs(previous => [
                            ...previous,
                            createdProf
                        ]);

                        setCreating(false);
                    }}
                />
            ) : (
                <Button
                    className="mb-3"
                    onClick={() => setCreating(true)}
                >
                    Neuer Prof
                </Button>
            )}

            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Titel</th>
                        <th>Admin Status</th>
                        <th>Aktionen</th>
                    </tr>
                </thead>

                <tbody>
                    {profs.map((prof) => (
                        editingProfId === prof.id ? (
                            <tr key={prof.id}>
                                <td colSpan={4}>
                                    <ProfForm
                                        prof={prof}
                                        onCancel={() =>
                                            setEditingProfId(null)
                                        }
                                        onSave={(updatedProf) => {
                                            setProfs(previous =>
                                                previous.map(current =>
                                                    current.id === updatedProf.id
                                                        ? updatedProf
                                                        : current
                                                )
                                            );

                                            setEditingProfId(null);
                                        }}
                                    />
                                </td>
                            </tr>
                        ) : (
                            <tr key={prof.id}>
                                <td>{prof.name}</td>
                                <td>{prof.titel}</td>
                                <td>
                                    {prof.admin ? "admin" : "kein admin"}
                                </td>
                                <td>
                                    <Button
                                        className="me-2"
                                        onClick={() =>
                                            setEditingProfId(prof.id!)
                                        }
                                    >
                                        Bearbeiten
                                    </Button>

                                    <Button 
                                        variant="danger"
                                        onClick={() => setProfToDelete(prof)}
                                    >
                                        Löschen
                                    </Button>
                                </td>
                            </tr>
                        )
                    ))}
                </tbody>
            </Table>

            <Modal
                show={profToDelete !== null}
                onHide={() => setProfToDelete(null)}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Prof löschen</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    Soll {profToDelete?.name} wirklich gelöscht werden?
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setProfToDelete(null)}
                    >
                        Abbrechen
                    </Button>

                    <Button
                        variant="danger"
                        onClick={handleDelete}
                    >
                        Ja
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    )
}