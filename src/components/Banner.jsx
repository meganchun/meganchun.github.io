import React from "react";
import Pill from "./Pill";
export default function Banner() {
  const items = [
    "Developer",
    "Foodie",
    "Matcha Lover",
    "Tinkerer",
    "Explorer",
    "Builder",
    "Thinker",
    "Coffee Lover",
    "Explorer",
    "Maker",
    "Learner",
  ];

  return (
    <div className="overflow-hidden whitespace-nowrap w-full bg-white py-2">
      <div className="inline-block flex gap-4 animate-marquee">
        {items.map((item, index) => (
          <Pill type="outline" key={index}>
            {item}
          </Pill>
        ))}
        {items.map((item, index) => (
          <Pill type="outline" key={`dupe-${index}`}>
            {item}
          </Pill>
        ))}
      </div>
    </div>
  );
}
