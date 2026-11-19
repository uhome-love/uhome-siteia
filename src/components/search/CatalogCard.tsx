import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCorretor } from '@/contexts/CorretorContext';
import { formatPreco, prefetchImovel, type Imovel } from '@/services/imoveis';
let paginaPronta=false; const prepararDetalhe=(slug:string,produto:boolean)=>{ if(!paginaPronta&&!produto){paginaPronta=true;void import('@/pages/PropertyDetail');} if(!produto) prefetchImovel(slug); };
import { FotoCatalogo } from './FotoCatalogo';
import { trackEvent } from '@/lib/trackEvent';
import { FotosCard } from './FotosCard';
import { selosDoCard } from '@/lib/novidade';
export function CatalogCard({ imovel: r, index, saved, onSave, highlighted, onHover, selo }: {imovel:Imovel;index:number;saved:boolean;onSave:()=>void;highlighted:boolean;onHover:(id:string|null)=>void;selo?:string}) {
  const {prefixLink}=useCorretor(); const product=(r as Imovel & {fonte?:string}).fonte==='produto';
  const href=prefixLink(`${product?'/em-foco/':'/imovel/'}${r.slug}`);
  const selos=selosDoCard((r as any).publicado_em,r.fase,selo);
  return <article className={`catalog-card ${highlighted?'catalog-card-active':''}`} onMouseEnter={()=>{onHover(r.id);prepararDetalhe(r.slug,product);}} onFocus={()=>prepararDetalhe(r.slug,product)} onMouseLeave={()=>onHover(null)}><div className="catalog-photo"><FotosCard id={r.id} produto={product} titulo={r.titulo}><Link to={href} aria-label={r.titulo} onClick={()=>void trackEvent({tipo:'imovel_visto',imovel_slug:r.slug,imovel_titulo:r.titulo})}><FotoCatalogo src={r.foto_principal ?? ''} titulo={r.titulo} primeira={index===0}/></Link></FotosCard>{selos.foto&&<span className="catalog-badge">{selos.foto}</span>}<Button variant="ghost" size="icon" className="catalog-save" aria-label={saved?'Remover dos favoritos':'Adicionar aos favoritos'} aria-pressed={saved} onClick={onSave}><Heart className={saved?'fill-current':''}/></Button></div><Link to={href} className="catalog-info"><h2>{r.titulo}</h2><p>{[...(selos.linha?[selos.linha]:[]),...[r.area_util??r.area_total,r.quartos,r.vagas].map((v,i)=>v?`${i===0?Number(v).toLocaleString('pt-BR',{maximumFractionDigits:2}):v} ${i===0?'m²':i===1?`quarto${v>1?'s':''}`:`vaga${v>1?'s':''}`}`:null).filter(Boolean)].join(' · ')}</p><p>{r.bairro}, {r.cidade}</p><strong>{product?'A partir de ':''}{formatPreco(r.preco)}</strong></Link></article>;
}