import { useRef } from "react";
import type { PointerEvent } from "react";

const swipeCloseDistance = 96;
// A flick faster than this (px per ms) closes the sheet even when it moved only a little.
const swipeCloseVelocity = 0.5;
const swipeFlickMinimum = 16;
// Dragging up past the top gives a little and resists, instead of stopping dead.
const overDragDamping = 0.2;
const sheetPanelSelector = '[data-slot="sheet-content"]';
const springBack = "translate var(--motion-slow) var(--motion-ease-spring)";

const sheetPanelOf = (target: HTMLElement) =>
  target.closest<HTMLElement>(sheetPanelSelector);

const startsOnControl = (target: EventTarget) =>
  target instanceof Element && target.closest("button, a, input, textarea, select") !== null;

// Drags the bottom sheet with the finger; past a distance or on a flick it closes,
// otherwise it springs back into place.
export const useSwipeToClose = (onClose: () => void) => {
  const startY = useRef<number | null>(null);
  const last = useRef({ y: 0, time: 0, velocity: 0 });

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    if (startsOnControl(event.target)) return;
    startY.current = event.clientY;
    last.current = { y: event.clientY, time: event.timeStamp, velocity: 0 };
    event.currentTarget.setPointerCapture(event.pointerId);
    sheetPanelOf(event.currentTarget)?.style.setProperty("transition", "none");
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (startY.current === null) return;
    const elapsed = event.timeStamp - last.current.time;
    if (elapsed > 0) {
      last.current = {
        y: event.clientY,
        time: event.timeStamp,
        velocity: (event.clientY - last.current.y) / elapsed,
      };
    }
    const delta = event.clientY - startY.current;
    const offset = delta < 0 ? delta * overDragDamping : delta;
    sheetPanelOf(event.currentTarget)?.style.setProperty("translate", `0 ${offset}px`);
  };

  const handlePointerEnd = (event: PointerEvent<HTMLElement>) => {
    if (startY.current === null) return;
    const offset = event.clientY - startY.current;
    const flicked = last.current.velocity > swipeCloseVelocity && offset > swipeFlickMinimum;
    startY.current = null;
    const panel = sheetPanelOf(event.currentTarget);
    panel?.style.removeProperty("transition");

    if (offset > swipeCloseDistance || flicked) {
      onClose();
      return;
    }

    if (!panel) return;
    panel.style.setProperty("transition", springBack);
    panel.style.removeProperty("translate");
    panel.addEventListener("transitionend", () => panel.style.removeProperty("transition"), {
      once: true,
    });
  };

  return {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerEnd,
    onPointerCancel: handlePointerEnd,
  };
};
