import {type CSSProperties, type KeyboardEvent, useId, useRef, useState} from 'react';
import {type MediaItem, PHOTOS, VIDEOS} from '../config/media';
import {PROFILE} from '../config/profile';
import {useRegistration} from '../context/registration';
import {track} from '../lib/analytics';
import {formatCount} from '../lib/format';
import {AffiliateLink} from './AffiliateLink';
import {GalleryGrid} from './GalleryGrid';
import {ImageIcon, LockIcon, VideoIcon} from './Icons';
import styles from './ContentTabs.module.css';

type Tab = 'photos' | 'videos';

const TABS: Array<{
  id: Tab;
  label: string;
  icon: typeof ImageIcon;
  items: MediaItem[];
  total: number;
}> = [
  {id: 'photos', label: 'Photos', icon: ImageIcon, items: PHOTOS, total: PROFILE.stats.photos},
  {id: 'videos', label: 'Videos', icon: VideoIcon, items: VIDEOS, total: PROFILE.stats.videos},
];

export function ContentTabs() {
  const baseId = useId();
  const openRegistration = useRegistration();
  const [active, setActive] = useState<Tab>('photos');
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({photos: null, videos: null});
  const activeIndex = TABS.findIndex((tab) => tab.id === active);
  const current = TABS[activeIndex] ?? TABS[0]!;

  const select = (tab: Tab) => {
    if (tab !== active) {
      setActive(tab);
      track('gallery_tab_change', {tab});
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const last = TABS.length - 1;
    const next =
      event.key === 'ArrowRight'
        ? (activeIndex + 1) % TABS.length
        : event.key === 'ArrowLeft'
          ? (activeIndex - 1 + TABS.length) % TABS.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : -1;
    const tab = TABS[next];
    if (!tab) {
      return;
    }
    event.preventDefault();
    select(tab.id);
    tabRefs.current[tab.id]?.focus();
  };

  const selectItem = (item: MediaItem) => {
    track('locked_content_click', {section: 'media', media_type: item.kind, item_id: item.id});
    openRegistration(item.kind);
  };

  return (
    <section aria-labelledby={`${baseId}-title`}>
      <div className={`section-head ${styles.head}`}>
        <div>
          <h2 id={`${baseId}-title`} className="section-title">
            Media
          </h2>
          <p className="section-sub">Previews from the full profile</p>
        </div>
        <div
          role="tablist"
          aria-label="Media type"
          className={styles.segmented}
          style={{'--active': activeIndex} as CSSProperties}
        >
          <span className={styles.thumb} aria-hidden="true" />
          {TABS.map(({id, label, icon: Icon, total}) => (
            <button
              key={id}
              ref={(node) => {
                tabRefs.current[id] = node;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${id}`}
              aria-selected={active === id}
              aria-controls={`${baseId}-panel`}
              tabIndex={active === id ? 0 : -1}
              className={styles.tab}
              onClick={() => select(id)}
              onKeyDown={onKeyDown}
            >
              <Icon size={17} />
              {label}
              <span className={styles.count}>{formatCount(total)}</span>
            </button>
          ))}
        </div>
      </div>

      <div role="tabpanel" id={`${baseId}-panel`} aria-labelledby={`${baseId}-tab-${active}`}>
        <GalleryGrid items={current.items} onSelect={selectItem} animationKey={active} />
      </div>

      <div className={styles.unlock}>
        <span className={styles.unlockIcon} aria-hidden="true">
          <LockIcon size={20} />
        </span>
        <p className={styles.unlockText}>
          <strong>
            {formatCount(PROFILE.stats.photos)} photos and {formatCount(PROFILE.stats.videos)}{' '}
            videos
          </strong>{' '}
          are waiting on the full profile.
        </p>
        <AffiliateLink
          placement="media_join"
          intent="join"
          className={`btn btn-primary ${styles.unlockButton}`}
        >
          Join to view
        </AffiliateLink>
      </div>
    </section>
  );
}
