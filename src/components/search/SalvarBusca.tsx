import { lazy, Suspense, useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Dialogo = lazy(() => import('./SalvarBuscaDialog').then((m) => ({ default: m.SalvarBuscaDialog })));

/** "Salvar esta busca": o botão vem na 1ª tela; o formulário só carrega quando aberto. */
export function SalvarBusca({ filtros, rotulo }: { filtros: Record<string, unknown>; rotulo: string }) {
  const [aberto, setAberto] = useState(false), [usado, setUsado] = useState(false);
  useEffect(() => { if (aberto) setUsado(true); }, [aberto]);
  return <>
    <Button variant="outline" className="search-salvar" onClick={() => setAberto(true)}><Bell />Salvar busca</Button>
    {usado && <Suspense fallback={null}><Dialogo filtros={filtros} rotulo={rotulo} aberto={aberto} setAberto={setAberto} /></Suspense>}
  </>;
}
