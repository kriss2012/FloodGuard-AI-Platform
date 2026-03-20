
import { Network, Cpu, Database, ArrowRight, ArrowDown, Shield, Wifi, BarChart3, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ArchitecturePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-900/30 to-indigo-900/30 border border-violet-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <Network className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">System Architecture</h2>
            <p className="text-sm text-slate-400">Multi-Agent Flood Intelligence Platform — ET AI Hackathon 2026</p>
          </div>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed max-w-4xl">
          FloodGuard AI uses a layered multi-agent architecture inspired by supply chain intelligence agents (Problem Statement 5). 
          Specialized agents handle data ingestion, hazard reasoning, autonomous action execution, and compliance verification — 
          all orchestrated by a central dispatcher with full auditability.
        </p>
      </div>

      {/* Agent Roles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            name: 'Sensor Agent',
            role: 'Data Ingestion',
            desc: 'Polls Open-Meteo Weather & Flood APIs every 60s for all 12 sensor stations. Normalizes and validates telemetry.',
            tools: ['Open-Meteo API', 'CWC WebAPI', 'IMD Radar'],
            color: 'cyan',
            icon: Wifi,
          },
          {
            name: 'Hazard Agent',
            role: 'Risk Reasoning',
            desc: 'Runs LLaMA 3.3 70B via Groq API to produce chain-of-thought flood risk analysis. Computes flood peak timing.',
            tools: ['Groq (LLaMA 3.3)', 'Hydrology Models', 'Monte Carlo Sim'],
            color: 'violet',
            icon: Cpu,
          },
          {
            name: 'Action Agent',
            role: 'Autonomous Execution',
            desc: 'Executes approved emergency actions: alert routing, NDRF notification, evacuation advisory, dam gate scheduling.',
            tools: ['NDMA API', 'SMS Gateway', 'Alert Manager'],
            color: 'amber',
            icon: AlertTriangle,
          },
          {
            name: 'Guardrail Agent',
            role: 'Compliance Verification',
            desc: 'Verifies every action against NDMA protocols, CWC guidelines, and State DM Act before execution.',
            tools: ['Rule Engine', 'Audit Logger', 'Policy DB'],
            color: 'emerald',
            icon: Shield,
          },
        ].map(agent => {
          const Icon = agent.icon;
          const colorMap: Record<string, string> = {
            cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
            violet: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
            amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
            emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
          };
          return (
            <Card key={agent.name} className={`bg-slate-900/60 border-slate-700/50 hover:border-slate-600 transition-all`}>
              <CardHeader className="pb-2">
                <div className={`w-9 h-9 rounded-lg ${colorMap[agent.color]} border flex items-center justify-center mb-2`}>
                  <Icon className="w-4 h-4" />
                </div>
                <CardTitle className="text-sm text-white">{agent.name}</CardTitle>
                <Badge variant="outline" className={`text-[10px] w-fit ${colorMap[agent.color]} border`}>{agent.role}</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{agent.desc}</p>
                <div className="space-y-1">
                  {agent.tools.map(t => (
                    <div key={t} className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-slate-600" />
                      <span className="text-[10px] text-slate-500">{t}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Communication Flow */}
      <Card className="bg-slate-900/60 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Agent Communication Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3 mb-6 justify-center md:justify-start">
            {[
              { label: 'Real-World Data', sub: 'Rivers, Weather, Radar', color: 'bg-blue-500' },
              { arrow: true },
              { label: 'Sensor Agent', sub: 'API polling, Normalizer', color: 'bg-cyan-500' },
              { arrow: true },
              { label: 'Hazard Agent', sub: 'LLM Reasoning, CoT', color: 'bg-violet-500' },
              { arrow: true },
              { label: 'Guardrail Agent', sub: 'Policy Check, Audit', color: 'bg-emerald-500' },
              { arrow: true },
              { label: 'Action Agent', sub: 'NDRF, Alerts, Dams', color: 'bg-amber-500' },
            ].map((item, i) => {
              if ('arrow' in item) {
                return <ArrowRight key={i} className="w-4 h-4 text-slate-600 hidden md:block" />;
              }
              return (
                <div key={i} className="text-center">
                  <div className={`w-3 h-3 rounded-full ${item.color} mx-auto mb-1`} />
                  <p className="text-xs font-semibold text-white">{item.label}</p>
                  <p className="text-[10px] text-slate-500">{item.sub}</p>
                </div>
              );
            })}
          </div>

          {/* Error Handling */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'API Failure Recovery', desc: 'Sensor Agent retries with exponential backoff. Falls back to last-known values with staleness indicator. Alerts human operator after 3 consecutive failures.' },
              { title: 'False Positive Guardrails', desc: 'Hazard Agent cross-validates with ≥2 independent data sources before triggering critical alerts. Requires 85%+ confidence threshold for autonomous action.' },
              { title: 'Audit Trail', desc: 'Every agent decision is timestamped, attributed, and stored. Full chain-of-thought captured in structured JSON. Compliant with NDMA Record-Keeping Directive 2024.' },
            ].map(item => (
              <div key={item.title} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/40">
                <p className="text-xs font-semibold text-amber-400 mb-1.5 flex items-center gap-1.5">
                  <Shield className="w-3 h-3" /> {item.title}
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tech Stack */}
      <Card className="bg-slate-900/60 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white text-base flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            Technology Stack & Open-Source APIs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { category: 'AI/LLM', items: ['Groq API (Free)', 'LLaMA 3.3 70B', 'Fallback reasoning engine'] },
              { category: 'Data APIs', items: ['Open-Meteo Weather (Free)', 'Open-Meteo Flood (Free)', 'OpenStreetMap'] },
              { category: 'Frontend', items: ['React 19 + TypeScript', 'Tailwind CSS + Shadcn', 'Recharts + Leaflet'] },
              { category: 'Auth / Export', items: ['PDF via jsPDF', 'CSV export', 'Real-time WebSocket ready'] },
            ].map(stack => (
              <div key={stack.category} className="p-3 bg-slate-800/40 rounded-lg">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{stack.category}</p>
                {stack.items.map(item => (
                  <div key={item} className="flex items-center gap-1.5 mb-1">
                    <ArrowDown className="w-2 h-2 text-slate-600 rotate-[-90deg]" />
                    <span className="text-[11px] text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
