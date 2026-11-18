import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCorretor } from '@/contexts/CorretorContext';
import { urlBuscaHome, type BuscaHome } from '@/lib/homeVitrine';

const TIPOS = [['', 'Qualquer tipo'], ['apartamento', 'Apartamento'], ['casa', 'Casa'], ['casa_condominio', 'Casa em condomínio'], ['cobertura', 'Cobertura'], ['studio,loft', 'Studio'], ['garden', 'Garden'], ['terreno', 'Terreno']];
const QUARTOS = [['', 'Qualquer'], ['1', '1+'], ['2', '2+'], ['3', '3+'], ['4', '4+']];
const VALORES = [['', 'Qualquer valor'], ['400000', 'R$ 400 mil'], ['700000', 'R$ 700 mil'], ['1000000', 'R$ 1 milhão'], ['2000000', 'R$ 2 milhões']];

export function PilulaBusca({ inicial = {} }: { inicial?: BuscaHome }) {
  const navigate = useNavigate(); const { prefixLink } = useCorretor();
  const [onde, setOnde] = useState(inicial.onde ?? ''), [tipo, setTipo] = useState(inicial.tipo ?? ''), [quartos, setQuartos] = useState(inicial.quartos ?? ''), [valor, setValor] = useState(inicial.valor ?? '');
  return (
    <form role="search" className="home-pilula" onSubmit={(e) => { e.preventDefault(); navigate(prefixLink(urlBuscaHome({ onde, tipo, quartos, valor, cidade: inicial.cidade }))); }}>
      <label className="home-campo home-campo-onde"><span>Onde</span><input value={onde} onChange={(e) => setOnde(e.target.value)} placeholder="Bairro, cidade ou empreendimento" /></label>
      <label className="home-campo"><span>Tipo</span><select value={tipo} onChange={(e) => setTipo(e.target.value)}>{TIPOS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
      <label className="home-campo"><span>Quartos</span><select value={quartos} onChange={(e) => setQuartos(e.target.value)}>{QUARTOS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
      <label className="home-campo"><span>Valor até</span><select value={valor} onChange={(e) => setValor(e.target.value)}>{VALORES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
      <Button type="submit" className="home-buscar"><Search />Buscar</Button>
    </form>
  );
}

