import React, { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { GlassPanel, cn } from './GlassPanel';

export function MetricCard({ label, value, unit, icon: Icon, colorClass = "text-blue-400", delay = 0, suffix = "" }) {
  
  // Spring animation for numbers
  const springValue = useSpring(value || 0, { bounce: 0, duration: 800 });
  
  useEffect(() => {
    springValue.set(value || 0);
  }, [value, springValue]);

  // Transform spring output to rounded number
  const displayValue = useTransform(springValue, (latest) => Math.round(latest));

  return (
    <GlassPanel delay={delay} className="p-4 flex flex-col justify-between h-full group">
      <div className="flex justify-between items-start mb-2">
        <span className="text-label">{label}</span>
        {Icon && <Icon className={cn("w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity duration-300", colorClass)} />}
      </div>
      
      <div className="flex items-baseline gap-1 mt-auto">
        <motion.span className={cn("text-metric", colorClass)}>
          {displayValue}
        </motion.span>
        {(unit || suffix) && (
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            {suffix} {unit}
          </span>
        )}
      </div>
      
      {/* Decorative inner glow line that activates on hover */}
      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-current opacity-20 group-hover:w-full transition-all duration-700 ease-out" style={{ color: 'inherit' }} />
    </GlassPanel>
  );
}
