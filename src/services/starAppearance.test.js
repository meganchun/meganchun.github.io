import { AGE_STEPS, nextSizeChange, starRadius } from './starAppearance';
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
