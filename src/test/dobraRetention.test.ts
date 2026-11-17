import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";

const html = readFileSync("index.html", "utf8");
const match = html.match(/<script>\s*\/\* Primeira tela pronta[\s\S]*?<\/script>/);
if (!match) throw new Error("Script de troca não encontrado");
const script = match[0].replace(/<\/?script>/g, "");

describe("foto pronta conservada", () => {
  afterEach(() => { vi.useRealTimers(); document.body.innerHTML = ""; });
  it("conserva a mesma foto e revela o app sem aguardar outra carga de CSS", async () => {
    vi.useFakeTimers();
    document.body.innerHTML = '<div id="uh-pre" data-uh-alvo="[data-uh-capa]"><img fetchpriority="high"></div><div id="root"></div>';
    const pre = document.getElementById("uh-pre");
    const root = document.getElementById("root");
    const photo = pre?.querySelector("img");
    if (!pre || !root || !photo) throw new Error("Fixture incompleta");
    Object.defineProperties(photo, { currentSrc: { value: "/foto.webp" }, naturalWidth: { value: 800 } });
    new Function(script)();
    const section = document.createElement("section"); section.setAttribute("data-uh-capa", "");
    const mirror = document.createElement("img"); mirror.setAttribute("fetchpriority", "high");
    Object.defineProperties(mirror, { currentSrc: { value: "/foto.webp" }, naturalWidth: { value: 800 }, complete: { value: true } });
    section.append(mirror); root.append(section);
    await Promise.resolve();
    expect(pre.hasAttribute("data-uh-alvo")).toBe(false);
    expect(pre.classList.contains("uh-foto-retida")).toBe(true);
    expect(root.classList.contains("uh-app-com-foto")).toBe(true);
    expect(mirror.classList.contains("uh-foto-espelho")).toBe(true);
    expect(photo.currentSrc).toBe(mirror.currentSrc);
  });
});