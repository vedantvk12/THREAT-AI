import React from 'react';
import { Target, Cpu, Database, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function IntelligenceRail({ contextDetails }) {
  // Mock historical breakdown for visual density based on real events
  const events = (contextDetails || []).slice(-20).reverse().map((eventStr, idx) => {
    // Attempt to guess the source agent based on keywords
    let source = 'Operator';
    let icon = Target;
    let color = 'text-slate-400';
    let bg = 'bg-slate-500/20';

    const s = eventStr.toLowerCase();
    if (s.includes('vision') || s.includes('detected') || s.includes('camera')) {
        source = 'Vision Agent';
        icon = Eye;
        color = 'text-cyan-400';
        bg = 'bg-cyan-500/20';
    } else if (s.includes('predict') || s.includes('risk') || s.includes('forecast')) {
        source = 'Prediction Agent';
        icon = Cpu;
        color = 'text-purple-400';
        bg = 'bg-purple-500/20';
    } else if (s.includes('graph') || s.includes('historical') || s.includes('match')) {
        source = 'Knowledge Graph';
        icon = Database;
        color = 'text-emerald-400';
        bg = 'bg-emerald-500/20';
    } else if (s.includes('critical') || s.includes('weapon')) {
        source = 'Commander';
        icon = Target;
        color = 'text-red-400';
        bg = 'bg-red-500/20';
    }

    // Generate a pseudo-timestamp that decreases sequentially
    const d = new Date();
    d.setSeconds(d.getSeconds() - idx * 2);
    const timeStr = d.toLocaleTimeString('en-US', { hour12: false });

    return { id: idx, timeStr, source, icon, color, bg, text: eventStr };
  });

  return (
    <div className="flex flex-col h-full bg-transparent">
      <div className="flex items-center justify-between p-2 border-b border-white/10 bg-black/40 shrink-0">
          <div className="text-[10px] font-display font-bold tracking-[0.2em] text-white uppercase flex items-center gap-2">
            <Target className="w-3 h-3 text-cyan-400" /> LIVE INTELLIGENCE
          </div>
          <span className="flex h-1.5 w-1.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
          </span>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 relative">
        <div className="absolute left-[15px] top-2 bottom-0 w-px bg-white/10" />

        <div className="space-y-3 relative z-10">
          {events.length === 0 && (
            <div className="text-[10px] text-slate-500 italic pl-8 font-mono">
              Awaiting telemetry...
            </div>
          )}
          
          <AnimatePresence>
              {events.map((ev) => {
                const Icon = ev.icon;
                return (
                  <motion.div
                    key={ev.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative pl-8 group"
                  >
                    <div className={`absolute left-[-1px] top-1 w-3 h-3 rounded-full flex items-center justify-center ${ev.bg} border border-${ev.color.split('-')[1]}-500/50 shadow-[0_0_10px_rgba(0,0,0,0.5)]`}>
                        <Icon className={`w-2 h-2 ${ev.color}`} />
                    </div>

                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono text-slate-400">{ev.timeStr}</span>
                            <span className={`text-[9px] font-bold tracking-widest uppercase ${ev.color}`}>{ev.source}</span>
                        </div>
                        <p className="text-[10px] font-mono text-slate-300 leading-tight">
                            {ev.text}
                        </p>
                    </div>
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
