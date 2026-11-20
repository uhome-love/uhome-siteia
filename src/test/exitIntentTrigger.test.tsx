import { act, cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const modal = vi.hoisted(() => vi.fn(() => null));
vi.mock('@/components/ExitIntentModal', () => ({ ExitIntentModal: modal }));
import { ExitIntentTrigger } from '@/components/ExitIntentTrigger';

beforeEach(() => { sessionStorage.clear(); history.replaceState({}, '', '/'); modal.mockClear(); vi.useFakeTimers(); });
afterEach(() => { cleanup(); vi.useRealTimers(); sessionStorage.clear(); history.replaceState({}, '', '/'); });
describe('aviso de saída sob demanda mantém as regras existentes', () => {
  it('não carrega o formulário antes dos 90 segundos do aviso automático', async () => {
    render(<ExitIntentTrigger />);
    act(() => vi.advanceTimersByTime(89999)); expect(modal).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1)); vi.useRealTimers();
    await waitFor(() => expect(modal).toHaveBeenCalled());
    expect(sessionStorage.getItem('uhome_exit_shown')).toBe('1');
  });
  it('só reage à saída após 60 segundos', async () => {
    render(<ExitIntentTrigger />);
    act(() => { vi.advanceTimersByTime(59999); document.dispatchEvent(new MouseEvent('mouseleave', { clientY: 0 })); });
    expect(modal).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(1); document.dispatchEvent(new MouseEvent('mouseleave', { clientY: 0 })); });
    vi.useRealTimers(); await waitFor(() => expect(modal).toHaveBeenCalled());
  });
  it('não abre na landing excluída nem quando já exibido', () => {
    history.replaceState({}, '', '/investir-studios'); render(<ExitIntentTrigger />);
    act(() => vi.advanceTimersByTime(90000)); expect(modal).not.toHaveBeenCalled();
    cleanup(); history.replaceState({}, '', '/'); sessionStorage.setItem('uhome_exit_shown', '1');
    render(<ExitIntentTrigger />); act(() => vi.advanceTimersByTime(90000));
    expect(modal).not.toHaveBeenCalled();
  });
});