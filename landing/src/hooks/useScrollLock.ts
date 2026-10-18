import {useEffect} from 'react';

let locks = 0;

/** Stops the page behind an overlay from scrolling. `scrollbar-gutter` prevents layout shift. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) {
      return;
    }
    const root = document.documentElement;
    locks += 1;
    root.style.overflow = 'hidden';
    return () => {
      locks -= 1;
      if (locks === 0) {
        root.style.overflow = '';
      }
    };
  }, [active]);
}
