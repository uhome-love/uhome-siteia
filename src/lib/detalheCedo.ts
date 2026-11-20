import { capaResponsiva } from './imagemCapa';

/** Mesmo pedido público do detalhe, iniciado pelo pequeno script do HTML. */
export const DETAIL_COLUMNS = 'id,slug,tipo,finalidade,status,destaque,preco,preco_condominio,preco_iptu,iptu_periodicidade,area_total,area_util,quartos,banheiros,vagas,andar,latitude,longitude,titulo,descricao,diferenciais,comodidades,fotos,foto_principal,video_url,condominio_nome,publicado_em,bairro,cidade,uf';
export const pedidosDetalheCedo = new Map<string, Promise<Record<string, unknown>[]>>();

export function iniciarDetalheCedo() {
  const slug = location.pathname.match(/^(?:\/c\/[^/]+)?\/imovel\/([^/]+)\/?$/)?.[1];
  if (!slug) return;
  let k: string;
  try { k = decodeURIComponent(slug).trim(); } catch { return; }
  // Os atalhos por código mantêm a resolução existente do serviço.
  if (/^\d{2,7}\s*-\s*[a-z]{1,4}$/i.test(k) || pedidosDetalheCedo.has(k)) return;
  const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/imoveis`);
  url.search = new URLSearchParams({ select: DETAIL_COLUMNS, slug: `eq.${k}`, limit: '1' }).toString();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  const pedido = fetch(url.toString(), { headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, 'accept-profile': 'public' }, signal: controller.signal, cache: 'no-store' })
    .then(async r => { if (!r.ok) throw new Error(`Erro ao buscar imóvel (${r.status})`); return await r.json() as Record<string, unknown>[]; })
    .finally(() => clearTimeout(timeout));
  pedidosDetalheCedo.set(k, pedido);
  void pedido.then(rows => {
    const fotos = rows[0]?.fotos;
    const foto = Array.isArray(fotos) ? fotos[0]?.url : undefined;
    if (typeof foto !== 'string') return;
    const capa = capaResponsiva(foto);
    const link = document.createElement('link');
    link.rel = 'preload'; link.as = 'image'; link.href = capa.src;
    if (capa.srcSet) { link.imageSrcset = capa.srcSet; link.imageSizes = capa.sizes; }
    link.setAttribute('fetchpriority', 'high'); link.setAttribute('data-uh-detalhe-foto', '');
    document.head.append(link);
  }).catch(() => pedidosDetalheCedo.delete(k));
}