import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { MiniMap } from "../../src/components/MiniMap";

test("zeigt alle Einträge an", () => {
    render(
        <MiniMap
            items={[
                { id: "1", text: "Transfiguration" },
                { id: "2", text: "Potions" },
                { id: "3", text: "Defense Against the Dark Arts" },
            ]}
            selectedId={null}
            onSelect={() => {}}
        />
    );

    expect(screen.getByText("Transfiguration")).toBeInTheDocument();
    expect(screen.getByText("Potions")).toBeInTheDocument();
    expect(
        screen.getByText("Defense Against the Dark Arts")
    ).toBeInTheDocument();
});

test("ruft onSelect beim Anklicken auf", async () => {
    const user = userEvent.setup();

    const onSelect = vi.fn();

    render(
        <MiniMap
            items={[
                { id: "1", text: "Transfiguration" },
                { id: "2", text: "Potions" },
            ]}
            selectedId={null}
            onSelect={onSelect}
        />
    );

    await user.click(screen.getByText("Potions"));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("2");
});

test("markiert den ausgewählten Eintrag", () => {
    render(
        <MiniMap
            items={[
                { id: "1", text: "Transfiguration" },
                { id: "2", text: "Potions" },
            ]}
            selectedId="2"
            onSelect={() => {}}
        />
    );

    expect(screen.getByText("Potions")).toHaveClass("active");
});

test("zeigt keine Einträge bei leerer Liste", () => {
    render(
        <MiniMap
            items={[]}
            selectedId={null}
            onSelect={() => {}}
        />
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
});