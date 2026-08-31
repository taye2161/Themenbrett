import { expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageIndex } from "../../src/components/PageIndex";
import { gebiete } from "../../src/backend/testdata";
import { MemoryRouter } from "react-router";

beforeEach(() => {
        vi.stubGlobal(
            "fetch",
            vi.fn(() =>
                Promise.resolve({
                    ok: true,
                    status: 200,
                    headers: new Headers(),
                    json: async () => gebiete,
                })
            )
        );
    });

afterEach(() => {
    vi.restoreAllMocks();
});

test("zeigt zunächst den LoadingIndicator", () => {
    render(<PageIndex />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
});

test("lädt und zeigt alle Gebiete an", async () => {
    render(
        <MemoryRouter>
            <PageIndex />
        </MemoryRouter>
    );

    expect(await screen.findAllByText("Transfiguration")).toHaveLength(2);
});


