import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';

export function InitialLoader({ onComplete }) {
  const [step, setStep] = useState(0);
  
  const steps = [
    "INITIALIZING AI CORE...",
    "LOADING VISION AGENT...",
    "CONNECTING KNOWLEDGE GRAPH...",
    "SYNCHRONIZING DIGITAL TWIN...",
    "COMMANDER ONLINE."
  ];

  useEffect(() => {
    if (step < steps.length) {
      const timer = setTimeout(() => setStep(step + 1), 600);
      return () => clearTimeout(timer);
    } else {
      setTimeout(onComplete, 800);
    }
  }, [step, steps.length, onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className="fixed inset-0 z-50 bg-[#030712] flex items-center justify-center flex-col"
    >
      <motion.div
        animate={{ scale: [0.9, 1.1, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="mb-8 relative"
      >
        <BrainCircuit className="w-16 h-16 text-cyan-500" />
        <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-40 rounded-full" />
      </motion.div>

      <div className="h-8 relative overflow-hidden w-64 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="text-xs font-bold tracking-[0.2em] text-slate-400 font-display absolute inset-0"
          >
            {steps[Math.min(step, steps.length - 1)]}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="w-64 h-1 bg-white/10 rounded-full mt-4 overflow-hidden">
        <motion.div 
          className="h-full bg-cyan-500"
          initial={{ width: 0 }}
          animate={{ width: `${(step / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </motion.div>
  );
}
