import {describe, expect, it} from 'vitest';
import {type AffiliateOptions, buildAffiliateUrl, isPlaceholderAffiliateUrl} from './affiliate';

const off: AffiliateOptions = {
  openInNewTab: false,
  utm: {enabled: false, source: 's', medium: 'm', campaign: 'c', contentFromPlacement: true},
  subId: {enabled: false, param: 'subid', prefix: ''},
  forwardParams: [],
};

const withOptions = (patch: Partial<AffiliateOptions>): AffiliateOptions => ({...off, ...patch});

describe('buildAffiliateUrl', () => {
  it('returns the configured link untouched when no extras are enabled', () => {
    const base = 'https://partner.example/r/Abc?ref=Creator%20One&x=a+b#signup';
    expect(buildAffiliateUrl('hero_unlock', {baseUrl: base, options: off, currentSearch: ''})).toBe(
      base,
    );
  });

  it('appends UTM tags and keeps existing parameters and the hash verbatim', () => {
    const base = 'https://partner.example/r?ref=Creator%20One#signup';
    const url = buildAffiliateUrl('header_join', {
      baseUrl: base,
      options: withOptions({utm: {...off.utm, enabled: true}}),
      currentSearch: '',
    });
    expect(url).toBe(
      'https://partner.example/r?ref=Creator%20One&utm_source=s&utm_medium=m&utm_campaign=c&utm_content=header_join#signup',
    );
  });

  it('never overrides parameters that are already part of the affiliate link', () => {
    const url = buildAffiliateUrl('header_join', {
      baseUrl: 'https://partner.example/r?utm_source=partner&subid=fixed',
      options: withOptions({
        utm: {...off.utm, enabled: true, contentFromPlacement: false},
        subId: {enabled: true, param: 'subid', prefix: ''},
      }),
      currentSearch: '',
    });
    const params = new URL(url).searchParams;
    expect(params.getAll('utm_source')).toEqual(['partner']);
    expect(params.getAll('subid')).toEqual(['fixed']);
    expect(params.get('utm_medium')).toBe('m');
  });

  it('builds a SubID from the prefix and the CTA placement', () => {
    const url = buildAffiliateUrl('modal_chat_join', {
      baseUrl: 'https://partner.example/r',
      options: withOptions({subId: {enabled: true, param: 'aff_sub', prefix: 'tiktok'}}),
      currentSearch: '',
    });
    expect(url).toBe('https://partner.example/r?aff_sub=tiktok_modal_chat_join');
  });

  it('forwards only the whitelisted incoming parameters, ahead of configured defaults', () => {
    const url = buildAffiliateUrl('hero_unlock', {
      baseUrl: 'https://partner.example/r',
      options: withOptions({
        forwardParams: ['utm_source', 'subid'],
        utm: {...off.utm, enabled: true, contentFromPlacement: false},
      }),
      currentSearch: '?utm_source=instagram&subid=story3&email=someone%40example.com',
    });
    const params = new URL(url).searchParams;
    expect(params.get('utm_source')).toBe('instagram');
    expect(params.get('subid')).toBe('story3');
    expect(params.has('email')).toBe(false);
  });

  it('handles links that end with ? or &', () => {
    const options = withOptions({subId: {enabled: true, param: 'subid', prefix: ''}});
    expect(
      buildAffiliateUrl('p', {baseUrl: 'https://a.example/?', options, currentSearch: ''}),
    ).toBe('https://a.example/?subid=p');
    expect(
      buildAffiliateUrl('p', {baseUrl: 'https://a.example/?a=1&', options, currentSearch: ''}),
    ).toBe('https://a.example/?a=1&subid=p');
  });

  it('returns an unparsable value as-is instead of throwing', () => {
    expect(buildAffiliateUrl('p', {baseUrl: 'not a url', options: off, currentSearch: ''})).toBe(
      'not a url',
    );
  });

  it('detects the placeholder link', () => {
    expect(isPlaceholderAffiliateUrl('https://TWOJ-LINK-AFILIACYJNY')).toBe(true);
    expect(isPlaceholderAffiliateUrl('https://partner.example/r')).toBe(false);
  });
});
