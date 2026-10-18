import type {AvailabilityConfig} from '../lib/availability';
import {publicUrl} from '../lib/publicUrl';

export interface ProfileFact {
  icon: 'pin' | 'globe' | 'calendar';
  label: string;
}

export interface ProfileConfig {
  name: string;
  handle: string;
  // Show the verification badge ONLY if the profile is verified on the platform.
  verified: boolean;
  tagline: string;
  // City (and country) shown under the name and in About me. Leave empty to hide it.
  location: string;
  bio: string[];
  facts: ProfileFact[];
  contentTypes: string[];
  // Greeting shown in the chat preview. It is labelled on the page as a sample, not a live message.
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
  facts: [
    {icon: 'globe', label: 'English, Português, Polski'},
    {icon: 'calendar', label: 'New posts every week'},
  ],
  contentTypes: [
    'Photo sets',
    'Behind the scenes',
    'Travel diaries',
    'Outfit try-ons',
    'Voice notes',
  ],
  chatGreeting:
    "Hey, thanks for stopping by. Tell me where you're writing from, I read every message myself.",
  stats: {photos: 248, videos: 36, likes: 18400},
  avatar: {src: publicUrl('media/avatar.svg'), alt: 'Aria Vale'},
  cover: {src: publicUrl('media/cover.svg'), alt: ''},
  // Must reflect when the creator is actually available. See lib/availability.ts for modes.
  availability: {
    mode: 'manual',
    available: true,
    offlineLabel: 'Usually replies in the evening',
  },
};
