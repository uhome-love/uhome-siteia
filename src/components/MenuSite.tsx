import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCorretor } from "@/contexts/CorretorContext";

// Menu lateral do topo: carregado só quando aberto pela 1ª vez, para não pesar a primeira tela.
export function MenuSite({ open, onOpenChange, tabs, campanha, black, abrirLia }: { open: boolean; onOpenChange: (v: boolean) => void; tabs: { label: string; to: string; icon: LucideIcon }[]; campanha: { slug: string; nome: string } | null | undefined; black: boolean; abrirLia: () => void }) {
  const { prefixLink } = useCorretor();
  return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent className="overflow-y-auto"><SheetHeader><SheetTitle>Uhome</SheetTitle></SheetHeader><div className="mt-6 flex flex-col gap-2">{tabs.map(t => <Button asChild variant="ghost" className="justify-start" key={t.label}><Link to={prefixLink(t.to)}><t.icon />{t.label}</Link></Button>)}<Button asChild variant="outline"><Link to={prefixLink(campanha ? '/campanha/' + campanha.slug : '/em-foco')}>{campanha ? black ? 'Black Natal' : campanha.nome : 'Uhome em Foco'}</Link></Button>{[['/anunciar','Anunciar imóvel'],['/avaliar-imovel','Quanto vale meu imóvel?'],['/bairros','Bairros'],['/condominios','Condomínios'],['/sobre','Sobre a Uhome'],['/faq','Ajuda']].map(([to,l]) => <Button asChild variant="ghost" className="justify-start" key={to}><Link to={prefixLink(to)}>{l}</Link></Button>)}<Button variant="outline" onClick={() => { onOpenChange(false); abrirLia(); }}>Falar com a Lia</Button></div></SheetContent></Sheet>;
}
