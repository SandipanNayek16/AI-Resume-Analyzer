import { useEffect, useRef } from "react";
import { cn } from "~/lib/utils";
import { motion } from "framer-motion";

export function GlowBackground({ children, className }: { children: React.ReactNode; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Subtle mouse movement effect for the radial gradient
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const xPos = (clientX / innerWidth) * 100;
      const yPos = (clientY / innerHeight) * 100;

      containerRef.current.style.setProperty('--mouse-x', `${xPos}%`);
      containerRef.current.style.setProperty('--mouse-y', `${yPos}%`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={cn("relative min-h-screen bg-surface-0 overflow-hidden", className)}
      style={{
        '--mouse-x': '50%',
        '--mouse-y': '50%',
      } as React.CSSProperties}
    >
      {/* Subtle Scrolling Grid Background */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)'
        }}
      />

      {/* Dynamic Cursor Light - Reduced intensity */}
      <div 
        className="pointer-events-none fixed inset-0 opacity-[0.05] transition-opacity duration-500 hidden md:block z-0"
        style={{
          background: `radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(37, 99, 235, 0.12), transparent 40%)`
        }}
      />

      {/* Animated Mesh Gradient Orbs */}
      <motion.div 
        animate={{
          x: [0, 100, 0, -100, 0],
          y: [0, -50, -100, -50, 0],
          scale: [1, 1.1, 1, 0.9, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-500/15 blur-[120px] rounded-full opacity-40 z-0" 
      />
      
      <motion.div 
        animate={{
          x: [0, -100, 0, 100, 0],
          y: [0, 100, 50, 100, 0],
          scale: [1, 0.9, 1.1, 1, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 2 }}
        className="pointer-events-none fixed bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-indigo-500/10 blur-[140px] rounded-full opacity-40 z-0" 
      />
      
      <motion.div 
        animate={{
          x: [0, 50, 100, 50, 0],
          y: [0, 50, 0, -50, 0],
          scale: [1, 1.2, 1, 1.1, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear", delay: 1 }}
        className="pointer-events-none fixed top-[40%] left-[40%] w-[40vw] h-[40vw] bg-sky-400/5 blur-[100px] rounded-full opacity-30 z-0" 
      />

      {/* Noise Texture Overlay for Cinematic Film Grain */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.015] z-50 mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

      {/* Main Content */}
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </div>
  );
}
