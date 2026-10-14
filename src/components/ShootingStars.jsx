import React, { useEffect, useRef } from 'react';

export default function ShootingStars() {
  const layerRef = useRef(null);
  const starRef = useRef(null);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const layer = layerRef.current;
    const star = starRef.current;
    let timer;
    let animation = null;
    let active = true;
    const random = (min, max) => min + Math.random() * (max - min);

    function schedule(first = false) {
      clearTimeout(timer);
      if (!active || document.hidden || motion.matches) return;
      timer = setTimeout(shoot, first ? random(1000, 3000) : random(4000, 9000));
    }

    function shoot() {
      if (!active || document.hidden || motion.matches) return;
      const bounds = layer.getBoundingClientRect();
      const top = Math.max(0, -bounds.top);
      const bottom = Math.min(bounds.height, window.innerHeight - bounds.top);
      if (bottom <= top || bounds.width === 0) { schedule(); return; }
      const angle = random(18, 35);
      const travel = Math.min(random(170, 310), bounds.width * 0.6);
      const x = travel * Math.cos(angle * Math.PI / 180);
      const y = travel * Math.sin(angle * Math.PI / 180);
      star.style.left = `${random(0.05, 0.65) * bounds.width}px`;
      star.style.top = `${top + random(0.05, 0.65) * (bottom - top)}px`;
      star.style.setProperty('--shoot-angle', `${angle}deg`);
      star.style.setProperty('--shoot-length', `${random(45, 95)}px`);
      // Transform/opacity animate one tiny element, without a JS frame loop.
      animation = star.animate([
        { transform: 'translate3d(0,0,0)', opacity: 0, offset: 0 },
        { opacity: 0.2, offset: 0.2 },
        { opacity: 0.16, offset: 0.65 },
        { transform: `translate3d(${x}px,${y}px,0)`, opacity: 0, offset: 1 },
      ], { duration: random(1300, 1900), easing: 'linear' });
      animation.finished.then(() => {
        animation = null;
        schedule();
      }).catch(() => {});
    }

    function stop() {
      clearTimeout(timer);
      if (animation) { animation.cancel(); animation = null; }
    }
    function resume() { stop(); schedule(); }
    document.addEventListener('visibilitychange', resume);
    motion.addEventListener('change', resume);
    schedule(true);
    return () => {
      active = false;
      stop();
      document.removeEventListener('visibilitychange', resume);
      motion.removeEventListener('change', resume);
    };
  }, []);

  return <div ref={layerRef} className="shooting-stars" aria-hidden="true">
    <div ref={starRef} className="shooting-star"><span /></div>
  </div>;
}
