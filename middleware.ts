import { NextRequest, NextResponse } from 'next/server';

const BOT_UA = /WhatsApp|facebookexternalhit|Facebot|LinkedInBot|Twitterbot|Slackbot|TelegramBot|Discordbot|Googlebot|bingbot|Applebot|PetalBot|YandexBot/i;

const SSR_FUNCTION_URL = 'https://huigglwvvzuwwyqvpmec.supabase.co/functions/v1/ssr-render';

const SSR_PATHS = /^\/(imovel|bairros|blog|busca|empreendimentos|condominios|faq|anunciar|avaliacao|sobre|vitrine|apartamentos-|casas-|coberturas-|salas-|terrenos-|c\/)/;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ua = req.headers.get('user-agent') || '';

  // Skip static assets
  if (pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|webp|avif|map|json)$/)) {
    return NextResponse.next();
  }

  const isBot = BOT_UA.test(ua);
  const needsSSR = pathname === '/' || SSR_PATHS.test(pathname);

  if (isBot && needsSSR) {
    const ssrUrl = `${SSR_FUNCTION_URL}?path=${encodeURIComponent(pathname)}`;
    return NextResponse.rewrite(new URL(ssrUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets/).*)'],
};
