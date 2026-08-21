import type { Route } from "./+types/home";
import { Link, useNavigate } from "react-router";
import { useEffect, Suspense, useRef } from "react";
import { usePuterStore } from "~/lib/puter";
import { ArrowRight, FileText, CheckCircle2, Zap, BrainCircuit, Target, Sparkles, Activity, FileSearch } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { PageTransition } from "~/components/motion/PageTransition";
import { ScrollReveal } from "~/components/motion/ScrollReveal";
import { TypewriterEffect } from "~/components/ui/typewriter-effect";
import { SparklesCore } from "~/components/ui/sparkles";
import { ContainerScroll } from "~/components/ui/container-scroll-animation";
import { ResumeScene } from "~/components/3d/ResumeScene";
import { SpotlightCard } from "~/components/reactbits/SpotlightCard";
import { SplitText } from "~/components/reactbits/SplitText";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React from "react";
import { WebGLErrorBoundary } from "~/components/WebGLErrorBoundary";

 
export function meta({}: Route.MetaArgs) {
  return [
    { title: "ResumeIQ — AI Resume Intelligence" },
    { name: "description", content: "Analyze, optimize, and tailor your resume with AI-powered intelligence." },
  ];
}

function ScoringFeature() {
  const container = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    let ctx = gsap.context(() => {
      // Circle animation
      gsap.fromTo(".score-circle", 
        { strokeDashoffset: 289 },
        { strokeDashoffset: 28.9, duration: 2, ease: "power3.out", scrollTrigger: { trigger: container.current, start: "top 80%" } }
      );
      // Number count up
      gsap.from(".score-text", {
        textContent: 0,
        duration: 2,
        ease: "power3.out",
        snap: { textContent: 1 },
        scrollTrigger: { trigger: container.current, start: "top 80%" }
      });
      // Bars filling up
      gsap.fromTo(".score-bar",
        { scaleX: 0 },
        { scaleX: 1, transformOrigin: "left center", duration: 1.5, stagger: 0.2, ease: "power3.out", scrollTrigger: { trigger: container.current, start: "top 80%" } }
      );
    }, container);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={container} className="relative z-10 w-full rounded-3xl border border-border bg-white/80 p-8 shadow-2xl flex flex-col items-center gap-6 group hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.15)] transition-all duration-500 hover:-translate-y-1">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.03),transparent)] pointer-events-none rounded-3xl" />
      
      <div className="size-36 rounded-full border-[8px] border-slate-50 flex items-center justify-center relative shadow-inner group-hover:scale-105 transition-transform duration-500">
         <svg className="absolute inset-0 size-full -rotate-90 drop-shadow-md" viewBox="0 0 100 100">
           <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(37,99,235,0.1)" strokeWidth="8" />
           <circle className="score-circle" cx="50" cy="50" r="46" fill="none" stroke="#2563eb" strokeWidth="8" strokeDasharray="289" strokeDashoffset="289" strokeLinecap="round" />
         </svg>
         <span className="text-5xl font-black font-mono score-text bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-600">90</span>
      </div>
      
      <div className="w-full space-y-5 pt-2">
         <div className="space-y-2">
           <div className="flex justify-between text-sm font-medium"><span className="text-slate-500 font-semibold">Keywords</span><span className="text-emerald-500 font-bold tracking-wide">Perfect</span></div>
           <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner"><div className="score-bar h-full w-[95%] bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]" /></div>
         </div>
         
         <div className="space-y-2">
           <div className="flex justify-between text-sm font-medium"><span className="text-slate-500 font-semibold">Formatting</span><span className="text-amber-500 font-bold tracking-wide">Review</span></div>
           <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner"><div className="score-bar h-full w-[65%] bg-gradient-to-r from-amber-400 to-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.3)]" /></div>
         </div>
      </div>
    </div>
  );
}

