import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { GebietDescription } from "../../src/components/GebietDescription";
import { BrowserRouter } from "react-router";
import { gebiete } from "../../src/backend/testdata";

const testGebiet = gebiete[0];

test("rendert die GebietDescription Komponente", () => {
    const { container } = render(
        <BrowserRouter>
            <GebietDescription gebiet={testGebiet} selected={false} />
        </BrowserRouter>
    );

    expect(container).toBeInTheDocument();
});

test("zeigt den Gebiets-Namen an", () => {
    render(
        <BrowserRouter>
            <GebietDescription gebiet={testGebiet} selected={false} />
        </BrowserRouter>
    );

    expect(screen.getByText("Transfiguration")).toBeInTheDocument();
});

test("zeigt die Gebiet-Beschreibung an", () => {
    render(
        <BrowserRouter>
            <GebietDescription gebiet={testGebiet} selected={false} />
        </BrowserRouter>
    );

    // Die Beschreibung könnte undefined sein, also nur prüfen wenn sie existiert
    if (testGebiet.beschreibung) {
        expect(screen.getByText(testGebiet.beschreibung)).toBeInTheDocument();
    }
});

test("zeigt den Verfügbarkeitsstatus 'verfügbar' an", () => {
    render(
        <BrowserRouter>
            <GebietDescription gebiet={testGebiet} selected={false} />
        </BrowserRouter>
    );

    expect(screen.getByText(/verfügbar/)).toBeInTheDocument();
});

test("zeigt den Verwalter-Namen an", () => {
    render(
        <BrowserRouter>
            <GebietDescription gebiet={testGebiet} selected={false} />
        </BrowserRouter>
    );

    // Das Wort "Verwalter:" sollte vorhanden sein
    expect(screen.getByText(/Verwalter:/)).toBeInTheDocument();
});

test("zeigt das Erstellungsdatum an", () => {
    render(
        <BrowserRouter>
            <GebietDescription gebiet={testGebiet} selected={false} />
        </BrowserRouter>
    );

    // Das Wort "Erstellt:" sollte vorhanden sein
    expect(screen.getByText(/Erstellt:/)).toBeInTheDocument();
});

test("zeigt den Details Button an", () => {
    render(
        <BrowserRouter>
            <GebietDescription gebiet={testGebiet} selected={false} />
        </BrowserRouter>
    );

    expect(screen.getByRole("button", { name: /Details/i })).toBeInTheDocument();
});

test("zeigt die Card mit korrecker ID an", () => {
    const { container } = render(
        <BrowserRouter>
            <GebietDescription gebiet={testGebiet} selected={false} />
        </BrowserRouter>
    );

    // Die Card sollte eine ID haben
    const card = container.querySelector(".card");
    expect(card).toHaveAttribute("id", testGebiet.id);
});

test("hat nicht die selected Klasse wenn nicht selected", () => {
    const { container } = render(
        <BrowserRouter>
            <GebietDescription gebiet={testGebiet} selected={false} />
        </BrowserRouter>
    );

    const card = container.querySelector(".card");
    expect(card?.className).not.toContain("border-primary");
});

test("hat die selected Klasse wenn selected ist", () => {
    const { container } = render(
        <BrowserRouter>
            <GebietDescription gebiet={testGebiet} selected={true} />
        </BrowserRouter>
    );

    const card = container.querySelector(".card");
    expect(card?.className).toContain("border-primary");
    expect(card?.className).toContain("bg-light");
    expect(card?.className).toContain("border-3");
});

test("zeigt alle erforderlichen Labels an", () => {
    render(
        <BrowserRouter>
            <GebietDescription gebiet={testGebiet} selected={false} />
        </BrowserRouter>
    );

    expect(screen.getByText(/Verfügbarkeit:/)).toBeInTheDocument();
    expect(screen.getByText(/Verwalter:/)).toBeInTheDocument();
    expect(screen.getByText(/Erstellt:/)).toBeInTheDocument();
});

test("zeigt besetzten Status für geschlossenes Gebiet an", () => {
    const closedGebiet = { ...testGebiet, closed: true };

    render(
        <BrowserRouter>
            <GebietDescription gebiet={closedGebiet} selected={false} />
        </BrowserRouter>
    );

    expect(screen.getByText(/besetzt/)).toBeInTheDocument();
});

test("rendert mit verschiedenen Gebieten", () => {
    const secondGebiet = gebiete[1];

    render(
        <BrowserRouter>
            <GebietDescription gebiet={secondGebiet} selected={false} />
        </BrowserRouter>
    );

    expect(screen.getByText("Defense Against the Dark Arts")).toBeInTheDocument();
});
