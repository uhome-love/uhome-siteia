/** Filtros da busca a partir do endereço (arquivo leve, usado também no início do site). */
export function urlFiltros(params: URLSearchParams, preset: Record<string, unknown> = {}) {
  const f: Record<string, any> = { secao: 'imoveis', cidade: '', ordem: 'recentes', ...preset };
  const keys: Record<string, string> = { preco_max: 'precoMax', preco_min: 'precoMin', area_min: 'areaMin', area_max: 'areaMax', area_util_min: 'areaUtilMin', area_util_max: 'areaUtilMax', andar_min: 'andarMin', condominio_max: 'condominioMax', iptu_max: 'iptuMax' };
  params.forEach((v,k) => { const key = keys[k] ?? k; if (['precoMax','precoMin','quartos','vagas','banheiros','areaMin','areaMax','areaUtilMin','areaUtilMax','andarMin','condominioMax','iptuMax','novidades'].includes(key)) f[key]=Number(v); else if (['secao','cidade','tipo','fase','bairro','ordem','q','codigo','condominio','comodidades'].includes(key)) f[key]=v; });
  return f;
}
