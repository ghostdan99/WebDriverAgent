import {type RefObject, useEffect, useState} from 'react';

export function useInView(ref: RefObject<Element | null>, rootMargin = '0px'): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting)),
      {
        rootMargin,
      },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, rootMargin]);
  return inView;
}
