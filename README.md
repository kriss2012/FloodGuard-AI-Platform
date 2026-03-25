# 🌊 FloodGuard AI — ET AI Hackathon 2026

> **Problem Statement 5**: Domain-Specialized AI Agents with Compliance Guardrails  
> *Agriculture/Disaster Management Domain*  
> Live Demo: [https://floodlive.netlify.app](https://floodlive.netlify.app)

---

## 🚀 What It Does

FloodGuard AI is an **autonomous, multi-agent flood intelligence platform** for India. It continuously monitors 12 major river basins with live sensor data, runs AI-powered flood risk analysis using LLaMA 3.3 70B, and executes emergency response actions — all within NDMA compliance guardrails.

### Key Capabilities
| Feature | Details |
|---------|---------|
| **Real-Time Telemetry** | Open-Meteo Weather + Flood APIs, 60s polling across 12 Indian stations |
| **AI Risk Analysis** | Groq (LLaMA 3.3 70B) Chain-of-Thought reasoning per sensor |
| **Autonomous Actions** | NDRF pre-alerts, evacuation advisories, dam gate scheduling; **Crisis Protocol §NDMA** | 
| **Compliance Guardrails** | Multi-agent handshake verified against NDMA §4.2, CWC §12, State DM Act §30 | 
| **Full Auditability** | Timestamped agent log with full CoT trace; Situational Report (PDF/CSV) | 
| **v4.0 Roadmap** | Sat-Link, Edge-AI, and Hydrological Digital Twin integration |

---

## 🛠️ Quick Start

```bash
git clone https://github.com/kriss2012/FloodGuard-AI-Platform
cd FloodGuard-AI-Platform/app
npm install
cp .env.example .env          # Add Groq key for real AI (optional)
npm run dev                    # → http://localhost:5173
```

**Zero required API keys** — Open-Meteo is free, no authentication needed.  
Add your free [Groq API key](https://console.groq.com) to `.env` for real LLM reasoning.

---

## 📐 Architecture

See [ARCHITECTURE.md](../ARCHITECTURE.md) for the full 2-page architecture document covering:
- Agent roles (Sensor, Hazard, Guardrail, Action, Orchestrator)
- Communication protocol and data flow diagram
- Error handling and audit trail schema
- Compliance guardrail specifications

**Quick Summary:**
```
Open-Meteo APIs → Sensor Agent → Hazard Agent (LLaMA 3.3)
                                      ↓
                              Guardrail Agent (NDMA rules)
                                      ↓
                               Action Agent (NDRF/Alerts)
                                      ↓
                                 Audit Logger
```

---

## 📊 Impact Model

See [IMPACT_MODEL.md](../IMPACT_MODEL.md) for the full quantified business case.

**Bottom line:**
- ₹290–600 Cr/year in flood damage prevention (12 districts)
- 190+ lives/year from improved early warning
- 93% faster alert generation (4h → 15min)
- ₹0/month infrastructure cost (all free-tier APIs)

---

## 🗂️ Submission Requirements

| Item | Status | Link |
|------|--------|------|
| GitHub Repository | ✅ Public | This repo |
| Architecture Document | ✅ Complete | [ARCHITECTURE.md](../ARCHITECTURE.md) |
| Impact Model | ✅ Quantified | [IMPACT_MODEL.md](../IMPACT_MODEL.md) |
| 3-Min Pitch Video | 🎬 Record demo from live site | [floodlive.netlify.app](https://floodlive.netlify.app) |
| Working Demo | ✅ Live | [floodlive.netlify.app](https://floodlive.netlify.app) |

---

## 📦 Tech Stack

- **Frontend**: React 19, TypeScript, Vite 7
- **UI**: Tailwind CSS + Shadcn/UI, Lucide icons
- **Charts**: Recharts (area, bar, radar)
- **Map**: React-Leaflet with CartoDB Dark tiles
- **AI**: Groq API — LLaMA 3.3 70B (free tier)
- **Data**: Open-Meteo Weather + Flood APIs (completely free)
- **Export**: jsPDF + html2canvas, native CSV

---

## 🏆 Hackathon Alignment (PS #5)

| Criterion | How We Address It |
|-----------|-------------------|
| **Domain expertise depth** | Hydrology-aware thresholds, NDMA/CWC protocol integration |
| **Compliance & guardrails** | 3-layer policy check + Autonomous Crisis Protocol §NDMA §4.2 | 
| **Edge-case handling** | API fallback engine, false-positive detection, low-confidence hold |
| **Full task completion** | End-to-end: detect → analyze → decide → act → audit |
| **Auditability** | Full CoT log visible in UI + JSON audit trail per decision |

---

*Built with ❤️ for ET AI Hackathon 2026*
