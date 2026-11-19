import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { registrarContaComoLead } from "@/components/AuthModal";

const CHAVE = "uh_convite_whatsapp";

/** Uma vez, logo após criar conta com Google sem telefone: convida a deixar o WhatsApp (vira lead). */
export default function ConviteWhatsApp() {
  const { user } = useAuth();
  const [aberto, setAberto] = useState(false);
  const [fone, setFone] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!user || localStorage.getItem(CHAVE)) return;
    const nova = Date.now() - new Date(user.created_at).getTime() < 2 * 60_000;
    const temFone = !!(user.phone || user.user_metadata?.telefone);
    if (nova && !temFone) setAberto(true);
  }, [user]);

  if (!aberto || !user) return null;
  const fechar = () => { localStorage.setItem(CHAVE, "1"); setAberto(false); };
  const digitos = fone.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
  const valido = digitos.length >= 10 && digitos.length <= 11;

  return (
    <div role="dialog" aria-label="Deixe seu WhatsApp" className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-sm rounded-2xl border border-border bg-background p-4 shadow-lg">
      <button onClick={fechar} aria-label="Agora não" className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center text-muted-foreground"><X className="h-4 w-4" /></button>
      <p className="pr-8 font-body text-sm font-semibold text-foreground">Quer ajuda de um corretor?</p>
      <p className="mt-1 font-body text-xs text-muted-foreground">Deixe seu WhatsApp e falamos com você.</p>
      <form className="mt-3 flex gap-2" onSubmit={async (e) => {
        e.preventDefault(); if (!valido) return; setEnviando(true);
        const nome = user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.nome || "Cliente do site";
        await registrarContaComoLead(nome, digitos, user.email);
        setEnviando(false); fechar();
      }}>
        <input value={fone} onChange={(e) => setFone(e.target.value)} type="tel" inputMode="tel" autoComplete="tel" placeholder="(51) 99999-9999" maxLength={20} className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-background px-3 font-body text-base" />
        <button disabled={!valido || enviando} className="h-11 rounded-xl bg-primary px-4 font-body text-sm font-semibold text-primary-foreground disabled:opacity-50">Enviar</button>
      </form>
    </div>
  );
}
