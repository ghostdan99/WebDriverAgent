import {describe, expect, it} from 'vitest';
import {
  type AvailabilityConfig,
  formatLastActive,
  getPresence,
  isAvailableNow,
  minutesSinceActive,
} from './availability';

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

describe('last active', () => {
  const evenings: AvailabilityConfig = {
    mode: 'schedule',
    timeZone: 'UTC',
    windows: [{days: [1, 2, 3, 4, 5], from: '18:00', to: '23:00'}],
  };

  it('counts minutes from the end of the most recent window', () => {
    expect(minutesSinceActive(evenings, at('2026-10-19T20:00:00Z'))).toBe(0);
    expect(minutesSinceActive(evenings, at('2026-10-19T23:05:00Z'))).toBe(5);
    // Saturday noon: Friday's window ended 13 hours earlier.
    expect(minutesSinceActive(evenings, at('2026-10-24T12:00:00Z'))).toBe(13 * 60);
  });

  it('counts from the next day for windows that cross midnight', () => {
    const late: AvailabilityConfig = {
      mode: 'schedule',
      timeZone: 'UTC',
      windows: [{days: [5], from: '22:00', to: '02:00'}],
    };
    expect(minutesSinceActive(late, at('2026-10-24T02:30:00Z'))).toBe(30);
  });

  it('uses lastActiveAt in manual mode', () => {
    const now = at('2026-10-19T12:00:00Z');
    expect(
      minutesSinceActive(
        {mode: 'manual', available: false, lastActiveAt: '2026-10-19T11:48:00Z'},
        now,
      ),
    ).toBe(12);
    expect(minutesSinceActive({mode: 'manual', available: false}, now)).toBeNull();
    expect(minutesSinceActive({mode: 'manual', available: true}, now)).toBe(0);
  });

  it('formats short and long gaps', () => {
    expect(formatLastActive(0)).toBe('Active just now');
    expect(formatLastActive(5)).toBe('Active 5 min ago');
    expect(formatLastActive(125)).toBe('Active 2 h ago');
    expect(formatLastActive(3 * 24 * 60)).toBe('Active 3 d ago');
  });

  it('builds the status label', () => {
    expect(getPresence(evenings, at('2026-10-19T20:00:00Z'))).toEqual({
      available: true,
      label: 'Available now',
    });
    expect(getPresence(evenings, at('2026-10-19T23:05:00Z'))).toEqual({
      available: false,
      label: 'Active 5 min ago',
    });
    expect(getPresence({mode: 'manual', available: false, offlineLabel: 'Back tonight'})).toEqual({
      available: false,
      label: 'Back tonight',
    });
    expect(getPresence({mode: 'hidden'})).toEqual({available: false, label: null});
  });
});
