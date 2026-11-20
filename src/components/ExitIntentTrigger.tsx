import { Suspense, useEffect, useState } from 'react';
import { lazyRetry } from '@/lib/lazyRetry';
import { isLandingCampanha } from '@/lib/landingPages';

const Modal = lazyRetry(() => import('./ExitIntentModal').then(m => ({ default: m.ExitIntentModal })));

/** Keep the existing trigger timing; fetch animation/form code only when eligible. */
export function ExitIntentTrigger() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (sessionStorage.getItem('uhome_exit_shown')) return;
    const pageLoadTime = Date.now();
    let lastMouseX = 0;
    const trackMouse = (e: MouseEvent) => { lastMouseX = e.clientX; };
    const canShow = () => {
      if (isLandingCampanha(window.location.pathname)) return false;
      if (document.querySelector('[data-state="open"], [aria-expanded="true"]')) return false;
      if (Date.now() - pageLoadTime < 60000 || sessionStorage.getItem('uhome_exit_shown')) return false;
      const mapEl = document.querySelector('[data-testid="search-map"]');
      return !mapEl || lastMouseX <= mapEl.getBoundingClientRect().left;
    };
    const abrir = () => { if (canShow()) { sessionStorage.setItem('uhome_exit_shown', '1'); setShow(true); } };
    const handleMouseLeave = (e: MouseEvent) => { if (e.clientY <= 0) abrir(); };
    const timer = setTimeout(abrir, 90000);
    document.addEventListener('mousemove', trackMouse);
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => { clearTimeout(timer); document.removeEventListener('mousemove', trackMouse); document.removeEventListener('mouseleave', handleMouseLeave); };
  }, []);
  return show ? <Suspense fallback={null}><Modal /></Suspense> : null;
}