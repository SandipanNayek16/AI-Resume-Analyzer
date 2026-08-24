import { useEffect, useState, Suspense, lazy } from "react";
import { Link } from "react-router";
import { usePuterStore } from "~/lib/puter";
import { Skeleton, EmptyState, ProgressBar, scoreColor, ScoreRing } from "~/components/ui";
import { cn } from "~/lib/utils";
import { TrendingUp, FileText, Award, Upload, Briefcase, ArrowRight, Zap, Target, Activity } from "lucide-react";
import { PageTransition } from "~/components/motion/PageTransition";
import { TiltCard } from "~/components/motion/TiltCard";
import { ScrollReveal } from "~/components/motion/ScrollReveal";

const Canvas = lazy(() => import("@react-three/fiber").then(m => ({ default: m.Canvas })));
const AIOrb = lazy(() => import("~/components/3d/AIOrb").then(m => ({ default: m.AIOrb })));

export const meta = () => ([
  { title: "ResumeIQ — Dashboard" },
  { name: "description", content: "Overview of your resume analyses." },
]);

// Minimal Line Chart for Score Trend
function ScoreTrendChart({ scores }: { scores: number[] }) {
  if (scores.length < 2) {
    return (
      <div className="h-full w-full flex items-center justify-center p-6 text-center">
        <p className="text-sm text-slate-500 font-medium">Analyze more resumes to unlock your score trend.</p>
      </div>
    );
  }

  const max = Math.max(...scores);
  const min = Math.min(...scores);
  const padding = 10;
  
  // Map points to SVG coordinates
  const height = 80;
  const width = 280;
  
  const getPoint = (score: number, index: number) => {
    const x = (index / (scores.length - 1)) * width;
    const range = max - min || 1;
    const y = height - ((score - min) / range) * height + padding;
    return `${x},${y}`;
  };

  const pointsString = scores.map(getPoint).join(" L ");
  const pathData = `M ${pointsString}`;

  const currentScore = scores[scores.length - 1];
  const previousScore = scores[scores.length - 2];
  const change = currentScore - previousScore;

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl font-black text-foreground font-mono">{currentScore}</span>
        {change !== 0 && (
          <span className={cn("text-sm font-bold flex items-center", change > 0 ? "text-emerald-500" : "text-rose-500")}>
            {change > 0 ? "↑" : "↓"} {Math.abs(change)} pts
          </span>
        )}
      </div>
      <div className="relative h-24 w-full mt-auto">
        <svg viewBox={`-10 0 ${width + 20} ${height + padding * 2}`} className="w-full h-full overflow-visible">
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Area Fill */}
          <path
            d={`M 0,${height + padding * 2} L ${pointsString} L ${width},${height + padding * 2} Z`}
            fill="url(#trendGradient)"
            className="animate-fade-in"
          />
          
          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke="#2563eb"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-dash"
            style={{ strokeDasharray: 1000, strokeDashoffset: 1000, animation: 'dash 1.5s ease-out forwards' }}
          />

          {/* Points */}
          {scores.map((score, i) => {
            const [x, y] = getPoint(score, i).split(",");
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="4"
                fill="white"
                stroke="#2563eb"
                strokeWidth="2"
                className="transition-all duration-300 hover:r-6 hover:stroke-[3px]"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { kv, auth } = usePuterStore();
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

  const userName = auth.user?.username || "there";

  // Metrics calculation
  const totalAnalyzed = resumes.length;
  const validScores = resumes.map(r => r.feedback?.overallScore || 0).filter(s => s > 0);
  const avgScore = validScores.length > 0 ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : 0;
  const highestScore = validScores.length > 0 ? Math.max(...validScores) : 0;

  const recentResumes = resumes.slice(0, 3);
  const latestResume = recentResumes[0];

  // Score Trend Data (Reverse to show oldest to newest)
  const scoreTrendData = resumes
    .slice(0, 7) // Last 7
    .map(r => r.feedback?.overallScore || 0)
    .filter(s => s > 0)
    .reverse();

  if (loading) {
    return (
      <PageTransition className="flex flex-col gap-8 max-w-7xl mx-auto p-4 lg:p-8">
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
      <PageTransition className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md relative">
           <div className="h-64 w-full relative mb-8">
             <Suspense fallback={null}>
               <Canvas camera={{ position: [0, 0, 4] }}>
                 <ambientLight intensity={0.5} />
                 <AIOrb scale={1.2} color="#2563eb" />
               </Canvas>
             </Suspense>
           </div>
           
           <div className="text-center flex flex-col gap-4 relative z-10">
             <h2 className="text-3xl font-black text-foreground tracking-tight">Your intelligence starts here.</h2>
             <p className="text-slate-500 text-lg">Upload your first resume to unlock ATS health, skills analysis, and AI recommendations.</p>
             <Link to="/upload" className="mt-4 inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl text-lg font-bold shadow-lg shadow-blue-600/20 hover:scale-105 hover:bg-blue-500 transition-all mx-auto">
               <Upload size={20} /> Analyze Resume
             </Link>
           </div>
        </div>
      </PageTransition>
    );
  }

  // Derive intelligence from latest resume
  const latestScore = latestResume.feedback?.overallScore || 0;
  const statusLabel = latestScore >= 80 ? "EXCELLENT" : latestScore >= 65 ? "GOOD" : "NEEDS IMPROVEMENT";
  const statusColor = latestScore >= 80 ? "text-emerald-500" : latestScore >= 65 ? "text-blue-500" : "text-amber-500";
  
  const topSkills = latestResume.feedback?.skills?.tips?.filter(t => t.type === 'good').slice(0, 5) || [];
  const topIssues = latestResume.feedback?.content?.tips?.filter(t => t.type === 'improve') || [];
  const aiInsight = topIssues.length > 0 ? topIssues[0].tip : "Your resume is highly optimized. Consider tailoring it further for specific roles.";

  return (
    <PageTransition className="flex flex-col gap-8 max-w-7xl mx-auto pb-16 relative z-10 w-full px-4 lg:px-8">
      
      {/* Cinematic Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-600/5 dark:bg-blue-600/10 blur-[120px] pointer-events-none -z-10 rounded-full" />

      {/* Hero Header */}
      <ScrollReveal direction="up" distance={20}>
        <div className="pt-6">
          <p className="text-xs font-bold text-blue-600 tracking-widest uppercase mb-2">Resume Intelligence</p>
          <h1 className="text-4xl lg:text-5xl font-black text-foreground tracking-tighter">
            Your Resume. Your Next Opportunity.
          </h1>
          <p className="text-slate-500 mt-2 text-lg lg:text-xl font-light">AI-powered insights to help you build a stronger, more targeted resume.</p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Left Column (Primary Health & Insights) */}
        <div className="xl:col-span-2 flex flex-col gap-6 lg:gap-8">
          
          {/* PRIMARY RESUME HEALTH */}
          <ScrollReveal delay={0.1} direction="up" distance={30}>
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-border/60 rounded-[2rem] p-6 lg:p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)] flex flex-col md:flex-row items-center md:items-start gap-8 lg:gap-12 relative overflow-hidden group">
              
              {/* Subtle background element */}
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-600/10 blur-[60px] rounded-full pointer-events-none transition-all duration-1000 group-hover:scale-150" />

              {/* Score Anchor */}
              <div className="flex flex-col items-center gap-4 shrink-0 relative z-10">
                <ScoreRing score={latestScore} size={180} strokeWidth={12} className="drop-shadow-xl" />
                <span className={cn("px-4 py-1.5 rounded-full text-xs font-black tracking-widest bg-slate-100 dark:bg-slate-800", statusColor)}>
                  {statusLabel}
                </span>
              </div>

              {/* Breakdown */}
              <div className="flex-1 w-full flex flex-col gap-6 relative z-10 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold tracking-tight">Resume Health</h3>
                  <Link to={`/resume/${latestResume.id}`} className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group/link">
                    Open Analysis <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                  {[
                    { label: "ATS Compatibility", score: latestResume.feedback?.ATS?.score || 0 },
                    { label: "Content Quality", score: latestResume.feedback?.content?.score || 0 },
                    { label: "Structure & Style", score: latestResume.feedback?.structure?.score || 0 },
                    { label: "Skills Coverage", score: latestResume.feedback?.skills?.score || 0 },
                  ].map((metric, i) => (
                    <div key={i} className="flex flex-col gap-2">
                      <div className="flex justify-between items-end">
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{metric.label}</span>
                        <span className="text-sm font-bold">{metric.score}</span>
                      </div>
                      <ProgressBar value={metric.score} className="h-1.5 bg-black/5 dark:bg-white/5" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* Recent Analyses */}
            <ScrollReveal delay={0.2} direction="up" distance={30} className="flex flex-col gap-4">
              <h3 className="text-lg font-bold tracking-tight px-1">Recent Analyses</h3>
              <div className="flex flex-col gap-3">
                {recentResumes.map((resume, i) => (
                  <Link
                    key={resume.id}
                    to={`/resume/${resume.id}`}
                    className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-border/50 rounded-2xl p-4 flex items-center gap-4 hover:bg-white dark:hover:bg-slate-900 hover:shadow-lg transition-all group"
                  >
                    <div className="shrink-0 size-10 rounded-full flex items-center justify-center font-bold text-sm bg-black/5 dark:bg-white/5" style={{ color: scoreColor(resume.feedback?.overallScore || 0) }}>
                      {resume.feedback?.overallScore || 0}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground text-sm truncate group-hover:text-blue-600 transition-colors">
                        {resume.jobTitle || "Resume Analysis"}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{resume.companyName || new Date(resume.createdAt ?? "").toLocaleDateString()}</p>
                    </div>
                    <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            </ScrollReveal>

            {/* Score Trend */}
            <ScrollReveal delay={0.3} direction="up" distance={30} className="flex flex-col gap-4">
               <h3 className="text-lg font-bold tracking-tight px-1">Score Trend</h3>
               <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-border/50 rounded-2xl p-6 h-full min-h-[160px] flex flex-col hover:shadow-md transition-shadow">
                 <ScoreTrendChart scores={scoreTrendData} />
               </div>
            </ScrollReveal>
          </div>

        </div>

        {/* Right Column (Metrics, Actions, Insights) */}
        <div className="flex flex-col gap-6 lg:gap-8">
          
          {/* Metrics Row */}
          <ScrollReveal delay={0.15} direction="up" distance={30}>
            <div className="grid grid-cols-2 gap-4">
              <TiltCard tiltAmount={5}>
                <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-border/50 rounded-2xl p-5 flex flex-col gap-1 shadow-sm hover:border-blue-600/30 transition-colors h-full">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Analyzed</span>
                  <span className="text-3xl font-black font-mono text-foreground mt-auto">{totalAnalyzed}</span>
                </div>
              </TiltCard>
              <TiltCard tiltAmount={5}>
                <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-border/50 rounded-2xl p-5 flex flex-col gap-1 shadow-sm hover:border-blue-600/30 transition-colors h-full">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Highest</span>
                  <span className="text-3xl font-black font-mono mt-auto" style={{ color: highestScore > 0 ? scoreColor(highestScore) : "inherit" }}>
                    {highestScore || "—"}
                  </span>
                </div>
              </TiltCard>
            </div>
          </ScrollReveal>

          {/* Quick Actions */}
          <ScrollReveal delay={0.25} direction="up" distance={30} className="flex flex-col gap-4">
            <h3 className="text-lg font-bold tracking-tight px-1">Quick Actions</h3>
            <div className="flex flex-col gap-3">
              <Link to="/upload" className="bg-blue-600 hover:bg-blue-500 text-white border border-blue-500 rounded-2xl p-4 flex items-center justify-between shadow-[0_10px_20px_-10px_rgba(37,99,235,0.5)] hover:-translate-y-0.5 transition-all group">
                <div className="flex items-center gap-3">
                   <div className="p-2 rounded-xl bg-white/20"><Upload size={18} /></div>
                   <span className="font-bold">Analyze Resume</span>
                </div>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform opacity-70" />
              </Link>
              
              <Link to="/job-match" className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-border/50 hover:border-border hover:bg-white dark:hover:bg-slate-900 rounded-2xl p-4 flex items-center justify-between transition-all group shadow-sm hover:shadow-md">
                <div className="flex items-center gap-3">
                   <div className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 transition-colors"><Briefcase size={18} /></div>
                   <span className="font-semibold text-slate-700 dark:text-slate-300 group-hover:text-foreground transition-colors">Target Job Match</span>
                </div>
                <Target size={18} className="opacity-0 group-hover:opacity-100 text-blue-600 transition-all -translate-x-2 group-hover:translate-x-0" />
              </Link>
            </div>
          </ScrollReveal>

          {/* AI Insight */}
          <ScrollReveal delay={0.35} direction="up" distance={30} className="mt-auto">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-6 relative overflow-hidden shadow-2xl group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/20 blur-[60px] pointer-events-none transition-all group-hover:bg-blue-500/30" />
              
              <div className="flex items-start gap-4 relative z-10">
                <div className="shrink-0 size-12 relative">
                  <Suspense fallback={<div className="size-full rounded-full bg-blue-600/20 animate-pulse" />}>
                    <Canvas camera={{ position: [0, 0, 4] }}>
                      <ambientLight intensity={0.5} />
                      <AIOrb scale={2} color="#60a5fa" />
                    </Canvas>
                  </Suspense>
                </div>
                <div className="flex flex-col gap-2">
                  <h4 className="text-sm font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Zap size={14} /> AI Insight
                  </h4>
                  <p className="text-white text-sm leading-relaxed opacity-90 italic">
                    "{aiInsight}"
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>

        </div>
      </div>
    </PageTransition>
  );
}
