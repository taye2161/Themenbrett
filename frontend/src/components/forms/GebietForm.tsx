import { useState } from "react";
import { Button, Container, Form } from "react-bootstrap";
import { useNavigate } from "react-router";
import { createGebiet, updateGebiet } from "../../backend/api";
import type { GebietResource } from "../../Resources";

type GebietFormProps = {
    gebiet?: GebietResource;
    onCancel?: () => void;
    onSave?: (gebiet: GebietResource) => void;
};

export function GebietForm({
    gebiet,
    onCancel,
    onSave
}: GebietFormProps) {
    const navigate = useNavigate();

    const [name, setName] = useState(gebiet?.name ?? "");
    const [beschreibung, setBeschreibung] = useState(gebiet?.beschreibung ?? "");
    const [oeffentlich, setOeffentlich] = useState(gebiet?.public ?? false);
    const [geschlossen, setGeschlossen] = useState(gebiet?.closed ?? false);

    function handleCancel() {
        if (gebiet) {
            onCancel?.();
        } else {
            navigate("/");
        }
    }

    async function handleSave() {
        
        try {
            if(gebiet?.id) {
                const updated = await updateGebiet(gebiet.id, {
                    ...gebiet,
                    name,
                    beschreibung,
                    public: oeffentlich,
                    closed: geschlossen,
                });

                onSave?.(updated);
                return;
            } 

            await createGebiet({
                name,
                beschreibung,
                public: oeffentlich,
                closed: geschlossen,
                verwalter: "" 
            });

            navigate("/");
        } catch (error) {
            console.error(error);
        }
        
        
    }

    return (
        <Container className="mt-4">
            <h1>Neues Gebiet</h1>

            <Form>
                <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Beschreibung</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={4}
                        value={beschreibung}
                        onChange={(e) => setBeschreibung(e.target.value)}
                    />
                </Form.Group>

                <Form.Check
                    className="mb-4"
                    type="checkbox"
                    label="oeffentlich"
                    checked={oeffentlich}
                    onChange={(e) => setOeffentlich(e.target.checked)}
                />

                <Form.Check
                    className="mb-4"
                    type="checkbox"
                    label="geschlossen"
                    checked={geschlossen}
                    onChange={(e) => setGeschlossen(e.target.checked)}
                />

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
