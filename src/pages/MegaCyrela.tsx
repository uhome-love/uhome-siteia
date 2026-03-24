import { useEffect, useState } from "react";
import { FotoImovel } from "@/components/FotoImovel";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EmpreendimentoLeadForm } from "@/components/EmpreendimentoLeadForm";
import { useCanonical } from "@/hooks/useCanonical";
import { useCorretor } from "@/contexts/CorretorContext";
import {
  MapPin, Calendar, BadgePercent, ArrowRight, Building2, Repeat, CreditCard, TrendingDown, Loader2,
} from "lucide-react";

interface Empreendimento {
  id: string;
  nome: string;
  slug: string;
  bairro: string | null;
  cidade: string | null;
  imagem_principal: string | null;
  preco_a_partir: number | null;
  previsao_entrega: string | null;
  construtora: string | null;
  tipologias: any;
  diferenciais: string[] | null;
}

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

const financingHighlights = [
  { icon: BadgePercent, title: "Taxa 10,63% a.a.", desc: "Financiamento pela Caixa com as melhores taxas do mercado" },
  { icon: CreditCard, title: "Parcelas em 240x", desc: "Parcelamento linear em até 240 meses" },
  { icon: TrendingDown, title: "IPCA + 12%", desc: "Correção pelo IPCA com taxa fixa de 12% ao ano" },
  { icon: Repeat, title: "Permuta até 40%", desc: "Aceita seu imóvel como parte do pagamento" },
];

export default function MegaCyrela() {
  useCanonical("/mega-cyrela");
  const { prefixLink } = useCorretor();
  const [items, setItems] = useState<Empreendimento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Mega da Cyrela - Oportunidades Exclusivas | Uhome";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Confira todas as ofertas do Mega da Cyrela em Porto Alegre. Condições especiais de financiamento, studios a partir de R$ 299 mil e apartamentos de alto padrão.");

    supabase
      .from("empreendimentos")
      .select("id, nome, slug, bairro, cidade, imagem_principal, preco_a_partir, previsao_entrega, construtora, tipologias, diferenciais")
      .eq("ativo", true)
      .eq("construtora", "Cyrela")
      .order("ordem", { ascending: true })
      .then(({ data }) => {
        if (data) setItems(data as unknown as Empreendimento[]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(145,40%,12%)] via-[hsl(145,35%,18%)] to-[hsl(145,30%,22%)] py-20 sm:py-28">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c9a94e' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="container-uhome relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[hsl(43,60%,60%)]">
              Seleção Cyrela
            </p>
            <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
              Mega da Cyrela
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
              Os melhores endereços de Porto Alegre com as maiores oportunidades.
              Condições exclusivas de financiamento e unidades prontas para morar.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Financing Highlights */}
      <section className="border-b border-border bg-card py-16">
        <div className="container-uhome">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">
              Condições Especiais de Financiamento
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-muted-foreground">
              Aproveite as melhores condições do mercado para realizar o sonho do imóvel próprio
            </p>
          </motion.div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {financingHighlights.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="rounded-xl border border-border bg-background p-6 text-center"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Empreendimentos Grid */}
      <section className="py-16 sm:py-20">
        <div className="container-uhome">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Empreendimentos Disponíveis
            </h2>
            <p className="mt-2 text-muted-foreground">
              Escolha o empreendimento ideal para você
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((emp, i) => {
                const tipologias = Array.isArray(emp.tipologias) ? emp.tipologias : [];
                const tipoLabel = tipologias.map((t: any) => t.tipo).filter(Boolean).join(" / ");

                return (
                  <motion.div
                    key={emp.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ duration: 0.4, delay: (i % 3) * 0.1 }}
                  >
                    <Link
                      to={prefixLink(`/empreendimentos/${emp.slug}`)}
                      className="group block overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-lg"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        {emp.imagem_principal ? (
                          <FotoImovel
                            src={emp.imagem_principal}
                            alt={emp.nome}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                            decoding="async"
                            width={800}
                            height={600}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted">
                            <Building2 className="h-12 w-12 text-muted-foreground/30" />
                          </div>
                        )}

                        {emp.previsao_entrega && (
                          <span className="absolute right-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
                            {emp.previsao_entrega}
                          </span>
                        )}
                      </div>

                      <div className="p-5">
                        <h3 className="text-lg font-bold text-foreground">{emp.nome}</h3>

                        <div className="mt-1.5 flex items-center gap-3 text-sm text-muted-foreground">
                          {emp.bairro && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" /> {emp.bairro}
                            </span>
                          )}
                          {tipoLabel && (
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3.5 w-3.5" /> {tipoLabel}
                            </span>
                          )}
                        </div>

                        {emp.preco_a_partir && (
                          <p className="mt-3 text-lg font-bold text-primary">
                            A partir de {formatBRL(emp.preco_a_partir)}
                          </p>
                        )}

                        <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                          Ver detalhes <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA / Lead Form */}
      <section className="border-t border-border bg-muted/50 py-16">
        <div className="container-uhome">
          <div className="mx-auto max-w-lg rounded-xl border border-border bg-card p-8 shadow-sm">
            <h2 className="text-center text-xl font-bold text-foreground">
              Fale com um Especialista
            </h2>
            <p className="mt-1 text-center text-sm text-muted-foreground">
              Receba informações exclusivas sobre as oportunidades do Mega da Cyrela
            </p>
            <div className="mt-6">
              <EmpreendimentoLeadForm
                empreendimentoNome="Mega da Cyrela"
                empreendimentoSlug="mega-cyrela"
                bairro="Porto Alegre"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
