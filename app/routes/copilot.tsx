import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { usePuterStore } from "~/lib/puter";
import { Send, Bot, User, Sparkles, Copy, CheckCircle2, ChevronDown, Activity, FileText, Zap, RefreshCcw } from "lucide-react";
import { PageTransition } from "~/components/motion/PageTransition";
import { ScrollReveal } from "~/components/motion/ScrollReveal";
import { BorderGlow } from "~/components/reactbits/BorderGlow";
import { TiltCard } from "~/components/motion/TiltCard";
import { motion, AnimatePresence } from "framer-motion";
import { TextLoop } from "~/components/reactbits/TextLoop";
const Canvas = lazy(() => import("@react-three/fiber").then(m => ({ default: m.Canvas })));
const AIOrb = lazy(() => import("~/components/3d/AIOrb").then(m => ({ default: m.AIOrb })));
import { WebGLErrorBoundary } from "~/components/WebGLErrorBoundary";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
};

const QUICK_ACTIONS = [
  { label: "Improve Summary", prompt: "Can you rewrite my professional summary to make it more impactful and metrics-driven?" },
  { label: "Improve Bullet", prompt: "I need to improve a specific bullet point under my experience. Can you help me rewrite it to highlight achievements?" },
  { label: "Find Keywords", prompt: "Based on my current resume, what key industry keywords or technical skills am I missing?" },
  { label: "Explain Score", prompt: "Can you explain my current ATS score and give me three actionable ways to improve it?" },
  { label: "Tailor for Job", prompt: "I want to tailor my resume for a specific role. Here is the job description:\n\n[PASTE JOB DESCRIPTION HERE]" }
];

