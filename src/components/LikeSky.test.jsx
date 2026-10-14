import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import LikeSky from './LikeSky';
import { projectStar } from '../services/starPositions';
import { onSnapshot } from 'firebase/firestore';

jest.mock('../services/likes', () => ({ counterRef: 'counter' }));
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(), orderBy: jest.fn(), query: jest.fn(),
  onSnapshot: jest.fn(),
}));

test('new arrivals retain existing glares and stars awaiting live snapshots', () => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  onSnapshot.mockImplementation((ref, receive) => {
    receive(ref === 'counter' ? { exists: () => true, data: () => ({ count: 1000 }) } : { docs: [] });
    return () => {};
  });
  const originalImage = window.Image;
  const originalObserver = window.ResizeObserver;
  window.Image = class { set src(value) { this.onload(); } };
  window.ResizeObserver = class { observe() {} disconnect() {} };
  const context = {
    setTransform: jest.fn(), drawImage: jest.fn(), fillRect: jest.fn(), beginPath: jest.fn(),
    arc: jest.fn(), fill: jest.fn(), stroke: jest.fn(), moveTo: jest.fn(), lineTo: jest.fn(),
    save: jest.fn(), restore: jest.fn(), translate: jest.fn(), rotate: jest.fn(), closePath: jest.fn(),
    createRadialGradient: () => ({ addColorStop() {} }), createLinearGradient: () => ({ addColorStop() {} }),
  };
  const getContext = jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context);
  const bounds = jest.spyOn(HTMLCanvasElement.prototype, 'getBoundingClientRect').mockReturnValue({ width: 1200, height: 800, left: 0, top: 0 });
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const glarePositions = () => {
    context.drawImage.mockClear();
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    return context.drawImage.mock.calls.filter(([image]) => image instanceof window.Image)
      .map(([, x, y, size]) => [x + size / 2, y + size / 2]);
  };
  const first = { id: 'saved-first', x: .3, y: .3, located: true };
  const second = { id: 'saved-second', x: .32, y: .31, located: true };
  try {
    act(() => root.render(<LikeSky />));
    const initial = glarePositions();
    expect(initial.length).toBeGreaterThan(0);
    act(() => root.render(<LikeSky arrivingStar={first} arrived />));
    const withFirst = glarePositions();
    expect(withFirst).toEqual(expect.arrayContaining(initial));
    expect(withFirst).toHaveLength(initial.length + 1);
    act(() => root.render(<LikeSky arrivingStar={second} arrived={false} />));
    expect(glarePositions()).toEqual(withFirst);
    act(() => root.render(<LikeSky arrivingStar={second} arrived />));
    const withBoth = glarePositions();
    expect(withBoth).toEqual(expect.arrayContaining(withFirst));
    expect(withBoth).toHaveLength(initial.length + 2);
    for (const star of [first, second]) {
      const point = projectStar(star, 1200, 800);
      expect(withBoth.some(([x, y]) => Math.hypot(x - point.px, y - point.py) < .001)).toBe(true);
    }
    expect(container.querySelector('canvas').dataset.starCount).toBe('1002');
  } finally {
    act(() => root.unmount()); container.remove();
    getContext.mockRestore(); bounds.mockRestore();
    window.Image = originalImage; window.ResizeObserver = originalObserver;
  }
});
