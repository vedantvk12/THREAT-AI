import React from 'react';
import { ComposedChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Line } from 'recharts';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

export function PredictiveChart({ history, isCritical }) {
  const theme = isCritical ? "#ef4444" : "#06b6d4"; // Red or Cyan
  
  // Transform data to include an upper/lower bound for the confidence ribbon
  const dataWithBounds = history.map(d => ({
      ...d,
      lowerBound: Math.max(0, d.predicted - 15),
      upperBound: Math.min(100, d.predicted + 15)
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#030712]/90 border border-white/20 p-3 rounded-xl backdrop-blur-xl shadow-2xl">
          <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest border-b border-white/10 pb-1">Telemetry Snapshot</div>
          <p className="text-xs font-mono text-white mb-1"><span className="text-slate-500 mr-2">ACTUAL:</span> {payload[1]?.value?.toFixed(1) || 0}</p>
          <p className="text-xs font-mono text-cyan-400"><span className="text-slate-500 mr-2">FORECAST:</span> {payload[2]?.value?.toFixed(1) || 0}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full bg-black/40 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 relative pointer-events-auto shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <div className="absolute top-5 left-6 z-10 flex items-center gap-3">
            <div className="p-1.5 bg-white/5 rounded-lg border border-white/10">
                <Activity className="w-3 h-3 text-slate-300" />
            </div>
            <div>
                <h3 className="text-[11px] font-bold tracking-[0.2em] text-white uppercase font-display">
                    Mission Trajectory
                </h3>
                <div className="text-[9px] font-mono text-slate-500">10s PREDICTIVE HORIZON</div>
            </div>
        </div>
        
        <ResponsiveContainer width="100%" height="100%" className="mt-4">
            <ComposedChart data={dataWithBounds} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme} stopOpacity={0.5} />
                        <stop offset="95%" stopColor={theme} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.0} />
                    </linearGradient>
                </defs>
                
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis domain={[0, 100]} hide />
                
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1, strokeDasharray: '5 5' }} />
                
                {/* Confidence Ribbon (Upper/Lower bounds) */}
                <Area 
                    type="monotone" 
                    dataKey="upperBound" 
                    stroke="none" 
                    fill="url(#confidenceGradient)" 
                    isAnimationActive={true}
                    animationDuration={300}
                />
                
                {/* Historical Risk */}
                <Area 
                    type="monotone" 
                    dataKey="risk" 
                    stroke={theme} 
                    fill="url(#riskGradient)" 
                    strokeWidth={2} 
                    isAnimationActive={true} 
                    animationDuration={300}
                />
                
                {/* Forecast Line */}
                <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#8b5cf6" // Purple forecast
                    strokeWidth={2} 
                    dot={false}
                    strokeDasharray="4 4" 
                    isAnimationActive={true}
                    animationDuration={300}
                />
            </ComposedChart>
        </ResponsiveContainer>
    </div>
  );
}
