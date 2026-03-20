# 🌊 FloodGuard AI - ET AI Hackathon 2026

**FloodGuard AI** is an advanced, domain-specific AI Agent platform designed for real-time flood monitoring, prediction, and autonomous disaster response. Built for the **ET AI Hackathon 2026** (Problem Statement 5: Domain-Specialized AI Agents).

## 🚀 Key Features

- **Real-Time Data Sync**: Integrated with **Open-Meteo Weather & Flood APIs** for live telemetry from across India.
- **Agentic AI Command Center**: An autonomous AI agent that analyzes sensor data, reasons through complex scenarios (Chain of Thought), and executes emergency response protocols without human intervention.
- **Predictive Analytics**: Machine learning models that forecast water levels and flood risks 7 days in advance.
- **Interactive Map**: Live leaflet-based risk mapping with real-time severity indicators.
- **Compliance Guardrails**: Ensuring all autonomous actions adhere to regional safety and legal protocols.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, Shadcn/UI
- **Charts**: Recharts
- **Mapping**: React-Leaflet (OpenStreetMap)
- **Data**: Open-Meteo (Real-time Weather & Flood APIs)
- **Icons**: Lucide-React

## 📦 Setup & Installation

1.  **Clone the Repository**:
    ```bash
    git clone [repository-url]
    cd FloodGuard-AI-Platform/app
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

4.  **Environment Variables**:
    *Currently using free Open-Meteo APIs (no key required).* To add OpenWeatherMap or other services, create a `.env` file from `.env.example`.

## 🏆 Hackathon Alignment

This project specifically addresses **Problem Statement 5: Domain-Specialized AI Agents with Compliance Guardrails**. It demonstrates:
- **Full Task Completion**: From sensor monitoring to autonomous decision-making.
- **Multi-modal Inputs**: Weather patterns + River discharge levels.
- **Auditability**: Every AI decision is logged with clear reasoning and guardrail verification.

---
*Created for ET AI Hackathon 2026*
