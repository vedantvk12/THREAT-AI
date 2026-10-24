import sys
import os
import time
import logging
import chromadb
from sentence_transformers import SentenceTransformer

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from core.event_bus import EventBus

logging.basicConfig(level=logging.INFO, format='%(asctime)s [RAG_AGENT] %(message)s')

class RAGIntelligenceAgent:
    """
    Retrieves Standard Operating Procedures (SOPs), historical incidents, and rules of engagement
    using a Vector Database (ChromaDB) to provide context for tactical decisions.
    """
    def __init__(self):
        self.bus = EventBus()
        self.bus.subscribe("rag_query", self.handle_query)
        
        # Initialize ChromaDB in-memory for the prototype
        self.chroma_client = chromadb.Client()
        self.collection = self.chroma_client.create_collection(name="sentinel_knowledge")
        
        # Load a small embedding model
        self.embedder = SentenceTransformer('all-MiniLM-L6-v2')
        
        self._seed_database()

    def _seed_database(self):
        """Seed with some mock SOPs and historical data"""
        docs = [
            "SOP-4.2: If a suspect is identified as AGGRESSIVE in Sector North, immediately lock down doors 4A and 4B.",
            "SOP-9.1: Unauthorized weapon detected triggers an automatic DEFCON 1 alert. Evacuate civilians via South Exit.",
            "Historical Incident 2024-08: Rapid escalation in Sector South led to a brawl. Mitigation was deploying 2 drone units.",
            "Rules of Engagement: Do not engage unless the suspect crosses the red line into the server room."
        ]
        ids = [f"doc_{i}" for i in range(len(docs))]
        embeddings = self.embedder.encode(docs).tolist()
        
        self.collection.add(
            embeddings=embeddings,
            documents=docs,
            ids=ids
        )
        logging.info("📚 RAG Database seeded with SOPs and Historical Records.")

    def handle_query(self, msg):
        query = msg.get("query", "")
        reply_channel = msg.get("reply_to", "rag_response")
        
        if query:
            query_embed = self.embedder.encode([query]).tolist()
            results = self.collection.query(
                query_embeddings=query_embed,
                n_results=2
            )
            
            retrieved = results['documents'][0] if results['documents'] else []
            
            response = {
                "source": "RAG_AGENT",
                "query": query,
                "context": retrieved,
                "timestamp": time.time()
            }
            self.bus.publish(reply_channel, response)

    def run(self):
        logging.info("🧠 RAG Intelligence Agent running...")
        self.bus.start_listening()
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            self.bus.stop_listening()

if __name__ == "__main__":
    agent = RAGIntelligenceAgent()
    agent.run()
