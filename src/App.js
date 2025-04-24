import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "motion/react";
import {
  faLocationDot,
  faHeart,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import { faLinkedin, faGithub } from "@fortawesome/free-brands-svg-icons";
import Pill from "./components/Pill";
import Banner from "./components/Banner";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import ExperienceCard from "./components/ExperienceCard";

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
  const [goToSlide, setGoToSlide] = useState(0);
  const [userLocation, setUserLocation] = useState("");
  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 5,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };

  useEffect(() => {
    fetch("https://ipwho.is/")
      .then((res) => res.json())
      .then((data) => setUserLocation(`${data.city}, ${data.region_code}`))
      .catch((err) => console.error("Location fetch error:", err));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIconOrder((prev) => {
        const [first, ...rest] = prev;
        return [...rest, first];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const projects = [
    {
      name: "test0",
      description: "mobile app for GO transit users",
      link: "https://picsum.photos/800/800/?random",
      image: "https://picsum.photos/800/800/?random",
    },
    {
      name: "test1",
      description: "mobile app for GO transit users",
      link: "https://picsum.photos/800/800/?random",
      image: "https://picsum.photos/800/800/?random",
    },
    {
      name: "test3",
      description: "mobile app for GO transit users",
      link: "https://picsum.photos/800/800/?random",
      image: "https://picsum.photos/800/800/?random",
    },
    {
      name: "test4",
      description: "mobile app for GO transit users",
      link: "https://picsum.photos/800/800/?random",
      image: "https://picsum.photos/800/800/?random",
    },
    {
      name: "test5",
      description: "mobile app for GO transit users",
      link: "https://picsum.photos/800/800/?random",
      image: "https://picsum.photos/800/800/?random",
    },
  ];

  const handleProjectClick = (link) => {
    console.log(link);
  };

  const handleLike = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);

    try {
      await fetch("https://formsubmit.co/meganwchun@gmail.com", {
        method: "POST",
        body: formData,
      });
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };
  useEffect(() => {
    console.log(goToSlide);
  }, [goToSlide]);
  return (
    <div class="App flex flex-col w-full relative items-center overflow-hidden">
      <Banner />

      <form
        action="https://formsubmit.co/meganwchun@gmail.com"
        method="POST"
        data-formsubmit="true"
        onSubmit={handleLike}
      >
        <input type="hidden" name="_subject" value="New Like!" />
        <input type="hidden" name="_captcha" value="false" />
        <input type="text" name="user-location" value={userLocation} hidden />
        <button
          type="submit"
          className="fixed bottom-0 mb-8 flex flex-row gap-2 items-center w-content px-4 py-2 bg-white/80 z-[100] rounded-full left-1/2 transform -translate-x-1/2 z-1000"
        >
          <div className="w-8 h-8 bg-primary-light rounded-full relative">
            <FontAwesomeIcon
              icon={faHeart}
              className="text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-1000"
            />
          </div>

          <p className="text-primary-light">12</p>
        </button>
      </form>

      {/* Header Section */}
      <motion.header
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        class="header justify-center w-[351px] flex flex-col gap-6 items-start h-[90vh]"
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
          Hey! Glad you could stop by. I’m currently a student at the University
          of Waterloo, who’s passionate about driving change through technology.
          When i’m not studying you’ll probably find me:
        </p>
        <div className="ml-2 text-text-secondary">
          <p>1. trying new cafe</p>
          <p>2. drinking a coffee or matcha</p>
          <p>3. at the gym or computer</p>
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
                What i've been up to + my past adventures
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
        class="projects flex flex-col w-full justify-center text-center items-center mb-36"
      >
        <div className="project-header flex flex-col gap-8">
          <div className="title-wrapper">
            <h2 className="text-text">My Projects</h2>
            <p className="text-text-secondary">
              Want to learn more? Check out my{" "}
              <span className="underline">Github</span>
            </p>
          </div>

          <div className="carousel-container flex flex-col w-[90vw]">
            <Carousel
              swipeable
              showDots
              responsive={responsive}
              renderDotsOutside
              centerMode
              infinite
              ssr
              keyBoardControl
              customTransition="transform 500ms ease-in-out"
              transitionDuration={500}
              containerClass="carousel-container"
              dotListClass="mt-6 flex justify-center items-center gap-2"
              itemClass="carousel-item-padding-40-px"
              afterChange={(index) => setGoToSlide(index)}
              removeArrowOnDeviceType={["tablet", "mobile"]}
            >
              {projects.map((project, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center p-4"
                  onClick={() => handleProjectClick(project.link)}
                >
                  <img
                    src={project.image}
                    alt={project.name}
                    className={`rounded-lg transition-all duration-300 ${
                      goToSlide === index
                        ? "ring-2 ring-primary shadow-lg"
                        : "opacity-80"
                    }`}
                  />
                  <p className="font-bold mt-2">{project.name}</p>
                  <p className="text-sm text-text-secondary">
                    {project.description}
                  </p>
                </div>
              ))}
            </Carousel>
          </div>
        </div>
      </motion.div>
      <motion.footer
        initial={{ scale: 0.9 }}
        whileInView={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ amount: 0.1 }}
        class="flex flex-col m-10 sm:m-10 md:m-20 items-center gap-2"
      >
        <p className="text-text-secondary">
          Thanks for taking the time to check out my corner of the internet.
        </p>
        <div className="socials flex gap-8 text-text-secondary">
          <a
            href="https://www.linkedin.com/in/your-profile"
            target="_blank"
            className="hover:text-primary transition-colors"
          >
            <FontAwesomeIcon icon={faLinkedin} />
          </a>

          <a
            href="https://github.com/your-username"
            target="_blank"
            className="hover:text-primary transition-colors"
          >
            <FontAwesomeIcon icon={faGithub} />
          </a>

          <a
            href="mailto:megan.chun@uwaterloo.ca"
            className="hover:text-primary transition-colors"
          >
            <FontAwesomeIcon icon={faEnvelope} />
          </a>
        </div>
      </motion.footer>
    </div>
  );
}

export default App;
