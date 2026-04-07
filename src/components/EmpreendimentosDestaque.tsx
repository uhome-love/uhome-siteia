import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCorretor } from "@/contexts/CorretorContext";
import { Building2, ArrowRight, MapPin } from "lucide-react";
import { motion } from "framer-motion";

interface Empreendimento {
  id: string;
  nome: string;
  slug: string;
  construtora: string | null;
  bairro: string | null;
  cidade: string | null;
  imagem_principal: string | null;
  logo_url: string | null;
  preco_a_partir: number | null;
  previsao_entrega: string | null;
}

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export function EmpreendimentosDestaque() {
  const { prefixLink } = useCorretor();

  const { data: items = [] } = useQuery<Empreendimento[]>({
    queryKey: ["empreendimentos", "destaque-home"],
    queryFn: async () => {
      const { data } = await supabase
        .from("empreendimentos")
        .select("id, nome, slug, construtora, bairro, cidade, imagem_principal, logo_url, preco_a_partir, previsao_entrega")
        .eq("ativo", true)
        .eq("destaque_home", true)
        .order("ordem", { ascending: true });
      return (data as unknown as Empreendimento[]) ?? [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  if (items.length === 0) return null;

  return (
    <section className="py-12 sm:py-16">
      <div className="container-uhome">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">Empreendimentos em Destaque</h2>
              <p className="mt-1 text-sm text-muted-foreground">Lançamentos exclusivos selecionados para você</p>
            </div>
            <Link
              to={prefixLink("/empreendimentos")}
              className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex"
            >
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>

        <div className={`grid gap-5 ${items.length === 1 ? "grid-cols-1 max-w-lg" : items.length === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
          {items.map((emp, i) => (
            <motion.div
              key={emp.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
            >
              <Link
                to={prefixLink(`/empreendimentos/${emp.slug}`)}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:shadow-lg hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative aspect-[16/9] overflow-hidden">
                  {emp.imagem_principal ? (
                    <img
                      src={emp.imagem_principal}
                      alt={emp.nome}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <Building2 className="h-12 w-12 text-muted-foreground/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                  {/* Logo overlay */}
                  {emp.logo_url && (
                    <img
                      src={emp.logo_url}
                      alt={`${emp.nome} logo`}
                      className="absolute left-4 top-4 h-8 object-contain drop-shadow-lg"
                    />
                  )}

                  {/* Badge */}
                  {emp.previsao_entrega && (
                    <span className="absolute right-3 top-3 rounded-full bg-primary/90 px-3 py-1 text-[11px] font-semibold text-primary-foreground backdrop-blur-sm">
                      Entrega: {emp.previsao_entrega}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">
                        {emp.nome}
                      </h3>
                      {emp.construtora && (
                        <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                          por {emp.construtora}
                        </p>
                      )}
                    </div>
                  </div>

                  {emp.bairro && (
                    <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {emp.bairro}{emp.cidade ? `, ${emp.cidade}` : ""}
                    </p>
                  )}

                  {emp.preco_a_partir && (
                    <p className="mt-3 text-base font-bold text-primary">
                      A partir de {formatBRL(emp.preco_a_partir)}
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <Link
          to={prefixLink("/empreendimentos")}
          className="mt-6 flex items-center justify-center gap-1 text-sm font-medium text-primary hover:underline sm:hidden"
        >
          Ver todos <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
