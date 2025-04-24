import React from "react";

export default function Pill({ type, children }) {
  return (
    <div
      className="px-[20px] py-[3px] rounded-full"
      style={{
        backgroundColor: type === "outline" ? "white" : "var(--primary-light)",
        color: "var(--primary)",
        border: type === "outline" ? "1px solid var(--primary)" : undefined,
      }}
    >
      <p>{children}</p>
    </div>
  );
}
