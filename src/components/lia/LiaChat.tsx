import { reportAdsConversion } from "@/lib/gtag";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { X, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCorretor } from "@/contexts/CorretorContext";
import { buildWhatsAppUrl, buildCorretorWhatsAppUrl } from "@/lib/whatsapp";
import { captureGclid, montarContextoLia, registrarPagina } from "@/lib/liaContext";
import liaAvatar from "@/assets/lia-avatar.webp.asset.json";
import { isLandingCampanha } from "@/lib/landingPages";

type Msg = { role: "user" | "assistant"; content: string };
const KEY = "uhome_lia_conversa";
const SID_KEY = "uhome_lia_sid";

function sessionId() {
  let id = sessionStorage.getItem(SID_KEY);
  if (!id) { id = crypto.randomUUID(); sessionStorage.setItem(SID_KEY, id); }
  return id;
}

function lerConversa(): Msg[] {
  try { return JSON.parse(sessionStorage.getItem(KEY) || "[]"); } catch { return []; }
}

function track(event: string, data: Record<string, unknown> = {}) {
  (window as any).dataLayer?.push({ event, ...data });
  window.gtag?.("event", event, data);
  reportAdsConversion(event, data);
}

const SUGESTOES = ["Quero ver opções de Natal", "Procuro um apartamento", "Quero agendar uma visita"];

