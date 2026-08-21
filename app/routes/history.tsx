import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import Navbar from "~/components/Navbar";
import { EmptyState, ProgressBar, Skeleton } from "~/components/ui";
import { cn } from "~/lib/utils";

export const meta = () => ([
  { title: "ResumePilot — Analysis History" },
  { name: "description", content: "View and manage your past resume analyses." },
]);

type SortKey = "newest" | "oldest" | "highest" | "lowest";

const History = () => {
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
      .map((item) => { try { return JSON.parse(item.value) as Resume; } catch { return null; } })
      .filter(Boolean) as Resume[];
    setResumes(parsed);
    setLoading(false);
  };

  useEffect(() => { loadResumes(); }, []);

  const sorted = [...resumes].sort((a, b) => {
    switch (sortKey) {
      case "newest": return (b.createdAt ?? b.id) > (a.createdAt ?? a.id) ? 1 : -1;
      case "oldest": return (a.createdAt ?? a.id) > (b.createdAt ?? b.id) ? 1 : -1;
      case "highest": return b.feedback.overallScore - a.feedback.overallScore;
      case "lowest":  return a.feedback.overallScore - b.feedback.overallScore;
    }
  });

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await kv.delete(`resume:${id}`);
    setResumes((prev) => prev.filter((r) => r.id !== id));
    setDeleting(null);
  };

  const scoreColor = (s: number) => s >= 70 ? "text-success" : s >= 40 ? "text-warning" : "text-error";
  const scoreBg = (s: number) => s >= 70 ? "bg-success/10 border-success/20" : s >= 40 ? "bg-warning/10 border-warning/20" : "bg-error/10 border-error/20";

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8 rp-fade-up">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-foreground text-2xl font-bold">Analysis History</h2>
              <p className="text-slate-600 text-sm mt-1">
                {loading ? "Loading..." : `${resumes.length} total ${resumes.length === 1 ? "analysis" : "analyses"}`}
              </p>
            </div>

            {/* Sort */}
            {!loading && resumes.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Sort:</span>
                <div className="flex gap-1 bg-slate-100 rounded-lg p-1 border border-border/50">
                  {([
                    { key: "newest", label: "Newest" },
                    { key: "oldest", label: "Oldest" },
                    { key: "highest", label: "Highest Score" },
                    { key: "lowest", label: "Lowest Score" },
                  ] as { key: SortKey; label: string }[]).map((s) => (
                    <button
                      key={s.key}
                      onClick={() => setSortKey(s.key)}
                      className={cn(
                        "px-2.5 py-1 text-xs rounded-md transition-all cursor-pointer",
                        sortKey === s.key
                          ? "bg-white text-foreground shadow-sm font-medium"
                          : "text-slate-500 hover:text-slate-700"
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col gap-3">
            {[1,2,3,4].map((i) => (
              <div key={i} className="flex items-center gap-4 bg-white/70 border border-border/50 p-4 rounded-2xl backdrop-blur-sm shadow-sm">
                <Skeleton className="size-12 rounded-xl flex-shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && resumes.length === 0 && (
          <EmptyState
            icon="📂"
            title="No analyses yet"
            description="Upload and analyze your first resume to see it here."
            action={
              <Link to="/upload" className="inline-block px-6 py-3 bg-primary text-white rounded-xl font-medium shadow-sm hover:bg-blue-700 transition-colors mt-2">
                Analyze a Resume
              </Link>
            }
          />
        )}

        {/* List */}
        {!loading && sorted.length > 0 && (
          <div className="flex flex-col gap-3 rp-fade-in">
            {sorted.map((resume, i) => (
              <div
                key={resume.id}
                className={cn(
                  "flex flex-col sm:flex-row items-start sm:items-center gap-4 group rp-fade-up bg-white/70 border border-border/50 p-4 rounded-2xl backdrop-blur-sm shadow-sm hover:shadow-md transition-all hover:bg-white",
                  `delay-${Math.min(i * 50, 300)}`
                )}
              >
                {/* Score badge */}
                <div className={cn(
                  "flex-shrink-0 size-14 rounded-xl border flex flex-col items-center justify-center",
                  scoreBg(resume.feedback.overallScore)
                )}>
                  <span className={cn("text-lg font-bold leading-none", scoreColor(resume.feedback.overallScore))}>
                    {resume.feedback.overallScore}
                  </span>
                  <span className="text-[10px] text-slate-500">/100</span>
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <p className="font-semibold text-foreground text-sm truncate">
                      {resume.jobTitle || "Resume Analysis"}
                    </p>
                    {resume.companyName && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md font-medium border border-green-200 text-[10px] uppercase tracking-wider flex-shrink-0">{resume.companyName}</span>
                    )}
                  </div>
                  {/* Mini score bar */}
                  <div className="w-full max-w-xs">
                    <ProgressBar value={resume.feedback.overallScore} />
                  </div>
                  <div className="flex gap-4 text-xs text-slate-500">
                    <span>ATS: {resume.feedback.ATS?.score ?? "—"}/100</span>
                    <span>Skills: {resume.feedback.skills?.score ?? "—"}/100</span>
                    {resume.feedback.jobMatch && resume.feedback.jobMatch.score > 0 && (
                      <span>Match: {resume.feedback.jobMatch.score}%</span>
                    )}
                  </div>
                  {resume.createdAt && (
                    <p className="text-xs text-slate-500">
                      {new Date(resume.createdAt).toLocaleDateString("en-US", {
                        year: "numeric", month: "short", day: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
                  <Link
                    to={`/resume/${resume.id}`}
                    className="flex-1 sm:flex-none text-xs px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors text-center"
                  >
                    View →
                  </Link>
                  <button
                    onClick={() => handleDelete(resume.id)}
                    disabled={deleting === resume.id}
                    className="text-xs px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl font-medium transition-colors"
                    aria-label="Delete analysis"
                  >
                    {deleting === resume.id ? (
                      <span className="size-3 border border-red-400/30 border-t-red-400 rounded-full animate-spin inline-block" />
                    ) : "✕"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
};

export default History;
