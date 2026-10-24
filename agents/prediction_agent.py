import sys
import os
import time
import logging
from collections import deque

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from core.event_bus import EventBus

logging.basicConfig(level=logging.INFO, format='%(asctime)s [PREDICTION] %(message)s')

class PredictionAgent:
    """
    Time-Series Forecasting Agent.
    Predicts risk scores into the future (10s, 30s, 1m, 5m, 15m) using historical momentum.
    """
    def __init__(self):
        self.bus = EventBus()
        self.bus.subscribe("telemetry_events", self.handle_telemetry)
        
        self.history = deque(maxlen=60) # Store last 60 data points (assuming 1 tick per sec)
        self.last_tick = time.time()

    def handle_telemetry(self, msg):
        current_risk = msg.get("risk_score", 0)
        now = time.time()
        
        self.history.append((now, current_risk))
        
        # Calculate velocity (trend over last N seconds)
        velocity = 0
        if len(self.history) > 5:
            past_time, past_risk = self.history[-5]
            dt = now - past_time
            if dt > 0:
                velocity = (current_risk - past_risk) / dt
                
        # Non-linear damping for long-term forecasts (things tend to revert to mean)
        def forecast(seconds):
            damped_vel = velocity * (0.95 ** (seconds / 10))
            projected = current_risk + (damped_vel * seconds)
            return max(0, min(100, projected))

        predictions = {
            "10s": forecast(10),
            "30s": forecast(30),
            "1m": forecast(60),
            "5m": forecast(300),
            "15m": forecast(900),
        }
        
        forecast_msg = {
            "source": "PREDICTION_AGENT",
            "timestamp": now,
            "forecasts": predictions,
            "confidence_interval": 10.0 + (abs(velocity) * 5) # Uncertainty grows with volatility
        }
        
        self.bus.publish("forecast_events", forecast_msg)

    def run(self):
        logging.info("📈 Threat Prediction Agent running...")
        self.bus.start_listening()
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            self.bus.stop_listening()

if __name__ == "__main__":
    agent = PredictionAgent()
    agent.run()
