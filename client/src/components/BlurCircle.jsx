import React from "react";

const BlurCircle = ({
  top = "auto",
  left = "auto",
  right = "auto",
  bottom = "auto",
}) => {
  return (
    <div
      className="absolute -z-10 h-72 w-72 rounded-full bg-primary/30 blur-3xl pointer-events-none"
      style={{ top, left, right, bottom }}
    />
  );
};

export default BlurCircle;
