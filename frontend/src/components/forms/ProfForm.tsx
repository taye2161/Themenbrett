import { Button, Form } from "react-bootstrap";
import type { ProfResource } from "../../Resources";
import { createProf, updateProf } from "../../backend/api";
import { useState } from "react";

type ProfFormProps = {
    prof?: ProfResource;
    onSave: (prof: ProfResource) => void;
    onCancel: () => void;
};

export function ProfForm({
    prof,
    onCancel,
    onSave
}: ProfFormProps) {
    const [name, setName] = useState(prof?.name ?? "");
    const [campusID, setCampusId] = useState(prof?.campusID ?? "");
    const [admin, setAdmin] = useState(prof?.admin ?? false);
    const [password, setPassword] = useState("");

    async function handleSave() {
        try {
            if (prof?.id) {
                const updated = await updateProf(prof.id, {
                    ...prof,
                    name,
                    campusID,
                    admin,
                    ...(password.trim() !== "" && {
                        password
                    })
                });

                onSave(updated);
                return;
            }

            const created = await createProf({
                name,
                campusID,
                admin,
                password
            });

            onSave(created);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Form
            onSubmit={(event) => {
                event.preventDefault();
                handleSave();
            }}
        >
            <Form.Group className="mb-2">
                <Form.Label>Name</Form.Label>
                <Form.Control
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                />
            </Form.Group>

            <Form.Group className="mb-2">
                <Form.Label>Campus-ID</Form.Label>
                <Form.Control
                    value={campusID}
                    onChange={(event) =>
                        setCampusId(event.target.value)
                    }
                />
            </Form.Group>

            <Form.Check
                className="mb-2"
                label="Admin"
                checked={admin}
                onChange={(event) =>
                    setAdmin(event.target.checked)
                }
            />

            <Form.Group className="mb-2">
                <Form.Label>Passwort</Form.Label>
                <Form.Control
                    type="password"
                    value={password}
                    onChange={(event) =>
                        setPassword(event.target.value)
                    }
                />
            </Form.Group>

            <Button
                type="submit"
                className="me-2"
            >
                Speichern
            </Button>

            <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
            >
                Abbrechen
            </Button>
        </Form>
    );
}