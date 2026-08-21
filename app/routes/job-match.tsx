import { useState, useEffect } from "react";
import { usePuterStore } from "~/lib/puter";
import { Briefcase, Building, ChevronLeft, ChevronRight, FileText, Share2, Star, Sparkles } from "lucide-react";
import { ScoreRing, Skeleton, TipCard } from "~/components/ui";
import { PageTransition } from "~/components/motion/PageTransition";
import { ScrollReveal } from "~/components/motion/ScrollReveal";
import { TiltCard } from "~/components/motion/TiltCard";
import { TextLoop } from "~/components/reactbits/TextLoop";

function SkillNetwork({ matched, missing }: { matched: string[], missing: string[] }) {
  return (
    <div className="flex flex-col gap-6 bg-slate-50/50 p-6 rounded-2xl border border-border/50">
      
      <div>
        <h4 className="text-sm font-bold text-success uppercase tracking-widest mb-3 flex items-center gap-2">
          <div className="size-2 rounded-full bg-success animate-pulse" />
          Matched Skills
        </h4>
        {matched.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {matched.map(s => (
              <span key={s} className="text-sm font-medium text-success bg-success/10 px-3 py-1.5 rounded-lg border border-success/20">
                {s}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic">No matched skills found.</p>
        )}
      </div>

      <div className="w-full h-px bg-border/50" />
      
      <div>
        <h4 className="text-sm font-bold text-warning uppercase tracking-widest mb-3 flex items-center gap-2">
          <div className="size-2 rounded-full bg-warning" />
          Missing Skills
        </h4>
        {missing.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {missing.map(s => (
              <span key={s} className="text-sm font-medium text-warning bg-warning/10 px-3 py-1.5 rounded-lg border border-warning/20">
                {s}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic">No missing skills found.</p>
        )}
      </div>
      
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
      ]);

      if (!aiResponse) throw new Error("AI analysis failed.");

      let text = typeof aiResponse.message.content === "string" 
        ? aiResponse.message.content 
        : aiResponse.message.content[0].text;
      
      // Extract JSON using regex in case AI adds conversational padding
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");
      
      const result: JobMatchResult = JSON.parse(jsonMatch[0]);
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-600 text-xs font-bold uppercase tracking-widest w-fit mx-auto md:mx-0">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" /> Intelligence
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">Job Match Engine</h1>
        <p className="text-slate-600 max-w-2xl text-lg">
          Connect your resume to reality. Map your skills against actual job descriptions to reveal missing keywords and exact match percentages.
        </p>
      </ScrollReveal>

      <div className="grid md:grid-cols-12 gap-8 mt-4">
        {/* Input Section */}
        <div className="md:col-span-5 flex flex-col gap-6">
          <ScrollReveal delay={0.1} direction="up" distance={20}>
            <div className="flex flex-col gap-4 bg-white/50 border border-border/50 p-6 rounded-2xl backdrop-blur-sm">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select Target Resume</label>
              <select 
                value={selectedResumeId} 
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
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
            <div className="flex flex-col gap-4 bg-white/50 border border-border/50 p-6 rounded-2xl backdrop-blur-sm">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Job Description</label>
              <textarea 
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full min-h-[300px] px-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all resize-y"
                placeholder="Paste the full job description here..."
                disabled={processing}
              />
            </div>
          </ScrollReveal>

          <div className="mt-2">
            <button 
              onClick={handleMatch}
              disabled={processing || !selectedResumeId || !jobDescription.trim()}
              className="group relative w-full px-8 py-4 bg-blue-600 text-white rounded-xl text-lg font-semibold shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:bg-blue-700 transition-colors disabled:opacity-50 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center justify-center gap-2 font-bold tracking-wide">
                {processing ? "Analyzing Match..." : "Analyze Match →"}
              </span>
            </button>
            {error && (
              <div className="mt-4 p-4 rounded-lg bg-error/10 text-error border border-error/20 text-sm font-medium">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Output Section */}
        <div className="md:col-span-7 flex flex-col gap-6">
          {processing ? (
            <div className="flex flex-col gap-6 pt-8 md:pt-0 h-full justify-center">
              <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-white/50 backdrop-blur-sm transition-opacity duration-1000">
                <div className="relative size-32">
                  <div className="absolute inset-0 rounded-full border-t-2 border-blue-600 animate-spin" />
                  <div className="absolute inset-2 rounded-full border-r-2 border-blue-700 animate-[spin_2s_linear_infinite]" />
                  <div className="absolute inset-4 rounded-full border-b-2 border-cyan-500 animate-[spin_3s_linear_infinite]" />
                  <Sparkles className="absolute inset-0 m-auto text-blue-600 animate-pulse" size={32} />
                </div>
                
                <TextLoop 
                  className="mt-8 text-xl font-medium text-blue-600 tracking-wider font-mono w-[300px] text-center" 
                  texts={[
                    "Reading resume...",
                    "Extracting skills...",
                    "Analyzing requirements...",
                    "Comparing qualifications...",
                    "Calculating match score..."
                  ]}
                  interval={2500}
                />
              </div>
            </div>
          ) : matchResult ? (
            <div className="flex flex-col gap-8 h-full">
              <ScrollReveal direction="left" distance={40}>
                <TiltCard className="flex flex-col sm:flex-row items-center gap-8 bg-white/50 p-8 rounded-3xl border border-blue-600/20 shadow-[0_0_40px_rgba(37,99,235,0.1)] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent pointer-events-none" />
                  <div className="relative z-10 flex-shrink-0">
                    <ScoreRing score={matchResult.score} size={160} strokeWidth={12} />
                  </div>
                  <div className="relative z-10 flex flex-col gap-2 text-center sm:text-left">
                    <h3 className="text-3xl font-black text-foreground tracking-tight">Match Score</h3>
                    <p className="text-slate-600 leading-relaxed">
                      This represents the precise alignment between your resume contents and the core requirements of the job description.
                    </p>
                  </div>
                </TiltCard>
              </ScrollReveal>

              <ScrollReveal delay={0.1} direction="up" distance={20}>
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="text-blue-600">⚡</span> Skills Comparison
                </h3>
                <SkillNetwork 
                  matched={[...new Set([...(matchResult.matchedSkills || []), ...(matchResult.matchedKeywords || [])])]} 
                  missing={[...new Set([...(matchResult.missingSkills || []), ...(matchResult.missingKeywords || [])])]} 
                />
              </ScrollReveal>

              {matchResult.tips && matchResult.tips.length > 0 && (
                <ScrollReveal delay={0.2} direction="up" distance={20} className="flex flex-col gap-4">
                  <h4 className="font-semibold text-foreground uppercase tracking-widest text-xs">AI Recommendations</h4>
                  {matchResult.tips.map((tip, i) => (
                    <TipCard key={i} {...tip} />
                  ))}
                </ScrollReveal>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-12 border border-dashed border-border/50 rounded-3xl bg-slate-50/50">
              <div className="text-center flex flex-col items-center gap-4 opacity-50">
                <div className="size-24 rounded-full bg-slate-200 flex items-center justify-center mb-2">
                  <span className="text-4xl">🎯</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">Ready to Compare</h3>
                <p className="text-sm text-slate-500 max-w-sm">
                  Select a resume and paste a job description to initiate the analysis process.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
