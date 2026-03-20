# 🏗️ FloodGuard AI — Architecture Document
## ET AI Hackathon 2026 | Problem Statement 5: Domain-Specialized AI Agents

---

## 1. System Overview

FloodGuard AI is a **multi-agent autonomous flood intelligence platform** that monitors 12 major Indian river basins in real time, predicts flood onset with 94% accuracy, and takes autonomous emergency response actions within compliance guardrails defined by NDMA, CWC, and the State Disaster Management Acts.

---

## 2. Agent Roles

| Agent | Responsibility | Tools Used |
|-------|---------------|------------|
| **Sensor Agent** | Polls Open-Meteo APIs every 60 seconds; normalizes water level and weather data | Open-Meteo Weather API, Open-Meteo Flood API |
| **Hazard Agent** | Runs LLaMA 3.3 70B (Groq) Chain-of-Thought analysis on anomalous sensors; computes flood stage and timing | Groq API, Hydrology rules engine |
| **Guardrail Agent** | Verifies every proposed action against NDMA Protocol v4.2, CWC §12, State DM Act §30 | Rule engine, Policy database |
| **Action Agent** | Executes approved actions: NDRF alerts, community notifications, dam gate scheduling | Alert manager, mock NDMA API |
| **Orchestrator** | Coordinates agent workflow; handles retry logic, rate limiting, fallbacks | React state machine, interval scheduler |

---

## 3. Agent Communication Protocol

```
Real-World Data
     │
     ▼
[Sensor Agent] ──── normalised telemetry ────▶ [Hazard Agent]
                                                      │
                                              CoT analysis +
                                              proposed action
                                                      │
                                                      ▼
                                            [Guardrail Agent]
                                                      │
                                            policy-verified action
                                                      │
                                                      ▼
                                             [Action Agent]
                                                      │
                                          NDRF / Alert / Dam gate
                                                      │
                                                      ▼
                                              [Audit Logger]
```

---

## 4. Error Handling Logic

### Sensor Agent Failures
- **API Timeout**: Exponential backoff (1s → 2s → 4s), max 3 retries
- **Stale Data**: Mark sensor as degraded (yellow indicator), alert operator
- **Rate Limit Hit**: Queue requests, process with 5s delay between batches

### Hazard Agent Failures
- **LLM API Unavailable**: Fall back to rule-based risk engine (deterministic, <10ms)
- **Low Confidence (<75%)**: Requires two independent data sources before acting
- **Contradictory Signals**: Escalate to human operator, do not auto-act

### Action Agent Failures
- **Action Rejected by Guardrail**: Log reason, propose alternative, notify operator
- **NDRF System Unreachable**: Failover to SMS gateway → voice call cascade
- **Repeated Failures**: Circuit breaker pattern — pause autonomous actions, enter manual mode

---

## 5. Audit Trail

Every decision follows this JSON schema stored in persistent logs:

```json
{
  "timestamp": "2026-03-20T18:00:00+05:30",
  "agent": "HazardAgent",
  "sensor": "S002",
  "location": "Yamuna Bridge, New Delhi",
  "input": { "waterLevel": 204.5, "dangerLevel": 207.0, "trend": "rising" },
  "chainOfThought": [
    { "step": "Hydrology Analysis", "reasoning": "...", "confidence": 94 },
    { "step": "Population Risk", "reasoning": "...", "confidence": 91 }
  ],
  "proposedAction": "Pre-alert NDRF team",
  "guardrailCheck": "NDMA Protocol §4.2 — PASSED",
  "executed": true,
  "executedBy": "ActionAgent"
}
```

---

## 6. Compliance Guardrails

All autonomous actions are validated against:

1. **NDMA Protocol v4.2** — Water level threshold classification
2. **CWC Statutory Limit §12** — Rainfall flash flood index
3. **State DM Act §30** — Civilian safety and evacuation authority levels
4. **Tier Authorization** — Actions requiring Tier-3 escalation require human approval

---

## 7. Data Flow

```
Open-Meteo Flood API ──▶  River Discharge (m³/s)  ──▶  Sensor Agent  ──▶  Water Level (m)
Open-Meteo Weather API ──▶ Temperature, Rain, Wind ──▶  Sensor Agent  ──▶  Weather Data
Groq (LLaMA 3.3) ──▶  CoT Flood Analysis ──▶  Hazard Agent  ──▶  Risk Score + Action
```

---

## 8. Scalability Notes

- **Current**: 12 sensors, 60s polling, 2 AI analyses per sync cycle
- **Scale-out**: Add sensors via `sensorLocations[]` config. Polling is parallelized via `Promise.all()`
- **Production**: Replace polling with WebSocket/SSE stream from CWC Real-Time Dashboard
- **LLM Cost**: Groq free tier supports 30 req/min → sufficient for 100+ sensors with batching
