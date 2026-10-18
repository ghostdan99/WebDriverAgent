import {useEffect, useState} from 'react';
import {type AvailabilityConfig, getPresence, type Presence} from '../lib/availability';

/** Current status label, refreshed every minute so "Active 5 min ago" keeps counting. */
export function usePresence(config: AvailabilityConfig): Presence {
  const [presence, setPresence] = useState(() => getPresence(config));
  useEffect(() => {
    if (config.mode === 'hidden') {
      return;
    }
    const id = window.setInterval(() => {
      const next = getPresence(config);
      setPresence((prev) =>
        prev.available === next.available && prev.label === next.label ? prev : next,
      );
    }, 60_000);
    return () => window.clearInterval(id);
  }, [config]);
  return presence;
}
