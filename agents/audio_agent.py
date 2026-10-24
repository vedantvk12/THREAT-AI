import time
import json
import zmq
import numpy as np
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from core.event_bus import EventBus
import sounddevice as sd # <--- NEW LIBRARY
import scipy.signal
import tensorflow as tf
import tensorflow_hub as hub

# --- CONFIGURATION ---
# We don't need MIC_ID anymore. SoundDevice usually finds the right one automatically.
# But if it fails, we can specify it later.
SAMPLE_RATE = 16000 # We ask for 16k directly
THRESHOLD = 0.2
MODEL_URL = "https://www.kaggle.com/models/google/yamnet/frameworks/TensorFlow2/variations/yamnet/versions/1"
THREAT_CLASSES = [420, 421, 422, 423, 424, 425, 12, 14]

class AudioAgent:
    def __init__(self):
        print("[INFO] Loading YAMNet...")
        self.model = hub.load(MODEL_URL)
        class_map_path = self.model.class_map_path().numpy()
        file_content = tf.io.read_file(class_map_path).numpy().decode('utf-8')
        self.class_names = [x.split(',')[2] for x in file_content.splitlines()[1:]]

        # Connect to Event Bus
        self.bus = EventBus()
        print("[INFO] Connected to Event Bus.")

    def listen_and_analyze(self):
        print("[INFO] Listening with SoundDevice... (Press Ctrl+C to Stop)")
        
        # We read in blocks of 1 second roughly
        block_size = 16000 * 1 
        
        try:
            # Open the stream using the "default" windows input
            with sd.InputStream(channels=1, samplerate=SAMPLE_RATE, dtype='int16') as stream:
                while True:
                    # Read audio data
                    data, overflowed = stream.read(block_size)
                    
                    if overflowed:
                        print("Warning: Audio buffer overflow")

                    # Convert to float for AI
                    # flatten() is needed because sounddevice gives 2D array
                    waveform = data.flatten() / 32768.0 

                    # DEBUG: CHECK VOLUME
                    vol = np.abs(data).max()
                    
                    # AI Inference
                    scores, _, _ = self.model(waveform)
                    mean_scores = np.mean(scores, axis=0)
                    top_class = np.argmax(mean_scores)
                    confidence = float(mean_scores[top_class])
                    prediction = self.class_names[top_class]

                    # Logic
                    if confidence > THRESHOLD:
                        if top_class in THREAT_CLASSES:
                            # SEND ALERT
                            msg = {
                                "source": "AUDIO",
                                "content": prediction,
                                "confidence": confidence,
                                "timestamp": time.time()
                            }
                            self.bus.publish("audio_events", msg)
                            print(f"🚨 SENT ALERT: {prediction} ({confidence:.2f}) | Vol: {vol}")
                        else:
                            # Print normal sounds so you know it's working
                            print(f"Heard: {prediction} ({confidence:.2f}) | Vol: {vol}     ", end='\r')

        except KeyboardInterrupt:
            print("\nStopping...")
        except Exception as e:
            print(f"\n[ERROR] {e}")
            print("Try plugging in headphones with a mic, or check Windows Default Input.")

if __name__ == "__main__":
    agent = AudioAgent()
    agent.listen_and_analyze()
