// Montagem dos links personalizados de Natal por corretor (usado pelo crm-bridge e testes).
export const SITE_URL = "https://uhome.com.br";

export interface CorretorInfo {
  slug_ref: string | null;
  ativo: boolean | null;
  nome?: string | null;
  foto_url?: string | null;
  telefone?: string | null;
}

export interface ProdutoInfo {
  slug: string;
  nome: string;
  bairro?: string | null;
  cidade?: string | null;
  capa_url?: string | null;
  preco_texto?: string | null;
  preco_a_partir?: number | null;
  entrega?: string | null;
}

export function validarCorretor(c: CorretorInfo | null): string | null {
  if (!c) return "Corretor não encontrado no site";
  if (c.ativo === false) return "Corretor inativo no site";
  if (!c.slug_ref || !/^[a-z0-9-]+$/.test(c.slug_ref)) return "Corretor sem link (slug) válido";
  return null;
}

export function montarLinksNatal(slug: string, campanhaSlug: string, produtos: ProdutoInfo[]) {
  const base = `${SITE_URL}/c/${slug}`;
  return {
    campanha_url: `${base}/campanha/${campanhaSlug}`,
    produtos: produtos.map((p) => ({
      ...p,
      url: `${base}/em-foco/${p.slug}`,
      mensagem: `Olá! Separei para você o ${p.nome}${p.bairro ? ` (${p.bairro})` : ""} com as condições especiais do Natal Chave de Ouro: ${base}/em-foco/${p.slug}`,
    })),
  };
}
