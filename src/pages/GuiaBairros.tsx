import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useCanonical } from "@/hooks/useCanonical";
import { setJsonLd, removeJsonLd } from "@/lib/jsonld";
import { useCorretor } from "@/contexts/CorretorContext";
import { supabase } from "@/integrations/supabase/client";
import { formatPreco } from "@/services/imoveis";
import { bairrosData } from "@/data/bairros";
import { MapPin, TrendingUp, Home, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface BairroStats {
  bairro: string;
  count: number;
  precoMedio: number;
  precoMin: number;
  precoMax: number;
}

const GuiaBairros = () => {
  useCanonical("/guia-bairros");
  const { prefixLink } = useCorretor();
  const [stats, setStats] = useState<BairroStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Guia de Bairros de Porto Alegre | Comparativo de Preços | Uhome";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", "Compare todos os bairros de Porto Alegre: preço médio, quantidade de imóveis, perfil de moradia e infraestrutura. Guia completo para escolher onde morar.");
    }

    setJsonLd("jsonld-guia-bairros", {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Guia de Bairros de Porto Alegre",
      description: "Comparativo de preços e perfil dos principais bairros de Porto Alegre para compra de imóveis.",
      url: "https://uhome.com.br/guia-bairros",
      itemListOrder: "https://schema.org/ItemListOrderDescending",
    });

    return () => removeJsonLd("jsonld-guia-bairros");
  }, []);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("imoveis")
        .select("bairro, preco")
        .eq("status", "disponivel")
        .eq("finalidade", "venda")
        .gt("preco", 50000);

      if (!data) { setLoading(false); return; }

      const map: Record<string, { precos: number[] }> = {};
      for (const row of data) {
        if (!map[row.bairro]) map[row.bairro] = { precos: [] };
        map[row.bairro].precos.push(row.preco);
      }

      const result: BairroStats[] = Object.entries(map)
        .map(([bairro, s]) => ({
          bairro,
          count: s.precos.length,
          precoMedio: Math.round(s.precos.reduce((a, b) => a + b, 0) / s.precos.length),
          precoMin: Math.min(...s.precos),
          precoMax: Math.max(...s.precos),
        }))
        .filter(b => b.count >= 5)
        .sort((a, b) => b.count - a.count);

      setStats(result);
      setLoading(false);
    }
    load();
  }, []);

  const faixas = useMemo(() => {
    if (!stats.length) return [];
    return [
      { label: "Até R$ 500 mil", bairros: stats.filter(b => b.precoMedio <= 500000) },
      { label: "R$ 500 mil – R$ 1 mi", bairros: stats.filter(b => b.precoMedio > 500000 && b.precoMedio <= 1000000) },
      { label: "R$ 1 mi – R$ 2 mi", bairros: stats.filter(b => b.precoMedio > 1000000 && b.precoMedio <= 2000000) },
      { label: "Acima de R$ 2 mi", bairros: stats.filter(b => b.precoMedio > 2000000) },
    ].filter(f => f.bairros.length > 0);
  }, [stats]);

  const slugify = (name: string) =>
    name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const getBairroData = (name: string) => bairrosData.find(b => b.nome === name);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="pt-28 pb-12 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="mx-auto max-w-7xl px-6">
            <Breadcrumbs items={[{ label: "Bairros", href: "/bairros" }, { label: "Guia Comparativo" }]} className="mb-6" />
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
              Guia de Bairros de Porto Alegre
            </h1>
            <p className="mt-3 text-lg text-muted-foreground font-body max-w-2xl">
              Compare preço médio, quantidade de imóveis e perfil de cada bairro para escolher o melhor lugar para morar ou investir.
            </p>
          </div>
        </section>

        {/* Stats summary */}
        {!loading && stats.length > 0 && (
          <section className="py-8 border-b border-border">
            <div className="mx-auto max-w-7xl px-6 flex flex-wrap gap-6 text-center justify-center">
              <div>
                <p className="text-2xl font-heading font-bold text-primary">{stats.length}</p>
                <p className="text-xs text-muted-foreground">Bairros ativos</p>
              </div>
              <div>
                <p className="text-2xl font-heading font-bold text-primary">
                  {stats.reduce((a, b) => a + b.count, 0).toLocaleString("pt-BR")}
                </p>
                <p className="text-xs text-muted-foreground">Imóveis disponíveis</p>
              </div>
              <div>
                <p className="text-2xl font-heading font-bold text-primary">
                  {formatPreco(Math.min(...stats.map(s => s.precoMin)))}
                </p>
                <p className="text-xs text-muted-foreground">Menor preço</p>
              </div>
            </div>
          </section>
        )}

        {/* Faixas de preço */}
        {faixas.map((faixa, fi) => (
          <section key={fi} className="py-12 border-b border-border">
            <div className="mx-auto max-w-7xl px-6">
              <h2 className="font-heading text-xl md:text-2xl font-bold text-foreground flex items-center gap-2 mb-6">
                <TrendingUp className="h-5 w-5 text-primary" />
                {faixa.label}
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({faixa.bairros.length} bairros)
                </span>
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {faixa.bairros.slice(0, 12).map((b, i) => {
                  const data = getBairroData(b.bairro);
                  const bSlug = slugify(b.bairro);
                  return (
                    <motion.div
                      key={b.bairro}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Link
                        to={prefixLink(`/bairros/${bSlug}`)}
                        className="block rounded-xl border border-border bg-background p-5 hover:border-primary/30 hover:shadow-md transition-all group"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-heading text-base font-bold text-foreground group-hover:text-primary transition-colors">
                              {b.bairro}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Home className="h-3 w-3" />
                              {b.count} imóveis
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-sm font-semibold text-foreground">{formatPreco(b.precoMedio)}</p>
                          <p className="text-xs text-muted-foreground">preço médio</p>
                        </div>
                        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                          <span>De {formatPreco(b.precoMin)}</span>
                          <span>até {formatPreco(b.precoMax)}</span>
                        </div>
                        {data && (
                          <p className="mt-3 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {data.descricao.slice(0, 120)}…
                          </p>
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        ))}

        {/* Full ranking table */}
        {!loading && stats.length > 0 && (
          <section className="py-12">
            <div className="mx-auto max-w-7xl px-6">
              <h2 className="font-heading text-xl md:text-2xl font-bold text-foreground mb-6">
                Ranking completo por número de imóveis
              </h2>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm font-body">
                  <thead className="bg-secondary/30">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">#</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Bairro</th>
                      <th className="text-right px-4 py-3 font-semibold text-foreground">Imóveis</th>
                      <th className="text-right px-4 py-3 font-semibold text-foreground">Preço médio</th>
                      <th className="text-right px-4 py-3 font-semibold text-foreground hidden sm:table-cell">Mínimo</th>
                      <th className="text-right px-4 py-3 font-semibold text-foreground hidden sm:table-cell">Máximo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.slice(0, 50).map((b, i) => (
                      <tr key={b.bairro} className="border-t border-border hover:bg-secondary/10 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                        <td className="px-4 py-3">
                          <Link
                            to={prefixLink(`/bairros/${slugify(b.bairro)}`)}
                            className="text-primary hover:underline font-medium flex items-center gap-1"
                          >
                            <MapPin className="h-3 w-3" />
                            {b.bairro}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-right text-foreground font-medium">{b.count}</td>
                        <td className="px-4 py-3 text-right text-foreground font-semibold">{formatPreco(b.precoMedio)}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground hidden sm:table-cell">{formatPreco(b.precoMin)}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground hidden sm:table-cell">{formatPreco(b.precoMax)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {loading && (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {/* SEO text */}
        <section className="py-12 bg-secondary/10">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="font-heading text-xl font-bold text-foreground mb-4">
              Como escolher o melhor bairro em Porto Alegre
            </h2>
            <div className="font-body text-sm text-muted-foreground leading-relaxed space-y-3 max-w-3xl">
              <p>
                Escolher o bairro certo é tão importante quanto escolher o imóvel. Porto Alegre conta com mais de 80 bairros,
                cada um com perfil, infraestrutura e faixa de preço distintos. Moinhos de Vento e Três Figueiras são referência
                em alto padrão, enquanto Cidade Baixa e Centro Histórico oferecem opções mais acessíveis com vida cultural intensa.
              </p>
              <p>
                Para famílias, bairros como Petrópolis, Auxiliadora e Boa Vista oferecem escolas reconhecidas e segurança.
                Jovens profissionais podem preferir Bela Vista ou Rio Branco pela proximidade com universidades e centros empresariais.
                Já quem busca natureza encontra em Tristeza e Ipanema a proximidade com o Guaíba.
              </p>
              <p>
                Use nosso comparativo acima para analisar preço médio, quantidade de opções e perfil de cada bairro.
                Clique em qualquer bairro para ver imóveis disponíveis, infraestrutura detalhada e dicas de investimento.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default GuiaBairros;
