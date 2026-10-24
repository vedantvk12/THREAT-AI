# Contributing to THREAT-AI / Sentinel-X

First off, thank you for considering contributing to **THREAT-AI (Sentinel-X Multi-Agent System)**! It's people like you who make open-source AI defense and situational awareness systems safer, faster, and more robust.

---

## 🛠️ Code of Conduct
By participating in this project, you agree to abide by respectful and inclusive communication. Please treat all contributors and users with dignity and professionalism.

---

## 🚀 How Can You Contribute?

### 1. Reporting Bugs
- Search existing GitHub Issues before submitting a new one.
- Provide a clear and concise description of the bug.
- Include reproduction steps, environment details (OS, Python version, GPU/CPU, browser), and relevant console/terminal logs.

### 2. Suggesting Enhancements
- Open a feature request with a title describing the suggested feature.
- Explain the motivation and use case (e.g., adding a new sensory agent, integrating additional camera streams, optimizing ST-GCN inference).

### 3. Pull Requests (PRs)
1. **Fork** the repository and create your branch from `main`:
   ```bash
   git checkout -b feature/amazing-agent
   ```
2. **Follow Coding Standards**:
   - Write clean, readable, PEP 8-compliant Python code.
   - For React/Vite code, run `npm run lint` and verify `npm run build` succeeds.
   - Do **NOT** commit hardcoded secrets, API keys, or large personal models/checkpoints.
3. **Test Your Changes**:
   - Verify that your agent subscribes/publishes to the ZMQ event bus without blocking other agents.
   - Ensure WebSocket messages match the expected schema in the React dashboard.
4. **Commit & Push**:
   ```bash
   git commit -m "feat(agent): add thermal vision sensor stream"
   git push origin feature/amazing-agent
   ```
5. **Open a Pull Request** describing your changes and link any related issues.

---

## 🏗️ Architecture Conventions

- **Sensory Agents**: Ingest external hardware/camera/sensor data and publish low-latency events (`vision_events`, `audio_events`).
- **Cognitive Agents**: Subscribe to telemetry, fuse multi-modal signals, query RAG/Knowledge Graph, and produce tactical recommendations.
- **Event Bus**: ZeroMQ XPUB/XSUB proxy broker on ports `5555` (Pub) / `5556` (Sub).
- **API Gateway**: FastAPI asynchronous WebSocket endpoint bridging Python EventBus and React 19 Frontend.

---

## 📄 License
By contributing, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
