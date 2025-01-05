import React, { useState } from 'react';
import Typewriter from 'typewriter-effect';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import clsx from 'clsx';
import AboutMe from './pages/AboutMe';
import MyProjects from './pages/MyProjects';
import ContactMe from './pages/ContactMe';
import { motion } from "motion/react";

function App() {
    
  React.useEffect(() => {
    const link1 = document.createElement('link');
    link1.rel = 'preconnect';
    link1.href = 'https://fonts.googleapis.com';
    document.head.appendChild(link1);

    const link2 = document.createElement('link');
    link2.rel = 'preconnect';
    link2.href = 'https://fonts.gstatic.com';
    link2.crossOrigin = 'anonymous';
    document.head.appendChild(link2);

    const link3 = document.createElement('link');
    link3.rel = 'stylesheet';
    link3.href =
      'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap';
    document.head.appendChild(link3);
  }, []);

  const tabs = ['myProjects','aboutMe','contactMe'];
  const colours = ['purple','pink','teal'];
  const [currentTab, setCurrentTab] = useState('myProjects');

  const handleTabClick = (tab) => {
    setCurrentTab(tab);
  }

  return (
    <div class="App font-sans bg-primary relative">
      <motion.header 
        initial={{ scale: 0.5 }} 
        animate={{ scale: 1 }} 
        transition={{ duration: 0.5 }}
        class="header text-purple mx-14 mt-24 sm:mx-20 sm:mt-16 sm:mt-32 lg:mx-40 lg:mt-40 flex justify-between items-start h-[65vh]">
        <div class="header-text space-y-5">
          <h1 class="header-text text-4xl font-medium tracking-wide">
            Hi there, <br/>
            I'm Megan...
          </h1>
          <div class="flex min-w-80 w-96"> 
            <div class="search-bar text-lg items-center w-full flex justify-between border-2 
              rounded-full px-5 py-1">
              <Typewriter 
                options={{
                  strings: ['an avid learner', 'a bubble tea lover', 'a developer'],
                  autoStart: true,
                  loop: true,
                }}
              />
                <FontAwesomeIcon icon={faMagnifyingGlass} />
            </div>         
          </div>
        </div>
        <div class="header-dots flex items-center space-x-3">
          <div class="w-3 h-3 bg-pink rounded-full"></div>
          <div class="w-3 h-3 bg-purple rounded-full"></div>
          <div class="w-3 h-3 bg-teal rounded-full"></div>
        </div>
      </motion.header>
      <main class="relative">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, amount: 0.5 }}
          class="tabs flex w-full justify-center text-center text-primary h-14">
          {tabs.map((item, index) => (
            <button 
              key={index}
              onClick={() => handleTabClick(item)}
              className={clsx('rounded-t-3xl w-full content-center text-lg duration-200 hover:scale-110 hover:-translate-y-0.5', `bg-${colours[index]}`)}>
              {item}
            </button>
          ))}
        </motion.div>
        <div class="folder-page">
          {currentTab === 'myProjects' && <MyProjects class=""/>}
          {currentTab === 'aboutMe' && <AboutMe />}
          {currentTab === 'contactMe' && <ContactMe />}
        </div>
      </main>
      <motion.footer 
         initial={{ scale: 0.9 }} 
         whileInView={{ scale: 1 }}
         transition={{ duration: 0.5 }}
         viewport={{ amount: 0.1 }}
         class="flex flex-col m-10 sm:m-10 md:m-20">
          <p1>Handcrafted and coded with love 💕</p1>
          <p1>2025. Megan Chun.</p1>
      </motion.footer>

    </div>
  );
}

export default App;
