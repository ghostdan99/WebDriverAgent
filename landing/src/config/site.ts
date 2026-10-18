import {publicUrl} from '../lib/publicUrl';

export const SITE = {
  // Wordmark shown in the header and footer.
  brandName: 'nocturne',
  // Name of the platform the affiliate link leads to, used in modal copy.
  platformName: 'our partner platform',
  // Creating an account on the platform costs nothing, so CTAs say "Join free" and similar.
  freeSignup: true,
  // The creator's profile can be unlocked without paying. Set to false if the subscription is paid,
  // otherwise the page promises something the platform does not offer.
  freeUnlock: true,
  ageGate: {
    // Keep enabled whenever the linked platform hosts adult content.
    enabled: true,
    minimumAge: 18,
    rememberDays: 30,
    exitUrl: 'https://www.google.com',
  },
  legal: {
    privacyUrl: publicUrl('privacy.html'),
    termsUrl: publicUrl('terms.html'),
    // Optional contact address shown in the footer. Leave empty to hide it.
    contactEmail: '',
  },
} as const;
