/**
 * Retorna a URL correta para compartilhar um imóvel no WhatsApp.
 * 
 * Para bots (WhatsApp, Telegram, etc.), a URL aponta para a Edge Function
 * do Supabase que retorna HTML com meta tags Open Graph específicas do imóvel.
 * 
 * O og:url dentro do HTML aponta para uhome.com.br, então o WhatsApp
 * exibe o domínio correto no preview.
 */
export function getShareUrl(slug: string): string {
  return `https://huigglwvvzuwwyqvpmec.supabase.co/functions/v1/ssr-render?path=/imovel/${slug}`;
}

/**
 * Retorna a URL canônica do imóvel no site (para uso interno, não para compartilhamento).
 */
export function getImovelUrl(slug: string): string {
  return `https://uhome.com.br/imovel/${slug}`;
}
