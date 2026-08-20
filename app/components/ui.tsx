import { cn } from "~/lib/utils";

// ---- Score Badge ----
export function ScoreBadge({ score, className }: { score: number; className?: string }) {
  const cls = score >= 70 ? "rp-badge-good" : score >= 40 ? "rp-badge-warn" : "rp-badge-bad";
  const label = score >= 70 ? "Good" : score >= 40 ? "Fair" : "Needs Work";
  return (
    <span className={cn(cls, className)}>
      {label} — {score}/100
    </span>
  );
}

// ---- Score Color Helper ----
export function scoreColor(score: number): string {
  if (score >= 70) return "#10b981";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
}

// ---- Progress Bar ----
export function ProgressBar({
  value,
  max = 100,
  className,
}: {
  value: number;
  max?: number;
  className?: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  const color = scoreColor(value);
  return (
    <div className={cn("rp-progress-track", className)}>
      <div
        className="rp-progress-fill"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

// ---- Skeleton ----
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("rp-skeleton", className)} />;
}

// ---- Score Circle (animated SVG) ----
export function ScoreRing({
  score,
  size = 120,
  strokeWidth = 10,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const color = scoreColor(score);
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="#1e1e35"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="rp-stroke transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-text-primary">{score}</span>
        <span className="text-xs text-text-muted font-medium">/ 100</span>
      </div>
    </div>
  );
}

// ---- Tip Card ----
export function TipCard({ type, tip, explanation }: { type: "good" | "improve"; tip: string; explanation?: string }) {
  const isGood = type === "good";
  return (
    <div className={cn("rounded-xl p-4", isGood ? "rp-tip-good" : "rp-tip-warn")}>
      <div className="flex items-start gap-3">
        <span className="text-lg flex-shrink-0">{isGood ? "✓" : "⚠"}</span>
        <div className="flex flex-col gap-1">
          <p className="font-semibold text-sm">{tip}</p>
          {explanation && <p className="text-xs opacity-80 leading-relaxed">{explanation}</p>}
        </div>
      </div>
    </div>
  );
}

// ---- Empty State ----
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="text-5xl">{icon}</div>
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        <p className="text-sm text-text-muted max-w-sm">{description}</p>
      </div>
      {action}
    </div>
  );
}

// ---- Section Score Card ----
export function SectionCard({
  title,
  score,
  tips,
}: {
  title: string;
  score: number;
  tips: { type: "good" | "improve"; tip: string; explanation?: string }[];
}) {
  const color = scoreColor(score);
  return (
    <div className="rp-card flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h4 className="text-text-primary font-semibold">{title}</h4>
        <span className="text-2xl font-bold" style={{ color }}>{score}</span>
      </div>
      <ProgressBar value={score} />
      <div className="flex flex-col gap-2">
        {tips.map((t, i) => (
          <TipCard key={i} {...t} />
        ))}
      </div>
    </div>
  );
}

