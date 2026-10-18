import {afterEach, describe, expect, it, vi} from 'vitest';
import {initAnalytics, onTrack, track} from './analytics';

type W = Window & {gtag?: unknown; dataLayer?: unknown[]};

afterEach(() => {
  delete (window as W).gtag;
  delete (window as W).dataLayer;
  document.head.querySelectorAll('script[src*="googletagmanager"]').forEach((s) => s.remove());
});

describe('analytics', () => {
  it('does not throw when no analytics is configured', () => {
    expect(() => track('profile_view', {profile: 'x'})).not.toThrow();
    expect(initAnalytics('')).toBe(false);
  });

  it('sends events through gtag when present', () => {
    const gtag = vi.fn();
    (window as W).gtag = gtag;
    track('affiliate_cta_click', {placement: 'header_join', intent: 'join'});
    expect(gtag).toHaveBeenCalledWith('event', 'affiliate_cta_click', {
      placement: 'header_join',
      intent: 'join',
    });
  });

  it('falls back to a GTM dataLayer', () => {
    const dataLayer: unknown[] = [];
    (window as W).dataLayer = dataLayer;
    track('gallery_tab_change', {tab: 'videos'});
    expect(dataLayer).toEqual([{event: 'gallery_tab_change', tab: 'videos'}]);
  });

  it('survives a throwing gtag and notifies listeners', () => {
    (window as W).gtag = () => {
      throw new Error('blocked');
    };
    const listener = vi.fn();
    const off = onTrack(listener);
    expect(() => track('chat_attempt', {source: 'inline'})).not.toThrow();
    expect(listener).toHaveBeenCalledWith('chat_attempt', {source: 'inline'});
    off();
  });

  it('rejects IDs that are not GA4 measurement IDs', () => {
    expect(initAnalytics('UA-12345-1')).toBe(false);
    expect(document.querySelector('script[src*="googletagmanager"]')).toBeNull();
  });

  it('loads gtag.js for a valid measurement ID', () => {
    expect(initAnalytics('G-TEST123')).toBe(true);
    expect(
      document.querySelector('script[src*="googletagmanager"]')?.getAttribute('src'),
    ).toContain('G-TEST123');
    expect(typeof (window as W).gtag).toBe('function');
  });
});
