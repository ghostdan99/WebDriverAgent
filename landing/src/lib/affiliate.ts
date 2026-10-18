import {AFFILIATE_OPTIONS, AFFILIATE_URL} from '../config/affiliate';

export type CtaIntent = 'join' | 'login';

export interface AffiliateOptions {
  openInNewTab: boolean;
  utm: {
    enabled: boolean;
    source: string;
    medium: string;
    campaign: string;
    contentFromPlacement: boolean;
  };
  subId: {
    enabled: boolean;
    param: string;
    prefix: string;
  };
  forwardParams: string[];
}

interface BuildOptions {
  baseUrl?: string;
  options?: AffiliateOptions;
  // Query string of the current landing page, used for `forwardParams`.
  currentSearch?: string;
}

/**
 * Builds the outgoing link for a CTA. Parameters already present in the affiliate link are never
 * changed or re-encoded; configured extras are appended only when the link does not carry them.
 */
export function buildAffiliateUrl(placement: string, build: BuildOptions = {}): string {
  const {
    baseUrl = AFFILIATE_URL,
    options = AFFILIATE_OPTIONS,
    currentSearch = typeof window === 'undefined' ? '' : window.location.search,
  } = build;

  let existing: URLSearchParams;
  try {
    existing = new URL(baseUrl).searchParams;
  } catch {
    return baseUrl;
  }

  const extra = new URLSearchParams();
  const add = (key: string, value: string | null | undefined) => {
    if (key && value && !existing.has(key) && !extra.has(key)) {
      extra.set(key, value);
    }
  };

  if (options.forwardParams.length > 0) {
    const incoming = new URLSearchParams(currentSearch);
    for (const key of options.forwardParams) {
      add(key, incoming.get(key));
    }
  }
  if (options.utm.enabled) {
    add('utm_source', options.utm.source);
    add('utm_medium', options.utm.medium);
    add('utm_campaign', options.utm.campaign);
    if (options.utm.contentFromPlacement) {
      add('utm_content', placement);
    }
  }
  if (options.subId.enabled) {
    add(options.subId.param, [options.subId.prefix, placement].filter(Boolean).join('_'));
  }

  const query = extra.toString();
  if (!query) {
    return baseUrl;
  }
  const hashIndex = baseUrl.indexOf('#');
  const beforeHash = hashIndex === -1 ? baseUrl : baseUrl.slice(0, hashIndex);
  const hash = hashIndex === -1 ? '' : baseUrl.slice(hashIndex);
  const separator = !beforeHash.includes('?') ? '?' : /[?&]$/.test(beforeHash) ? '' : '&';
  return `${beforeHash}${separator}${query}${hash}`;
}

export function isPlaceholderAffiliateUrl(url: string = AFFILIATE_URL): boolean {
  return url.includes('TWOJ-LINK-AFILIACYJNY');
}

export const affiliateLinkTarget = () =>
  AFFILIATE_OPTIONS.openInNewTab ? {target: '_blank' as const} : {};
