# Start Sentinel X Multi-Agent System

$PythonCmd = if (Test-Path ".\venv\Scripts\python.exe") { ".\venv\Scripts\python.exe" } else { "python" }
Write-Host "Using Python: $PythonCmd" -ForegroundColor Cyan

Write-Host "Starting ZMQ Event Broker..." -ForegroundColor Cyan
Start-Process -FilePath $PythonCmd -ArgumentList "core\broker.py" -WindowStyle Minimized

Start-Sleep -Seconds 2

Write-Host "Starting API Gateway..." -ForegroundColor Cyan
Start-Process -FilePath $PythonCmd -ArgumentList "gateway\main.py" -WindowStyle Minimized

Write-Host "Starting Cognitive Agents..." -ForegroundColor Yellow
Start-Process -FilePath $PythonCmd -ArgumentList "agents\commander_agent.py" -WindowStyle Minimized
Start-Process -FilePath $PythonCmd -ArgumentList "agents\rag_agent.py" -WindowStyle Minimized
Start-Process -FilePath $PythonCmd -ArgumentList "agents\knowledge_graph_agent.py" -WindowStyle Minimized
Start-Process -FilePath $PythonCmd -ArgumentList "agents\prediction_agent.py" -WindowStyle Minimized
Start-Process -FilePath $PythonCmd -ArgumentList "agents\tactical_agent.py" -WindowStyle Minimized

Write-Host "Starting Sensory Agents (These may open windows)..." -ForegroundColor Green
Start-Process -FilePath $PythonCmd -ArgumentList "agents\geospatial_agent.py" -WindowStyle Minimized
Start-Process -FilePath $PythonCmd -ArgumentList "agents\vision_agent.py"
# Uncomment if you have a microphone plugged in:
# Start-Process -FilePath $PythonCmd -ArgumentList "agents\audio_agent.py"

Write-Host "All backend agents launched!" -ForegroundColor Green
Write-Host "Make sure your frontend is running (cd sentinel-dashboard && npm run dev)" -ForegroundColor White
