import { useEffect, useState } from "react";
import { Link } from "react-router";
import { usePuterStore } from "~/lib/puter";
import { Skeleton, EmptyState, ProgressBar, scoreColor } from "~/components/ui";
import { cn } from "~/lib/utils";
import { TrendingUp, FileText, Award, Upload, Briefcase, ArrowRight } from "lucide-react";
import { PageTransition } from "~/components/motion/PageTransition";
import { TiltCard } from "~/components/motion/TiltCard";
import { ScrollReveal } from "~/components/motion/ScrollReveal";

export const meta = () => ([
  { title: "ResumePilot — Dashboard" },
  { name: "description", content: "Overview of your resume analyses." },
]);

export default function Dashboard() {
  const { kv } = usePuterStore();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResumes = async () => {
      setLoading(true);
      const raw = (await kv.list("resume:*", true)) as KVItem[];
      const parsed = (raw || [])
        .map((item) => {
          try { return JSON.parse(item.value) as Resume; } catch { return null; }
        })
        .filter(Boolean) as Resume[];
      
      // Sort by newest first
      parsed.sort((a, b) => ((b.createdAt ?? b.id) > (a.createdAt ?? a.id) ? 1 : -1));
      setResumes(parsed);
      setLoading(false);
    };
    loadResumes();
  }, [kv]);

  // Metrics calculation
  const totalAnalyzed = resumes.length;
  const validScores = resumes.map(r => r.feedback?.overallScore || 0).filter(s => s > 0);
  const avgScore = validScores.length > 0 ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : 0;
  const highestScore = validScores.length > 0 ? Math.max(...validScores) : 0;

  const recentResumes = resumes.slice(0, 3); // Get top 3 recent

  if (loading) {
    return (
      <PageTransition className="flex flex-col gap-8 max-w-5xl mx-auto">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </PageTransition>
    );
  }

  if (resumes.length === 0) {
    return (
      <PageTransition className="max-w-4xl mx-auto py-8">
        <EmptyState
          icon="✨"
          title="Welcome to ResumeIQ!"
          description="Your dashboard is looking a little empty. Upload your first resume to get actionable feedback and ATS optimization tips."
          action={
            <Link to="/upload" className="rp-btn rp-lg rp-primary mt-4 group">
              <Upload size={18} className="mr-2" />
              Analyze a Resume
              <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          }
        />
      </PageTransition>
    );
  }

  return (
    <PageTransition className="flex flex-col gap-10 max-w-5xl mx-auto pb-12 relative z-10">
      
      {/* Background glow specific to dashboard header */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-600/5 to-transparent pointer-events-none -z-10 rounded-3xl" />

      {/* Header */}
      <ScrollReveal direction="up" distance={20}>
        <div className="pt-4">
          <h1 className="text-4xl font-black text-foreground tracking-tight">Dashboard</h1>
          <p className="text-slate-600 mt-2 text-lg font-light">Your resume intelligence at a glance.</p>
        </div>
      </ScrollReveal>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric Card 1 */}
        <ScrollReveal delay={0.1} direction="up" distance={30}>
          <TiltCard tiltAmount={3}>
            <div className="bg-white/70 rounded-xl backdrop-blur-md border border-border/50 hover:border-blue-600/50 transition-colors flex items-center gap-5 p-6 shadow-sm">
              <div className="size-14 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600 shadow-sm">
                <FileText size={26} />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Total Analyzed</p>
                <p className="text-3xl font-black text-foreground font-mono mt-1">{totalAnalyzed}</p>
              </div>
            </div>
          </TiltCard>
        </ScrollReveal>

        {/* Metric Card 2 */}
        <ScrollReveal delay={0.2} direction="up" distance={30}>
          <TiltCard tiltAmount={3}>
            <div className="bg-white/70 rounded-xl backdrop-blur-md border border-border/50 hover:border-blue-600/50 transition-colors flex items-center gap-5 p-6 shadow-sm">
              <div className="size-14 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600 shadow-sm">
                <TrendingUp size={26} />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Average Score</p>
                <div className="flex items-baseline gap-1 mt-1 font-mono">
                  <p className="text-3xl font-black" style={{ color: avgScore > 0 ? scoreColor(avgScore) : "inherit" }}>
                    {avgScore || "—"}
                  </p>
                  <span className="text-slate-500 text-sm">/100</span>
                </div>
              </div>
            </div>
          </TiltCard>
        </ScrollReveal>

        {/* Metric Card 3 */}
        <ScrollReveal delay={0.3} direction="up" distance={30}>
          <TiltCard tiltAmount={3}>
            <div className="bg-white/70 rounded-xl backdrop-blur-md border border-border/50 hover:border-blue-600/50 transition-colors flex items-center gap-5 p-6 shadow-sm">
              <div className="size-14 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600 shadow-sm">
                <Award size={26} />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Highest Score</p>
                <div className="flex items-baseline gap-1 mt-1 font-mono">
                  <p className="text-3xl font-black" style={{ color: highestScore > 0 ? scoreColor(highestScore) : "inherit" }}>
                    {highestScore || "—"}
                  </p>
                  <span className="text-slate-500 text-sm">/100</span>
                </div>
              </div>
            </div>
          </TiltCard>
        </ScrollReveal>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Main Content Area: Recent Activity */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground tracking-tight">Recent Analyses</h2>
            <Link to="/resumes" className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors hover:underline underline-offset-4">
              View All →
            </Link>
          </div>
          
          <div className="flex flex-col gap-4">
            {recentResumes.map((resume, i) => (
              <ScrollReveal key={resume.id} delay={0.4 + (i * 0.1)} direction="up" distance={20}>
              <Link
                to={`/resume/${resume.id}`}
                className={cn(
                  "bg-white/80 border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-5 group transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(37,99,235,0.15)] hover:border-blue-600/30",

                )}
              >
                {/* Minimal Score Ring */}
                <div className="flex-shrink-0 size-12 rounded-full border border-border flex items-center justify-center" style={{ borderColor: scoreColor(resume.feedback?.overallScore || 0) + '40', background: scoreColor(resume.feedback?.overallScore || 0) + '10' }}>
                  <span className="text-sm font-bold" style={{ color: scoreColor(resume.feedback?.overallScore || 0) }}>
                    {resume.feedback?.overallScore || 0}
                  </span>
                </div>

                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground text-sm truncate group-hover:text-blue-600 transition-colors">
                      {resume.jobTitle || "Resume Analysis"}
                    </p>
                    {resume.companyName && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-200 text-[10px] text-slate-600 flex-shrink-0">
                        {resume.companyName}
                      </span>
                    )}
                  </div>
                  <div className="w-full max-w-[200px]">
                    <ProgressBar value={resume.feedback?.overallScore || 0} />
                  </div>
                </div>

                <div className="text-xs text-slate-500 flex-shrink-0 flex sm:flex-col items-center sm:items-end gap-2">
                  <span>{new Date(resume.createdAt ?? "").toLocaleDateString()}</span>
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-blue-600" />
                </div>
              </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* Sidebar: Quick Actions */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
          
          <div className="flex flex-col gap-3 rp-fade-up delay-300">
            <Link to="/upload" className="bg-white border border-border rounded-xl hover:bg-blue-600/5 hover:border-blue-600/30 shadow-sm transition-all group flex items-start gap-4 cursor-pointer p-4">
              <div className="p-2 rounded-lg bg-slate-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Upload size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm group-hover:text-blue-600 transition-colors">Analyze Resume</h3>
                <p className="text-xs text-slate-500 mt-0.5">Upload a PDF for a new AI analysis.</p>
              </div>
            </Link>

            <Link to="/job-match" className="bg-white border border-border rounded-xl hover:bg-blue-600/5 hover:border-blue-600/30 shadow-sm transition-all group flex items-start gap-4 cursor-pointer p-4">
              <div className="p-2 rounded-lg bg-slate-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Briefcase size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm group-hover:text-blue-600 transition-colors">Job Match</h3>
                <p className="text-xs text-slate-500 mt-0.5">Compare your resume against a job description.</p>
              </div>
            </Link>
          </div>

          <div className="mt-4 bg-slate-50/50 border-dashed border-border rounded-xl p-4">
             <h4 className="text-sm font-medium text-slate-600 mb-2 flex items-center gap-1.5"><TrendingUp size={16}/> Pro Tip</h4>
             <p className="text-xs text-slate-500 leading-relaxed">
               For the best results, tailor your summary and core skills sections heavily based on the job description you're targeting.
             </p>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
