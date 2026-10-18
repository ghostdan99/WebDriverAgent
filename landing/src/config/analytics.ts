/**
 * GA4 measurement ID (format "G-XXXXXXXXXX"), read from VITE_GA_MEASUREMENT_ID at build time.
 * Leave it empty to disable GA4: events are then only pushed to an existing `dataLayer`
 * (e.g. Google Tag Manager) or dropped silently.
 *
 * If your visitors are in the EU/UK, load analytics only after consent from your CMP.
 */
export const GA_MEASUREMENT_ID: string = import.meta.env.VITE_GA_MEASUREMENT_ID ?? '';
