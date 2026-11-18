import miniaturas from '../../supabase/functions/_shared/buscaMiniaturas.json';
/** Listing thumbnails only: keep original URLs for detail galleries and fallback. */
export function searchImageUrl(src: string, width: number): string {
  const local = (miniaturas as Record<string,string>)[src];
  if (local) return local;
  try {
    const original = new URL(src);
    if (original.protocol !== "https:" || original.hostname === "uhome.com.br" || original.hostname.endsWith(".uhome.com.br") || original.pathname.startsWith("/__l5e/")) return src;
    const url = new URL("https://wsrv.nl/");
    url.search = new URLSearchParams({ url: src, w: String(width), output: "webp", q: "82", withoutenlargement: "" }).toString();
    return url.toString();
  } catch {
    return src;
  }
}

export function searchImageSrcSet(src: string): string | undefined {
  if (searchImageUrl(src, 768) === src) return undefined;
  return [480, 768, 1024, 1280].map(width => `${searchImageUrl(src, width)} ${width}w`).join(", ");
}

/** Foto de card da busca (igual em site-dobra cardFotoUrl): 480x432 recortada, q62, alvo ≤50 KB. */
export function cardFotoUrl(src: string): string {
  const local = (miniaturas as Record<string,string>)[src];
  if (local) return local;
  const base = searchImageUrl(src, 480);
  if (!base.startsWith("https://wsrv.nl/")) return base;
  const url = new URL("https://wsrv.nl/");
  url.search = new URLSearchParams({ url: src, w: "480", h: "432", fit: "cover", output: "webp", q: "62" }).toString();
  return url.toString();
}
