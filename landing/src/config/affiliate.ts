import type {AffiliateOptions} from '../lib/affiliate';

/**
 * The ONLY place the affiliate link is defined. Every "Join", "Log in", "Create account",
 * "Register to chat" and "Unlock" button on the page is built from this value.
 *
 * Replace the placeholder with the exact link from your affiliate dashboard, or set
 * VITE_AFFILIATE_URL at build time (see .env.example). Existing query parameters in the
 * link are kept verbatim.
 */
export const AFFILIATE_URL: string =
  import.meta.env.VITE_AFFILIATE_URL || 'https://TWOJ-LINK-AFILIACYJNY';

/**
 * Optional tracking parameters. Everything is OFF by default: enable only what your affiliate
 * program documents as supported, otherwise the link may stop attributing sign-ups.
 */
export const AFFILIATE_OPTIONS: AffiliateOptions = {
  // Open the partner platform in a new tab instead of the current one.
  openInNewTab: false,
  utm: {
    enabled: false,
    source: 'creator-landing',
    medium: 'affiliate',
    campaign: 'creator-profile',
    // Put the CTA placement (e.g. "header_join") into utm_content.
    contentFromPlacement: true,
  },
  subId: {
    enabled: false,
    // Use the exact parameter name from your program's docs, e.g. "subid", "sub1" or "aff_sub".
    param: 'subid',
    // Optional static prefix, e.g. "tiktok" -> "tiktok_header_join". Empty = placement only.
    prefix: '',
  },
  // Query parameters this landing page receives that should be passed on to the affiliate link,
  // e.g. ['subid'] so that ?subid=instagram on this page ends up on the sign-up link.
  forwardParams: [],
};
