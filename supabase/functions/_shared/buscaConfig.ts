export const BUSCA_URLS = {
  '/lancamentos-porto-alegre': { titulo: 'Lançamentos em Porto Alegre', texto: 'Apartamentos e casas na planta ou em obras em Porto Alegre. Compare preços e encontre seu novo lar.', filtros: { secao: 'lancamentos', cidade: 'Porto Alegre' } },
  '/apartamentos-ate-400-mil-porto-alegre': { titulo: 'Apartamentos até R$ 400 mil em Porto Alegre', texto: 'Apartamentos à venda até R$ 400 mil em Porto Alegre, com fotos, preços e localização.', filtros: { secao: 'imoveis', tipo: 'apartamento', precoMax: 400000, cidade: 'Porto Alegre' } },
  '/casas-em-condominio-porto-alegre': { titulo: 'Casas em condomínio em Porto Alegre', texto: 'Casas e sobrados em condomínio à venda em Porto Alegre. Encontre espaço, privacidade e comodidades.', filtros: { secao: 'imoveis', tipo: 'casa_condominio', cidade: 'Porto Alegre' } },
  '/studios-para-investir-porto-alegre': { titulo: 'Studios para investir em Porto Alegre', texto: 'Studios e compactos para investir em Porto Alegre. Compare imóveis e empreendimentos disponíveis.', filtros: { secao: 'investir', tipo: 'studio,loft', cidade: 'Porto Alegre' } },
  '/imoveis-canoas': { titulo: 'Imóveis em Canoas', texto: 'Apartamentos, casas e lotes à venda em Canoas. Compare opções, preços e bairros.', filtros: { secao: 'imoveis', cidade: 'Canoas' } },
} as const;
export type BuscaSecao = 'imoveis' | 'lancamentos' | 'investir';
export const SECOES = [{ id: 'imoveis', nome: 'Imóveis' }, { id: 'lancamentos', nome: 'Lançamentos' }, { id: 'investir', nome: 'Investir' }] as const;
export const CATEGORIAS = [
  { id: 'apartamentos', nome: 'Apartamentos', icone: 'apartamento', filtros: { tipo: 'apartamento' } },
  { id: 'casas_condominio', nome: 'Casas em condomínio', icone: 'casa', filtros: { tipo: 'casa_condominio' } },
  { id: 'studios', nome: 'Studios', icone: 'studio', filtros: { tipo: 'studio,loft' } },
  { id: 'terrenos', nome: 'Terrenos', icone: 'terreno', filtros: { tipo: 'terreno' } },
  { id: 'prontos', nome: 'Pronto pra morar', icone: 'pronto', filtros: { fase: 'novo,usado' } },
  { id: 'ate400', nome: 'Até R$ 400 mil', icone: 'valor', filtros: { precoMax: 400000 } },
  { id: 'canoas', nome: 'Em Canoas', icone: 'local', filtros: { cidade: 'Canoas' } },
] as const;
export function categoriasVisiveis(contagens: Record<string, number>) { return CATEGORIAS.filter(c => (contagens[c.id] ?? 0) >= 8); }
export function tituloBusca(cidade?: string) { return `Imóveis à venda em ${cidade || 'Porto Alegre'}`; }
/** Faixa de categorias com ícones 3D (Home e busca). Ícones em /public/categorias. */
export const CATEGORIAS_3D = [
  { id: 'garden', nome: 'Apartamentos garden', icone: '/categorias/garden.webp', filtros: { tipo: 'garden' } },
  { id: 'studios', nome: 'Studios', icone: '/categorias/studio.webp', filtros: { tipo: 'studio,loft' } },
  { id: 'casas_condominio', nome: 'Casas em condomínio', icone: '/categorias/condominio.webp', filtros: { tipo: 'casa_condominio' } },
  { id: 'terrenos', nome: 'Terrenos', icone: '/categorias/terreno.webp', filtros: { tipo: 'terreno' } },
  { id: 'ate400', nome: 'Até R$ 400 mil', icone: '/categorias/ate400.webp', filtros: { precoMax: 400000 } },
  { id: 'canoas', nome: 'Em Canoas', icone: '/categorias/canoas.webp', filtros: { cidade: 'Canoas' } },
  { id: 'coberturas', nome: 'Coberturas', icone: '/categorias/cobertura.webp', filtros: { tipo: 'cobertura' } },
] as const;
/** Contagem por categoria: usa `categorias` e, para garden/coberturas, `tipos` da busca_site. */
export function categorias3dVisiveis(categorias: Record<string, number>, tipos: Record<string, number>) {
  const n: Record<string, number> = { ...categorias, garden: categorias.garden ?? tipos.garden ?? 0, coberturas: categorias.coberturas ?? tipos.cobertura ?? 0 };
  return CATEGORIAS_3D.filter((c) => (n[c.id] ?? 0) >= 8);
}
/** Título dos resultados com total (exceção à regra de não mostrar totais). */
export function tituloBuscaComTotal(count: number | null | undefined, cidade?: string) {
  const lugar = `à venda em ${cidade || 'Porto Alegre'}`;
  if (count == null) return `Imóveis ${lugar}`;
  if (count === 0) return `Nenhum imóvel ${lugar}`;
  if (count === 1) return `1 imóvel ${lugar}`;
  if (count > 1000) return `Mais de 1.000 imóveis ${lugar}`;
  return `${count.toLocaleString('pt-BR')} imóveis ${lugar}`;
}
