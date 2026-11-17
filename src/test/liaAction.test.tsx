import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LiaActionButton } from "@/components/lia/LiaActionButton";

describe("conversa na barra de ação", () => {
  it("abre a Lia uma vez somente depois do toque", () => {
    const abrir = vi.fn();
    window.addEventListener("uhome:abrir-lia", abrir);
    render(<LiaActionButton />);
    expect(abrir).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Conversar com a Lia" }));
    expect(abrir).toHaveBeenCalledTimes(1);
    window.removeEventListener("uhome:abrir-lia", abrir);
  });
});