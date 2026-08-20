import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "~/lib/utils";

// Register ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  duration?: number;
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = "up",
  distance = 50,
  duration = 0.8,
}: ScrollRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    let x = 0;
    let y = 0;

    switch (direction) {
      case "up":
        y = distance;
        break;
      case "down":
        y = -distance;
        break;
      case "left":
        x = distance;
        break;
      case "right":
        x = -distance;
        break;
      case "none":
        break;
    }

    gsap.fromTo(
      el,
      { opacity: 0, x, y },
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration,
        delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%", // Reveal when element is 85% from top of viewport
          toggleActions: "play none none none",
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill();
      });
    };
  }, [direction, distance, duration, delay]);

  return (
    <div ref={elementRef} className={cn("opacity-0", className)}>
      {children}
    </div>
  );
}
