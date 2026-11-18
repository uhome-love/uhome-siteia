import { useEffect, useMemo, useState } from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Search, X, ChevronDown, Waves, Flame, ChefHat, FlameKindling, Trees, DoorOpen, Sun, Sprout, Mountain, Snowflake, Sofa, Bath, Briefcase, ArrowUpDown, PawPrint, Accessibility } from 'lucide-react';
import { buscarSite, type BuscaSiteResult } from '@/services/buscaSite';
import { supabase } from '@/lib/supabaseLazy';

export const TIPOS: Record<string, string> = { apartamento: 'Apartamentos', casa: 'Casas', casa_condominio: 'Casas em condomínio', studio: 'Studios', loft: 'Lofts', cobertura: 'Coberturas', garden: 'Garden', terreno: 'Terrenos', comercial: 'Comerciais' };

/** Tipos do painel (cartões com ícone 3D). Garden inclui apartamento com pátio. */
export const TIPOS_PAINEL = [
  { id: 'apartamento', nome: 'Apartamento', icone: '/categorias/apartamento.webp' },
  { id: 'casa', nome: 'Casa', icone: '/categorias/casa.webp' },
  { id: 'casa_condominio', nome: 'Casa em condomínio', icone: '/categorias/condominio.webp' },
  { id: 'garden', nome: 'Apartamento garden', icone: '/categorias/garden.webp' },
  { id: 'cobertura', nome: 'Cobertura', icone: '/categorias/cobertura.webp' },
  { id: 'studio,loft', nome: 'Studio', icone: '/categorias/studio.webp' },
  { id: 'terreno', nome: 'Terreno', icone: '/categorias/terreno.webp' },
];
export const RECOMENDADOS = [
  { id: 'Pátio', nome: 'Com pátio', icone: '/categorias/garden.webp' },
  { id: 'Piscina', nome: 'Piscina', icone: '/categorias/piscina.webp' },
  { id: 'Pet friendly', nome: 'Aceita pet', icone: '/categorias/pet.webp' },
  { id: 'Vista panorâmica', nome: 'Vista panorâmica', icone: '/categorias/vista.webp' },
];
/** Comodidades oferecidas (nomes exatos vindos da Jetimob). */
export const COMODIDADES: { grupo: string; itens: [string, string, typeof Waves][] }[] = [
  { grupo: 'Lazer', itens: [['Piscina', 'Piscina', Waves], ['Churrasqueira', 'Churrasqueira', Flame], ['Espaço gourmet', 'Espaço gourmet', ChefHat], ['Lareira', 'Lareira', FlameKindling]] },
  { grupo: 'Espaço externo', itens: [['Pátio', 'Pátio', Trees], ['Sacada', 'Sacada', DoorOpen], ['Terraço', 'Terraço', Sun], ['Quintal', 'Quintal', Sprout], ['Vista panorâmica', 'Vista panorâmica', Mountain]] },
  { grupo: 'Conforto', itens: [['Ar condicionado', 'Ar-condicionado', Snowflake], ['Móveis planejados', 'Móveis planejados', Sofa], ['Lavabo', 'Lavabo', Bath], ['Escritório', 'Escritório', Briefcase]] },
  { grupo: 'Prédio', itens: [['Elevador', 'Elevador', ArrowUpDown], ['Pet friendly', 'Aceita pet', PawPrint], ['Acessibilidade para PCD', 'Acessibilidade', Accessibility]] },
];
const PRECO_MAX = 3_000_000;
/** Escala da faixa de preço: até R$ 1 mi em passos de R$ 10 mil (100 posições), acima em passos de R$ 50 mil (40 posições). */
export const POS_MAX = 140;
export const posParaPreco = (p: number) => (p <= 100 ? p * 10_000 : 1_000_000 + (p - 100) * 50_000);
export const precoParaPos = (v: number) => (!v ? 0 : v <= 1_000_000 ? Math.round(v / 10_000) : Math.min(POS_MAX, 100 + Math.round((v - 1_000_000) / 50_000)));
const LARGURA_BALDE = (i: number) => (i < 10 ? 10 : 2);
const CIDADES = ['Porto Alegre', 'Canoas', 'Cachoeirinha', 'Gravataí', 'Guaíba', 'Capão da Canoa', 'Torres', 'Gramado', 'Canela'];
export const reais = (v: number) => !v ? 'R$ 0' : v >= 1_000_000 ? `R$ ${(v / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} mi` : `R$ ${Math.round(v / 1000)} mil`;
export const listaComodidades = (s?: string) => (s ? String(s).split(',').filter(Boolean) : []);
export function alternarComodidade(atual: string | undefined, c: string) { const l = listaComodidades(atual); return (l.includes(c) ? l.filter((x) => x !== c) : [...l, c]).join(','); }

