import React from 'react';
import { motion } from "motion/react"

function Folder({info}) {

    return (
        <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ amount: 0.2 }}
        class="relative w-[227px] mb-2">
            <img src={require("../images/folder.png")} alt="Folder"/>
            <img src={require(`../images/${info.name}.png`)} alt="Logo" class="absolute inset-0 mx-auto top-1/4"/> 
            <div class="folder-details absolute bottom-0 text-purple mx-5 mb-3 -space-y-1">
                <h2 class="text-sm font-semibold">{info.name}</h2>
                <h3 class="text-xs">{info.role} • {info.year}</h3>
            </div>
        </motion.div>
    );
}

export default Folder;