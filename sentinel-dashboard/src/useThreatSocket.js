import { useEffect, useState, useCallback } from "react";

export function useThreatSocket() {
  const [data, setData] = useState({
    risk_score: 0,
    visual_event: "Scanning...",
    context_details: [],
    timestamp: "--:--:--",
    people: [],
    world_people: [],
    forecasts: {}
  });
  
  const [kgData, setKgData] = useState({ nodes: [], edges: [] });
  const [tacticalPlan, setTacticalPlan] = useState(null);
  const [copilotResponses, setCopilotResponses] = useState([]);
  const [reports, setReports] = useState([]);
  
  const [isConnected, setIsConnected] = useState(false);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const socket = new WebSocket("ws://127.0.0.1:8000/ws");
    
    socket.onopen = () => {
      setIsConnected(true);
      setWs(socket);
    };
    
    socket.onclose = () => {
      setIsConnected(false);
      setWs(null);
    };

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        
        switch (msg.topic) {
          case "telemetry":
            setData(prev => ({ ...prev, ...msg.data }));
            break;
          case "kg_updates":
            setKgData(msg.data);
            break;
          case "tactical_events":
            setTacticalPlan(msg.data);
            break;
          case "copilot_responses":
            setCopilotResponses(prev => [...prev, msg.data]);
            break;
          case "report_events":
            setReports(prev => [msg.data, ...prev]);
            break;
          default:
            break;
        }
      } catch (e) {
        console.error("Error parsing WebSocket message:", e);
      }
    };

    return () => socket.close();
  }, []);

  const sendCommand = useCallback((payload) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
    }
  }, [ws]);

  return { data, kgData, tacticalPlan, copilotResponses, reports, isConnected, sendCommand };
}