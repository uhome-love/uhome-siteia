import type { LeadQualificado } from "./controller";

/** Valor de `origem_componente` em public_leads; o sync-to-crm traduz para o CRM. */
export const ORIGEM_COMPONENTE = "lp_studios_cyrela";
export const CAMPANHA = "Studios Cyrela para investir (condição de fim de ano)";

const ORIGENS: Record<string, string> = {
  formulario_topo: "formulário do topo",
  formulario_final: "formulário do fim da página",
  simulador: "simulador",
};

function origemLegivel(l: LeadQualificado) {
  if (ORIGENS[l.origem]) return ORIGENS[l.origem];
  if (l.origem.startsWith("opcao_")) return `botão "Quero este studio" (${l.studioNome})`;
  return l.origem;
}

/** Título do interesse que aparece no CRM (vira imovel_interesse). */
export function tituloInteresse(l: LeadQualificado) {
  return l.produto
    ? `${l.produto.nome} · studio ${l.produto.m2} · Cyrela`
    : "Studios Cyrela para investir (quer ajuda para escolher)";
}

/**
 * Respostas do formulário, uma por linha no CRM. O sync-to-crm escreve cada par
 * "chave: valor" de `contexto.qualificacao` nas observações do lead.
 */
export function qualificacaoCRM(l: LeadQualificado): Record<string, string> {
  const q: Record<string, string> = {
    Prioridade: `${l.prioridade} (${l.score} de 7)`,
    Studio: l.studioNome,
    Entrada: l.entrada,
    "Quando investir": l.momento,
    Prefere: `${l.formato}, ${l.dia}, ${l.periodo.toLowerCase()}`,
    "Começou pelo": origemLegivel(l),
  };
  if (l.simulacao) {
    const a = l.simulacao.quitadoAnos;
    q.Simulou = `${l.simulacao.studio} com ${l.simulacao.noites} noites por mês` + (a ? `, quitado em ${String(a).replace(".", ",")} anos` : "");
  }
  const c = l.clique;
  const anuncio = [c.utm_source, c.utm_medium, c.utm_campaign, c.utm_content].filter(Boolean).join(" / ");
  if (anuncio) q["Anúncio"] = anuncio;
  if (!c.gclid && (c.gbraid || c.wbraid || c.fbclid)) {
    q["Clique"] = c.gbraid ? `gbraid ${c.gbraid}` : c.wbraid ? `wbraid ${c.wbraid}` : `fbclid ${c.fbclid}`;
  }
  return q;
}

/**
 * Contexto gravado em public_leads.contexto. `base` é o contexto geral do visitante
 * (páginas vistas, imóveis vistos, UTMs) que a LIA também usa.
 */
export function contextoLead(l: LeadQualificado, base: Record<string, unknown> = {}) {
  return {
    ...base,
    canal: "landing",
    campanha: CAMPANHA,
    produto: l.produto ? `${l.produto.nome} (Cyrela)` : null,
    qualificacao: qualificacaoCRM(l),
    prioridade: l.prioridade,
    lead_score: l.score,
    gclid: l.clique.gclid ?? base.gclid ?? null,
    utm_term: l.clique.utm_term ?? base.utm_term ?? null,
  };
}
