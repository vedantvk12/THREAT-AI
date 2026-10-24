import sys
import os
import time
import logging

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from core.event_bus import EventBus

logging.basicConfig(level=logging.INFO, format='%(asctime)s [REPORT] %(message)s')

class ReportGenerationAgent:
    """
    Compiles multimodal evidence into formal incident reports when an event concludes.
    """
    def __init__(self):
        self.bus = EventBus()
        self.bus.subscribe("telemetry_events", self.monitor_incidents)
        self.in_incident = False
        self.incident_start = 0
        self.incident_data = []

    def monitor_incidents(self, msg):
        risk = msg.get("risk_score", 0)
        
        if risk > 80 and not self.in_incident:
            self.in_incident = True
            self.incident_start = time.time()
            self.incident_data = [msg]
            logging.info("Incident started. Recording data...")
            
        elif self.in_incident:
            self.incident_data.append(msg)
            
            # If risk drops below 30, close the incident and generate report
            if risk < 30:
                self.generate_report()
                self.in_incident = False
                self.incident_data = []

    def generate_report(self):
        duration = time.time() - self.incident_start
        report = {
            "source": "REPORT_AGENT",
            "timestamp": time.time(),
            "report": {
                "title": f"Incident Report {int(time.time())}",
                "duration_seconds": round(duration, 2),
                "peak_risk": max([m.get("risk_score", 0) for m in self.incident_data]),
                "events_logged": len(self.incident_data)
            }
        }
        self.bus.publish("report_events", report)
        logging.info(f"Generated Incident Report: {report['report']['title']}")

    def run(self):
        logging.info("📝 Report Generation Agent running...")
        self.bus.start_listening()
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            self.bus.stop_listening()

if __name__ == "__main__":
    agent = ReportGenerationAgent()
    agent.run()
