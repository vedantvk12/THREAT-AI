#!/usr/bin/env bash
# ==============================================================================
# SENTINEL X / THREAT-AI — Multi-Agent Launch Script for Linux / macOS
# ==============================================================================

set -e

# Detect Python interpreter
if [ -f "./venv/bin/python" ]; then
    PYTHON_CMD="./venv/bin/python"
elif command -v python3 &>/dev/null; then
    PYTHON_CMD="python3"
else
    PYTHON_CMD="python"
fi

echo "🚀 Using Python: $PYTHON_CMD"

# 1. Start ZMQ Event Broker
echo "📡 Starting ZMQ Event Broker..."
$PYTHON_CMD core/broker.py > broker.log 2>&1 &
BROKER_PID=$!
sleep 2

# 2. Start API Gateway
echo "🌐 Starting API Gateway..."
$PYTHON_CMD gateway/main.py > gateway.log 2>&1 &
GATEWAY_PID=$!
sleep 1

# 3. Start Cognitive Agents
echo "🧠 Starting Cognitive Agents..."
$PYTHON_CMD agents/commander_agent.py > commander.log 2>&1 &
$PYTHON_CMD agents/rag_agent.py > rag.log 2>&1 &
$PYTHON_CMD agents/knowledge_graph_agent.py > kg.log 2>&1 &
$PYTHON_CMD agents/prediction_agent.py > prediction.log 2>&1 &
$PYTHON_CMD agents/tactical_agent.py > tactical.log 2>&1 &

# 4. Start Sensory Agents
echo "👁️ Starting Sensory Agents..."
$PYTHON_CMD agents/geospatial_agent.py > geo.log 2>&1 &
$PYTHON_CMD agents/vision_agent.py &

# Optional: Audio Agent (requires sound input device)
# $PYTHON_CMD agents/audio_agent.py &

echo "✅ All backend agents started in background!"
echo "👉 Launch dashboard: cd sentinel-dashboard && npm run dev"
echo "👉 Press Ctrl+C in this terminal or run 'killall python3' to stop."

trap "kill 0" EXIT
wait
