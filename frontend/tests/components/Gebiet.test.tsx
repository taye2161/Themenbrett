import { expect, beforeEach, afterEach, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Gebiet } from "../../src/components/Gebiet";
import { BrowserRouter } from "react-router";
import { gebiete, themen } from "../../src/backend/testdata";

const testGebiet = gebiete[0];
const gebietThemen = themen.filter(t => t.gebiet === testGebiet.id);

const orgError = console.error;

beforeEach(() => {
    console.error = () => {};
    vi.stubGlobal(
        "fetch",
        vi.fn((url: string) => {
            if (url.includes(`/api/gebiet/${testGebiet.id}/themen`)) {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    headers: new Headers(),
                    json: async () => gebietThemen,
                });
            }
            return Promise.reject(new Error("Unknown URL"));
        })
    );
});

afterEach(() => {
    console.error = orgError;
    vi.restoreAllMocks();
});

test("rendert die Gebiet Komponente", () => {
    const { container } = render(
        <BrowserRouter>
            <Gebiet gebiet={testGebiet} />
        </BrowserRouter>
    );

    expect(container).toBeInTheDocument();
});

test("zeigt den Gebiets-Namen an", () => {
    render(
        <BrowserRouter>
            <Gebiet gebiet={testGebiet} />
        </BrowserRouter>
    );

    expect(screen.getByText("Transfiguration")).toBeInTheDocument();
});

test("zeigt die Gebiet-Beschreibung an", () => {
    render(
        <BrowserRouter>
            <Gebiet gebiet={testGebiet} />
        </BrowserRouter>
    );

    if (testGebiet.beschreibung) {
        expect(screen.getByText(testGebiet.beschreibung)).toBeInTheDocument();
    }
});

test("zeigt zunächst LoadingIndicator für Themen", () => {
    render(
        <BrowserRouter>
            <Gebiet gebiet={testGebiet} />
        </BrowserRouter>
    );

    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
});

test("lädt und zeigt Themen Komponente an", async () => {
    render(
        <BrowserRouter>
            <Gebiet gebiet={testGebiet} />
        </BrowserRouter>
    );

    // Warte bis die Themen-Anzahl angezeigt wird
    expect(await screen.findByText(/Themen:/)).toBeInTheDocument();
});

test("zeigt die Anzahl der Themen an", async () => {
    render(
        <BrowserRouter>
            <Gebiet gebiet={testGebiet} />
        </BrowserRouter>
    );

    expect(await screen.findByText(`Themen: ${gebietThemen.length}`)).toBeInTheDocument();
});

test("zeigt die MiniMap Komponente an", () => {
    const { container } = render(
        <BrowserRouter>
            <Gebiet gebiet={testGebiet} />
        </BrowserRouter>
    );

    const listGroup = container.querySelector(".list-group");
    expect(listGroup).toBeInTheDocument();
});

test("zeigt den Zurück Button an", async () => {
    render(
        <BrowserRouter>
            <Gebiet gebiet={testGebiet} />
        </BrowserRouter>
    );

    expect(await screen.findByText(/Zurück zur Übersicht/)).toBeInTheDocument();
});

test("zeigt die Themen-Anzahl an", async () => {
    render(
        <BrowserRouter>
            <Gebiet gebiet={testGebiet} />
        </BrowserRouter>
    );

    // Warte bis die Themen-Anzahl angezeigt wird
    expect(await screen.findByText(/Themen:/)).toBeInTheDocument();
});

test("zeigt Container mit mt-4 Klasse an", () => {
    const { container } = render(
        <BrowserRouter>
            <Gebiet gebiet={testGebiet} />
        </BrowserRouter>
    );

    const containerEl = container.querySelector(".mt-4.container");
    expect(containerEl).toBeInTheDocument();
});

test("zeigt h1 mit Gebiets-Namen an", () => {
    render(
        <BrowserRouter>
            <Gebiet gebiet={testGebiet} />
        </BrowserRouter>
    );

    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("Transfiguration");
});

test("zeigt h4 für Beschreibung an", () => {
    const { container } = render(
        <BrowserRouter>
            <Gebiet gebiet={testGebiet} />
        </BrowserRouter>
    );

    const h4s = container.querySelectorAll("h4");
    expect(h4s.length).toBeGreaterThan(0);
});

test("rendert mit Gebiet ohne Beschreibung", () => {
    const gebietOhneBeschreibung = { ...testGebiet, beschreibung: undefined };

    render(
        <BrowserRouter>
            <Gebiet gebiet={gebietOhneBeschreibung} />
        </BrowserRouter>
    );

    expect(screen.getByText("Transfiguration")).toBeInTheDocument();
});

test("zeigt Meldung wenn keine Themen vorhanden", async () => {
    vi.stubGlobal(
        "fetch",
        vi.fn((url: string) => {
            if (url.includes(`/api/gebiet/${testGebiet.id}/themen`)) {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    headers: new Headers(),
                    json: async () => [],
                });
            }
            return Promise.reject(new Error("Unknown URL"));
        })
    );

    render(
        <BrowserRouter>
            <Gebiet gebiet={testGebiet} />
        </BrowserRouter>
    );

    expect(await screen.findByText(/Keine Themen in diesem Gebiet vorhanden/)).toBeInTheDocument();
});
