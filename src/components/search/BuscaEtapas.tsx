import { useEffect, useState } from 'react';
import { SUGESTOES_ETAPA } from '@/lib/sugestoesBusca';
import { trackEvent } from '@/lib/trackEvent';
import { Search, X, History } from 'lucide-react';
import { lerBuscas, limparBuscas, type BuscaRecente } from '@/lib/buscasRecentes';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FiltroSecoes, useContagem, TIPOS_PAINEL, reais } from './SearchFilterDialog';

type Etapa = 'onde' | 'tipo' | 'valor' | 'mais';
const ETAPAS: { id: Etapa; titulo: string; rotulo: string; secoes: any[] }[] = [
  { id: 'onde', titulo: 'Onde?', rotulo: 'Onde', secoes: ['onde'] },
  { id: 'tipo', titulo: 'Qual tipo?', rotulo: 'Tipo', secoes: ['tipo'] },
  { id: 'valor', titulo: 'Quanto quer investir?', rotulo: 'Valor', secoes: ['preco'] },
  { id: 'mais', titulo: 'Mais filtros', rotulo: 'Mais filtros', secoes: ['quartos', 'recomendados', 'comodidades', 'area', 'etapa'] },
];
/** Resumo exibido no cartão recolhido de cada etapa. */
export function resumoEtapa(e: Etapa, f: Record<string, any>): string {
  if (e === 'onde') return f.bairro || f.q || f.cidade || 'Qualquer lugar';
  if (e === 'tipo') { const sel = TIPOS_PAINEL.filter((t) => t.id.split(',').every((k) => String(f.tipo ?? '').split(',').includes(k))); return sel.length ? sel.map((t) => t.nome).join(', ') : 'Qualquer tipo'; }
  if (e === 'mais') {
    const p: string[] = [];
    if (Number(f.quartos) > 0) p.push(`${f.quartos}+ quarto${Number(f.quartos) > 1 ? 's' : ''}`);
    if (Number(f.banheiros) > 0) p.push(`${f.banheiros}+ banheiro${Number(f.banheiros) > 1 ? 's' : ''}`);
    if (Number(f.vagas) > 0) p.push(`${f.vagas}+ vaga${Number(f.vagas) > 1 ? 's' : ''}`);
    p.push(...String(f.comodidades ?? '').split(',').filter(Boolean));
    if (Number(f.areaUtilMin) > 0 || Number(f.areaUtilMax) > 0) p.push('Área');
    if (f.fase) p.push(f.fase === 'na_planta' ? 'Na planta' : f.fase === 'em_construcao' ? 'Em obras' : 'Pronto pra morar');
    return p.length ? p.join(' · ') : 'Opcional';
  }
  return f.precoMin && f.precoMax ? `${reais(f.precoMin)} – ${reais(f.precoMax)}` : f.precoMax ? `até ${reais(f.precoMax)}` : f.precoMin ? `a partir de ${reais(f.precoMin)}` : 'Qualquer valor';
}

/** Busca em etapas no celular (padrão Airbnb): um cartão aberto por vez, os outros mostram o resumo. */
export function BuscaEtapas({ open, onClose, filtros, onApply }: { open: boolean; onClose: () => void; filtros: Record<string, any>; onApply: (f: Record<string, any>) => void }) {
  const [draft, setDraft] = useState(filtros), [etapa, setEtapa] = useState<Etapa>('onde');
  useEffect(() => { if (open) { setDraft(filtros); setEtapa('onde'); } }, [open]);
  const { result, loading } = useContagem(draft, open);
  const i = ETAPAS.findIndex((e) => e.id === etapa), ultima = etapa === 'valor' || etapa === 'mais';
  const buscar = () => { onApply(draft); onClose(); };
  const [recentes, setRecentes] = useState<BuscaRecente[]>([]);
  useEffect(() => { if (open) setRecentes(lerBuscas()); }, [open]);
  const repetir = (b: BuscaRecente) => { onApply({ secao: 'imoveis', cidade: '', ordem: 'recentes', ...b.filtros }); onClose(); };
  return <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
    <DialogContent className="busca-etapas [&>button:last-child]:hidden">
      <DialogTitle className="sr-only">Buscar imóveis</DialogTitle>
      <div className="busca-etapas-topo"><button type="button" aria-label="Fechar" className="busca-etapas-fechar" onClick={onClose}><X /></button></div>
      <div className="busca-etapas-corpo">
        {ETAPAS.map((e) => e.id === etapa
          ? <section key={e.id} className="busca-etapa busca-etapa--aberta" data-etapa={e.id}><h2>{e.titulo}</h2>{e.id === 'onde' && recentes.length > 0 && <div className="busca-recentes"><div className="busca-recentes-topo"><span>Buscas recentes</span><button type="button" onClick={() => { limparBuscas(); setRecentes([]); }}>Limpar</button></div>{recentes.map((b) => <button key={b.em} type="button" className="busca-recente" onClick={() => repetir(b)}><History />{b.rotulo}</button>)}</div>}{SUGESTOES_ETAPA[e.id] && <div className="busca-sugestoes" aria-label="Sugestões">{SUGESTOES_ETAPA[e.id].map((g) => { const ativa = Object.entries(g.filtros).every(([k, v]) => draft[k] === v); return <button key={g.nome} type="button" className="busca-sugestao" aria-pressed={ativa} onClick={() => { setDraft((d) => ({ ...d, ...g.filtros })); void trackEvent({ tipo: 'categoria_tocada', dados: { sugestao_busca: g.nome } }).catch(() => {}); }}>{g.nome}</button>; })}</div>}<FiltroSecoes draft={draft} setDraft={setDraft} result={result} secoes={e.secoes} autoFocoOnde={e.id === 'onde'} /></section>
          : <button key={e.id} type="button" className="busca-etapa busca-etapa--fechada" data-etapa={e.id} onClick={() => setEtapa(e.id)}><span>{e.rotulo}</span><strong>{resumoEtapa(e.id, draft)}</strong></button>)}
      </div>
      <div className="filtro-rodape"><button type="button" className="filtro-limpar" onClick={() => { setDraft({ secao: draft.secao || 'imoveis', cidade: '', ordem: 'recentes' }); setEtapa('onde'); }}>Limpar tudo</button>
        {ultima ? <span className="flex items-center gap-3">{etapa === 'valor' && <button type="button" className="filtro-limpar" onClick={() => setEtapa('mais')}>Mais filtros</button>}<Button className="filtro-mostrar" disabled={loading || !result || result.count === 0} onClick={buscar}><Search />Buscar</Button></span>
          : <Button className="filtro-mostrar" onClick={() => setEtapa(ETAPAS[i + 1].id)}>Próximo</Button>}</div>
    </DialogContent>
  </Dialog>;
}
