import React, { useRef, useEffect } from "react";
import { cn } from "~/lib/utils";
import { motion } from "framer-motion";
import gsap from "gsap";

type ParticlesProps = {
  id?: string;
  className?: string;
  background?: string;
  particleSize?: number;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleColor?: string;
  particleDensity?: number;
};

export const SparklesCore = (props: ParticlesProps) => {
  const {
    className,
    background = "transparent",
    minSize = 1,
    maxSize = 3,
    speed = 1,
    particleColor = "#ffffff",
    particleDensity = 120,
  } = props;
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;
    let particles: any[] = [];
    
    // Mouse tracking for physics interaction
    const mouse = { x: -1000, y: -1000 };
    
    const initParticles = () => {
       particles = [];
       // Adjust density based on screen size
       const density = Math.floor((width * height) / 10000) * (particleDensity / 120);
       
       for (let i = 0; i < density; i++) {
          particles.push({
             x: Math.random() * width,
             y: Math.random() * height,
             size: Math.random() * (maxSize - minSize) + minSize,
             vx: (Math.random() - 0.5) * speed * 2,
             vy: (Math.random() - 0.5) * speed * 2,
             baseVx: (Math.random() - 0.5) * speed,
             baseVy: (Math.random() - 0.5) * speed,
             alpha: Math.random()
          });
       }
    };
    
    const handleResize = () => {
       width = canvas.width = canvas.offsetWidth;
       height = canvas.height = canvas.offsetHeight;
       initParticles();
    };
    
    const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    };
    
    const handleMouseLeave = () => {
        mouse.x = -1000;
        mouse.y = -1000;
    };
    
    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    
    initParticles();
    
    // GSAP 60fps render loop
    const render = () => {
       ctx.clearRect(0, 0, width, height);
       
       if (background !== "transparent") {
           ctx.fillStyle = background;
           ctx.fillRect(0, 0, width, height);
       }
       
       particles.forEach(p => {
           // Apply mouse repulsion physics
           const dx = mouse.x - p.x;
           const dy = mouse.y - p.y;
           const dist = Math.sqrt(dx * dx + dy * dy);
           const interactionRadius = 150;
           
           if (dist < interactionRadius) {
               const angle = Math.atan2(dy, dx);
               const force = (interactionRadius - dist) / interactionRadius;
               // Push away from mouse
               p.vx -= Math.cos(angle) * force * 2;
               p.vy -= Math.sin(angle) * force * 2;
           }
           
           // Apply friction (return to base velocity)
           p.vx += (p.baseVx - p.vx) * 0.05;
           p.vy += (p.baseVy - p.vy) * 0.05;
           
           // Update position
           p.x += p.vx;
           p.y += p.vy;
           
           // Wrap around edges seamlessly
           if (p.x < -p.size) p.x = width + p.size;
           if (p.x > width + p.size) p.x = -p.size;
           if (p.y < -p.size) p.y = height + p.size;
           if (p.y > height + p.size) p.y = -p.size;
           
           // Pulse alpha slightly
           p.alpha += (Math.random() - 0.5) * 0.02;
           if (p.alpha < 0.1) p.alpha = 0.1;
           if (p.alpha > 1) p.alpha = 1;
           
           // Draw particle
           ctx.beginPath();
           ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
           ctx.fillStyle = particleColor;
           ctx.globalAlpha = p.alpha;
           ctx.fill();
       });
       ctx.globalAlpha = 1;
    };
    
    gsap.ticker.add(render);
    
    return () => {
       gsap.ticker.remove(render);
       window.removeEventListener('resize', handleResize);
       canvas.removeEventListener('mousemove', handleMouseMove);
       canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [particleDensity, speed, minSize, maxSize, background, particleColor]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("h-full w-full absolute inset-0 pointer-events-none", className)}
    >
      <canvas 
        ref={canvasRef} 
        className="block w-full h-full pointer-events-auto"
      />
    </motion.div>
  );
};
