export function nearbyConstellation(stars, pointer) {
  if (!pointer) return [];
  const nearby = stars.map((star) => ({ ...star, distance: Math.hypot(star.px - pointer.x, star.py - pointer.y) }))
    .filter((star) => star.distance < 150)
    .sort((a, b) => a.distance - b.distance || a.id.localeCompare(b.id));
  const selected = [];
  for (const star of nearby) {
    // Keep dense geographic clusters from becoming a web of overlapping lines.
    if (selected.some((other) => Math.hypot(star.px - other.px, star.py - other.py) < 44)) continue;
    selected.push({ ...star, strength: Math.pow(1 - star.distance / 150, .6) });
    if (selected.length === 5) break;
  }
  return selected;
}

export function constellationEdges(stars) {
  const edges = [];
  if (stars.length < 2) return edges;
  const centre = stars.reduce((sum, star) => ({ x: sum.x + star.px / stars.length, y: sum.y + star.py / stars.length }), { x: 0, y: 0 });
  const remaining = [...stars].sort((a, b) => Math.hypot(b.px - centre.x, b.py - centre.y) - Math.hypot(a.px - centre.x, a.py - centre.y) || a.id.localeCompare(b.id));
  let current = remaining.shift(), previous = null;
  // One open chain, starting at an outer star. Prefer a continued direction
  // over sharp turns; no branches or closed shapes in dense clusters.
  while (remaining.length) {
    let next = null, bestScore = Infinity;
    for (const candidate of remaining) {
      const dx = candidate.px - current.px, dy = candidate.py - current.py;
      const length = Math.hypot(dx, dy);
      if (length === 0 || length > 145) continue;
      let turn = 0;
      if (previous) {
        const vx = current.px - previous.px, vy = current.py - previous.py;
        const cosine = (vx * dx + vy * dy) / (Math.hypot(vx, vy) * length);
        turn = (1 - Math.max(-1, Math.min(1, cosine))) * 65;
      }
      const score = length + turn;
      if (score < bestScore) { next = candidate; bestScore = score; }
    }
    if (!next) break;
    edges.push([current, next]);
    remaining.splice(remaining.indexOf(next), 1);
    previous = current; current = next;
  }
  return edges;
}
