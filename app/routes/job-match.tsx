import { useState, useEffect } from "react";
import { usePuterStore } from "~/lib/puter";
import { ScoreRing, Skeleton, TipCard } from "~/components/ui";
import { PageTransition } from "~/components/motion/PageTransition";
import { ScrollReveal } from "~/components/motion/ScrollReveal";
import { TiltCard } from "~/components/motion/TiltCard";

function SkillNetwork({ matched, missing }: { matched: string[], missing: string[] }) {
  return (
    <div className="flex flex-col gap-4 bg-surface-100/50 p-6 rounded-2xl border border-border-default/50">
      <div className="flex justify-between text-xs font-bold text-text-muted uppercase tracking-widest px-2 mb-2">
        <span>Resume</span>
        <span>Job Description</span>
      </div>
      
      {matched.map(s => (
        <div key={s} className="flex items-center justify-between group">
          <span className="text-sm font-medium text-brand-300 bg-brand-500/10 px-3 py-1.5 rounded-md border border-brand-500/20">{s}</span>
          <div className="flex-1 mx-4 h-[1px] bg-gradient-to-r from-brand-500/20 via-brand-500/40 to-brand-500/20 relative">
            <div className="absolute top-1/2 left-0 w-2 h-2 rounded-full bg-brand-400 -translate-y-1/2 shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
            <div className="absolute top-1/2 right-0 w-2 h-2 rounded-full bg-brand-400 -translate-y-1/2 shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
            <div className="absolute inset-0 bg-brand-400/50 blur-sm scale-y-150 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-sm font-medium text-brand-300 bg-brand-500/10 px-3 py-1.5 rounded-md border border-brand-500/20">{s}</span>
        </div>
      ))}
      
      {missing.map(s => (
        <div key={s} className="flex items-center justify-between opacity-70 group hover:opacity-100 transition-opacity">
          <span className="text-sm font-medium text-text-muted border border-border-default border-dashed px-3 py-1.5 rounded-md w-[80px] text-center bg-surface-200/50">?</span>
          <div className="flex-1 mx-4 h-[1px] bg-border-default border-t border-dashed border-border-muted relative">
            <div className="absolute top-1/2 right-0 w-2 h-2 rounded-full bg-warning -translate-y-1/2 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
          </div>
          <span className="text-sm font-medium text-warning bg-warning/10 px-3 py-1.5 rounded-md border border-warning/20">{s}</span>
        </div>
      ))}
    </div>
  );
}

