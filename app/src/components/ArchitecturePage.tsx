
import { Network, Cpu, Database, ArrowRight, Shield, Wifi, BarChart3, Zap, Server, ShieldCheck, Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export function ArchitecturePage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 rounded-3xl glass-panel border-white/5 bg-mesh relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/20 flex items-center justify-center border border-violet-500/30 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              <Network className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase">System Architecture</h2>
              <p className="text-[10px] font-bold text-violet-400 uppercase tracking-[0.3em] mt-1">Multi-Agent Flood Intelligence Matrix — v1.0.4</p>
            </div>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed max-w-4xl font-medium">
            FloodGuard AI utilizes a bio-inspired layered multi-agent architecture as specified in ET AI Hackathon Problem Statement 5. 
            By decoupling ingestion from reasoning and action through a secure guardrail layer, we achieve high-fidelity 
            autonomous flood mitigation with a verifiable audit trail.
          </p>
        </div>
      </motion.div>

      {/* Agent Roles */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          {
            name: 'Sensor Node',
            role: 'INGESTION',
            desc: 'Polls Open-Meteo & IMD APIs at 60s intervals. Normalizes heterogeneous telemetry into the Unified Water Schema.',
            tools: ['Open-Meteo SDK', 'IMD Radar', 'Satellite SAR'],
            color: 'cyan',
            icon: Wifi,
          },
          {
            name: 'Hazard Core',
            role: 'REASONING',
            desc: 'Orchestrates LLaMA 3.3 70B via Groq for predictive chain-of-thought analysis. Models hydrological risk tiers.',
            tools: ['LLaMA 3.3 (Groq)', 'Monte Carlo SIM', 'QPF Forecast'],
            color: 'violet',
            icon: Cpu,
          },
          {
            name: 'Action Agent',
            role: 'EXECUTION',
            desc: 'Autonomous dispatcher for emergency protocols: SMS/WhatsApp routing, NDRF alerts, and reservoir gate logic.',
            tools: ['Alert Gateway', 'NDMA API', 'IoT Controller'],
            color: 'amber',
            icon: Zap,
          },
          {
            name: 'Guardrail Sentinel',
            role: 'COMPLIANCE',
            desc: 'Zero-trust verification engine. Validates actions against NDMA protocols & State DM Act before deployment.',
            tools: ['Policy Engine', 'Audit Ledger', 'Secure Signer'],
            color: 'emerald',
            icon: ShieldCheck,
          },
        ].map(agent => {
          const Icon = agent.icon;
          const colors = {
            cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20 shadow-cyan-900/10',
            violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20 shadow-violet-900/10',
            amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-amber-900/10',
            emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-900/10',
          }[agent.color as keyof typeof colors];

          return (
            <motion.div variants={item} key={agent.name}>
              <Card className="glass-card border-white/5 h-full relative overflow-hidden group">
                <div className={`absolute top-0 left-0 w-1 h-full ${agent.color === 'cyan' ? 'bg-cyan-500/50' : agent.color === 'violet' ? 'bg-violet-500/50' : agent.color === 'amber' ? 'bg-amber-500/50' : 'bg-emerald-500/50'}`} />
                <CardHeader className="pb-3">
                  <div className={`w-10 h-10 rounded-xl ${colors} border flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-white text-base font-black tracking-tight">{agent.name}</CardTitle>
                  <Badge variant="outline" className={`text-[9px] font-black tracking-widest px-2 py-0 border-current ${colors.split(' ')[0]} w-fit`}>{agent.role}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4 font-medium">{agent.desc}</p>
                  <div className="space-y-2">
                    {agent.tools.map(t => (
                      <div key={t} className="flex items-center gap-2">
                        <ArrowRight className="w-2.5 h-2.5 text-slate-700" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{t}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Communication Flow */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="glass-panel border-white/5 overflow-hidden">
          <CardHeader className="border-b border-white/5 py-6">
            <CardTitle className="text-white text-xl font-black tracking-tight flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-cyan-400" />
              INTELLIGENT COMMUNICATION PIPELINE
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex flex-wrap items-center gap-6 justify-between relative mb-12 px-4">
              <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-800 to-transparent -translate-y-1/2 z-0 hidden md:block" />
              {[
                { label: 'ENVIRONMENT', sub: 'RIVERS/WEATHER', icon: Server, color: 'bg-blue-500/20 border-blue-500/30' },
                { label: 'COLLECTION', sub: 'SENSOR NODE', icon: Wifi, color: 'bg-cyan-500/20 border-cyan-500/30' },
                { label: 'REASONING', sub: 'HAZARD CORE', icon: Brain, color: 'bg-violet-500/20 border-violet-500/30' },
                { label: 'VALIDATION', sub: 'GUARD SENTINEL', icon: Shield, color: 'bg-emerald-500/20 border-emerald-500/30' },
                { label: 'EXECUTION', sub: 'ACTION AGENT', icon: Zap, color: 'bg-amber-500/20 border-amber-500/30' },
              ].map((item, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center group">
                  <div className={`w-14 h-14 rounded-2xl ${item.color} border shadow-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform backdrop-blur-md`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-[10px] font-black text-white uppercase tracking-widest">{item.label}</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter mt-1">{item.sub}</p>
                </div>
              ))}
            </div>

            {/* Tactical Error Handling */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'API FAILSAFE RECOVERY', desc: 'Sensor nodes utilize exponential backoff for API retries. Stale telemetry is flagged with a red bit, triggering last-known-value fallback reasoning.' },
                { title: 'VALIDATION GUARDRAILS', desc: 'Reasoning agents must hit an 85% confidence floor across ≥2 sources before triggering autonomous evacuation advisories to emergency responders.' },
                { title: 'SECURE AUDIT PERSISTENCE', desc: 'Every agent interaction is timestamped and cryptographically signed in the central log matrix, ensuring NDMA compliance and 100% auditability.' },
              ].map(item => (
                <div key={item.title} className="p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                  <p className="text-[10px] font-black text-violet-400 mb-2 flex items-center gap-2 uppercase tracking-widest">
                    <ShieldCheck className="w-4 h-4" /> {item.title}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tech Stack */}
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}>
        <Card className="glass-panel border-white/5 overflow-hidden">
          <CardHeader className="border-b border-white/5 py-4">
            <CardTitle className="text-white text-sm font-black flex items-center gap-2 uppercase tracking-widest text-slate-400">
              <Database className="w-4 h-4 text-emerald-500" />
              INTEGRATED TECHNOLOGY STACK
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { category: 'AI ORCHESTRATION', items: ['Groq LLaMA 3.3 70B', 'Neural Reasoning Chain', 'Structured CoT Engine'] },
                { category: 'DATA PIPELINE', items: ['Open-Meteo Flood API', 'IMD Radar Feeds', 'CWC Hydrological Data'] },
                { category: 'FRONTEND COMMAND', items: ['React 19 / TypeScript', 'Tailwind / Framer Motion', 'Recharts / Leaflet'] },
                { category: 'COMPLIANCE', items: ['PDF Situation Reports', 'GDPR/NDMA Audit Logs', 'Zero-Trust Sentinel'] },
              ].map(stack => (
                <div key={stack.category}>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">{stack.category}</p>
                  <div className="space-y-2">
                    {stack.items.map(i => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-emerald-500/50" />
                        <span className="text-[11px] text-slate-400 font-bold">{i}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
