import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { depoisDoLoadOcioso } from '@/lib/depoisDoLoadOcioso';

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });
beforeEach(() => vi.useFakeTimers());
describe('trabalho opcional sem disputar a pintura', () => {
  it('espera load e idle antes de executar', () => {
    vi.spyOn(document, 'readyState', 'get').mockReturnValue('loading');
    const idle = vi.fn((_callback: () => void, _options?: IdleRequestOptions) => 7); vi.stubGlobal('requestIdleCallback', idle);
    const start = vi.fn(); const cancel = depoisDoLoadOcioso(start);
    expect(idle).not.toHaveBeenCalled();
    window.dispatchEvent(new Event('load'));
    expect(idle).toHaveBeenCalledWith(expect.any(Function), { timeout: 3000 });
    expect(start).not.toHaveBeenCalled();
    const callback = idle.mock.calls[0]?.[0] as unknown as (() => void) | undefined;
    callback?.(); expect(start).toHaveBeenCalledTimes(1); cancel();
  });
  it('cancela a inicialização quando desmonta antes do load', () => {
    vi.spyOn(document, 'readyState', 'get').mockReturnValue('loading');
    const start = vi.fn(); const cancel = depoisDoLoadOcioso(start); cancel();
    window.dispatchEvent(new Event('load')); vi.runAllTimers();
    expect(start).not.toHaveBeenCalled();
  });
  it('usa 1500 ms quando não há requestIdleCallback', () => {
    vi.spyOn(document, 'readyState', 'get').mockReturnValue('complete');
    vi.stubGlobal('requestIdleCallback', undefined);
    const start = vi.fn(); const cancel = depoisDoLoadOcioso(start);
    vi.advanceTimersByTime(1499); expect(start).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1); expect(start).toHaveBeenCalledTimes(1); cancel();
  });
});