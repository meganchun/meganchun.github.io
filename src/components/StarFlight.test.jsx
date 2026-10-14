import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import StarFlight from './StarFlight';
import { projectStar } from '../services/starPositions';

test.each([false, true])('lands at the saved sky position with reduced motion = %s', (reduced) => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  jest.useFakeTimers();
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  let tick;
  let scroll = 1200;
  const raf = jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => { tick = callback; return 1; });
  const cancel = jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  const scrollTo = jest.spyOn(window, 'scrollTo').mockImplementation(({ top }) => { scroll = top; });
  const originalScrollY = Object.getOwnPropertyDescriptor(window, 'scrollY');
  Object.defineProperty(window, 'scrollY', { configurable: true, get: () => scroll });
  const originalMatchMedia = window.matchMedia;
  window.matchMedia = () => ({ matches: reduced });
  const start = jest.spyOn(performance, 'now').mockReturnValue(0);
  const star = { id: 'saved-star', x: .3, y: .4, located: true };
  const skyRef = { current: { getBoundingClientRect: () => ({ left: 0, top: -scroll, width: 1000, height: 700 }) } };
  const onArrival = jest.fn();
  try {
    act(() => root.render(<StarFlight flight={{ star, origin: { x: 500, y: 700 } }} skyRef={skyRef} onArrival={onArrival} />));
    expect(document.querySelector('.star-flight-glare')).toBeNull();
    if (!reduced) {
      act(() => tick(850));
      expect(scroll).toBeLessThan(1200);
      expect(onArrival).not.toHaveBeenCalled();
      expect(document.querySelector('.star-flight-streak').getAttribute('d')).toContain(' L ');
      expect(Number(document.querySelector('.star-flight-streak').getAttribute('opacity'))).toBeGreaterThan(0);
    }
    act(() => tick(1700));
    expect(onArrival).toHaveBeenCalledTimes(1);
    const target = projectStar(star, 1000, 700);
    const sprite = document.querySelector('.star-flight-landed');
    expect(sprite.querySelector('.star-flight-glare')).not.toBeNull();
    expect(parseFloat(sprite.style.left)).toBeCloseTo(target.px);
    expect(parseFloat(sprite.style.top)).toBeCloseTo(target.py - scroll);
    expect(document.querySelector('.star-flight-streak').getAttribute('opacity')).toBe('0');
    act(() => jest.runOnlyPendingTimers());
    expect(document.querySelector('.star-flight')).toBeNull();
    expect(document.querySelector('.star-flight-scene')).toBeNull();
  } finally {
    act(() => root.unmount());
    container.remove();
    raf.mockRestore(); cancel.mockRestore(); scrollTo.mockRestore(); start.mockRestore();
    Object.defineProperty(window, 'scrollY', originalScrollY);
    window.matchMedia = originalMatchMedia;
    jest.useRealTimers();
  }
});
