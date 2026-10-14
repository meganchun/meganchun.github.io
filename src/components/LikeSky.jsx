import React, { useEffect, useMemo, useRef, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { counterRef } from '../services/likes';
import { historicalStars } from '../services/historicalStars';
import { projectStar, starOffset } from '../services/starPositions';
import { nextSizeChange, starRadius } from '../services/starAppearance';
import glareUrl from '../images/star-glare.png';
import ConstellationReveal from './ConstellationReveal';

export default function LikeSky({ canvasRef: suppliedCanvasRef, arrivingStar, arrived }) {
  const ownCanvasRef = useRef(null);
  const canvasRef = suppliedCanvasRef || ownCanvasRef;
  const [recent, setRecent] = useState([]);
  const [historicalCount, setHistoricalCount] = useState(0);
  const [glareImage, setGlareImage] = useState(null);
  const [glareSettled, setGlareSettled] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [landedStars, setLandedStars] = useState([]);
  useEffect(() => {
    if (!arrived || !arrivingStar) return;
    setLandedStars((stars) => stars.some((star) => star.id === arrivingStar.id) ? stars : [...stars, arrivingStar]);
  }, [arrivingStar, arrived]);
  // Keep the saved star visible even if its live snapshot arrives after the flight.
  const visibleRecent = useMemo(() => {
    const byId = new Map(landedStars.map((star) => [star.id, star]));
    recent.forEach((star) => byId.set(star.id, star));
    const stars = [...byId.values()].filter((star) => star.id !== arrivingStar?.id);
    if (arrived && arrivingStar) stars.unshift(recent.find((star) => star.id === arrivingStar.id) || arrivingStar);
    return stars;
  }, [recent, landedStars, arrivingStar, arrived]);

  useEffect(() => {
    let active = true;
    const image = new Image();
    image.onload = () => {
      if (active) { setGlareImage(image); setGlareSettled(true); }
    };
    image.onerror = () => { if (active) setGlareSettled(true); };
    image.src = glareUrl;
    return () => { active = false; image.onload = null; image.onerror = null; };
  }, []);

  useEffect(() => {
    const stopCounter = onSnapshot(counterRef, (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.data();
      setHistoricalCount(Math.max(0, data.count - (data.mappedLikeCount || 0)));
    }, (error) => console.warn('Sky counter unavailable:', error));
    const stopStars = onSnapshot(query(collection(counterRef, 'stars'), orderBy('createdAt', 'desc')), (snapshot) => {
      setRecent(snapshot.docs.map((document) => ({ id: document.id, ...document.data() }))
        .filter((star) => Number.isFinite(star.x) && Number.isFinite(star.y) && star.x >= 0 && star.x <= 1 && star.y >= 0 && star.y <= 1));
    }, (error) => console.warn('Visitor stars unavailable:', error));
    return () => { stopCounter(); stopStars(); };
  }, []);

  const backdrop = useMemo(() => historicalStars(historicalCount), [historicalCount]);
  const interactiveStars = useMemo(() => [...backdrop, ...visibleRecent], [backdrop, visibleRecent]);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let revealFrame;
    // Reuse one soft star texture instead of blurring each point every draw.
    const glow = document.createElement('canvas');
    glow.width = glow.height = 96;
    const glowContext = glow.getContext('2d');
    const gradient = glowContext.createRadialGradient(48, 48, 0, 48, 48, 48);
    // Smooth Gaussian falloff becomes practically invisible well before the
    // sprite boundary, so the halo has no discernible circular cutoff.
    for (let stop = 0; stop <= 32; stop++) {
      const position = stop / 32;
      const alpha = stop === 32 ? 0 : 0.42 * Math.exp(-0.5 * Math.pow(position / 0.19, 2));
      gradient.addColorStop(position, `rgba(216,165,191,${alpha})`);
    }
    glowContext.fillStyle = gradient;
    glowContext.fillRect(0, 0, 96, 96);
    function draw() {
      const { width, height } = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const project = (star) => projectStar(star, width, height);
      // Draw every like, keeping the small points faint but visibly legible.
      const dots = [...backdrop, ...visibleRecent].map(project);
      if (dots.length > 0 && glareSettled) {
        cancelAnimationFrame(revealFrame);
        // Paint while transparent, then reveal the existing layer once.
        revealFrame = requestAnimationFrame(() => setRevealed(true));
      }
      const now = Date.now();
      dots.forEach((star) => {
        const scatter = starOffset(star.id);
        const featured = !star.historical || scatter.u > 0.985;
        const radius = star.historical
          ? featured ? 0.55 + scatter.v * 0.5 : 0.55 + scatter.v * 0.3
          : starRadius(star, now);
        const halo = 12 + radius * 8;
        const brightness = star.historical
          ? featured ? 0.28 + scatter.v * 0.4 : 0.18 + scatter.v * 0.14
          : 0.75;
        const x = Math.round(star.px * dpr) / dpr;
        const y = Math.round(star.py * dpr) / dpr;
        // Keep the haze far dimmer than the pinpoint centre.
        if (featured) {
          ctx.globalAlpha = brightness * 0.25;
          ctx.drawImage(glow, x - halo / 2, y - halo / 2, halo, halo);
        }
        ctx.globalAlpha = brightness;
        ctx.fillStyle = '#f3dfe8';
        ctx.beginPath(); ctx.arc(x, y, Math.max(featured ? 0.6 : 0.45, radius * 0.7), 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
      // At most one connection per recent star; spatial buckets avoid all-pairs work.
      const cells = new Map();
      visibleRecent.map(project).forEach((star) => {
        const bx = Math.floor(star.px / 40), by = Math.floor(star.py / 40);
        let nearest = null, distance = 35;
        for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
          const candidate = cells.get(`${bx + dx},${by + dy}`);
          if (candidate && candidate.located && star.located) {
            const length = Math.hypot(candidate.px - star.px, candidate.py - star.py);
            if (length < distance) { nearest = candidate; distance = length; }
          }
        }
        if (nearest) {
          ctx.strokeStyle = 'rgba(139,159,231,0.18)'; ctx.lineWidth = 0.6;
          ctx.beginPath(); ctx.moveTo(star.px, star.py); ctx.lineTo(nearest.px, nearest.py); ctx.stroke();
        }
        cells.set(`${bx},${by}`, star);
      });
      if (glareImage) {
        const accents = [];
        const maxAccents = width < 600 ? 4 : 8;
        const skyBounds = canvas.getBoundingClientRect();
        const sunBounds = canvas.closest('.portfolio')?.querySelector('.sun')?.getBoundingClientRect();
        // Select historical accents independently. Visitor arrivals must never
        // consume their budget or displace one through the spacing filter.
        for (const star of [...dots.filter((dot) => dot.historical), ...dots.filter((dot) => !dot.historical)]) {
          const scatter = starOffset(star.id);
          if (star.historical && scatter.u > 0.15) continue;
          if (star.historical && accents.length >= maxAccents) continue;
          const radius = starRadius(star, now);
          const size = star.historical ? 85 + scatter.v * 25 : 70 + radius * 16;
          if (star.historical && sunBounds && Math.hypot(star.px - (sunBounds.left - skyBounds.left + sunBounds.width / 2), star.py - (sunBounds.top - skyBounds.top + sunBounds.height / 2)) < sunBounds.width * 0.3 + 30) continue;
          if (star.historical && (star.px < 30 || star.px > width - 30 || star.py < 30 || star.py > height - 30)) continue;
          if (star.historical && accents.some((other) => Math.hypot(other.px - star.px, other.py - star.py) < 120)) continue;
          if (star.historical) accents.push(star);
          ctx.save();
          // Screen preserves the supplied glow even if its padding contains black.
          ctx.globalCompositeOperation = 'screen';
          // Tapered rays fade smoothly instead of enlarging the image's
          // thicker streaks. Keep the original glare asset for the centre.
          ctx.globalAlpha = star.historical ? 0.75 : 1;
          for (const angle of [Math.PI / 4, -Math.PI / 4]) {
            ctx.save();
            ctx.translate(star.px, star.py);
            ctx.rotate(angle);
            const ray = ctx.createLinearGradient(-size / 2, 0, size / 2, 0);
            ray.addColorStop(0, 'rgba(111,132,193,0)');
            ray.addColorStop(0.25, 'rgba(111,132,193,0.015)');
            ray.addColorStop(0.43, 'rgba(139,158,221,0.1)');
            ray.addColorStop(0.5, 'rgba(190,205,255,0.35)');
            ray.addColorStop(0.57, 'rgba(139,158,221,0.1)');
            ray.addColorStop(0.75, 'rgba(111,132,193,0.015)');
            ray.addColorStop(1, 'rgba(111,132,193,0)');
            ctx.fillStyle = ray;
            ctx.filter = 'blur(0.8px)';
            ctx.beginPath();
            ctx.moveTo(-size / 2, 0); ctx.lineTo(0, -1.4);
            ctx.lineTo(size / 2, 0); ctx.lineTo(0, 1.4);
            ctx.closePath(); ctx.fill();
            ctx.restore();
          }
          const coreSize = star.historical ? 27 : 22 + radius * 4;
          ctx.globalAlpha = star.historical ? 0.9 : 1;
          ctx.filter = 'blur(0.25px)';
          ctx.drawImage(glareImage, star.px - coreSize / 2, star.py - coreSize / 2, coreSize, coreSize);
          ctx.restore();
        }
      }
    }
    const observer = new ResizeObserver(draw);
    observer.observe(canvas); draw();
    // Schedule only age-boundary changes; no frame loop or frequent polling.
    let timer;
    function scheduleSizeChange() {
      const boundary = nextSizeChange(recent);
      if (!Number.isFinite(boundary)) return;
      timer = setTimeout(() => {
        if (!document.hidden) draw();
        scheduleSizeChange();
      }, Math.min(2147483647, Math.max(1, boundary - Date.now() + 1)));
    }
    const visible = () => { if (!document.hidden) draw(); };
    document.addEventListener('visibilitychange', visible);
    scheduleSizeChange();
    return () => { observer.disconnect(); clearTimeout(timer); cancelAnimationFrame(revealFrame); document.removeEventListener('visibilitychange', visible); };
  }, [backdrop, recent, visibleRecent, glareImage, glareSettled, arrivingStar, canvasRef]);

  return <section className={`like-sky${revealed ? ' is-ready' : ''}`} aria-label="Visitor sky, mapped from approximate locations">
    <canvas ref={canvasRef} role="img" data-star-count={backdrop.length + visibleRecent.length}
      aria-label={`${historicalCount.toLocaleString()} historical likes distributed using estimated email shares, and ${recent.length} recent visitor stars. Longitude maps horizontally and latitude vertically.`} />
    <ConstellationReveal stars={interactiveStars} />
  </section>;
}
