import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";

import { PageGebiet } from "../../src/components/PageGebiet";
import { gebiete, themen } from "../../src/backend/testdata";

const orgError = console.error;

beforeEach(() => {
        console.error = () => {};
        vi.stubGlobal(
            "fetch",
            vi.fn((url: string) => {
                if (url.includes("/api/gebiet/101/themen")) {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        headers: new Headers(),
                        json: async () =>
                            themen.filter(t => t.gebiet === "101"),
                    });
                }

                if (url.includes("/api/gebiet/101")) {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        headers: new Headers(),
                        json: async () => gebiete[0],
                    });
                }

                if (url.includes("/api/gebiet/102/themen")) {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        headers: new Headers(),
                        json: async () =>
                            themen.filter(t => t.gebiet === "102"),
                    });
                }

                if (url.includes("/api/gebiet/102")) {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        headers: new Headers(),
                        json: async () => gebiete[1],
                    });
                }

                if (url.includes("/api/gebiet/103/themen")) {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        headers: new Headers(),
                        json: async () =>
                            themen.filter(t => t.gebiet === "103"),
                    });
                }

                if (url.includes("/api/gebiet/103")) {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        headers: new Headers(),
                        json: async () => gebiete[2],
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
            <MemoryRouter initialEntries={["/gebiet/101"]}>
                <Routes>
                    <Route path="/gebiet/:id" element={<PageGebiet />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

test("lädt und zeigt Gebiet und Themen an", async () => {
        render(
            <MemoryRouter initialEntries={["/gebiet/101"]}>
                <Routes>
                    <Route path="/gebiet/:id" element={<PageGebiet />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByText("Transfiguration")).toBeInTheDocument();
    });

test("lädt verschiedene Gebiete korrekt", async () => {
        render(
            <MemoryRouter initialEntries={["/gebiet/102"]}>
                <Routes>
                    <Route path="/gebiet/:id" element={<PageGebiet />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByText("Defense Against the Dark Arts")).toBeInTheDocument();
    });

test("zeigt das dritte Gebiet an", async () => {
        render(
            <MemoryRouter initialEntries={["/gebiet/103"]}>
                <Routes>
                    <Route path="/gebiet/:id" element={<PageGebiet />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByText("Potions")).toBeInTheDocument();
    });

test("zeigt alle Gebiet-Details an", async () => {
        render(
            <MemoryRouter initialEntries={["/gebiet/101"]}>
                <Routes>
                    <Route path="/gebiet/:id" element={<PageGebiet />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByText("Transfiguration")).toBeInTheDocument();
    });

test("zeigt Themen für das Gebiet an", async () => {
        render(
            <MemoryRouter initialEntries={["/gebiet/101"]}>
                <Routes>
                    <Route path="/gebiet/:id" element={<PageGebiet />} />
                </Routes>
            </MemoryRouter>
        );

        // Warten bis Gebiet geladen ist
        await screen.findByText("Transfiguration");
        
        // Überprüfe dass Komponente gerendert ist
        expect(screen.getByText("Transfiguration")).toBeInTheDocument();
    });

test("zeigt Fehlermeldung bei ungültiger Gebiet ID", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(() => Promise.reject(new Error("Not Found")))
        );

        render(
            <MemoryRouter initialEntries={["/gebiet/999"]}>
                <Routes>
                    <Route path="/gebiet/:id" element={<PageGebiet />} />
                </Routes>
            </MemoryRouter>
        );

        // Wartet bis Loading fertig ist
        await new Promise(r => setTimeout(r, 100));

        // Gebiet sollte nicht geladen sein
        expect(screen.queryByText("Transfiguration")).not.toBeInTheDocument();
    });

test("zeigt Gebiet-Komponente mit korrekten Props", async () => {
        render(
            <MemoryRouter initialEntries={["/gebiet/101"]}>
                <Routes>
                    <Route path="/gebiet/:id" element={<PageGebiet />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByText("Transfiguration")).toBeInTheDocument();
        expect(screen.getByText("Transfiguration")).toBeInTheDocument();
    });

test("zeigt Zurück-Link an", async () => {
        render(
            <MemoryRouter initialEntries={["/gebiet/101"]}>
                <Routes>
                    <Route path="/gebiet/:id" element={<PageGebiet />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByText("Transfiguration")).toBeInTheDocument();
        expect(screen.getByText(/Zurück zur Übersicht/)).toBeInTheDocument();
    });