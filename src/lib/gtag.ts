/**
 * Centralized GA4 event tracking via GTM dataLayer.
 * Events: generate_lead (form submissions) and click_whatsapp (WhatsApp clicks).
 */

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

function push(event: string, params: Record<string, unknown> = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
  window.gtag?.("event", event, params);
  reportAdsConversion(event, params);
}

/* Google Ads (conta Site Uhome) */
const ADS_ID = "AW-18567893155";
const ADS = {
  lead: `${ADS_ID}/bHQ5CLDL6LUdEKOh7pVF`,
  visita: `${ADS_ID}/IGu4CLPL6LUdEKOh7pVF`,
  whatsapp: `${ADS_ID}/Y4peCLbL6LUdEKOh7pVF`,
};

/** Converte eventos do site em conversões do Google Ads. */
export function reportAdsConversion(event: string, params: Record<string, unknown> = {}) {
  let send_to: string | undefined;
  if (event === "generate_lead") {
    const tipo = String(params.lead_tipo ?? params.lead_source ?? "");
    send_to = /visita|agend/i.test(tipo) ? ADS.visita : ADS.lead;
  } else if (event === "click_whatsapp") send_to = ADS.whatsapp;
  if (send_to) window.gtag?.("event", "conversion", { send_to });
}

/** Track form lead submissions */
export function trackGenerateLead(params: {
  origem_componente: string;
  origem_pagina?: string;
  imovel_titulo?: string;
  imovel_slug?: string;
  imovel_bairro?: string;
}) {
  push("generate_lead", {
    lead_source: params.origem_componente,
    page_path: params.origem_pagina || window.location.pathname,
    property_title: params.imovel_titulo || "",
    property_slug: params.imovel_slug || "",
    property_neighborhood: params.imovel_bairro || "",
  });
}

/** Track WhatsApp button clicks */
export function trackClickWhatsapp(params: {
  origem_componente: string;
  origem_pagina?: string;
  imovel_titulo?: string;
  imovel_slug?: string;
}) {
  push("click_whatsapp", {
    click_source: params.origem_componente,
    page_path: params.origem_pagina || window.location.pathname,
    property_title: params.imovel_titulo || "",
    property_slug: params.imovel_slug || "",
  });
}

/* ---------- GA4 direto (gtag.js) ---------- */
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** Envia evento ao GA4 (se carregado). */
export function gaEvent(name: string, params: Record<string, unknown> = {}) {
  window.gtag?.("event", name, params);
}

/** Carrega GA4 com o ID conectado e registra page_view em navegações SPA. */
export function initGA4() {
  const id = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_ANALYTICS_API_KEY as string | undefined;
  if (!id || typeof window === "undefined" || window.gtag) return;
  if (/lovableproject\.com|localhost/.test(location.hostname)) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments as unknown as Record<string, unknown>);
  };
  window.gtag("set", "developer_id.dZjgwMW", true);
  window.gtag("js", new Date());
  window.gtag("config", id, { send_page_view: false });
  window.gtag("config", ADS_ID);
  const load = () => {
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(s);
  };
  setTimeout(load, 1500);
  let last = "";
  const pv = () => {
    const path = location.pathname + location.search;
    if (path === last) return;
    last = path;
    window.gtag?.("event", "page_view", { page_path: path, page_location: location.href, page_title: document.title });
  };
  for (const m of ["pushState", "replaceState"] as const) {
    const orig = history[m];
    history[m] = function (...a: Parameters<typeof orig>) {
      const r = orig.apply(this, a);
      setTimeout(pv, 300);
      return r;
    } as typeof orig;
  }
  addEventListener("popstate", () => setTimeout(pv, 300));
  setTimeout(pv, 300);
}
