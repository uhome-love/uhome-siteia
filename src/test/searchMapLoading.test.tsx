import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useIsMobile } from "@/hooks/use-mobile";

afterEach(() => vi.restoreAllMocks());

describe("search map visibility", () => {
  it.each([390, 820, 1023, 1024, 1280])("uses actual visibility on the first render at %ipx", width => {
    const renders: boolean[] = [];
    vi.spyOn(window, "matchMedia").mockImplementation(query => ({
      matches: width <= Number(query.match(/\d+/)?.[0]),
      media: query, onchange: null,
      addListener: vi.fn(), removeListener: vi.fn(),
      addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(),
    }));
    renderHook(() => { const hidden = useIsMobile(1024); renders.push(hidden); return hidden; });
    expect(renders[0]).toBe(width < 1024);
  });

  it("responds when the viewport crosses the map breakpoint", () => {
    let onChange: (() => void) | undefined;
    const media = {
      matches: true, media: "", onchange: null,
      addListener: vi.fn(), removeListener: vi.fn(),
      addEventListener: vi.fn((_type, callback) => { onChange = callback; }),
      removeEventListener: vi.fn(), dispatchEvent: vi.fn(),
    };
    vi.spyOn(window, "matchMedia").mockReturnValue(media);
    const { result } = renderHook(() => useIsMobile(1024));
    expect(result.current).toBe(true);
    act(() => { media.matches = false; onChange?.(); });
    expect(result.current).toBe(false);
  });
});