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
