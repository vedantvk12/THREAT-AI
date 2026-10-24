import zmq
import json
import logging
import threading
from typing import Callable

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')

class EventBus:
    """
    Centralized Pub/Sub communication for SENTINEL X Agents using ZMQ.
    Agents publish to port 5555, and subscribe to port 5556.
    """
    def __init__(self, pub_port=5555, sub_port=5556):
        self.context = zmq.Context()
        
        # Publish socket (Sends to Broker)
        self.pub_socket = self.context.socket(zmq.PUB)
        self.pub_socket.connect(f"tcp://localhost:{pub_port}")
        
        # Subscribe socket (Receives from Broker)
        self.sub_socket = self.context.socket(zmq.SUB)
        self.sub_socket.connect(f"tcp://localhost:{sub_port}")
        
        self.listeners = {}
        self.running = False
        self.listener_thread = None

    def publish(self, channel: str, message: dict):
        """Publish a dictionary message to a specific channel"""
        try:
            payload = json.dumps(message)
            self.pub_socket.send_multipart([channel.encode('utf-8'), payload.encode('utf-8')])
        except Exception as e:
            logging.error(f"Failed to publish to {channel}: {e}")

    def subscribe(self, channel: str, callback: Callable[[dict], None]):
        """Subscribe to a channel with a callback function"""
        self.listeners[channel] = callback
        self.sub_socket.setsockopt_string(zmq.SUBSCRIBE, channel)
        logging.info(f"Subscribed to channel: {channel}")

    def _listen_loop(self):
        while self.running:
            try:
                # Use poll for non-blocking check to allow graceful shutdown
                if self.sub_socket.poll(100):
                    channel, data = self.sub_socket.recv_multipart()
                    channel_str = channel.decode('utf-8')
                    payload_str = data.decode('utf-8')
                    
                    parsed = json.loads(payload_str)
                    if channel_str in self.listeners:
                        self.listeners[channel_str](parsed)
            except Exception as e:
                if self.running:
                    logging.error(f"Error in listener loop: {e}")

    def start_listening(self):
        """Starts listening in a background thread"""
        self.running = True
        self.listener_thread = threading.Thread(target=self._listen_loop, daemon=True)
        self.listener_thread.start()
        logging.info("ZMQ Event Bus listener thread started.")

    def stop_listening(self):
        """Stops the background listener"""
        self.running = False
        if self.listener_thread:
            self.listener_thread.join(timeout=1.0)
        self.pub_socket.close()
        self.sub_socket.close()
        self.context.term()
        logging.info("ZMQ Event Bus listener thread stopped.")
