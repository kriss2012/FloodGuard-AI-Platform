
import { useState, useEffect } from 'react';
import { Brain, Terminal, ShieldCheck, Zap, AlertCircle, CheckCircle, Clock, Radio, RefreshCw, Layers, Cpu, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import type { AgentLog } from '@/hooks/useRealTimeData';

interface AgentPanelProps {
  logs: AgentLog[];
  isLoading: boolean;
  onRefresh: () => void;
}

const LOG_ICONS: Record<AgentLog['type'], { icon: typeof Brain; color: string; glow: string }> = {
  reasoning: { icon: Brain, color: 'text-violet-400', glow: 'shadow-[0_0_8px_rgba(167,139,250,0.3)]' },
  action:    { icon: Zap, color: 'text-amber-400', glow: 'shadow-[0_0_8px_rgba(251,191,36,0.3)]' },
  guardrail: { icon: ShieldCheck, color: 'text-emerald-400', glow: 'shadow-[0_0_8px_rgba(52,211,153,0.3)]' },
  alert:     { icon: AlertCircle, color: 'text-red-400', glow: 'shadow-[0_0_8px_rgba(248,113,113,0.3)]' },
  success:   { icon: CheckCircle, color: 'text-cyan-400', glow: 'shadow-[0_0_8px_rgba(34,211,238,0.3)]' },
};

const AI_MONOLOGUES = [
  'CROSS-REFERENCING DISCHARGE DATA WITH 6-HOUR QPF FORECAST...',
  'APPLYING CWC FLOOD STAGE CLASSIFICATION PROTOCOLS...',
  'EVALUATING EVACUATION ROUTE CAPACITY VS. AT-RISK POPULATION...',
  'CORRELATING UPSTREAM RESERVOIR LEVELS WITH DOWNSTREAM FLOW...',
  'RUNNING MONTE CARLO SIMULATION FOR FLOOD PEAK ESTIMATION...',
  'CHECKING NDMA EARLY WARNING SYSTEM ALIGNMENT...',
  'VALIDATING SENSOR TELEMETRY AGAINST SATELLITE IMAGERY...',
  'COMPUTING SOIL MOISTURE INDEX FOR INFILTRATION CAPACITY...',
];

export function AgentPanel({ logs, isLoading, onRefresh }: AgentPanelProps) {
  const [monologue, setMonologue] = useState(AI_MONOLOGUES[0]);
  const [confidence, setConfidence] = useState(91.4);
  const [pulsing, setPulsing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setMonologue(AI_MONOLOGUES[Math.floor(Math.random() * AI_MONOLOGUES.length)]);
      setConfidence(88 + Math.random() * 10);
      setPulsing(true);
      setTimeout(() => setPulsing(false), 800);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="h-full glass-panel border-white/5 overflow-hidden flex flex-col">
      <CardHeader className="pb-4 border-b border-white/5 bg-slate-900/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              animate={pulsing ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
              className={`w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.2)]`}
            >
              <Brain className="w-5 h-5 text-cyan-400" />
            </motion.div>
            <div>
              <CardTitle className="text-sm font-black text-white tracking-widest uppercase">Autonomous Agent Matrix</CardTitle>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] font-bold text-emerald-400 tracking-tighter uppercase shrink-0">Node Active — LLaMA 3.3 70B</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onRefresh} 
            disabled={isLoading}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 text-slate-500 hover:text-cyan-400 transition-all border border-transparent hover:border-white/10"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Cinematic Internal Monologue */}
        <div className="mt-4 p-3 bg-black/40 border border-white/5 rounded-xl backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-violet-500/50 group-hover:bg-violet-400 transition-colors" />
          <div className="flex items-center gap-2 mb-2">
            <Terminal className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-[10px] font-black text-violet-400 uppercase tracking-[0.2em]">Neural Chain of Thought</span>
          </div>
          <p className="text-[11px] text-slate-300 font-mono leading-relaxed min-h-[32px] animate-typing overflow-hidden whitespace-nowrap border-r-2 border-violet-400 pr-1">
            {monologue}
          </p>
        </div>

        {/* Multi-Agent Coordination View */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: 'Ingestion', icon: Layers, val: 'OK', color: 'text-cyan-400', bg: 'bg-cyan-500/5' },
            { label: 'Reasoning', icon: Cpu, val: `${confidence.toFixed(1)}%`, color: 'text-violet-400', bg: 'bg-violet-500/5' },
            { label: 'Guardrail', icon: Shield, val: 'PASS', color: 'text-emerald-400', bg: 'bg-emerald-500/5' },
          ].map(m => (
            <div key={m.label} className={`flex flex-col items-center p-2 rounded-xl border border-white/5 ${m.bg}`}>
              <m.icon className={`w-3.5 h-3.5 ${m.color} mb-1.5`} />
              <p className={`text-xs font-black tracking-tighter ${m.color}`}>{m.val}</p>
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{m.label}</p>
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 flex flex-col min-h-0">
        <div className="px-4 py-2 border-b border-white/5 bg-slate-900/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-3 h-3 text-amber-500 animate-pulse" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tactical Logic Stream</span>
          </div>
          <Badge className="text-[9px] font-black tracking-tighter py-0 px-2 bg-white/5 text-slate-500 border-white/10 uppercase">
            {logs.length} Operations logged
          </Badge>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            <AnimatePresence mode="popLayout">
              {logs.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-slate-700"
                >
                  <Brain className="w-8 h-8 mb-2 animate-pulse" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Awaiting system telemetry...</p>
                </motion.div>
              )}
              {logs.map((log, idx) => {
                const { icon: Icon, color, glow } = LOG_ICONS[log.type];
                return (
                  <motion.div 
                    layout
                    key={`${log.id}-${idx}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex gap-4 group relative"
                  >
                    <div className="relative">
                      <div className={`w-8 h-8 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center shrink-0 ${glow}`}>
                        <Icon className={`w-4 h-4 ${color}`} />
                      </div>
                      {idx !== logs.length - 1 && (
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[1px] h-4 bg-white/5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${color}`}>{log.type}</span>
                        <div className="flex items-center gap-1 text-[9px] font-bold text-slate-600 uppercase">
                          <Clock className="w-2.5 h-2.5" />{log.timestamp}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-medium group-hover:text-slate-200 transition-colors">{log.message}</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
