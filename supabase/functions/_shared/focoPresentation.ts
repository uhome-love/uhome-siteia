type Produto = { nome: string; tipo?: string | null; segmento?: string | null; bairro?: string | null; resumo?: string | null; ficha?: { titulo_manual?: string | null; frase?: string | null; unidade?: string[]; lazer?: string[]; motivos?: { titulo: string; texto: string }[]; faq?: { p: string; r: string }[]; tipologias?: { suites?: number | null }[] } | null; entrega?: string | null; status_obra?: string | null };

/** Classifica a oferta principal, nunca a casa opcional de um lote. */
export function tipoFoco(p: Produto): string {
  const fonte = (p.tipo?.trim() || p.segmento || "").split(/[;(]/)[0];
  if (/lotes?\b/i.test(fonte)) return "Lotes";
  if (/^coberturas?\b/i.test(fonte)) return "Coberturas";
  if (/sobrado/i.test(fonte)) return "Sobrados";
  if (/casas?\b/i.test(fonte)) return "Casas";
  if (/studio/i.test(fonte)) return "Studios";
  if (/apartamento/i.test(fonte)) return "Apartamentos";
  return "Imóveis";
}

/** O mesmo gancho em tela pronta, página e prévia; exclusivamente a partir da ficha. */
export function tituloFoco(p: Produto): string {
  if (p.ficha?.titulo_manual?.trim()) return p.ficha.titulo_manual.trim();
  const tipo = tipoFoco(p);
  if (tipo === "Lotes" && /condomínio clube/i.test(`${p.tipo ?? ""} ${p.segmento ?? ""}`)) return `Lotes em condomínio clube${p.bairro ? ` no ${p.bairro}` : ""}`;
  const unidade = p.ficha?.unidade?.join(" ") ?? "";
  const diferencial = /terraço/i.test(p.tipo ?? "") ? "terraço" : p.ficha?.tipologias?.some(t => (t.suites ?? 0) > 0) ? "suíte" : /churrasqueira/i.test(unidade) ? "churrasqueira" : p.ficha?.lazer?.length ? "lazer de clube" : "conforto";
  return `${tipo} com ${diferencial}${p.bairro ? ` no ${p.bairro}` : ""}`;
}
export function tituloPreviaFoco(p: Produto): string {
  return `${p.nome} · ${tituloFoco(p)} | Uhome`;
}
export function destaquesFoco(p: Produto) {
  if (p.ficha?.motivos?.length) return p.ficha.motivos.slice(0, 3);
  return [
    p.ficha?.unidade?.length ? { titulo: "Na sua unidade", texto: p.ficha.unidade.slice(0, 3).join(", ") + "." } : null,
    p.ficha?.lazer?.length ? { titulo: "Lazer do condomínio", texto: p.ficha.lazer.slice(0, 5).join(", ") + "." } : null,
    p.bairro ? { titulo: p.bairro, texto: p.resumo ?? p.nome } : null,
  ].filter((x): x is { titulo: string; texto: string } => !!x).slice(0, 3);
}
export function faqFoco(p: Produto, condicoes: string[] = []) {
  if (p.ficha?.faq?.length) return p.ficha.faq;
  return [
    p.entrega ? { p: "Quando fica pronto?", r: `Entrega prevista para ${p.entrega.toLowerCase()}.` } : null,
    { p: "Como funciona o pagamento?", r: condicoes.length ? condicoes.join(". ") + ". Financiamento conforme o perfil." : "Um especialista apresenta as condições disponíveis e o financiamento conforme o seu perfil." },
    { p: "Como pedir uma visita?", r: "Escolha o dia e o período. Um especialista confirma pelo WhatsApp." },
  ].filter((x): x is { p: string; r: string } => !!x);
}