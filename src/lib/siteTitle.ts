export const SITE_TITLE = "Uhome · Você e seu novo lar | Imóveis em Porto Alegre e Canoas";
export function siteTitle(page?: string) { return page ? `${page} | ${SITE_TITLE}` : SITE_TITLE; }