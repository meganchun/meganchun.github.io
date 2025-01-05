import React from 'react';
import { IoIosMail } from "react-icons/io";
import { FaLinkedin , FaGithub } from "react-icons/fa";
import { motion } from "motion/react"

function ContactMe() {
    return(
        <div class="bg-teal p-1 rounded-b-3xl pb-14 px-10 sm:px-20">
            <div class="tab-title-text pb-5 md:pb-5 mt-10 sm:mt-14">
                <h3 class="text-primary italic">downloads/contactMe</h3>
                <h1 class="text-primary text-xl font-semibold">Get in touch with me!</h1>
            </div>
            <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ amount: 0.2 }}
            class="contact-info text-primary flex flex-row mt-8">
                <div class="mail mr-10 sm:mr-16 p-2 rounded underline duration-200 hover:bg-primary/15">
                    <IoIosMail class="size-6 mb-2"/>
                    <h2 ><a href="mailto:megan.chun@uwaterloo.ca">Email</a></h2>
                </div>
                <div class="linkedin mr-10 sm:mr-16 p-2 rounded underline duration-200 hover:bg-primary/15">
                    <FaLinkedin class="size-6 mb-2"/>
                    <h2><a href="mailto:megan.chun@uwaterloo.ca">Linkedin</a></h2>
                </div>
                <div class="github mr-10 sm:mr-16 p-2 rounded underline duration-200 hover:bg-primary/15">
                    <FaGithub class="size-6 mb-2"/>
                    <h2><a href="mailto:megan.chun@uwaterloo.ca">Github</a></h2>
                </div>
            </motion.div>
            
        </div>
    );
}

export default ContactMe;