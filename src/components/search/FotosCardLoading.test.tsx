import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/supabaseLazy', () => ({ supabase: { from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { fotos: [{ url: 'https://s01.jetimgs.com/first.jpg' }, { url: 'https://s01.jetimgs.com/second.jpg' }] } }) }) }) }) } }));
import { FotosCard } from './FotosCard';

afterEach(cleanup);
describe('carrossel não concorre com a foto do LCP', () => {
  it('mantém fotos extras sem URL até tocar, mesmo com os dados do carrossel prontos', async () => {
    const { container } = render(<FotosCard id="photo-gate" produto={false} titulo="Apartamento"><a href="/imovel/apartamento"><img src="/first.webp" alt="Primeira" /></a></FotosCard>);
    const caixa = container.querySelector('.fotos-card');
    const trilho = container.querySelector('.fotos-card-trilho');
    if (!caixa || !trilho) throw new Error('Carrossel ausente');
    fireEvent.pointerEnter(caixa);
    await waitFor(() => expect(container.querySelector('.fotos-card-slide img')).not.toBeNull());
    expect(container.querySelector('.fotos-card-slide img')?.getAttribute('src')).toBeNull();
    act(() => fireEvent.pointerDown(trilho));
    await waitFor(() => expect(container.querySelector('.fotos-card-slide img')?.getAttribute('src')).toContain('second.jpg'));
  });
});