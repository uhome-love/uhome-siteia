import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AgendamentoVisita } from '@/components/AgendamentoVisita';

const mocks = vi.hoisted(() => ({ insert: vi.fn(), lead: vi.fn() }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { from: () => ({ insert: mocks.insert }) } }));
vi.mock('@/services/leads', () => ({ submitLead: mocks.lead }));
vi.mock('@/lib/trackEvent', () => ({ trackEvent: vi.fn() }));
vi.mock('@/lib/session', () => ({ getCorretorRef: () => 'ana', getCorretorRefId: () => 'broker-id' }));
vi.mock('@/lib/leadTracking', () => ({ getLeadTracking: () => ({ colunas: {} }) }));

afterEach(() => { cleanup(); vi.useRealTimers(); vi.resetAllMocks(); });
describe('visita do imóvel com envio somente simulado', () => {
  it('preserva imóvel, corretor, dia e horário ao pedir visita', async () => {
    vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(new Date(2026, 10, 18, 12));
    mocks.insert.mockResolvedValue({ error: null }); mocks.lead.mockResolvedValue(true);
    render(<AgendamentoVisita imovelId="imovel-id" imovelSlug="apartamento-28238-UH" imovelTitulo="Apartamento Menino Deus" imovelBairro="Menino Deus" imovelPreco={795000} />);
    fireEvent.click(screen.getByRole('gridcell', { name: '19' }));
    fireEvent.click(screen.getByRole('button', { name: '14:00' }));
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(mocks.insert).not.toHaveBeenCalled();
    fireEvent.change(screen.getByPlaceholderText('Seu nome'), { target: { value: 'Pessoa' } });
    fireEvent.change(screen.getByPlaceholderText('(51) 99999-9999'), { target: { value: '51999999999' } });
    fireEvent.click(screen.getByRole('button', { name: 'Pedir visita' }));
    await waitFor(() => expect(mocks.insert).toHaveBeenCalledWith(expect.objectContaining({ imovel_id: 'imovel-id', imovel_slug: 'apartamento-28238-UH', data_visita: '2026-11-19', horario: '14:00', corretor_ref_slug: 'ana' })));
    expect(mocks.lead).toHaveBeenCalledWith(expect.objectContaining({ imovel_preco: 795000, contexto: { pedido: { tipo: 'visita_pedida', dia: '2026-11-19', horario: '14:00', periodo: 'tarde' } } }));
  });
});