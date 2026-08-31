import { useState } from "react";
import { Button, Container, Form } from "react-bootstrap";
import { useNavigate } from "react-router";
import type { ThemaResource } from "../../Resources";
import { createThema, updateThema } from "../../backend/api";
import { useLoginContext } from "../../auth/LoginContext";

type ThemaFormProps = {
    gebietId: string;
    thema?: ThemaResource;
    onCancel?: () => void;
    onSave?: (thema: ThemaResource) => void;
};

export function ThemaForm({
    gebietId,
    thema,
    onCancel,
    onSave
}: ThemaFormProps) {
    const navigate = useNavigate();
    const { loginInfo } = useLoginContext();

    const [titel, setTitel] = useState(thema?.titel ?? "");
    const [abschluss, setAbschluss] = useState(thema?.abschluss ?? "");
    const [status, setStatus] = useState(thema?.status ?? "");
    const [beschreibung, setBeschreibung] = useState(
        thema?.beschreibung ?? ""
    );
    const [literatur, setLiteratur] = useState(thema?.literatur ?? "");

    function handleCancel() {
        if (thema) {
            onCancel?.();
        } else {
            navigate(`/gebiet/${gebietId}`);
        }
    }

    async function handleSave() {
        try {
            if (thema?.id) {
                const updated = await updateThema(thema.id, {
                    ...thema,
                    titel,
                    abschluss,
                    status,
                    beschreibung,
                    literatur
                });

                onSave?.(updated);
                return;
            }

            if (!loginInfo) {
                return;
            }

            await createThema(gebietId, {
                titel,
                abschluss,
                status,
                beschreibung,
                literatur,
                betreuer: loginInfo.id,
                gebiet: gebietId
            });

            navigate(`/gebiet/${gebietId}`);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Container className="mt-4">
            <h1>
                {thema ? "Thema bearbeiten" : "Neues Thema"}
            </h1>

            <Form>
                <Form.Group className="mb-3">
                    <Form.Label>Titel</Form.Label>
                    <Form.Control
                        type="text"
                        value={titel}
                        onChange={(event) =>
                            setTitel(event.target.value)
                        }
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Abschluss</Form.Label>
                    <Form.Select
                        value={abschluss}
                        onChange={(event) =>
                            setAbschluss(event.target.value)
                        }
                    >
                        <option value="">Bitte auswählen</option>
                        <option value="bsc">Bachelor</option>
                        <option value="msc">Master</option>
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                        value={status}
                        onChange={(event) =>
                            setStatus(event.target.value)
                        }
                    >
                        <option value="">Bitte auswählen</option>
                        <option value="offen">Offen</option>
                        <option value="reserviert">Reserviert</option>
                        <option value="geschlossen">Geschlossen</option>
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Beschreibung</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={4}
                        value={beschreibung}
                        onChange={(event) =>
                            setBeschreibung(event.target.value)
                        }
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Literatur</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={literatur}
                        onChange={(event) =>
                            setLiteratur(event.target.value)
                        }
                    />
                </Form.Group>

                <Button
                    variant="primary"
                    className="me-2"
                    onClick={handleSave}
                >
                    Speichern
                </Button>

                <Button
                    variant="secondary"
                    onClick={handleCancel}
                >
                    Abbrechen
                </Button>
            </Form>
        </Container>
    );
}