import { useEffect, useLayoutEffect, useRef } from "react";
import { motionDuration, motionEase, prefersReducedMotion } from "../../utils/motion.utils";

const countUpDuration = 600;

const easeOutCubic = (progress: number) => 1 - (1 - progress) ** 3;

// Counts the element's text from the last shown value (0 on mount) up to `value`.
// React renders the final text; only that text node's value is animated, so the DOM
// always settles on what React rendered and screen readers read the real figure.
// `bump` also springs the element on every change after the first.
export const useCountUp = <E extends HTMLElement>(
  value: number,
  format: (value: number) => string,
  bump = false,
) => {
  const ref = useRef<E>(null);
  const shown = useRef(0);
  const formatRef = useRef(format);

  useEffect(() => {
    formatRef.current = format;
  });

  // Layout effect: the first frame is written before paint, so the final figure never flashes.
  useLayoutEffect(() => {
    const element = ref.current;
    const text = element?.firstChild;
    const from = shown.current;
    if (bump && from !== 0 && from !== value && !prefersReducedMotion()) {
      element?.animate([{ scale: 1 }, { scale: 1.12 }, { scale: 1 }], {
        duration: motionDuration("slow"),
        easing: motionEase("spring"),
      });
    }
    if (!(text instanceof Text) || from === value || prefersReducedMotion()) {
      shown.current = value;
      return;
    }

    const whole = Number.isInteger(value);
    const show = (figure: number) => formatRef.current(whole ? Math.round(figure) : figure);
    const final = formatRef.current(value);
    const start = performance.now();
    let frame = 0;

    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / countUpDuration);
      const current = from + (value - from) * easeOutCubic(progress);
      // A change mid-count continues from the figure on screen.
      shown.current = progress < 1 ? current : value;
      text.nodeValue = progress < 1 ? show(current) : final;
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    text.nodeValue = show(from);
    frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
      text.nodeValue = final;
    };
  }, [bump, value]);

  return ref;
};
