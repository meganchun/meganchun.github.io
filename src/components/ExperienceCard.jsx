import React from "react";

export default function ExperienceCard({ isHovered, text, role, className }) {
  return (
    <div className="flex flex-col text-center items-center w-[130px]">
      <div
        className={` w-[75px] h-[75px] sm:w-[100px] sm:h-[100px] relative rounded-lg bg-white shadow-2xl shadow-primary-light duration-500 ${
          isHovered ? "scale-110" : ""
        } ${className}`}
      >
        <img
          src={require(`../images/${text
            .toLowerCase()
            .split(" ")
            .join("-")}.png`)}
          alt={text}
          className=" w-[50px] sm:w-[70px] aspect-square absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        />
      </div>
      <div className="h-[24px] mt-4 z-10">
        <p
          className={`text-primary transition-opacity duration-200 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          {text}
        </p>
        <p
          className={`text-primary-light text-xs transition-opacity duration-200 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          {role.toUpperCase()}
        </p>
      </div>
    </div>
  );
}