// Helper to render basic markdown-like bolding and newlines safely
const renderMessageContent = (content: string) => {
  const paragraphs = content.split('\n\n');
  return paragraphs.map((p, i) => (
    <p key={i} className="mb-3 last:mb-0 text-sm md:text-base leading-relaxed">
      {p.split('\n').map((line, j) => (
        <span key={j}>
          {line.split(/(\*\*.*?\*\*)/).map((part, k) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={k} className="font-bold text-slate-800 dark:text-slate-200">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
          {j < p.split('\n').length - 1 && <br />}
        </span>
      ))}
    </p>
  ));
};

export default function Copilot() {
  const { kv, ai } = usePuterStore();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Handle context change
  useEffect(() => {
    if (selectedResumeId) {
      setMessages([]);
      setInput("");
    }
  }, [selectedResumeId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleActionClick = (prompt: string) => {
    if (prompt.includes("[PASTE JOB DESCRIPTION HERE]")) {
      setInput(prompt);
      // Focus would be nice here in a real app, omitted for simplicity
    } else {
      setInput(prompt);
      // Let React state update before sending
      setTimeout(() => triggerSend(prompt), 50);
    }
  };

  const triggerSend = async (forcedInput?: string) => {
    const userMsg = (forcedInput || input).trim();
    if (!userMsg || !selectedResumeId) return;
    
    setInput("");
    const messageId = Date.now().toString();
    setMessages(prev => [...prev, { id: messageId, role: "user", content: userMsg }]);
    setIsTyping(true);

    const resume = resumes.find(r => r.id === selectedResumeId);
    if (!resume) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "assistant", content: "I couldn't find the selected resume. Please try again.", isError: true }]);
      setIsTyping(false);
      return;
    }

    try {
      const systemPrompt = `You are ResumeIQ Copilot, an expert technical recruiter and resume writer. 
You are analyzing the user's active resume.
- Be concise, actionable, and highly professional.
- Format responses clearly. Use bolding (**text**) for emphasis.
- If rewriting, provide a clear "BEFORE" and "AFTER" block.
- NEVER invent skills, metrics, or experiences that are not in the provided resume context.`;

      const chatMessages = messages.filter(m => m.role !== "assistant" || !m.isError).map(m => ({
        role: m.role,
        content: m.content
      }));

      const payloadMessages: { role: "system" | "user" | "assistant"; content: any }[] = [
        { role: "system", content: systemPrompt }
      ];

      if (chatMessages.length === 0) {
        payloadMessages.push({
          role: "user",
          content: [
            { type: "file", puter_path: resume.resumePath },
            { type: "text", text: `Here is my active resume.\n\nUser Request: ${userMsg}` }
          ]
        });
      } else {
        payloadMessages.push(...chatMessages);
        payloadMessages.push({ role: "user", content: userMsg });
      }

      const aiResponse = await ai.chat(payloadMessages);

      if (!aiResponse) throw new Error("No response from AI.");

      const text = typeof aiResponse.message.content === "string" 
        ? aiResponse.message.content 
        : aiResponse.message.content[0].text;
      
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "assistant", content: text }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "assistant", content: "Something went wrong while generating this response. Please try again.", isError: true }]);
    } finally {
      setIsTyping(false);
    }
  };

  const selectedResume = resumes.find(r => r.id === selectedResumeId);

  return (
    <PageTransition className="flex flex-col h-[calc(100vh-6rem)] max-w-7xl mx-auto px-4 lg:px-8 py-4 lg:flex-row gap-6 lg:gap-10">
      
      {/* LEFT: AI Workspace Context */}
      <div className="lg:w-[35%] flex flex-col gap-6 lg:pb-8 flex-shrink-0">
        
        {/* Header & Status */}
        <ScrollReveal direction="right" distance={20} className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest w-fit">
            <Sparkles size={14} /> AI Resume Copilot
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Your resume,<br/>with an AI expert.</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Ask questions, rewrite bullets, find missing keywords, and tailor your resume to the role.
          </p>
        </ScrollReveal>

        {/* AI Orb Status Area */}
        <div className="bg-white/50 dark:bg-slate-900/50 border border-border/80 rounded-3xl p-6 relative overflow-hidden shadow-sm flex items-center gap-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[40px] pointer-events-none rounded-full" />
          
          <div className="size-20 shrink-0 relative">
            <WebGLErrorBoundary fallback={<div className="size-full rounded-full bg-blue-500/20 animate-pulse" />}>
               <Suspense fallback={<div className="size-full flex items-center justify-center text-blue-600/50"><div className="size-4 rounded-full border-2 border-current border-t-blue-600 animate-spin" /></div>}>
                 <Canvas camera={{ position: [0, 0, 3] }}>
                   <ambientLight intensity={0.5} />
                   <AIOrb scale={0.8} color={isTyping ? "#a855f7" : "#3b82f6"} />
                 </Canvas>
               </Suspense>
            </WebGLErrorBoundary>
          </div>
          
          <div className="flex flex-col gap-1 z-10">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <span className={`size-1.5 rounded-full ${isTyping ? 'bg-purple-500 animate-pulse' : 'bg-blue-500'}`} />
              AI Status
            </span>
            <span className={`font-semibold ${isTyping ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'}`}>
              {isTyping ? "Generating response..." : "Resume intelligence active"}
            </span>
          </div>
        </div>
        
        {/* Active Context Card */}
        <ScrollReveal delay={0.1} direction="up" distance={20} className="flex flex-col gap-3 z-20">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-1">
            <FileText size={14} /> Active Resume
          </label>
          
          <TiltCard className="bg-white dark:bg-slate-900 border border-border rounded-2xl p-5 shadow-sm group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-col">
                <span className="font-bold text-foreground text-lg">{selectedResume?.jobTitle || 'Untitled Resume'}</span>
                <span className="text-slate-500 text-sm">{selectedResume?.companyName || 'General'}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ATS Score</span>
                <span className="font-black text-xl text-blue-600">{selectedResume?.feedback?.overallScore ?? "—"}</span>
              </div>
            </div>
            
            <div className="relative">
              <select 
                value={selectedResumeId} 
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-border/80 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/30 cursor-pointer text-slate-700 dark:text-slate-300"
                disabled={isTyping}
              >
                {resumes.length === 0 && <option value="">No resumes found</option>}
                {resumes.map(r => (
                  <option key={r.id} value={r.id}>
                    Change to: {r.jobTitle || 'Untitled'} ({new Date(r.createdAt || Date.now()).toLocaleDateString()})
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown size={14} />
              </div>
            </div>
          </TiltCard>
        </ScrollReveal>

        {/* Quick Actions */}
        <ScrollReveal delay={0.2} direction="up" distance={20} className="flex flex-col gap-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-1">
            <Zap size={14} /> Quick Actions
          </label>
          <div className="flex flex-wrap gap-2">
            {QUICK_ACTIONS.map((action, i) => (
              <button
                key={i}
                onClick={() => handleActionClick(action.prompt)}
                disabled={isTyping || !selectedResumeId}
                className="px-3 py-2 bg-white dark:bg-slate-900 border border-border rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:pointer-events-none shadow-sm"
              >
                {action.label}
              </button>
            ))}
          </div>
        </ScrollReveal>

      </div>

      {/* RIGHT: Conversation Workspace */}
      <div className="lg:w-[65%] flex flex-col bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border border-border rounded-[2rem] overflow-hidden shadow-2xl relative">
        
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-8 relative z-10 scrollbar-thin">
          
          {messages.length === 0 ? (
            <div className="m-auto flex flex-col items-center justify-center text-center max-w-md opacity-80 pb-10">
               <div className="size-16 rounded-2xl bg-blue-500/10 text-blue-600 border border-blue-500/20 flex items-center justify-center mb-6">
                 <Bot size={32} />
               </div>
               <h3 className="text-xl font-bold text-foreground mb-2">Your AI Copilot is Ready</h3>
               <p className="text-slate-500 text-sm leading-relaxed mb-8">
                 Your active resume is loaded into context. Use the quick actions on the left or type a request below to get started.
               </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
                  className={`flex gap-3 md:gap-4 max-w-[90%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
                >
                  {/* Avatar */}
                  <div className={`size-8 md:size-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm ${msg.role === 'user' ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' : 'bg-blue-600/10 text-blue-600 border border-blue-600/20'}`}>
                    {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                  </div>
                  
                  {/* Message Bubble */}
                  <div className={`group flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-5 py-4 rounded-3xl shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tr-sm' 
                        : msg.isError 
                          ? 'bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 rounded-tl-sm'
                          : 'bg-white dark:bg-slate-900 border border-border/80 text-foreground rounded-tl-sm'
                    }`}>
                      {renderMessageContent(msg.content)}
                    </div>
                    
                    {/* Message Actions */}
                    {msg.role === 'assistant' && !msg.isError && (
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                        <button 
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full shadow-sm border border-border"
                        >
                          {copiedId === msg.id ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Copy size={12} />}
                          {copiedId === msg.id ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {/* Thinking State */}
              {isTyping && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 md:gap-4 max-w-[85%] self-start"
                >
                  <div className="size-8 md:size-10 rounded-full bg-blue-600/10 text-blue-600 border border-blue-600/20 shadow-sm flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot size={18} />
                  </div>
                  <div className="px-5 py-4 rounded-3xl bg-white dark:bg-slate-900 border border-border/80 rounded-tl-sm flex flex-col gap-3 shadow-sm min-w-[200px]">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">AI Thinking</span>
                    <TextLoop 
                      className="text-sm font-medium text-slate-500"
                      texts={[
                        "Understanding your request...",
                        "Reviewing active resume context...",
                        "Generating recommendations...",
                        "Preparing response..."
                      ]}
                      interval={2000}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Input Area */}
        <div className="shrink-0 p-4 md:p-6 border-t border-border/60 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md">
          <BorderGlow glowColor="#2563eb" className="max-w-full rounded-2xl">
            <div className="flex flex-col gap-2 p-1.5">
              <div className="flex items-end gap-3">
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      triggerSend();
                    }
                  }}
                  placeholder={selectedResumeId ? "Ask your copilot to improve a bullet, find keywords, or tailor your resume..." : "Please select a resume first..."}
                  className="flex-1 bg-transparent border-0 text-foreground placeholder:text-slate-400 focus:ring-0 px-3 py-3 focus:outline-none resize-none min-h-[56px] max-h-[200px] text-sm md:text-base leading-relaxed scrollbar-thin"
                  rows={input.split('\n').length > 1 ? Math.min(input.split('\n').length, 8) : 1}
                  disabled={isTyping || !selectedResumeId}
                />
                <button 
                  onClick={() => triggerSend()}
                  disabled={!input.trim() || isTyping || !selectedResumeId}
                  className="shrink-0 mb-1 mr-1 size-10 md:size-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:scale-95 flex items-center justify-center shadow-md hover:shadow-lg"
                >
                  <Send size={18} className={`${isTyping ? "animate-pulse" : ""} -ml-0.5`} />
                </button>
              </div>
            </div>
          </BorderGlow>
          <div className="flex justify-between items-center mt-3 px-2">
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider flex items-center gap-1.5">
               {selectedResumeId ? (
                 <><CheckCircle2 size={12} className="text-emerald-500" /> Context attached: {selectedResume?.jobTitle}</>
               ) : (
                 'No context attached'
               )}
            </p>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider hidden md:block">
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
