import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import { filtrosUteis } from '@/lib/buscasRecentes';
import { toast } from 'sonner';

/** "Salvar esta busca": vira um lead normal com os filtros; os avisos são enviados pelo CRM. */
export function SalvarBuscaDialog({ filtros, rotulo, aberto, setAberto }: { filtros: Record<string, unknown>; rotulo: string; aberto: boolean; setAberto: (v: boolean) => void }) {
  const [nome, setNome] = useState(''), [tel, setTel] = useState(''), [aceite, setAceite] = useState(false), [enviando, setEnviando] = useState(false), [feito, setFeito] = useState(false);
  const digitos = tel.replace(/\D/g, '');
  const valido = nome.trim().length >= 2 && digitos.length >= 10 && aceite;
  const enviar = async () => {
    if (!valido) return; setEnviando(true);
    try {
      const { submitLead } = await import('@/services/leads');
      await submitLead({ nome: nome.trim(), telefone: digitos, tipo_interesse: 'busca_salva', origem_componente: 'salvar_busca', formulario: 'Salvar busca', origem_pagina: location.pathname + location.search, contexto: { busca_salva: { filtros: filtrosUteis(filtros), descricao: rotulo, url: location.pathname + location.search, aceite_avisos_whatsapp: true } } });
      setFeito(true);
    } catch { toast.error('Não foi possível salvar agora. Tente de novo.'); } finally { setEnviando(false); }
  };
  return <>
    <Dialog open={aberto} onOpenChange={(v) => { setAberto(v); if (!v) setFeito(false); }}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{feito ? 'Busca salva' : 'Salvar esta busca'}</DialogTitle>
          <DialogDescription>{feito ? 'Avisaremos no seu WhatsApp quando entrar imóvel novo ou o preço baixar.' : `Receba no WhatsApp os imóveis novos de: ${rotulo || 'todos os imóveis'}.`}</DialogDescription></DialogHeader>
        {!feito && <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); void enviar(); }}>
          <Input aria-label="Seu nome" placeholder="Seu nome" autoComplete="name" value={nome} onChange={(e) => setNome(e.target.value)} />
          <Input aria-label="WhatsApp" placeholder="WhatsApp com DDD" inputMode="tel" autoComplete="tel" value={tel} onChange={(e) => setTel(e.target.value)} />
          <label className="flex min-h-11 items-start gap-3 text-sm"><input type="checkbox" className="mt-1 h-4 w-4 accent-primary" checked={aceite} onChange={(e) => setAceite(e.target.checked)} /><span>Quero receber avisos desta busca no WhatsApp. Posso sair quando quiser.</span></label>
          <Button type="submit" disabled={!valido || enviando}>{enviando && <Loader2 className="animate-spin" />}Salvar busca</Button>
        </form>}
        {feito && <Button onClick={() => setAberto(false)}>Continuar buscando</Button>}
      </DialogContent>
    </Dialog>
  </>;
}
