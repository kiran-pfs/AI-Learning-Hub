import { GoogleGenAI } from "@google/genai";
import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  BookOpen, 
  Code, 
  Send, 
  User, 
  Bot, 
  Info, 
  Github,
  ChevronRight,
  Terminal,
  Cpu,
  Sun,
  Moon,
  Menu,
  X,
  ExternalLink,
  Copy,
  Check,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utilities ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// --- Components ---

const CodeBlock = ({ language, value, theme }: { language: string, value: string, theme: 'dark' | 'light' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4 rounded-xl overflow-hidden border border-brand-border">
      <div className="flex items-center justify-between px-4 py-2 bg-brand-gray/50 border-b border-brand-border">
        <span className="text-xs font-mono text-brand-muted uppercase">{language || 'code'}</span>
        <button 
          onClick={handleCopy}
          className="p-1.5 hover:bg-brand-muted/10 rounded-md transition-colors text-brand-muted hover:text-brand-blue"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={theme === 'dark' ? vscDarkPlus : vs}
        customStyle={{
          margin: 0,
          padding: '1.25rem',
          fontSize: '0.875rem',
          background: 'transparent',
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm the AI Learning Hub tutor, powered by Gemini 3 Flash. How can I assist your development journey today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- Theme Management ---
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // --- Auto Scroll ---
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // --- AI Logic (Gemini) ---
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [{ text: `You are a professional developer and academic tutor. Provide clear, concise, and technically accurate explanations. Use markdown for code blocks. Previous conversation:\n${messages.map(m => `${m.role}: ${m.content}`).join('\n')}\n\nUser: ${input}` }]
          }
        ],
        config: {
          systemInstruction: "You are a professional developer and academic tutor. Provide clear, concise, and technically accurate explanations. Use markdown for code blocks.",
        }
      });

      const aiContent = response.text || "I apologize, but I encountered an unexpected response format from the AI engine.";

      const assistantMessage: Message = {
        role: 'assistant',
        content: aiContent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "System error: Failed to connect to the AI engine. Please check your connection.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="fixed inset-y-0 left-0 z-40 w-72 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] lg:relative lg:translate-x-0"
          >
            <div className="flex flex-col h-full p-6">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-2 text-brand-blue">
                  <Zap size={24} fill="currentColor" />
                  <span className="text-lg font-bold tracking-tight">Resources</span>
                </div>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 hover:bg-brand-muted/10 rounded-lg lg:hidden"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 space-y-8">
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-4">Open Source Resources</h3>
                  <div className="space-y-2">
                    {[
                      { icon: <Github size={16} />, label: "GitHub Repository", href: "https://github.com" },
                      { icon: <ExternalLink size={16} />, label: "Netlify Docs", href: "https://docs.netlify.com" },
                      { icon: <Cpu size={16} />, label: "Hugging Face", href: "https://huggingface.co" },
                    ].map((link) => (
                      <a 
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-brand-muted/10 transition-all group"
                      >
                        <span className="text-brand-muted group-hover:text-brand-blue transition-colors">{link.icon}</span>
                        <span className="text-sm font-medium">{link.label}</span>
                      </a>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-4">Current Model</h3>
                  <div className="p-4 rounded-xl bg-brand-blue/5 border border-brand-blue/10">
                    <p className="text-sm font-semibold text-brand-blue">Gemini 3 Flash</p>
                    <p className="text-xs text-brand-muted mt-1">Next-generation multimodal AI model.</p>
                  </div>
                </section>
              </div>

              <div className="pt-6 border-t border-[var(--border-color)]">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-muted/5">
                  <div className="w-8 h-8 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue">
                    <User size={16} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-bold truncate">Developer Mode</p>
                    <p className="text-[10px] text-brand-muted">v2.5.0-stable</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className="glass-header px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-brand-muted/10 rounded-lg"
              >
                <Menu size={20} />
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center text-white">
                <Terminal size={18} />
              </div>
              <h1 className="text-lg font-bold tracking-tight">AI Learning Hub</h1>
            </div>
          </div>

          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2.5 bg-brand-muted/10 hover:bg-brand-muted/20 rounded-xl transition-all text-brand-blue"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        {/* Chat Window */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8"
        >
          <div className="max-w-4xl mx-auto space-y-8">
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className={cn(
                    "flex gap-4",
                    msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                    msg.role === 'user' ? "bg-brand-blue text-white" : "bg-[var(--bg-secondary)] border border-[var(--border-color)] text-brand-blue"
                  )}>
                    {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                  </div>
                  
                  <div className={cn(
                    "flex flex-col gap-2 max-w-[85%] md:max-w-[75%]",
                    msg.role === 'user' ? "items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "px-6 py-4 rounded-2xl shadow-sm",
                      msg.role === 'user' 
                        ? "bg-brand-blue text-white rounded-tr-none" 
                        : "bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-tl-none"
                    )}>
                      <ReactMarkdown
                        components={{
                          code({ node, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '');
                            const inline = !className;
                            return !inline ? (
                              <CodeBlock
                                language={match ? match[1] : ''}
                                value={String(children).replace(/\n$/, '')}
                                theme={isDarkMode ? 'dark' : 'light'}
                              />
                            ) : (
                              <code className="bg-brand-muted/20 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                                {children}
                              </code>
                            );
                          }
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                    <span className="text-[10px] text-brand-muted font-medium uppercase tracking-widest px-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-brand-blue flex items-center justify-center">
                  <Bot size={20} />
                </div>
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] px-6 py-4 rounded-2xl rounded-tl-none flex items-center gap-3">
                  <span className="text-sm font-medium text-brand-muted animate-pulse">Typing...</span>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-bounce" />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-[var(--border-color)] bg-[var(--bg-primary)]">
          <form 
            onSubmit={handleSendMessage}
            className="max-w-4xl mx-auto relative"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a technical question..."
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl px-6 py-5 pr-20 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-3 top-3 bottom-3 px-5 bg-brand-blue text-white rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-brand-blue/20 transition-all"
            >
              <Send size={18} />
            </button>
          </form>
        </div>

        {/* Footer */}
        <footer className="px-6 py-8 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/50">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-muted">System Architecture</p>
              <p className="text-xs text-brand-muted leading-relaxed max-w-md">
                AI Integration: Powered by Gemini 3 Flash, configured with a specialized system instruction to act as a formal yet encouraging academic tutor.
              </p>
            </div>
            <div className="flex flex-col md:items-end gap-4">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="text-brand-muted">Infrastructure</span>
                <a 
                  href="https://www.netlify.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-brand-blue hover:underline flex items-center gap-1"
                >
                  This site is powered by Netlify <ExternalLink size={12} />
                </a>
              </div>
              <p className="text-[10px] text-brand-muted font-mono">© 2026 AI LEARNING HUB // STABLE_BUILD_V2.5</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
