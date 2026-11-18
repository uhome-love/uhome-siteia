import { describe, it, expect } from "vitest";
import { ehNovo } from "@/lib/novidade";
const agora = new Date("2026-11-18T12:00:00-03:00").getTime();
const ha = (d: number) => new Date(agora - d * 864e5).toISOString();
describe("selo Novo", () => {
  it("imóvel publicado há 29 dias é novo", () => expect(ehNovo(ha(29), agora)).toBe(true));
  it("imóvel publicado há 31 dias não é novo", () => expect(ehNovo(ha(31), agora)).toBe(false));
  it("sem data de publicação não é novo", () => expect(ehNovo(null, agora)).toBe(false));
});
