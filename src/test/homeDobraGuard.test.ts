import { afterEach, describe, expect, it } from 'vitest';
import { HOME_GUARD } from '../../supabase/functions/site-dobra/homeDobra';

afterEach(() => { localStorage.clear(); document.body.innerHTML = ''; document.head.innerHTML = ''; });
function preparar(layout = 'lar-2') {
  document.head.innerHTML = `<meta name="uh-home-layout" content="${layout}">`;
  document.body.innerHTML = '<div id="uh-pre"><section data-uh-historico hidden></section></div><div id="root"></div>';
}
describe('histórico local e compatibilidade da Home pronta', () => {
  it('não reserva espaço de histórico para uma pessoa sem imóveis vistos', () => {
    preparar(); new Function(HOME_GUARD)();
    expect(document.querySelector<HTMLElement>('[data-uh-historico]')?.hidden).toBe(true);
  });
  it('reserva espaço antes da pintura quando o aparelho tem imóveis vistos', () => {
    preparar(); localStorage.setItem('imoveis_vistos', '["id-do-imovel"]'); new Function(HOME_GUARD)();
    expect(document.querySelector<HTMLElement>('[data-uh-historico]')?.hidden).toBe(false);
  });
  it.each(['[]', '[1,null]', '{"id":"x"}', 'inválido'])('histórico inválido não cria espaço vazio: %s', value => {
    preparar(); localStorage.setItem('imoveis_vistos', value); new Function(HOME_GUARD)();
    expect(document.querySelector<HTMLElement>('[data-uh-historico]')?.hidden).toBe(true);
  });
  it('app publicado lar-1 descarta o novo molde sem substituir o root', () => {
    preparar('lar-1'); new Function(HOME_GUARD)();
    expect(document.getElementById('uh-pre')).toBeNull(); expect(document.getElementById('root')).not.toBeNull();
  });
});