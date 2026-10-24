import sys
import os
import time
import logging
from groq import Groq

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from core.event_bus import EventBus

from dotenv import load_dotenv

# Load environment configuration
load_dotenv()

logging.basicConfig(level=logging.INFO, format='%(asctime)s [COMMANDER] %(message)s')

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
MODEL_NAME = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile") 

class CommanderAgent:
    """
    The central orchestrator. Fuses inputs from all sensory and cognitive agents,
    maintains the global state, and powers the Copilot chat.
    """
    def __init__(self):
        self.bus = EventBus()
        
        # Subscriptions
        self.bus.subscribe("vision_events", self.handle_vision)
        self.bus.subscribe("audio_events", self.handle_audio)
        self.bus.subscribe("geospatial_events", self.handle_geo)
        self.bus.subscribe("forecast_events", self.handle_forecast)
        self.bus.subscribe("system_commands", self.handle_commands)
        self.bus.subscribe("copilot_queries", self.handle_copilot)
        
        # State
        self.state = {
            "risk_score": 0,
            "visual_event": "SCANNING...",
            "context_details": [],
            "people": [],
            "world_people": [],
            "forecasts": {},
            "timestamp": "--:--:--"
        }
        
        self.last_update = time.time()
        
        try:
            self.llm_client = Groq(api_key=GROQ_API_KEY)
        except Exception as e:
            logging.error(f"Failed to init Groq: {e}")
            self.llm_client = None

    def handle_vision(self, msg):
        now = time.time()
        dt = now - self.last_update
        if dt > 0.5:
            self.state["risk_score"] = max(0, self.state["risk_score"] - 2)
            self.last_update = now

        impact = 0
        logs = []
        
        if "people" in msg:
            self.state["people"] = msg["people"]
            for p in msg["people"]:
                action = p.get("action", {}).get("label")
                if action == "AGGRESSIVE":
                    impact += 40
                    logs.append(f"Aggressive(ID:{p['id']})")
                
                transition = p.get("action", {}).get("transition")
                if transition and transition.get("type") == "ESCALATION":
                    impact += 60
                    logs.append(f"RapidEscalation({transition['duration']}s)")

        if msg.get("content") and msg.get("source") == "VISUAL":
            impact += 50
            logs.append(f"WeaponDetected:{msg.get('content')}")

        self.state["risk_score"] = min(100, max(0, self.state["risk_score"] + impact))
        if logs:
            self.state["context_details"] = logs
            self.state["visual_event"] = "HOSTILE INTENT"
        else:
            self.state["visual_event"] = "SCANNING..."
            
        self.publish_state()

    def handle_audio(self, msg):
        # Audio anomaly increases risk
        if msg.get("confidence", 0) > 0.3:
            self.state["risk_score"] = min(100, self.state["risk_score"] + 30)
            self.state["context_details"].append(f"AudioAnomaly:{msg.get('content')}")
            self.publish_state()

    def handle_geo(self, msg):
        self.state["world_people"] = msg.get("world_people", [])
        self.publish_state()

    def handle_forecast(self, msg):
        self.state["forecasts"] = msg.get("forecasts", {})
        # Predict ahead for frontend display, but we broadcast the whole state anyway
        self.publish_state()

    def handle_commands(self, msg):
        if msg.get("type") == "RESET_RISK":
            self.state["risk_score"] = 0
            self.state["context_details"] = ["System Overridden by Operator"]
            self.publish_state()

    def handle_copilot(self, msg):
        query = msg.get("query", "")
        if not query or not self.llm_client: return
        
        logging.info(f"Copilot query received: {query}")
        
        # Build prompt with current state context
        context_str = f"Current Risk: {self.state['risk_score']}. Events: {self.state['context_details']}. People in FOV: {len(self.state['people'])}."
        
        try:
            chat_completion = self.llm_client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are the SENTINEL X Copilot. Answer the operator's questions based on the current context."},
                    {"role": "user", "content": f"Context: {context_str}\n\nOperator: {query}"}
                ],
                model=MODEL_NAME,
                temperature=0.4,
                max_tokens=150,
            )
            response = chat_completion.choices[0].message.content
            
            self.bus.publish("copilot_responses", {
                "source": "COMMANDER_COPILOT",
                "response": response,
                "timestamp": time.time()
            })
        except Exception as e:
            logging.error(f"Groq API Error: {e}")

    def publish_state(self):
        self.state["timestamp"] = time.strftime('%H:%M:%S')
        # We publish to "telemetry_events" for other agents, and gateway picks it up to send to frontend
        self.bus.publish("telemetry_events", self.state)

    def run(self):
        logging.info("🧠 Commander Agent running...")
        self.bus.start_listening()
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            self.bus.stop_listening()

if __name__ == "__main__":
    agent = CommanderAgent()
    agent.run()
