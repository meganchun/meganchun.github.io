import React, { useCallback, useEffect, useRef, useState } from "react";
import goSnooze from "../images/gosnooze.png";
import binge from "../images/binge.png";
import foodio from "../images/super-foodio.png";
import meglino from "../images/meglino.png";
import newsflix from "../images/newsflix.png";
import findMyUni from "../images/findmyuni.png";
import bohnanza from "../images/bohnanza.png";
import litm from "../images/lit(m).png";

const projects = [
  { name: "GoSnooze", image: goSnooze, tech: "React Native · TypeScript · Firebase", link: "https://github.com/meganchun/goSnooze" },
  { name: "Binge", image: binge, tech: "Java · Weka · FastAPI", link: "https://github.com/meganchun/Binge" },
  { name: "Super Foodio", image: foodio, tech: "Java", link: "https://github.com/meganchun/Super-Foodio" },
  { name: "FindMyUni", image: findMyUni, tech: "Java", link: "https://github.com/meganchun/findmyuni" },
  { name: "Bohnanza", image: bohnanza, tech: "Java", link: "https://github.com/meganchun/Bohnanza" },
  { name: "Lit(m)", image: litm, tech: "Python · Flask · Raspberry Pi · TwelveLabs", link: "https://devpost.com/software/lit-em" },
  { name: "Newsflix", image: newsflix, tech: "React · JavaScript · Python · Flask", link: "https://devpost.com/software/newsflix" },
  { name: "Meglino", image: meglino, tech: "Java", link: "https://github.com/meganchun/Meglino" },
];

