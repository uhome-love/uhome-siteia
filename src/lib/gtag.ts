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
