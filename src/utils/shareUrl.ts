/**
 * Retorna a URL correta para compartilhar um imóvel no WhatsApp.
 *
 * Aponta para o domínio canônico uhome.com.br. O SSR universal do site
 * entrega meta tags Open Graph específicas do imóvel para crawlers
 * (WhatsApp, Telegram, Facebook, etc.), garantindo preview rico sem
 * vazar URLs internas do Supabase.
 *
 * Quando um corretorSlug é informado, o path inclui o prefixo /c/:slug/
 * para preservar a atribuição do corretor.
 */
export function getShareUrl(slug: string, corretorSlug?: string): string {
  const path = corretorSlug
    ? `/c/${corretorSlug}/imovel/${slug}`
    : `/imovel/${slug}`;
  return `https://uhome.com.br${path}`;
}

/**
 * Retorna a URL canônica do imóvel no site (para uso interno e compartilhamento).
 * Quando um corretorSlug é informado, retorna a URL personalizada do corretor.
 */
export function getImovelUrl(slug: string, corretorSlug?: string): string {
  if (corretorSlug) {
    return `https://uhome.com.br/c/${corretorSlug}/imovel/${slug}`;
  }
  return `https://uhome.com.br/imovel/${slug}`;
}
