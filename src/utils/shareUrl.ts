/**
 * Retorna a URL correta para compartilhar um imóvel no WhatsApp.
 *
 * Para bots (WhatsApp, Telegram, etc.), a URL aponta para a Edge Function
 * do Supabase que retorna HTML com meta tags Open Graph específicas do imóvel.
 *
 * O og:url dentro do HTML aponta para uhome.com.br, então o WhatsApp
 * exibe o domínio correto no preview.
 *
 * Quando um corretorSlug é informado, o path inclui o prefixo /c/:slug/
 * para preservar a atribuição do corretor.
 */
export function getShareUrl(slug: string, corretorSlug?: string): string {
  const path = corretorSlug
    ? `/c/${corretorSlug}/imovel/${slug}`
    : `/imovel/${slug}`;
  return `https://huigglwvvzuwwyqvpmec.supabase.co/functions/v1/ssr-render?path=${path}`;
}

/**
 * Retorna a URL canônica do imóvel no site (para uso interno, não para compartilhamento).
 * Quando um corretorSlug é informado, retorna a URL personalizada do corretor.
 *
 * IMPORTANTE: Para compartilhamento em redes sociais (WhatsApp, etc.) com
 * preview correto, use getShareUrl() — porque a URL /c/:slug/imovel/ no
 * domínio principal não passa pelo Worker SSR e não retorna OG tags ricas.
 */
export function getImovelUrl(slug: string, corretorSlug?: string): string {
  if (corretorSlug) {
    return `https://uhome.com.br/c/${corretorSlug}/imovel/${slug}`;
  }
  return `https://uhome.com.br/imovel/${slug}`;
}
