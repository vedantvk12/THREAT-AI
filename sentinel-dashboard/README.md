# 🖥️ Sentinel Tactical Operations Dashboard

The frontend command-and-control dashboard for **THREAT-AI / Sentinel-X**. Built with **React 19**, **Three.js**, **React Three Fiber**, **Tailwind CSS**, and **Framer Motion**.

---

## 🚀 Features

- **🌐 3D Digital Twin Viewport**: Real-time rendering of indoor sectors, tracked person avatars, and threat zones using `@react-three/fiber` and `@react-three/drei`.
- **📈 Time-Series Threat Forecast**: Interactive predictive risk curve with uncertainty boundaries powered by `recharts`.
- **💬 Real-Time Tactical Copilot**: Full-duplex WebSocket chat connected to Llama 3.3 70B via the Python API Gateway.
- **⚡ Command Palette & Quick Actions**: Fast keyboard-driven command overlay (`Ctrl+K` / `Cmd+K`) using `cmdk` for emergency lockdowns, resets, and sensor toggles.
- **🛡️ Explainable AI (XAI) Panel**: Real-time breakdown of confidence scores, kinematic triggers, and acoustic classifications.
- **🔔 Notification Center & Incident Logs**: Real-time incident logs and operational history feed.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev) + [Vite](https://vite.dev)
- **3D Graphics**: [Three.js](https://threejs.org) + [React Three Fiber](https://r3f.docs.pmnd.rs)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) + Custom Cyberpunk Tokens
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev)
- **Data Visualization**: [Recharts](https://recharts.org)

---

## 🚦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Development Server
```bash
npm run dev
```
Dashboard will be available at `http://localhost:5173`.

### 3. Production Build
```bash
npm run build
npm run preview
```

---

## 🔌 WebSocket Connection

The dashboard automatically attempts to connect to the API Gateway at `ws://localhost:8000/ws` with exponential backoff and reconnection handling managed by `useThreatSocket.js`.
