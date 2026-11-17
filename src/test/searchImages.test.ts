import { describe, expect, it } from "vitest";
import { searchImageUrl, searchImageSrcSet } from "@/lib/searchImages";

describe("search thumbnails", () => {
  it("requests a bounded WebP thumbnail without changing the original source", () => {
    const src = "https://s01.jetimgs.com/property/photo.jpeg";
    const url = new URL(searchImageUrl(src, 768));
    expect(url.searchParams.get("url")).toBe(src);
    expect(url.searchParams.get("w")).toBe("768");
    expect(url.searchParams.get("output")).toBe("webp");
    expect(url.searchParams.get("q")).toBe("82");
    expect(url.searchParams.has("withoutenlargement")).toBe(true);
  });

  it("provides sharper options for high-density mobile screens", () => {
    const variants = searchImageSrcSet("https://s01.jetimgs.com/photo.jpg")?.split(", ") ?? [];
    expect(variants.map(variant => Number(variant.split(" ")[1].replace("w", "")))).toEqual([480, 768, 1024, 1280]);
  });

  it("does not send own assets through the proxy that fails for them", () => {
    const src = "https://uhome.com.br/__l5e/assets-v1/photo.jpg";
    expect(searchImageUrl(src, 768)).toBe(src);
    expect(searchImageSrcSet(src)).toBeUndefined();
    expect(searchImageUrl("/__l5e/assets-v1/photo.jpg", 768)).toBe("/__l5e/assets-v1/photo.jpg");
  });
});