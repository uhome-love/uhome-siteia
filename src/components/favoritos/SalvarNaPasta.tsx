import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Folder } from 'lucide-react';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { lerPastas, salvarPastas, criarPasta, alternarNaPasta, type EstadoPastas } from '@/lib/favoritosPastas';
import { fotosDoCard } from '@/components/search/FotosCard';
import { cardFotoUrl } from '@/lib/searchImages';
import { CriarPastaInline } from './CriarPastaInline';

export const EVENTO_SALVO = 'uhome:salvo-favorito';

/** Painel que aparece ao salvar um favorito: escolher ou criar pasta sem sair da página. */
export function SalvarNaPasta({ initialId }: { initialId?: string } = {}) {
  const [id, setId] = useState<string | null>(null), [estado, setEstado] = useState<EstadoPastas>(lerPastas);
  const [foto, setFoto] = useState<string>(''), [celular, setCelular] = useState(false);
  useEffect(() => {
    const on = (e: Event) => { const i = (e as CustomEvent<string>).detail; setEstado(lerPastas()); setFoto(''); setId(i); setCelular(window.matchMedia('(max-width: 767px)').matches); void fotosDoCard(i, false).then((f) => setFoto(f[0] ? cardFotoUrl(f[0]) : '')); };
    window.addEventListener(EVENTO_SALVO, on); return () => window.removeEventListener(EVENTO_SALVO, on);
  }, []);
  useEffect(() => {
    if (!initialId) return;
    setEstado(lerPastas()); setFoto(''); setId(initialId);
    setCelular(window.matchMedia('(max-width: 767px)').matches);
    void fotosDoCard(initialId, false).then(f => setFoto(f[0] ? cardFotoUrl(f[0]) : ''));
  }, [initialId]);
  const atualizar = (e: EstadoPastas) => { setEstado(e); salvarPastas(e); };
  const fechar = () => setId(null);
  const corpo = id && <div className="salvar-pasta">
    <div className="salvar-pasta-topo">{foto ? <img src={foto} alt="" width={56} height={56} /> : <span className="salvar-pasta-foto-vazia" />}<div><strong>Salvo em Favoritos</strong><small>Quer guardar numa pasta?</small></div></div>
    {estado.pastas.length > 0 && <ul className="salvar-pasta-lista">{estado.pastas.map((p) => { const dentro = p.itens.includes(id); return <li key={p.id}><button type="button" aria-pressed={dentro} onClick={() => atualizar(alternarNaPasta(estado, p.id, id))}><span className="salvar-pasta-icone"><Folder aria-hidden="true" /></span><span className="salvar-pasta-nome">{p.nome}<small>{p.itens.length} {p.itens.length === 1 ? 'imóvel' : 'imóveis'}</small></span><span className="salvar-pasta-check" data-on={dentro || undefined}><Check aria-hidden="true" /></span></button></li>; })}</ul>}
    <CriarPastaInline abertoInicial={estado.pastas.length === 0} onCriar={(n) => { const e = criarPasta(estado, n); atualizar(alternarNaPasta(e, e.pastas[e.pastas.length - 1].id, id)); }} />
    <div className="salvar-pasta-rodape"><Link to="/favoritos" onClick={fechar}>Ver favoritos</Link><button type="button" onClick={fechar}>Pronto</button></div>
  </div>;
  if (celular) return <Drawer open={!!id} onOpenChange={(o) => !o && fechar()}><DrawerContent className="salvar-pasta-gaveta px-4 pb-6"><DrawerTitle className="sr-only">Salvar em pasta</DrawerTitle>{corpo}</DrawerContent></Drawer>;
  return <Dialog open={!!id} onOpenChange={(o) => !o && fechar()}><DialogContent className="max-w-md"><DialogTitle className="sr-only">Salvar em pasta</DialogTitle>{corpo}</DialogContent></Dialog>;
}
