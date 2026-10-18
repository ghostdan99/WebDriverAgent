import {publicUrl} from '../lib/publicUrl';

// Locked previews. `thumbnail` must point to a low-resolution, pre-blurred image: the browser
// downloads whatever is linked here, so never reference the full-size original.
export type MediaKind = 'photo' | 'set' | 'video';

export interface MediaItem {
  id: string;
  kind: MediaKind;
  thumbnail: string;
  // Short, non-explicit description used for the tile's accessible label.
  title: string;
  // Number of photos in a set.
  count?: number;
  // Video length, e.g. "2:14".
  duration?: string;
  isNew?: boolean;
}

const pad = (n: number) => String(n).padStart(2, '0');

export const LATEST_POSTS: MediaItem[] = [
  {
    id: 'post-01',
    kind: 'set',
    thumbnail: publicUrl(`media/post-01.svg`),
    title: 'Golden hour on the rooftop',
    count: 14,
    isNew: true,
  },
  {
    id: 'post-02',
    kind: 'video',
    thumbnail: publicUrl(`media/post-02.svg`),
    title: 'Studio day, behind the scenes',
    duration: '3:42',
  },
  {
    id: 'post-03',
    kind: 'photo',
    thumbnail: publicUrl(`media/post-03.svg`),
    title: 'Morning light in Lisbon',
  },
  {
    id: 'post-04',
    kind: 'set',
    thumbnail: publicUrl(`media/post-04.svg`),
    title: 'Autumn outfit try-on',
    count: 9,
  },
  {
    id: 'post-05',
    kind: 'photo',
    thumbnail: publicUrl(`media/post-05.svg`),
    title: 'Film roll from Porto',
  },
  {
    id: 'post-06',
    kind: 'video',
    thumbnail: publicUrl(`media/post-06.svg`),
    title: 'Voice note and a sunset walk',
    duration: '1:58',
  },
];

const PHOTO_TITLES = [
  'Window light portrait',
  'Night market colours',
  'Studio test shots',
  'Beach house weekend',
  'Black dress series',
  'Late breakfast',
  'Hotel room mirror set',
  'Garden in the rain',
  'Rooftop at dusk',
];

export const PHOTOS: MediaItem[] = PHOTO_TITLES.map((title, i) => ({
  id: `photo-${pad(i + 1)}`,
  kind: i % 3 === 0 ? 'set' : 'photo',
  thumbnail: publicUrl(`media/photo-${pad(i + 1)}.svg`),
  title,
  count: i % 3 === 0 ? 8 + i : undefined,
}));

const VIDEO_ITEMS: Array<[string, string]> = [
  ['Get ready with me', '6:12'],
  ['Shoot day vlog', '12:47'],
  ['Q&A from the balcony', '8:05'],
  ['Outfit try-on haul', '4:30'],
  ['Weekend in Sintra', '9:18'],
  ['Studio playlist session', '2:54'],
];

export const VIDEOS: MediaItem[] = VIDEO_ITEMS.map(([title, duration], i) => ({
  id: `video-${pad(i + 1)}`,
  kind: 'video',
  thumbnail: publicUrl(`media/video-${pad(i + 1)}.svg`),
  title,
  duration,
  isNew: i === 0,
}));
