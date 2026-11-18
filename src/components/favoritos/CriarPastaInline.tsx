import { useState } from 'react';
import { FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SUGESTOES = ['Para visitar', 'Favoritos da família', 'Investimento', 'Praia'];

/** Campo de criar pasta no próprio painel (substitui a caixinha do navegador). */
export function CriarPastaInline({ onCriar, abertoInicial = false }: { onCriar: (nome: string) => void; abertoInicial?: boolean }) {
  const [aberto, setAberto] = useState(abertoInicial), [nome, setNome] = useState('');
  const criar = (n = nome) => { const t = n.trim(); if (!t) return; onCriar(t); setNome(''); setAberto(false); };
  if (!aberto) return <button type="button" className="pasta-criar-botao" onClick={() => setAberto(true)}><span><FolderPlus aria-hidden="true" /></span>Criar nova pasta</button>;
  return <form className="pasta-criar" onSubmit={(e) => { e.preventDefault(); criar(); }}>
    <label className="sr-only" htmlFor="nome-pasta">Nome da pasta</label>
    <input id="nome-pasta" autoFocus maxLength={40} placeholder="Nome da pasta" value={nome} onChange={(e) => setNome(e.target.value)} />
    <div className="pasta-sugestoes">{SUGESTOES.map((s) => <button type="button" key={s} onClick={() => criar(s)}>{s}</button>)}</div>
    <div className="pasta-criar-acoes"><Button type="button" variant="ghost" onClick={() => { setAberto(false); setNome(''); }}>Cancelar</Button><Button type="submit" disabled={!nome.trim()}>Criar</Button></div>
  </form>;
}
