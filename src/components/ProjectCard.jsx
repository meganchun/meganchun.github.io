import React, { useState } from "react";

export default function ProjectCard({ project, isCenter }) {
  const handleProjectClick = (link) => {
    window.open(link, "_blank");
  };

  return (
    <div
      className="flex flex-col items-center p-4 mx-[15vw] sm:mx-[30vw] md:mx-[50vw] w-[250px] sm:w-[350px] md:w-[450px] h cursor-pointer"
      onClick={() => {
        if (isCenter) {
          handleProjectClick(project.link);
        }
      }}
    >
      <div className="relative rounded-lg overflow-hidden w-full h-[auto]">
        <img
          src={require(`../images/${project.name
            .toLowerCase()
            .split(" ")
            .join("-")}.png`)}
          alt={project.name}
          className="relative w-full h-full object-cover rounded-l"
        />
      </div>

      <div className="w-full text-start mt-2">
        <div className=" flex text-text justify-between">
          <p className="font-medium">{project.name}</p>
          <p className="font-medium">2025</p>
        </div>

        <p className="font-light text-xs text-text-secondary">
          {project.tech.join(" / ")}
        </p>
      </div>
    </div>
  );
}
