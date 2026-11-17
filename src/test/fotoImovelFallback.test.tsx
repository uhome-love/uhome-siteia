import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FotoImovel } from "@/components/FotoImovel";

describe("thumbnail resilience", () => {
  it("retries the original before reporting a broken property photo", () => {
    const onError = vi.fn();
    const { getByRole } = render(<FotoImovel src="https://wsrv.nl/?url=photo" fallbackSrc="https://s01.jetimgs.com/photo.jpg" alt="Imóvel" onError={onError} />);
    const image = getByRole("img");
    fireEvent.error(image);
    expect(onError).not.toHaveBeenCalled();
    fireEvent.error(image);
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it("resets a failed image when changing carousel photos", () => {
    const onError = vi.fn();
    const { getByRole, rerender } = render(<FotoImovel src="https://s01.jetimgs.com/1.jpg" alt="Imóvel" onError={onError} />);
    fireEvent.error(getByRole("img"));
    expect(onError).toHaveBeenCalledTimes(1);
    rerender(<FotoImovel src="https://s01.jetimgs.com/2.jpg" alt="Imóvel" onError={onError} />);
    fireEvent.error(getByRole("img"));
    expect(onError).toHaveBeenCalledTimes(2);
  });
});