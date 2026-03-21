import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AISearchBar } from "@/components/AISearchBar";
import { SearchPropertyCard } from "@/components/SearchPropertyCard";
import { fetchImoveis, type Imovel } from "@/services/imoveis";
import { interpretarBusca, type AISearchResult } from "@/services/aiSearch";
import { Sparkles, SlidersHorizontal, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useEffect } from "react";

const AISearchPage = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AISearchResult | null>(null);
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchedQuery, setSearchedQuery] = useState("");

  const handleSearch = async (query: string) => {
    setLoading(true);
    setError(null);
    setSearchedQuery(query);

    try {
      const res = await interpretarBusca(query);
      setResult(res);

      // Use AI-extracted filters to query Supabase
      const f = res.filtros;
      const { data } = await fetchImoveis({
        finalidade: f.finalidade || undefined,
        tipo: f.tipo || undefined,
        bairro: f.bairros?.[0] || undefined,
        precoMin: f.preco_min || undefined,
        precoMax: f.preco_max || undefined,
        areaMin: f.area_min || undefined,
        quartos: f.quartos || undefined,
        diferenciais: f.diferenciais?.length ? f.diferenciais : undefined,
        limit: 20,
      });
      setImoveis(data);
    } catch (e: any) {
      const msg = e?.message || "Erro ao interpretar busca";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const confidenceColor = {
    alta: "text-green-400 bg-green-400/10",
    media: "text-yellow-400 bg-yellow-400/10",
    baixa: "text-red-400 bg-red-400/10",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container-uhome pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10">
            <Sparkles className="h-6 w-6 text-accent" />
          </div>
          <h1
            className="font-display text-3xl font-bold text-foreground sm:text-4xl"
            style={{ textWrap: "balance", lineHeight: 1.1 }}
          >
            Busca Inteligente
          </h1>
          <p className="mt-3 font-body text-sm text-muted-foreground">
            Descreva o imóvel dos seus sonhos — nossa IA interpreta e encontra os melhores resultados.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-8 max-w-3xl"
        >
          <AISearchBar onSearch={handleSearch} loading={loading} />
        </motion.div>

        <div className="mt-12">
          <AnimatePresence mode="wait">
            {error && !loading && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mx-auto max-w-2xl rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center"
              >
                <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
                <p className="mt-3 font-body text-sm text-foreground">{error}</p>
                <p className="mt-1 font-body text-xs text-muted-foreground">Tente reformular sua busca.</p>
              </motion.div>
            )}

            {result && !loading && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mx-auto mb-8 max-w-3xl">
                  <div className="glass rounded-2xl p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-body text-sm text-foreground">
                          <span className="font-semibold">"{searchedQuery}"</span>
                        </p>
                        <p className="mt-1 font-body text-xs text-muted-foreground">
                          IA interpretou: {result.resumo}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 font-body text-xs font-medium ${confidenceColor[result.confianca]}`}
                      >
                        Confiança {result.confianca}
                      </span>
                    </div>

                    {Object.entries(result.filtros).some(([, v]) =>
                      Array.isArray(v) ? v.length > 0 : v !== undefined
                    ) && (
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                        {result.filtros.finalidade && (
                          <FilterChip label={result.filtros.finalidade === "venda" ? "Venda" : "Locação"} />
                        )}
                        {result.filtros.tipo && <FilterChip label={result.filtros.tipo} />}
                        {result.filtros.bairros?.map((b) => <FilterChip key={b} label={b} />)}
                        {result.filtros.quartos && <FilterChip label={`${result.filtros.quartos}+ quartos`} />}
                        {result.filtros.preco_max && (
                          <FilterChip label={`Até R$${(result.filtros.preco_max).toLocaleString("pt-BR")}`} />
                        )}
                        {result.filtros.preco_min && (
                          <FilterChip label={`A partir de R$${(result.filtros.preco_min).toLocaleString("pt-BR")}`} />
                        )}
                        {result.filtros.area_min && <FilterChip label={`${result.filtros.area_min}m²+`} />}
                        {result.filtros.diferenciais?.map((d) => <FilterChip key={d} label={d} />)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mx-auto max-w-4xl">
                  <p className="mb-4 font-body text-sm text-muted-foreground">
                    {imoveis.length} {imoveis.length === 1 ? "imóvel encontrado" : "imóveis encontrados"}
                  </p>

                  {imoveis.length === 0 ? (
                    <div className="rounded-2xl border border-border bg-card p-12 text-center">
                      <p className="font-body text-sm text-muted-foreground">
                        Nenhum imóvel corresponde aos filtros. Tente uma busca mais ampla.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {imoveis.map((imovel, i) => (
                        <motion.div
                          key={imovel.id}
                          initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                          transition={{ duration: 0.4, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <SearchPropertyCard imovel={imovel} index={i} />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {!result && !loading && !error && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mx-auto max-w-md py-16 text-center"
              >
                <Sparkles className="mx-auto h-10 w-10 text-muted-foreground/30" />
                <p className="mt-4 font-body text-sm text-muted-foreground">
                  Digite o que você procura acima ou clique em uma sugestão.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Footer />
    </div>
  );
};

function FilterChip({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-accent/10 px-2.5 py-1 font-body text-[11px] font-medium text-accent capitalize">
      {label}
    </span>
  );
}

export default AISearchPage;
