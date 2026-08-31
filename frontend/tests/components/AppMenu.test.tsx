import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppMenu } from "../../src/components/AppMenu";
import { BrowserRouter } from "react-router";

test("rendert die AppMenu Komponente", () => {
    const { container } = render(
        <BrowserRouter>
            <AppMenu />
        </BrowserRouter>
    );

    expect(container).toBeInTheDocument();
});

test("zeigt den Brand 'Themenbrett' an", () => {
    render(
        <BrowserRouter>
            <AppMenu />
        </BrowserRouter>
    );

    expect(screen.getByText("Themenbrett")).toBeInTheDocument();
});

test("zeigt den Home Link an", () => {
    render(
        <BrowserRouter>
            <AppMenu />
        </BrowserRouter>
    );

    expect(screen.getByText("Home")).toBeInTheDocument();
});

test("zeigt den Login Link an", () => {
    render(
        <BrowserRouter>
            <AppMenu />
        </BrowserRouter>
    );

    expect(screen.getByText("Login")).toBeInTheDocument();
});

test("hat einen Navbar Toggle für Mobile", () => {
    const { container } = render(
        <BrowserRouter>
            <AppMenu />
        </BrowserRouter>
    );

    const toggle = container.querySelector('[aria-controls="basic-navbar-nav"]');
    expect(toggle).toBeInTheDocument();
});

test("hat alle Navigation Links", () => {
    render(
        <BrowserRouter>
            <AppMenu />
        </BrowserRouter>
    );

    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(2);
});

test("AppMenu Komponente existiert und ist exportiert", () => {
    expect(AppMenu).toBeDefined();
    expect(typeof AppMenu).toBe("function");
});

test("rendert ein Navbar Element", () => {
    const { container } = render(
        <BrowserRouter>
            <AppMenu />
        </BrowserRouter>
    );

    const navbar = container.querySelector(".navbar");
    expect(navbar).toBeInTheDocument();
});

test("Navbar ist responsive und expandierbar", () => {
    const { container } = render(
        <BrowserRouter>
            <AppMenu />
        </BrowserRouter>
    );

    const navbar = container.querySelector(".navbar");
    expect(navbar?.className).toContain("navbar-expand");
});
