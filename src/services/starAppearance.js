const HOUR = 60 * 60 * 1000;
export const AGE_STEPS = [
  { age: HOUR, radius: 3.2 },
  { age: 24 * HOUR, radius: 2.6 },
  { age: 7 * 24 * HOUR, radius: 1.9 },
  { age: 30 * 24 * HOUR, radius: 1.3 },
];

export function createdAtMillis(star) {
  const value = star.createdAt?.toMillis?.();
  return Number.isFinite(value) ? value : null;
}

export function starPlacedAgo(star, now = Date.now()) {
  const timestamp = createdAtMillis(star);
  if (star.historical || timestamp === null) return null;
  const seconds = Math.max(0, Math.floor((now - timestamp) / 1000));
  if (seconds < 60) return 'Placed just now';
  const units = [[31536000, 'year'], [2592000, 'month'], [86400, 'day'], [3600, 'hour'], [60, 'minute']];
  const [duration, unit] = units.find(([duration]) => seconds >= duration);
  const count = Math.floor(seconds / duration);
  return `Placed ${count} ${unit}${count === 1 ? '' : 's'} ago`;
}

export function starGlareOpacity(star, now = Date.now()) {
  if (star.historical) return 1;
  const timestamp = createdAtMillis(star);
  if (timestamp === null) return 0;
  const age = Math.max(0, now - timestamp);
  return Math.max(0, Math.min(1, (24 * HOUR - age) / HOUR));
}

export function nextGlareChange(stars, now = Date.now()) {
  let next = Infinity;
  for (const star of stars) {
    const timestamp = createdAtMillis(star);
    if (star.historical || timestamp === null) continue;
    const fadeStart = timestamp + 23 * HOUR, fadeEnd = timestamp + 24 * HOUR;
    if (now < fadeStart) next = Math.min(next, fadeStart);
    else if (now < fadeEnd) next = Math.min(next, now + 60000, fadeEnd);
  }
  return next;
}

export function starRadius(star, now = Date.now()) {
  if (star.historical) return 0.55;
  const timestamp = createdAtMillis(star);
  // Unknown dates aren't treated as newly added stars.
  if (timestamp === null) return 0.85;
  const age = Math.max(0, now - timestamp);
  return AGE_STEPS.find((step) => age < step.age)?.radius || 0.85;
}

export function nextSizeChange(stars, now = Date.now()) {
  let next = Infinity;
  for (const star of stars) {
    const timestamp = createdAtMillis(star);
    if (star.historical || timestamp === null) continue;
    for (const step of AGE_STEPS) {
      const boundary = timestamp + step.age;
      if (boundary > now) { next = Math.min(next, boundary); break; }
    }
  }
  return next;
}
