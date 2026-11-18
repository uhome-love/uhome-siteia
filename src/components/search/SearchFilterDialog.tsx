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
const PRECO_MAX = 3_000_000, PASSO = 50_000;
const CIDADES = ['Porto Alegre', 'Canoas', 'Cachoeirinha', 'Gravataí', 'Guaíba', 'Capão da Canoa', 'Torres', 'Gramado', 'Canela'];
export const reais = (v: number) => v >= 1_000_000 ? `R$ ${(v / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} mi` : `R$ ${Math.round(v / 1000)} mil`;
export const listaComodidades = (s?: string) => (s ? String(s).split(',').filter(Boolean) : []);
export function alternarComodidade(atual: string | undefined, c: string) { const l = listaComodidades(atual); return (l.includes(c) ? l.filter((x) => x !== c) : [...l, c]).join(','); }

function Contador({ rotulo, valor, onChange }: { rotulo: string; valor: number; onChange: (v: number) => void }) {
  return <div className="filtro-contador" role="group" aria-label={rotulo}><span>{rotulo}</span><div>{[0, 1, 2, 3, 4].map((n) => <button type="button" key={n} aria-pressed={(valor || 0) === n} onClick={() => onChange(n)}>{n ? (n === 4 ? '4+' : n) : 'Qualquer'}</button>)}</div></div>;
}

let bairrosCache: Promise<string[]> | null = null;
const bairros = () => (bairrosCache ??= Promise.resolve(supabase.rpc('get_bairros_disponiveis')).then(({ data }) => ((data as any[]) ?? []).map((b) => String(b.bairro)).filter(Boolean)));

