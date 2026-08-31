import { useState } from "react";
import { Alert, Button, Form, Modal } from "react-bootstrap";
import { useLoginContext } from "../auth/LoginContext";
import { login } from "../backend/api";

type LoginDialogProps = {
    show: boolean;
    onClose: () => void;
}

export function LoginDialog({show, onClose}: LoginDialogProps) {
    const [campusID, setCampusID] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const { setLoginInfo } = useLoginContext();

    async function handleLogin() {
        setError(null);
        try{
            const loginInfo = await login(campusID, password);

            setLoginInfo(loginInfo);

            onClose();
        } catch {
            setError("Campus-ID oder Passwort falsch.");
        }
    }

    return(
        <Modal show={show} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Login</Modal.Title>
            </Modal.Header>

            <Modal.Body>

                {
                    error ? (
                        <Alert variant="danger">
                            {error}
                        </Alert>
                    ) : null
                }

                <Form>
                    <Form.Group controlId="campusID" className="mb-3">
                        <Form.Label>Campus ID</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Campus ID"
                            value={campusID}
                            onChange={(e) => setCampusID(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group controlId="password" className="mb-3">
                        <Form.Label>Passwort</Form.Label>
                        <Form.Control 
                            type="password" 
                            placeholder="Passwort"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button onClick={onClose}>Abbrechen</Button>
                <Button onClick={handleLogin}>OK</Button>
            </Modal.Footer>
        </Modal>
    )
}



