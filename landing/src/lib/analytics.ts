import {GA_MEASUREMENT_ID} from '../config/analytics';

export type RegistrationReason = 'photo' | 'set' | 'video' | 'chat' | 'follow';

/**
 * Every event and its allowed parameters. Keeping this typed means message text or other
 * personal data cannot be attached to an event by accident.
 */
export interface AnalyticsEvents {
  profile_view: {profile: string};
  bio_expand: {profile: string};
  gallery_tab_change: {tab: 'photos' | 'videos'};
  locked_content_click: {
    section: 'posts' | 'media';
    media_type: 'photo' | 'set' | 'video';
    item_id: string;
  };
  chat_attempt: {source: 'inline' | 'floating'};
  registration_modal_view: {reason: RegistrationReason};
  affiliate_cta_click: {placement: string; intent: 'join' | 'login'};
}

export type AnalyticsEventName = keyof AnalyticsEvents;

type Listener = <E extends AnalyticsEventName>(name: E, params: AnalyticsEvents[E]) => void;

interface AnalyticsWindow extends Window {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
}

const listeners = new Set<Listener>();
let initialisedId: string | null = null;

/** Subscribes to tracked events (used by tests and for custom integrations). */
export function onTrack(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Sends an event to GA4 / GTM if present. Never throws, even with no analytics configured. */
export function track<E extends AnalyticsEventName>(name: E, params: AnalyticsEvents[E]): void {
  const payload = {...params};
  try {
    const w = window as AnalyticsWindow;
    if (typeof w.gtag === 'function') {
      w.gtag('event', name, payload);
    } else if (Array.isArray(w.dataLayer)) {
      w.dataLayer.push({event: name, ...payload});
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[analytics] failed to send', name, err);
    }
  }
  for (const listener of listeners) {
    try {
      listener(name, payload);
    } catch {
      // A broken listener must not break the page.
    }
  }
  if (import.meta.env.DEV && import.meta.env.MODE !== 'test') {
    console.debug('[analytics]', name, payload);
  }
}

/** Loads gtag.js when a valid GA4 measurement ID is configured. Returns whether it loaded. */
export function initAnalytics(measurementId: string = GA_MEASUREMENT_ID): boolean {
  const id = measurementId.trim();
  if (!id) {
    return false;
  }
  if (!/^G-[A-Z0-9]+$/i.test(id)) {
    if (import.meta.env.DEV) {
      console.warn(`[analytics] "${id}" is not a GA4 measurement ID, analytics disabled`);
    }
    return false;
  }
  if (initialisedId === id) {
    return true;
  }
  try {
    const w = window as AnalyticsWindow;
    w.dataLayer = w.dataLayer || [];
    w.gtag = function gtag() {
      // gtag.js expects the `arguments` object itself, not an array copy.
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer!.push(arguments);
    };
    w.gtag('js', new Date());
    w.gtag('config', id);
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.appendChild(script);
    initialisedId = id;
    return true;
  } catch {
    return false;
  }
}
