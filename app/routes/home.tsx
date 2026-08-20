import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { EmptyState, Skeleton } from "~/components/ui";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "ResumePilot — AI Resume Intelligence Platform" },
    {
      name: "description",
      content:
        "Analyze your resume, optimize for ATS, match against job descriptions, and get AI-powered improvement suggestions.",
    },
  ];
}

// ============================================================
// LANDING PAGE (unauthenticated)
// ============================================================
function LandingPage() {
  const { auth } = usePuterStore();
  const navigate = useNavigate();

  const features = [
    {
      icon: "📊",
      title: "ATS Score Analysis",
      description:
        "Get an ATS-style compatibility score with detailed breakdown across tone, structure, content, and skills.",
    },
    {
      icon: "🔍",
      title: "Job Description Matching",
      description:
        "Compare your resume against any job description to see matched and missing keywords and skills.",
    },
    {
      icon: "✨",
      title: "AI-Powered Insights",
      description:
        "Receive specific, actionable recommendations powered by Claude AI to improve every section of your resume.",
    },
    {
      icon: "📈",
      title: "Track Your Progress",
      description:
        "Save multiple resume versions and track how your score improves over time with each iteration.",
    },
    {
      icon: "🎯",
      title: "Keyword Optimization",
      description:
        "Identify missing keywords from job descriptions and understand which skills to highlight.",
    },
    {
      icon: "🔒",
      title: "Private & Secure",
      description:
        "Your resume data stays in your private Puter cloud storage. We never share or train on your data.",
    },
  ];

  const steps = [
    { num: "01", title: "Upload Resume", desc: "Drag & drop your PDF resume — up to 20MB." },
    { num: "02", title: "Add Job Description", desc: "Optionally paste the job description you're targeting." },
    { num: "03", title: "Get AI Analysis", desc: "Receive a full ATS score, keyword analysis, and actionable tips." },
    { num: "04", title: "Improve & Repeat", desc: "Apply suggestions, re-analyze, and track your score over time." },
  ];

  return (
    <div className="min-h-screen bg-surface-0">
      <Navbar />

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 pt-24 pb-32 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="rp-fade-up relative z-10 flex flex-col items-center gap-6 max-w-4xl mx-auto">
          <span className="rp-hero-badge">
            <span className="size-2 rounded-full bg-success animate-pulse" />
            Powered by Claude AI
          </span>

          <h1 className="rp-text-gradient">
            Turn your resume into your<br className="hidden sm:block" /> unfair advantage.
          </h1>

          <p className="text-lg text-text-secondary max-w-2xl leading-relaxed">
            Analyze your resume, optimize it for ATS systems, match it against real job descriptions,
            and improve every section with AI-powered recommendations.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <button
              onClick={() => navigate("/auth?next=/upload")}
              className="rp-btn rp-xl rp-primary"
            >
              Analyze My Resume →
            </button>
            <a
              href="#how-it-works"
              className="rp-btn rp-xl rp-secondary"
            >
              See How It Works
            </a>
          </div>

          <p className="text-xs text-text-muted">
            Free to use · No credit card required · Powered by Puter + Claude
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-border-subtle py-8 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { val: "ATS", label: "Compatibility Analysis" },
            { val: "9+", label: "Scoring Categories" },
            { val: "AI", label: "Powered by Claude 3.7" },
            { val: "Free", label: "No Hidden Costs" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col gap-1">
              <span className="text-2xl font-bold rp-text-gradient">{s.val}</span>
              <span className="text-xs text-text-muted">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 max-w-6xl mx-auto">
        <div className="flex flex-col items-center gap-4 text-center mb-16">
          <span className="rp-hero-badge">Features</span>
          <h2 className="text-text-primary">Everything you need to land your next role</h2>
          <p className="text-text-secondary max-w-xl">
            ResumePilot combines ATS intelligence, AI analysis, and job matching into one platform.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`rp-feature-card rp-fade-up delay-${(i % 3) * 100 + 100}`}
            >
              <div className="rp-feature-icon text-2xl">{f.icon}</div>
              <div className="flex flex-col gap-1">
                <h3 className="text-text-primary">{f.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-4 border-t border-border-subtle bg-surface-50">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center gap-4 text-center mb-16">
            <span className="rp-hero-badge">How It Works</span>
            <h2 className="text-text-primary">From upload to optimized in minutes</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.num} className={`flex flex-col gap-4 rp-fade-up delay-${i * 100 + 100}`}>
                <div className="size-12 rounded-xl rp-gradient-brand flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {s.num}
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-text-primary font-semibold">{s.title}</h4>
                  <p className="text-sm text-text-secondary">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">
          <h2 className="text-text-primary">Ready to optimize your resume?</h2>
          <p className="text-text-secondary">
            Join thousands of job seekers using AI to get past ATS filters and land more interviews.
          </p>
          <button
            onClick={() => navigate("/auth?next=/upload")}
            className="rp-btn rp-xl rp-primary"
          >
            Start Free Analysis →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-subtle py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded rp-gradient-brand flex items-center justify-center">
              <span className="text-white text-xs font-bold">RP</span>
            </div>
            <span className="text-sm font-semibold text-text-primary">ResumePilot</span>
          </div>
          <p className="text-xs text-text-muted">
            © 2025 ResumePilot · ATS scores are estimates, not guarantees · Built with Puter + Claude AI
          </p>
        </div>
      </footer>
    </div>
  );
}

