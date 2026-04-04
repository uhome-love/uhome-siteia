import { NextRequest, NextResponse } from 'next/server';

const CRAWLER_UA = /facebookexternalhit|Facebot|LinkedInBot|Twitterbot|Slackbot|TelegramBot|Discordbot|Googlebot|bingbot|Applebot|PetalBot|YandexBot/i;
const WHATSAPP_UA = /WhatsApp/i;
const BROWSER_ENGINE_UA = /AppleWebKit|Chrome|CriOS|Safari|Mobile|wv|Firefox|FxiOS|EdgiOS|EdgA/i;

const SSR_FUNCTION_URL = 'https://huigglwvvzuwwyqvpmec.supabase.co/functions/v1/ssr-render';

const SSR_PATHS = /^\/(imovel|bairros|blog|busca|empreendimentos|condominios|faq|anunciar|avaliacao|sobre|vitrine|apartamentos-|casas-|coberturas-|salas-|terrenos-|c\/)/;

function isDocumentNavigation(req: NextRequest) {
  const secFetchDest = req.headers.get('sec-fetch-dest');
  const secFetchMode = req.headers.get('sec-fetch-mode');
  const secFetchUser = req.headers.get('sec-fetch-user');
  const accept = req.headers.get('accept') || '';

  return (
    secFetchDest === 'document' &&
    secFetchMode === 'navigate' &&
    accept.includes('text/html') &&
    (secFetchUser === '?1' || accept.includes('application/xhtml+xml'))
  );
}

function isHumanBrowser(req: NextRequest) {
  const ua = req.headers.get('user-agent') || '';
  return BROWSER_ENGINE_UA.test(ua) && isDocumentNavigation(req);
}

function isPreviewBot(req: NextRequest) {
  const ua = req.headers.get('user-agent') || '';

  if (CRAWLER_UA.test(ua)) return true;

  // WhatsApp has both a crawler (for link preview) and an in-app browser.
  // Only the crawler should receive SSR; real navigations must get the SPA.
  if (WHATSAPP_UA.test(ua)) {
    return !isHumanBrowser(req);
  }

  return false;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|webp|avif|map|json)$/)) {
    return NextResponse.next();
  }

  const needsSSR = pathname === '/' || SSR_PATHS.test(pathname);

  if (needsSSR && isPreviewBot(req)) {
    const ssrUrl = `${SSR_FUNCTION_URL}?path=${encodeURIComponent(pathname)}`;
    return NextResponse.rewrite(new URL(ssrUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets/).*)'],
};
