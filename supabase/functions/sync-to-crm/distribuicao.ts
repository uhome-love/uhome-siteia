// Regra de distribuição de contatos do site que chegam ao CRM.
// Pessoa com corretor ativo (não descartada nem arquivada): só acrescentar dados.
// Sem corretor, descartada ou arquivada: Fila do CEO.
export interface EstadoLeadCRM {
  corretor_id?: string | null
  arquivado?: boolean | null
  stage_tipo?: string | null
  motivo_descarte?: string | null
  tipo_descarte?: string | null
}

export function temCorretorAtivo(l: EstadoLeadCRM | null | undefined): boolean {
  if (!l || !l.corretor_id) return false
  if (l.arquivado) return false
  if (l.stage_tipo === 'descarte') return false
  return true
}

export function decidirDistribuicao(estados: (EstadoLeadCRM | null | undefined)[]): 'fila_ceo' | 'so_acrescentar' {
  return estados.some(temCorretorAtivo) ? 'so_acrescentar' : 'fila_ceo'
}

export function variacoesTelefone(tel: unknown): string[] {
  const d = String(tel ?? '').replace(/\D/g, '')
  if (d.length < 10) return []
  const local = d.startsWith('55') && d.length >= 12 ? d.slice(2) : d
  return [...new Set([local, '55' + local])]
}
