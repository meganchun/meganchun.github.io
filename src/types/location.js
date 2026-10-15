export const Location = Object.freeze({
  SanFrancisco: 'San Francisco',
  Toronto: 'Toronto',
  Waterloo: 'Waterloo',
  NewYork: 'New York',
});

/** @typedef {typeof Location[keyof typeof Location]} LocationType */

export const locations = {
  [Location.SanFrancisco]: { label: 'SAN FRANCISCO, CA', timeZone: 'America/Los_Angeles' },
  [Location.Toronto]: { label: 'TORONTO, ON', timeZone: 'America/Toronto' },
  [Location.Waterloo]: { label: 'WATERLOO, ON', timeZone: 'America/Toronto' },
  [Location.NewYork]: { label: 'NEW YORK, NY', timeZone: 'America/New_York' },
};