export function SearchFilterDialog({ open, onClose, filtros, onApply, opener }: { open: boolean; onClose: () => void; filtros: Record<string, any>; onApply: (f: Record<string, any>) => void; opener?: React.RefObject<HTMLElement> }) {
  const [draft, setDraft] = useState(filtros), [result, setResult] = useState<(BuscaSiteResult & { precos?: number[]; comodidades?: Record<string, number> }) | null>(null), [loading, setLoading] = useState(false);
  const [mais, setMais] = useState(false), [onde, setOnde] = useState(''), [lista, setLista] = useState<string[]>([]);
  useEffect(() => { if (open) { setDraft(filtros); setOnde(filtros.bairro || filtros.q || ''); void bairros().then(setLista); } }, [open]);
  useEffect(() => { if (!open) return; let ativo = true; setLoading(true); const t = setTimeout(() => buscarSite({ ...draft, limit: 0 }).then((r) => { if (ativo) setResult(r as any); }).finally(() => { if (ativo) setLoading(false); }), 200); return () => { ativo = false; clearTimeout(t); }; }, [open, JSON.stringify(draft)]);
  const change = (k: string, v: unknown) => setDraft((d) => ({ ...d, [k]: v }));
  const com = listaComodidades(draft.comodidades), contagem = result?.comodidades ?? {};
  const sugestoes = useMemo(() => { const t = onde.trim().toLowerCase(); if (t.length < 2) return []; return [...CIDADES.filter((c) => c.toLowerCase().includes(t)).map((c) => ({ t: 'cidade', v: c })), ...lista.filter((b) => b.toLowerCase().includes(t)).slice(0, 6).map((b) => ({ t: 'bairro', v: b }))].slice(0, 7); }, [onde, lista]);
  const precos = result?.precos ?? [], maior = Math.max(1, ...precos);
  const faixa: [number, number] = [draft.precoMin || 0, draft.precoMax || PRECO_MAX];
  const grupos = mais ? COMODIDADES : [{ grupo: '', itens: COMODIDADES.flatMap((g) => g.itens).slice(0, 6) }];
  return <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}><DialogContent onCloseAutoFocus={(e) => { if (opener?.current) { e.preventDefault(); opener.current.focus(); } }} className="search-filter-dialog filtro-painel">
    <DialogTitle className="filtro-titulo">Filtros</DialogTitle><DialogDescription className="sr-only">Escolha onde, valor, quartos, tipo e detalhes do imóvel.</DialogDescription>
    <div className="filtro-corpo">
      <section className="filtro-secao"><h3>Onde</h3><div className="filtro-onde"><Search aria-hidden="true" /><input aria-label="Onde" placeholder="Bairro, cidade, endereço ou código" value={onde} onChange={(e) => { setOnde(e.target.value); setDraft((d) => ({ ...d, q: e.target.value, bairro: '' })); }} />{onde && <button type="button" aria-label="Limpar local" onClick={() => { setOnde(''); setDraft((d) => ({ ...d, q: '', bairro: '' })); }}><X /></button>}</div>
        {sugestoes.length > 0 && <ul className="filtro-sugestoes" role="listbox">{sugestoes.map((s) => <li key={s.t + s.v}><button type="button" onClick={() => { setOnde(s.v); setDraft((d) => s.t === 'cidade' ? { ...d, cidade: s.v, q: '', bairro: '' } : { ...d, bairro: s.v, q: '' }); }}><span>{s.v}</span><small>{s.t === 'cidade' ? 'Cidade' : 'Bairro'}</small></button></li>)}</ul>}
        <div className="filtro-chips">{['', 'Porto Alegre', 'Canoas', 'Capão da Canoa', 'Gramado'].map((c) => <button type="button" key={c} aria-pressed={(draft.cidade || '') === c} onClick={() => change('cidade', c)}>{c || 'Todas as cidades'}</button>)}</div></section>
      <section className="filtro-secao"><h3>Recomendados para você</h3><div className="filtro-recomendados">{RECOMENDADOS.map((r) => (contagem[r.id] ?? 1) > 0 && <button type="button" key={r.id} aria-pressed={com.includes(r.id)} onClick={() => change('comodidades', alternarComodidade(draft.comodidades, r.id))}><img src={r.icone} alt="" width={56} height={56} loading="lazy" /><span>{r.nome}</span></button>)}</div></section>
      <section className="filtro-secao"><h3>Tipo de imóvel</h3><div className="filtro-tipos">{TIPOS_PAINEL.map((t) => { const n = t.id.split(',').reduce((s, k) => s + (result?.tipos[k] ?? 0), 0); if (result && n === 0) return null; return <button type="button" key={t.id} aria-pressed={draft.tipo === t.id} onClick={() => change('tipo', draft.tipo === t.id ? '' : t.id)}><img src={t.icone} alt="" width={40} height={40} loading="lazy" /><span>{t.nome}</span>{result && <small>{n.toLocaleString('pt-BR')}</small>}</button>; })}</div></section>
      <section className="filtro-secao"><h3>Faixa de preço</h3><p className="filtro-ajuda">Valor do imóvel à venda</p>
        <div className="filtro-histograma" aria-hidden="true">{Array.from({ length: 30 }, (_, i) => { const v = i * 100_000; const dentro = v + 100_000 > faixa[0] && v < faixa[1]; return <span key={i} data-dentro={dentro || undefined} style={{ height: `${Math.max(4, ((precos[i] ?? 0) / maior) * 100)}%` }} />; })}</div>
        <SliderPrimitive.Root className="filtro-slider" min={0} max={PRECO_MAX} step={PASSO} minStepsBetweenThumbs={1} value={faixa} onValueChange={([a, b]) => setDraft((d) => ({ ...d, precoMin: a, precoMax: b >= PRECO_MAX ? 0 : b }))}><SliderPrimitive.Track className="filtro-slider-trilho"><SliderPrimitive.Range className="filtro-slider-faixa" /></SliderPrimitive.Track><SliderPrimitive.Thumb aria-label="Preço mínimo" className="filtro-slider-ponta" /><SliderPrimitive.Thumb aria-label="Preço máximo" className="filtro-slider-ponta" /></SliderPrimitive.Root>
        <div className="filtro-precos"><label><span>Mínimo</span><input inputMode="numeric" value={faixa[0] ? reais(faixa[0]) : 'R$ 0'} readOnly /></label><span aria-hidden="true">–</span><label><span>Máximo</span><input inputMode="numeric" value={draft.precoMax ? reais(draft.precoMax) : 'Sem limite'} readOnly /></label></div></section>
      <section className="filtro-secao"><h3>Quartos, banheiros e vagas</h3><Contador rotulo="Quartos" valor={draft.quartos} onChange={(v) => change('quartos', v)} /><Contador rotulo="Banheiros" valor={draft.banheiros} onChange={(v) => change('banheiros', v)} /><Contador rotulo="Vagas" valor={draft.vagas} onChange={(v) => change('vagas', v)} /></section>
      <section className="filtro-secao"><h3>Área privativa</h3><div className="filtro-precos"><label><span>Mínimo (m²)</span><input aria-label="Área mínima" type="number" min={0} inputMode="numeric" placeholder="Qualquer" value={draft.areaUtilMin || ''} onChange={(e) => change('areaUtilMin', Number(e.target.value))} /></label><span aria-hidden="true">–</span><label><span>Máximo (m²)</span><input aria-label="Área máxima" type="number" min={0} inputMode="numeric" placeholder="Qualquer" value={draft.areaUtilMax || ''} onChange={(e) => change('areaUtilMax', Number(e.target.value))} /></label></div></section>
      <section className="filtro-secao"><h3>Etapa</h3><div className="filtro-segmentado">{[['', 'Qualquer'], ['novo,usado', 'Pronto pra morar'], ['em_construcao', 'Em obras'], ['na_planta', 'Na planta']].map(([k, l]) => <button type="button" key={k} aria-pressed={(draft.fase || '') === k} onClick={() => change('fase', k)}>{l}</button>)}</div></section>
      <section className="filtro-secao"><h3>Comodidades</h3>{grupos.map((g) => <div key={g.grupo} className="filtro-grupo">{g.grupo && <h4>{g.grupo}</h4>}<div className="filtro-chips filtro-comodidades">{g.itens.map(([id, nome, Icone]) => (result && !(contagem[id] > 0) && !com.includes(id)) ? null : <button type="button" key={id} aria-pressed={com.includes(id)} onClick={() => change('comodidades', alternarComodidade(draft.comodidades, id))}><Icone aria-hidden="true" />{nome}</button>)}</div></div>)}
        <button type="button" className="filtro-mais" aria-expanded={mais} onClick={() => setMais((v) => !v)}>{mais ? 'Mostrar menos' : 'Mostrar mais'}<ChevronDown aria-hidden="true" /></button></section>
    </div>
    <div className="filtro-rodape"><button type="button" className="filtro-limpar" onClick={() => { setOnde(''); setDraft({ secao: draft.secao || 'imoveis', cidade: '', ordem: 'recentes' }); }}>Limpar tudo</button><Button className="filtro-mostrar" disabled={loading || !result || result.count === 0} onClick={() => { onApply(draft); onClose(); }}>{loading || !result ? 'Contando…' : result.count === 0 ? 'Nenhum imóvel' : `Mostrar ${result.count > 1000 ? '1.000+' : result.count.toLocaleString('pt-BR')} imóveis`}</Button></div>
  </DialogContent></Dialog>;
}
