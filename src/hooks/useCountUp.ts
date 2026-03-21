import { useEffect, useRef, useState } from "react";

export function useCountUp(target: number, duration = 500) {
  const [count, setCount] = useState(target);
  const prevTarget = useRef(target);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      setCount(target);
      prevTarget.current = target;
      return;
    }
    if (prevTarget.current === target) return;
    const start = prevTarget.current;
    const diff = target - start;
    const startTime = performance.now();

    let raf: number;
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(start + diff * eased));
      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      } else {
        prevTarget.current = target;
      }
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return count;
}
