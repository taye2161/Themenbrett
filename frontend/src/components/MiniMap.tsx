import ListGroup from "react-bootstrap/ListGroup";

type MiniMapProps = {
    items: { id: string | undefined; text: string }[];
    selectedId: string | null;
    onSelect: (id: string) => void;
};

export function MiniMap({
    items,
    selectedId,
    onSelect,
}: MiniMapProps) {
    return (
        <ListGroup className="mb-4">
            {items.map((item) => (
                <ListGroup.Item
                    key={item.id}
                    action
                    active={item.id === selectedId}
                    onClick={() => onSelect(item.id!)}
                >
                    {item.text}
                </ListGroup.Item>
            ))}
        </ListGroup>
    );
}

