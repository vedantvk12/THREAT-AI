import zmq
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')

def run_broker(pub_port=5555, sub_port=5556):
    """
    Central ZMQ XPUB/XSUB Broker for Event Bus.
    Agents publish to pub_port (5555).
    Agents subscribe to sub_port (5556).
    """
    context = zmq.Context()
    
    # XSUB socket to receive messages from publishers
    frontend = context.socket(zmq.XSUB)
    frontend.bind(f"tcp://*:{pub_port}")
    
    # XPUB socket to broadcast messages to subscribers
    backend = context.socket(zmq.XPUB)
    backend.bind(f"tcp://*:{sub_port}")
    
    logging.info(f"🚀 ZMQ Message Broker started.")
    logging.info(f"Receiving on port {pub_port}, Broadcasting on port {sub_port}")
    
    try:
        zmq.proxy(frontend, backend)
    except Exception as e:
        logging.error(f"Broker interrupted: {e}")
    finally:
        frontend.close()
        backend.close()
        context.term()

if __name__ == "__main__":
    run_broker()
