import {describe, expect, it} from 'vitest';
import {type AvailabilityConfig, isAvailableNow} from './availability';

// 2026-10-19 is a Monday.
const at = (iso: string) => new Date(iso);

describe('isAvailableNow', () => {
  it('follows the manual switch', () => {
    expect(isAvailableNow({mode: 'manual', available: true})).toBe(true);
    expect(isAvailableNow({mode: 'manual', available: false})).toBe(false);
  });

  it('is never available when hidden', () => {
    expect(isAvailableNow({mode: 'hidden'})).toBe(false);
  });

  it('checks schedule windows in the configured time zone', () => {
    const config: AvailabilityConfig = {
      mode: 'schedule',
      timeZone: 'Europe/Lisbon',
      windows: [{days: [1, 2, 3, 4, 5], from: '19:00', to: '23:00'}],
    };
    // Lisbon is UTC+1 in October (WEST until the last Sunday).
    expect(isAvailableNow(config, at('2026-10-19T18:30:00Z'))).toBe(true);
    expect(isAvailableNow(config, at('2026-10-19T17:30:00Z'))).toBe(false);
    expect(isAvailableNow(config, at('2026-10-18T18:30:00Z'))).toBe(false); // Sunday
  });

  it('supports windows that cross midnight', () => {
    const config: AvailabilityConfig = {
      mode: 'schedule',
      timeZone: 'UTC',
      windows: [{days: [5], from: '22:00', to: '02:00'}],
    };
    expect(isAvailableNow(config, at('2026-10-23T23:00:00Z'))).toBe(true); // Friday night
    expect(isAvailableNow(config, at('2026-10-24T01:30:00Z'))).toBe(true); // early Saturday
    expect(isAvailableNow(config, at('2026-10-24T02:00:00Z'))).toBe(false);
    expect(isAvailableNow(config, at('2026-10-25T01:00:00Z'))).toBe(false); // early Sunday
  });

  it('treats an invalid time zone as unavailable', () => {
    expect(
      isAvailableNow({
        mode: 'schedule',
        timeZone: 'Not/AZone',
        windows: [{days: [1], from: '00:00', to: '23:59'}],
      }),
    ).toBe(false);
  });
});
