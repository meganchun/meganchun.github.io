import React, { useEffect, useState } from 'react';

import { locations } from '../types/location';

/** @param {{ location: import('../types/location').LocationType }} props */
export default function CurrentLocationTime({ location }) {
  const { label, timeZone } = locations[location];
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone, hour: 'numeric', minute: '2-digit', hour12: true,
  });
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const update = () => setNow(new Date());
    let timer;
    const tick = () => {
      update();
      timer = setTimeout(tick, 60000 - Date.now() % 60000);
    };
    tick();
    const visible = () => { if (!document.hidden) update(); };
    document.addEventListener('visibilitychange', visible);
    return () => { clearTimeout(timer); document.removeEventListener('visibilitychange', visible); };
  }, []);
  return <span className="footer-location">{label} · <time dateTime={now.toISOString()} aria-label={`${location} local time: ${formatter.format(now)}`}>{formatter.format(now)}</time></span>;
}
