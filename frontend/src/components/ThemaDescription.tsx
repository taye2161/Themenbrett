import type { ThemaResource } from '../Resources.ts';
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { LinkContainer } from './LinkContainer.tsx';

export function ThemaDescription(
    props: {
        thema: ThemaResource
        selected: boolean
    }
) { 
    const myThema = props.thema;

    return (
        <Card id={props.thema.id}
            className={`mb-3 ${props.selected ? "bg-light border-primary border-3" : ""}`}>
            <Card.Body>
                <Card.Title>
                    {myThema.titel}
                </Card.Title>

                

                <Card.Text>
                    <strong>Abschluss:</strong> {myThema.abschluss}<br/>
                    <strong>Status:</strong> {myThema.status}<br/>
                    <strong>Betreuer:</strong> {myThema.betreuerName}<br/>
                    <strong>Letzte Änderung:</strong> {myThema.updatedAt}<br/>
                    <strong>Beschreibung:</strong> {myThema.beschreibung}<br/>
                </Card.Text>

                <LinkContainer to={`/thema/${myThema.id}`}>
                    <Button>
                        Ansicht
                    </Button>
                </LinkContainer>

            </Card.Body>
        </Card>
    )
}