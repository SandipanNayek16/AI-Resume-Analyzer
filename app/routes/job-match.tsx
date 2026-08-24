import { useState, useEffect } from "react";
import { usePuterStore } from "~/lib/puter";
import { Briefcase, Building, ChevronLeft, ChevronRight, FileText, Share2, Star, Sparkles, CheckCircle2, AlertCircle, Activity, FileCheck2, Cpu, ArrowRight } from "lucide-react";
import { ScoreRing, Skeleton, TipCard } from "~/components/ui";
import { PageTransition } from "~/components/motion/PageTransition";
import { ScrollReveal } from "~/components/motion/ScrollReveal";
import { TiltCard } from "~/components/motion/TiltCard";
import { TextLoop } from "~/components/reactbits/TextLoop";
import { parseAIResponse } from "~/lib/utils";

// Helper to determine score color and state
function getScoreStatus(score: number) {
  if (score >= 90) return { text: "Exceptional Match", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" };
  if (score >= 75) return { text: "Strong Match", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" };
  if (score >= 60) return { text: "Moderate Match", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" };
  if (score >= 40) return { text: "Needs Improvement", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10" };
  return { text: "Low Match", color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10" };
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
      
      const result: JobMatchResult = parseAIResponse(text);
      setMatchResult(result);
    } catch (err) {
      console.error(err);
      setError("We couldn't compare this resume with the job description. Please ensure the inputs are valid and try again.");
    } finally {
      setProcessing(false);
    }
  };

  const selectedResume = resumes.find(r => r.id === selectedResumeId);
  const wordCount = jobDescription.trim() ? jobDescription.trim().split(/\s+/).length : 0;

  return (
    <PageTransition className="flex flex-col max-w-7xl mx-auto py-8 px-4 md:px-8">
      
      {/* Header */}
      <ScrollReveal direction="up" distance={20} className="flex flex-col gap-3 text-center md:text-left mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest w-fit mx-auto md:mx-0">
          <Activity size={14} className="animate-pulse" />
          Intelligence
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">Job Match Engine</h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl text-lg">
          Connect your resume to the role you want. See how your experience, skills, and keywords align with the job description.
        </p>
      </ScrollReveal>

      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Column: Input Workspace */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <ScrollReveal delay={0.1} direction="up" distance={20}>
            <div className="flex flex-col gap-1 mb-2">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <FileCheck2 size={16} /> Your Resume
              </h2>
            </div>
            
            <div className="relative group">
              <select 
                value={selectedResumeId} 
                onChange={(e) => {
                  setSelectedResumeId(e.target.value);
                  setMatchResult(null); // Clear result when input changes
                }}
                className="w-full appearance-none bg-white dark:bg-slate-900 border border-border/80 rounded-2xl px-5 py-4 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all cursor-pointer shadow-sm"
                disabled={processing}
              >
                {resumes.length === 0 && <option value="">No resumes found</option>}
                {resumes.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.jobTitle || 'Untitled'} {r.companyName ? `at ${r.companyName}` : ''} • {new Date(r.createdAt || Date.now()).toLocaleDateString()}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-blue-500 transition-colors">
                <ChevronRight size={18} className="rotate-90" />
              </div>
            </div>
            {resumes.length === 0 && (
              <p className="text-xs text-amber-500 mt-2 font-medium">Analyze a resume first to unlock Job Match.</p>
            )}
          </ScrollReveal>

          {/* AI Connection Visual Link (Subtle) */}
          <div className="flex justify-center -my-2 relative z-10">
            <div className="flex flex-col items-center">
              <div className="w-px h-6 bg-gradient-to-b from-border to-blue-500/50" />
              <div className="bg-white dark:bg-slate-900 border border-blue-500/20 text-blue-600 dark:text-blue-400 p-2 rounded-xl shadow-sm z-10">
                <Cpu size={20} className={processing ? "animate-pulse" : ""} />
              </div>
              <div className="w-px h-6 bg-gradient-to-t from-border to-blue-500/50" />
            </div>
          </div>

          <ScrollReveal delay={0.2} direction="up" distance={20}>
             <div className="flex flex-col gap-1 mb-2 flex-row justify-between items-center">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Briefcase size={16} /> Target Role
              </h2>
              {wordCount > 0 && (
                 <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                   <CheckCircle2 size={12} /> Job description detected ({wordCount} words)
                 </span>
              )}
            </div>

            <textarea 
              value={jobDescription}
              onChange={(e) => {
                setJobDescription(e.target.value);
                setMatchResult(null);
              }}
              className="w-full min-h-[320px] px-5 py-4 bg-white dark:bg-slate-900 border border-border/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all resize-y shadow-sm placeholder:text-slate-400 leading-relaxed"
              placeholder="Paste the complete job description here to see how well you match..."
              disabled={processing}
            />
          </ScrollReveal>

          <ScrollReveal delay={0.3} direction="up" distance={20} className="mt-2">
            <button 
              onClick={handleMatch}
              disabled={processing || !selectedResumeId || !jobDescription.trim()}
              className="group relative w-full px-8 py-4 bg-foreground text-background dark:bg-blue-600 dark:text-white rounded-2xl text-lg font-semibold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:pointer-events-none overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 dark:bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center justify-center gap-2 font-bold tracking-wide">
                {processing ? "Analyzing Match..." : "Analyze Match"} 
                {!processing && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
              </span>
            </button>
            
            {error && (
              <div className="mt-4 p-4 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-sm font-medium flex items-start gap-3">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="font-bold">Match Analysis Failed</span>
                  <span>{error}</span>
                </div>
              </div>
            )}
          </ScrollReveal>
        </div>

        {/* Right Column: AI Workspace Output */}
        <div className="lg:col-span-7 flex flex-col h-full min-h-[600px] relative">
          
          {/* STATE 1: IDLE */}
          {!processing && !matchResult && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-slate-50/50 dark:bg-slate-900/30 border border-dashed border-border/60 rounded-3xl">
               <div className="flex items-center gap-6 md:gap-12 mb-10 opacity-60 scale-90 md:scale-100">
                 <div className="flex flex-col items-center gap-3">
                   <div className="size-16 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-border flex items-center justify-center">
                     <FileText size={24} className="text-slate-500" />
                   </div>
                   <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Resume</span>
                 </div>

                 {/* Connecting flow dots */}
                 <div className="flex gap-2">
                   <div className="size-2 rounded-full bg-blue-500/30" />
                   <div className="size-2 rounded-full bg-blue-500/30" />
                   <div className="size-2 rounded-full bg-blue-500/30" />
                 </div>

                 <div className="flex flex-col items-center gap-3">
                   <div className="size-16 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-border flex items-center justify-center">
                     <Briefcase size={24} className="text-slate-500" />
                   </div>
                   <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Job Role</span>
                 </div>
               </div>

               <div className="text-center max-w-sm">
                 <h3 className="text-lg font-bold text-foreground mb-2">MATCH ENGINE READY</h3>
                 <p className="text-sm text-slate-500 leading-relaxed">
                   Select a resume and paste a target job description. The AI will compare skills, keywords, and experience to calculate your match.
                 </p>
               </div>
            </div>
          )}

          {/* STATE 2: PROCESSING */}
          {processing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md rounded-3xl border border-border/50 z-20 transition-all">
              <div className="relative size-32 mb-8">
                {/* AI Processing Visualization */}
                <div className="absolute inset-0 rounded-full border-t-2 border-blue-600 animate-spin" />
                <div className="absolute inset-2 rounded-full border-r-2 border-indigo-500 animate-[spin_2s_linear_infinite]" />
                <div className="absolute inset-4 rounded-full border-b-2 border-cyan-400 animate-[spin_3s_linear_infinite]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="size-16 bg-blue-600/10 rounded-full animate-ping" />
                </div>
                <Sparkles className="absolute inset-0 m-auto text-blue-600 dark:text-blue-400 animate-pulse" size={32} />
              </div>
              
              <div className="text-center">
                <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4">Match Engine Active</h3>
                <TextLoop 
                  className="text-2xl font-bold text-foreground font-sans w-[400px]" 
                  texts={[
                    "Reading resume...",
                    "Extracting job requirements...",
                    "Comparing skills...",
                    "Checking keywords...",
                    "Evaluating experience...",
                    "Calculating match score..."
                  ]}
                  interval={1800}
                />
              </div>
            </div>
          )}

          {/* STATE 3: RESULTS */}
          {matchResult && !processing && (
            <div className="flex flex-col gap-6 h-full pb-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              
              {/* Score Hero */}
              <TiltCard className="relative overflow-hidden bg-white dark:bg-slate-900 p-8 md:p-10 rounded-3xl border border-border shadow-xl">
                {/* Background glow based on score */}
                <div className={`absolute top-0 right-0 w-64 h-64 -translate-y-1/2 translate-x-1/3 rounded-full blur-[80px] opacity-20 pointer-events-none ${getScoreStatus(matchResult.score).bg.replace('/10', '')}`} />
                
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                  <div className="flex-shrink-0">
                    <ScoreRing score={matchResult.score} size={180} strokeWidth={14} />
                  </div>
                  
                  <div className="flex flex-col items-center md:items-start text-center md:text-left gap-3">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-current/20 ${getScoreStatus(matchResult.score).bg} ${getScoreStatus(matchResult.score).color}`}>
                       <Star size={14} className="fill-current" />
                       {getScoreStatus(matchResult.score).text}
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">Match Score</h2>
                    <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-md">
                      This score represents the precise alignment between your resume and the core requirements of the job description.
                    </p>
                  </div>
                </div>
              </TiltCard>

              {/* Skills Alignment Grid */}
              <div className="grid md:grid-cols-2 gap-6 mt-2">
                
                {/* Matched Skills */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-border shadow-sm flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 size={16} /> Matched Skills
                  </h3>
                  
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      const matched = [...new Set([...(matchResult.matchedSkills || []), ...(matchResult.matchedKeywords || [])])];
                      if (matched.length === 0) return <p className="text-sm text-slate-500 italic">No matched skills found.</p>;
                      return matched.map(s => (
                        <span key={s} className="text-sm font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                          {s}
                        </span>
                      ));
                    })()}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-border shadow-sm flex flex-col gap-4">
                   <h3 className="text-sm font-bold text-red-500 dark:text-red-400 uppercase tracking-widest flex items-center gap-2">
                    <AlertCircle size={16} /> Missing Keywords
                  </h3>
                  
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      const missing = [...new Set([...(matchResult.missingSkills || []), ...(matchResult.missingKeywords || [])])];
                      if (missing.length === 0) return <p className="text-sm text-slate-500 italic">No missing skills found. Great job!</p>;
                      return missing.map(s => (
                        <span key={s} className="text-sm font-medium text-red-600 dark:text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
                          {s}
                        </span>
                      ));
                    })()}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {matchResult.tips && matchResult.tips.length > 0 && (
                <div className="mt-4 flex flex-col gap-4 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-border shadow-sm">
                  <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                    <Sparkles size={16} /> AI Recommendations
                  </h3>
                  <div className="grid gap-4">
                    {matchResult.tips.map((tip, i) => (
                      <TipCard key={i} {...tip} />
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
