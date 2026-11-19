import { describe, it, expect } from 'vitest';
import { valorConversao } from '@/lib/gtag';
describe('valor das conversões no Google Ads', () => {
  it('visita vale R$ 100', () => expect(valorConversao('visita')).toBe(100));
  it('formulário vale R$ 50', () => expect(valorConversao('lead')).toBe(50));
  it('WhatsApp não tem valor', () => expect(valorConversao('whatsapp')).toBeUndefined());
});
