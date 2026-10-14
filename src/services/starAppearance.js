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