export function LiaChat() {
  const location = useLocation();
  const { corretor } = useCorretor();
  const [visible, setVisible] = useState(false);
  const [aberto, setAberto] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>(lerConversa);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const fimRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isProdutoPage = location.pathname.includes("/imovel/") || /\/(em-foco|campanha)\/[^/]+/.test(location.pathname) || isLandingCampanha(location.pathname);
  const hasBottomBar = location.pathname.startsWith("/busca") || isProdutoPage;

  useEffect(() => { captureGclid(); const t = setTimeout(() => setVisible(true), 2500); return () => clearTimeout(t); }, []);
  useEffect(() => { registrarPagina(location.pathname); }, [location.pathname]);
  useEffect(() => { sessionStorage.setItem(KEY, JSON.stringify(msgs.slice(-40))); fimRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  useEffect(() => { if (aberto && !enviando) inputRef.current?.focus(); }, [aberto, enviando]);
  useEffect(() => {
    const abrir = () => setAberto(true);
    window.addEventListener("uhome:abrir-lia", abrir);
    return () => window.removeEventListener("uhome:abrir-lia", abrir);
  }, []);

  const saudacao = corretor
    ? `Oi! Eu sou a LIA, do atendimento da Uhome. Vou te ajudar e deixar tudo pronto para o ${corretor.nome.split(" ")[0]}. O que você está procurando?`
    : "Oi! Eu sou a LIA, do atendimento da Uhome 😊 Te ajudo a encontrar o imóvel certo e a marcar uma visita. O que você está procurando?";

  const whatsUrl = () => {
    const slug = location.pathname.match(/\/imovel\/([^/]+)/)?.[1];
    const imovel = slug ? { slug } : undefined;
    return corretor
      ? buildCorretorWhatsAppUrl(corretor.nome, corretor.telefone, imovel)
      : slug ? buildWhatsAppUrl(undefined, imovel) : buildWhatsAppUrl("Olá, LIA! Vim pelo site da Uhome.");
  };

  async function enviar(conteudo: string) {
    const c = conteudo.trim();
    if (!c || enviando) return;
    const novas: Msg[] = [...msgs, { role: "user", content: c }];
    setMsgs(novas);
    setTexto("");
    setEnviando(true);
    if (msgs.length === 0) track("lia_conversa_iniciada", { pagina: location.pathname });
    try {
      const { data, error } = await supabase.functions.invoke("lia-chat", {
        body: { session_id: sessionId(), mensagens: novas.slice(-30), contexto: montarContextoLia(location.pathname, corretor?.slug ?? null) },
      });
      if (error) throw error;
      const bolhas: string[] = data?.bolhas ?? [];
      setMsgs((m) => [...m, ...bolhas.map((b) => ({ role: "assistant" as const, content: b }))]);
      if (data?.acao === "visita") { track("generate_lead", { lead_tipo: "visita_lia", pagina: location.pathname }); }
      if (data?.acao === "lead") { track("generate_lead", { lead_tipo: "lead_lia", pagina: location.pathname }); }
    } catch {
      setMsgs((m) => [...m, { role: "assistant", content: "Tive uma instabilidade aqui. Pode continuar comigo pelo WhatsApp no botão abaixo?" }]);
    } finally {
      setEnviando(false);
    }
  }

  if (!visible) return null;

  return (
    <>
      {aberto && (
        <div
          role="dialog"
          aria-label="Conversa com a LIA"
          className="fixed inset-x-0 bottom-0 z-[60] flex h-[85dvh] flex-col overflow-hidden rounded-t-3xl border border-border bg-background shadow-2xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-[600px] sm:max-h-[calc(100dvh-3rem)] sm:w-[380px] sm:rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <header className="flex items-center gap-3 bg-primary px-4 py-3 text-primary-foreground">
            <img src={liaAvatar.url} alt="" width={40} height={40} className="h-10 w-10 rounded-full object-cover ring-2 ring-primary-foreground/40" />
            <div className="min-w-0 flex-1">
              <p className="font-body text-sm font-bold leading-tight">LIA · Uhome</p>
              <p className="font-body text-xs opacity-80">Atendente virtual · responde na hora</p>
            </div>
            <button onClick={() => setAberto(false)} aria-label="Fechar conversa" className="rounded-full p-1.5 hover:bg-primary-foreground/15">
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="flex-1 space-y-2 overflow-y-auto bg-muted/40 px-4 py-4" aria-live="polite">
            <Bolha role="assistant" content={saudacao} />
            {msgs.map((m, i) => <Bolha key={i} {...m} />)}
            {msgs.length === 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {SUGESTOES.map((s) => (
                  <button key={s} onClick={() => enviar(s)} className="rounded-full border border-primary/30 bg-background px-3 py-1.5 font-body text-xs font-medium text-primary hover:bg-primary/5">
                    {s}
                  </button>
                ))}
              </div>
            )}
            {enviando && (
              <div className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-md bg-background px-4 py-3 shadow-sm" aria-label="LIA está digitando">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.2s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.1s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
              </div>
            )}
            <div ref={fimRef} />
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); enviar(texto); }}
            className="border-t border-border bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          >
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(texto); } }}
                rows={1}
                maxLength={1000}
                placeholder="Escreva para a LIA..."
                aria-label="Mensagem para a LIA"
                className="max-h-28 min-h-[44px] flex-1 resize-none rounded-2xl border border-input bg-background px-4 py-2.5 font-body text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button type="submit" disabled={!texto.trim() || enviando} aria-label="Enviar" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40">
                {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
            <a
              href={whatsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("lia_continuar_whatsapp", { pagina: location.pathname })}
              className="mt-2 block text-center font-body text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              Prefere o WhatsApp? Continuar no WhatsApp
            </a>
          </form>
        </div>
      )}

      {!aberto && (
        <button
          onClick={() => { setAberto(true); track("lia_aberta", { pagina: location.pathname }); }}
          aria-label="Fale com a LIA, atendente virtual da Uhome"
          className={`fixed right-4 z-50 flex items-center gap-2 rounded-full border border-border bg-background p-1 shadow-xl transition-transform hover:scale-[1.03] active:scale-95 sm:right-6 sm:pr-4 ${
            hasBottomBar ? "bottom-24 sm:bottom-6" : "bottom-5 sm:bottom-6"
          } ${isProdutoPage ? "hidden sm:flex" : "flex"}`}
        >
          <span className="relative">
            <img src={liaAvatar.url} alt="" width={52} height={52} className="h-[52px] w-[52px] rounded-full object-cover" />
            <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-background bg-primary" aria-hidden />
          </span>
          <span className="hidden text-left sm:block">
            <span className="block font-body text-sm font-bold leading-tight text-foreground">Fale com a LIA</span>
            <span className="block font-body text-xs text-muted-foreground">Responde na hora</span>
          </span>
        </button>
      )}
    </>
  );
}

function Bolha({ role, content }: Msg) {
  const user = role === "user";
  const partes = content.split(/(https?:\/\/[^\s]+)/g);
  return (
    <div className={`flex ${user ? "justify-end" : "justify-start"}`}>
      <p className={`max-w-[85%] whitespace-pre-line break-words rounded-2xl px-4 py-2.5 font-body text-sm leading-relaxed shadow-sm ${user ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-background text-foreground"}`}>
        {partes.map((p, i) =>
          /^https?:\/\//.test(p) ? (
            <a key={i} href={p.replace("https://uhome.com.br", "")} className="font-semibold underline underline-offset-2">
              {p.includes("/em-foco/") ? "Ver empreendimento" : p.includes("/imovel/") ? "Ver imóvel" : "Abrir link"}
            </a>
          ) : (
            <span key={i}>{p}</span>
          ),
        )}
      </p>
    </div>
  );
}

export default LiaChat;
