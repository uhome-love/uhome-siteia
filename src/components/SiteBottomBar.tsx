import { Compass, Heart, MessageCircle, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCorretor } from "@/contexts/CorretorContext";
export function SiteBottomBar() {
  const { prefixLink } = useCorretor();
  return <nav aria-label="Navegação inferior" data-barra-baixo className="uhs-bottom-nav">
    <Button asChild variant="ghost"><Link to={prefixLink('/busca')}><Compass /><span>Explorar</span></Link></Button>
    <Button asChild variant="ghost"><Link to={prefixLink('/favoritos')}><Heart /><span>Favoritos</span></Link></Button>
    <Button variant="ghost" onClick={() => window.dispatchEvent(new CustomEvent('uhome:abrir-lia'))}><MessageCircle /><span>Lia</span></Button>
    <Button variant="ghost" onClick={() => window.dispatchEvent(new Event('uhome:entrar'))}><UserRound /><span>Entrar</span></Button>
  </nav>;
}