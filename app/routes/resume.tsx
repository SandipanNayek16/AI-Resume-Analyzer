import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import { ScoreRing, ProgressBar, TipCard, SectionCard, Skeleton } from "~/components/ui";
import { cn } from "~/lib/utils";

export const meta = () => ([
  { title: "ResumePilot — Resume Analysis" },
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
    ? sections.flatMap((s) => s.data.tips.filter((t) => t.type === "good").map((t) => ({ ...t, section: s.title })))
    : [];
  const improveTips = feedback
    ? sections.flatMap((s) => s.data.tips.filter((t) => t.type === "improve").map((t) => ({ ...t, section: s.title })))
    : [];

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6">
      {/* Left — Resume Preview */}
      <aside className="lg:w-[380px] xl:w-[420px] flex-shrink-0 border border-border-default rounded-xl bg-surface-50 flex flex-col items-center p-6 lg:h-[calc(100vh-8rem)] lg:overflow-y-auto">
          {loadingData ? (
            <Skeleton className="w-full aspect-[3/4] max-w-[300px]" />
          ) : imageUrl ? (
            <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="w-full max-w-[300px]">
              <div className="rounded-xl overflow-hidden border border-border-muted shadow-xl transition-transform duration-200 hover:scale-[1.01] rp-scale-in">
                <img src={imageUrl} alt="Resume preview" className="w-full h-auto" />
              </div>
            </a>
          ) : (
            <div className="w-full max-w-[300px] aspect-[3/4] rounded-xl bg-surface-300 flex items-center justify-center">
              <p className="text-text-muted text-sm">Preview unavailable</p>
            </div>
          )}

          {/* Meta info */}
          {resumeData && (
            <div className="mt-6 w-full max-w-[300px] flex flex-col gap-2">
              {resumeData.companyName && (
                <p className="text-xs text-text-muted">
                  <span className="text-text-secondary font-medium">Company:</span> {resumeData.companyName}
                </p>
              )}
              {resumeData.jobTitle && (
                <p className="text-xs text-text-muted">
                  <span className="text-text-secondary font-medium">Role:</span> {resumeData.jobTitle}
                </p>
              )}
              {resumeData.createdAt && (
                <p className="text-xs text-text-muted">
                  <span className="text-text-secondary font-medium">Analyzed:</span>{" "}
                  {new Date(resumeData.createdAt).toLocaleDateString("en-US", {
                    year: "numeric", month: "short", day: "numeric",
                  })}
                </p>
              )}
            </div>
          )}
        </aside>

        {/* Right — Analysis */}
        <main className="flex-1 px-4 sm:px-8 py-8 max-w-3xl">
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
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <span className="text-4xl">⚠️</span>
              <h3 className="text-text-primary font-semibold">Analysis not found</h3>
              <p className="text-text-muted text-sm">This resume analysis may have been deleted.</p>
              <Link to="/" className="rp-btn rp-md rp-primary">Go to Dashboard</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-8 rp-fade-in">
              {/* Header: Score */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <ScoreRing score={feedback.overallScore} size={130} strokeWidth={12} />
                <div className="flex flex-col gap-2">
                  <h2 className="text-2xl font-bold text-text-primary">Resume Analysis</h2>
                  <p className="text-text-secondary text-sm">
                    ATS-style compatibility estimate based on content, structure, and keyword analysis.
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <ScoreLabel score={feedback.overallScore} />
                    <span className="text-text-muted text-xs">·</span>
                    <span className="text-xs text-text-muted">{feedback.overallScore}/100 overall</span>
                  </div>
                </div>
              </div>

              {/* Section score overview */}
              <div className="rp-card flex flex-col gap-4">
                <h3 className="text-text-primary font-semibold">Score Breakdown</h3>
                <div className="flex flex-col gap-3">
                  {sections.map((s) => (
                    <div key={s.key} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-text-secondary">{s.title}</span>
                        <span className="text-sm font-semibold text-text-primary">{s.data.score}/100</span>
                      </div>
                      <ProgressBar value={s.data.score} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Tabs */}
              <div>
                <div className="rp-tab-list mb-6">
                  {([
                    { key: "overview", label: "Strengths & Issues" },
                    { key: "sections", label: "Detailed Sections" },
                    ...(feedback.jobMatch && feedback.jobMatch.score > 0
                      ? [{ key: "jobmatch", label: `Job Match — ${feedback.jobMatch.score}%` }]
                      : []),
                  ] as { key: Tab; label: string }[]).map((t) => (
                    <button
                      key={t.key}
                      className={cn("rp-tab", tab === t.key && "rp-step-active")}
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
                        <h3 className="text-text-primary font-semibold flex items-center gap-2">
                          <span className="text-success">✓</span> Strengths ({goodTips.length})
                        </h3>
                        {goodTips.map((t, i) => (
                          <div key={i} className="rp-tip-good rounded-xl p-4">
                            <div className="flex items-start gap-3">
                              <span className="text-success font-bold flex-shrink-0">✓</span>
                              <div className="flex flex-col gap-1">
                                <p className="font-semibold text-sm text-green-200">
                                  {t.tip}
                                  <span className="ml-2 text-xs font-normal text-green-400/70">({t.section})</span>
                                </p>
                                {t.explanation && (
                                  <p className="text-xs text-green-300/70 leading-relaxed">{t.explanation}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {improveTips.length > 0 && (
                      <div className="flex flex-col gap-3">
                        <h3 className="text-text-primary font-semibold flex items-center gap-2">
                          <span className="text-warning">⚠</span> Areas to Improve ({improveTips.length})
                        </h3>
                        {improveTips.map((t, i) => (
                          <div key={i} className="rp-tip-warn rounded-xl p-4">
                            <div className="flex items-start gap-3">
                              <span className="text-warning font-bold flex-shrink-0">⚠</span>
                              <div className="flex flex-col gap-1">
                                <p className="font-semibold text-sm text-yellow-200">
                                  {t.tip}
                                  <span className="ml-2 text-xs font-normal text-yellow-400/70">({t.section})</span>
                                </p>
                                {t.explanation && (
                                  <p className="text-xs text-yellow-300/70 leading-relaxed">{t.explanation}</p>
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
                    {sections.map((s) => (
                      <SectionCard
                        key={s.key}
                        title={s.title}
                        score={s.data.score}
                        tips={s.data.tips}
                      />
                    ))}
                  </div>
                )}

                {/* Job Match tab */}
                {tab === "jobmatch" && feedback.jobMatch && (
                  <div className="flex flex-col gap-6 rp-fade-in">
                    {/* Match score */}
                    <div className="rp-card flex flex-col sm:flex-row items-center gap-6">
                      <ScoreRing score={feedback.jobMatch.score} size={100} strokeWidth={10} />
                      <div className="flex flex-col gap-1 text-center sm:text-left">
                        <h3 className="text-text-primary font-semibold">Job Description Match</h3>
                        <p className="text-text-muted text-sm">
                          How well your resume aligns with the job requirements.
                        </p>
                      </div>
                    </div>

                    {/* Keywords */}
                    {feedback.jobMatch.matchedKeywords.length > 0 && (
                      <div className="rp-card flex flex-col gap-3">
                        <h4 className="text-text-primary font-semibold">
                          ✓ Matched Keywords ({feedback.jobMatch.matchedKeywords.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {feedback.jobMatch.matchedKeywords.map((kw) => (
                            <span key={kw} className="rp-badge-good">{kw}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {feedback.jobMatch.missingKeywords.length > 0 && (
                      <div className="rp-card flex flex-col gap-3">
                        <h4 className="text-text-primary font-semibold">
                          ✕ Missing Keywords ({feedback.jobMatch.missingKeywords.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {feedback.jobMatch.missingKeywords.map((kw) => (
                            <span key={kw} className="rp-badge-bad">{kw}</span>
                          ))}
                        </div>
                        <p className="text-xs text-text-muted italic">
                          If you genuinely have experience with these, consider adding them to your resume.
                        </p>
                      </div>
                    )}

                    {/* Skills */}
                    {feedback.jobMatch.matchedSkills.length > 0 && (
                      <div className="rp-card flex flex-col gap-3">
                        <h4 className="text-text-primary font-semibold">
                          ✓ Matched Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {feedback.jobMatch.matchedSkills.map((s) => (
                            <span key={s} className="rp-badge-good">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {feedback.jobMatch.missingSkills.length > 0 && (
                      <div className="rp-card flex flex-col gap-3">
                        <h4 className="text-text-primary font-semibold">
                          ✕ Missing Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {feedback.jobMatch.missingSkills.map((s) => (
                            <span key={s} className="rp-badge-bad">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tips */}
                    {feedback.jobMatch.tips.length > 0 && (
                      <div className="flex flex-col gap-3">
                        <h4 className="text-text-primary font-semibold">Recommendations</h4>
                        {feedback.jobMatch.tips.map((t, i) => (
                          <TipCard key={i} {...t} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="rp-card bg-brand-500/5 border-brand-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <h4 className="text-text-primary font-semibold">Ready to improve?</h4>
                  <p className="text-text-muted text-sm">Implement the suggestions above and re-analyze to track your progress.</p>
                </div>
                <Link to="/upload" className="rp-btn rp-md rp-primary flex-shrink-0">
                  Analyze Another →
                </Link>
              </div>
            </div>
          )}
        </main>
    </div>
  );
};

export default Resume;
