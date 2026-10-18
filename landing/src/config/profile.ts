import type {AvailabilityConfig} from '../lib/availability';
import {publicUrl} from '../lib/publicUrl';

export interface ProfileConfig {
  name: string;
  handle: string;
  // Show the verification badge ONLY if the profile is verified on the platform.
  verified: boolean;
  // First lines of the bio, always visible; also the share text.
  tagline: string;
  // City (and country) shown next to the handle. Leave empty to hide it.
  location: string;
  // Rest of the bio, revealed with "Read more".
  bio: string[];
  // First message shown in the chat preview.
  chatGreeting: string;
  stats: {photos: number; videos: number; likes: number};
  avatar: {src: string; alt: string};
  cover: {src: string; alt: string};
  availability: AvailabilityConfig;
}

// Sample persona. Replace every field with the creator's real details before launch.
export const PROFILE: ProfileConfig = {
  name: 'Aria Vale',
  handle: 'ariavale',
  verified: false,
  tagline:
    'Film photographer and slow traveller. Studio days, road notes and everything in between.',
  location: 'Lisbon, Portugal',
  bio: [
    "Hi, I'm Aria. I shoot on film, live out of a carry-on half the year and spend the other half in a tiny studio in Lisbon with far too many plants.",
    "This is where I post what doesn't make it to my public feed: full photo sets, behind-the-scenes clips from shoots, outfit try-ons and the occasional voice note when I'm too tired to type.",
    "I read every message myself. I'm usually around in the evenings, Lisbon time, so if I don't answer straight away I'll get back to you. Be kind, be curious, and tell me where you're writing from.",
  ],
  chatGreeting:
    "Hey, thanks for stopping by. Tell me where you're writing from, I read every message myself.",
  stats: {photos: 248, videos: 36, likes: 18400},
  avatar: {src: publicUrl('media/avatar.svg'), alt: 'Aria Vale'},
  cover: {src: publicUrl('media/cover.svg'), alt: ''},
  // Must match when the creator is actually around. See lib/availability.ts for the modes.
  availability: {
    mode: 'schedule',
    timeZone: 'Europe/Lisbon',
    windows: [
      {days: [0, 1, 2, 3, 4, 5, 6], from: '10:00', to: '13:00'},
      {days: [0, 1, 2, 3, 4, 5, 6], from: '18:00', to: '01:00'},
    ],
  },
};
