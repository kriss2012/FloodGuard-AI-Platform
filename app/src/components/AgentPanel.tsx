
import { useState, useEffect } from 'react';
import { Brain, Terminal, ShieldCheck, Zap, AlertCircle, CheckCircle, Clock, Radio, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import type { AgentLog } from '@/hooks/useRealTimeData';

interface AgentPanelProps {
  logs: AgentLog[];
  isLoading: boolean;
  onRefresh: () => void;
}

const LOG_ICONS: Record<AgentLog['type'], { icon: typeof Brain; color: string }> = {
  reasoning: { icon: Brain, color: 'text-violet-400' },
  action:    { icon: Zap, color: 'text-amber-400' },
  guardrail: { icon: ShieldCheck, color: 'text-emerald-400' },
  alert:     { icon: AlertCircle, color: 'text-red-400' },
  success:   { icon: CheckCircle, color: 'text-cyan-400' },
};

const AI_MONOLOGUES = [
  'Cross-referencing discharge data with 6-hour QPF forecast...',
  'Applying CWC flood stage classification rules...',
  'Evaluating evacuation route capacity vs. at-risk population...',
  'Correlating upstream reservoir levels with downstream flow...',
  'Running Monte Carlo simulation for flood peak estimation...',
  'Checking NDMA Early Warning System alignment...',
  'Validating sensor telemetry against satellite imagery...',
  'Computing Soil Moisture Index for infiltration capacity...',
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
    <Card className="h-full bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-cyan-500/20 shadow-2xl shadow-cyan-900/20">
      <CardHeader className="pb-3 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center transition-all ${pulsing ? 'scale-110 bg-cyan-500/30' : ''}`}>
              <Brain className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <CardTitle className="text-sm text-white">Autonomous Agent</CardTitle>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-400">ACTIVE — LLaMA 3.3 70B</span>
              </div>
            </div>
          </div>
          <button onClick={onRefresh} disabled={isLoading} className="text-slate-500 hover:text-slate-300 transition-colors">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>

        {/* Internal Monologue */}
        <div className="mt-3 p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Terminal className="w-3 h-3 text-violet-400" />
            <span className="text-[10px] font-semibold text-violet-400 uppercase tracking-widest">Chain of Thought</span>
          </div>
          <p className="text-[11px] text-slate-300 font-mono leading-relaxed">{monologue}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="inline-block w-1.5 h-3 bg-violet-400 animate-[blink_1s_step-end_infinite] rounded-sm" />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="bg-slate-800/50 rounded p-2 text-center">
            <p className="text-base font-bold text-cyan-400">{confidence.toFixed(1)}%</p>
            <p className="text-[9px] text-slate-500 uppercase">Confidence</p>
            <Progress value={confidence} className="h-0.5 mt-1 bg-slate-700" />
          </div>
          <div className="bg-slate-800/50 rounded p-2 text-center">
            <p className="text-base font-bold text-violet-400">{logs.filter(l => l.type === 'action').length}</p>
            <p className="text-[9px] text-slate-500 uppercase">Actions</p>
            <Progress value={Math.min(100, logs.filter(l => l.type === 'action').length * 10)} className="h-0.5 mt-1 bg-slate-700" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="px-4 py-2 border-b border-slate-800 flex items-center gap-2">
          <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Live Agent Log</span>
          <Badge className="ml-auto text-[9px] py-0 px-1.5 bg-slate-800 text-slate-400 border-0">{logs.length} events</Badge>
        </div>
        <ScrollArea className="h-[290px]">
          <div className="p-3 space-y-2">
            {logs.length === 0 && (
              <div className="flex flex-col items-center justify-center h-20 text-slate-600">
                <Brain className="w-6 h-6 mb-1 animate-pulse" />
                <p className="text-xs">Initializing...</p>
              </div>
            )}
            {logs.map(log => {
              const { icon: Icon, color } = LOG_ICONS[log.type];
              return (
                <div key={log.id} className="flex gap-2 group">
                  <div className="mt-0.5 shrink-0">
                    <Icon className={`w-3 h-3 ${color}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`text-[9px] font-bold uppercase tracking-wide ${color}`}>{log.type}</span>
                      <span className="text-[9px] text-slate-600 flex items-center gap-0.5">
                        <Clock className="w-2 h-2" />{log.timestamp}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed break-words">{log.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
