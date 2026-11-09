import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MidiaFoco { url: string; legenda?: string | null; w?: number; h?: number }
export interface PrecoFoco { tipologia: string; valor: number; texto: string }
export interface BlackFoco { titulo: string; texto: string; itens: string[]; feed: string | null; story: string | null }
export interface FichaFoco {
  segmento?: string | null;
  tipo?: string | null;
  ficha_tecnica?: { item: string; valor: string }[];
  tipologias?: { nome: string; dorm?: number | null; suites?: number | null; area?: string; vagas?: string; obs?: string }[];
  unidade?: string[];
  lazer?: string[];
  proximidades?: { lugar: string; tempo: string }[];
  referencia?: string | null;
  maps_url?: string | null;
  precos?: PrecoFoco[];
  black?: BlackFoco | null;
}
export interface ProdutoFoco {
  id: string;
  slug: string;
  nome: string;
  incorporadora: string | null;
  bairro: string | null;
  cidade: string | null;
  endereco: string | null;
  segmento: string | null;
  tipo: string | null;
  status_obra: string | null;
  entrega: string | null;
  preco_a_partir: number | null;
  resumo: string | null;
  capa_url: string | null;
  logo_url: string | null;
  galeria: MidiaFoco[];
  plantas: MidiaFoco[];
  mapas: MidiaFoco[];
  ficha: FichaFoco;
  ordem: number;
}
export interface Campanha {
  id: string;
  slug: string;
  nome: string;
  tema: string;
  titulo: string | null;
  subtitulo: string | null;
  descricao: string | null;
  banner_url: string | null;
  inicio: string | null;
  fim: string | null;
  destaque_home: boolean;
  config: { black?: { inicio: string; fim: string; titulo: string; texto: string }; urna?: string };
}

export const SITE_URL = "https://uhome.com.br";

/** Imagens do catálogo usam caminho relativo; para compartilhar, precisa do domínio. */
export function absUrl(u?: string | null) {
  if (!u) return undefined;
  return u.startsWith("http") ? u : `${SITE_URL}${u}`;
}

export function formatPreco(v?: number | null) {
  if (!v) return null;
  if (v >= 1_000_000) {
    const mi = v / 1_000_000;
    return `R$ ${mi.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} mi`;
  }
  if (v % 1000 === 0) return `R$ ${(v / 1000).toLocaleString("pt-BR")} mil`;
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function hojeSP(now = new Date()) {
  return new Date(now.getTime() - 3 * 3600_000).toISOString().slice(0, 10);
}

/** Campanha vale entre início e fim (datas inclusivas, horário de Brasília). */
export function campanhaVigente(c: Pick<Campanha, "inicio" | "fim">, now = new Date()) {
  const d = hojeSP(now);
  if (c.inicio && d < c.inicio) return false;
  if (c.fim && d > c.fim) return false;
  return true;
}

/** Black Natal: semana definida em config.black (inclusiva). */
export function blackAtiva(c?: Pick<Campanha, "config"> | null, now = new Date()) {
  const b = c?.config?.black;
  if (!b) return false;
  const d = hojeSP(now);
  return d >= b.inicio && d <= b.fim;
}

const SELECT =
  "id, slug, nome, incorporadora, bairro, cidade, endereco, segmento, tipo, status_obra, entrega, preco_a_partir, resumo, capa_url, logo_url, galeria, plantas, mapas, ficha, ordem";

export function useProdutosFoco() {
  return useQuery({
    queryKey: ["produtos-foco"],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("produtos_foco")
        .select(SELECT)
        .eq("ativo", true)
        .eq("em_foco", true)
        .order("ordem");
      if (error) throw error;
      return (data ?? []) as unknown as ProdutoFoco[];
    },
  });
}

export function useProdutoFoco(slug?: string) {
  return useQuery({
    queryKey: ["produto-foco", slug],
    enabled: !!slug,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("produtos_foco")
        .select(SELECT)
        .eq("slug", slug!)
        .eq("ativo", true)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as ProdutoFoco | null;
    },
  });
}

/** Campanhas ativas e dentro do período. */
export function useCampanhasAtivas() {
  return useQuery({
    queryKey: ["campanhas-ativas"],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campanhas")
        .select("id, slug, nome, tema, titulo, subtitulo, descricao, banner_url, inicio, fim, destaque_home, config")
        .eq("ativo", true)
        .order("ordem");
      if (error) throw error;
      return ((data ?? []) as unknown as Campanha[]).filter((c) => campanhaVigente(c));
    },
  });
}

export function useCampanha(slug?: string) {
  return useQuery({
    queryKey: ["campanha", slug],
    enabled: !!slug,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data: c, error } = await supabase
        .from("campanhas")
        .select("id, slug, nome, tema, titulo, subtitulo, descricao, banner_url, inicio, fim, destaque_home, config")
        .eq("slug", slug!)
        .eq("ativo", true)
        .maybeSingle();
      if (error) throw error;
      if (!c) return null;
      const { data: links } = await supabase
        .from("campanha_produtos")
        .select("ordem, produto_id")
        .eq("campanha_id", c.id)
        .order("ordem");
      const ids = (links ?? []).map((l) => l.produto_id);
      const { data: prods } = ids.length
        ? await supabase.from("produtos_foco").select(SELECT).in("id", ids).eq("ativo", true)
        : { data: [] };
      const ordem = new Map(ids.map((id, i) => [id, i]));
      const produtos = ((prods ?? []) as unknown as ProdutoFoco[]).sort(
        (a, b) => (ordem.get(a.id) ?? 0) - (ordem.get(b.id) ?? 0)
      );
      return { campanha: c as unknown as Campanha, produtos, vigente: campanhaVigente(c as unknown as Campanha) };
    },
  });
}

/** Mensagem de WhatsApp para um produto, com link para a página. */
export function mensagemProduto(p: Pick<ProdutoFoco, "nome" | "bairro" | "slug">, corretorSlug?: string | null, corretorNome?: string) {
  const link = `${SITE_URL}${corretorSlug ? `/c/${corretorSlug}` : ""}/em-foco/${p.slug}`;
  const saud = corretorNome ? `Olá ${corretorNome.split(" ")[0]}! ` : "Olá! ";
  return `${saud}Tenho interesse no ${p.nome}${p.bairro ? ` (${p.bairro})` : ""}. Pode me passar as condições?\n${link}`;
}
