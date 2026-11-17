import { describe, it, expect, vi, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { miniatura } from "@/components/FotoPerto";

const html = readFileSync("index.html", "utf8");
const trocaScript = html.match(/<script>\s*\/\* Primeira tela pronta[\s\S]*?<\/script>/)![0].replace(/<\/?script>/g, "");

function montar(extra = "") {
  document.body.innerHTML = `<div id="uh-pre" data-uh-alvo="[data-uh-capa]" ${extra}><h1>capa</h1></div><div id="root"></div>`;
  new Function(trocaScript)();
}
const esperar = () => new Promise((r) => setTimeout(r, 0));

describe("troca da primeira tela pronta", () => {
  afterEach(() => { vi.useRealTimers(); document.body.innerHTML = ""; });

  it("mantém a capa pronta até o app montar o mesmo trecho", async () => {
    montar();
    document.getElementById("root")!.innerHTML = "<div>carregando</div>";
    await esperar();
    expect(document.getElementById("uh-pre")).not.toBeNull();
  });

  it("tira a capa pronta quando o trecho real aparece (sem duplicar)", async () => {
    montar();
    document.getElementById("root")!.innerHTML = "<section data-uh-capa><h1>capa</h1></section>";
    await esperar();
    expect(document.querySelectorAll("#uh-pre").length).toBe(0);
    expect(document.querySelectorAll("h1").length).toBe(1);
  });

  it("a busca pronta só vale no celular (até 639 px)", () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia;
    montar('data-uh-max="639"');
    expect(document.getElementById("uh-pre")).toBeNull();
  });

  it("nunca fica presa: sai sozinha em 10 s", () => {
    vi.useFakeTimers();
    montar();
    vi.advanceTimersByTime(10_000);
    expect(document.getElementById("uh-pre")).toBeNull();
  });
});

describe("fotos abaixo da dobra na home", () => {
  it("usa a versão WebP leve dos empreendimentos e corretores", () => {
    for (const u of [
      "/__l5e/assets-v1/bebf1748-07e6-4c71-88a9-0a763bbdaa7c/essence-canoas-imagens-capa.jpg",
      "/__l5e/assets-v1/7458ba5b-fb76-4839-83d2-e1357ec16f52/skyglass-parque-moinhos-imagens-capa.jpg",
      "/__l5e/assets-v1/bbe789d2-3b95-4dd9-91b4-4b42250bf07a/connect-joao-wallig-imagens-capa.jpg",
      "/__l5e/assets-v1/6dc62fc5-3fd7-4c13-ad4a-42c31999e493/corretor-v2-flavio-dias.webp",
    ]) expect(miniatura(u)).toMatch(/-card\.webp$/);
  });
  it("foto sem versão leve continua a original", () => {
    expect(miniatura("/x/foto.jpg")).toBe("/x/foto.jpg");
  });
});
