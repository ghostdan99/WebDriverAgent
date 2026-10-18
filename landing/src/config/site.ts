import {publicUrl} from '../lib/publicUrl';

export const SITE = {
  // Wordmark shown in the header and footer.
  brandName: 'nocturne',
  // Name of the platform the affiliate link leads to, used in modal and disclosure copy.
  platformName: 'our partner platform',
  // While true, the page labels the profile figures and status as sample data. Set to false
  // only after every value in config/profile.ts and config/media.ts is real.
  isDemo: true,
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
