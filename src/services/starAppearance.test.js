import { AGE_STEPS, nextSizeChange, starRadius, starPlacedAgo, starGlareOpacity, nextGlareChange } from './starAppearance';
const now = 20000000000;
const star = (age) => ({ createdAt: { toMillis: () => now - age } });

it('makes stars smaller as they age and retains a visible minimum', () => {
  const ages = [0, ...AGE_STEPS.map((step) => step.age)];
  const radii = ages.map((age) => starRadius(star(age), now));
  expect(radii).toEqual([3.2, 2.6, 1.9, 1.3, 0.85]);
  expect(starRadius(star(1000000000000), now)).toBe(0.85);
});
it('does not assign fake recent dates to historical or undated stars', () => {
  expect(starRadius({ historical: true }, now)).toBe(0.55);
  expect(starRadius({}, now)).toBe(0.85);
  expect(starRadius({ createdAt: { toMillis: () => NaN } }, now)).toBe(0.85);
});
it('updates only at the earliest upcoming size boundary', () => {
  expect(nextSizeChange([star(0), star(1000)], now)).toBe(now + AGE_STEPS[0].age - 1000);
  expect(nextSizeChange([star(AGE_STEPS[0].age)], now)).toBe(now - AGE_STEPS[0].age + AGE_STEPS[1].age);
  expect(nextSizeChange([{ historical: true }, star(AGE_STEPS[3].age)], now)).toBe(Infinity);
});
it('caps future timestamps at the newest appearance', () => {
  expect(starRadius(star(-1000), now)).toBe(3.2);
});

it('describes star ages without inventing dates for historical or undated stars', () => {
  expect(starPlacedAgo(star(59000), now)).toBe('Placed just now');
  expect(starPlacedAgo(star(60000), now)).toBe('Placed 1 minute ago');
  expect(starPlacedAgo(star(5 * 60000), now)).toBe('Placed 5 minutes ago');
  expect(starPlacedAgo(star(3600000), now)).toBe('Placed 1 hour ago');
  expect(starPlacedAgo(star(2 * 86400000), now)).toBe('Placed 2 days ago');
  expect(starPlacedAgo(star(-1000), now)).toBe('Placed just now');
  expect(starPlacedAgo({ historical: true, ...star(0) }, now)).toBeNull();
  expect(starPlacedAgo({}, now)).toBeNull();
});

it('fades visitor glares in their final hour and removes them at one day', () => {
  const hour = 3600000;
  expect(starGlareOpacity(star(0), now)).toBe(1);
  expect(starGlareOpacity(star(23 * hour), now)).toBe(1);
  expect(starGlareOpacity(star(23.5 * hour), now)).toBe(.5);
  expect(starGlareOpacity(star(24 * hour), now)).toBe(0);
  expect(starGlareOpacity(star(48 * hour), now)).toBe(0);
  expect(starGlareOpacity({ historical: true }, now)).toBe(1);
  expect(starGlareOpacity({}, now)).toBe(0);
  expect(nextGlareChange([star(0)], now)).toBe(now + 23 * hour);
  expect(nextGlareChange([star(23.5 * hour)], now)).toBe(now + 60000);
  expect(nextGlareChange([star(24 * hour - 1000)], now)).toBe(now + 1000);
  expect(nextGlareChange([star(24 * hour)], now)).toBe(Infinity);
});
