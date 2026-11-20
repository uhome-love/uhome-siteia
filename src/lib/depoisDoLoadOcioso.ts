/** Defers optional startup work, with cancellation and a fallback for Safari. */
export function depoisDoLoadOcioso(iniciar: () => void): () => void {
  let idle: number | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const agendar = () => {
    if (window.requestIdleCallback) idle = window.requestIdleCallback(iniciar, { timeout: 3000 });
    else timer = setTimeout(iniciar, 1500);
  };
  if (document.readyState === 'complete') agendar();
  else window.addEventListener('load', agendar, { once: true });
  return () => {
    window.removeEventListener('load', agendar);
    if (idle !== undefined) window.cancelIdleCallback?.(idle);
    if (timer !== undefined) clearTimeout(timer);
  };
}