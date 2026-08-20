import { Link } from "react-router";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import { ProgressBar } from "~/components/ui";
import { cn } from "~/lib/utils";

function ScoreChip({ score }: { score: number }) {
  const colorClass =
    score >= 70 ? "text-success bg-success/10 border-success/20" :
    score >= 40 ? "text-warning bg-warning/10 border-warning/20" :
                  "text-error bg-error/10 border-error/20";
  return (
    <div className={cn("flex flex-col items-center justify-center size-14 rounded-xl border font-bold flex-shrink-0", colorClass)}>
      <span className="text-lg leading-none">{score}</span>
      <span className="text-[10px] font-normal opacity-70">/100</span>
    </div>
  );
}

const ResumeCard = ({ resume: { id, companyName, jobTitle, feedback, imagePath } }: { resume: Resume }) => {
  const { fs } = usePuterStore();
  const [resumeUrl, setResumeUrl] = useState("");
  const [imgLoading, setImgLoading] = useState(true);

  useEffect(() => {
    let objectUrl = "";
    const loadImage = async () => {
      const blob = await fs.read(imagePath);
      if (!blob) { setImgLoading(false); return; }
      objectUrl = URL.createObjectURL(blob);
      setResumeUrl(objectUrl);
      setImgLoading(false);
    };
    loadImage();
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [imagePath]);

  const sections = [
    { label: "ATS",      val: feedback.ATS?.score ?? 0 },
    { label: "Content",  val: feedback.content?.score ?? 0 },
    { label: "Skills",   val: feedback.skills?.score ?? 0 },
  ];

  return (
    <Link
      to={`/resume/${id}`}
      className="rp-resume-card no-underline block"
      aria-label={`View analysis: ${jobTitle || "Resume"}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <p className="font-bold text-text-primary truncate">
            {jobTitle || "Resume Analysis"}
          </p>
          {companyName && (
            <span className="badge-good self-start">{companyName}</span>
          )}
        </div>
        <ScoreChip score={feedback.overallScore} />
      </div>

      {/* Progress bars */}
      <div className="flex flex-col gap-2">
        {sections.map((s) => (
          <div key={s.label} className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-muted">{s.label}</span>
              <span className="text-xs font-medium text-text-secondary">{s.val}/100</span>
            </div>
            <ProgressBar value={s.val} />
          </div>
        ))}
      </div>

      {/* Preview image */}
      <div className="rounded-xl overflow-hidden border border-border-subtle bg-surface-300 flex-1 min-h-0 flex items-start">
        {imgLoading ? (
          <div className="w-full h-48 bg-surface-300 animate-pulse" />
        ) : resumeUrl ? (
          <img
            src={resumeUrl}
            alt={`${jobTitle || "Resume"} preview`}
            className="w-full h-48 object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="w-full h-48 flex items-center justify-center text-text-muted text-sm">
            Preview unavailable
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted">
          Overall: <span className="text-text-secondary font-medium">{feedback.overallScore}/100</span>
        </span>
        <span className="text-xs text-brand-400 font-medium group-hover:underline">
          View Analysis →
        </span>
      </div>
    </Link>
  );
};

export default ResumeCard;

