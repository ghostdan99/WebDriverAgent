import {type CSSProperties, useState} from 'react';
import type {MediaItem} from '../config/media';
import {LockIcon, PlayIcon, StackIcon} from './Icons';
import styles from './GalleryGrid.module.css';

interface GalleryGridProps {
  items: MediaItem[];
  onSelect: (item: MediaItem) => void;
  // Changing this replays the entrance animation, e.g. when switching tabs.
  animationKey?: string;
}

function describe(item: MediaItem): string {
  const kind =
    item.kind === 'video'
      ? `video${item.duration ? `, ${item.duration}` : ''}`
      : item.kind === 'set'
        ? `photo set${item.count ? `, ${item.count} photos` : ''}`
        : 'photo';
  return `${item.title}, locked ${kind}${item.isNew ? ', new' : ''}`;
}

export function GalleryGrid({items, onSelect, animationKey}: GalleryGridProps) {
  return (
    <ul className={styles.grid} key={animationKey}>
      {items.map((item, index) => (
        <li key={item.id} style={{'--i': index} as CSSProperties}>
          <MediaTile item={item} onSelect={onSelect} />
        </li>
      ))}
    </ul>
  );
}

function MediaTile({item, onSelect}: {item: MediaItem; onSelect: (item: MediaItem) => void}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <button
      type="button"
      className={styles.tile}
      data-loaded={loaded || undefined}
      aria-label={describe(item)}
      aria-haspopup="dialog"
      onClick={() => onSelect(item)}
    >
      <img
        className={styles.thumb}
        src={item.thumbnail}
        alt=""
        width={400}
        height={500}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        ref={(img) => {
          if (!loaded && img?.complete && img.naturalWidth > 0) {
            setLoaded(true);
          }
        }}
      />
      <span className={styles.shade} aria-hidden="true" />

      <span className={styles.topRow} aria-hidden="true">
        {item.isNew && <span className={styles.newBadge}>New</span>}
        {item.kind === 'set' && (
          <span className={styles.meta}>
            <StackIcon size={14} />
            {item.count}
          </span>
        )}
      </span>

      {item.kind === 'video' ? (
        <span className={styles.play} aria-hidden="true">
          <PlayIcon size={22} />
        </span>
      ) : (
        <span className={styles.lock} aria-hidden="true">
          <LockIcon size={20} />
        </span>
      )}

      {item.kind === 'video' && item.duration && (
        <span className={styles.duration} aria-hidden="true">
          {item.duration}
        </span>
      )}
    </button>
  );
}
