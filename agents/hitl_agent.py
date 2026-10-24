import sys
import os
import time
import logging

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from core.event_bus import EventBus

logging.basicConfig(level=logging.INFO, format='%(asctime)s [HITL] %(message)s')

class HumanApprovalAgent:
    """
    Manages the HITL queue, ensuring critical actions pause for operator confirmation.
    """
    def __init__(self):
        self.bus = EventBus()
        # Listen for dashboard commands via gateway
        self.bus.subscribe("dashboard_commands", self.handle_command)
        
    def handle_command(self, msg):
        command_type = msg.get("type")
        if command_type == "CONFIRM_THREAT":
            logging.info("Operator CONFIRMED threat. Forwarding to tactical units.")
            self.bus.publish("hitl_events", {"status": "CONFIRMED", "timestamp": time.time()})
        elif command_type == "FALSE_ALARM":
            logging.info("Operator marked FALSE ALARM. Standing down.")
            self.bus.publish("hitl_events", {"status": "FALSE_ALARM", "timestamp": time.time()})
            # Force risk reset
            self.bus.publish("system_commands", {"type": "RESET_RISK"})

    def run(self):
        logging.info("👥 Human Approval Agent running...")
        self.bus.start_listening()
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            self.bus.stop_listening()

if __name__ == "__main__":
    agent = HumanApprovalAgent()
    agent.run()
