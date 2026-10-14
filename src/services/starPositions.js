import { createdAtMillis } from './starAppearance';

// An illustrated sky projection of geography, not astronomical RA/Dec.
export function locationToStar(location) {
  const latitude = location?.latitude;
  const longitude = location?.longitude;
  if (typeof latitude !== "number" || typeof longitude !== "number"
    || !Number.isFinite(latitude) || !Number.isFinite(longitude)
    || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return { x: 0.5, y: 0.9, located: false };
  }
  return { x: (longitude + 180) / 360, y: (90 - latitude) / 180, located: true };
}

export function starOffset(id) {
  let hash = 2166136261;
  for (const character of id) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0;
  const random = () => {
    hash = (hash + 0x6d2b79f5) >>> 0;
    let value = Math.imul(hash ^ (hash >>> 15), 1 | hash);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
  // Soft, independent tails instead of a fixed radius with a circular boundary.
  const radius = Math.sqrt(-2 * Math.log(Math.max(random(), 1e-9)));
  const angle = random() * Math.PI * 2;
  return { x: Math.cos(angle) * radius * 18, y: Math.sin(angle) * radius * 10,
    u: random(), v: random() };
}

export function projectStar(star, width, height) {
  const offset = starOffset(star.id);
  let x, y;
  if (!star.located) {
    // Unknown locations cover the whole field, not a disc or invented city.
    x = offset.u * width;
    y = offset.v * height;
  } else {
    const spreadX = star.historical ? width * 0.2 / 18 : 1.8;
    const spreadY = star.historical ? height * 0.3 / 10 : 1.8;
    x = star.x * width + offset.x * spreadX + offset.y * (star.historical ? width * 0.008 : 0.4);
    y = star.y * height + offset.y * spreadY;
  }
  // Wrap horizontally and reflect vertically, rather than pile up at clamped edges.
  const spanX = Math.max(1, width - 8), spanY = Math.max(1, height - 8);
  const wrappedX = ((x - 4) % spanX + spanX) % spanX;
  const reflectedY = ((y - 4) % (2 * spanY) + 2 * spanY) % (2 * spanY);
  return { ...star, px: 4 + wrappedX, py: 4 + (reflectedY <= spanY ? reflectedY : 2 * spanY - reflectedY) };
}

export function projectSkyStars(stars, width, height) {
  const projected = stars.map((star) => projectStar(star, width, height));
  const visitors = projected.filter((star) => !star.historical)
    .sort((a, b) => (createdAtMillis(a) ?? 0) - (createdAtMillis(b) ?? 0) || a.id.localeCompare(b.id));
  const clearance = Math.min(70, Math.max(40, width * .12));
  const reach = Math.min(210, width * .35, height * .28);
  const cells = new Map();
  const margin = Math.min(24, width / 4, height / 4);
  function separation(x, y) {
    const bx = Math.floor(x / clearance), by = Math.floor(y / clearance);
    let nearest = clearance;
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
      for (const other of cells.get(`${bx + dx},${by + dy}`) || []) {
        nearest = Math.min(nearest, Math.hypot(x - other.px, y - other.py));
      }
    }
    return nearest;
  }
  for (const star of visitors) {
    const anchor = { x: star.px, y: star.py };
    let best = { x: anchor.x, y: anchor.y, score: separation(anchor.x, anchor.y) };
    const angle = starOffset(star.id).u * Math.PI * 2;
    // Search outwards through an irregular spiral, staying near the geographic
    // anchor. Earlier stars reserve their spots before newer stars are placed.
    if (best.score < clearance) for (let index = 1; index <= 120; index++) {
      const radius = reach * Math.sqrt(index / 120);
      const theta = angle + index * Math.PI * (3 - Math.sqrt(5));
      const x = anchor.x + Math.cos(theta) * radius, y = anchor.y + Math.sin(theta) * radius;
      if (x < margin || x > width - margin || y < margin || y > height - margin) continue;
      const score = separation(x, y);
      if (score > best.score) best = { x, y, score };
      if (score >= clearance) break;
    }
    star.px = best.x; star.py = best.y;
    const key = `${Math.floor(star.px / clearance)},${Math.floor(star.py / clearance)}`;
    if (!cells.has(key)) cells.set(key, []);
    cells.get(key).push(star);
  }
  return projected;
}
