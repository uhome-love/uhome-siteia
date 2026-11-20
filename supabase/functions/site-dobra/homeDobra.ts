import { NAV_HOME, BARRA_HOME, CAPA_HOME, FAIXA_HOME, CATEGORIA_HOME, CARD_HOME } from './moldes-home.ts';
import { categorias3dVisiveis } from '../_shared/buscaConfig.ts';
import { selosDoCard } from '../_shared/novidade.ts';

const esc = (s: unknown) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const preencher = (molde: string, valores: Record<string, unknown>) => molde.replace(/\{\{(\w+)\}\}/g, (_, k: string) => esc(valores[k]));
type Row = { slug: string; tipo: string; fonte?: string; titulo?: string; foto_principal: string; bairro: string; cidade: string; quartos?: number; vagas?: number; area_util?: number; area_total?: number; preco?: number; publicado_em?: string; fase?: string };
export type HomeSeed = { rows: Row[]; categorias?: Record<string, number>; tipos?: Record<string, number>; comodidades?: Record<string, number> };

export const HISTORICO_CSS = '.home-historico{min-height:141px}.home-visto-esqueleto{height:94px}@media(max-width:639px){.home-historico{min-height:134px}}';
export const HOME_GUARD = `(function(){var p=document.getElementById('uh-pre');if(document.querySelector('meta[name="uh-home-layout"]')?.content!=='lar-2'){p?.remove();return;}document.documentElement.classList.add('uh-home-vitrine');try{var ids=JSON.parse(localStorage.getItem('imoveis_vistos')||'[]');if(Array.isArray(ids)&&ids.some(function(v){return typeof v==='string';})){var h=p?.querySelector('[data-uh-historico]');if(h)h.hidden=false;}var b=JSON.parse(localStorage.getItem('uh_buscas_recentes')||'[]');if(b[0]?.rotulo){var s=p?.querySelector('.uhs-busca-linhas small');if(s)s.textContent='Última: '+b[0].rotulo;}}catch(e){}var f=p?.querySelector('.faixa-rolavel'),t=f?.querySelector('.home-categorias-trilho');function medir(){if(f&&t)f.toggleAttribute('data-dir',t.scrollWidth>t.clientWidth+4);}requestAnimationFrame(medir);window.addEventListener('load',medir,{once:true});})();`;

export function renderHomeDobra(data: HomeSeed, fotoUrl: (src: string) => string, agora = Date.now()) {
  if (!data?.rows?.[0]?.foto_principal) return { head: '', pre: '', script: '', homeLayout: 'lar-2' };
  const cats = categorias3dVisiveis(data.categorias ?? {}, data.tipos ?? {}, data.comodidades ?? {}).map(c => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(c.filtros)) params.set(k === 'precoMax' ? 'preco_max' : k, String(v));
    return preencher(CATEGORIA_HOME, { HREF: `/busca?${params}`, ICONE: c.icone.replace('/categorias/', '/categorias/p/'), NOME: c.nome });
  }).join('');
  const cards = data.rows.slice(0, 5).map((r, i) => {
    const tipo = ({ garden: 'Apartamento Garden', casa_condominio: 'Casa em Condomínio' } as Record<string, string>)[r.tipo] ?? (r.tipo.charAt(0).toUpperCase() + r.tipo.slice(1));
    const titulo = r.fonte === 'produto' ? r.titulo : `${tipo}${(r.quartos ?? 0) > 0 ? ` ${r.quartos} quarto${Number(r.quartos) > 1 ? 's' : ''}` : ' para Venda'} — ${r.bairro}`;
    const selos = selosDoCard(r.publicado_em, r.fase, undefined, agora);
    const stats = [selos.linha, ...[r.area_util ?? r.area_total, r.quartos, r.vagas].map((v, j) => v ? `${j === 0 ? Number(v).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : v} ${j === 0 ? 'm²' : j === 1 ? `quarto${v > 1 ? 's' : ''}` : `vaga${v > 1 ? 's' : ''}`}` : undefined)].filter(Boolean).join(' · ');
    const preco = !r.preco || r.preco < 1000 ? 'Consulte' : Number(r.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
    let h = preencher(CARD_HOME.replace('{{SELO}}', selos.foto ? `<span class="catalog-badge">${esc(selos.foto)}</span>` : ''), { HREF: `/${r.fonte === 'produto' ? 'em-foco' : 'imovel'}/${r.slug}`, TITULO: titulo, FOTO: fotoUrl(r.foto_principal), PRIORIDADE: i === 0 ? 'high' : 'low', LOADING: i === 0 ? 'eager' : 'lazy', STATS: stats, LOCAL: `${r.bairro}, ${r.cidade}`, PRECO: `${r.fonte === 'produto' ? 'A partir de ' : ''}${preco}` });
    if (i > 0) h = h.replace(/<img([^>]*?)src="([^"]+)"([^>]*?)>/, '<picture><source media="(min-width:640px)" srcset="$2"><img$1 src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="$3></picture>');
    return h;
  }).join('');
  const historico = '<section class="home-fileira home-historico" data-uh-historico hidden aria-hidden="true"><div class="home-fileira-topo"><h2>Continue de onde parou</h2></div><div class="home-trilho home-trilho-vistos"><div class="home-visto home-visto-esqueleto"></div></div></section>';
  const novos = `<section class="home-fileira" data-uh-home-novos><div class="home-fileira-topo"><h2>Novos no site<span class="hidden sm:inline"> em Porto Alegre</span></h2><a href="/busca?novidades=30&amp;ordem=recentes">Ver todos</a></div><div class="home-trilho">${cards}</div></section>`;
  return { homeLayout: 'lar-2', head: `<style>${HISTORICO_CSS}</style><link rel="preload" as="image" fetchpriority="high" href="${esc(fotoUrl(data.rows[0].foto_principal))}">`, pre: `<div id="uh-pre" data-uh-alvo="[data-uh-home-novos] .catalog-photo img[fetchpriority=high]"><div class="min-h-screen bg-background">${NAV_HOME}${BARRA_HOME}<main>${CAPA_HOME}${FAIXA_HOME.replace('{{CATEGORIAS}}', cats)}<div class="home-conteudo">${historico}${novos}</div></main></div></div>`, script: '' };
}