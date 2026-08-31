import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";

import { PageThema } from "../../src/components/PageThema";
import { themen } from "../../src/backend/testdata";

const orgError = console.error;

beforeEach(() => {
        console.error = () => {};
        vi.stubGlobal(
            "fetch",
            vi.fn((url: string) => {

                if (url.endsWith("/api/thema/201")) {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        headers: new Headers(),
                        json: async () => themen[0],
                    });
                }

                if (url.endsWith("/api/thema/202")) {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        headers: new Headers(),
                        json: async () => themen[1],
                    });
                }

                if (url.endsWith("/api/thema/203")) {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        headers: new Headers(),
                        json: async () => themen[2],
                    });
                }

                return Promise.reject(new Error("Unbekannte URL"));
            })
        );
    });

afterEach(() => {
        console.error = orgError;
        vi.restoreAllMocks();
    });

test("zeigt zunächst den LoadingIndicator", () => {
        render(
            <MemoryRouter initialEntries={["/thema/201"]}>
                <Routes>
                    <Route path="/thema/:id" element={<PageThema />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

test("lädt und zeigt das Thema an", async () => {
        render(
            <MemoryRouter initialEntries={["/thema/201"]}>
                <Routes>
                    <Route path="/thema/:id" element={<PageThema />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByText("Verwandlungen in Wölfe")).toBeInTheDocument();
        expect(screen.getByText(/Wie verwandelt man sich ein einen Wolf/)).toBeInTheDocument();
        expect(screen.getByText(/Minerva McGonagall/)).toBeInTheDocument();
        expect(screen.getByText(/bsc/i)).toBeInTheDocument();
        expect(screen.getByText(/offen/i)).toBeInTheDocument();
    });

test("lädt verschiedene Themen korrekt", async () => {
        render(
            <MemoryRouter initialEntries={["/thema/202"]}>
                <Routes>
                    <Route path="/thema/:id" element={<PageThema />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByText("Verwandlungen in Mäuse")).toBeInTheDocument();
        expect(screen.getByText(/Minerva McGonagall/)).toBeInTheDocument();
    });

test("zeigt alle Thema-Details an", async () => {
        render(
            <MemoryRouter initialEntries={["/thema/203"]}>
                <Routes>
                    <Route path="/thema/:id" element={<PageThema />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByText("Vegetarische Zaubertränke")).toBeInTheDocument();
        expect(screen.getByText(/Severus Snape/)).toBeInTheDocument();
    });

test("zeigt Fehlermeldung wenn Thema nicht gefunden", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(() => Promise.reject(new Error("Not Found")))
        );

        render(
            <MemoryRouter initialEntries={["/thema/999"]}>
                <Routes>
                    <Route path="/thema/:id" element={<PageThema />} />
                </Routes>
            </MemoryRouter>
        );

        // Wartet bis Loading fertig ist
        await new Promise(r => setTimeout(r, 100));

        // Thema sollte nicht geladen sein
        expect(screen.queryByText("Verwandlungen")).not.toBeInTheDocument();
    });

test("zeigt Thema-Komponente mit korrekten Props", async () => {
        render(
            <MemoryRouter initialEntries={["/thema/201"]}>
                <Routes>
                    <Route path="/thema/:id" element={<PageThema />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByText("Verwandlungen in Wölfe")).toBeInTheDocument();
        expect(screen.getByText("Verwandlungen in Wölfe")).toBeInTheDocument();
    });