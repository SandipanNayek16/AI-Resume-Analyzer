import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState, useRef } from "react";
import { usePuterStore } from "~/lib/puter";
import { ScoreRing, ProgressBar, Skeleton, TipCard } from "~/components/ui";
import { cn } from "~/lib/utils";
import { PageTransition } from "~/components/motion/PageTransition";
import { ScrollReveal } from "~/components/motion/ScrollReveal";
import { motion, AnimatePresence } from "framer-motion";

export const meta = () => ([
  { title: "ResumeIQ — Resume Intelligence" },
  { name: "description", content: "AI-powered resume analysis." },
]);

type Tab = "overview" | "sections" | "jobmatch";

// Premium Insight Card Component
function InsightCard({ type, category, finding, explanation, action }: any) {
  const isPositive = type === "strong" || type === "good";
  const colors = {
    strong: "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400",
    good: "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400",
    attention: "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400",
    critical: "bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400"
  };
  const icons = {
    strong: "✨",
    good: "✓",
    attention: "⚠",
    critical: "✕"
  };

  return (
    <div className={`p-5 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:shadow-md ${colors[type as keyof typeof colors]}`}>
      <div className="flex gap-4">
        <div className="text-xl mt-1">{icons[type as keyof typeof icons]}</div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold opacity-70">{category}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/50 dark:bg-black/20 uppercase tracking-widest">{type}</span>
          </div>
          <h4 className="font-bold text-base leading-tight">{finding}</h4>
          <p className="text-sm opacity-90 leading-relaxed">{explanation}</p>
          {action && (
            <div className="mt-2 text-sm font-semibold flex items-center gap-1 opacity-80 cursor-pointer hover:opacity-100 transition-opacity">
              {action} <span className="text-lg leading-none">→</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const Resume = () => {
  const { auth, isLoading, fs, kv } = usePuterStore();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [imageUrl, setImageUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [resumeData, setResumeData] = useState<Resume | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
  }, [isLoading]);

  useEffect(() => {
    const loadResume = async () => {
      setLoadingData(true);
      const stored = await kv.get(`resume:${id}`);
      if (!stored) { setLoadingData(false); return; }

      const data: Resume = JSON.parse(stored);
      setResumeData(data);
      setFeedback(data.feedback);

      try {
        const [resumeBlob, imageBlob] = await Promise.all([
          fs.read(data.resumePath),
          fs.read(data.imagePath),
        ]);

        if (resumeBlob) {
          const pdfBlob = new Blob([resumeBlob], { type: "application/pdf" });
          setResumeUrl(URL.createObjectURL(pdfBlob));
        }
        if (imageBlob) {
          setImageUrl(URL.createObjectURL(imageBlob));
        }
      } catch (err) {
        console.warn("Could not load preview images:", err);
      } finally {
        setLoadingData(false);
      }
    };
    loadResume();
  }, [id]);

  const sections = feedback ? [
    { key: "ats",          title: "ATS Compatibility",  data: feedback.ATS },
    { key: "toneAndStyle", title: "Tone & Style",       data: feedback.toneAndStyle },
    { key: "content",      title: "Content Quality",    data: feedback.content },
    { key: "structure",    title: "Structure",          data: feedback.structure },
    { key: "skills",       title: "Skills Coverage",    data: feedback.skills },
  ] : [];

  const overallScore = feedback?.overallScore || 0;
  
  let scoreStatus = "Needs Work";
  let scoreColor = "text-rose-500";
  if (overallScore >= 80) { scoreStatus = "Excellent"; scoreColor = "text-emerald-500"; }
  else if (overallScore >= 65) { scoreStatus = "Good"; scoreColor = "text-blue-500"; }
  else if (overallScore >= 50) { scoreStatus = "Fair"; scoreColor = "text-amber-500"; }

  // Map backend tips to insight categories
  const insights = feedback ? sections.flatMap((s) => {
    return (s.data?.tips || []).map((t) => ({
      ...t,
      finding: t.tip,
      explanation: t.explanation,
      category: s.title,
      type: t.type === "good" ? (s.data.score > 80 ? "strong" : "good") : (s.data.score < 60 ? "critical" : "attention")
    }));
  }) : [];

  const strengths = insights.filter(i => i.type === "strong" || i.type === "good");
  const issues = insights.filter(i => i.type === "critical" || i.type === "attention");

  return (
    <PageTransition className="flex flex-col lg:flex-row min-h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      
      {/* LEFT PANEL: Cinematic Resume Viewer */}
      <aside className="order-2 lg:order-1 lg:w-[42%] xl:w-[45%] lg:sticky lg:top-0 lg:h-screen bg-slate-200/50 dark:bg-slate-900/50 border-t lg:border-t-0 lg:border-r border-border/50 flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden shadow-[inset_-10px_0_30px_rgba(0,0,0,0.02)] dark:shadow-[inset_-10px_0_30px_rgba(0,0,0,0.2)]">
        
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/5 dark:bg-blue-500/10 blur-[100px] pointer-events-none rounded-full" />
        
        {loadingData ? (
          <Skeleton className="w-full max-w-[450px] aspect-[1/1.4] rounded-sm shadow-2xl" />
        ) : imageUrl ? (
          <div className="relative w-full max-w-[450px] group perspective-[1000px]">
            {/* The Document Container */}
            <motion.div 
              initial={{ opacity: 0, y: 20, rotateX: 5 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative rounded bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-black/5 overflow-y-auto overflow-x-hidden max-h-[80vh] hide-scrollbar ring-1 ring-black/5"
            >
              <img src={imageUrl} alt="Resume Preview" className="w-full h-auto block select-none pointer-events-none" />
              
              {/* Scanning Laser (Simulated load/processing effect) */}
              <motion.div 
                animate={{ top: ["-10%", "110%", "-10%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-1 bg-blue-500/50 shadow-[0_0_20px_4px_rgba(59,130,246,0.5)] z-20 pointer-events-none hidden group-hover:block"
              />
            </motion.div>

            {/* Contextual Highlight Overlay */}
            <AnimatePresence>
              {activeSection && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-blue-900/20 dark:bg-blue-400/20 backdrop-blur-[1px] mix-blend-multiply dark:mix-blend-screen transition-all duration-500 pointer-events-none rounded"
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-3 bg-black/80 text-white font-semibold rounded-full shadow-2xl text-sm tracking-wider uppercase backdrop-blur-md whitespace-nowrap">
                    Focusing: {activeSection}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Document Controls */}
            <div className="absolute -right-16 top-1/2 -translate-y-1/2 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
               <button className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-xl border border-border flex items-center justify-center text-slate-600 hover:text-blue-600 hover:scale-110 transition-all">🔍</button>
               <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-xl border border-border flex items-center justify-center text-slate-600 hover:text-blue-600 hover:scale-110 transition-all">⛶</a>
            </div>
          </div>
        ) : (
           <div className="w-full max-w-[450px] aspect-[1/1.4] bg-slate-200 dark:bg-slate-800 rounded flex items-center justify-center shadow-inner">
             <span className="text-slate-500 font-medium tracking-wide">Document Unavailable</span>
           </div>
        )}
      </aside>

      {/* RIGHT PANEL: Intelligence Dashboard */}
      <main className="order-1 lg:order-2 flex-1 px-6 py-12 lg:px-16 lg:py-16 overflow-y-auto relative bg-transparent">
        
        {loadingData ? (
          <div className="flex flex-col gap-12 max-w-3xl mx-auto">
            <div className="flex gap-8"><Skeleton className="w-32 h-32 rounded-full" /><Skeleton className="flex-1 h-32" /></div>
            <Skeleton className="h-64 w-full" />
          </div>
        ) : !feedback ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto">
             <div className="text-6xl mb-6">⚠️</div>
             <h2 className="text-2xl font-bold mb-2">Analysis Missing</h2>
             <p className="text-slate-500 mb-8">We couldn't retrieve the intelligence data for this document. It may have been deleted.</p>
             <Link to="/dashboard" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">Return to Lab</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-16 max-w-3xl mx-auto pb-24">
            
            {/* Main Score - Signature Component */}
            <ScrollReveal direction="up" distance={30}>
              <div className="flex flex-col md:flex-row items-center gap-10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl p-8 rounded-[2rem] border border-border/60 shadow-[0_30px_60px_rgba(0,0,0,0.05)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.2)]">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full" />
                  <ScoreRing score={overallScore} size={160} strokeWidth={12} className="relative z-10 drop-shadow-xl" />
                </div>
                <div className="flex flex-col text-center md:text-left gap-3">
                  <h1 className="text-4xl font-black tracking-tight bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                    Resume Intelligence
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-md">
                    ATS health and structured keyword analysis estimate.
                  </p>
                  <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
                     <span className={`text-sm font-bold uppercase tracking-widest px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 ${scoreColor}`}>
                       {scoreStatus}
                     </span>
                     <span className="text-slate-400 font-medium text-sm">
                       {overallScore}/100 Overall Health
                     </span>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Score Breakdown (Interactive Tracks) */}
            <ScrollReveal direction="up" delay={0.1} distance={30}>
              <div className="flex flex-col gap-6">
                <h3 className="text-xl font-bold tracking-tight">Score Breakdown</h3>
                <div className="grid grid-cols-1 gap-4">
                  {sections.filter(s => s.data).map((s) => (
                    <div 
                      key={s.key} 
                      className="group flex flex-col gap-2 p-5 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-transparent hover:border-border hover:bg-white dark:hover:bg-slate-900 transition-all cursor-crosshair shadow-sm hover:shadow-lg"
                      onMouseEnter={() => setActiveSection(s.title)}
                      onMouseLeave={() => setActiveSection(null)}
                    >
                      <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                           <span className="font-semibold text-foreground group-hover:text-blue-600 transition-colors">{s.title}</span>
                           <span className="text-xs text-slate-500 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">Focus in document view</span>
                        </div>
                        <span className="font-bold text-lg">{s.data.score}/100</span>
                      </div>
                      <ProgressBar value={s.data.score || 0} className="h-2.5 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* AI Insight Panel (Summary of issues) */}
            {issues.length > 0 && (
              <ScrollReveal direction="up" delay={0.2} distance={30}>
                <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600/5 to-purple-600/5 border border-blue-500/20 flex gap-6 items-start shadow-inner">
                  <div className="w-12 h-12 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600 text-2xl shrink-0">
                    💡
                  </div>
                  <div className="flex flex-col gap-2">
                    <h4 className="font-bold text-lg text-foreground">AI Insight Summary</h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      Your resume was successfully parsed, but we detected {issues.length} areas requiring attention—mostly involving quantifiable metrics and structural consistency.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Intelligent Navigation Tabs */}
            <div className="sticky top-0 z-30 pt-6 pb-4 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-border/50 -mx-6 px-6 lg:-mx-16 lg:px-16 mb-2">
              <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                {([
                  { key: "overview", label: "Key Findings" },
                  { key: "sections", label: "Detailed Explorer" },
                  ...(feedback.jobMatch && feedback.jobMatch.score > 0
                    ? [{ key: "jobmatch", label: `Target Role Match (${feedback.jobMatch.score}%)` }]
                    : []),
                ] as { key: Tab; label: string }[]).map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={cn(
                      "px-5 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all duration-300 relative text-sm",
                      tab === t.key 
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md" 
                        : "bg-transparent text-slate-500 hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Contents */}
            <div className="min-h-[500px]">
              {tab === "overview" && (
                <div className="flex flex-col gap-10">
                  {issues.length > 0 && (
                    <div className="flex flex-col gap-4">
                      <h3 className="text-xl font-bold border-b border-border/50 pb-2">Needs Attention</h3>
                      <div className="grid grid-cols-1 gap-4">
                        {issues.map((insight, i) => (
                          <div key={i} onMouseEnter={() => setActiveSection(insight.category)} onMouseLeave={() => setActiveSection(null)}>
                            <InsightCard {...insight} action="Focus on document" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {strengths.length > 0 && (
                    <div className="flex flex-col gap-4">
                      <h3 className="text-xl font-bold border-b border-border/50 pb-2">Strong Highlights</h3>
                      <div className="grid grid-cols-1 gap-4">
                        {strengths.map((insight, i) => (
                          <div key={i} onMouseEnter={() => setActiveSection(insight.category)} onMouseLeave={() => setActiveSection(null)}>
                            <InsightCard {...insight} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {tab === "sections" && (
                <div className="flex flex-col gap-6">
                  <p className="text-slate-500 mb-4">Deep dive into specific areas of your resume. Hover over a section to locate it on the document.</p>
                  {sections.filter(s => s.data).map((s) => (
                    <div 
                       key={s.key} 
                       className="border border-border/50 bg-white/40 dark:bg-slate-900/40 rounded-2xl p-6 transition-all hover:border-border hover:shadow-lg cursor-crosshair"
                       onMouseEnter={() => setActiveSection(s.title)}
                       onMouseLeave={() => setActiveSection(null)}
                    >
                      <div className="flex justify-between items-center mb-6">
                         <h3 className="text-xl font-bold text-foreground">{s.title}</h3>
                         <div className="flex items-center gap-3">
                           <span className="text-sm font-semibold text-slate-500">Score</span>
                           <span className="text-2xl font-black">{s.data.score}/100</span>
                         </div>
                      </div>
                      
                      <div className="flex flex-col gap-3">
                         {(s.data.tips || []).map((tip: any, i: number) => (
                           <div key={i} className="flex gap-3 items-start bg-black/5 dark:bg-white/5 p-4 rounded-xl">
                              <span className="text-lg mt-0.5">{tip.type === 'good' ? '✅' : '🎯'}</span>
                              <div className="flex flex-col gap-1">
                                 <p className="font-semibold text-sm">{tip.tip}</p>
                                 {tip.explanation && <p className="text-sm text-slate-600 dark:text-slate-400">{tip.explanation}</p>}
                              </div>
                           </div>
                         ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === "jobmatch" && feedback.jobMatch && (
                <div className="flex flex-col gap-10">
                   {/* Job Match Implementation (Similar premium styling) */}
                   <div className="flex flex-col gap-6 bg-white/40 dark:bg-slate-900/40 border border-border/50 rounded-2xl p-8">
                      <div className="flex items-center gap-6 mb-4">
                        <ScoreRing score={feedback.jobMatch.score} size={100} strokeWidth={8} />
                        <div>
                          <h3 className="text-2xl font-bold">Role Compatibility</h3>
                          <p className="text-slate-500">How well your resume targets the job description.</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                         <div className="flex flex-col gap-4">
                           <h4 className="font-bold text-emerald-600 flex items-center gap-2"><span>✓</span> Matched Keywords</h4>
                           <div className="flex flex-wrap gap-2">
                             {(feedback.jobMatch.matchedKeywords || []).map((kw) => (
                               <span key={kw} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-medium">{kw}</span>
                             ))}
                           </div>
                         </div>
                         <div className="flex flex-col gap-4">
                           <h4 className="font-bold text-rose-600 flex items-center gap-2"><span>✕</span> Missing Keywords</h4>
                           <div className="flex flex-wrap gap-2">
                             {(feedback.jobMatch.missingKeywords || []).map((kw) => (
                               <span key={kw} className="px-3 py-1.5 bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 rounded-lg text-sm font-medium">{kw}</span>
                             ))}
                           </div>
                         </div>
                      </div>
                   </div>
                </div>
              )}
            </div>

            {/* Bottom CTA */}
            <div className="mt-8 bg-slate-900 dark:bg-slate-800 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-[80px] group-hover:bg-blue-500/30 transition-colors" />
               <div className="flex flex-col gap-2 relative z-10 text-center md:text-left">
                 <h4 className="text-2xl font-bold text-white">Ready to iterate?</h4>
                 <p className="text-slate-300">Apply these insights to your resume and run another scan to track improvements.</p>
               </div>
               <Link to="/upload" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold tracking-wide relative z-10 shadow-lg shadow-blue-900/20 transition-all hover:-translate-y-0.5">
                 New Analysis
               </Link>
            </div>
            
          </div>
        )}
      </main>
    </PageTransition>
  );
};

export default Resume;
