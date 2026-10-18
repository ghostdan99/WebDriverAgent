export interface AvailabilityWindow {
  // 0 = Sunday ... 6 = Saturday, in the configured time zone.
  days: number[];
  // "HH:MM", 24h. A window may cross midnight, e.g. from "21:00" to "01:00".
  from: string;
  to: string;
}

/**
 * - `manual`: the creator (or you) flips `available` to match reality. `lastActiveAt` (ISO date)
 *   drives the "Active 5 min ago" label while unavailable.
 * - `schedule`: "Available now" inside the declared hours, "Active … ago" (counted from the end
 *   of the last window) outside them.
 * - `hidden`: no status is shown at all.
 */
export type AvailabilityConfig =
  | {mode: 'manual'; available: boolean; lastActiveAt?: string; offlineLabel?: string}
  | {mode: 'schedule'; timeZone: string; windows: AvailabilityWindow[]; offlineLabel?: string}
  | {mode: 'hidden'};

export interface Presence {
  available: boolean;
  // "Available now", "Active 5 min ago", the offline label, or null to show nothing.
  label: string | null;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY = 24 * 60;
const WEEK = 7 * DAY;

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

function inWindow({days, from, to}: AvailabilityWindow, day: number, minutes: number): boolean {
  const start = toMinutes(from);
  const end = toMinutes(to);
  if (start <= end) {
    return days.includes(day) && minutes >= start && minutes < end;
  }
  // Crosses midnight: the late part belongs to the listed day, the early part to the next.
  return (
    (days.includes(day) && minutes >= start) || (days.includes((day + 6) % 7) && minutes < end)
  );
}

export function isAvailableNow(config: AvailabilityConfig, now: Date = new Date()): boolean {
  switch (config.mode) {
    case 'hidden':
      return false;
    case 'manual':
      return config.available;
    case 'schedule': {
      try {
        const {day, minutes} = zonedDayAndMinutes(now, config.timeZone);
        return config.windows.some((w) => inWindow(w, day, minutes));
      } catch {
        return false;
      }
    }
  }
}

/** Minutes since the creator was last available (0 while available), or null if unknown. */
export function minutesSinceActive(
  config: AvailabilityConfig,
  now: Date = new Date(),
): number | null {
  if (isAvailableNow(config, now)) {
    return 0;
  }
  switch (config.mode) {
    case 'hidden':
      return null;
    case 'manual': {
      const at = config.lastActiveAt ? Date.parse(config.lastActiveAt) : NaN;
      return Number.isFinite(at) && at <= now.getTime()
        ? Math.floor((now.getTime() - at) / 60_000)
        : null;
    }
    case 'schedule': {
      let current: {day: number; minutes: number};
      try {
        current = zonedDayAndMinutes(now, config.timeZone);
      } catch {
        return null;
      }
      const nowInWeek = current.day * DAY + current.minutes;
      let best: number | null = null;
      for (const {days, from, to} of config.windows) {
        const crossesMidnight = toMinutes(to) < toMinutes(from);
        for (const day of days) {
          const endInWeek = (day + (crossesMidnight ? 1 : 0)) * DAY + toMinutes(to);
          const elapsed = (((nowInWeek - endInWeek) % WEEK) + WEEK) % WEEK;
          if (best === null || elapsed < best) {
            best = elapsed;
          }
        }
      }
      return best;
    }
  }
}

export function formatLastActive(minutes: number): string {
  if (minutes < 1) {
    return 'Active just now';
  }
  if (minutes < 60) {
    return `Active ${minutes} min ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `Active ${hours} h ago`;
  }
  return `Active ${Math.floor(hours / 24)} d ago`;
}

export function getPresence(config: AvailabilityConfig, now: Date = new Date()): Presence {
  if (config.mode === 'hidden') {
    return {available: false, label: null};
  }
  const minutes = minutesSinceActive(config, now);
  if (minutes === 0) {
    return {available: true, label: 'Available now'};
  }
  return {
    available: false,
    label: minutes === null ? (config.offlineLabel ?? null) : formatLastActive(minutes),
  };
}
