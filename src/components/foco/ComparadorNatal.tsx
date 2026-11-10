import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import type { ProdutoFoco } from "@/lib/produtosFoco";
import { Button } from "@/components/ui/button";

const brl = (v: number | null) => v ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }) : "Consulte";

export function dormitorios(p: ProdutoFoco): string {
  const ds = (p.ficha?.tipologias ?? []).map(t => t.dorm).filter((d): d is number => typeof d === "number" && d > 0);
  if (!ds.length) return "—";
  const min = Math.min(...ds), max = Math.max(...ds);
  return min === max ? `${min}` : `${min} a ${max}`;
}

function abrirLia(p: ProdutoFoco) {
  window.dispatchEvent(new CustomEvent("uhome:abrir-lia", { detail: { mensagem: `Quero as condições de Natal do ${p.nome}` } }));
}

export function ComparadorNatal({ produtos, linkFor, onContato }: { produtos: ProdutoFoco[]; linkFor: (path: string) => string; onContato?: (p: ProdutoFoco) => void }) {
  if (!produtos.length) return null;
  const contato = onContato ?? abrirLia;
  const ordenados = [...produtos].sort((a, b) => (a.preco_a_partir ?? Infinity) - (b.preco_a_partir ?? Infinity));
  return (
    <section id="comparar" className="mx-auto max-w-7xl scroll-mt-20 px-5 pb-10 sm:px-8">
      <h2 className="text-h2 text-foreground">Compare os empreendimentos</h2>
      <p className="mt-2 font-body text-muted-foreground">Do menor ao maior preço inicial.</p>
      <div className="mt-5 hidden overflow-x-auto rounded-2xl border border-border md:block">
        <table className="w-full font-body text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr><th className="p-3">Empreendimento</th><th className="p-3">Local</th><th className="p-3">A partir de</th><th className="p-3">Dorm.</th><th className="p-3">Entrega</th><th className="p-3"><span className="sr-only">Ação</span></th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {ordenados.map(p => (
              <tr key={p.id}>
                <td className="p-3"><Link to={linkFor(`/em-foco/${p.slug}`)} className="font-heading font-semibold text-foreground hover:underline">{p.nome}</Link>{p.incorporadora && <p className="text-xs text-muted-foreground">{p.incorporadora}</p>}</td>
                <td className="p-3 text-muted-foreground">{[p.bairro, p.cidade].filter(Boolean).join(", ")}</td>
                <td className="p-3 font-semibold text-foreground">{brl(p.preco_a_partir)}</td>
                <td className="p-3">{dormitorios(p)}</td>
                <td className="p-3">{p.entrega || p.status_obra || "—"}</td>
                <td className="p-3 text-right"><Button size="sm" className="bg-natal-gold text-natal-deep hover:bg-natal-gold/90" onClick={() => contato(p)}><MessageCircle /> Condições</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="-mx-5 mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 md:hidden">
        {ordenados.map(p => (
          <div key={p.id} className="w-[78%] shrink-0 snap-start rounded-2xl border border-border bg-card p-4">
            <Link to={linkFor(`/em-foco/${p.slug}`)} className="font-heading text-base font-bold text-foreground">{p.nome}</Link>
            <p className="text-xs text-muted-foreground">{[p.bairro, p.cidade].filter(Boolean).join(", ")}</p>
            <dl className="mt-3 grid grid-cols-2 gap-2 font-body text-sm">
              <div><dt className="text-xs text-muted-foreground">A partir de</dt><dd className="font-semibold">{brl(p.preco_a_partir)}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Dormitórios</dt><dd>{dormitorios(p)}</dd></div>
              <div className="col-span-2"><dt className="text-xs text-muted-foreground">Entrega</dt><dd>{p.entrega || p.status_obra || "—"}</dd></div>
            </dl>
            <Button size="sm" className="mt-3 w-full bg-natal-gold text-natal-deep hover:bg-natal-gold/90" onClick={() => contato(p)}><MessageCircle /> Quero as condições</Button>
          </div>
        ))}
      </div>
    </section>
  );
}
