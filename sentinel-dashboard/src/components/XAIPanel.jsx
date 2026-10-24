import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Database, Brain, Zap, User, ShieldAlert, MapPin, Activity } from 'lucide-react';

// Animated connection line between two nodes vertically
function VerticalEdge({ active, delay }) {
  return (
    <div className="w-px h-6 bg-white/10 mx-auto relative overflow-hidden">
        <motion.div 
            initial={{ y: '-100%' }}
            animate={{ y: '100%' }}
            transition={{ duration: 1.5, repeat: Infinity, delay, ease: "linear" }}
            className={`absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent ${active ? 'via-emerald-400' : 'via-purple-500'} to-transparent`}
        />
    </div>
  );
}

function LiveGraphNode({ icon: Icon, label, value, colorClass, active }) {
    return (
        <div className={`flex items-center gap-3 p-2 rounded-lg border ${active ? `bg-${colorClass.split('-')[1]}-950/40 border-${colorClass.split('-')[1]}-500/50 shadow-[0_0_15px_rgba(0,0,0,0.5)]` : 'bg-black/20 border-white/5'} transition-all`}>
            <div className={`p-1.5 rounded-md ${active ? `bg-${colorClass.split('-')[1]}-500/20 text-${colorClass.split('-')[1]}-400` : 'bg-white/5 text-slate-500'}`}>
                <Icon className="w-3 h-3" />
            </div>
            <div className="flex flex-col">
                <span className="text-[8px] font-bold tracking-widest text-slate-500 uppercase">{label}</span>
                <span className={`text-[10px] font-mono ${active ? 'text-white' : 'text-slate-400'}`}>{value}</span>
            </div>
        </div>
    );
}

export default function XAIPanel({ kgData, reports }) {
  // Mocking the live reasoning chain based on the user's specific request
  // (Person -> Weapon -> Vehicle -> Sector -> Incident -> Recommendation)
  
  const hasThreat = kgData?.nodes?.some(n => n.type === 'Subject' && n.attributes?.risk_level > 50) || true; // Force true for visual demo of the active chain

  return (
    <div className="flex flex-col h-full bg-transparent">
      <div className="flex items-center justify-between p-2 border-b border-white/10 bg-black/40 shrink-0">
          <div className="text-[10px] font-display font-bold tracking-[0.2em] text-white uppercase flex items-center gap-2">
            <Network className="w-3 h-3 text-emerald-400" /> XAI REASONING
          </div>
          <div className="text-[8px] text-emerald-400 font-mono flex items-center gap-1"><Activity className="w-2 h-2 animate-pulse" /> LIVE TRACE</div>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
        
        {/* Vertical Animated Reasoning Chain */}
        <div className="flex flex-col w-full max-w-[200px] mx-auto pt-2">
            
            <LiveGraphNode icon={User} label="Subject" value="ID-99 (Unknown)" colorClass="text-cyan-400" active={true} />
            <VerticalEdge active={hasThreat} delay={0} />
            
            <LiveGraphNode icon={Zap} label="Detected Prop" value="Concealed Object" colorClass="text-orange-400" active={hasThreat} />
            <VerticalEdge active={hasThreat} delay={0.3} />
            
            <LiveGraphNode icon={MapPin} label="Location" value="Sector 4 (Restricted)" colorClass="text-red-400" active={hasThreat} />
            <VerticalEdge active={hasThreat} delay={0.6} />
            
            <LiveGraphNode icon={Database} label="Historical Match" value="Incident #402" colorClass="text-purple-400" active={hasThreat} />
            <VerticalEdge active={hasThreat} delay={0.9} />
            
            <LiveGraphNode icon={ShieldAlert} label="Recommendation" value="Dispatch Drone" colorClass="text-emerald-400" active={hasThreat} />

        </div>

        {/* Evidence Citations below the chain */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <h3 className="text-[8px] font-bold tracking-widest text-slate-500 uppercase mb-2 flex items-center gap-1">
            <Database className="w-2 h-2 text-slate-400" /> Grounded Evidence
          </h3>
          <div className="space-y-2">
            <div className="p-2 rounded-lg bg-black/40 border border-white/5 border-l-2 border-l-yellow-500">
               <div className="flex items-center justify-between mb-1">
                   <span className="text-[8px] text-yellow-500 font-mono">SOP-4.2 MATCH</span>
                   <span className="text-[8px] font-mono text-slate-500">98% CONF</span>
               </div>
               <p className="text-[9px] text-slate-300 leading-tight font-mono">
                   "If unauthorized subject enters Sector 4, dispatch nearest drone for verification."
               </p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
