import React , { useState } from 'react';
import Project from '../components/Project';
import { LuGalleryThumbnails } from "react-icons/lu";
import { MdOutlineFormatListBulleted } from "react-icons/md";
import { RiGalleryView2 } from "react-icons/ri";
import { motion } from "framer-motion";

function MyProjects() {

    const boxesContainerStyling = "project flex justify-center items-center min-h-screen mb-10"
    const boxesStyling = "grid justify-between grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 place-items-center";
    
    const listContainerStyling = "project flex justify-start mb-20 items-center"
    const listStyling = "flex flex-col gap-10 w-full"

    const galleryContainerStyling = "project flex justify-center items-center mb-10"
    const galleryStyling = "grid justify-between grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 place-items-center";

    const [containerLayout,setContainerLayout] = useState(boxesContainerStyling);
    const [viewLayout,setViewLayout] = useState(boxesStyling);
    const [viewButton,setViewButton] = useState('boxes');

    const handleClick = (layout) => {
        setViewButton(layout)
        if (layout === 'boxes') {
            setContainerLayout(boxesContainerStyling)
            setViewLayout(boxesStyling)
            setViewButton('boxes')
        }
        else if (layout === 'list') {
            setContainerLayout(listContainerStyling)
            setViewLayout(listStyling)
            setViewButton('list')
        }
        else {
            setContainerLayout(galleryContainerStyling)
            setViewLayout(galleryStyling)
            setViewButton('gallery')

        }
    }

    const projects = [
        {   name: "Portfolio v.2", 
            info: "Machine learning-powered recipe suggestion app that revolutionizes meal planning by analyzing user preferences and ingredient availability. User's have the ablitiy to build their tailored portfolio by taking live quizzes and can upload photos of their ingredients to find recipes using image recongnition.",
            tech: ["Javascript", "React"],
            link: "https://github.com/meganchun/meganchun.github.io"
        },
        {   name: "Binge", 
            info: "Machine learning-powered recipe suggestion app that revolutionizes meal planning by analyzing user preferences and ingredient availability. User's have the ablitiy to build their tailored portfolio by taking live quizzes and can upload photos of their ingredients to find recipes using image recongnition.",
            tech: ["Java", "Weka"],
            link: "https://github.com/meganchun/Binge"
        },
        {   name: "FindMyUni", 
            info: "Discover and stay informed with our university program app tailored to your academic journey. Effortlessly explore upcoming events, program updates, and relevant opportunities based on your saved programs, ensuring you never miss a crucial deadline or enriching campus activity.",
            tech: ["Java", "JSoup"],
            link: "https://github.com/meganchun/FindMyUni"
        },
        {   name: "Bohnanza", 
            info: "Experience the classic card game Bohnanza like never before with our online adaptation featuring player vs. player (PvP) and player vs. smart computer modes.",
            tech: ["Java"],
            link: "https://github.com/meganchun/Bohnanza"
        },
        {   name: "Meglino",
            info: "Created based on the iconic language learning Duolingo, Meglino features module based learning about arrays. User will be able to unlock lessons based on their previous scores and challenge themselves and they progress.",
            tech: ["Java"],
            link: "https://github.com/meganchun/Meglino",
        },
        {   name: "Super Foodio",
            info: "Super Foodio is a video game created using Java. The game was created with additional features such as saving highscores to an external file, sound effects, progessive level unlocking system and the ablitiy to choose different themes and characters.",
            tech: ["Java"],
            link: "https://github.com/meganchun/Super-Foodio",
        },
        {   name: "Laptop Store",
            info: "Computer BOSS is a laptop store created using Java Swing. It allows user's to purchase items by adding laptops to their cart, as well as a feature to take a survey to find a computer match curated for them.",
            tech: ["Java"],
            link: "https://github.com/meganchun/Laptop-Store",
        },
        {   name:"Portfolio v.1",
            info: "My first experience building and launching a website. My personal webiste portfolio enabled me to explore UI/UX design while integrating my knowledge of HTML, CSS and Javascript.",
            tech: ["HTML","CSS","Javascript"],
            link: "https://portfolio-version-c0tptmafk-meganwchun-gmailcom.vercel.app"
        },
    ]

    const [selectedProject,setSelectedProject] = useState(projects[0]);
    const handleProjectClick = (project) => {
        setSelectedProject(project);
    }
   
    return(
        <div class="project-container bg-purple p-1 rounded-b-3xl pb-14 px-10 sm:px-20">
            <div class="tab-title mt-14 flex flex-col sm:flex-col md:flex-row justify-start sm:justify-start md:justify-between md:items-center">
                <div class="tab-title-text pb-5 md:pb-5">
                    <h3 class="text-primary italic">downloads/myProjects</h3>
                    <h1 class="text-primary text-xl font-semibold">What I have done + currently working on</h1>
                </div>
                <div class="rounded-md duration-150 tab-title-button text-primary space-x-1 hover:bg-primary/15">
                    <button onClick={() => handleClick('boxes')} className={`px-4 py-2 rounded ${viewButton === 'boxes' ? 'bg-primary/15' : 'bg-transparent'}`}><RiGalleryView2 class="size-5"/></button>
                    <button onClick={() => handleClick('list')} className={`px-4 py-2 rounded ${viewButton === 'list' ? 'bg-primary/15' : 'bg-transparent'}`}><MdOutlineFormatListBulleted class="size-5"/></button>
                    <button onClick={() => handleClick('gallery')} className={`px-4 py-2 rounded ${viewButton === 'gallery' ? 'bg-primary/15' : 'bg-transparent'}`}><LuGalleryThumbnails class="size-5"/></button>
                </div>
            </div>
            {viewButton === 'gallery' && (
                <div className="flex justify-center items-center w-full rounded h-auto mt-10">
                    <img 
                        src={require(`../images/${selectedProject.name}.png`)} 
                        alt={selectedProject.name} 
                        className="w-1/2 object-contain rounded"
                    />
                </div>
            )}
            <div className={containerLayout}>
                <div initial={{ scale: 0 }} animate={{ scale: 1 }} class={viewLayout}>
                    {projects.map((project, index) => (
                        <Project 
                            key={index} 
                            project={project}
                            styling={viewButton}
                            parentHandle={handleProjectClick}
                            isSelected={selectedProject === project}/>
                    ))}
                </div>
            </div>
       
        </div>
       
    );
}

export default MyProjects;