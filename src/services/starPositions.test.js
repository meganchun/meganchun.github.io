import { locationToStar, starOffset, projectStar, projectSkyStars } from './starPositions';
import { allocateHistoricalLikes, historicalStars } from './historicalStars';

it('maps north/south and east/west across the sky', () => {
  expect(locationToStar({ latitude: 90, longitude: -180 })).toEqual({ x: 0, y: 0, located: true });
  expect(locationToStar({ latitude: -90, longitude: 180 })).toEqual({ x: 1, y: 1, located: true });
  expect(locationToStar({ latitude: 0, longitude: 0 })).toEqual({ x: 0.5, y: 0.5, located: true });
});
it('does not invent geography for missing or invalid coordinates', () => {
  [null, {}, { latitude: null, longitude: null }, { latitude: NaN, longitude: 1 }, { latitude: 95, longitude: 0 }].forEach((location) => {
    expect(locationToStar(location)).toEqual({ x: 0.5, y: 0.9, located: false });
  });
});
it('uses repeatable small offsets to separate stars from the same region', () => {
  expect(starOffset('a')).toEqual(starOffset('a'));
  expect(starOffset('a')).not.toEqual(starOffset('b'));
  expect(Number.isFinite(starOffset('a').x)).toBe(true);
});
it('spreads unlocated stars into every corner of the sky instead of a circle', () => {
  const points = Array.from({ length: 2000 }, (_, i) => projectStar({ id: `unknown-${i}`, located: false }, 1000, 600));
  for (const [x, y] of [[50, 30], [950, 30], [50, 570], [950, 570]]) {
    expect(points.some((point) => Math.abs(point.px - x) < 50 && Math.abs(point.py - y) < 30)).toBe(true);
  }
});
it('keeps wide historical clouds visible without accumulating stars on the edges', () => {
  const points = historicalStars(7000).map((star) => projectStar(star, 1000, 600));
  expect(points.every((point) => point.px >= 4 && point.px <= 996 && point.py >= 4 && point.py <= 596)).toBe(true);
  expect(points.filter((point) => point.px === 4 || point.py === 4)).toHaveLength(0);
  expect(points.some((point) => point.located && point.px > 700)).toBe(true);
});
it('reproduces the supplied 844-email distribution exactly', () => {
  expect(allocateHistoricalLikes(844).map((item) => item.count)).toEqual([297, 91, 66, 53, 49, 39, 28, 26, 25, 20, 150]);
});
it('scales to arbitrary totals without losing or adding likes through rounding', () => {
  [0, 1, 7, 7000, 7123].forEach((total) => {
    const allocation = allocateHistoricalLikes(total);
    expect(allocation.reduce((sum, item) => sum + item.count, 0)).toBe(total);
    expect(allocation.every((item) => Number.isInteger(item.count) && item.count >= 0)).toBe(true);
  });
});
it('keeps unknown locations unlocated and preserves one star per historical like', () => {
  const stars = historicalStars(844);
  expect(stars.filter((star) => !star.located)).toHaveLength(150);
  expect(historicalStars(7787)).toHaveLength(7787);
  expect(historicalStars(12001)).toHaveLength(12001);
});

it.each([[390, 680], [1200, 800]])('separates visitor glares within their region at %s×%s', (width, height) => {
  const stars = Array.from({ length: 8 }, (_, index) => ({ id: `visitor-${index}`, ...locationToStar({ latitude: 43, longitude: -80 }), createdAt: { toMillis: () => index + 1 } }));
  const layout = projectSkyStars(stars, width, height);
  const clearance = Math.min(70, Math.max(40, width * .12));
  layout.forEach((star, index) => {
    const anchor = projectStar(stars[index], width, height);
    expect(Math.hypot(star.px - anchor.px, star.py - anchor.py)).toBeLessThanOrEqual(Math.min(210, width * .35, height * .28) + .001);
    for (const other of layout.slice(0, index)) expect(Math.hypot(star.px - other.px, star.py - other.py)).toBeGreaterThanOrEqual(clearance - .001);
  });
  const extended = projectSkyStars([...stars, { ...stars[0], id: 'new-arrival', createdAt: { toMillis: () => 100 } }], width, height);
  expect(extended.slice(0, 8)).toEqual(layout);
  expect(projectSkyStars([...stars].reverse(), width, height).reverse()).toEqual(layout);
});

it('leaves historical positions unchanged and avoids edge piles in crowded regions', () => {
  const history = historicalStars(50);
  expect(projectSkyStars(history, 390, 680)).toEqual(history.map((star) => projectStar(star, 390, 680)));
  const visitors = Array.from({ length: 80 }, (_, index) => ({ id: `edge-${index}`, x: 0, y: 0, located: true, createdAt: { toMillis: () => index + 1 } }));
  const result = projectSkyStars(visitors, 390, 680);
  expect(result).toHaveLength(80);
  expect(result.every((star) => star.px >= 4 && star.px <= 386 && star.py >= 4 && star.py <= 676)).toBe(true);
  expect(result.filter((star) => star.px === 24 || star.py === 24)).toHaveLength(0);
});
