import sys
import os
import time
import logging

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from core.event_bus import EventBus

logging.basicConfig(level=logging.INFO, format='%(asctime)s [GEOSPATIAL] %(message)s')

class GeospatialAgent:
    """
    Transforms 2D pixel coordinates from Vision Agent into 3D world coordinates
    for the Digital Twin and tactical mapping.
    """
    def __init__(self):
        self.bus = EventBus()
        self.bus.subscribe("vision_events", self.handle_vision)
        
        # Mock Extrinsic Matrix (Camera to World mapping)
        self.camera_matrix = {
            "scale_x": 0.05,
            "scale_y": 0.05,
            "offset_x": 10.0,
            "offset_z": -5.0
        }
        
    def handle_vision(self, msg):
        if "people" in msg:
            world_people = []
            for p in msg["people"]:
                box = p["box"]
                cx = (box[0] + box[2]) / 2
                cy = (box[1] + box[3]) / 2
                
                # Mock projection (assuming a fixed plane for Z=0)
                # 640x480 is standard assumed resolution
                world_x = (cx - 320) * self.camera_matrix["scale_x"] + self.camera_matrix["offset_x"]
                world_z = (cy - 240) * self.camera_matrix["scale_y"] + self.camera_matrix["offset_z"]
                
                world_people.append({
                    "id": p["id"],
                    "position": [round(world_x, 2), 0.0, round(world_z, 2)],
                    "action": p.get("action", {})
                })
            
            geo_msg = {
                "source": "GEOSPATIAL",
                "timestamp": time.time(),
                "world_people": world_people
            }
            self.bus.publish("geospatial_events", geo_msg)

    def run(self):
        logging.info("🌍 Geospatial Agent running...")
        self.bus.start_listening()
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            self.bus.stop_listening()

if __name__ == "__main__":
    agent = GeospatialAgent()
    agent.run()