// ============================================================
// DASHBOARD (authenticated)
// ============================================================
function Dashboard() {
  const { auth, kv } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);

  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);
      try {
        const raw = (await kv.list("resume:*", true)) as KVItem[];
        const parsed = (raw || [])
          .map((item) => {
            try { return JSON.parse(item.value) as Resume; } catch { return null; }
          })
          .filter(Boolean) as Resume[];
        // Sort by newest first (fallback: by id)
        parsed.sort((a, b) =>
          (b.createdAt ?? b.id) > (a.createdAt ?? a.id) ? 1 : -1
        );
        setResumes(parsed);
      } finally {
        setLoadingResumes(false);
      }
    };
    loadResumes();
  }, []);

  const avgScore = resumes.length
    ? Math.round(resumes.reduce((s, r) => s + r.feedback.overallScore, 0) / resumes.length)
    : null;

  const topScore = resumes.length
    ? Math.max(...resumes.map((r) => r.feedback.overallScore))
    : null;

  const recent = resumes.slice(0, 3);

  return (
    <div className="min-h-screen bg-surface-0">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Welcome */}
        <div className="page-header rp-fade-up">
          <h1 className="text-3xl font-bold text-text-primary">
            Welcome back, <span className="rp-text-gradient">{auth.user?.username}</span> 👋
          </h1>
          <p className="text-text-secondary">
            Track your resume performance and continue optimizing for your dream job.
          </p>
        </div>

        {/* Stats row */}
        {resumes.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10 rp-fade-up delay-100">
            {[
              { label: "Resumes Analyzed", val: resumes.length, type: "brand" },
              { label: "Average Score", val: avgScore ? `${avgScore}/100` : "—", type: avgScore && avgScore >= 70 ? "good" : avgScore && avgScore >= 40 ? "warn" : "bad" },
              { label: "Best Score", val: topScore ? `${topScore}/100` : "—", type: "good" },
              { label: "AI Analyses", val: resumes.length, type: "brand" },
            ].map((stat) => (
              <div key={stat.label} className={`rp-stat-card rp-stat-${stat.type}`}>
                <p className="text-xs text-text-muted font-medium uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-text-primary">{stat.val}</p>
              </div>
            ))}
          </div>
        )}

        {/* Quick actions */}
        <div className="flex flex-wrap gap-3 mb-10 rp-fade-up delay-100">
          <button onClick={() => navigate("/upload")} className="rp-btn rp-md rp-primary">
            + Analyze New Resume
          </button>
          <button onClick={() => navigate("/history")} className="rp-btn rp-md rp-secondary">
            View History
          </button>
        </div>

        {/* Resumes */}
        <div className="section-title rp-fade-up delay-200">
          {loadingResumes ? "Loading..." : resumes.length > 0 ? "Your Analyses" : ""}
        </div>

        {loadingResumes && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rp-card flex flex-col gap-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-48 w-full" />
              </div>
            ))}
          </div>
        )}

        {!loadingResumes && resumes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 rp-fade-in">
            {resumes.map((resume, i) => (
              <div key={resume.id} className={`rp-fade-up delay-${Math.min(i * 100, 400)}`}>
                <ResumeCard resume={resume} />
              </div>
            ))}
          </div>
        )}

        {!loadingResumes && resumes.length === 0 && (
          <div className="rp-fade-in">
            <EmptyState
              icon="📄"
              title="No analyses yet"
              description="Upload your first resume to receive an AI-powered ATS score and personalized improvement tips."
              action={
                <button onClick={() => navigate("/upload")} className="rp-btn rp-lg rp-primary mt-2">
                  Analyze My Resume
                </button>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// ROOT — decides which view to show
// ============================================================
export default function Home() {
  const { auth, isLoading } = usePuterStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-xl rp-gradient-brand flex items-center justify-center animate-pulse">
            <span className="text-white text-lg font-bold">RP</span>
          </div>
          <p className="text-text-muted text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return auth.isAuthenticated ? <Dashboard /> : <LandingPage />;
}

