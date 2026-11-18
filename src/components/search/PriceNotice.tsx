import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatPhone, rawPhone } from '@/lib/phoneMask';
import { pedidoAviso, lerFavoritos } from '@/lib/favoritosLocais';
import { submitLead } from '@/services/leads';
export function PriceNotice({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [nome, setNome] = useState(''), [telefone, setTelefone] = useState(''), [erro, setErro] = useState(''), [enviando, setEnviando] = useState(false), [ok, setOk] = useState(false);
  const [id] = useState(() => crypto.randomUUID());
  return <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}><DialogContent className="price-notice max-w-md"><DialogTitle>Saiba quando o preço baixar</DialogTitle><DialogDescription>Receba no WhatsApp avisos dos seus imóveis favoritos.</DialogDescription>{ok ? <><p>Pedido recebido, {nome.split(' ')[0]}. Vamos acompanhar seus favoritos.</p><Button onClick={onClose}>Ver minha lista</Button></> : <form className="flex flex-col gap-4" onSubmit={async e => {
    e.preventDefault(); const faltam = 11 - rawPhone(telefone).length;
    if (faltam > 0) { setErro(`Confira o número: faltam ${faltam} dígitos.`); return; }
    setEnviando(true); setErro('');
    try { await submitLead({ nome, telefone, tipo_interesse: 'favorito', origem_componente: 'favorito', formulario: 'aviso_preco', contexto: { pedido: pedidoAviso(id, lerFavoritos(), location.pathname, new Date().toISOString()) } }); localStorage.setItem('uh-aviso-preco-pedido', '1'); setOk(true); } catch { setErro('Não foi possível salvar. Tente novamente.'); } finally { setEnviando(false); }
  }}><label className="grid gap-2 text-sm font-semibold">Nome<input required minLength={2} className="min-h-11 rounded-md border border-input bg-background px-3 font-normal" value={nome} onChange={e => setNome(e.target.value)} autoComplete="name" /></label><label className="grid gap-2 text-sm font-semibold">WhatsApp<input required type="tel" className="min-h-11 rounded-md border border-input bg-background px-3 font-normal" value={telefone} onChange={e => setTelefone(formatPhone(e.target.value))} autoComplete="tel" /></label>{erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}<Button disabled={enviando} type="submit">{enviando ? 'Salvando…' : 'Quero receber avisos'}</Button><Button type="button" variant="ghost" onClick={onClose}>Agora não</Button><p className="text-xs text-muted-foreground">Seus dados ficam só com a Uhome.</p></form>}</DialogContent></Dialog>;
}