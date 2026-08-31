import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { useLoginContext } from "../auth/LoginContext";
import { useState } from "react";
import { changePassword } from "../backend/api";
import { Alert } from "react-bootstrap";

export function ChangePassword() {

    const { loginInfo } = useLoginContext();

    const [newPassword, setNewPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [oldPassword, setOldPassword] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!loginInfo) {
            setError("Sie sind nicht angemeldet.");
            return;
        }

        if (!oldPassword) {
            setError("Das alte Passwort ist erforderlich.");
            return;
        }

        if (!newPassword) {
            setError("Das neue Passwort ist erforderlich.");
            return;
        }

        if (newPassword !== repeatPassword) {
            setError("Die neuen Passwörter stimmen nicht überein.");
            return;
        }

        try {
            await changePassword(
                loginInfo.id,
                oldPassword,
                newPassword
            );

            setNewPassword("");
            setRepeatPassword("");
            setOldPassword("");

            setSuccess("Das Passwort wurde erfolgreich geändert.");
        } catch (error) {
            console.error(error);
            setError(
                "Das Passwort konnte nicht geändert werden. Prüfen Sie das alte Passwort."
            );
        }
    }
    
    return (
        <Form className="mt-4" onSubmit={handleSubmit}>
            {error && (
                <Alert variant="danger">
                    {error}
                </Alert>
            )}

            {success && (
                <Alert variant="success">
                    {success}
                </Alert>
            )}

            <Form.Label className="mt-3">
                Neues Passwort
            </Form.Label>
            <Form.Control
                type="password"
                placeholder="Neues Passwort"
                value={newPassword}
                onChange={(event) =>
                    setNewPassword(event.target.value)
                }
            />

            <Form.Label className="mt-3">
                Wiederholung
            </Form.Label>
            <Form.Control
                type="password"
                placeholder="Neues Passwort wiederholen"
                value={repeatPassword}
                onChange={(event) =>
                    setRepeatPassword(event.target.value)
                }
                isInvalid={
                    repeatPassword.length > 0 &&
                    newPassword !== repeatPassword
                }
            />

            <Form.Control.Feedback type="invalid">
                Die neuen Passwörter stimmen nicht überein.
            </Form.Control.Feedback>

            <Form.Label className="mt-3">
                Altes Passwort
            </Form.Label>
            <Form.Control
                type="password"
                placeholder="Altes Passwort"
                value={oldPassword}
                onChange={(event) =>
                    setOldPassword(event.target.value)
                }
            />

            <Button className="mt-3" type="submit">
                Ändere Passwort
            </Button>
        </Form>
    );
}