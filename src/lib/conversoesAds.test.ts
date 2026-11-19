import { describe, it, expect } from 'vitest';
import { conversaoDoEvento, valorConversao } from './gtag';

describe('conversões do Google Ads', () => {
  it('salvar busca vira Busca salva, nunca Lead site', () => { expect(conversaoDoEvento('generate_lead', { lead_source: 'salvar_busca' })).toBe('busca_salva'); });
  it('busca salva não tem valor', () => { expect(valorConversao('busca_salva')).toBeUndefined(); });
  it('abrir a comparação vira Comparar imóveis sem valor', () => { expect(conversaoDoEvento('comparar_imoveis')).toBe('comparar'); expect(valorConversao('comparar')).toBeUndefined(); });
  it('formulário comum segue Lead site de R$ 50 e visita R$ 100', () => { expect(conversaoDoEvento('generate_lead', { lead_source: 'lead_sidebar' })).toBe('lead'); expect(valorConversao('lead')).toBe(50); expect(valorConversao('visita')).toBe(100); });
});
