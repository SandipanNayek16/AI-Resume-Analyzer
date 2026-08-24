import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import Navbar from "~/components/Navbar";
import { EmptyState, ProgressBar, Skeleton } from "~/components/ui";
import { cn } from "~/lib/utils";
import { PageTransition } from "~/components/motion/PageTransition";
import { ScrollReveal } from "~/components/motion/ScrollReveal";
import { TiltCard } from "~/components/motion/TiltCard";
import { Clock, TrendingUp, TrendingDown, Star } from "lucide-react";

export const meta = () => ([
  { title: "ResumeIQ — My Resumes" },
  { name: "description", content: "Manage your uploaded resumes and versions." },
]);

type SortKey = "newest" | "oldest" | "highest" | "lowest";

const Resumes = () => {
  const { auth, isLoading, kv } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) navigate("/auth?next=/history");
  }, [isLoading]);

  const loadResumes = async () => {
    setLoading(true);
    const raw = (await kv.list("resume:*", true)) as KVItem[];
    const parsed = (raw || [])
      .map((item) => { 
        try { 
          const r = JSON.parse(item.value) as Resume; 
          if (!r.id) {
            r.id = item.key.replace("resume:", "");
          }
          return r; 
        } catch { return null; } 
      })
      .filter(Boolean) as Resume[];
    setResumes(parsed);
    setLoading(false);
  };

  useEffect(() => { loadResumes(); }, []);

  const sorted = [...resumes].sort((a, b) => {
    switch (sortKey) {
      case "newest": return (b.createdAt ?? b.id) > (a.createdAt ?? a.id) ? 1 : -1;
      case "oldest": return (a.createdAt ?? a.id) > (b.createdAt ?? b.id) ? 1 : -1;
      case "highest": return (b.feedback?.overallScore ?? 0) - (a.feedback?.overallScore ?? 0);
      case "lowest":  return (a.feedback?.overallScore ?? 0) - (b.feedback?.overallScore ?? 0);
    }
  });

  const handleDelete = async (id: string) => {
    try {
      setDeleting(id);
      await kv.delete(`resume:${id}`);
      setResumes((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Failed to delete analysis:", error);
    } finally {
      setDeleting(null);
    }
  };

  const scoreColor = (s: number) => s >= 70 ? "text-success drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" : s >= 40 ? "text-warning drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "text-error drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]";
  const scoreBg = (s: number) => s >= 70 ? "bg-success/10 border-success/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]" : s >= 40 ? "bg-warning/10 border-warning/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]" : "bg-error/10 border-error/30 shadow-[0_0_15px_rgba(239,68,68,0.15)]";

  return (
    <PageTransition className="max-w-5xl mx-auto py-8 px-4">
      {/* Header */}
      <ScrollReveal direction="down" distance={20} className="flex flex-col sm:flex-row items-start sm:items-center justify-between flex-wrap gap-6 mb-12">
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-600 text-xs font-bold uppercase tracking-widest w-fit">
            <Clock size={14} /> History
          </div>
          <h2 className="text-4xl font-black text-foreground tracking-tight">Analysis History</h2>
          <p className="text-slate-600 text-lg mt-1">
            {loading ? "Loading..." : `${resumes.length} total ${resumes.length === 1 ? "analysis" : "analyses"}`}
          </p>
        </div>

        {/* Sort */}
        {!loading && resumes.length > 1 && (
          <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md p-2 rounded-xl border border-border/50 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">Sort By</span>
            <div className="flex gap-1">
              {([
                { key: "newest", icon: <TrendingUp size={14} />, label: "Newest" },
                { key: "oldest", icon: <TrendingDown size={14} />, label: "Oldest" },
                { key: "highest", icon: <Star size={14} />, label: "Top" },
              ] as { key: SortKey; icon: React.ReactNode; label: string }[]).map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSortKey(s.key)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                    sortKey === s.key
                      ? "bg-blue-600/20 text-blue-600 border border-blue-600/30 shadow-[0_0_10px_rgba(37,99,235,0.2)]"
                      : "text-slate-500 hover:text-foreground hover:bg-slate-100 border border-transparent"
                  )}
                >
                  {s.icon} <span className="hidden sm:inline">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </ScrollReveal>

      {/* Loading */}
      {loading && (
        <div className="grid md:grid-cols-2 gap-6">
          {[1,2,3,4].map((i) => (
            <div key={i} className="flex flex-col gap-4 bg-white/50 rounded-xl p-4 backdrop-blur-sm border border-border/50">
              <div className="flex items-center gap-4">
                <Skeleton className="size-16 rounded-2xl flex-shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
              <Skeleton className="h-2 w-full mt-2" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && resumes.length === 0 && (
        <ScrollReveal direction="up" distance={20} className="mt-8">
          <div className="border border-dashed border-border/50 rounded-3xl bg-slate-50/50 backdrop-blur-sm p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 to-transparent pointer-events-none" />
            <EmptyState
              icon="🚀"
              title="No analyses yet"
              description="Upload your first resume to get started."
              action={
                <Link to="/upload" className="px-8 py-4 bg-blue-600 text-white rounded-xl text-lg font-semibold mt-4 group relative overflow-hidden inline-flex items-center">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10">Analyze a Resume →</span>
                </Link>
              }
            />
          </div>
        </ScrollReveal>
      )}

      {/* List */}
      {!loading && sorted.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-6 relative">
          <div className="absolute left-1/2 -ml-px top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-primary/20 to-transparent hidden lg:block pointer-events-none" />
          {sorted.map((resume, i) => (
            <ScrollReveal 
              key={resume.id}
              delay={i * 0.1} 
              direction={i % 2 === 0 ? "right" : "left"} 
              distance={20}
              className="relative z-10"
            >
              <TiltCard className="h-full">
                <div className="flex flex-col gap-5 h-full bg-white/80 rounded-xl p-6 backdrop-blur-xl border border-border/50 hover:border-blue-600/30 transition-colors shadow-lg hover:shadow-[0_8px_30px_rgba(37,99,235,0.1)] relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  
                  <div className="flex items-start gap-5 relative z-10">
                    {/* Score badge */}
                    <div className={cn(
                      "flex-shrink-0 size-20 rounded-2xl border-2 flex flex-col items-center justify-center relative overflow-hidden",
                      scoreBg(typeof resume.feedback?.overallScore === "number" ? resume.feedback.overallScore : 0)
                    )}>
                      <div className="absolute inset-0 bg-white/5" />
                      <span className={cn("text-2xl font-black leading-none", scoreColor(typeof resume.feedback?.overallScore === "number" ? resume.feedback.overallScore : 0))}>
                        {resume.feedback?.overallScore ?? "—"}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Score</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col min-w-0 py-1">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <p className="font-bold text-foreground text-lg truncate pr-2">
                          {resume.jobTitle || "Resume Analysis"}
                        </p>
                        {resume.createdAt && (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md flex-shrink-0">
                            {new Date(resume.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        )}
                      </div>
                      
                      {resume.companyName && (
                        <span className="text-blue-600 font-semibold text-xs mt-1 truncate">
                          @ {resume.companyName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="flex flex-col gap-3 mt-auto relative z-10 bg-slate-50/50 p-4 rounded-xl border border-border">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <span>ATS</span>
                      <span>Skills</span>
                      {resume.feedback.jobMatch && resume.feedback.jobMatch.score > 0 && <span>Match</span>}
                    </div>
                    <div className="flex justify-between items-center text-sm font-black text-foreground">
                      <span>{resume.feedback.ATS?.score ?? "—"}/100</span>
                      <span>{resume.feedback.skills?.score ?? "—"}/100</span>
                      {resume.feedback.jobMatch && resume.feedback.jobMatch.score > 0 && (
                        <span className="text-blue-600">{resume.feedback.jobMatch.score}%</span>
                      )}
                    </div>
                    <ProgressBar value={typeof resume.feedback?.overallScore === "number" ? resume.feedback.overallScore : 0} className="mt-1" />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 relative z-10 pt-2">
                    <Link
                      to={`/resume/${resume.id}`}
                      className="group/btn relative flex-1 px-4 py-2 rounded-lg bg-slate-100/50 hover:bg-blue-600 hover:text-white border border-transparent hover:border-blue-600/50 flex items-center justify-center transition-colors text-slate-700 overflow-hidden"
                    >
                      <span className="relative z-10 font-bold">View Results →</span>
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete(resume.id);
                      }}
                      disabled={deleting === resume.id}
                      className="aspect-square p-2 rounded-lg bg-slate-100/50 hover:bg-red-500 hover:text-white border border-transparent flex items-center justify-center transition-colors text-slate-500"
                      aria-label="Delete analysis"
                      title="Delete Analysis"
                    >
                      {deleting === resume.id ? (
                        <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                      ) : "✕"}
                    </button>
                  </div>
                </div>
              </TiltCard>
            </ScrollReveal>
          ))}
        </div>
      )}
    </PageTransition>
  );
};

export default Resumes;
