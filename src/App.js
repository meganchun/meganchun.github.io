import React, { useRef, useState } from "react";
import { FaEnvelope, FaLinkedin, FaGithub } from "react-icons/fa";
import Carousel3D from "./components/Carousel";
import LikeButton from "./components/LikeButton";
import LikeSky from "./components/LikeSky";
import StarFlight from "./components/StarFlight";
import ShootingStars from "./components/ShootingStars";
import CurrentLocationTime from "./components/CurrentLocationTime";
import { Location } from "./types/location";
import sun from "./images/sun.png";
import comet from "./images/large-comet.png";
import logo8090 from "./images/8090-logo.png";
import folio from "./images/folio-logo.png";
import blueprint from "./images/uw-blueprint-logo.png";
import hackTheNorth from "./images/hack-the-north.png";
import ignition from "./images/ignition-hacks.png";

const work = [
  { role: "Member of Technical Staff", company: "8090", logo: logo8090, date: "May 2026 – Aug 2026", link: "https://www.8090.ai/" },
  { role: "Member of Technical Staff", company: "8090", logo: logo8090, date: "Sept 2025 – Dec 2025", link: "https://www.8090.ai/" },
  { role: "Software Developer", company: "Folio", logo: folio, date: "Jan 2025 – Apr 2025", link: "https://www.linkedin.com/company/folio-tech-inc/" },
];
const fun = [
  { role: "Co-Director", company: "Hack the North", logo: hackTheNorth, link: "https://hackthenorth.com/" },
  { role: "Frontend Developer", company: "Hack the North", logo: hackTheNorth, link: "https://hackthenorth.com/" },
  { role: "Developer", company: "UW Blueprint", logo: blueprint, link: "https://uwblueprint.org/" },
  { role: "Co-Director", company: "Ignition Hacks", logo: ignition, link: "https://www.ignitionhacks.org/" },
  { role: "Cafe Enjoyer", company: "where ever I am", symbol: "☕", link: "https://beliapp.co/app/meganchun" },
];

function Experience({ title, entries }) {
  return <section className="experience-section content-column" aria-label={title}>
    <h2>{title}</h2>
    <ul className="experience-list">
      {entries.map((entry, index) => <li key={`${entry.company}-${index}`}><a className="experience-row" href={entry.link} target="_blank" rel="noopener noreferrer">
        {entry.logo ? <img className="company-logo" src={entry.logo} alt="" /> : <span className="company-logo cafe-icon" aria-hidden="true">{entry.symbol}</span>}
        <div className="experience-label"><span>{entry.role}</span><span className="company-name"> @ {entry.company}</span></div>
        {entry.date && <span className="experience-date">{entry.date}</span>}
      </a></li>)}
    </ul>
  </section>;
}

function App() {
  const skyRef = useRef(null);
  const positionRef = useRef(null);
  const [flight, setFlight] = useState(null);
  return <div className="portfolio">
    <div className="space-background" aria-hidden="true">
      <img src={comet} className="comet" alt="" />
    </div>
    <LikeSky canvasRef={skyRef} positionRef={positionRef} arrivingStar={flight?.star} arrived={flight?.arrived} />
    <div className="sun" aria-hidden="true"><img src={sun} alt="" /></div>
    {flight && <StarFlight key={flight.star.id} flight={flight} skyRef={skyRef} positionRef={positionRef}
      onArrival={() => setFlight((current) => current ? { ...current, arrived: true } : current)} />}
    <ShootingStars />
    <main>
      <header className="intro content-column">
        <h1>Megan Chun</h1>
        <p className="subtitle">Student / Software Developer</p>
        <p className="intro-description">A Computer Engineering student @ University of Waterloo. Thanks for visiting my little corner of the universe.</p>
        <p className="contact-line">Want to learn more? Contact me by <a href="mailto:megan.chun@uwaterloo.ca"><FaEnvelope aria-hidden="true" />email</a>, check out my <a href="https://www.linkedin.com/in/meganchun" target="_blank" rel="noopener noreferrer"><FaLinkedin aria-hidden="true" />linkedin</a> or <a href="https://github.com/meganchun" target="_blank" rel="noopener noreferrer"><FaGithub aria-hidden="true" />github</a></p>
      </header>
      <Experience title="WORK LIFE" entries={work} />
      <Experience title="FOR FUN" entries={fun} />
      <section className="projects-section" aria-labelledby="projects-heading">
        <div className="content-column"><h2 id="projects-heading">PROJECTS</h2></div>
        <Carousel3D />
      </section>
    </main>
    <footer className="content-column footer"><span>© {new Date().getFullYear()} MEGAN</span><CurrentLocationTime location={Location.Waterloo} /></footer>
    <LikeButton onStarSaved={(star, origin) => setFlight({ star, origin, arrived: false })} />
  </div>;
}

export default App;
