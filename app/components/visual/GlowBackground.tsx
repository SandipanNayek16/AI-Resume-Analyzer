import { useEffect, useRef } from "react";
import { cn } from "~/lib/utils";

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
        className="pointer-events-none fixed inset-0 z-0 opacity-10"
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
        className="pointer-events-none fixed inset-0 opacity-10 transition-opacity duration-500 hidden md:block z-0"
        style={{
          background: `radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(124, 58, 237, 0.15), transparent 40%)`
        }}
      />

      {/* Global Atmospheric Glow - Reduced opacity */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[100vw] h-[500px] bg-brand-500/10 blur-[120px] rounded-[100%] opacity-30 z-0" />
      <div className="pointer-events-none fixed bottom-0 right-0 w-[500px] h-[500px] bg-accent-cyan/5 blur-[120px] rounded-full opacity-20 z-0" />

      {/* Noise Texture Overlay for Cinematic Film Grain */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.02] z-50 mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

      {/* Main Content */}
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </div>
  );
}
