import { afterEach, describe, expect, it } from 'vitest';
import { act, cleanup, render } from '@testing-library/react';
import { FotoCatalogo } from './FotoCatalogo';

const original = window.IntersectionObserver;
afterEach(() => { cleanup(); window.IntersectionObserver = original; });
describe('catalog photo loading', () => {
  it('requests the first photo immediately', () => {
    const { container } = render(<FotoCatalogo src="https://images.example.org/first.jpg" titulo="Apartamento" primeira />);
    expect(container.querySelector('img')?.getAttribute('src')).toContain('w=480');
  });
  it('requests an offscreen photo only when it approaches the viewport', () => {
    let notify: IntersectionObserverCallback | undefined;
    window.IntersectionObserver = class {
      constructor(cb: IntersectionObserverCallback) { notify = cb; }
      observe() {}
      disconnect() {}
    } as unknown as typeof IntersectionObserver;
    const { container } = render(<FotoCatalogo src="https://images.example.org/later.jpg" titulo="Casa" primeira={false} />);
    const img = container.querySelector('img');
    expect(img?.getAttribute('src')).toBeNull();
    act(() => notify?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
    expect(img?.getAttribute('src')).toContain('later.jpg');
  });
});