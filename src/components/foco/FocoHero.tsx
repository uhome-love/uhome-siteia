import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Heart, Share2, Images, FileImage, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fotoResponsiva, type ProdutoFoco, type MidiaFoco } from "@/lib/produtosFoco";
import { trackEvent } from "@/lib/trackEvent";

export function FocoHero({ p, natal, abrir, prefixLink }: { p: ProdutoFoco; natal: boolean; abrir: (fotos: MidiaFoco[], i: number) => void; prefixLink: (s: string) => string }) {
  const [atual, setAtual] = useState(0); const trilho = useRef<HTMLDivElement>(null);
  const [saved, setSaved] = useState(() => { try { return JSON.parse(localStorage.getItem("uh-foco-favoritos") ?? "[]").includes(p.slug); } catch { return false; } });
  const fotos = p.galeria.length ? p.galeria : p.capa_url ? [{ url: p.capa_url }] : [];
  const video = fotos.find(f => /\.(mp4|webm)(\?|$)/i.test(f.url));
  const salvar = () => { try { const all: string[] = JSON.parse(localStorage.getItem("uh-foco-favoritos") ?? "[]"); localStorage.setItem("uh-foco-favoritos", JSON.stringify(saved ? all.filter(s => s !== p.slug) : [...all, p.slug])); setSaved(!saved); if (!saved) void trackEvent({ tipo: "favorito_salvo", imovel_slug: `em-foco/${p.slug}` }); } catch { /* armazenamento indisponível */ } };
  return <section data-uh-capa className="foco-hero">
    <div className="foco-photo-grid" ref={trilho} onScroll={e => { if (window.innerWidth < 1024) setAtual(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth)); }}>
      {fotos.map((f, i) => <Button key={f.url} type="button" variant="ghost" aria-label={`Abrir foto ${i + 1} de ${p.nome}`} onClick={() => abrir(fotos, i)} className={`foco-photo ${i === 0 ? "foco-photo-main" : ""} ${i > 4 ? "lg:hidden" : ""}`}>
        <img {...(i === 0 || i <= 4 && window.innerWidth >= 1024 || Math.abs(i - atual) <= 1 ? fotoResponsiva(f, i === 0 ? "(min-width:1024px) 640px, 100vw" : "(min-width:1024px) 320px, 100vw") : {})} alt={f.legenda ?? p.nome} width={1600} height={1200} loading={i === 0 ? "eager" : "lazy"} fetchPriority={i === 0 ? "high" : "low"} decoding="async" />
      </Button>)}
    </div>
    <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2 lg:inset-x-4"><Button asChild variant="outline" size="icon" className="bg-background lg:hidden"><Link to={prefixLink("/em-foco")} aria-label="Voltar"><ArrowLeft /></Link></Button><div className="hidden lg:flex gap-2">{natal && <span className="rounded-md bg-natal-red px-3 py-2 text-xs font-bold text-natal-foreground">Condição de Natal até 18/12</span>}</div><div className="ml-auto flex gap-2"><Button variant="outline" size="icon" className="bg-background" aria-label="Compartilhar" onClick={async () => { if (navigator.share) await navigator.share({ title: p.nome, url: location.href }).catch(() => {}); else await navigator.clipboard?.writeText(location.href); }}><Share2 /></Button><Button variant="outline" size="icon" className="bg-background" aria-label="Salvar" aria-pressed={saved} onClick={salvar}><Heart className={saved ? "fill-current" : ""} /></Button></div></div>
    <span className="absolute bottom-3 right-3 rounded-md bg-noir px-3 py-2 text-xs font-semibold text-noir-foreground lg:hidden">{atual + 1}/{fotos.length}</span>
    <div className="absolute bottom-4 right-4 hidden gap-2 lg:flex">{p.plantas.length > 0 && <Button variant="outline" className="bg-background" onClick={() => abrir(p.plantas, 0)}><FileImage />Plantas</Button>}{video && <Button variant="outline" className="bg-background" onClick={() => abrir([video], 0)}><Play />Vídeo</Button>}<Button variant="outline" className="bg-background" onClick={() => abrir(fotos, 0)}><Images />Ver as {fotos.length} fotos</Button></div>
  </section>;
}