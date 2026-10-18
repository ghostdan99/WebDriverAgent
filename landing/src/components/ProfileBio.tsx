import {useId, useLayoutEffect, useRef, useState} from 'react';
import {type ProfileFact, PROFILE} from '../config/profile';
import {track} from '../lib/analytics';
import {CalendarIcon, GlobeIcon, PinIcon} from './Icons';
import styles from './ProfileBio.module.css';

const FACT_ICONS: Record<ProfileFact['icon'], typeof PinIcon> = {
  pin: PinIcon,
  globe: GlobeIcon,
  calendar: CalendarIcon,
};

export function ProfileBio() {
  const bioId = useId();
  const clipRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [fullHeight, setFullHeight] = useState(0);
  const [overflows, setOverflows] = useState(true);

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

  const facts: ProfileFact[] = PROFILE.location
    ? [{icon: 'pin', label: PROFILE.location}, ...PROFILE.facts]
    : PROFILE.facts;

  const toggle = () => {
    if (!expanded) {
      track('bio_expand', {profile: PROFILE.handle});
    }
    setExpanded(!expanded);
  };

  return (
    <section className={`card ${styles.about}`} aria-labelledby="about-title">
      <h2 id="about-title" className={styles.title}>
        About me
      </h2>

      <div
        ref={clipRef}
        id={bioId}
        className={styles.clip}
        data-expanded={expanded || undefined}
        data-overflows={overflows || undefined}
        style={expanded ? {maxHeight: fullHeight > 0 ? fullHeight : 'none'} : undefined}
      >
        <div ref={innerRef} className={styles.text}>
          {PROFILE.bio.map((paragraph) => (
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

      <ul className={styles.facts}>
        {facts.map((fact) => {
          const Icon = FACT_ICONS[fact.icon];
          return (
            <li key={fact.label}>
              <Icon size={18} />
              {fact.label}
            </li>
          );
        })}
      </ul>

      <h3 className={styles.subTitle}>On my page</h3>
      <ul className={styles.tags} aria-label="Content on this profile">
        {PROFILE.contentTypes.map((type) => (
          <li key={type} className="chip">
            {type}
          </li>
        ))}
      </ul>
    </section>
  );
}
