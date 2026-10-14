import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { projectStar } from '../services/starPositions';
import glareUrl from '../images/star-glare.png';

export default function StarFlight({ flight, skyRef, onArrival }) {
  const spriteRef = useRef(null);
  const trailRef = useRef(null);
  const mistRef = useRef(null);
  const gradientRef = useRef(null);
  const sparksRef = useRef([]);
  const gradientId = useId();
  const arrivalRef = useRef(onArrival);
  arrivalRef.current = onArrival;
  const [landed, setLanded] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const canvas = skyRef.current;
    if (!canvas) { arrivalRef.current(); setFinished(true); return; }
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const startScroll = window.scrollY;
    const bounds = canvas.getBoundingClientRect();
    const point = projectStar(flight.star, bounds.width, bounds.height);
    const destinationY = bounds.top + startScroll + point.py;
    const endScroll = Math.min(startScroll, Math.max(0, destinationY - window.innerHeight * 0.38));
    const start = performance.now();
    let frame;
    let timer;
    const history = [{ ...flight.origin, time: start }];
    function animate(now) {
      const progress = reducedMotion ? 1 : Math.min(1, (now - start) / 1700);
      const scrollProgress = 1 - Math.pow(1 - progress, 3);
      window.scrollTo({ top: startScroll + (endScroll - startScroll) * scrollProgress, behavior: 'instant' });
      // Re-measure so the star stays attached to its destination during scrolling
      // and viewport changes, including the mobile browser toolbar collapsing.
      const rect = canvas.getBoundingClientRect();
      const target = projectStar(flight.star, rect.width, rect.height);
      const end = { x: rect.left + target.px, y: rect.top + target.py };
      const eased = progress * progress * (3 - 2 * progress);
      const arc = Math.sin(Math.PI * progress);
      const x = flight.origin.x + (end.x - flight.origin.x) * eased + arc * Math.min(90, rect.width * 0.12);
      const y = flight.origin.y + (end.y - flight.origin.y) * eased - arc * 80;
      // A short history of viewport positions makes the tail follow the actual
      // curved flight, including the simultaneous scroll, instead of a fixed angle.
      history.push({ x, y, time: now });
      while (history.length > 2 && history[1].time < now - 240) history.shift();
      const tail = history[0];
      let path = `M ${tail.x} ${tail.y}`;
      for (let index = 1; index < history.length - 1; index++) {
        const current = history[index], next = history[index + 1];
        path += ` Q ${current.x} ${current.y} ${(current.x + next.x) / 2} ${(current.y + next.y) / 2}`;
      }
      path += ` L ${x} ${y}`;
      const opacity = Math.pow(Math.max(0, arc), .6);
      for (const trail of [trailRef.current, mistRef.current]) {
        trail?.setAttribute('d', path);
        trail?.setAttribute('opacity', String(progress === 1 ? 0 : opacity));
      }
      if (gradientRef.current) {
        for (const [key, value] of Object.entries({ x1: tail.x, y1: tail.y, x2: x, y2: y })) {
          gradientRef.current.setAttribute(key, String(value));
        }
      }
      sparksRef.current.forEach((spark, index) => {
        const point = history[Math.floor((history.length - 1) * (index + 1) / 7)];
        if (!spark || !point) return;
        spark.setAttribute('cx', String(point.x + Math.sin(now / 180 + index * 2) * 4));
        spark.setAttribute('cy', String(point.y + Math.cos(now / 210 + index * 2) * 4));
        spark.setAttribute('opacity', String(progress === 1 ? 0 : opacity * (.2 + index * .09)));
      });
      if (spriteRef.current) {
        spriteRef.current.style.left = `${x}px`;
        spriteRef.current.style.top = `${y}px`;
        spriteRef.current.style.setProperty('--flight-scale', String(1 + arc * 0.6));
      }
      if (progress < 1) frame = requestAnimationFrame(animate);
      else {
        arrivalRef.current();
        setLanded(true);
        timer = setTimeout(() => setFinished(true), reducedMotion ? 0 : 900);
      }
    }
    frame = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(frame); clearTimeout(timer); };
  }, [flight.star, flight.origin, skyRef]);

  if (finished) return null;
  return createPortal(<div className="star-flight-scene" aria-hidden="true">
    <svg className="star-flight-trail" width="100%" height="100%">
      <defs>
        <linearGradient id={gradientId} ref={gradientRef} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#8b9fe7" stopOpacity="0" />
          <stop offset=".4" stopColor="#a9baff" stopOpacity=".15" />
          <stop offset=".8" stopColor="#d6dfff" stopOpacity=".65" />
          <stop offset="1" stopColor="#fff6e8" />
        </linearGradient>
      </defs>
      <path ref={mistRef} className="star-flight-mist" stroke={`url(#${gradientId})`} />
      <path ref={trailRef} className="star-flight-streak" stroke={`url(#${gradientId})`} />
      {Array.from({ length: 5 }, (_, index) => <circle key={index} ref={(node) => { sparksRef.current[index] = node; }}
        r={.7 + index * .15} fill={index % 2 ? '#fff0da' : '#c8d5ff'} opacity="0" />)}
    </svg>
    <div ref={spriteRef}
    className={`star-flight${landed ? ' star-flight-landed' : ''}`}
    style={{ left: flight.origin.x, top: flight.origin.y }}>
    <span className="star-flight-halo" />
    <svg className="star-flight-core" viewBox="0 0 24 24">
      <path d="M12 0 C13.4 9 15 10.6 24 12 C15 13.4 13.4 15 12 24 C10.6 15 9 13.4 0 12 C9 10.6 10.6 9 12 0Z" fill="currentColor" />
      <circle cx="12" cy="12" r="2.2" fill="#fffaf0" />
    </svg>
    {landed && <img className="star-flight-glare" src={glareUrl} alt="" />}
    </div>
  </div>, document.body);
}
