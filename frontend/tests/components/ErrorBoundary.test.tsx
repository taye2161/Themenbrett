import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "../../src/components/ErrorFallback"; 
import { Bomb } from "../components/Bomb"; // Pfad ggf. anpassen
import { beforeEach, afterEach, test, expect } from "vitest";

const orgLog = console.log;
const orgError = console.error;

beforeEach(() => {
    console.log = () => {};
    console.error = () => {};
});

afterEach(() => {
    console.log = orgLog;
    console.error = orgError;
});

test("ErrorBoundary fängt den Fehler der Bomb Komponente und rendert das Fallback", () => {
    render(
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Bomb />
        </ErrorBoundary>
    );

    const errorElements = screen.getAllByText('💥 CABOOM 💥');

    expect(errorElements.length).toBeGreaterThan(0);

    expect(errorElements[0]).toBeInTheDocument();
});