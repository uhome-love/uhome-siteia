import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { capaResponsiva, imagemCapa } from '@/lib/imagemCapa';

const chat = vi.hoisted(() => vi.fn((_props: { aberturaInicial?: { avatar: boolean; mensagem?: string } }) => null));
vi.mock('@/components/lia/LiaChat', () => ({ default: chat }));
vi.mock('react-router-dom', () => ({ useLocation: () => ({ pathname: '/busca' }) }));
vi.mock('@/lib/liaContext', () => ({ captureGclid: vi.fn(), registrarPagina: vi.fn() }));
import { LiaLauncher } from '@/components/lia/LiaLauncher';

afterEach(() => { cleanup(); vi.useRealTimers(); });
beforeEach(() => chat.mockClear());

describe('conversa sob demanda', () => {
  it('não monta o módulo da conversa ao exibir o avatar', async () => {
    vi.useFakeTimers(); render(<LiaLauncher />);
    act(() => vi.advanceTimersByTime(2500));
    expect(chat).not.toHaveBeenCalled();
  });
  it('abre no primeiro toque, mesmo sem ter carregado a conversa antes', async () => {
    vi.useFakeTimers(); const view = render(<LiaLauncher />);
    act(() => vi.advanceTimersByTime(2500)); vi.useRealTimers();
    fireEvent.click(view.getByRole('button'));
    await waitFor(() => expect(chat).toHaveBeenCalled());
    expect(chat.mock.calls[0]?.[0]).toMatchObject({ aberturaInicial: { avatar: true } });
  });
  it('preserva a mensagem enviada pelo botão Lia de outras páginas', async () => {
    render(<LiaLauncher />);
    act(() => window.dispatchEvent(new CustomEvent('uhome:abrir-lia', { detail: { mensagem: 'Quero visitar' } })));
    await waitFor(() => expect(chat).toHaveBeenCalled());
    expect(chat.mock.calls[0]?.[0]).toMatchObject({ aberturaInicial: { avatar: false, mensagem: 'Quero visitar' } });
  });
});

describe('capa do imóvel sem mudar a foto', () => {
  const original = 'https://s01.jetimgs.com/capa/.jpg';
  it('gera WebP no tamanho indicado sem recortar a foto', () => {
    const url = new URL(imagemCapa(original, 480));
    expect(url.searchParams.get('url')).toBe(original);
    expect(url.searchParams.get('w')).toBe('480');
    expect(url.searchParams.get('output')).toBe('webp');
    expect(url.searchParams.has('fit')).toBe(false);
    expect(url.searchParams.has('h')).toBe(false);
  });
  it('preserva imagens que não são do serviço Jetimob', () => {
    expect(imagemCapa('/__l5e/assets-v1/foto.jpg', 480)).toBe('/__l5e/assets-v1/foto.jpg');
    expect(imagemCapa('https://uhome.com.br/foto.webp', 480)).toBe('https://uhome.com.br/foto.webp');
  });
  it('oferece variantes para celular e computador', () => {
    const capa = capaResponsiva(original);
    expect(capa.srcSet?.split(', ').map(x => x.split(' ').at(-1))).toEqual(['480w', '768w', '1120w', '1600w']);
  });
});