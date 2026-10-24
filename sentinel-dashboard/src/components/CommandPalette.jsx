import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Terminal, Cpu, Database, Network, X } from 'lucide-react';
import { cn } from './ui/GlassPanel';

export function CommandPalette({ open, setOpen, onCommand }) {
  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" 
            onClick={() => setOpen(false)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-[101] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]"
          >
            <Command 
              className="bg-[#030712]/90 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl"
              label="Global Command Menu"
            >
              <div className="flex items-center border-b border-white/10 px-4">
                <Search className="w-5 h-5 text-slate-400" />
                <Command.Input 
                  autoFocus
                  placeholder="Issue command or query agent (e.g. 'lockdown sector 4')..." 
                  className="w-full bg-transparent border-none p-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-0 font-display text-sm"
                />
                <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1 border border-white/10 px-2 py-1 rounded bg-white/5">
                  ESC
                </div>
              </div>

              <Command.List className="max-h-[300px] overflow-y-auto p-2 custom-scrollbar">
                <Command.Empty className="p-6 text-center text-sm text-slate-500">No matching commands found.</Command.Empty>

                <Command.Group heading="Tactical Actions" className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2 px-2 pt-2">
                  <Command.Item 
                    onSelect={() => { onCommand({ type: "CONFIRM_THREAT" }); setOpen(false); }}
                    className="flex items-center gap-3 px-3 py-3 text-sm text-slate-300 rounded-lg aria-selected:bg-red-500/10 aria-selected:text-red-400 cursor-pointer transition-colors"
                  >
                    <Terminal className="w-4 h-4 text-red-500" /> Execute Global Mitigation
                  </Command.Item>
                  <Command.Item 
                    onSelect={() => { onCommand({ type: "FALSE_ALARM" }); setOpen(false); }}
                    className="flex items-center gap-3 px-3 py-3 text-sm text-slate-300 rounded-lg aria-selected:bg-white/10 aria-selected:text-white cursor-pointer transition-colors"
                  >
                    <Network className="w-4 h-4 text-cyan-500" /> Stand Down / Reset State
                  </Command.Item>
                </Command.Group>

                <Command.Group heading="Agent Interfaces" className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2 px-2 pt-4">
                  <Command.Item 
                    onSelect={() => { onCommand({ type: "QUERY_VISION" }); setOpen(false); }}
                    className="flex items-center gap-3 px-3 py-3 text-sm text-slate-300 rounded-lg aria-selected:bg-white/10 aria-selected:text-white cursor-pointer transition-colors"
                  >
                    <Cpu className="w-4 h-4 text-blue-400" /> Request Vision Analysis
                  </Command.Item>
                  <Command.Item 
                    onSelect={() => { onCommand({ type: "QUERY_RAG" }); setOpen(false); }}
                    className="flex items-center gap-3 px-3 py-3 text-sm text-slate-300 rounded-lg aria-selected:bg-white/10 aria-selected:text-white cursor-pointer transition-colors"
                  >
                    <Database className="w-4 h-4 text-emerald-400" /> Search SOP Documents
                  </Command.Item>
                </Command.Group>
              </Command.List>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
