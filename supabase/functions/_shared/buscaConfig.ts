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
export function totalHome(total: number | null) { return total ? `${Math.floor(total / 1000)} mil+` : 'milhares de'; }