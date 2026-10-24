import sys
import os
import time
import logging
import networkx as nx

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from core.event_bus import EventBus

logging.basicConfig(level=logging.INFO, format='%(asctime)s [KG_AGENT] %(message)s')

class KnowledgeGraphAgent:
    """
    Maintains a dynamic entity-relationship graph (People, Locations, Weapons, Events).
    """
    def __init__(self):
        self.bus = EventBus()
        self.bus.subscribe("vision_events", self.handle_vision)
        self.bus.subscribe("geospatial_events", self.handle_geo)
        
        self.G = nx.DiGraph()
        
    def add_node(self, node_id, node_type, **attributes):
        self.G.add_node(node_id, type=node_type, last_seen=time.time(), **attributes)
        
    def add_edge(self, source, target, relation):
        self.G.add_edge(source, target, relation=relation, timestamp=time.time())

    def handle_vision(self, msg):
        if "people" in msg:
            for p in msg["people"]:
                pid = f"Person_{p['id']}"
                action = p.get("action", {}).get("label", "NEUTRAL")
                
                self.add_node(pid, "PERSON", action=action)
                
                if action == "AGGRESSIVE":
                    self.add_node("Event_Aggression", "EVENT")
                    self.add_edge(pid, "Event_Aggression", "PARTICIPATING_IN")

        if msg.get("content") and msg.get("source") == "VISUAL":
            # Weapon detected
            weapon = msg["content"]
            self.add_node(f"Weapon_{weapon}", "OBJECT")
            # Assume closest person holds it in a real system. Here, we just link to a generic event.
            self.add_node("Event_WeaponDrawn", "EVENT")
            self.add_edge(f"Weapon_{weapon}", "Event_WeaponDrawn", "INVOLVED_IN")
            
        self.broadcast_graph()

    def handle_geo(self, msg):
        for p in msg.get("world_people", []):
            pid = f"Person_{p['id']}"
            pos = p["position"]
            # Simple sector logic based on Z coordinate
            sector = "Sector_North" if pos[2] > 0 else "Sector_South"
            self.add_node(sector, "LOCATION")
            self.add_edge(pid, sector, "LOCATED_IN")

    def broadcast_graph(self):
        # Extract a simplified dictionary representation of the graph for the frontend/commander
        nodes = [{"id": n, **d} for n, d in self.G.nodes(data=True)]
        edges = [{"source": u, "target": v, **d} for u, v, d in self.G.edges(data=True)]
        
        graph_data = {
            "source": "KNOWLEDGE_GRAPH",
            "timestamp": time.time(),
            "nodes": nodes,
            "edges": edges
        }
        self.bus.publish("kg_updates", graph_data)

    def run(self):
        logging.info("🕸️ Knowledge Graph Agent running...")
        self.bus.start_listening()
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            self.bus.stop_listening()

if __name__ == "__main__":
    agent = KnowledgeGraphAgent()
    agent.run()
