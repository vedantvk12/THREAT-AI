import sys
import os
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import json
import logging

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from core.event_bus import EventBus

# Force Windows asyncio policy if needed
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

logging.basicConfig(level=logging.INFO, format='%(asctime)s [API_GATEWAY] %(message)s')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    logging.info("🔵 REACT DASHBOARD CONNECTED")
    
    bus = EventBus()
    connection_active = True
    
    # We use an asyncio Queue to bridge synchronous EventBus callbacks with async WebSockets
    message_queue = asyncio.Queue()
    
    def queue_message(msg):
        # Fire-and-forget put_nowait to not block the ZMQ thread
        try:
            message_queue.put_nowait(msg)
        except Exception:
            pass

    # Subscribe to everything the frontend cares about
    bus.subscribe("telemetry_events", lambda m: queue_message({"topic": "telemetry", "data": m}))
    bus.subscribe("kg_updates", lambda m: queue_message({"topic": "kg_updates", "data": m}))
    bus.subscribe("tactical_events", lambda m: queue_message({"topic": "tactical_events", "data": m}))
    bus.subscribe("copilot_responses", lambda m: queue_message({"topic": "copilot_responses", "data": m}))
    bus.subscribe("report_events", lambda m: queue_message({"topic": "report_events", "data": m}))
    
    bus.start_listening()

    async def receive_events():
        nonlocal connection_active
        try:
            while connection_active:
                msg = await message_queue.get()
                await websocket.send_json(msg)
        except (RuntimeError, WebSocketDisconnect):
            logging.info("🟡 Connection closed during send.")
            connection_active = False

    async def receive_dashboard_commands():
        nonlocal connection_active
        try:
            while connection_active:
                message = await websocket.receive_text()
                logging.info(f"Received Command: {message}")
                
                payload = json.loads(message)
                
                if payload.get("type") == "COPILOT_QUERY":
                    bus.publish("copilot_queries", {"query": payload.get("query")})
                else:
                    bus.publish("dashboard_commands", payload)
                    
        except (WebSocketDisconnect, RuntimeError):
            logging.info("🔴 DASHBOARD DISCONNECTED")
            connection_active = False

    try:
        await asyncio.gather(
            receive_events(),
            receive_dashboard_commands()
        )
    except Exception:
        pass
    finally:
        bus.stop_listening()

if __name__ == "__main__":
    logging.info("🚀 SENTINEL X API GATEWAY RUNNING...")
    uvicorn.run(app, host="0.0.0.0", port=8000, loop="asyncio")
