import React from 'react';
import { Activity, ShieldAlert, Cpu, Database, Network, Server, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

function StatusBadge({ label, status, colorClass }) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/40 border border-white/5">
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'ONLINE' ? 'animate-pulse' : ''} ${colorClass}`}></span>
      <span className="text-[9px] font-mono text-slate-300 uppercase tracking-widest">{label}</span>
      <span className={`text-[8px] font-bold font-mono ml-1 ${colorClass}`}>{status}</span>
    </div>
  );
}

export function Header({ isConnected, riskScore }) {
  const isCritical = riskScore > 75;

  return (
    <div className="flex flex-col w-full border-b border-white/10 bg-black/60 backdrop-blur-xl shrink-0 z-50">
      
      {/* Top Row: Mission Metrics */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
        <div className="flex items-center gap-6">
          <h1 className="text-[12px] font-display font-bold tracking-[0.3em] text-white uppercase">
            SENTINEL X
          </h1>
          <div className="h-4 w-px bg-white/10"></div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-slate-400 font-mono">MISSION:</span>
            <span className="text-[9px] text-cyan-400 font-mono font-bold tracking-widest uppercase">OMEGA PROTOCOL</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-slate-400 font-mono">THREAT LEVEL:</span>
            <span className={`text-[9px] font-mono font-bold tracking-widest uppercase ${isCritical ? 'text-red-500' : 'text-emerald-500'}`}>
              {isCritical ? 'CRITICAL' : 'NOMINAL'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-slate-400 font-mono">OPERATOR:</span>
            <span className="text-[9px] text-white font-mono tracking-widest uppercase">ID-774</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[9px] font-mono">
            <span className="text-slate-400">LOC:</span>
            <span className="text-slate-200">SECTOR-N</span>
          </div>
          <div className="flex items-center gap-2 text-[9px] font-mono">
            <span className="text-slate-400">TIME:</span>
            <span className="text-slate-200">{new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
          </div>
          <div className="flex items-center gap-2 text-[9px] font-mono">
            <span className="text-slate-400">SYS:</span>
            <span className={isConnected ? "text-emerald-400" : "text-red-400"}>{isConnected ? 'SECURE' : 'DISCONNECTED'}</span>
          </div>
        </div>
      </div>

      {/* Bottom Row: AI Status & Telemetry */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-black/40 overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-2">
          <StatusBadge label="Vision" status={isConnected ? "ONLINE" : "OFFLINE"} colorClass={isConnected ? "bg-cyan-500 text-cyan-400" : "bg-red-500 text-red-400"} />
          <StatusBadge label="Audio" status={isConnected ? "ONLINE" : "OFFLINE"} colorClass={isConnected ? "bg-cyan-500 text-cyan-400" : "bg-red-500 text-red-400"} />
          <StatusBadge label="Prediction" status={isConnected ? "ONLINE" : "OFFLINE"} colorClass={isConnected ? "bg-purple-500 text-purple-400" : "bg-red-500 text-red-400"} />
          <StatusBadge label="Commander" status={isConnected ? "ONLINE" : "OFFLINE"} colorClass={isConnected ? "bg-indigo-500 text-indigo-400" : "bg-red-500 text-red-400"} />
          <StatusBadge label="Knowledge Graph" status={isConnected ? "ONLINE" : "OFFLINE"} colorClass={isConnected ? "bg-emerald-500 text-emerald-400" : "bg-red-500 text-red-400"} />
          <StatusBadge label="Memory" status={isConnected ? "ONLINE" : "OFFLINE"} colorClass={isConnected ? "bg-orange-500 text-orange-400" : "bg-red-500 text-red-400"} />
        </div>

        <div className="flex items-center gap-4 text-[9px] font-mono">
          <div className="flex items-center gap-1.5"><Network className="w-3 h-3 text-slate-500"/> <span className="text-emerald-400">14ms</span></div>
          <div className="flex items-center gap-1.5"><Server className="w-3 h-3 text-slate-500"/> <span className="text-cyan-400">18 ACTIVE</span></div>
          <div className="flex items-center gap-1.5"><Activity className="w-3 h-3 text-slate-500"/> <span className="text-emerald-400">60 FPS</span></div>
          <div className="flex items-center gap-1.5"><Cpu className="w-3 h-3 text-slate-500"/> <span className="text-yellow-400">32%</span></div>
          <div className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-slate-500"/> <span className="text-orange-400">12GB</span></div>
        </div>
      </div>
    </div>
  );
}