function Contador({ rotulo, valor, onChange }: { rotulo: string; valor: number; onChange: (v: number) => void }) {
  return <div className="filtro-contador" role="group" aria-label={rotulo}><span>{rotulo}</span><div className="filtro-stepper"><button type="button" aria-label={`Menos ${rotulo.toLowerCase()}`} disabled={!valor} onClick={() => onChange(Math.max(0, (valor || 0) - 1))}>−</button><output aria-live="polite">{valor ? `${valor}+` : 'Qualquer'}</output><button type="button" aria-label={`Mais ${rotulo.toLowerCase()}`} disabled={(valor || 0) >= 5} onClick={() => onChange(Math.min(5, (valor || 0) + 1))}>+</button></div></div>;
}

let bairrosCache: Promise<string[]> | null = null;
const bairros = () => (bairrosCache ??= Promise.resolve(supabase.rpc('get_bairros_disponiveis')).then(({ data }) => ((data as any[]) ?? []).map((b) => String(b.bairro)).filter(Boolean)));

export type Secao = 'onde' | 'recomendados' | 'tipo' | 'preco' | 'quartos' | 'area' | 'etapa' | 'comodidades';
export const TODAS: Secao[] = ['onde', 'recomendados', 'tipo', 'preco', 'quartos', 'area', 'etapa', 'comodidades'];
type Resultado = (BuscaSiteResult & { precos?: number[]; comodidades?: Record<string, number> }) | null;

/** Conta imóveis do rascunho em tempo real (debounce 200 ms). */
export function useContagem(draft: Record<string, any>, ativo: boolean) {
  const [result, setResult] = useState<Resultado>(null), [loading, setLoading] = useState(false);
  useEffect(() => { if (!ativo) return; let vivo = true; setLoading(true); const t = setTimeout(() => buscarSite({ ...draft, limit: 0 }).then((r) => { if (vivo) setResult(r as any); }).finally(() => { if (vivo) setLoading(false); }), 200); return () => { vivo = false; clearTimeout(t); }; }, [ativo, JSON.stringify(draft)]);
  return { result, loading };
}
export const textoMostrar = (loading: boolean, result: Resultado) => loading || !result ? 'Contando…' : result.count === 0 ? 'Nenhum imóvel' : `Mostrar ${result.count > 1000 ? '1.000+' : result.count.toLocaleString('pt-BR')} imóveis`;

/** Converte texto digitado ("500 mil", "1,2 mi", "450000") em reais. */
export function lerPreco(t: string): number {
  const s = t.toLowerCase().replace(/r\$|\s/g, ''); const n = parseFloat(s.replace(/\./g, '').replace(',', '.'));
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(/mil|k/.test(s) ? n * 1000 : /mi/.test(s) ? n * 1_000_000 : n);
}
function CampoPreco({ rotulo, valor, vazio, onCommit }: { rotulo: string; valor: number; vazio: string; onCommit: (v: number) => void }) {
  const [t, setT] = useState(''), [editando, setEditando] = useState(false);
  return <label><span>{rotulo}</span><input aria-label={`Preço ${rotulo.toLowerCase()}`} inputMode="numeric" value={editando ? t : valor ? reais(valor) : vazio} onFocus={() => { setEditando(true); setT(valor ? String(valor) : ''); }} onChange={(e) => setT(e.target.value)} onBlur={() => { setEditando(false); onCommit(lerPreco(t)); }} onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} /></label>;
}

