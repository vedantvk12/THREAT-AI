import zmq
import json
import os
import sys
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# --- CONFIGURATION ---
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
MODEL_NAME = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

# Validation
if not GROQ_API_KEY:
    print("❌ ERROR: GROQ_API_KEY is missing. Please set it in your .env file or environment.")
    sys.exit(1)

# Initialize Client
client = Groq(api_key=GROQ_API_KEY)

class ReasoningAgent:
    def __init__(self):
        print(f"[INFO] Initializing Reasoning Agent using {MODEL_NAME}...")
        
        # Connect to Fusion Engine
        self.context = zmq.Context()
        self.socket = self.context.socket(zmq.SUB)
        self.socket.connect("tcp://localhost:5556") 
        self.socket.subscribe("") 
        
        print("[INFO] Reasoning Agent is ready and listening for Critical Alerts...")

    def generate_response(self, alert_data):
        print(f"\n[Thinking] Analyzing situation with {MODEL_NAME}...")
        
        system_prompt = "You are an elite Security AI Assistant. Provide brief, actionable, tactical responses."
        
        user_prompt = f"""
        CRITICAL THREAT DETECTED.
        
        DETAILS:
        - Source A: {alert_data.get('visual_event', 'None')}
        - Source B: {alert_data.get('audio_event', 'None')}
        - Risk Score: {alert_data.get('risk_score', 'Unknown')}
        - Time: {alert_data.get('timestamp', 'Now')}
        
        MISSION:
        1. Summarize the threat in 1 sentence.
        2. Assess danger level (High/Extreme).
        3. List 3 immediate tactical actions for the security team.
        """
        
        try:
            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                model=MODEL_NAME,
                temperature=0.6,
                max_tokens=300,
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            return f"Error connecting to Groq: {e}"

    def run(self):
        while True:
            try:
                # Wait for alert
                message = self.socket.recv_json()
                
                if message['type'] == 'CRITICAL_ALERT':
                    print(f"\n{'='*50}")
                    print(f"🚨 RECEIVED CRITICAL ALERT: {message}")
                    print(f"{'='*50}")
                    
                    # Ask AI
                    tactical_plan = self.generate_response(message)
                    
                    print(f"\n--- 🤖 AI TACTICAL RESPONSE ---")
                    print(tactical_plan)
                    print(f"{'-'*30}\n")
                    
            except KeyboardInterrupt:
                print("Stopping Reasoning Agent...")
                break

if __name__ == "__main__":
    agent = ReasoningAgent()
    agent.run()