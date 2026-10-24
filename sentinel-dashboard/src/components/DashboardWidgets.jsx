import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, FileText, Activity, ShieldAlert, XCircle, RefreshCw } from 'lucide-react';

export function NotificationCenter({ events }) {
  // Use a simulated streaming log for the Notification Center if none provided
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    let count = 0;
    const interval = setInterval(() => {
        count++;
        const newLog = {
            id: Date.now(),
            time: new Date().toLocaleTimeString('en-US', { hour12: false, fractionalSecondDigits: 3 }),
            type: count % 5 === 0 ? 'WARNING' : 'INFO',
            message: count % 5 === 0 ? '[SENSOR] Stream latency spike detected in Sector 4.' : `[SYSTEM] Processing frame ${count * 140} via Neural Core.`,
        };
        setLogs(prev => [newLog, ...prev].slice(0, 30));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex flex-col p-2 bg-black/40 border border-white/10 rounded-xl overflow-hidden relative">
      <div className="flex items-center justify-between mb-2 shrink-0">
          <div className="text-[10px] font-display font-bold tracking-[0.2em] text-slate-400 uppercase flex items-center gap-2">
            <FileText className="w-3 h-3 text-slate-500" /> STREAMING LOGS
          </div>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
        <AnimatePresence>
            {logs.map((log) => (
                <motion.div 
                    key={log.id} 
                    initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 font-mono text-[9px]"
                >
                    <span className="text-slate-500 w-20 shrink-0">{log.time}</span>
                    <span className={`px-1 rounded ${log.type === 'WARNING' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-500/20 text-slate-400'} w-14 text-center shrink-0`}>
                        {log.type}
                    </span>
                    <span className={log.type === 'WARNING' ? 'text-yellow-100' : 'text-slate-300'}>
                        {log.message}
                    </span>
                </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function TacticalActions({ sendCommand }) {
    return (
        <div className="w-full h-full flex flex-col p-2 bg-black/40 border border-white/10 rounded-xl overflow-hidden relative">
            <div className="text-[10px] font-display font-bold tracking-[0.2em] text-slate-400 uppercase flex items-center gap-2 mb-2 shrink-0">
                <ShieldAlert className="w-3 h-3 text-red-500" /> TACTICAL ACTIONS
            </div>
            <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-2">
                <button 
                    onClick={() => sendCommand({ type: "CONFIRM_THREAT" })}
                    className="bg-red-500/10 border border-red-500/30 hover:bg-red-500/30 text-red-400 rounded-lg text-[9px] font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2"
                >
                    <ShieldAlert className="w-3 h-3" /> LOCKDOWN
                </button>
                <button 
                    onClick={() => sendCommand({ type: "FALSE_ALARM" })}
                    className="bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-[9px] font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2"
                >
                    <RefreshCw className="w-3 h-3" /> STAND DOWN
                </button>
                <button 
                    className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 rounded-lg text-[9px] font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2"
                >
                    <FileText className="w-3 h-3" /> REPORT
                </button>
                <button 
                    className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 rounded-lg text-[9px] font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2"
                >
                    <XCircle className="w-3 h-3" /> OVERRIDE
                </button>
            </div>
        </div>
    );
}

export function SensorHealth() {
    return (
        <div className="w-full h-full flex flex-col p-2 bg-black/40 border border-white/10 rounded-xl overflow-hidden relative">
            <div className="text-[10px] font-display font-bold tracking-[0.2em] text-slate-400 uppercase flex items-center gap-2 mb-2 shrink-0">
                <Activity className="w-3 h-3 text-cyan-400" /> SENSOR HEALTH
            </div>
            <div className="flex-1 flex flex-col justify-center space-y-2 px-2">
                <div className="flex items-center justify-between text-[9px] font-mono">
                    <span className="text-slate-400">CAM-01 (Lobby)</span>
                    <span className="text-emerald-400">100% SIGNAL</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-emerald-500" />
                </div>
                <div className="flex items-center justify-between text-[9px] font-mono">
                    <span className="text-slate-400">CAM-02 (Corridor)</span>
                    <span className="text-yellow-400">62% SIGNAL</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-[62%] bg-yellow-500 animate-pulse" />
                </div>
            </div>
        </div>
    );
}

export function HistoricalTimeline() {
    return (
        <div className="w-full h-full flex flex-col p-2 bg-black/40 border border-white/10 rounded-xl overflow-hidden relative">
            <div className="text-[10px] font-display font-bold tracking-[0.2em] text-slate-400 uppercase flex items-center gap-2 mb-2 shrink-0">
                <Activity className="w-3 h-3 text-purple-400" /> HISTORICAL HEATMAP
            </div>
            <div className="flex-1 flex items-center justify-center px-4">
                {/* Visual placeholder for timeline heatmap */}
                <div className="w-full h-4 flex gap-0.5">
                    {[...Array(40)].map((_, i) => {
                        const isHot = Math.random() > 0.8;
                        return (
                            <div key={i} className={`flex-1 h-full rounded-sm ${isHot ? 'bg-red-500/80' : 'bg-slate-700/50'}`} />
                        );
                    })}
                </div>
            </div>
            <div className="flex justify-between text-[8px] font-mono text-slate-500 mt-1">
                <span>-24 HOURS</span>
                <span>NOW</span>
            </div>
        </div>
    );
}
