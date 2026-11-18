export function lastmodContente(value: unknown): string | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(value)) return null;
  const date=new Date(value); return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0,10);
}
export function xmlUrl(loc:string,modified?:string|null) {
  const esc=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const last=lastmodContente(modified);
  return `<url><loc>${esc(loc)}</loc>${last?`<lastmod>${last}</lastmod>`:''}</url>`;
}