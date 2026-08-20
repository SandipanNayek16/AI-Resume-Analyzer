import { useState, useEffect, useRef } from "react";
import { usePuterStore } from "~/lib/puter";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { PageTransition } from "~/components/motion/PageTransition";
import { ScrollReveal } from "~/components/motion/ScrollReveal";
import { AIOrb } from "~/components/3d/AIOrb";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Copilot() {
  const { kv, ai } = usePuterStore();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm your Resume Copilot. Select a resume and ask me anything. For example:\n- \"Can you rewrite my third bullet point under Experience?\"\n- \"What skills should I add for a Frontend role?\"\n- \"How can I make my summary sound more impactful?\"" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || !selectedResumeId) return;
    
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsTyping(true);

    const resume = resumes.find(r => r.id === selectedResumeId);
    if (!resume) {
      setMessages(prev => [...prev, { role: "assistant", content: "I couldn't find the selected resume. Please try again." }]);
      setIsTyping(false);
      return;
    }

    try {
      const systemPrompt = `You are ResumeIQ Copilot, an expert technical recruiter and resume writer. 
You are analyzing the provided resume. Be concise, actionable, and encouraging.
If the user asks you to rewrite a bullet point, provide the new bullet point directly. Use metrics where appropriate.`;

      const chatMessages = messages.filter(m => m.role !== "assistant" || m.content !== "Hi! I'm your Resume Copilot. Select a resume and ask me anything. For example:\n- \"Can you rewrite my third bullet point under Experience?\"\n- \"What skills should I add for a Frontend role?\"\n- \"How can I make my summary sound more impactful?\"").map(m => ({
        role: m.role,
        content: m.content
      }));

      const aiResponse = await ai.chat([
        { role: "system", content: systemPrompt },
        { role: "user", content: [{ type: "file", puter_path: resume.resumePath }, { type: "text", text: "Here is my resume." }] },
        ...chatMessages,
        { role: "user", content: userMsg }
      ], { model: "gpt-4o-mini" });

      if (!aiResponse) throw new Error("No response from AI.");

      const text = typeof aiResponse.message.content === "string" 
        ? aiResponse.message.content 
        : aiResponse.message.content[0].text;
      
      setMessages(prev => [...prev, { role: "assistant", content: text }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error while processing your request. Please try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <PageTransition className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto px-4 lg:flex-row gap-8">
      {/* Visual Header / Orb Area */}
      <div className="lg:w-1/3 flex flex-col gap-6 py-6 lg:border-r border-border-default/50 pr-8">
        <ScrollReveal direction="right" distance={20} className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-widest w-fit">
            <Sparkles size={14} /> Intelligence
          </div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">AI Copilot</h1>
          <p className="text-text-secondary">
            Chat with an expert AI recruiter to get personalized advice, rewrite specific bullet points, and tailor your application.
          </p>
        </ScrollReveal>
        
        <div className="flex-1 w-full flex items-center justify-center opacity-80 min-h-[200px]">
          <Canvas camera={{ position: [0, 0, 5] }}>
            <ambientLight intensity={0.5} />
            <AIOrb isProcessing={isTyping} scale={2} />
          </Canvas>
        </div>
        
        <ScrollReveal delay={0.2} direction="up" distance={20} className="rp-card bg-surface-50/50 backdrop-blur-md">
          <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3 block">Active Context</label>
          <select 
            value={selectedResumeId} 
            onChange={(e) => setSelectedResumeId(e.target.value)}
            className="rp-input w-full bg-surface-100/50"
            disabled={isTyping}
          >
            {resumes.length === 0 && <option value="">No resumes found</option>}
            {resumes.map(r => (
              <option key={r.id} value={r.id}>
                {r.jobTitle ? `${r.jobTitle} (${r.companyName || 'General'})` : 'Untitled Resume'}
              </option>
            ))}
          </select>
        </ScrollReveal>
      </div>

      {/* Workspace Area */}
      <div className="lg:w-2/3 flex flex-col bg-surface-50/50 backdrop-blur-xl border border-border-default/50 rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-500/5 to-transparent pointer-events-none" />
        
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 relative z-10 scrollbar-thin">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
                className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
              >
                <div className={`size-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg ${msg.role === 'user' ? 'bg-surface-300' : 'bg-brand-500/20 text-brand-400 border border-brand-500/30'}`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`px-5 py-4 rounded-2xl shadow-md ${msg.role === 'user' ? 'bg-surface-300 text-text-primary rounded-tr-sm' : 'bg-surface-100/80 border border-border-default/50 text-text-primary rounded-tl-sm backdrop-blur-md'}`}>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                </div>
              </motion.div>
            ))}
            
            {isTyping && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 max-w-[85%] self-start"
              >
                <div className="size-8 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30 shadow-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot size={16} />
                </div>
                <div className="px-5 py-4 rounded-2xl bg-surface-100/80 backdrop-blur-md border border-border-default/50 rounded-tl-sm flex items-center gap-2 shadow-md">
                  <div className="size-2 bg-brand-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="size-2 bg-brand-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="size-2 bg-brand-400 rounded-full animate-bounce" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border-default/50 bg-surface-100/50 backdrop-blur-md relative z-10">
          <div className="relative flex items-center group">
            <div className="absolute inset-0 bg-brand-500/20 rounded-full blur-md opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={selectedResumeId ? "Ask the copilot something..." : "Please select a resume first..."}
              className="rp-input pr-12 resize-none min-h-[52px] py-3.5 rounded-full bg-surface-200/50 backdrop-blur-md border-border-default hover:border-brand-500/50 focus:border-brand-500 shadow-inner"
              rows={1}
              disabled={!selectedResumeId || isTyping}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || !selectedResumeId || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-brand-500 hover:bg-brand-400 text-white rounded-full shadow-[0_0_15px_rgba(139,92,246,0.4)] hover:shadow-[0_0_20px_rgba(139,92,246,0.6)] transition-all disabled:opacity-50 disabled:shadow-none"
            >
              <Send size={16} />
            </button>
          </div>
          <p className="text-center text-[10px] text-text-muted mt-3 font-medium uppercase tracking-wider">
            Press Enter to send, Shift+Enter for new line. AI can make mistakes.
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
