import { useState, useEffect } from "react";
import { usePuterStore } from "~/lib/puter";
import { ScoreRing, Skeleton, TipCard } from "~/components/ui";

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
      ], { model: "claude-3-5-haiku" });

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
    <div className="flex flex-col gap-8 max-w-4xl mx-auto rp-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-text-primary">Job Match Analysis</h1>
        <p className="text-text-secondary">
          Compare any of your uploaded resumes against a specific job description to find missing keywords and optimize your application.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rp-card flex flex-col gap-4">
          <label className="text-sm font-semibold text-text-primary">Select Resume</label>
          <select 
            value={selectedResumeId} 
            onChange={(e) => setSelectedResumeId(e.target.value)}
            className="rp-input"
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

        <div className="rp-card flex flex-col gap-4 md:col-span-2">
          <label className="text-sm font-semibold text-text-primary">Job Description</label>
          <textarea 
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="rp-input min-h-[200px]"
            placeholder="Paste the full job description here..."
            disabled={processing}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleMatch}
          disabled={processing || !selectedResumeId || !jobDescription.trim()}
          className="rp-btn rp-lg rp-primary disabled:opacity-50 min-w-[200px]"
        >
          {processing ? "Analyzing Match..." : "Analyze Job Match →"}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-error/10 text-error border border-error/20 text-sm font-medium">
          {error}
        </div>
      )}

      {processing && (
        <div className="flex flex-col gap-6 pt-8 border-t border-border-default mt-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid sm:grid-cols-2 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      )}

      {matchResult && !processing && (
        <div className="flex flex-col gap-6 pt-8 border-t border-border-default mt-4 rp-fade-up">
          <div className="rp-card flex flex-col sm:flex-row items-center gap-6">
            <ScoreRing score={matchResult.score} size={100} strokeWidth={10} />
            <div className="flex flex-col gap-1 text-center sm:text-left">
              <h3 className="text-xl font-bold text-text-primary">Match Score</h3>
              <p className="text-text-secondary text-sm">
                How well your resume aligns with this job description.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="rp-card flex flex-col gap-3">
              <h4 className="font-semibold flex items-center gap-2 text-text-primary">
                <span className="text-success">✓</span> Matched Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {matchResult.matchedSkills.length === 0 && <span className="text-sm text-text-muted">None found.</span>}
                {matchResult.matchedSkills.map(s => <span key={s} className="rp-badge-good">{s}</span>)}
              </div>
            </div>
            
            <div className="rp-card flex flex-col gap-3">
              <h4 className="font-semibold flex items-center gap-2 text-text-primary">
                <span className="text-error">✕</span> Missing Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {matchResult.missingSkills.length === 0 && <span className="text-sm text-text-muted">None found.</span>}
                {matchResult.missingSkills.map(s => <span key={s} className="rp-badge-bad">{s}</span>)}
              </div>
            </div>

            <div className="rp-card flex flex-col gap-3">
              <h4 className="font-semibold flex items-center gap-2 text-text-primary">
                <span className="text-success">✓</span> Matched Keywords
              </h4>
              <div className="flex flex-wrap gap-2">
                {matchResult.matchedKeywords.length === 0 && <span className="text-sm text-text-muted">None found.</span>}
                {matchResult.matchedKeywords.map(k => <span key={k} className="rp-badge-good">{k}</span>)}
              </div>
            </div>

            <div className="rp-card flex flex-col gap-3">
              <h4 className="font-semibold flex items-center gap-2 text-text-primary">
                <span className="text-error">✕</span> Missing Keywords
              </h4>
              <div className="flex flex-wrap gap-2">
                {matchResult.missingKeywords.length === 0 && <span className="text-sm text-text-muted">None found.</span>}
                {matchResult.missingKeywords.map(k => <span key={k} className="rp-badge-bad">{k}</span>)}
              </div>
            </div>
          </div>

          {matchResult.tips && matchResult.tips.length > 0 && (
            <div className="flex flex-col gap-3">
              <h4 className="font-semibold text-text-primary">Recommendations</h4>
              {matchResult.tips.map((tip, i) => (
                <TipCard key={i} {...tip} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
