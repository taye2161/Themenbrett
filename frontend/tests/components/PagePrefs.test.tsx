import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { PagePrefs } from "../../src/components/PagePrefs";

test("rendert die PagePrefs Komponente", () => {
    const { container } = render(<PagePrefs />);
    expect(container).toBeInTheDocument();
});

test("rendert die ChangePassword Komponente", () => {
    render(<PagePrefs />);
    expect(screen.getByText(/Ändere Passwort/i)).toBeInTheDocument();
});

test("zeigt das Formular mit allen Passwort-Feldern an", () => {
    render(<PagePrefs />);
    
    expect(screen.getByText(/Neues Passwort/)).toBeInTheDocument();
    expect(screen.getByText(/Wiederholung/)).toBeInTheDocument();
    expect(screen.getByText(/Altes Passwort/)).toBeInTheDocument();
});

test("zeigt die Passwort-Eingabefelder an", () => {
    render(<PagePrefs />);
    
    const passwordInputs = screen.getAllByPlaceholderText(/Passwort/);
    expect(passwordInputs.length).toBe(3);
});

test("zeigt den Button zum Passwort ändern an", () => {
    render(<PagePrefs />);
    
    const button = screen.getByRole("button", { name: /Ändere Passwort/i });
    expect(button).toBeInTheDocument();
});

test("zeigt die korrekte Reihenfolge der Formularfelder an", () => {
    const { container } = render(<PagePrefs />);
    
    const labels = container.querySelectorAll("label");
    expect(labels[0]).toHaveTextContent("Neues Passwort");
    expect(labels[1]).toHaveTextContent("Wiederholung");
    expect(labels[2]).toHaveTextContent("Altes Passwort");
});