export function FiltroSecoes({ draft, setDraft, result: externo, secoes = TODAS, autoFocoOnde }: { draft: Record<string, any>; setDraft: React.Dispatch<React.SetStateAction<Record<string, any>>>; result?: Resultado; secoes?: Secao[]; autoFocoOnde?: boolean }) {
  const proprio = useContagem(draft, externo === undefined).result, result = externo === undefined ? proprio : externo;
  const [mais, setMais] = useState(false), [onde, setOnde] = useState(draft.bairro || draft.q || ''), [lista, setLista] = useState<string[]>([]);
  useEffect(() => { if (secoes.includes('onde')) void bairros().then(setLista); }, []);
  const change = (k: string, v: unknown) => setDraft((d) => ({ ...d, [k]: v }));
  const com = listaComodidades(draft.comodidades), contagem = result?.comodidades ?? {};
  const sugestoes = useMemo(() => { const t = onde.trim().toLowerCase(); if (t.length < 2) return []; return [...CIDADES.filter((c) => c.toLowerCase().includes(t)).map((c) => ({ t: 'cidade', v: c })), ...lista.filter((b) => b.toLowerCase().includes(t)).slice(0, 6).map((b) => ({ t: 'bairro', v: b })), { t: 'rua', v: onde.trim() }].slice(0, 8); }, [onde, lista]);
  const precos = result?.precos ?? [], maior = Math.max(1, ...precos);
  const faixa: [number, number] = [draft.precoMin || 0, draft.precoMax || PRECO_MAX];
  const grupos = mais ? COMODIDADES : [{ grupo: '', itens: COMODIDADES.flatMap((g) => g.itens).slice(0, 6) }];
  const tem = (s: Secao) => secoes.includes(s);
  return <>
    {tem('onde') && <section className="filtro-secao" data-secao="onde"><h3>Onde</h3><div className="filtro-onde"><Search aria-hidden="true" /><input autoFocus={autoFocoOnde} aria-label="Onde" placeholder="Bairro, cidade, rua ou código" value={onde} onChange={(e) => { setOnde(e.target.value); setDraft((d) => ({ ...d, q: e.target.value, bairro: '' })); }} />{onde && <button type="button" aria-label="Limpar local" onClick={() => { setOnde(''); setDraft((d) => ({ ...d, q: '', bairro: '' })); }}><X /></button>}</div>
      {sugestoes.length > 0 && <ul className="filtro-sugestoes" role="listbox" aria-label="Sugestões">{sugestoes.map((s) => <li key={s.t + s.v}><button type="button" onClick={() => { setOnde(s.v); setDraft((d) => s.t === 'cidade' ? { ...d, cidade: s.v, q: '', bairro: '' } : s.t === 'bairro' ? { ...d, bairro: s.v, q: '' } : { ...d, q: s.v, bairro: '' }); }}><span>{s.t === 'rua' ? `Buscar “${s.v}”` : s.v}</span><small>{s.t === 'cidade' ? 'Cidade' : s.t === 'bairro' ? 'Bairro' : 'Rua, endereço ou código'}</small></button></li>)}</ul>}
      <div className="filtro-chips">{['', 'Porto Alegre', 'Canoas', 'Capão da Canoa', 'Gramado'].map((c) => <button type="button" key={c} aria-pressed={(draft.cidade || '') === c} onClick={() => change('cidade', c)}>{c || 'Todas as cidades'}</button>)}</div></section>}
    {tem('recomendados') && <section className="filtro-secao" data-secao="recomendados"><h3>Recomendados para você</h3><div className="filtro-recomendados">{RECOMENDADOS.map((r) => (contagem[r.id] ?? 1) > 0 && <button type="button" key={r.id} aria-pressed={com.includes(r.id)} onClick={() => change('comodidades', alternarComodidade(draft.comodidades, r.id))}><img src={r.icone} alt="" width={56} height={56} loading="lazy" /><span>{r.nome}</span>{result && <small>{(contagem[r.id] ?? 0).toLocaleString('pt-BR')}</small>}</button>)}</div></section>}
    {tem('tipo') && <section className="filtro-secao" data-secao="tipo"><h3>Tipo de imóvel</h3><div className="filtro-tipos">{TIPOS_PAINEL.map((t) => { const n = t.id.split(',').reduce((s, k) => s + (result?.tipos[k] ?? 0), 0); if (result && n === 0 && draft.tipo !== t.id) return null; return <button type="button" key={t.id} aria-pressed={draft.tipo === t.id} onClick={() => change('tipo', draft.tipo === t.id ? '' : t.id)}><img src={t.icone} alt="" width={40} height={40} loading="lazy" /><span>{t.nome}</span>{result && <small>{n.toLocaleString('pt-BR')}</small>}</button>; })}</div></section>}
    {tem('preco') && <section className="filtro-secao" data-secao="preco"><h3>Faixa de preço</h3><p className="filtro-ajuda">Valor do imóvel à venda. Arraste as pontas ou digite.</p>
      <div className="filtro-histograma" aria-hidden="true">{(() => { const N = 40; const alt = Array.from({ length: N }, (_, i) => { const p0 = posParaPreco((i * POS_MAX) / N), p1 = posParaPreco(((i + 1) * POS_MAX) / N) || 3_000_000; let t = 0; for (let k = 0; k < 30; k++) { const a = k * 100_000, b = a + 100_000; const o = Math.max(0, Math.min(b, p1) - Math.max(a, p0)); t += ((precos[k] ?? 0) * o) / 100_000; } return t; }); const m = Math.max(1, ...alt); const pMin = precoParaPos(faixa[0]), pMax = draft.precoMax ? precoParaPos(draft.precoMax) : POS_MAX; return alt.map((v, i) => { const c = ((i + 0.5) * POS_MAX) / N; return <span key={i} data-dentro={(c >= pMin && c <= pMax) || undefined} style={{ height: `${Math.max(4, (v / m) * 100)}%` }} />; }); })()}</div>
      <SliderPrimitive.Root className="filtro-slider" min={0} max={POS_MAX} step={1} minStepsBetweenThumbs={1} value={[precoParaPos(faixa[0]), draft.precoMax ? precoParaPos(draft.precoMax) : POS_MAX]} onValueChange={([a, b]) => setDraft((d) => ({ ...d, precoMin: posParaPreco(a), precoMax: b >= POS_MAX ? 0 : posParaPreco(b) }))}><SliderPrimitive.Track className="filtro-slider-trilho"><SliderPrimitive.Range className="filtro-slider-faixa" /></SliderPrimitive.Track><SliderPrimitive.Thumb aria-label="Preço mínimo" aria-valuetext={reais(faixa[0]) } className="filtro-slider-ponta" /><SliderPrimitive.Thumb aria-label="Preço máximo" aria-valuetext={draft.precoMax ? reais(draft.precoMax) : 'Sem limite'} className="filtro-slider-ponta" /></SliderPrimitive.Root>
      <div className="filtro-precos"><CampoPreco rotulo="Mínimo" valor={draft.precoMin || 0} vazio="R$ 0" onCommit={(v) => setDraft((d) => ({ ...d, precoMin: v && d.precoMax && v >= d.precoMax ? 0 : v }))} /><span aria-hidden="true">–</span><CampoPreco rotulo="Máximo" valor={draft.precoMax || 0} vazio="R$ 3 mi+" onCommit={(v) => setDraft((d) => ({ ...d, precoMax: v && d.precoMin && v <= d.precoMin ? 0 : v }))} /></div></section>}
    {tem('quartos') && <section className="filtro-secao" data-secao="quartos"><h3>Quartos, banheiros e vagas</h3><Contador rotulo="Quartos" valor={draft.quartos} onChange={(v) => change('quartos', v)} /><Contador rotulo="Banheiros" valor={draft.banheiros} onChange={(v) => change('banheiros', v)} /><Contador rotulo="Vagas" valor={draft.vagas} onChange={(v) => change('vagas', v)} /></section>}
    {tem('area') && <section className="filtro-secao" data-secao="area"><h3>Área privativa</h3><div className="filtro-precos"><label><span>Mínimo (m²)</span><input aria-label="Área mínima" type="number" min={0} inputMode="numeric" placeholder="Qualquer" value={draft.areaUtilMin || ''} onChange={(e) => change('areaUtilMin', Number(e.target.value))} /></label><span aria-hidden="true">–</span><label><span>Máximo (m²)</span><input aria-label="Área máxima" type="number" min={0} inputMode="numeric" placeholder="Qualquer" value={draft.areaUtilMax || ''} onChange={(e) => change('areaUtilMax', Number(e.target.value))} /></label></div></section>}
    {tem('etapa') && <section className="filtro-secao" data-secao="etapa"><h3>Etapa</h3><div className="filtro-segmentado">{[['', 'Qualquer'], ['novo,usado', 'Pronto pra morar'], ['em_construcao', 'Em obras'], ['na_planta', 'Na planta']].map(([k, l]) => <button type="button" key={k} aria-pressed={(draft.fase || '') === k} onClick={() => change('fase', k)}>{l}</button>)}</div></section>}
    {tem('comodidades') && <section className="filtro-secao" data-secao="comodidades"><h3>Comodidades</h3>{grupos.map((g) => <div key={g.grupo} className="filtro-grupo">{g.grupo && <h4>{g.grupo}</h4>}<div className="filtro-chips filtro-comodidades">{g.itens.map(([id, nome, Icone]) => (result && !(contagem[id] > 0) && !com.includes(id)) ? null : <button type="button" key={id} aria-pressed={com.includes(id)} onClick={() => change('comodidades', alternarComodidade(draft.comodidades, id))}><Icone aria-hidden="true" />{nome}</button>)}</div></div>)}
      <button type="button" className="filtro-mais" aria-expanded={mais} onClick={() => setMais((v) => !v)}>{mais ? 'Mostrar menos' : 'Mostrar mais'}<ChevronDown aria-hidden="true" /></button></section>}
  </>;
}

