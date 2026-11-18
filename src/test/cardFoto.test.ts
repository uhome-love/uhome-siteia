import { describe, expect, it } from 'vitest';
import miniaturas from '../../supabase/functions/_shared/buscaMiniaturas.json';
import { cardFotoUrl } from '@/lib/searchImages';

describe('foto de card da busca', () => {
  it('usa 480x432 recortada com q62 no wsrv', () => {
    const u = new URL(cardFotoUrl('https://s01.jetimgs.com/abc/.jpg'));
    expect([u.hostname, u.searchParams.get('w'), u.searchParams.get('h'), u.searchParams.get('q'), u.searchParams.get('fit')]).toEqual(['wsrv.nl', '480', '432', '62', 'cover']);
  });
  it('mantém a miniatura própria', () => {
    const [orig, local] = Object.entries(miniaturas as Record<string, string>)[0];
    expect(cardFotoUrl(orig)).toBe(local);
  });
});
