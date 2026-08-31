import { GebietDescription } from "./GebietDescription";
import type { GebietResource } from '../Resources';
import Container from "react-bootstrap/Container";
import { useEffect, useState } from "react";
import { MiniMap } from "./MiniMap";
import { Button } from "react-bootstrap";
import { LinkContainer } from "./LinkContainer";
import { useLoginContext } from "../auth/LoginContext";

export function AlleGebiete(
    props: {
        gebiete: GebietResource[];
    }
) {
    const { loginInfo } = useLoginContext();
    const myGebiete = props.gebiete;
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        if (!selectedId) return;

        document
            .getElementById(selectedId)
            ?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
    }, [selectedId]);

    return (
        <Container className="mt-4">
            <h1 className="mb-4">Gebiete</h1>

            <MiniMap
                items={props.gebiete.map((gebiet) => ({
                    id: gebiet.id,
                    text: gebiet.name,
                }))}
                selectedId={selectedId}
                onSelect={setSelectedId}
            />

            {myGebiete.map(gebiet => (
                <GebietDescription
                    key={gebiet.id}
                    gebiet={gebiet}
                    selected={gebiet.id === selectedId}
                />
            ))}

            {loginInfo && loginInfo.role === 'a' && (
                <LinkContainer to={"/gebiet/neu"}>
                    <Button className="mb-4">
                        Neues Gebiet
                    </Button>
                </LinkContainer >
            )}

        </Container>
    );
}