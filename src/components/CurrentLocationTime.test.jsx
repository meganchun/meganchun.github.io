import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import CurrentLocationTime from './CurrentLocationTime';
import { Location } from '../types/location';

let container, root;
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  jest.useFakeTimers();
  container = document.createElement('div');
  root = createRoot(container);
});
afterEach(() => { act(() => root.unmount()); jest.useRealTimers(); });

test.each([
  [Location.SanFrancisco, 'SAN FRANCISCO, CA', '8:42 AM'],
  [Location.Toronto, 'TORONTO, ON', '11:42 AM'],
  [Location.Waterloo, 'WATERLOO, ON', '11:42 AM'],
  [Location.NewYork, 'NEW YORK, NY', '11:42 AM'],
])('shows the label and local time for %s', (location, label, time) => {
  jest.setSystemTime(new Date('2026-07-15T15:42:00Z'));
  act(() => root.render(<CurrentLocationTime location={location} />));
  expect(container.textContent).toBe(`${label} · ${time}`);
  expect(container.querySelector('time').getAttribute('aria-label')).toBe(`${location} local time: ${time}`);
});

test('updates at the minute, uses daylight saving, and responds to location changes', () => {
  jest.setSystemTime(new Date('2026-07-15T15:42:59Z'));
  act(() => root.render(<CurrentLocationTime location={Location.Waterloo} />));
  act(() => jest.advanceTimersByTime(1000));
  expect(container.querySelector('time').textContent).toBe('11:43 AM');
  jest.setSystemTime(new Date('2026-01-15T15:42:00Z'));
  act(() => document.dispatchEvent(new Event('visibilitychange')));
  expect(container.querySelector('time').textContent).toBe('10:42 AM');
  act(() => root.render(<CurrentLocationTime location={Location.SanFrancisco} />));
  expect(container.textContent).toBe('SAN FRANCISCO, CA · 7:42 AM');
});
