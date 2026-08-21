import type { Route } from "./+types/home";
import { Link, useNavigate } from "react-router";
import { useEffect, Suspense, useRef } from "react";
import { usePuterStore } from "~/lib/puter";
import { ArrowRight, CheckCircle2, FileSearch, Sparkles, Target, Zap } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { ResumeScene } from "~/components/3d/ResumeScene";
import { ScrollReveal } from "~/components/motion/ScrollReveal";
import { TypewriterEffect } from "~/components/ui/typewriter-effect";
import { SpotlightCard } from "~/components/reactbits/SpotlightCard";
import { CardBody, CardContainer, CardItem } from "~/components/ui/3d-card";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React, { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

class WebGLErrorBoundary extends Component<{ children: ReactNode, fallback: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode, fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("WebGL Canvas Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}


export function meta({}: Route.MetaArgs) {
  return [
    { title: "ResumeIQ — Cinematic AI Intelligence" },
    { name: "description", content: "Advanced Resume Analysis with AI." },
  ];
}

export default function Home() {
  const { auth, isLoading } = usePuterStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && auth.isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isLoading, auth.isAuthenticated, navigate]);

  // GSAP storytelling timeline
  const heroRef = useRef<HTMLDivElement>(null);
  const sceneContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      
      // Continuous 3D Storytelling: the holographic resume shifts as we scroll
      if (sceneContainerRef.current) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: 1, // Smooth scrubbing
          }
        });
        
        // Move to the right for the first section (Precision Scoring)
        tl.to(sceneContainerRef.current, {
          x: "25vw",
          y: "20vh",
          scale: 1.2,
          rotationZ: 5,
          opacity: 0.8,
          ease: "power2.inOut"
        }, 0)
        // Move to the left for the second section (AI Iteration)
        .to(sceneContainerRef.current, {
          x: "-25vw",
          y: "40vh",
          scale: 0.9,
          rotationZ: -5,
          opacity: 0.6,
          ease: "power2.inOut"
        }, 0.5);
      }
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-0 flex items-center justify-center">
        <div className="size-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-text-primary selection:bg-brand-500/30 font-sans">
      
      {/* Navbar */}
      <nav className="h-20 border-b border-border-subtle bg-surface-0/50 backdrop-blur-xl sticky top-0 z-50 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <div className="size-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-transform group-hover:scale-105">
            <span className="text-white text-sm font-bold tracking-wider">IQ</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Resume<span className="text-brand-400">IQ</span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate("/auth")}
            className="text-sm font-medium text-text-muted hover:text-white transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={() => navigate("/auth")}
            className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-white text-surface-0 rounded-full text-sm font-semibold hover:bg-brand-50 transition-all hover:scale-105"
          >
            Get Started <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* Cinematic Hero Section */}
      <section ref={heroRef} className="relative w-full h-[90vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* 3D Canvas Background for Hero */}
        <div ref={sceneContainerRef} className="fixed inset-0 z-0 pointer-events-none opacity-80" style={{ transformOrigin: 'center center' }}>
          <WebGLErrorBoundary fallback={<div className="absolute inset-0 bg-gradient-to-b from-brand-500/10 to-transparent" />}>
            <Suspense fallback={null}>
              <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#8b5cf6" />
                <ResumeScene scale={1.2} />
              </Canvas>
            </Suspense>
          </WebGLErrorBoundary>
        </div>

        <div className="relative z-10 flex flex-col items-center mt-[-5vh]">
          <ScrollReveal delay={0.1} direction="up" distance={30}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-500/20 bg-brand-500/10 text-brand-300 text-xs font-semibold uppercase tracking-widest mb-8 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
              <Sparkles size={14} className="text-brand-400" />
              <span>Resume Intelligence Engine</span>
            </div>
          </ScrollReveal>
          
          <div className="mb-6 max-w-4xl text-center mx-auto">
            <TypewriterEffect 
              words={[
                { text: "Turn", className: "text-white font-black" },
                { text: "your", className: "text-white font-black" },
                { text: "resume", className: "text-white font-black" },
                { text: "into", className: "text-white font-black" },
                { text: "an", className: "text-brand-300 font-black" },
                { text: "unfair", className: "text-brand-400 font-black" },
                { text: "advantage.", className: "text-brand-500 font-black" },
              ]}
              className="text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[1.05]"
              cursorClassName="h-12 md:h-20 lg:h-24 bg-brand-500"
            />
          </div>
          
          <ScrollReveal delay={0.8} direction="up" distance={40}>
            <p className="text-lg md:text-xl text-text-secondary max-w-2xl mb-12 leading-relaxed font-light">
              Stop guessing what recruiters want. Let our AI engine analyze, optimize, and score your resume precisely against ATS algorithms.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.9} direction="up" distance={40}>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <button 
                onClick={() => navigate("/auth")}
                className="group relative px-8 py-4 bg-white text-surface-0 rounded-full text-lg font-semibold overflow-hidden transition-all hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-brand-300 to-brand-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                <span className="flex items-center gap-2">Analyze My Resume <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" /></span>
              </button>
            </div>
          </ScrollReveal>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-muted animate-pulse">
           <span className="text-xs uppercase tracking-widest font-medium">Scroll to explore</span>
           <div className="w-px h-12 bg-gradient-to-b from-text-muted to-transparent" />
        </div>
      </section>

      {/* Feature Storytelling Section */}
      <section className="relative w-full py-32 px-6 flex flex-col items-center z-10 bg-surface-0">
        <div className="max-w-6xl w-full flex flex-col gap-32">
           
           {/* Step 1 */}
           <div className="grid md:grid-cols-2 gap-16 items-center">
             <ScrollReveal direction="right" className="flex flex-col gap-6">
               <div className="size-16 rounded-2xl bg-surface-200 border border-border-default flex items-center justify-center text-accent-cyan shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                 <Target size={32} />
               </div>
               <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Precision Scoring.</h2>
               <p className="text-lg text-text-secondary leading-relaxed">
                 Our proprietary engine simulates enterprise Applicant Tracking Systems to calculate exactly how your resume will be parsed and ranked.
               </p>
             </ScrollReveal>
             
             <ScrollReveal direction="left">
               <CardContainer className="inter-var w-full">
                 <CardBody className="w-full h-full relative group/card">
                   <SpotlightCard spotlightColor="rgba(6, 182, 212, 0.15)" spotlightSize={500} className="relative h-[400px] border border-border-default bg-surface-100/50 overflow-hidden backdrop-blur-sm flex items-center justify-center p-8">
                     <CardItem translateZ="50" className="w-full max-w-sm">
                       <div className="relative z-10 w-full rounded-2xl border border-border-default bg-surface-50 p-8 shadow-2xl flex flex-col items-center gap-6 group-hover/card:shadow-xl transition-shadow duration-500">
                          <div className="size-32 rounded-full border-[6px] border-surface-200 flex items-center justify-center relative">
                             <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 100 100">
                               <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(6,182,212,0.2)" strokeWidth="8" />
                               <circle cx="50" cy="50" r="46" fill="none" stroke="#06b6d4" strokeWidth="8" strokeDasharray="289" strokeDashoffset="28.9" className="transition-all duration-1000 ease-out" />
                             </svg>
                             <span className="text-4xl font-black font-mono">90</span>
                          </div>
                          <div className="w-full space-y-4">
                             <div className="flex justify-between text-sm font-medium"><span className="text-text-muted">Keywords</span><span className="text-success">Perfect</span></div>
                             <div className="h-1.5 w-full bg-surface-200 rounded-full overflow-hidden"><div className="h-full w-[95%] bg-success" /></div>
                             
                             <div className="flex justify-between text-sm font-medium"><span className="text-text-muted">Formatting</span><span className="text-warning">Review</span></div>
                             <div className="h-1.5 w-full bg-surface-200 rounded-full overflow-hidden"><div className="h-full w-[65%] bg-warning" /></div>
                          </div>
                       </div>
                     </CardItem>
                   </SpotlightCard>
                 </CardBody>
               </CardContainer>
             </ScrollReveal>
           </div>

           {/* Step 2 */}
           <div className="grid md:grid-cols-2 gap-16 items-center">
             <ScrollReveal direction="right" className="order-2 md:order-1">
               <CardContainer className="inter-var w-full">
                 <CardBody className="w-full h-full relative group/card">
                   <SpotlightCard spotlightColor="rgba(139, 92, 246, 0.15)" spotlightSize={500} className="relative h-[400px] border border-border-default bg-surface-100/50 overflow-hidden backdrop-blur-sm flex items-center justify-center p-8">
                     <CardItem translateZ="50" className="w-full">
                       <div className="relative z-10 w-full flex flex-col gap-4">
                          <div className="p-4 rounded-xl border border-border-subtle bg-surface-50 shadow-lg flex items-center gap-4 translate-x-4 opacity-80 group-hover/card:translate-x-6 transition-transform">
                            <div className="size-10 rounded-lg bg-surface-200 flex items-center justify-center"><CheckCircle2 size={20} className="text-text-muted" /></div>
                            <div className="flex-1 space-y-2"><div className="h-2 w-32 bg-surface-300 rounded" /><div className="h-2 w-48 bg-surface-200 rounded" /></div>
                          </div>
                          <div className="p-4 rounded-xl border border-brand-500/50 bg-brand-500/10 shadow-[0_0_30px_rgba(139,92,246,0.15)] flex items-center gap-4 scale-105 z-10 group-hover/card:scale-110 transition-transform">
                            <div className="size-10 rounded-lg bg-brand-500 flex items-center justify-center"><Zap size={20} className="text-white" /></div>
                            <div className="flex-1 space-y-2"><div className="h-2 w-40 bg-brand-300 rounded" /><div className="h-2 w-full bg-brand-500/50 rounded" /></div>
                          </div>
                          <div className="p-4 rounded-xl border border-border-subtle bg-surface-50 shadow-lg flex items-center gap-4 -translate-x-4 opacity-80 group-hover/card:-translate-x-6 transition-transform">
                            <div className="size-10 rounded-lg bg-surface-200 flex items-center justify-center"><CheckCircle2 size={20} className="text-text-muted" /></div>
                            <div className="flex-1 space-y-2"><div className="h-2 w-24 bg-surface-300 rounded" /><div className="h-2 w-56 bg-surface-200 rounded" /></div>
                          </div>
                       </div>
                     </CardItem>
                   </SpotlightCard>
                 </CardBody>
               </CardContainer>
             </ScrollReveal>

             <ScrollReveal direction="left" className="order-1 md:order-2 flex flex-col gap-6">
               <div className="size-16 rounded-2xl bg-surface-200 border border-border-default flex items-center justify-center text-brand-400 shadow-[0_0_30px_rgba(139,92,246,0.1)]">
                 <FileSearch size={32} />
               </div>
               <h2 className="text-4xl md:text-5xl font-bold tracking-tight">AI-Powered Iteration.</h2>
               <p className="text-lg text-text-secondary leading-relaxed">
                 Compare your resume against any job description. Instantly identify missing skills and let the AI Copilot help you rewrite bullet points to guarantee an interview.
               </p>
             </ScrollReveal>
           </div>

        </div>
      </section>

    </div>
  );
}
