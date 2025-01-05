import React, { useState } from 'react';
import { FaClockRotateLeft } from "react-icons/fa6";
import { LuFolderArchive } from "react-icons/lu";
import { IoHomeOutline } from "react-icons/io5";
import Folder from '../components/Folder';
import { motion } from "motion/react"

export function Recents() {

    const recents = [
        {
            name: "Folio Inc",
            role: "Software Developer",
            year: "2025-Present"
        },
        {
            name: "UW Blueprint",
            role: "Project Developer",
            year: "2024-Present"
        }
    ]
    return (
        <div>
            <div class="flex flex-wrap">
                {recents.map((data, index) => (
                    <Folder key={index} info={data} />
                ))}
            </div>
          
        </div>
    );

}

export function Archives() {

    const pastExperiences = [
        {
            name: "Ignition Hacks",
            role: "Co-Director",
            year: "2023-2024"
        },
        {
            name: "Ignition Hacks",
            role: "Finance Director",
            year: "2022-2023"
        },
        {
            name: "CUTC",
            role: "Sponsorship",
            year: "2022-2023"
        }
    ]

  

    return (

            <div class="flex flex-wrap">
                {pastExperiences.map((data, index) => (
                    <Folder
                        key={index}
                        info={data}
                    />
                ))}
                </div>
    );
}

export function Home() {
    return (
        <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ amount: 0.2 }}
        class="text-primary">
            <p >1. I’m always open to exploring new areas in tech
            <br/>2. I love all things coffee and matcha</p>
            <p class="mt-5">I'm Megan, a Computer Enginnering student at the University of Waterloo passionate about making change wherever I am. 
                With a keen interest in full stack development, design, and machine learning, I focus on building innovative solutions that promote social good. I love turning ideas into impactful projects and 
                continuously exploring new ways to use technology to make a difference.
                Outside of my tech interests, you'll most often find me trying out new cafes and restaurants, or going to the gym.</p>
        </motion.div>
    )
}


function AboutMe() {

    const [fileTopic, setFileTopic] = useState("meganchun")

    const handleClick = (topic) => {
        setFileTopic(topic)
    }

    const topics = ["Recents","Archives","meganchun"]
    const topicIcons = [<FaClockRotateLeft />,<LuFolderArchive />,<IoHomeOutline />]

    return(
        <div class="about-container bg-pink p-1 rounded-b-3xl pb-14 px-10 sm:px-20">
            <div class="tab-title-text pb-5 md:pb-5 mt-10 sm:mt-14">
                <h3 class="text-primary italic">downloads/aboutMe</h3>
                <h1 class="text-primary text-xl font-semibold">Learn more about me.</h1>
            </div>
            <div class="about-content flex flex-col sm:flex-row">
                <div class="side-panel w-full sm:w-1/4 sm:mr-16 flex flex-col items-center sm:items-start">
                    <motion.img  
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ amount: 0.2 }}
                    transition={{duration: 0.4}}
                    src={require("../images/headshot.png")} alt="Headshot" class="w-2/3 justify-center sm:w-full aspect-square object-cover rounded-full"/>
                    <div class="menu-select flex flex-col text-primary justify-center w-full lg:w-2/3">
                        <h2 class="font-medium text-primary/50 mt-5 sm:mt-10">Favourites</h2>
                        {topics.map((topic, index) => (
                            <button class={`menu-option flex flex-row items-center p-1 my-1 duration-150 rounded w-auto hover:bg-primary/15 ${fileTopic === topic ? 'bg-primary/15' : 'bg-transparent'}`}
                                onClick={() => handleClick(topic)}>
                                <span className="icon mx-2">{topicIcons[index]}</span>
                                <h3>{topic}</h3>
                            </button>
                        ))}
                    </div>
                </div>
                <div class="about-right-content flex-1 mt-10 sm:mt-0 w-full">
                    <div class="about-text text-primary w-full">
                        <h1 ><span class="font-bold">Megan Chun • </span>1B CE @UW</h1>
                        <h2 class="text-primary/75">[ m EH - g uh n ] <span class="italic">she/her</span> </h2> 
                        <div class="divider-line w-full border-[0.5px] border-primary/15 my-10"></div>
                    </div>
                    {fileTopic === "Recents" && <Recents></Recents>}
                    {fileTopic === "Archives" && <Archives></Archives>}
                    {fileTopic === "meganchun" && <Home></Home>}
                </div>
            </div>
          
        </div>
    );
}

export default AboutMe;