import React, { useEffect, useRef } from 'react';
import { projectStar } from '../services/starPositions';
import { nearbyConstellation, constellationEdges } from '../services/constellation';

export default function ConstellationReveal({ stars }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const motion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const points = new Map();
    const edges = new Map();
    let projected = [];
    let pointer = null;
    let frame = null;
    let lastTime = null;
    let width = 0, height = 0, dpr = 1;

    function wake() {
      if (frame === null && !document.hidden) frame = requestAnimationFrame(draw);
    }
    function resize() {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width; height = bounds.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      projected = stars.map((star) => projectStar(star, width, height));
      points.clear(); edges.clear();
      wake();
    }
    function move(event) {
      if (event.pointerType === 'touch') return;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left, y = event.clientY - rect.top;
      pointer = x >= 0 && x <= width && y >= 0 && y <= height ? { x, y } : null;
      wake();
    }
    function leave() { pointer = null; wake(); }
    function visibility() {
      if (document.hidden) {
        cancelAnimationFrame(frame); frame = null; lastTime = null;
        pointer = null; points.clear(); edges.clear();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } else wake();
    }
    function draw(time) {
      frame = null;
      const elapsed = lastTime === null ? 16 : Math.min(64, time - lastTime);
      lastTime = time;
      const targets = nearbyConstellation(projected, pointer);
      points.forEach((point) => { point.target = 0; });
      targets.forEach((star) => {
        const point = points.get(star.id) || { ...star, alpha: 0 };
        point.target = star.strength;
        points.set(star.id, point);
      });
      edges.forEach((edge) => { edge.target = 0; });
      constellationEdges(targets).forEach(([a, b]) => {
        const key = [a.id, b.id].sort().join('|');
        const edge = edges.get(key) || { a, b, alpha: 0 };
        edge.target = Math.min(a.strength, b.strength);
        edges.set(key, edge);
      });
      let settling = false;
      function fade(item) {
        const blend = motion?.matches ? 1 : 1 - Math.exp(-elapsed / (item.target > item.alpha ? 100 : 240));
        item.alpha += (item.target - item.alpha) * blend;
        if (Math.abs(item.target - item.alpha) < .002) item.alpha = item.target;
        else settling = true;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      edges.forEach((edge, key) => {
        fade(edge);
        if (edge.alpha === 0) { edges.delete(key); return; }
        ctx.strokeStyle = `rgba(169,190,255,${edge.alpha * .16})`;
        ctx.lineWidth = .6;
        ctx.beginPath(); ctx.moveTo(edge.a.px, edge.a.py); ctx.lineTo(edge.b.px, edge.b.py); ctx.stroke();
      });
      points.forEach((point, key) => {
        fade(point);
        if (point.alpha === 0) { points.delete(key); return; }
        const glow = ctx.createRadialGradient(point.px, point.py, 0, point.px, point.py, 15);
        glow.addColorStop(0, `rgba(190,207,255,${point.alpha * .25})`);
        glow.addColorStop(.25, `rgba(139,159,231,${point.alpha * .07})`);
        glow.addColorStop(1, 'rgba(139,159,231,0)');
        ctx.fillStyle = glow; ctx.fillRect(point.px - 15, point.py - 15, 30, 30);
        ctx.fillStyle = `rgba(241,245,255,${point.alpha * .7})`;
        ctx.beginPath(); ctx.arc(point.px, point.py, .8 + point.alpha * .35, 0, Math.PI * 2); ctx.fill();
      });
      // Only animate while highlights are changing; the idle sky stays static.
      if (settling) wake(); else lastTime = null;
    }
    const observer = new ResizeObserver(resize);
    observer.observe(canvas); resize();
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    window.addEventListener('blur', leave);
    window.addEventListener('scroll', leave, { passive: true });
    document.addEventListener('visibilitychange', visibility);
    return () => {
      observer.disconnect(); cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
      window.removeEventListener('blur', leave);
      window.removeEventListener('scroll', leave);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [stars]);
  return <canvas ref={canvasRef} className="constellation-reveal" aria-hidden="true" />;
}
