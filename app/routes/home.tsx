import type { Route } from "./+types/home";
import { Link, useNavigate } from "react-router";
import { useEffect, Suspense, useRef } from "react";
import { usePuterStore } from "~/lib/puter";
import { ArrowRight, CheckCircle2, FileSearch, Target, Zap } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { ResumeScene } from "~/components/3d/ResumeScene";
import { ScrollReveal } from "~/components/motion/ScrollReveal";
import { SpotlightCard } from "~/components/reactbits/SpotlightCard";
import { SplitText } from "~/components/reactbits/SplitText";
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
    { title: "ResumeIQ — AI Resume Intelligence" },
    { name: "description", content: "Analyze, optimize, and tailor your resume with AI-powered intelligence." },
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

  // GSAP subtle parallax for 3D scene
  const sceneContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      
      if (sceneContainerRef.current) {
        gsap.to(sceneContainerRef.current, {
          y: 80,
          opacity: 0.3,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sceneContainerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          }
        });
      }
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="size-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-blue-600/30 font-sans">
      
      {/* Navbar */}
      <nav className="h-20 border-b border-border-subtle bg-background/70 backdrop-blur-xl sticky top-0 z-50 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <div className="size-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-transform group-hover:scale-105">
            <span className="text-white text-sm font-bold tracking-wider">IQ</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Resume<span className="text-blue-600">IQ</span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate("/auth")}
            className="text-sm font-medium text-slate-500 hover:text-foreground transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={() => navigate("/auth")}
            className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition-all hover:scale-105 shadow-sm"
          >
            Get Started <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* Hero Section — Split Layout */}
      <section className="relative w-full min-h-[90vh] flex items-center px-6 md:px-12 overflow-hidden">
        
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(37,99,235,0.08),transparent)] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center relative z-10">
          
          {/* Left — Copy */}
          <div className="flex flex-col gap-8 py-20 lg:py-0">
            <ScrollReveal delay={0.1} direction="up" distance={20}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-600/20 bg-blue-600/10 text-blue-600 text-xs font-semibold uppercase tracking-widest w-fit">
                <div className="size-1.5 rounded-full bg-blue-600 animate-pulse" />
                Resume Intelligence Engine
              </div>
            </ScrollReveal>
            
            <div className="flex flex-col gap-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[1.05] text-foreground">
                <SplitText text="Turn your" className="inline block" delay={30} />
                <SplitText text="resume into" className="inline block" delay={30} />
                <SplitText text="an unfair" className="inline block text-blue-600" delay={30} />
                <SplitText text="advantage." className="inline block text-blue-600" delay={30} />
              </h1>
              
              <ScrollReveal delay={0.4} direction="up" distance={20}>
                <p className="text-lg md:text-xl text-slate-600 max-w-lg leading-relaxed font-light">
                  Analyze, optimize, and tailor your resume for the jobs you actually want. Get precise ATS scores, keyword analysis, and AI-powered improvement suggestions.
                </p>
              </ScrollReveal>
            </div>

            <ScrollReveal delay={0.6} direction="up" distance={20}>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <button 
                  onClick={() => navigate("/auth")}
                  className="group relative px-8 py-4 bg-blue-600 text-white rounded-full text-lg font-semibold overflow-hidden transition-all hover:scale-105 shadow-lg hover:shadow-blue-600/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="flex items-center gap-2 relative z-10">Analyze My Resume <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" /></span>
                </button>
              </div>
            </ScrollReveal>
          </div>

          {/* Right — 3D Resume Scene */}
          <div ref={sceneContainerRef} className="relative h-[500px] lg:h-[600px] hidden lg:block">
            <WebGLErrorBoundary fallback={<div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 to-transparent rounded-3xl" />}>
              <Suspense fallback={null}>
                <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                  <ambientLight intensity={0.5} />
                  <directionalLight position={[10, 10, 5]} intensity={1} />
                  <directionalLight position={[-10, -10, -5]} intensity={0.3} color="#3b82f6" />
                  <ResumeScene scale={1.1} />
                </Canvas>
              </Suspense>
            </WebGLErrorBoundary>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-text-muted animate-pulse hidden lg:flex">
           <span className="text-xs uppercase tracking-widest font-medium">Scroll to explore</span>
           <div className="w-px h-12 bg-gradient-to-b from-text-muted to-transparent" />
        </div>
      </section>

      {/* Feature Storytelling Section */}
      <section className="relative w-full py-32 px-6 flex flex-col items-center z-10 bg-slate-50">
        <div className="max-w-6xl w-full flex flex-col gap-32">
           
           {/* Step 1 — Precision Scoring */}
           <div className="grid md:grid-cols-2 gap-16 items-center">
             <ScrollReveal direction="right" className="flex flex-col gap-6">
               <div className="size-16 rounded-2xl bg-blue-50 border border-blue-600/20 flex items-center justify-center text-blue-600 shadow-lg">
                 <Target size={32} />
               </div>
               <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Precision Scoring.</h2>
               <p className="text-lg text-slate-600 leading-relaxed">
                 Our engine simulates enterprise Applicant Tracking Systems to calculate exactly how your resume will be parsed and ranked.
               </p>
             </ScrollReveal>
             
             <ScrollReveal direction="left">
               <SpotlightCard spotlightColor="rgba(37,99,235,0.1)" spotlightSize={500} className="relative h-[400px] border border-border-subtle bg-white/50 overflow-hidden backdrop-blur-xl flex items-center justify-center p-8 shadow-sm rounded-2xl">
                 <div className="w-full max-w-sm">
                   <div className="relative z-10 w-full rounded-2xl border border-border-subtle bg-white p-8 shadow-xl flex flex-col items-center gap-6">
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
                 </div>
               </SpotlightCard>
             </ScrollReveal>
           </div>

           {/* Step 2 — AI-Powered Iteration */}
           <div className="grid md:grid-cols-2 gap-16 items-center">
             <ScrollReveal direction="right" className="order-2 md:order-1">
               <SpotlightCard spotlightColor="rgba(37,99,235,0.1)" spotlightSize={500} className="relative h-[400px] border border-border-subtle bg-white/50 overflow-hidden backdrop-blur-xl flex items-center justify-center p-8 shadow-sm rounded-2xl">
                 <div className="w-full">
                   <div className="relative z-10 w-full flex flex-col gap-4">
                      <div className="p-4 rounded-xl border border-border-subtle bg-white shadow-xl flex items-center gap-4 translate-x-4 opacity-80">
                        <div className="size-10 rounded-lg bg-slate-100 flex items-center justify-center"><CheckCircle2 size={20} className="text-slate-400" /></div>
                        <div className="flex-1 space-y-2"><div className="h-2 w-32 bg-slate-300 rounded" /><div className="h-2 w-48 bg-slate-200 rounded" /></div>
                      </div>
                      <div className="p-4 rounded-xl border border-blue-600/30 bg-blue-600/10 shadow-lg flex items-center gap-4 scale-105 z-10">
                        <div className="size-10 rounded-lg bg-blue-600 flex items-center justify-center"><Zap size={20} className="text-white" /></div>
                        <div className="flex-1 space-y-2"><div className="h-2 w-40 bg-blue-300 rounded" /><div className="h-2 w-full bg-blue-600/50 rounded" /></div>
                      </div>
                      <div className="p-4 rounded-xl border border-border-subtle bg-white shadow-xl flex items-center gap-4 -translate-x-4 opacity-80">
                        <div className="size-10 rounded-lg bg-slate-100 flex items-center justify-center"><CheckCircle2 size={20} className="text-slate-400" /></div>
                        <div className="flex-1 space-y-2"><div className="h-2 w-24 bg-slate-300 rounded" /><div className="h-2 w-56 bg-slate-200 rounded" /></div>
                      </div>
                   </div>
                 </div>
               </SpotlightCard>
             </ScrollReveal>

             <ScrollReveal direction="left" className="order-1 md:order-2 flex flex-col gap-6">
               <div className="size-16 rounded-2xl bg-blue-50 border border-blue-600/20 flex items-center justify-center text-blue-600 shadow-lg">
                 <FileSearch size={32} />
               </div>
               <h2 className="text-4xl md:text-5xl font-bold tracking-tight">AI-Powered Iteration.</h2>
               <p className="text-lg text-slate-600 leading-relaxed">
                 Compare your resume against any job description. Identify missing skills and let the AI Copilot help you rewrite bullet points to maximize your chances.
               </p>
             </ScrollReveal>
           </div>

        </div>
      </section>

    </div>
  );
}
