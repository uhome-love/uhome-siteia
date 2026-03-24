import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EmpreendimentoLeadForm } from "@/components/EmpreendimentoLeadForm";
import { useCanonical } from "@/hooks/useCanonical";
import { MapPin, Calendar, Building2, Ruler, BedDouble, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Empreendimento {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  localizacao: string | null;
  bairro: string | null;
  cidade: string | null;
  tipologias: any[];
  preco_a_partir: number | null;
  preco_ate: number | null;
  diferenciais: string[] | null;
  imagem_principal: string | null;
  logo_url: string | null;
  previsao_entrega: string | null;
  construtora: string | null;
  meta_title: string | null;
  meta_description: string | null;
}

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export default function EmpreendimentoDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [emp, setEmp] = useState<Empreendimento | null>(null);
  const [loading, setLoading] = useState(true);
  useCanonical(`/empreendimentos/${slug}`);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from("empreendimentos")
      .select("*")
      .eq("slug", slug)
      .single()
      .then(({ data }) => {
        if (data) setEmp(data as unknown as Empreendimento);
        setLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    if (!emp) return;
    document.title = emp.meta_title || `${emp.nome} | Uhome`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && emp.meta_description) {
      metaDesc.setAttribute("content", emp.meta_description);
    }
  }, [emp]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!emp) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <Building2 className="mb-4 h-16 w-16 text-muted-foreground/40" />
          <h1 className="text-2xl font-bold">Empreendimento não encontrado</h1>
        </div>
        <Footer />
      </div>
    );
  }

  const tipologias = Array.isArray(emp.tipologias) ? emp.tipologias : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative mt-14 overflow-hidden">
        {emp.imagem_principal ? (
          <img
            src={emp.imagem_principal}
            alt={emp.nome}
            className="h-[50vh] w-full object-cover sm:h-[60vh]"
          />
        ) : (
          <div className="flex h-[50vh] items-center justify-center bg-muted sm:h-[60vh]">
            <Building2 className="h-24 w-24 text-muted-foreground/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 px-6 pb-10 sm:px-10">
          <div className="mx-auto max-w-5xl">
            {emp.logo_url && (
              <img src={emp.logo_url} alt={`${emp.nome} logo`} className="mb-4 h-10 object-contain sm:h-14" />
            )}
            <h1 className="text-3xl font-bold text-foreground sm:text-5xl">{emp.nome}</h1>
            {emp.construtora && (
              <p className="mt-1 text-base font-medium text-muted-foreground">por {emp.construtora}</p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {emp.bairro && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> {emp.bairro}{emp.cidade ? `, ${emp.cidade}` : ""}
                </span>
              )}
              {emp.previsao_entrega && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" /> Entrega: {emp.previsao_entrega}
                </span>
              )}
            </div>
            {(emp.preco_a_partir || emp.preco_ate) && (
              <p className="mt-3 text-lg font-semibold text-primary">
                {emp.preco_a_partir && `A partir de ${formatBRL(emp.preco_a_partir)}`}
                {emp.preco_a_partir && emp.preco_ate && " — "}
                {emp.preco_ate && `até ${formatBRL(emp.preco_ate)}`}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-6 py-12 sm:px-10">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Main */}
          <div className="lg:col-span-2 space-y-10">
            {/* Descrição */}
            {emp.descricao && (
              <div>
                <h2 className="mb-4 text-xl font-bold">Sobre o Empreendimento</h2>
                <p className="whitespace-pre-line text-muted-foreground leading-relaxed">{emp.descricao}</p>
              </div>
            )}

            {/* Tipologias */}
            {tipologias.length > 0 && (
              <div>
                <h2 className="mb-4 text-xl font-bold">Tipologias</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {tipologias.map((t: any, i: number) => (
                    <div key={i} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{t.tipo}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {t.area && (
                            <span className="flex items-center gap-1">
                              <Ruler className="h-3 w-3" /> {t.area}m²
                            </span>
                          )}
                          {t.quartos && (
                            <span className="flex items-center gap-1">
                              <BedDouble className="h-3 w-3" /> {t.quartos} quartos
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Diferenciais */}
            {emp.diferenciais && emp.diferenciais.length > 0 && (
              <div>
                <h2 className="mb-4 text-xl font-bold">Diferenciais</h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {emp.diferenciais.map((d, i) => (
                    <div key={i} className="flex items-center gap-2.5 rounded-lg p-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                      <span className="text-sm">{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Localização */}
            {emp.localizacao && (
              <div>
                <h2 className="mb-4 text-xl font-bold">Localização</h2>
                <div className="flex items-start gap-2 rounded-xl border border-border bg-card p-4">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <p className="text-sm text-muted-foreground">{emp.localizacao}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Lead form */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h3 className="mb-1 text-lg font-bold">Interessado?</h3>
                <p className="mb-5 text-sm text-muted-foreground">
                  Fale com um especialista sobre o {emp.nome}
                </p>
                <LeadFormInline
                  imovelTitulo={emp.nome}
                  imovelSlug={emp.slug}
                  imovelBairro={emp.bairro || undefined}
                  origemComponente="empreendimento_landing"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
