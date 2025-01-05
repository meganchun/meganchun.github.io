import React, { useState , useEffect } from 'react';
import Modal from './Modal';
import { motion } from "motion/react"

function Project({ project, styling , parentHandle }) {

    const [isModalVisible, setIsModalVisible] = useState(false);

    const openModal = () => {
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
    };

    const handleSelect = () => {
        if (styling === 'gallery') { 
            parentHandle(project);
        }
        else {
            openModal();
        }
    };

    const boxesStyling = "group text-primary w-[300px] h-[300px] m-12"
    const boxesParentStyling = "h-full flex flex-col justify-between items-center"
    const boxesImageStyling = "size-[89%] flex justify-center items-center rounded-md transition-all duration-300 group-hover:bg-primary/15"
    const boxesTextStyling = "transition-all duration-250 group-hover:bg-teal px-4 rounded-sm"
    
    const listStyling = "group text-primary w-full h-auto duration-250 rounded hover:bg-primary/15"
    const listParentStyling = "w-full flex items-center p-5"
    const listImageStyling =  "mr-10 w-1/5 items-center"
    const listTextStyling = "text-lg flex-2 font-semibold"

    const galleryStyling = 'group text-primary w-full h-auto duration-250 rounded hover:bg-primary/15';
    const galleryParentStyling = "w-full flex flex-col content-between p-5"
    const galleryImageStyling =  "size-full"
    const galleryTextStyling = "text-sm flex-2 mt-2 font-md"

    const [layout, setLayout] = useState(boxesStyling);
    const [parentLayout, setParentLayout] = useState(boxesParentStyling);
    const [imageLayout, setImageLayout] = useState(boxesImageStyling);
    const [textLayout, setTextLayout] = useState(boxesTextStyling);

    useEffect(() => {
        if (styling === 'boxes') {
            setLayout(boxesStyling)
            setParentLayout(boxesParentStyling)
            setImageLayout(boxesImageStyling)
            setTextLayout(boxesTextStyling)
        } else if (styling === 'list') {
            setLayout(listStyling)
            setParentLayout(listParentStyling);
            setImageLayout(listImageStyling);
            setTextLayout(listTextStyling);
        } else {
            setLayout(galleryStyling)
            setParentLayout(galleryParentStyling);
            setImageLayout(galleryImageStyling);
            setTextLayout(galleryTextStyling);
        }
    }, [styling]); // Trigger when `styling` prop cha
    // nges

    return(
        <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ amount: 0.2 }}>
            <button class={layout}
                onClick={handleSelect}>
                    <div class={parentLayout}>
                        <div class={imageLayout}>
                            <img src={require(`../images/${project.name}.png`)} alt={project.name} className={`rounded ${styling === 'boxes' && 'size-10/12'}`} />
                        </div>
                        <div className={`${styling === 'list' && 'justify-right text-left w-4/5'}`}>
                            <h3 class={textLayout}>{project.name}</h3>
                            {styling === 'list' && <p class="text-sm w-full">{project.info}</p>}
                        </div>
                    </div>
            </button>
            <Modal project={project} isVisible={isModalVisible} closeModal={closeModal} />   
        </motion.div> 
    );
}

export default Project;