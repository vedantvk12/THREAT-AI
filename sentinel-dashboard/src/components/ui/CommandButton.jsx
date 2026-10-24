import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from './GlassPanel';

export function CommandButton({ children, onClick, variant = "default", className, ...props }) {
  const ref = useRef(null);
  
  // Magnetic pull variables
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15, mass: 0.5 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15, mass: 0.5 });

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    // Magnetic pull distance
    const pullDistanceX = (e.clientX - centerX) * 0.2;
    const pullDistanceY = (e.clientY - centerY) * 0.2;
    
    x.set(pullDistanceX);
    y.set(pullDistanceY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const base = "relative overflow-hidden font-display text-xs font-bold tracking-[0.1em] px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition-colors duration-300 backdrop-blur-xl border";
  
  const variants = {
    default: "bg-white/5 border-white/10 text-slate-300 hover:text-white hover:border-white/30 hover:bg-white/10 shadow-[0_4px_15px_rgba(0,0,0,0.3)]",
    danger: "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/80 hover:text-white hover:border-red-400 hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]",
    success: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/80 hover:text-white hover:border-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
  };

  return (
    <motion.button 
      ref={ref}
      style={{ x: mouseXSpring, y: mouseYSpring }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(base, variants[variant], className)}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      {/* Specular Sweep overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] hover:animate-[sweep_1.5s_ease-in-out_infinite]" />
    </motion.button>
  );
}
