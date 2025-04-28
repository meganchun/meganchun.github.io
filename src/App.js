import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "motion/react";
import { faLocationDot, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faLinkedin, faGithub } from "@fortawesome/free-brands-svg-icons";
import Pill from "./components/Pill";
import Banner from "./components/Banner";
import "react-multi-carousel/lib/styles.css";
import ExperienceCard from "./components/ExperienceCard";
import Carousel3D from "./components/Carousel";
import LikeButton from "./components/LikeButton";

function App() {
  React.useEffect(() => {
    const link1 = document.createElement("link");
    link1.rel = "preconnect";
    link1.href = "https://fonts.googleapis.com";
    document.head.appendChild(link1);

    const link2 = document.createElement("link");
    link2.rel = "preconnect";
    link2.href = "https://fonts.gstatic.com";
    link2.crossOrigin = "anonymous";
    document.head.appendChild(link2);

    const link3 = document.createElement("link");
    link3.rel = "stylesheet";
    link3.href =
      "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap";
    document.head.appendChild(link3);
  }, []);

  const positions = [
    "leftPosition",
    "topPosition",
    "rightPosition",
    "bottomPosition",
  ];
  const [iconOrder, setIconOrder] = useState([
    { name: "Folio", role: "Software Developer" },
    { name: "Hack the North", role: "Frontend Developer" },
    { name: "UW Blueprint", role: "Project Developer" },
    { name: "Ignition Hacks", role: "Co-Director" },
  ]);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setIconOrder((prev) => {
        const [first, ...rest] = prev;
        return [...rest, first];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div class="App flex flex-col w-full relative items-center overflow-hidden">
      <Banner />
      <LikeButton />

      {/* Header Section */}
      <motion.header
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        class="header justify-center w-[351px] flex flex-col gap-6 items-start h-[80vh]"
      >
        <div className="flex flex-col gap-2">
          <div className="location flex items-center gap-2 text-text-secondary">
            <FontAwesomeIcon icon={faLocationDot} />
            <h3>Waterloo, ON</h3>
          </div>
          <h1 className="header-text text-text">Welcome! I'm Megan.</h1>
          <Pill type="fill">Computer Engineering @ University of Waterloo</Pill>
        </div>

        <p className="description text-text-secondary text-sm/[23px]">
          Hey! Thanks for stopping by. I'm a student at the University of
          Waterloo, driven by a belief that technology should make life more
          enjoyable and meaningful — not just more transactional. When I'm not
          studying, you’ll probably find me:
        </p>
        <div className="ml-2 text-text-secondary">
          <p>1. Trying new cafe</p>
          <p>2. Drinking a coffee or matcha</p>
          <p>3. At the gym or computer</p>
        </div>
      </motion.header>

      {/* Experience Section*/}
      <motion.div
        initial={{ scale: 0.9 }}
        whileInView={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ amount: 0.1 }}
        class="experience flex flex-col w-full justify-center items-center mb-36"
      >
        <div className="experience-header text-center w-[90vw] md:w-[70vw] lg:w-[60vw]">
          <div className="experience-wrapper relative">
            <div className="experience-title absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <h2 className="text-text">My Experience</h2>
              <p className="text-text-secondary">
                What I've been up to + my past adventures.
              </p>
            </div>

            <div className="card-wrapper relative h-96">
              {iconOrder.map((icon, i) => (
                <motion.div
                  key={icon.name}
                  layout
                  animate={hoveredCard ? false : { opacity: 1 }}
                  className={`absolute ${
                    positions[i] === "leftPosition"
                      ? "top-1/3 left-0"
                      : positions[i] === "topPosition"
                      ? "top-0 left-1/2"
                      : positions[i] === "bottomPosition"
                      ? "bottom-0 left-1/3"
                      : "top-1/2 right-0"
                  }`}
                  transition={{
                    type: "spring",
                    stiffness: 35,
                    damping: 25,
                    mass: 5,
                  }}
                  onMouseEnter={() => setHoveredCard(icon.name)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <ExperienceCard
                    text={icon.name}
                    isHovered={hoveredCard === icon.name}
                    role={icon.role}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Projects Section*/}
      <motion.div
        initial={{ scale: 0.9 }}
        whileInView={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ amount: 0.1 }}
        class="projects flex flex-col w-full justify-center text-center items-center mb-48"
      >
        <div className="project-header flex flex-col gap-36 sm:gap-48 md:gap-60">
          <div className="title-wrapper">
            <h2 className="text-text">My Projects</h2>
            <p className="text-text-secondary z-[100]">
              Want to learn more? Check out my{" "}
              <a
                href="https://github.com/meganchun"
                target="_blank"
                className="underline"
                rel="noopener noreferrer"
              >
                GitHub.
              </a>
            </p>
          </div>

          <Carousel3D />
        </div>
      </motion.div>
      <motion.footer
        initial={{ scale: 0.9 }}
        whileInView={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ amount: 0.1 }}
        class="flex flex-col mt-10 sm:mt-24 md:mt-36 mb-12 items-center gap-2"
      >
        <p className="text-text-secondary">Megan Chun. 2025.</p>
        <div className="socials flex gap-8 text-text-secondary">
          <a
            href="https://www.linkedin.com/in/meganchun"
            target="_blank"
            className="hover:text-primary transition-colors"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faLinkedin} />
          </a>

          <a
            href="https://github.com/meganchun"
            target="_blank"
            className="hover:text-primary transition-colors"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faGithub} />
          </a>

          <a
            href="mailto:megan.chun@uwaterloo.ca"
            className="hover:text-primary transition-colors"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faEnvelope} />
          </a>
        </div>
      </motion.footer>
    </div>
  );
}

export default App;
