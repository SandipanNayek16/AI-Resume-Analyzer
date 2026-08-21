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
import { ContainerScroll } from "~/components/ui/container-scroll-animation";
import { MagicCursor } from "~/components/ui/magic-cursor";
import { SparklesCore } from "~/components/ui/sparkles";
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30 font-sans">
      <MagicCursor colors={["37 99 235", "234 88 12"]} />
      
      {/* Navbar */}
      <nav className="h-20 border-b border-border-subtle bg-background/70 backdrop-blur-xl sticky top-0 z-50 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-transform group-hover:scale-105">
            <span className="text-white text-sm font-bold tracking-wider">IQ</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Resume<span className="text-primary">IQ</span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate("/auth")}
            className="text-sm font-medium text-text-secondary hover:text-foreground transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={() => navigate("/auth")}
            className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-full text-sm font-semibold hover:bg-orange-700 transition-all hover:scale-105 shadow-sm"
          >
            Get Started <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* Cinematic Hero Section */}
      <section ref={heroRef} className="relative w-full min-h-[100vh] py-32 flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* Background Sparkles */}
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-50">
          <SparklesCore
            id="hero-sparkles"
            background="transparent"
            minSize={0.4}
            maxSize={1}
            particleDensity={60}
            className="w-full h-full"
            particleColor="#2563EB"
          />
        </div>
        
        {/* 3D Canvas Background for Hero */}
        <div ref={sceneContainerRef} className="fixed inset-0 z-0 pointer-events-none opacity-80" style={{ transformOrigin: 'center center' }}>
          <WebGLErrorBoundary fallback={<div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />}>
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest mb-8 shadow-sm">
              <Sparkles size={14} className="text-primary" />
              <span>Resume Intelligence Engine</span>
            </div>
          </ScrollReveal>
          
          <div className="mb-6 max-w-4xl text-center mx-auto">
            <TypewriterEffect 
              words={[
                { text: "Turn", className: "text-foreground font-black" },
                { text: "your", className: "text-foreground font-black" },
                { text: "resume", className: "text-foreground font-black" },
                { text: "into", className: "text-foreground font-black" },
                { text: "an", className: "text-blue-600 font-black" },
                { text: "unfair", className: "text-blue-600 font-black" },
                { text: "advantage.", className: "text-orange-600 font-black" },
              ]}
              className="text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[1.05]"
              cursorClassName="h-12 md:h-20 lg:h-24 bg-orange-600"
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
                className="group relative px-8 py-4 bg-orange-600 text-white rounded-full text-lg font-semibold overflow-hidden transition-all hover:scale-105 shadow-xl hover:shadow-orange-500/20"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 opacity-0 group-hover:opacity-20 transition-opacity" />
                <span className="flex items-center gap-2 relative z-10">Analyze My Resume <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" /></span>
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

      {/* 3D Container Scroll Showcase */}
      <section className="relative w-full z-20 -mt-20 flex flex-col items-center bg-transparent pointer-events-none">
        <div className="pointer-events-auto">
          <ContainerScroll
            titleComponent={
              <h1 className="text-4xl font-semibold text-foreground mb-8">
                Unleash the power of <br />
                <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none text-primary">
                  AI-Powered Analysis
                </span>
              </h1>
            }>
            <img
              src="/images/resume_02.png"
              alt="Resume Analysis Dashboard"
              height={720}
              width={1400}
              className="mx-auto rounded-2xl object-cover h-full object-left-top"
              draggable={false} />
          </ContainerScroll>
        </div>
      </section>

      {/* Feature Storytelling Section */}
      <section className="relative w-full py-32 px-6 flex flex-col items-center z-10 bg-slate-50">
        <div className="max-w-6xl w-full flex flex-col gap-32">
           
           {/* Step 1 */}
           <div className="grid md:grid-cols-2 gap-16 items-center">
             <ScrollReveal direction="right" className="flex flex-col gap-6">
               <div className="size-16 rounded-2xl bg-blue-50 border border-primary/20 flex items-center justify-center text-primary shadow-lg">
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
                   <SpotlightCard spotlightColor="rgba(37,99,235,0.1)" spotlightSize={500} className="relative h-[400px] border border-border-subtle bg-white/50 overflow-hidden backdrop-blur-xl flex items-center justify-center p-8 shadow-sm">
                     <CardItem translateZ="50" className="w-full max-w-sm">
                       <div className="relative z-10 w-full rounded-2xl border border-border-subtle bg-white p-8 shadow-xl flex flex-col items-center gap-6 group-hover/card:shadow-2xl transition-shadow duration-500">
                          <div className="size-32 rounded-full border-[6px] border-slate-100 flex items-center justify-center relative">
                             <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 100 100">
                               <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(37,99,235,0.2)" strokeWidth="8" />
                               <circle cx="50" cy="50" r="46" fill="none" stroke="#2563eb" strokeWidth="8" strokeDasharray="289" strokeDashoffset="28.9" className="transition-all duration-1000 ease-out" />
                             </svg>
                             <span className="text-4xl font-black font-mono">90</span>
                          </div>
                          <div className="w-full space-y-4">
                             <div className="flex justify-between text-sm font-medium"><span className="text-text-muted">Keywords</span><span className="text-success">Perfect</span></div>
                             <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full w-[95%] bg-success" /></div>
                             
                             <div className="flex justify-between text-sm font-medium"><span className="text-text-muted">Formatting</span><span className="text-warning">Review</span></div>
                             <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full w-[65%] bg-warning" /></div>
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
                   <SpotlightCard spotlightColor="rgba(37,99,235,0.1)" spotlightSize={500} className="relative h-[400px] border border-border-subtle bg-white/50 overflow-hidden backdrop-blur-xl flex items-center justify-center p-8 shadow-sm">
                     <CardItem translateZ="50" className="w-full">
                       <div className="relative z-10 w-full flex flex-col gap-4">
                          <div className="p-4 rounded-xl border border-border-subtle bg-white shadow-xl flex items-center gap-4 translate-x-4 opacity-80 group-hover/card:translate-x-6 transition-transform">
                            <div className="size-10 rounded-lg bg-slate-100 flex items-center justify-center"><CheckCircle2 size={20} className="text-slate-400" /></div>
                            <div className="flex-1 space-y-2"><div className="h-2 w-32 bg-slate-300 rounded" /><div className="h-2 w-48 bg-slate-200 rounded" /></div>
                          </div>
                          <div className="p-4 rounded-xl border border-orange-500/30 bg-orange-500/10 shadow-lg flex items-center gap-4 scale-105 z-10 group-hover/card:scale-110 transition-transform">
                            <div className="size-10 rounded-lg bg-orange-500 flex items-center justify-center"><Zap size={20} className="text-white" /></div>
                            <div className="flex-1 space-y-2"><div className="h-2 w-40 bg-orange-300 rounded" /><div className="h-2 w-full bg-orange-500/50 rounded" /></div>
                          </div>
                          <div className="p-4 rounded-xl border border-border-subtle bg-white shadow-xl flex items-center gap-4 -translate-x-4 opacity-80 group-hover/card:-translate-x-6 transition-transform">
                            <div className="size-10 rounded-lg bg-slate-100 flex items-center justify-center"><CheckCircle2 size={20} className="text-slate-400" /></div>
                            <div className="flex-1 space-y-2"><div className="h-2 w-24 bg-slate-300 rounded" /><div className="h-2 w-56 bg-slate-200 rounded" /></div>
                          </div>
                       </div>
                     </CardItem>
                   </SpotlightCard>
                 </CardBody>
               </CardContainer>
             </ScrollReveal>

             <ScrollReveal direction="left" className="order-1 md:order-2 flex flex-col gap-6">
               <div className="size-16 rounded-2xl bg-orange-50 border border-orange-500/20 flex items-center justify-center text-orange-500 shadow-lg">
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
