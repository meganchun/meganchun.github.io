import React from "react";
import Carousel from "react-spring-3d-carousel";
import { useState } from "react";
import { config } from "react-spring";
import ProjectCard from "./ProjectCard";

export default function Carousel3D() {
  const projects = [
    {
      name: "goSnooze",
      description: "Mobile app for GO transit users",
      tech: ["REACT NATIVE", "TYEPSCRIPT", "FIREBASE"],
      link: "https://github.com/meganchun/goSnooze",
      year: 2025,
    },
    {
      name: "Binge",
      description: "Web app for smart recipe suggestions.",
      tech: ["JAVA", "WEKA", "FAST API"],
      link: "https://github.com/meganchun/Binge",
      year: 2024,
    },
    {
      name: "Super Foodio",
      description: "Interactive game inspired by Super Mario",
      type: "WEB",
      tech: ["JAVA"],
      link: "https://github.com/meganchun/Super-Foodio",
      year: 2023,
    },
    {
      name: "Meglino",
      description: "Interactive language learning game.",
      tech: ["JAVA"],
      link: "https://github.com/meganchun/Meglino",
      year: 2023,
    },
    {
      name: "Newsflix",
      description: "Removing the bias from media",
      tech: ["REACT", "JAVASCRIPT", "PYTHON", "FLASK"],
      link: "https://devpost.com/software/newsflix",
      year: 2024,
    },
    {
      name: "FindMyUni",
      description: "Web app to find your perfect program.",
      tech: ["JAVA"],
      link: "https://github.com/meganchun/findmyuni",
      year: 2024,
    },
    {
      name: "Bohnanza",
      description: "Online card game.",
      tech: ["JAVA"],
      link: "https://github.com/meganchun/Bohnanza",
      year: 2024,
    },
    {
      name: "Lit(m)",
      description: "Live in the moment — Lit(m) takes care of the rest.",
      tech: ["PYTHON, FLASK, RASPBERRY PI, TWELVELABS"],
      link: "https://devpost.com/software/lit-em",
      year: 2025,
    },
  ];

  const [goToSlide, setGoToSlide] = useState(0);
  const slides = projects.map((project, index) => ({
    key: index,
    content: (
      <ProjectCard
        project={project}
        index={index}
        isCenter={goToSlide === index}
      />
    ),
    onClick: () => setGoToSlide(index),
  }));

  return (
    <div className="w-full h-content bg-primary">
      <Carousel
        slides={slides}
        goToSlide={goToSlide}
        offsetRadius={2}
        showNavigation={false}
        animationConfig={config.gentle}
      />
    </div>
  );
}
