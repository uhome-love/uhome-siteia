import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { needsAnswer, onConsentChange, readChoice, saveChoices } from '@/lib/consent';

/** Abre as preferências de cookies de qualquer lugar (ex.: link no rodapé). */
export const abrirPreferenciasCookies = () => window.dispatchEvent(new Event('uhome:cookie-settings'));

/** Altura da barra fixa de baixo visível (Agendar visita, barra do celular), marcada com data-barra-baixo. */
function alturaBarraBaixo(): number {
  let h = 0;
  document.querySelectorAll<HTMLElement>('[data-barra-baixo]').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.height > 0 && r.bottom >= window.innerHeight - 2) h = Math.max(h, r.height);
  });
  return Math.round(h);
}

export function CookieNotice() {
  const [visible, setVisible] = useState(false), [settings, setSettings] = useState(false);
  const [analytics, setAnalytics] = useState(false), [advertising, setAdvertising] = useState(false);
  const [base, setBase] = useState(0);
  const panel = useRef<HTMLDivElement>(null);
  const gpc = (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
  const open = () => { setAnalytics(readChoice('analytics') === 'granted'); setAdvertising(readChoice('advertising') === 'granted'); setSettings(true); setVisible(true); };

  useEffect(() => { void needsAnswer(['analytics', 'advertising']).then(setVisible); window.addEventListener('uhome:cookie-settings', open); return () => window.removeEventListener('uhome:cookie-settings', open); }, []);
  useEffect(() => onConsentChange(() => { setAnalytics(readChoice('analytics') === 'granted'); setAdvertising(readChoice('advertising') === 'granted'); }), []);
  useEffect(() => { if (visible) panel.current?.focus({ preventScroll: true }); }, [visible]);

  // Fica acima da barra fixa de baixo e empurra o botão da Lia/WhatsApp para cima junto.
  useEffect(() => {
    const root = document.documentElement;
    if (!visible) { root.style.setProperty('--uh-cookie', '0px'); return; }
    const medir = () => {
      const b = alturaBarraBaixo(); setBase(b);
      const h = panel.current?.offsetHeight ?? 0;
      root.style.setProperty('--uh-cookie', window.innerWidth < 640 ? `${h + 8}px` : '0px');
    };
    medir();
    const id = window.setInterval(medir, 600);
    window.addEventListener('resize', medir);
    return () => { window.clearInterval(id); window.removeEventListener('resize', medir); root.style.setProperty('--uh-cookie', '0px'); };
  }, [visible, settings]);

  const save = (a: boolean, d: boolean) => { saveChoices({ analytics: a ? 'granted' : 'denied', advertising: d ? 'granted' : 'denied' }); setVisible(false); setSettings(false); };
  if (!visible) return null;

  return (
    <div ref={panel} tabIndex={-1} role="region" aria-label="Preferências de privacidade" style={{ bottom: base ? base + 8 : undefined }}
      className="fixed inset-x-2 bottom-2 z-[110] rounded-xl border border-border bg-background/95 px-3 py-1.5 shadow-lg backdrop-blur sm:inset-x-auto sm:bottom-4 sm:left-4 sm:max-w-[420px] sm:px-3 sm:py-2">
      {settings ? (
        <div className="max-h-[60dvh] space-y-3 overflow-auto py-1 text-sm">
          <p className="font-semibold text-foreground">Preferências de cookies</p>
          <p className="text-muted-foreground">Necessários · sempre ativos</p>
          {gpc && <p>O sinal de privacidade do seu navegador recusa análise e publicidade.</p>}
          <label className="flex items-center justify-between gap-3">Análise, fornecida pela Uhome, Lovable e Google<Switch aria-label="Análise" checked={!gpc && analytics} disabled={gpc} onCheckedChange={setAnalytics} /></label>
          <label className="flex items-center justify-between gap-3">Publicidade, fornecida por Google e Meta<Switch aria-label="Publicidade" checked={!gpc && advertising} disabled={gpc} onCheckedChange={setAdvertising} /></label>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => save(analytics, advertising)}>Salvar</Button>
            <a href="/politica-de-privacidade" className="text-xs text-primary underline">Política de privacidade</a>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 sm:gap-y-1.5">
          <p className="min-w-0 flex-1 text-xs leading-tight text-foreground sm:basis-full sm:whitespace-nowrap sm:text-sm">Usamos cookies para melhorar sua busca.</p>
          <button type="button" onClick={open} className="order-2 text-xs text-primary underline sm:order-4">Preferências</button>
          <div className="order-3 flex w-full gap-2 sm:w-auto">
            <Button size="sm" variant="outline" className="h-8 flex-1 px-3 text-xs sm:flex-none" onClick={() => save(true, true)}>Aceitar</Button>
            <Button size="sm" variant="outline" className="h-8 flex-1 px-3 text-xs sm:flex-none" onClick={() => save(false, false)}>Recusar análise</Button>
          </div>
        </div>
      )}
    </div>
  );
}
