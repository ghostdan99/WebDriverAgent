import {useEffect, useState} from 'react';

/**
 * Height of the on-screen keyboard (or other UI) covering the bottom of the layout viewport.
 * iOS Safari overlays fixed elements with the keyboard instead of resizing the page, so fixed
 * panels use this to stay above it.
 */
export function useKeyboardInset(active: boolean): number {
  const [inset, setInset] = useState(0);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!active || !vv) {
      return;
    }
    const update = () => {
      setInset(Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop)));
    };
    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
      setInset(0);
    };
  }, [active]);
  return inset;
}
