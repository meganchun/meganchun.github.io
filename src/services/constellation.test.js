import { nearbyConstellation, constellationEdges } from './constellation';

test('reveals nearby stars without changing positions or overcrowding dense clusters', () => {
  const stars = [
    { id: 'a', px: 100, py: 100 }, { id: 'close', px: 105, py: 105 },
    { id: 'b', px: 150, py: 100 }, { id: 'far', px: 500, py: 500 },
  ];
  const selected = nearbyConstellation(stars, { x: 100, y: 100 });
  expect(selected.map((star) => star.id)).toEqual(['a', 'b']);
  expect(selected[0]).toMatchObject({ px: 100, py: 100, strength: 1 });
  expect(selected[1].strength).toBeLessThan(selected[0].strength);
  expect(nearbyConstellation(stars, null)).toEqual([]);
});

test('bounds constellation size and connects locally without duplicate edges or loops', () => {
  const stars = Array.from({ length: 30 }, (_, index) => ({ id: String(index), px: (index % 6) * 25, py: Math.floor(index / 6) * 25 }));
  const selected = nearbyConstellation(stars, { x: 75, y: 75 });
  expect(selected).toHaveLength(5);
  const edges = constellationEdges(selected);
  expect(edges).toHaveLength(4);
  const degree = new Map();
  for (const [a, b] of edges) {
    expect(Math.hypot(a.px - b.px, a.py - b.py)).toBeLessThan(145);
    for (const star of [a, b]) degree.set(star.id, (degree.get(star.id) || 0) + 1);
  }
  expect(Math.max(...degree.values())).toBe(2);
  expect(constellationEdges([{ id: 'a', px: 0, py: 0 }, { id: 'b', px: 200, py: 0 }])).toEqual([]);
});
