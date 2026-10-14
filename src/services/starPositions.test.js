import { locationToStar, starOffset, projectStar } from './starPositions';
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
