import {useEffect, useState} from 'react';
import {type AvailabilityConfig, isAvailableNow} from '../lib/availability';

export function useAvailability(config: AvailabilityConfig): boolean {
  const [available, setAvailable] = useState(() => isAvailableNow(config));
  useEffect(() => {
    if (config.mode !== 'schedule') {
      return;
    }
    const id = window.setInterval(() => setAvailable(isAvailableNow(config)), 60_000);
    return () => window.clearInterval(id);
  }, [config]);
  return available;
}