export default function JobMatch() {
  const { kv, ai, fs } = usePuterStore();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [matchResult, setMatchResult] = useState<JobMatchResult | null>(null);

  useEffect(() => {
    const loadResumes = async () => {
      const raw = (await kv.list("resume:*", true)) as KVItem[];
      const parsed = (raw || [])
        .map((item) => {
          try { return JSON.parse(item.value) as Resume; } catch { return null; }
        })
        .filter(Boolean) as Resume[];
      
      parsed.sort((a, b) => ((b.createdAt ?? b.id) > (a.createdAt ?? a.id) ? 1 : -1));
      setResumes(parsed);
      if (parsed.length > 0) setSelectedResumeId(parsed[0].id);
    };
    loadResumes();
  }, [kv]);

  const handleMatch = async () => {
    if (!selectedResumeId || !jobDescription.trim()) return;
    
    setProcessing(true);
    setError("");
    setMatchResult(null);

    const resume = resumes.find(r => r.id === selectedResumeId);
    if (!resume) {
      setError("Resume not found.");
      setProcessing(false);
      return;
    }

    try {
      const prompt = `You are an expert technical recruiter and ATS system. Compare the provided resume against the following job description:
      
Job Description:
${jobDescription}

Provide a structured JSON output exactly matching this format:
{
  "score": 0-100, // percentage match
  "matchedSkills": ["Skill 1", "Skill 2"],
  "missingSkills": ["Skill 3", "Skill 4"],
  "matchedKeywords": ["Keyword 1"],
  "missingKeywords": ["Keyword 2"],
  "tips": [
    { "type": "improve", "tip": "Short tip", "explanation": "Detailed explanation" }
  ]
}

Only return raw JSON.`;

      const aiResponse = await ai.chat([
        {
          role: "user",
          content: [
            { type: "file", puter_path: resume.resumePath },
            { type: "text", text: prompt }
          ]
        }
      ], { model: "gpt-4o-mini" });

      if (!aiResponse) throw new Error("AI analysis failed.");

      let text = typeof aiResponse.message.content === "string" 
        ? aiResponse.message.content 
        : aiResponse.message.content[0].text;
      
      // Cleanup markdown code blocks if present
      text = text.replace(/^```json\n/, "").replace(/\n```$/, "").trim();

      const result: JobMatchResult = JSON.parse(text);
      setMatchResult(result);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze job match. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <PageTransition className="flex flex-col gap-8 max-w-5xl mx-auto py-8 px-4">
      <ScrollReveal direction="up" distance={20} className="flex flex-col gap-3 text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-widest w-fit mx-auto md:mx-0">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" /> Intelligence
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-text-primary tracking-tight">Job Match Engine</h1>
        <p className="text-text-secondary max-w-2xl text-lg">
          Connect your resume to reality. Map your skills against actual job descriptions to reveal missing keywords and exact match percentages.
        </p>
      </ScrollReveal>

      <div className="grid md:grid-cols-12 gap-8 mt-4">
        {/* Input Section */}
        <div className="md:col-span-5 flex flex-col gap-6">
          <ScrollReveal delay={0.1} direction="up" distance={20}>
            <div className="rp-card flex flex-col gap-4 border-border-default/50 bg-surface-50/50 backdrop-blur-sm">
              <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Select Target Resume</label>
              <select 
                value={selectedResumeId} 
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="rp-input bg-surface-100"
                disabled={processing}
              >
                {resumes.length === 0 && <option value="">No resumes found</option>}
                {resumes.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.jobTitle ? `${r.jobTitle} (${r.companyName || 'General'})` : 'Untitled Resume'} - {new Date(r.createdAt || Date.now()).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2} direction="up" distance={20}>
            <div className="rp-card flex flex-col gap-4 border-border-default/50 bg-surface-50/50 backdrop-blur-sm">
              <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Job Description</label>
              <textarea 
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="rp-input min-h-[300px] bg-surface-100 resize-y"
                placeholder="Paste the full job description here..."
                disabled={processing}
              />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.3} direction="up" distance={20}>
            <button 
              onClick={handleMatch}
              disabled={processing || !selectedResumeId || !jobDescription.trim()}
              className="group relative w-full rp-btn rp-lg rp-primary disabled:opacity-50 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {processing ? "Analyzing Match..." : "Initialize Match Sequence →"}
              </span>
            </button>
            {error && (
              <div className="mt-4 p-4 rounded-lg bg-error/10 text-error border border-error/20 text-sm font-medium">
                {error}
              </div>
            )}
          </ScrollReveal>
        </div>

        {/* Output Section */}
        <div className="md:col-span-7 flex flex-col gap-6">
          {processing ? (
            <div className="flex flex-col gap-6 pt-8 md:pt-0 h-full justify-center">
              <div className="flex items-center justify-center py-12">
                <div className="relative size-32">
                  <div className="absolute inset-0 rounded-full border-4 border-surface-200" />
                  <div className="absolute inset-0 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-brand-400 animate-pulse">
                    <span className="text-3xl">⚙</span>
                  </div>
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-text-primary animate-pulse">Computing Match Matrix...</h3>
                <p className="text-text-muted text-sm">Aligning neural embeddings with job requirements</p>
              </div>
            </div>
          ) : matchResult ? (
            <div className="flex flex-col gap-8 h-full">
              <ScrollReveal direction="left" distance={40}>
                <TiltCard className="flex flex-col sm:flex-row items-center gap-8 bg-surface-50/50 p-8 rounded-3xl border border-brand-500/20 shadow-[0_0_40px_rgba(139,92,246,0.1)] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent pointer-events-none" />
                  <div className="relative z-10 flex-shrink-0">
                    <ScoreRing score={matchResult.score} size={160} strokeWidth={12} />
                  </div>
                  <div className="relative z-10 flex flex-col gap-2 text-center sm:text-left">
                    <h3 className="text-3xl font-black text-text-primary tracking-tight">Match Score</h3>
                    <p className="text-text-secondary leading-relaxed">
                      This represents the precise alignment between your resume contents and the core requirements of the job description.
                    </p>
                  </div>
                </TiltCard>
              </ScrollReveal>

              <ScrollReveal delay={0.1} direction="up" distance={20}>
                <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-3">
                  <span className="text-brand-400">⚡</span> Skill Network Constellation
                </h3>
                <SkillNetwork 
                  matched={[...new Set([...matchResult.matchedSkills, ...matchResult.matchedKeywords])]} 
                  missing={[...new Set([...matchResult.missingSkills, ...matchResult.missingKeywords])]} 
                />
              </ScrollReveal>

              {matchResult.tips && matchResult.tips.length > 0 && (
                <ScrollReveal delay={0.2} direction="up" distance={20} className="flex flex-col gap-4">
                  <h4 className="font-semibold text-text-primary uppercase tracking-widest text-xs">AI Recommendations</h4>
                  {matchResult.tips.map((tip, i) => (
                    <TipCard key={i} {...tip} />
                  ))}
                </ScrollReveal>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-12 border border-dashed border-border-default/50 rounded-3xl bg-surface-50/20">
              <div className="text-center flex flex-col items-center gap-4 opacity-50">
                <div className="size-24 rounded-full bg-surface-200 flex items-center justify-center mb-2">
                  <span className="text-4xl">🎯</span>
                </div>
                <h3 className="text-xl font-bold text-text-primary">Awaiting Target</h3>
                <p className="text-sm text-text-muted max-w-sm">
                  Select a resume and paste a job description to initiate the intelligence matching sequence.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
