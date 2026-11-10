/**
 * Landings de campanha (Google Ads e Meta Ads): têm formulário e barra de contato próprios.
 * Nelas o pop-up de saída não aparece e a LIA só aparece em telas largas (acima de 1080px),
 * onde a barra de contato da página some: um botão de contato por vez.
 */
const LANDINGS_CAMPANHA = ["/investir-studios"];

export function isLandingCampanha(pathname: string) {
  return LANDINGS_CAMPANHA.some((p) => pathname === p || pathname.startsWith(p + "/"));
}
