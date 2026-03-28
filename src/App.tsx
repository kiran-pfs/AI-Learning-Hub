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
      content: "Hello! I'm the AI Learning Hub tutor. I'm here to help you master programming and AI concepts. How can I assist your journey today?",
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

  // --- AI Logic (Hugging Face - Qwen) ---
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
    const response = await fetch(
      "https://api-inference.huggingface.co/models/Qwen/Qwen2.5-72B-Instruct",
      {
        headers: { 
          Authorization: `Bearer ${import.meta.env.VITE_HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json" 
        },
        method: "POST",
        body: JSON.stringify({ 
          inputs: `<|im_start|>system\nYou are a professional developer and academic tutor. Provide clear, concise, and technically accurate explanations. Use markdown for code blocks.<|im_end|>\n<|im_start|>user\n${input}<|im_end|>\n<|im_start|>assistant`,
          parameters: { max_new_tokens: 1024, return_full_text: false }
        }),
      }
    );

    const result = await response.json();
    
    let aiContent = "";
    if (Array.isArray(result) && result[0].generated_text) {
      aiContent = result[0].generated_text;
    } else if (result.error) {
      aiContent = "System error: " + result.error;
    } else {
      aiContent = "I apologize, but I encountered an unexpected response format.";
    }

    const assistantMessage: Message = {
      role: 'assistant',
      content: aiContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, assistantMessage]);
  } catch (error) {
    console.error("AI Error:", error);
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: "System error: Failed to connect to the AI engine. Please check your API key and connection.",
      timestamp: new Date()
    }]);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Sidebar - Same UI but updated Model name */}
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
                      { icon: <Github size={16} />, label: "GitHub Repository", href: "https://github.com/kiran-pfs/AI-Learning-Hub" },
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
                    <p className="text-sm font-semibold text-brand-blue">Qwen 2.5 (72B)</p>
                    <p className="text-xs text-brand-muted mt-1">High-performance open-source LLM.</p>
                  </div>
                </section>
              </div>

              <div className="pt-6 border-t border-[var(--border-color)]">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-muted/5">
                  <div className="w-8 h-8 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue">
                    <User size={16} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-bold truncate">Independent Developer</p>
                    <p className="text-[10px] text-brand-muted">v2.5.0-stable</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="px-6 py-4 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-primary)]/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-brand-muted/10 rounded-lg">
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
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 bg-brand-muted/10 hover:bg-brand-muted/20 rounded-xl transition-all text-brand-blue">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {messages.map((msg, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn("flex gap-4", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm", msg.role === 'user' ? "bg-brand-blue text-white" : "bg-[var(--bg-secondary)] border border-[var(--border-color)] text-brand-blue")}>
                  {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className={cn("flex flex-col gap-2 max-w-[85%] md:max-w-[75%]", msg.role === 'user' ? "items-end" : "items-start")}>
                  <div className={cn("px-6 py-4 rounded-2xl", msg.role === 'user' ? "bg-brand-blue text-white rounded-tr-none" : "bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-tl-none")}>
                    <ReactMarkdown components={{
                      code({ node, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        const inline = !className;
                        return !inline ? (
                          <CodeBlock language={match ? match[1] : ''} value={String(children).replace(/\n$/, '')} theme={isDarkMode ? 'dark' : 'light'} />
                        ) : (
                          <code className="bg-brand-muted/20 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>{children}</code>
                        );
                      }
                    }}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                  <span className="text-[10px] text-brand-muted font-medium uppercase tracking-widest px-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-brand-blue"><Bot size={20} /></div>
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] px-6 py-4 rounded-2xl rounded-tl-none flex items-center gap-3">
                  <span className="text-sm font-medium text-brand-muted animate-pulse">Thinking...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="p-6 border-t border-[var(--border-color)]">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about AI or Programming..."
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl px-6 py-5 pr-20 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
            />
            <button type="submit" disabled={!input.trim() || isLoading} className="absolute right-3 top-3 bottom-3 px-5 bg-brand-blue text-white rounded-xl disabled:opacity-50">
              <Send size={18} />
            </button>
          </form>
        </div>

        {/* Footer for Credits */}
        <footer className="px-6 py-6 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/50">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] text-brand-muted leading-relaxed">
              Open Source AI Tutoring Platform | Optimized for Educational Excellence.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="text-brand-muted">Infrastructure</span>
              <a href="https://www.netlify.com" target="_blank" rel="noopener noreferrer" className="text-brand-blue flex items-center gap-1">
                Powered by Netlify <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
