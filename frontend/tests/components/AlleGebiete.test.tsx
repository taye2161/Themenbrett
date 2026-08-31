import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { AlleGebiete } from "../../src/components/AlleGebiete";
import { BrowserRouter } from "react-router";
import { gebiete } from "../../src/backend/testdata";

test("rendert die AlleGebiete Komponente", () => {
    const { container } = render(
        <BrowserRouter>
            <AlleGebiete gebiete={gebiete} />
        </BrowserRouter>
    );

    expect(container).toBeInTheDocument();
});

test("zeigt die Überschrift 'Gebiete' an", () => {
    render(
        <BrowserRouter>
            <AlleGebiete gebiete={gebiete} />
        </BrowserRouter>
    );

    expect(screen.getByText("Gebiete")).toBeInTheDocument();
});

test("zeigt alle Gebiete an", () => {
    render(
        <BrowserRouter>
            <AlleGebiete gebiete={gebiete} />
        </BrowserRouter>
    );

    expect(screen.getAllByText("Transfiguration").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Defense Against the Dark Arts").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Potions").length).toBeGreaterThan(0);
});

test("zeigt die MiniMap Komponente an", () => {
    const { container } = render(
        <BrowserRouter>
            <AlleGebiete gebiete={gebiete} />
        </BrowserRouter>
    );

    // MiniMap sollte vorhanden sein (check für List-Gruppe)
    const listGroup = container.querySelector(".list-group");
    expect(listGroup).toBeInTheDocument();
});

test("zeigt alle GebietDescription Komponenten an", () => {
    render(
        <BrowserRouter>
            <AlleGebiete gebiete={gebiete} />
        </BrowserRouter>
    );

    // Überprüfe dass alle Details Buttons vorhanden sind
    const detailsButtons = screen.getAllByText("Details");
    expect(detailsButtons.length).toBe(gebiete.length);
});

test("zeigt alle Verwalter-Namen an", () => {
    render(
        <BrowserRouter>
            <AlleGebiete gebiete={gebiete} />
        </BrowserRouter>
    );

    const mcgonagall = screen.getAllByText(/Minerva McGonagall/);
    expect(mcgonagall.length).toBeGreaterThan(0);
    expect(screen.getByText(/Severus Snape/)).toBeInTheDocument();
});

test("zeigt alle Verfügbarkeitsstatus an", () => {
    render(
        <BrowserRouter>
            <AlleGebiete gebiete={gebiete} />
        </BrowserRouter>
    );

    // Überprüfe dass das Wort "Verfügbarkeit:" vorhanden ist
    const verfuegbarkeitLabels = screen.getAllByText("Verfügbarkeit:");
    expect(verfuegbarkeitLabels.length).toBe(gebiete.length);
});

test("zeigt die Erstellungsdaten an", () => {
    render(
        <BrowserRouter>
            <AlleGebiete gebiete={gebiete} />
        </BrowserRouter>
    );

    expect(screen.getByText(/01.10.2024/)).toBeInTheDocument();
    expect(screen.getByText(/02.10.2024/)).toBeInTheDocument();
    expect(screen.getByText(/03.10.2024/)).toBeInTheDocument();
});

test("zeigt alle Gebiet-Karten an", () => {
    const { container } = render(
        <BrowserRouter>
            <AlleGebiete gebiete={gebiete} />
        </BrowserRouter>
    );

    // Überprüfe dass alle Details Buttons existieren
    const detailsButtons = screen.getAllByText("Details");
    expect(detailsButtons).toHaveLength(gebiete.length);
});

test("rendert mit leerer Gebiete-Liste", () => {
    const { container } = render(
        <BrowserRouter>
            <AlleGebiete gebiete={[]} />
        </BrowserRouter>
    );

    expect(screen.getByText("Gebiete")).toBeInTheDocument();
    expect(container).toBeInTheDocument();
});

test("zeigt Container mit mt-4 Klasse an", () => {
    const { container } = render(
        <BrowserRouter>
            <AlleGebiete gebiete={gebiete} />
        </BrowserRouter>
    );

    const containerEl = container.querySelector(".mt-4.container");
    expect(containerEl).toBeInTheDocument();
});