export function SearchFilterDialog({ open, onClose, filtros, onApply, opener }: { open: boolean; onClose: () => void; filtros: Record<string, any>; onApply: (f: Record<string, any>) => void; opener?: React.RefObject<HTMLElement> }) {
  const [draft, setDraft] = useState(filtros), [versao, setVersao] = useState(0);
  useEffect(() => { if (open) { setDraft(filtros); setVersao((v) => v + 1); } }, [open]);
  const { result, loading } = useContagem(draft, open);
  return <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}><DialogContent onCloseAutoFocus={(e) => { if (opener?.current) { e.preventDefault(); opener.current.focus(); } }} className="search-filter-dialog filtro-painel">
    <DialogTitle className="filtro-titulo">Filtros</DialogTitle><DialogDescription className="sr-only">Escolha onde, valor, quartos, tipo e detalhes do imóvel.</DialogDescription>
    <div className="filtro-corpo"><FiltroSecoes key={versao} draft={draft} setDraft={setDraft} result={result} /></div>
    <div className="filtro-rodape"><button type="button" className="filtro-limpar" onClick={() => { setDraft({ secao: draft.secao || 'imoveis', cidade: '', ordem: 'recentes' }); setVersao((v) => v + 1); }}>Limpar tudo</button><Button className="filtro-mostrar" disabled={loading || !result || result.count === 0} onClick={() => { onApply(draft); onClose(); }}>{textoMostrar(loading, result)}</Button></div>
  </DialogContent></Dialog>;
}
