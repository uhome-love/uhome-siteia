/** Sugestões rápidas da busca em etapas (antes ficavam na fileira "Comece por aqui" da Home).
 * As cidades já aparecem como opções no passo "Onde", então aqui ficam só os atalhos que faltavam. */
export const SUGESTOES_ETAPA: Record<string, { nome: string; filtros: Record<string, string | number> }[]> = {
  tipo: [{ nome: 'Na planta', filtros: { fase: 'na_planta' } }],
  valor: [{ nome: 'Até R$ 500 mil', filtros: { precoMax: 500000 } }],
};