function IterationFeature() {
  const container = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    let ctx = gsap.context(() => {
      // Parallax float effect while scrolling
      gsap.to(".iter-item-1", {
        y: -30,
        scrollTrigger: { trigger: container.current, start: "top bottom", end: "bottom top", scrub: 1 }
      });
      gsap.to(".iter-item-3", {
        y: 30,
        scrollTrigger: { trigger: container.current, start: "top bottom", end: "bottom top", scrub: 1 }
      });
      
      // Entrance animation
      gsap.from(".iter-item", {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "back.out(1.2)",
        scrollTrigger: { trigger: container.current, start: "top 85%" }
      });
    }, container);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={container} className="relative z-10 w-full flex flex-col gap-5 py-12 px-4">
      {/* Background glow for the stack */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-600/5 blur-3xl rounded-full pointer-events-none" />
      
      <div className="iter-item iter-item-1 p-5 rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-md shadow-lg flex items-center gap-5 translate-x-6 opacity-70 hover:opacity-100 transition-opacity">
        <div className="size-12 rounded-xl bg-slate-100/50 flex items-center justify-center border border-slate-200"><CheckCircle2 size={24} className="text-slate-400" /></div>
        <div className="flex-1 space-y-3"><div className="h-2.5 w-32 bg-slate-200 rounded-full" /><div className="h-2.5 w-48 bg-slate-100 rounded-full" /></div>
      </div>
      
      <div className="iter-item iter-item-2 p-6 rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-600/10 to-blue-500/5 backdrop-blur-xl shadow-2xl flex items-center gap-5 scale-110 z-10 hover:scale-[1.15] transition-transform duration-500 relative">
        <div className="absolute inset-0 bg-blue-600/5 opacity-50 blur-md rounded-2xl -z-10 animate-pulse" />
        <div className="size-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-inner"><Zap size={24} className="text-white fill-white/20" /></div>
        <div className="flex-1 space-y-3"><div className="h-2.5 w-40 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.3)]" /><div className="h-2.5 w-full bg-blue-500/40 rounded-full" /></div>
      </div>
      
      <div className="iter-item iter-item-3 p-5 rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-md shadow-lg flex items-center gap-5 -translate-x-6 opacity-70 hover:opacity-100 transition-opacity">
        <div className="size-12 rounded-xl bg-slate-100/50 flex items-center justify-center border border-slate-200"><CheckCircle2 size={24} className="text-slate-400" /></div>
        <div className="flex-1 space-y-3"><div className="h-2.5 w-24 bg-slate-200 rounded-full" /><div className="h-2.5 w-56 bg-slate-100 rounded-full" /></div>
      </div>
    </div>
  );
}

export default function Home() {
  const { auth, isLoading } = usePuterStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && auth.isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isLoading, auth.isAuthenticated, navigate]);

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

      {/* Centered Hero Section with Typewriter & Sparkles */}
      <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center px-6 md:px-12 overflow-hidden bg-background">
        <div className="absolute inset-0 w-full h-full">
          <SparklesCore
            id="tsparticlesfullpage"
            background="transparent"
            minSize={0.6}
            maxSize={1.4}
            particleDensity={100}
            className="w-full h-full"
            particleColor="#2563eb"
          />
        </div>

        <div className="flex flex-col items-center gap-8 relative z-10 text-center mt-12">
          <ScrollReveal delay={0.1} direction="up" distance={20}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-600/20 bg-blue-600/5 text-blue-600 text-xs font-semibold uppercase tracking-widest w-fit">
              <Sparkles size={14} className="text-blue-500" />
              Resume Intelligence Engine
            </div>
          </ScrollReveal>
          
          <TypewriterEffect 
            words={[
              { text: "Turn", className: "text-foreground" },
              { text: "your", className: "text-foreground" },
              { text: "resume", className: "text-foreground" },
              { text: "into", className: "text-foreground" },
              { text: "an", className: "text-blue-600" },
              { text: "unfair", className: "text-blue-600" },
              { text: "advantage.", className: "text-[#ea580c]" },
            ]}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.1] max-w-4xl"
            cursorClassName="bg-blue-600"
          />
          
          <ScrollReveal delay={0.8} direction="up" distance={20}>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed font-light mx-auto">
              Stop guessing what recruiters want. Let our AI engine analyze, optimize, and score your resume precisely against ATS algorithms.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={1.0} direction="up" distance={20}>
            <button 
              onClick={() => navigate("/auth")}
              className="group relative px-8 py-4 bg-[#ea580c] text-white rounded-full text-lg font-semibold overflow-hidden transition-all hover:scale-105 shadow-lg shadow-orange-500/20 mt-4"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#ea580c] to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="flex items-center gap-2 relative z-10">Analyze My Resume <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" /></span>
            </button>
          </ScrollReveal>
        </div>
      </section>

      {/* Container Scroll Section */}
      <section className="relative bg-background w-full mt-24">
        <ContainerScroll
          titleComponent={
            <div className="flex flex-col items-center justify-center mb-8">
              <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
                Unleash the power of <br />
                <span className="text-blue-600 text-5xl md:text-7xl mt-2 inline-block">AI-Powered Analysis</span>
              </h2>
            </div>
          }
        >
          <img
            src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=2070&auto=format&fit=crop"
            alt="Resume Analysis Dashboard"
            className="mx-auto rounded-2xl object-cover h-full object-left-top shadow-2xl border border-slate-200"
            draggable={false}
          />
        </ContainerScroll>
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
                   <ScoringFeature />
                 </div>
               </SpotlightCard>
             </ScrollReveal>
           </div>

           {/* Step 2 — AI-Powered Iteration */}
           <div className="grid md:grid-cols-2 gap-16 items-center">
             <ScrollReveal direction="right" className="order-2 md:order-1">
               <SpotlightCard spotlightColor="rgba(37,99,235,0.1)" spotlightSize={500} className="relative h-[400px] border border-border-subtle bg-white/50 overflow-hidden backdrop-blur-xl flex items-center justify-center p-8 shadow-sm rounded-2xl">
                 <div className="w-full">
                   <IterationFeature />
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
