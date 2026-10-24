import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Brain, Map, Network, FileText, Settings, Maximize } from 'lucide-react';
import { cn } from './ui/GlassPanel';

function DockIcon({ icon: Icon, label, isActive, onClick }) {
  return (
    <motion.button
      whileHover={{ y: -8, scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="relative group flex items-center justify-center w-12 h-12 rounded-2xl transition-colors"
    >
      <div className={cn(
        "absolute inset-0 rounded-2xl transition-all duration-300",
        isActive ? "bg-white/10 border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)]" : "bg-transparent group-hover:bg-white/5 border border-transparent group-hover:border-white/10"
      )} />
      <Icon className={cn("w-5 h-5 relative z-10 transition-colors", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200")} />
      
      {/* Active Dot */}
      {isActive && (
        <motion.div layoutId="dockActive" className="absolute -bottom-2 w-1 h-1 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
      )}

      {/* Tooltip */}
      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[#030712] border border-white/10 text-[10px] font-bold tracking-widest text-slate-300 px-3 py-1.5 rounded-lg whitespace-nowrap pointer-events-none shadow-xl">
        {label}
      </div>
    </motion.button>
  );
}

export function CommandDock({ activeView, setActiveView, toggleFullscreen }) {
  const views = [
    { id: 'twin', icon: Map, label: 'DIGITAL TWIN' },
    { id: 'xai', icon: Network, label: 'XAI GRAPH' },
    { id: 'cameras', icon: Camera, label: 'SENSOR FEED' },
    { id: 'commander', icon: Brain, label: 'COPILOT' },
    { id: 'reports', icon: FileText, label: 'EVIDENCE' },
  ];

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.5 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-2 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
    >
      {views.map(view => (
        <DockIcon 
          key={view.id}
          icon={view.icon}
          label={view.label}
          isActive={activeView === view.id}
          onClick={() => setActiveView(view.id)}
        />
      ))}
      
      <div className="w-px h-8 bg-white/10 mx-2" />
      
      <DockIcon 
        icon={Maximize}
        label="FULLSCREEN TWIN"
        onClick={toggleFullscreen}
      />
    </motion.div>
  );
}
