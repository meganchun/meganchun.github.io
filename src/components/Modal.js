import React from 'react';
import { IoIosArrowForward } from "react-icons/io";
import { FaGithub } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";

function Modal({project, isVisible, closeModal}) {
    
    if (!isVisible) return null; // Don't render if the modal is not visible

    return(
        <div className="overlay fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-purple/50 z-50">
            <div className="modal-content bg-primary p-8 rounded w-2/3 ">
                <img src={require(`../images/${project.name}.png`)} alt={project.name} class="h-[200px] w-full object-cover border border-purple/50"></img>
                <h2 class="mt-5 font-semibold text-purple">{project.name}</h2>
                <p class="text-purple/75">{project.info}</p>
                <div class="link-button flex flex-row justify-between w-full bg-[#ffff] rounded mt-5 items-center px-5 text-teal font-medium hover:bg-teal hover:text-primary duration-200">
                    <div class="flex items-center">
                        {project.name === "Portfolio v.1" ? <FiExternalLink /> : <FaGithub />}
                        <button className="ml-2 py-2">Learn more about {project.name}</button>
                    </div>
                    <IoIosArrowForward />
                </div>
                <div class='bottom-modal flex flex-row items-end justify-between mt-5 '>
                    <div class="tech-tools">
                        <h2 class="font-semibold text-purple">Technologies/Tools</h2>
                        <div class="flex flex-row mt-2">
                            {project.tech.map((tech, index) => (
                                <h2 key={index} class="text-primary bg-teal mr-3 px-3 py-1 rounded">{tech}</h2>
                            ))}
                        </div>
                    </div>
                    <button onClick={closeModal} className="close-button border border-pink px-10 py-2 rounded hover:bg-pink hover:text-primary duration-200">Close</button>
                </div>
            </div>
        </div>
    );
}

export default Modal;