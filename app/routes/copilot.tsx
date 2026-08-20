import { useState, useEffect, useRef } from "react";
import { usePuterStore } from "~/lib/puter";
import { Send, Bot, User, Sparkles } from "lucide-react";

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

      // Format messages for puter chat
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
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto rp-fade-in">
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="text-brand-400" size={24} />
          <h1 className="text-3xl font-bold text-text-primary">AI Copilot</h1>
        </div>
        <p className="text-text-secondary">
          Chat with an expert AI recruiter to get personalized advice and rewrite specific bullet points.
        </p>
      </div>

      <div className="flex flex-col bg-surface-50 border border-border-default rounded-xl overflow-hidden shadow-sm flex-1">
        {/* Header */}
        <div className="p-4 border-b border-border-default bg-surface-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <span className="text-sm font-semibold text-text-primary">Chat Session</span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-text-muted whitespace-nowrap">Context:</span>
            <select 
              value={selectedResumeId} 
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="rp-input !py-1 !text-xs w-full sm:w-64"
            >
              {resumes.length === 0 && <option value="">No resumes found</option>}
              {resumes.map(r => (
                <option key={r.id} value={r.id}>
                  {r.jobTitle ? `${r.jobTitle} (${r.companyName || 'General'})` : 'Untitled Resume'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
              <div className={`size-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.role === 'user' ? 'bg-surface-300' : 'bg-brand-500/20 text-brand-400'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-surface-200 text-text-primary rounded-tr-sm' : 'bg-surface-100 border border-border-default text-text-primary rounded-tl-sm'}`}>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3 max-w-[85%] self-start">
              <div className="size-8 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot size={16} />
              </div>
              <div className="p-4 rounded-2xl bg-surface-100 border border-border-default rounded-tl-sm flex items-center gap-2">
                <div className="size-2 bg-text-muted rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="size-2 bg-text-muted rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="size-2 bg-text-muted rounded-full animate-bounce" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border-default bg-surface-100">
          <div className="relative flex items-center">
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
              className="rp-input pr-12 resize-none min-h-[50px] py-3 rounded-full"
              rows={1}
              disabled={!selectedResumeId || isTyping}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || !selectedResumeId || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-500 hover:bg-brand-400 text-white rounded-full transition-colors disabled:opacity-50 disabled:hover:bg-brand-500"
            >
              <Send size={16} />
            </button>
          </div>
          <p className="text-center text-xs text-text-muted mt-2">
            Press Enter to send, Shift+Enter for new line. AI can make mistakes.
          </p>
        </div>
      </div>
    </div>
  );
}
