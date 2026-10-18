import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "./App";
import { STORAGE_KEY } from "./storage";
function enterWeights(tare: string, total: string) {
  fireEvent.change(screen.getByLabelText("Tara-Gewicht"), {
    target: { value: tare },
  });
  fireEvent.change(screen.getByLabelText("Aktuelles Gesamtgewicht"), {
    target: { value: total },
  });
}
describe("calculator interface", () => {
  it("shows a live result for comma decimals and persists inputs", () => {
    render(<App />);
    enterWeights("10,5", "16");
    expect(screen.getByRole("heading", { name: /50\s*%/ })).toBeInTheDocument();
    expect(screen.getByText("5,5 kg")).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).tare).toBe("10,5");
  });
  it("validates overfilling and removes stale results", () => {
    render(<App />);
    enterWeights("10", "15");
    fireEvent.click(screen.getByRole("radio", { name: "5 kg" }));
    expect(
      screen.getByRole("heading", { name: /100\s*%/ }),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Aktuelles Gesamtgewicht"), {
      target: { value: "16" },
    });
    expect(screen.getByRole("alert")).toHaveTextContent("Überfüllung");
    expect(
      screen.queryByRole("heading", { name: /100\s*%/ }),
    ).not.toBeInTheDocument();
  });
  it("supports custom capacity and reset", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("radio", { name: "Andere" }));
    fireEvent.change(screen.getByLabelText("Nennfüllmenge deiner Flasche"), {
      target: { value: "3" },
    });
    enterWeights("4", "5,5");
    expect(screen.getByRole("heading", { name: /50\s*%/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Zurücksetzen/ }));
    expect(screen.getByLabelText("Tara-Gewicht")).toHaveValue("");
    expect(screen.getByRole("radio", { name: "11 kg" })).toBeChecked();
  });
  it("restores stored inputs", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ size: "8", custom: "", tare: "10", total: "14" }),
    );
    render(<App />);
    expect(screen.getByRole("heading", { name: /50\s*%/ })).toBeInTheDocument();
  });
  it("recovers from malformed storage", () => {
    localStorage.setItem(STORAGE_KEY, "{invalid");
    render(<App />);
    expect(screen.getByLabelText("Tara-Gewicht")).toHaveValue("");
  });
  it("keeps working when storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    render(<App />);
    enterWeights("10", "15.5");
    expect(screen.getByRole("heading", { name: /50\s*%/ })).toBeInTheDocument();
    expect(screen.getByText(/Speichern nicht verfügbar/)).toBeInTheDocument();
  });
});
