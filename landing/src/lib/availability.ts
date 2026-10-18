export interface AvailabilityWindow {
  // 0 = Sunday ... 6 = Saturday, in the configured time zone.
  days: number[];
  // "HH:MM", 24h. A window may cross midnight, e.g. from "21:00" to "01:00".
  from: string;
  to: string;
}

/**
 * - `manual`: the creator (or you) flips `available` to match reality.
 * - `schedule`: "Available now" shows only inside the declared hours.
 * - `hidden`: no status is shown at all.
 */
export type AvailabilityConfig =
  | {mode: 'manual'; available: boolean; offlineLabel?: string}
  | {mode: 'schedule'; timeZone: string; windows: AvailabilityWindow[]; offlineLabel?: string}
  | {mode: 'hidden'};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const toMinutes = (hhmm: string) => {
  const [h = '0', m = '0'] = hhmm.split(':');
  return Number(h) * 60 + Number(m);
};

function zonedDayAndMinutes(date: Date, timeZone: string): {day: number; minutes: number} {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return {
    day: WEEKDAYS.indexOf(get('weekday')),
    minutes: (Number(get('hour')) % 24) * 60 + Number(get('minute')),
  };
}

export function isAvailableNow(config: AvailabilityConfig, now: Date = new Date()): boolean {
  switch (config.mode) {
    case 'hidden':
      return false;
    case 'manual':
      return config.available;
    case 'schedule': {
      let current: {day: number; minutes: number};
      try {
        current = zonedDayAndMinutes(now, config.timeZone);
      } catch {
        return false;
      }
      return config.windows.some(({days, from, to}) => {
        const start = toMinutes(from);
        const end = toMinutes(to);
        if (start <= end) {
          return days.includes(current.day) && current.minutes >= start && current.minutes < end;
        }
        // Crosses midnight: the late part belongs to the listed day, the early part to the next.
        const previousDay = (current.day + 6) % 7;
        return (
          (days.includes(current.day) && current.minutes >= start) ||
          (days.includes(previousDay) && current.minutes < end)
        );
      });
    }
  }
}
