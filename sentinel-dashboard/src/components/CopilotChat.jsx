import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Send, Bot, User, CheckCircle2 } from 'lucide-react';

export default function CopilotChat({ responses, onSendMessage }) {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (responses && responses.length > 0) {
        const lastResp = responses[responses.length - 1];
        setChat(prev => [...prev, { role: 'ai', text: lastResp.response }]);
        setIsTyping(false);
    }
  }, [responses]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setChat(prev => [...prev, { role: 'user', text: input }]);
    onSendMessage({ type: 'COPILOT_QUERY', query: input });
    setInput('');
    setIsTyping(true);
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      <div className="flex items-center justify-between p-2 border-b border-white/10 bg-black/40 shrink-0">
          <div className="text-[10px] font-display font-bold tracking-[0.2em] text-white uppercase flex items-center gap-2">
            <Terminal className="w-3 h-3 text-indigo-400" /> COMMANDER AI
          </div>
          <div className="text-[8px] text-indigo-400 font-mono flex items-center gap-1"><CheckCircle2 className="w-2 h-2 animate-pulse" /> LISTENING</div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar relative">
        {/* Background watermark */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-5">
            <Bot className="w-32 h-32" />
        </div>

        {chat.length === 0 && (
            <div className="text-[9px] font-mono tracking-widest text-center text-slate-500 pt-10">
                AWAITING DIRECTIVE...<br/>
            </div>
        )}
        <AnimatePresence initial={false}>
            {chat.map((msg, i) => {
                const isUser = msg.role === 'user';
                return (
                    <motion.div 
                        key={i} 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                    >
                        <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border ${isUser ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400" : "bg-indigo-500/20 border-indigo-500/50 text-indigo-400"}`}>
                            {isUser ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                        </div>
                        <div className={`max-w-[85%] rounded-md p-2 text-[10px] leading-snug font-mono border ${isUser ? "bg-cyan-950/40 border-cyan-500/20 text-cyan-100 rounded-tr-none" : "bg-indigo-950/40 border-indigo-500/20 text-indigo-100 rounded-tl-none"}`}>
                            {msg.text}
                        </div>
                    </motion.div>
                );
            })}
            
            {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                    <div className="w-5 h-5 rounded bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center text-indigo-400 shrink-0">
                        <Bot className="w-3 h-3" />
                    </div>
                    <div className="bg-indigo-950/40 border border-indigo-500/20 rounded-md rounded-tl-none px-2 py-1 flex gap-1 items-center">
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-1 h-1 rounded-full bg-indigo-400"></motion.div>
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 h-1 rounded-full bg-indigo-400"></motion.div>
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 h-1 rounded-full bg-indigo-400"></motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSend} className="p-2 border-t border-white/10 bg-black/40 shrink-0 relative flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ctrl+K or type here..." 
          className="w-full bg-black/40 border border-white/10 focus:border-indigo-500/50 rounded-md px-3 py-1.5 text-[10px] text-white focus:outline-none transition-all font-mono"
        />
        <button type="submit" className="text-indigo-400 hover:text-white transition-colors p-1.5 bg-indigo-500/10 rounded-md hover:bg-indigo-500 border border-indigo-500/30">
          <Send className="w-3 h-3" />
        </button>
      </form>
    </div>
  );
}
