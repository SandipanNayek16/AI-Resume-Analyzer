import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import Navbar from "~/components/Navbar";
import { EmptyState, ProgressBar, Skeleton } from "~/components/ui";
import { cn } from "~/lib/utils";

export const meta = () => ([
  { title: "ResumePilot — My Resumes" },
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
      case "highest": return (b.feedback?.overallScore || 0) - (a.feedback?.overallScore || 0);
      case "lowest":  return (a.feedback?.overallScore || 0) - (b.feedback?.overallScore || 0);
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

  const scoreColor = (s: number) => s >= 70 ? "text-success" : s >= 40 ? "text-warning" : "text-error";
  const scoreBg = (s: number) => s >= 70 ? "bg-success/10 border-success/20" : s >= 40 ? "bg-warning/10 border-warning/20" : "bg-error/10 border-error/20";

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8 rp-fade-up">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-text-primary text-2xl font-bold">My Resumes</h2>
              <p className="text-text-secondary text-sm mt-1">
                {loading ? "Loading..." : `${resumes.length} total ${resumes.length === 1 ? "analysis" : "analyses"}`}
              </p>
            </div>

            {/* Sort */}
            {!loading && resumes.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted">Sort:</span>
                <div className="flex gap-1 bg-surface-200 rounded-lg p-1 border border-border-subtle">
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
                          ? "bg-surface-400 text-text-primary font-medium"
                          : "text-text-muted hover:text-text-secondary"
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
              <div key={i} className="rp-card flex items-center gap-4">
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
              <Link to="/upload" className="rp-btn rp-lg rp-primary mt-2">
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
                  "rp-card rp-card-hover flex flex-col sm:flex-row items-start sm:items-center gap-4 group rp-fade-up",
                  `delay-${Math.min(i * 50, 300)}`
                )}
              >
                {/* Score badge */}
                <div className={cn(
                  "flex-shrink-0 size-14 rounded-xl border flex flex-col items-center justify-center",
                  scoreBg(resume.feedback?.overallScore || 0)
                )}>
                  <span className={cn("text-lg font-bold leading-none", scoreColor(resume.feedback?.overallScore || 0))}>
                    {resume.feedback?.overallScore || 0}
                  </span>
                  <span className="text-[10px] text-text-muted">/100</span>
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <p className="font-semibold text-text-primary text-sm truncate">
                      {resume.jobTitle || "Resume Analysis"}
                    </p>
                    {resume.companyName && (
                      <span className="badge-good text-xs flex-shrink-0">{resume.companyName}</span>
                    )}
                  </div>
                  {/* Mini score bar */}
                  <div className="w-full max-w-xs">
                    <ProgressBar value={resume.feedback?.overallScore || 0} />
                  </div>
                  <div className="flex gap-4 text-xs text-text-muted">
                    <span>ATS: {resume.feedback.ATS?.score ?? "—"}/100</span>
                    <span>Skills: {resume.feedback.skills?.score ?? "—"}/100</span>
                    {resume.feedback.jobMatch && resume.feedback.jobMatch.score > 0 && (
                      <span>Match: {resume.feedback.jobMatch.score}%</span>
                    )}
                  </div>
                  {resume.createdAt && (
                    <p className="text-xs text-text-muted">
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
                    className="rp-btn rp-sm rp-secondary flex-1 sm:flex-none text-xs"
                  >
                    View →
                  </Link>
                  <button
                    onClick={() => handleDelete(resume.id)}
                    disabled={deleting === resume.id}
                    className="rp-btn rp-sm rp-danger text-xs"
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

export default Resumes;
