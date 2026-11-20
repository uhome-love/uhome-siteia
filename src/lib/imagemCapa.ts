/** Redimensiona sem recortar. O original continua disponível para zoom e fallback. */
export function imagemCapa(src: string, width: number): string {
  try {
    const original = new URL(src);
    if (original.protocol !== 'https:' || !original.hostname.endsWith('.jetimgs.com')) return src;
    const url = new URL('https://wsrv.nl/');
    url.search = new URLSearchParams({ url: src, w: String(width), output: 'webp', q: '82', withoutenlargement: '' }).toString();
    return url.toString();
  } catch { return src; }
}
export function capaResponsiva(src: string) {
  return { src: imagemCapa(src, 768), srcSet: imagemCapa(src, 768) === src ? undefined : [480, 768, 1120, 1600].map(w => `${imagemCapa(src, w)} ${w}w`).join(', '), sizes: '(min-width: 640px) 560px, 100vw' };
}