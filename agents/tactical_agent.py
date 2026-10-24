import sys
import os
import time
import logging

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from core.event_bus import EventBus

logging.basicConfig(level=logging.INFO, format='%(asctime)s [TACTICAL] %(message)s')

class TacticalPlanningAgent:
    """
    Generates mitigation strategies, evacuation routes, and resource deployment
    based on current threat conditions.
    """
    def __init__(self):
        self.bus = EventBus()
        self.bus.subscribe("telemetry_events", self.evaluate_tactics)
        self.last_tactic_time = 0

    def evaluate_tactics(self, msg):
        risk_score = msg.get("risk_score", 0)
        now = time.time()
        
        # Don't spam tactics, update every 5 seconds if critical
        if now - self.last_tactic_time < 5:
            return
            
        if risk_score > 75:
            tactical_plan = {
                "source": "TACTICAL_AGENT",
                "timestamp": now,
                "recommendations": [
                    {"action": "LOCKDOWN", "target": "Sector South", "priority": "CRITICAL"},
                    {"action": "EVACUATE", "target": "Civilians via North Exit", "priority": "HIGH"},
                    {"action": "DEPLOY", "target": "Drone Unit 1 to Sector South", "priority": "HIGH"}
                ],
                "status": "ACTIVE_MITIGATION"
            }
            self.bus.publish("tactical_events", tactical_plan)
            self.last_tactic_time = now
            logging.info("Published Tactical Mitigation Plan.")

    def run(self):
        logging.info("🛡️ Tactical Planning Agent running...")
        self.bus.start_listening()
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            self.bus.stop_listening()

if __name__ == "__main__":
    agent = TacticalPlanningAgent()
    agent.run()
