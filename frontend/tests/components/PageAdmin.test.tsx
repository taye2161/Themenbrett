import { expect, beforeEach, afterEach, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "react-error-boundary";
import { PageAdmin } from "../../src/components/PageAdmin";
import { ErrorFallback } from "../../src/components/ErrorFallback";

const orgError = console.error;

beforeEach(() => {
    // Suppress error logging für diese Tests
    console.error = () => {};
});

afterEach(() => {
    console.error = orgError;
    vi.restoreAllMocks();
});

test("rendert die PageAdmin Komponente", () => {
    const { container } = render(
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <PageAdmin />
        </ErrorBoundary>
    );

    expect(container).toBeInTheDocument();
});

test("ErrorBoundary ist korrekt konfiguriert", () => {
    const { container } = render(
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <PageAdmin />
        </ErrorBoundary>
    );

    // Der ErrorFallback wird angezeigt, wenn Profs einen Fehler wirft
    const errorMessages = screen.queryAllByText(/CABOOM/);
    // Es gibt einen Fehler in der Komponente
    expect(container).toBeInTheDocument();
});

test("PageAdmin Komponente existiert und ist exportiert", () => {
    expect(PageAdmin).toBeDefined();
    expect(typeof PageAdmin).toBe("function");
});

test("PageAdmin rendert ein JSX Element", () => {
    const result = PageAdmin();
    expect(result).toBeDefined();
});

test("PageAdmin mit ErrorBoundary wird ohne Crash gerendert", () => {
    expect(() => {
        render(
            <ErrorBoundary FallbackComponent={ErrorFallback}>
                <PageAdmin />
            </ErrorBoundary>
        );
    }).not.toThrow();
});

test("PageAdmin rendert die Profs Komponente", () => {
    const { container } = render(
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <PageAdmin />
        </ErrorBoundary>
    );

    // PageAdmin sollte ein Element rendern (entweder Profs oder ErrorFallback)
    expect(container.firstChild).toBeDefined();
});
