import type {ReactNode} from 'react';
import {PROFILE} from '../config/profile';
import {formatCount} from '../lib/format';
import {HeartIcon, ImageIcon, VideoIcon} from './Icons';
import styles from './ProfileStats.module.css';

export function ProfileStats() {
  const {photos, videos, likes} = PROFILE.stats;
  const items: Array<{label: string; value: number; icon: ReactNode}> = [
    {label: 'Photos', value: photos, icon: <ImageIcon size={17} />},
    {label: 'Videos', value: videos, icon: <VideoIcon size={17} />},
    {label: 'Likes', value: likes, icon: <HeartIcon size={17} />},
  ];
  return (
    <dl className={styles.stats}>
      {items.map((item) => (
        <div key={item.label} className={styles.item}>
          <dt className={styles.label}>
            {item.icon}
            {item.label}
          </dt>
          <dd className={styles.value}>{formatCount(item.value)}</dd>
        </div>
      ))}
    </dl>
  );
}
