import { lazy, Suspense, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { captureGclid, registrarPagina } from "@/lib/liaContext";
import liaAvatar from "@/assets/lia-avatar.webp.asset.json";

const LiaChat = lazy(() => import("./LiaChat"));

/** O avatar permanece igual; a conversa e suas dependências só baixam ao abrir. */
export function LiaLauncher() {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);
  const [pedido, setPedido] = useState<{ mensagem?: string; avatar: boolean } | null>(null);
  useEffect(() => {
    captureGclid();
    const timer = setTimeout(() => setVisible(true), 2500);
    const abrir = (event: Event) => setPedido({ mensagem: (event as CustomEvent<{ mensagem?: string }>).detail?.mensagem, avatar: false });
    window.addEventListener("uhome:abrir-lia", abrir);
    return () => { clearTimeout(timer); window.removeEventListener("uhome:abrir-lia", abrir); };
  }, []);
  useEffect(() => registrarPagina(pathname), [pathname]);
  if (pedido) return <Suspense fallback={null}><LiaChat aberturaInicial={pedido} /></Suspense>;
  return visible ? <Button onClick={() => setPedido({ avatar: true })} aria-label="Fale com a LIA, atendente virtual da Uhome" className="uhs-lia-float"><img src={liaAvatar.url} alt="" width={52} height={52} className="h-[52px] w-[52px] rounded-full object-cover" /><span className="uhs-lia-label">Falar com a Lia</span></Button> : null;
}