import {useId, useLayoutEffect, useRef, useState} from 'react';
import {PROFILE} from '../config/profile';
import {track} from '../lib/analytics';
import styles from './ProfileBio.module.css';

/** The profile bio under the name: a few lines, expandable with Read more / Show less. */
export function ProfileBio() {
  const bioId = useId();
  const clipRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [fullHeight, setFullHeight] = useState(0);
  const [overflows, setOverflows] = useState(true);
  const paragraphs = [PROFILE.tagline, ...PROFILE.bio];

  // Measure the full text so the expand animation has a real target height, and hide the toggle
  // when the bio already fits in the collapsed lines.
  useLayoutEffect(() => {
    const clip = clipRef.current;
    const inner = innerRef.current;
    if (!clip || !inner) {
      return;
    }
    const measure = () => {
      const full = inner.offsetHeight;
      setFullHeight(full);
      if (!clip.hasAttribute('data-expanded')) {
        // Layout-less environments report 0; keep the toggle available there.
        setOverflows(full === 0 || full > clip.clientHeight + 1);
      }
    };
    measure();
    if (typeof ResizeObserver === 'undefined') {
      return;
    }
    const observer = new ResizeObserver(measure);
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    if (!expanded) {
      track('bio_expand', {profile: PROFILE.handle});
    }
    setExpanded(!expanded);
  };

  return (
    <div className={styles.bio}>
      <div
        ref={clipRef}
        id={bioId}
        className={styles.clip}
        data-expanded={expanded || undefined}
        data-overflows={overflows || undefined}
        style={expanded ? {maxHeight: fullHeight > 0 ? fullHeight : 'none'} : undefined}
      >
        <div ref={innerRef} className={styles.text}>
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
      {overflows && (
        <button
          type="button"
          className={`text-link ${styles.toggle}`}
          aria-expanded={expanded}
          aria-controls={bioId}
          onClick={toggle}
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
}
