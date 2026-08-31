import type { GebietResource } from '../Resources.ts';
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { LinkContainer } from './LinkContainer.tsx';



export function GebietDescription(
    props: {
        gebiet: GebietResource
        selected: boolean;
    }
) {
    const myGebiet = props.gebiet;

    let verfuegbarkeit: String;

    if(!myGebiet.closed){
        verfuegbarkeit = "verfügbar";
    } else {
        verfuegbarkeit = "besetzt";
    }

    return (
        <Card id={myGebiet.id} className={`mb-3 ${props.selected ? "bg-light border-primary border-3" : ""}`}>
            <Card.Body>
                <Card.Title>
                    {myGebiet.name}
                </Card.Title>

                <Card.Subtitle>
                    {myGebiet.beschreibung}
                </Card.Subtitle>

                <Card.Text>
                    <strong>Verfügbarkeit:</strong> {verfuegbarkeit}<br/>
                    <strong>Verwalter:</strong> {myGebiet.verwalterName}<br/>
                    <strong>Erstellt:</strong> {myGebiet.createdAt}<br/>
                </Card.Text>

                <LinkContainer to={`gebiet/${myGebiet.id}`}>
                    <Button>
                        Details
                    </Button>
                </LinkContainer>
            </Card.Body>
        </Card>
    )
}