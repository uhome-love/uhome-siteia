import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FiltroSecoes, useContagem, TIPOS_PAINEL, reais } from './SearchFilterDialog';

type Etapa = 'onde' | 'tipo' | 'valor';
const ETAPAS: { id: Etapa; titulo: string; rotulo: string; secoes: any[] }[] = [
  { id: 'onde', titulo: 'Onde?', rotulo: 'Onde', secoes: ['onde'] },
  { id: 'tipo', titulo: 'Qual tipo?', rotulo: 'Tipo', secoes: ['tipo'] },
  { id: 'valor', titulo: 'Quanto quer investir?', rotulo: 'Valor', secoes: ['preco'] },
];
/** Resumo exibido no cartão recolhido de cada etapa. */
export function resumoEtapa(e: Etapa, f: Record<string, any>): string {
  if (e === 'onde') return f.bairro || f.q || f.cidade || 'Qualquer lugar';
  if (e === 'tipo') { const sel = TIPOS_PAINEL.filter((t) => t.id.split(',').every((k) => String(f.tipo ?? '').split(',').includes(k))); return sel.length ? sel.map((t) => t.nome).join(', ') : 'Qualquer tipo'; }
  return f.precoMin && f.precoMax ? `${reais(f.precoMin)} – ${reais(f.precoMax)}` : f.precoMax ? `até ${reais(f.precoMax)}` : f.precoMin ? `a partir de ${reais(f.precoMin)}` : 'Qualquer valor';
}

/** Busca em etapas no celular (padrão Airbnb): um cartão aberto por vez, os outros mostram o resumo. */
export function BuscaEtapas({ open, onClose, filtros, onApply }: { open: boolean; onClose: () => void; filtros: Record<string, any>; onApply: (f: Record<string, any>) => void }) {
  const [draft, setDraft] = useState(filtros), [etapa, setEtapa] = useState<Etapa>('onde');
  useEffect(() => { if (open) { setDraft(filtros); setEtapa('onde'); } }, [open]);
  const { result, loading } = useContagem(draft, open);
  const i = ETAPAS.findIndex((e) => e.id === etapa), ultima = i === ETAPAS.length - 1;
  const buscar = () => { onApply(draft); onClose(); };
  return <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
    <DialogContent className="busca-etapas [&>button:last-child]:hidden">
      <DialogTitle className="sr-only">Buscar imóveis</DialogTitle>
      <div className="busca-etapas-topo"><button type="button" aria-label="Fechar" className="busca-etapas-fechar" onClick={onClose}><X /></button></div>
      <div className="busca-etapas-corpo">
        {ETAPAS.map((e) => e.id === etapa
          ? <section key={e.id} className="busca-etapa busca-etapa--aberta" data-etapa={e.id}><h2>{e.titulo}</h2><FiltroSecoes draft={draft} setDraft={setDraft} result={result} secoes={e.secoes} autoFocoOnde={e.id === 'onde'} /></section>
          : <button key={e.id} type="button" className="busca-etapa busca-etapa--fechada" data-etapa={e.id} onClick={() => setEtapa(e.id)}><span>{e.rotulo}</span><strong>{resumoEtapa(e.id, draft)}</strong></button>)}
      </div>
      <div className="filtro-rodape"><button type="button" className="filtro-limpar" onClick={() => { setDraft({ secao: draft.secao || 'imoveis', cidade: '', ordem: 'recentes' }); setEtapa('onde'); }}>Limpar tudo</button>
        {ultima ? <Button className="filtro-mostrar" disabled={loading || !result || result.count === 0} onClick={buscar}><Search />Buscar</Button>
          : <Button className="filtro-mostrar" onClick={() => setEtapa(ETAPAS[i + 1].id)}>Próximo</Button>}</div>
    </DialogContent>
  </Dialog>;
}
