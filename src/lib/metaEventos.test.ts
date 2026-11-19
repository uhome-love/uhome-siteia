import { describe, it, expect } from 'vitest';
import { eventoMeta } from './gtag';
describe('eventos da Meta', () => {
  it('imóvel aberto = ViewContent, busca = Search, favorito = AddToWishlist, visita = Schedule', () => {
    expect(eventoMeta('imovel_visto')).toBe('ViewContent'); expect(eventoMeta('busca_feita')).toBe('Search');
    expect(eventoMeta('favorito_salvo')).toBe('AddToWishlist'); expect(eventoMeta('visita_pedida')).toBe('Schedule');
  });
  it('evento sem correspondência não vai para a Meta', () => expect(eventoMeta('rolagem_50')).toBeNull());
});
