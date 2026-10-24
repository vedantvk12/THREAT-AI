import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// OMEGA Tier Liquid Glass Panel with Specular Mouse Tracking
export function GlassPanel({ children, className, active, delay = 0, ...props }) {
  const ref = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth out the mouse movement for the highlight
  const smoothX = useSpring(mouseX, { stiffness: 300, damping: 30 });
  const smoothY = useSpring(mouseY, { stiffness: 300, damping: 30 });

  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    // Normalize to -1 to 1 for perspective tilt if we want to add it later
    mouseX.set(x);
    mouseY.set(y);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, filter: 'blur(20px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative overflow-hidden backdrop-blur-2xl rounded-3xl transition-colors duration-500",
        active ? 'bg-white/10 border-white/20 shadow-[0_10px_40px_rgba(59,130,246,0.3)]' : 'bg-[#030712]/40 border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] border', 
        className
      )}
      {...props}
    >
      {/* Specular Highlight tracking mouse */}
      <motion.div 
        className="absolute inset-0 pointer-events-none mix-blend-overlay"
        style={{
          background: useTransform(
            [smoothX, smoothY],
            ([x, y]) => `radial-gradient(circle 300px at ${x}px ${y}px, rgba(255,255,255,0.1), transparent)`
          ),
          opacity: isHovered ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Top Edge Rim Light */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </motion.div>
  );
}
