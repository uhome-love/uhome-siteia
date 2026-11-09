import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, CalendarCheck, ShieldCheck, ArrowRight } from "lucide-react";
import { useCorretor } from "@/contexts/CorretorContext";
import { useTotalImoveis, formatTotal } from "@/hooks/useTotalImoveis";
import { useGoogleReviews } from "@/hooks/useGoogleReviews";
import { useCorretoresVitrine } from "@/hooks/useCorretoresVitrine";

const passos = [
  { icon: Search, n: "1", titulo: "Encontre", desc: "Busque por bairro, no mapa ou descreva o que procura para a nossa IA. Só imóveis com foto e informação real." },
  { icon: CalendarCheck, n: "2", titulo: "Visite", desc: "Agende a visita online em poucos cliques. Um corretor especialista no bairro te acompanha." },
  { icon: ShieldCheck, n: "3", titulo: "Compre com segurança", desc: "Simulação de financiamento, negociação e toda a documentação cuidadas pela Uhome até a chave." },
];

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

/** "Como funciona" em 3 passos + números de confiança (todos vindos do banco). */
export function PorQueUhome() {
  const { prefixLink } = useCorretor();
  const total = useTotalImoveis();
  const { data: reviews } = useGoogleReviews();
  const { data: corretores = [] } = useCorretoresVitrine();

  const stats = [
    { v: formatTotal(total), l: "imóveis à venda" },
    reviews?.nota ? { v: `${reviews.nota.toLocaleString("pt-BR")} ★`, l: `${reviews.total} avaliações no Google` } : null,
    corretores.length ? { v: `${corretores.length}`, l: "corretores especialistas" } : null,
  ].filter(Boolean) as { v: string; l: string }[];

  return (
    <section className="bg-secondary/50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="max-w-2xl">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-primary">Como funciona</p>
          <h2 className="mt-3 font-body text-[clamp(1.6rem,3.5vw,2.4rem)] font-extrabold leading-[1.12] tracking-tight text-foreground" style={{ textWrap: "balance" }}>
            Do primeiro clique à chave na mão, em 3 passos
          </h2>
        </div>

        <div className="-mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0">
          {passos.map((p, i) => (
            <motion.div
              key={p.titulo}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.08, ease }}
              className="relative w-[78vw] max-w-[320px] flex-shrink-0 snap-start rounded-2xl border border-border bg-card p-6 md:w-auto md:max-w-none"
            >
              <span className="absolute right-5 top-4 font-body text-5xl font-extrabold text-primary/10">{p.n}</span>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-body text-lg font-bold text-foreground">{p.titulo}</h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="grid flex-1 grid-cols-3 gap-4">
            {stats.map((s) => (
              <div key={s.l}>
                <p className="font-body text-xl font-extrabold text-foreground sm:text-3xl">{s.v}</p>
                <p className="mt-1 font-body text-xs text-muted-foreground sm:text-sm">{s.l}</p>
              </div>
            ))}
          </div>
          <Link
            to={prefixLink("/busca?finalidade=venda")}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 font-body text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Começar a busca <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
