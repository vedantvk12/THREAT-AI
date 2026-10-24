import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useThreatSocket } from "./useThreatSocket";

import { InitialLoader } from "./components/ui/InitialLoader";
import { Header } from "./components/Header";
import { IntelligenceRail } from "./components/IntelligenceRail";
import DigitalTwin from "./components/DigitalTwin";
import XAIPanel from "./components/XAIPanel";
import CopilotChat from "./components/CopilotChat";
import { PredictiveChart } from "./components/PredictiveChart";
import { CommandPalette } from "./components/CommandPalette";
import { NotificationCenter, TacticalActions, SensorHealth, HistoricalTimeline } from "./components/DashboardWidgets";

export default function App() {
  const { data, kgData, tacticalPlan, copilotResponses, reports, isConnected, sendCommand } = useThreatSocket();
  const [loading, setLoading] = useState(true);
  const [cmdOpen, setCmdOpen] = useState(false);

  const [history, setHistory] = useState([]);
  useEffect(() => {
    if (data.timestamp && data.timestamp !== "--:--:--") {
      setHistory((prev) => {
        const score = data.risk_score || 0;
        const pred10s = data.forecasts?.["10s"] || score;
        return [...prev, { time: data.timestamp, risk: score, predicted: pred10s }].slice(-60); 
      });
    }
  }, [data]);

  const riskScore = data.risk_score || 0;
  const isCritical = riskScore > 75;

  return (
    <>
      <div className="noise-overlay"></div>
      <CommandPalette open={cmdOpen} setOpen={setCmdOpen} onCommand={sendCommand} />

      <AnimatePresence>
        {loading && <InitialLoader onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      <div className="h-screen w-full flex flex-col bg-[#020617] font-sans text-slate-200 overflow-hidden selection:bg-cyan-500/30">
        
        {/* Global Command Bar & Status Ribbon */}
        <Header isConnected={isConnected} riskScore={riskScore} />

        {/* Dense Grid Workspace */}
        <main className="flex-1 flex flex-col p-2 gap-2 min-h-0">
          
          {/* TOP ROW: Intel | Digital Twin | AI & XAI (60% height) */}
          <div className="flex-1 grid grid-cols-[20%_50%_calc(30%-1rem)] gap-2 min-h-0">
            {/* Left: Intelligence Wing */}
            <div className="flex flex-col gap-2 min-h-0">
              <div className="flex-1 min-h-0 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden relative">
                <IntelligenceRail contextDetails={data.context_details} />
              </div>
              <div className="h-1/4 min-h-0 bg-transparent relative">
                <SensorHealth />
              </div>
            </div>

            {/* Center: Digital Twin */}
            <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.8)]">
              <DigitalTwin worldPeople={data.world_people} riskScore={riskScore} isFullscreen={false} />
            </div>

            {/* Right: Reasoning Wing (Copilot + XAI) */}
            <div className="flex flex-col gap-2 min-h-0">
              <div className="flex-1 min-h-0 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
                <CopilotChat responses={copilotResponses} onSendMessage={sendCommand} />
              </div>
              <div className="h-[45%] min-h-0 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
                <XAIPanel kgData={kgData} reports={reports} />
              </div>
            </div>
          </div>

          {/* MIDDLE ROW: Timeline | Prediction | Actions (25% height) */}
          <div className="h-[25%] grid grid-cols-[20%_50%_calc(30%-1rem)] gap-2 shrink-0">
            <HistoricalTimeline />
            
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden relative shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
              <PredictiveChart history={history} isCritical={isCritical} />
            </div>
            
            <TacticalActions sendCommand={sendCommand} />
          </div>

          {/* BOTTOM ROW: Notifications & Logs (15% height) */}
          <div className="h-[15%] shrink-0">
            <NotificationCenter />
          </div>

        </main>
      </div>
    </>
  );
}