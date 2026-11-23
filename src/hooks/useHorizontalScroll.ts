import { useEffect, useRef } from 'react';

/** Lets a horizontally-scrolling bar (overflow-x-auto) respond to a plain mouse: a
 *  trackpad's two-finger swipe already produces a native horizontal scroll delta, but an
 *  ordinary mouse wheel only has a vertical one, and there's no click-and-drag support
 *  out of the box at all. This adds both. A drag past a small threshold also suppresses
 *  the click that would otherwise fire on mouseup, so dragging never accidentally
 *  activates a category/filter button underneath the pointer. */
export function useHorizontalScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; // already horizontal input
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    let dragging = false;
    let moved = false;
    let startX = 0;
    let startScrollLeft = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return; // touch/pen already scroll natively
      dragging = true;
      moved = false;
      startX = e.clientX;
      startScrollLeft = el.scrollLeft;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      if (moved) {
        el.scrollLeft = startScrollLeft - dx;
        el.style.cursor = 'grabbing';
      }
    };
    const endDrag = () => {
      dragging = false;
      el.style.cursor = '';
    };
    const onClickCapture = (e: MouseEvent) => {
      if (moved) {
        e.stopPropagation();
        moved = false;
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', endDrag);
    el.addEventListener('click', onClickCapture, true);

    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', endDrag);
      el.removeEventListener('click', onClickCapture, true);
    };
  }, []);

  return ref;
}
