import { describe, expect, it } from "vitest";
import capa from "@/assets/gasometro-mobile-45.webp.asset.json";

describe("capa mobile preparada para a rodada 4", () => {
  it("tem no máximo 45 KB sem substituir o arquivo publicado", () => {
    expect(capa.size).toBeGreaterThan(0);
    expect(capa.size).toBeLessThanOrEqual(45_000);
    expect(capa.content_type).toBe("image/webp");
  });
});