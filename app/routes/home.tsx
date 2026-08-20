import type { Route } from "./+types/home";
import { Link, useNavigate } from "react-router";
import { useEffect } from "react";
import { usePuterStore } from "~/lib/puter";
import { ArrowRight, CheckCircle2, FileSearch, Sparkles, Target } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "ResumeIQ — AI Resume Intelligence Platform" },
    {
      name: "description",
      content:
        "Analyze your resume, optimize for ATS, match against job descriptions, and get AI-powered improvement suggestions.",
    },
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-0 flex items-center justify-center">
        <div className="size-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const features = [
    {
      icon: Target,
      title: "ATS Intelligence",
      description: "Advanced parsing to determine exactly how ATS systems view your resume, with multi-dimensional scoring."
    },
    {
      icon: FileSearch,
      title: "Job Matching",
      description: "Compare your resume directly against target job descriptions. Discover missing keywords instantly."
    },
    {
      icon: Sparkles,
      title: "AI Copilot",
      description: "An intelligent assistant that answers questions about your resume and helps tailor bullet points."
    }
  ];

  return (
    <div className="min-h-screen bg-surface-0 text-text-primary selection:bg-brand-500/30">
      {/* Navbar */}
      <nav className="h-16 border-b border-border-default/50 bg-surface-0/80 backdrop-blur-md sticky top-0 z-50 px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            <span className="text-white text-sm font-bold">IQ</span>
          </div>
          <span className="text-lg font-bold tracking-tight">
            Resume<span className="text-brand-400">IQ</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/auth")}
            className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={() => navigate("/auth")}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-text-primary text-surface-0 rounded-full text-sm font-semibold hover:bg-white transition-colors"
          >
            Get Started <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      <main className="flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full max-w-6xl px-4 pt-32 pb-24 flex flex-col items-center text-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-500/10 rounded-[100%] blur-[100px] pointer-events-none" />
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-400 text-xs font-medium mb-8">
            <Sparkles size={14} />
            <span>Resume Intelligence Engine 2.0</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 max-w-4xl bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent leading-[1.1]">
            Turn your resume into your unfair advantage.
          </h1>
          
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mb-10 leading-relaxed">
            AI-powered resume analysis, ATS optimization, and job matching. 
            Stop guessing what recruiters want and start optimizing with data.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button 
              onClick={() => navigate("/auth")}
              className="px-8 py-4 bg-brand-500 hover:bg-brand-400 text-white rounded-full text-lg font-semibold transition-all shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] flex items-center gap-2"
            >
              Analyze My Resume <ArrowRight size={20} />
            </button>
            <a 
              href="#how-it-works"
              className="px-8 py-4 bg-surface-100 hover:bg-surface-200 border border-border-default text-text-primary rounded-full text-lg font-semibold transition-colors"
            >
              See How It Works
            </a>
          </div>
        </section>

        {/* Product Preview / Stats Dashboard Mockup */}
        <section className="w-full max-w-5xl px-4 pb-32">
          <div className="rounded-2xl border border-border-default/50 bg-surface-100/50 backdrop-blur-sm shadow-2xl p-2">
            <div className="rounded-xl border border-border-default bg-surface-50 overflow-hidden relative">
              <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />
              
              <div className="p-8 grid md:grid-cols-3 gap-8">
                <div className="col-span-1 md:col-span-2 flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">Frontend Engineer</h3>
                      <p className="text-sm text-text-muted">Analyzed just now</p>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-success/10 border border-success/20 text-success text-sm font-medium">
                      High Match
                    </div>
                  </div>
                  
                  <div className="h-48 rounded-lg border border-border-default bg-surface-100 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                    <div className="flex flex-col items-center gap-2 z-10">
                      <span className="text-5xl font-bold tracking-tighter">87<span className="text-2xl text-text-muted">/100</span></span>
                      <span className="text-sm text-text-secondary uppercase tracking-widest font-semibold">ATS Compatibility</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Health Checks</h4>
                  <div className="flex flex-col gap-3">
                    {["Keyword Optimization", "Formatting", "Impact Metrics"].map(label => (
                      <div key={label} className="flex items-center justify-between p-3 rounded-lg border border-border-default bg-surface-0">
                        <span className="text-sm font-medium">{label}</span>
                        <CheckCircle2 size={16} className="text-success" />
                      </div>
                    ))}
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border-default bg-surface-0">
                      <span className="text-sm font-medium">Skills Coverage</span>
                      <span className="text-sm font-bold text-warning">78%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="how-it-works" className="w-full max-w-6xl px-4 py-24 border-t border-border-default/30">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Engineered for Success</h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Everything you need to bypass ATS filters and land your dream job, packed into one clean interface.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="p-6 rounded-2xl border border-border-default bg-surface-50 hover:bg-surface-100 transition-colors">
                <div className="size-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-6">
                  <f.icon size={24} className="text-brand-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-text-secondary leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="w-full px-4 py-32 border-t border-border-default/30 flex flex-col items-center text-center">
          <h2 className="text-4xl font-bold tracking-tight mb-6">Ready to get hired?</h2>
          <p className="text-text-secondary mb-10 max-w-xl">
            Join thousands of developers and professionals using ResumeIQ to optimize their resumes and land interviews.
          </p>
          <button 
            onClick={() => navigate("/auth")}
            className="px-8 py-4 bg-text-primary text-surface-0 rounded-full text-lg font-bold hover:bg-white transition-colors"
          >
            Start For Free
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-default/50 bg-surface-50 py-12 px-4 text-center">
        <p className="text-text-muted text-sm">
          © {new Date().getFullYear()} ResumeIQ. Built for the modern job seeker.
        </p>
      </footer>
    </div>
  );
}
