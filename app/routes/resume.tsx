import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import { ScoreRing, ProgressBar, TipCard, SectionCard, Skeleton } from "~/components/ui";
import { cn } from "~/lib/utils";
import { PageTransition } from "~/components/motion/PageTransition";
import { ScrollReveal } from "~/components/motion/ScrollReveal";

export const meta = () => ([
  { title: "ResumeIQ — Resume Analysis" },
  { name: "description", content: "Your AI-powered resume analysis results." },
]);

type Tab = "overview" | "sections" | "jobmatch";

function ScoreLabel({ score }: { score: number }) {
  if (score >= 80) return <span className="text-success font-medium text-sm">Excellent</span>;
  if (score >= 65) return <span className="text-success/80 font-medium text-sm">Good</span>;
  if (score >= 50) return <span className="text-warning font-medium text-sm">Fair</span>;
  return <span className="text-error font-medium text-sm">Needs Work</span>;
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
      setLoadingData(false);
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

  const goodTips = feedback
    ? sections.flatMap((s) => (s.data?.tips || []).filter((t) => t.type === "good").map((t) => ({ ...t, section: s.title })))
    : [];
  const improveTips = feedback
    ? sections.flatMap((s) => (s.data?.tips || []).filter((t) => t.type === "improve").map((t) => ({ ...t, section: s.title })))
    : [];

  return (
    <PageTransition className="flex flex-col lg:flex-row h-full gap-8 p-2">
      {/* Left — Resume Preview */}
      <aside className="lg:w-[380px] xl:w-[420px] flex-shrink-0 border border-border/50 rounded-2xl bg-slate-50/50 backdrop-blur-md flex flex-col items-center p-6 lg:h-[calc(100vh-8rem)] lg:overflow-y-auto shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />
          
          {loadingData ? (
            <Skeleton className="w-full aspect-[3/4] max-w-[300px]" />
          ) : imageUrl ? (
            <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="w-full max-w-[300px] relative z-10 group">
              <div className="rounded-xl overflow-hidden border border-border shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(37,99,235,0.2)]">
                <img src={imageUrl} alt="Resume preview" className="w-full h-auto" />
                <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-colors pointer-events-none" />
              </div>
            </a>
          ) : (
            <div className="w-full max-w-[300px] aspect-[3/4] rounded-xl bg-slate-200 flex items-center justify-center relative z-10">
              <p className="text-slate-500 text-sm">Preview unavailable</p>
            </div>
          )}

          {/* Meta info */}
          {resumeData && (
            <div className="mt-8 w-full max-w-[300px] flex flex-col gap-3 relative z-10 p-4 rounded-xl bg-white/50 border border-border">
              {resumeData.companyName && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 uppercase tracking-wider text-xs">Target</span>
                  <span className="text-foreground font-medium truncate max-w-[150px]">{resumeData.companyName}</span>
                </div>
              )}
              {resumeData.jobTitle && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 uppercase tracking-wider text-xs">Role</span>
                  <span className="text-foreground font-medium truncate max-w-[150px]">{resumeData.jobTitle}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm border-t border-border pt-3 mt-1">
                  <span className="text-slate-500 uppercase tracking-wider text-xs">Analyzed</span>
                  <span className="text-foreground">
                  {resumeData.createdAt ? new Date(resumeData.createdAt).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric"
                  }) : "—"}
                  </span>
              </div>
            </div>
          )}
        </aside>

        {/* Right — Analysis */}
        <main className="flex-1 px-2 sm:px-4 py-4 max-w-3xl">
          {loadingData ? (
            <div className="flex flex-col gap-6">
              <Skeleton className="h-8 w-48" />
              <div className="flex gap-4">
                {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 flex-1" />)}
              </div>
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : !feedback ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center h-full">
              <span className="text-4xl animate-bounce">⚠️</span>
              <h3 className="text-foreground font-semibold text-xl">Analysis not found</h3>
              <p className="text-slate-500">This resume analysis may have been deleted.</p>
              <Link to="/dashboard" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold mt-4">Go to Dashboard</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {/* Header: Score */}
              <ScrollReveal direction="up" distance={20}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 bg-white/50 p-6 rounded-3xl border border-border/50 shadow-lg">
                  <ScoreRing score={feedback.overallScore || 0} size={140} strokeWidth={10} />
                  <div className="flex flex-col gap-3">
                    <h2 className="text-3xl font-black text-foreground tracking-tight">Resume Analysis</h2>
                    <p className="text-slate-600 leading-relaxed max-w-md">
                      ATS-style compatibility estimate based on content, structure, and keyword analysis.
                    </p>
                    <div className="flex items-center gap-2 mt-2 px-3 py-1.5 rounded-full bg-slate-100 w-fit">
                      <ScoreLabel score={feedback.overallScore || 0} />
                      <span className="text-slate-500 text-xs">·</span>
                      <span className="text-xs text-slate-500">{(feedback.overallScore || 0)}/100 overall</span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Section score overview */}
              <ScrollReveal delay={0.1} direction="up" distance={20}>
                <div className="bg-white/70 border border-border rounded-2xl p-6 shadow-sm backdrop-blur-xl flex flex-col gap-4">
                  <h3 className="text-foreground font-semibold">Score Breakdown</h3>
                  <div className="flex flex-col gap-3">
                    {sections.filter(s => s.data).map((s) => (
                      <div key={s.key} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">{s.title}</span>
                          <span className="text-sm font-semibold text-foreground">{s.data.score || 0}/100</span>
                        </div>
                        <ProgressBar value={s.data.score || 0} />
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>

              {/* Tabs */}
              <div>
                <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
                  {([
                    { key: "overview", label: "Strengths & Issues" },
                    { key: "sections", label: "Detailed Sections" },
                    ...(feedback.jobMatch && feedback.jobMatch.score > 0
                      ? [{ key: "jobmatch", label: `Job Match — ${feedback.jobMatch.score}%` }]
                      : []),
                  ] as { key: Tab; label: string }[]).map((t) => (
                    <button
                      key={t.key}
                      className={cn("px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors", tab === t.key ? "bg-blue-600 text-white" : "bg-white/50 text-slate-600 hover:bg-slate-100")}
                      onClick={() => setTab(t.key)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Overview tab */}
                {tab === "overview" && (
                  <div className="flex flex-col gap-6 rp-fade-in">
                    {goodTips.length > 0 && (
                      <div className="flex flex-col gap-3">
                        <h3 className="text-foreground font-semibold flex items-center gap-2">
                          <span className="text-success">✓</span> Strengths ({goodTips.length})
                        </h3>
                        {goodTips.map((t, i) => (
                          <div key={i} className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                              <span className="text-success font-bold flex-shrink-0">✓</span>
                              <div className="flex flex-col gap-1">
                                <p className="font-semibold text-sm text-green-800">
                                  {t.tip}
                                  <span className="ml-2 text-xs font-normal text-green-600/70">({t.section})</span>
                                </p>
                                {t.explanation && (
                                  <p className="text-xs text-green-700/70 leading-relaxed">{t.explanation}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {improveTips.length > 0 && (
                      <div className="flex flex-col gap-3">
                        <h3 className="text-foreground font-semibold flex items-center gap-2">
                          <span className="text-warning">⚠</span> Areas to Improve ({improveTips.length})
                        </h3>
                        {improveTips.map((t, i) => (
                          <div key={i} className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                              <span className="text-warning font-bold flex-shrink-0">⚠</span>
                              <div className="flex flex-col gap-1">
                                <p className="font-semibold text-sm text-orange-800">
                                  {t.tip}
                                  <span className="ml-2 text-xs font-normal text-orange-600/70">({t.section})</span>
                                </p>
                                {t.explanation && (
                                  <p className="text-xs text-orange-700/70 leading-relaxed">{t.explanation}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Sections tab */}
                {tab === "sections" && (
                  <div className="flex flex-col gap-5 rp-fade-in">
                    {sections.filter(s => s.data).map((s) => (
                      <SectionCard
                        key={s.key}
                        title={s.title}
                        score={s.data.score || 0}
                        tips={s.data.tips || []}
                      />
                    ))}
                  </div>
                )}

                {/* Job Match tab */}
                {tab === "jobmatch" && feedback.jobMatch && (
                  <div className="flex flex-col gap-6 rp-fade-in">
                    {/* Match score */}
                    <div className="bg-white/70 border border-border rounded-2xl p-6 shadow-sm backdrop-blur-xl flex flex-col sm:flex-row items-center gap-6">
                      <ScoreRing score={feedback.jobMatch.score} size={100} strokeWidth={10} />
                      <div className="flex flex-col gap-1 text-center sm:text-left">
                        <h3 className="text-foreground font-semibold">Job Description Match</h3>
                        <p className="text-slate-500 text-sm">
                          How well your resume aligns with the job requirements.
                        </p>
                      </div>
                    </div>

                    {/* Keywords */}
                    {(feedback.jobMatch.matchedKeywords || []).length > 0 && (
                      <div className="bg-white/70 border border-border rounded-2xl p-6 shadow-sm backdrop-blur-xl flex flex-col gap-3">
                        <h4 className="text-foreground font-semibold">
                          ✓ Matched Keywords ({(feedback.jobMatch.matchedKeywords || []).length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {(feedback.jobMatch.matchedKeywords || []).map((kw) => (
                            <span key={kw} className="px-3 py-1 bg-green-500/10 text-green-700 border border-green-500/20 rounded-lg text-sm font-medium">{kw}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {(feedback.jobMatch.missingKeywords || []).length > 0 && (
                      <div className="bg-white/70 border border-border rounded-2xl p-6 shadow-sm backdrop-blur-xl flex flex-col gap-3">
                        <h4 className="text-foreground font-semibold">
                          ✕ Missing Keywords ({(feedback.jobMatch.missingKeywords || []).length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {(feedback.jobMatch.missingKeywords || []).map((kw) => (
                            <span key={kw} className="px-3 py-1 bg-red-500/10 text-red-700 border border-red-500/20 rounded-lg text-sm font-medium">{kw}</span>
                          ))}
                        </div>
                        <p className="text-xs text-slate-500 italic">
                          If you genuinely have experience with these, consider adding them to your resume.
                        </p>
                      </div>
                    )}

                    {/* Skills */}
                    {(feedback.jobMatch.matchedSkills || []).length > 0 && (
                      <div className="bg-white/70 border border-border rounded-2xl p-6 shadow-sm backdrop-blur-xl flex flex-col gap-3">
                        <h4 className="text-foreground font-semibold">
                          ✓ Matched Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {(feedback.jobMatch.matchedSkills || []).map((s) => (
                            <span key={s} className="px-3 py-1 bg-green-500/10 text-green-700 border border-green-500/20 rounded-lg text-sm font-medium">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {(feedback.jobMatch.missingSkills || []).length > 0 && (
                      <div className="bg-white/70 border border-border rounded-2xl p-6 shadow-sm backdrop-blur-xl flex flex-col gap-3">
                        <h4 className="text-foreground font-semibold">
                          ✕ Missing Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {(feedback.jobMatch.missingSkills || []).map((s) => (
                            <span key={s} className="px-3 py-1 bg-red-500/10 text-red-700 border border-red-500/20 rounded-lg text-sm font-medium">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tips */}
                    {(feedback.jobMatch.tips || []).length > 0 && (
                      <div className="flex flex-col gap-3">
                        <h4 className="text-foreground font-semibold">Recommendations</h4>
                        {(feedback.jobMatch.tips || []).map((t, i) => (
                          <TipCard key={i} {...t} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="bg-blue-600/5 border border-blue-600/20 rounded-2xl p-6 shadow-sm backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <h4 className="text-foreground font-semibold">Ready to improve?</h4>
                  <p className="text-slate-500 text-sm">Implement the suggestions above and re-analyze to track your progress.</p>
                </div>
                <Link to="/upload" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold flex-shrink-0">
                  Analyze Another →
                </Link>
              </div>
            </div>
          )}
        </main>
    </PageTransition>
  );
};

export default Resume;