export default function Carousel3D() {
  const [active, setActive] = useState(0);
  const [position, setPosition] = useState(0);
  const [interacting, setInteracting] = useState(false);
  const positionRef = useRef(0);
  const stageRef = useRef(null);
  const dragRef = useRef(null);
  const wheelRef = useRef(null);
  const suppressClickRef = useRef(false);
  const updatePosition = useCallback((value) => {
    positionRef.current = value;
    setPosition(value);
  }, []);
  const settle = useCallback((value) => {
    const target = Math.round(value);
    updatePosition(target);
    setActive(((target % projects.length) + projects.length) % projects.length);
    setInteracting(false);
  }, [updatePosition]);
  const move = (direction) => {
    wheelRef.current?.();
    settle(Math.round(positionRef.current) + direction);
  };
  const stepSize = () => parseFloat(getComputedStyle(stageRef.current).getPropertyValue("--step")) || 285;

  useEffect(() => {
    const stage = stageRef.current;
    let origin = null;
    let distance = 0;
    let resetTimer;
    const finish = () => {
      clearTimeout(resetTimer);
      if (origin !== null) settle(origin + (Math.abs(distance) >= 40 ? Math.sign(distance) : 0));
      origin = null;
      distance = 0;
    };
    wheelRef.current = finish;
    const onWheel = (event) => {
      if (event.ctrlKey || dragRef.current) return;
      const delta = event.shiftKey && !event.deltaX ? event.deltaY : event.deltaX;
      if (!delta || (!event.shiftKey && Math.abs(event.deltaY) > Math.abs(event.deltaX))) return;
      event.preventDefault();
      if (origin === null) origin = Math.round(positionRef.current);
      distance += delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stage.clientWidth : 1);
      const step = parseFloat(getComputedStyle(stage).getPropertyValue("--step")) || 285;
      setInteracting(true);
      updatePosition(origin + Math.max(-1, Math.min(1, distance / step)));
      clearTimeout(resetTimer);
      resetTimer = setTimeout(finish, 140);
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      stage.removeEventListener("wheel", onWheel);
      clearTimeout(resetTimer);
      wheelRef.current = null;
    };
  }, [settle, updatePosition]);
  const project = projects[active];
  const offsetFor = (index) => {
    let offset = ((index - position) % projects.length + projects.length) % projects.length;
    if (offset > projects.length / 2) offset -= projects.length;
    return offset;
  };
  const endDrag = (event, cancelled = false) => {
    const drag = dragRef.current;
    if (!drag) return;
    if (drag.dragging) {
      const distance = drag.x - event.clientX;
      settle(drag.origin + (!cancelled && Math.abs(distance) >= 40 ? Math.sign(distance) : 0));
    }
    dragRef.current = null;
  };

  return <div className="project-carousel" role="region" aria-roledescription="carousel" aria-label="Selected projects" tabIndex={0}
    onKeyDown={(event) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        move(event.key === "ArrowRight" ? 1 : -1);
      }
    }}>
    <div className={`project-stage${interacting ? " is-interacting" : ""}`} ref={stageRef}
      onDragStart={(event) => event.preventDefault()}
      onPointerDown={(event) => {
        if (!event.isPrimary || event.button !== 0) return;
        wheelRef.current?.();
        suppressClickRef.current = false;
        dragRef.current = { x: event.clientX, y: event.clientY, origin: Math.round(positionRef.current), dragging: false };
      }}
      onPointerMove={(event) => {
        const drag = dragRef.current;
        if (!drag) return;
        const dx = event.clientX - drag.x;
        const dy = event.clientY - drag.y;
        if (!drag.dragging && Math.abs(dy) > Math.max(10, Math.abs(dx))) { dragRef.current = null; return; }
        if (!drag.dragging && Math.abs(dx) > 10) {
          drag.dragging = true;
          suppressClickRef.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          setInteracting(true);
        }
        if (drag.dragging) updatePosition(drag.origin - Math.max(-1, Math.min(1, dx / stepSize())));
      }}
      onPointerUp={(event) => endDrag(event)}
      onPointerCancel={(event) => endDrag(event, true)}
      onLostPointerCapture={(event) => endDrag(event, true)}
      onClickCapture={(event) => {
        if (suppressClickRef.current) { event.preventDefault(); event.stopPropagation(); suppressClickRef.current = false; }
      }}>
      {projects.map((item, index) => {
        const offset = offsetFor(index);
        const visible = Math.abs(offset) <= 3;
        const selected = index === active;
        const style = { "--offset": offset, "--distance": Math.abs(offset), zIndex: 10 - Math.round(Math.abs(offset)) };
        return <a key={item.name} className={`project-slide${selected ? " is-active" : ""}${visible ? "" : " is-hidden"}`} style={style} href={item.link} target="_blank" rel="noopener noreferrer" draggable="false" tabIndex={visible ? 0 : -1} aria-hidden={!visible} aria-label={`${selected ? "View" : "Select"} ${item.name}`}
          onClick={(event) => {
            if (!selected) {
              event.preventDefault();
              wheelRef.current?.();
              settle(positionRef.current + offsetFor(index));
            }
          }}><img src={item.image} alt={selected ? `${item.name} project preview` : ""} draggable="false" /></a>;
      })}
    </div>
    <div className="project-details content-column">
      <div className="project-caption" aria-live="polite" aria-atomic="true"><div className="project-caption-content" key={project.name}><a href={project.link} target="_blank" rel="noopener noreferrer">{project.name}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" focusable="false"><path d="M5 19 19 5M5 5h14v14" /></svg></a><p>{project.tech}</p></div></div>
      <div className="carousel-controls">
        <button type="button" onClick={() => move(-1)} aria-label="Previous project"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" focusable="false"><path d="M20 12H4m6-6-6 6 6 6" /></svg></button>
        <span className="carousel-position" aria-label={`Project ${active + 1} of ${projects.length}`}><span className="carousel-current">{String(active + 1).padStart(2, "0")}</span><span className="carousel-divider" aria-hidden="true">/</span><span>{String(projects.length).padStart(2, "0")}</span></span>
        <button type="button" onClick={() => move(1)} aria-label="Next project"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" focusable="false"><path d="M4 12h16m-6-6 6 6-6 6" /></svg></button>
      </div>
    </div>
  </div>;
}
