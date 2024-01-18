import React, { useState, useEffect, useRef } from "react";

interface MousePosition {
  x: number;
  y: number;
}

const Glow: React.FC = () => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
  });
  const [isMouseInViewport, setIsMouseInViewport] = useState(false);

  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
      setIsMouseInViewport(true);
    };

    const handleMouseEnter = () => {
      setIsMouseInViewport(true);
    };

    const handleMouseLeave = () => {
      setIsMouseInViewport(false);
    };

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      setMousePosition({ x: touch.clientX, y: touch.clientY });
      setIsMouseInViewport(true);
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      setMousePosition({ x: touch.clientX, y: touch.clientY });
      setIsMouseInViewport(true);
    };

    const handleTouchEnd = () => {
      setIsMouseInViewport(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  const glowStyle: React.CSSProperties = {
    position: "fixed" as const,
    top: mousePosition.y,
    left: mousePosition.x,
    width: "175px",
    height: "175px",
    backgroundColor: "hsla(23, 68%, 37%, 0.5)",
    borderRadius: "50%",
    transform: "translate(-50%, -50%)",
    display: isMouseInViewport ? "block" : "hidden",
  };

  return (
    <div
      ref={glowRef}
      className="pointer-events-none -z-30 blur-3xl"
      style={glowStyle}
    />
  );
};

export default Glow;
