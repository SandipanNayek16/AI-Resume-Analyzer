import { useRef, useEffect } from "react";
import { motion, useSpring, useMotionValue, useMotionTemplate } from "framer-motion";
import { cn } from "~/lib/utils";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  spotlightColor?: string;
  spotlightSize?: number;
}

export function SpotlightCard({ 
  children, 
  className, 
  spotlightColor = "rgba(255, 255, 255, 0.1)",
  spotlightSize = 400,
  ...props 
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 20, stiffness: 100, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);
  
  const opacity = useMotionValue(0);
  const smoothOpacity = useSpring(opacity, springConfig);
  
  const background = useMotionTemplate`radial-gradient(${spotlightSize}px circle at ${smoothX}px ${smoothY}px, ${spotlightColor}, transparent 40%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handleFocus = () => { opacity.set(1); };
  const handleBlur = () => { opacity.set(0); };
  const handleMouseEnter = () => { opacity.set(1); };
  const handleMouseLeave = () => { opacity.set(0); };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn("relative overflow-hidden rounded-3xl border border-border-default bg-surface-100", className)}
      {...props}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity: smoothOpacity,
          background,
        }}
      />
      {children}
    </div>
  );
}
