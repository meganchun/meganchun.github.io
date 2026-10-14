import { locationToStar } from './starPositions';

// User-provided email sample. Counts are used instead of rounded percentages.
// Approximate city centres (GeoNames); these are estimates, not visitor records.
export const HISTORICAL_LOCATIONS = [
  { name: 'Toronto, ON', weight: 297, latitude: 43.7, longitude: -79.4 },
  { name: 'Waterloo, ON', weight: 91, latitude: 43.5, longitude: -80.5 },
  { name: 'Markham, ON', weight: 66, latitude: 43.9, longitude: -79.3 },
  { name: 'Hamilton, ON', weight: 53, latitude: 43.3, longitude: -79.9 },
  { name: 'Montreal, QC', weight: 49, latitude: 45.5, longitude: -73.6 },
  { name: 'Kitchener, ON', weight: 39, latitude: 43.5, longitude: -80.5 },
  { name: 'Seattle, WA', weight: 28, latitude: 47.6, longitude: -122.3 },
  { name: 'New York, NY', weight: 26, latitude: 40.7, longitude: -74.0 },
  { name: 'Valenzuela, Philippines', weight: 25, latitude: 14.7, longitude: 121.0 },
  { name: 'Caloocan, Philippines', weight: 20, latitude: 14.8, longitude: 121.0 },
  { name: 'Other / unknown', weight: 150 },
];

export function allocateHistoricalLikes(total) {
  const count = Math.max(0, Math.floor(total));
  const weights = HISTORICAL_LOCATIONS.reduce((sum, item) => sum + item.weight, 0);
  const allocation = HISTORICAL_LOCATIONS.map((item, index) => {
    const exact = count * item.weight / weights;
    return { ...item, index, count: Math.floor(exact), remainder: exact % 1 };
  });
  const leftover = count - allocation.reduce((sum, item) => sum + item.count, 0);
  [...allocation].sort((a, b) => b.remainder - a.remainder || a.index - b.index)
    .slice(0, leftover).forEach((item) => item.count++);
  return allocation;
}

export function historicalStars(total) {
  // One point per historical like; no sampling or visual count cap.
  return allocateHistoricalLikes(total).flatMap((item) => {
    const position = locationToStar(item);
    return Array.from({ length: item.count }, (_, index) => ({
      ...position, id: `historical-${item.index}-${index}`, historical: true,
    }));
  });
}
