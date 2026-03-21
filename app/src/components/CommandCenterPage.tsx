import { useState } from 'react';
import { 
  ShieldAlert, 
  RotateCcw, 
  Zap, 
  Cpu, 
  ShieldCheck, 
  Activity,
  AlertOctagon,
  Lock,
  Unlock,
  Terminal,
  MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface CommandCenterProps {
  onSimulate?: (type: string) => void;
  isAutoPilot?: boolean;
  onToggleAutoPilot?: (val: boolean) => void;
}

export function CommandCenterPage({ onSimulate, isAutoPilot = true, onToggleAutoPilot }: CommandCenterProps) {
  const [isLocked, setIsLocked] = useState(false);
  const [activeSim, setActiveSim] = useState<string | null>(null);

  const handleSimulate = (type: string, label: string) => {
    setActiveSim(type);
    toast.info(`Initializing Simulation: ${label}`, {
      description: "Agents are recalibrating for synthetic scenario data.",
      duration: 3000
    });
    onSimulate?.(type);
    setTimeout(() => setActiveSim(null), 5000);
  };

  const agents = [
    { name: 'Hazard', status: 'online', load: 42, color: 'emerald', icon: Activity },
    { name: 'Action', status: 'standby', load: 12, color: 'cyan', icon: Zap },
    { name: 'Guardrail', status: 'monitoring', load: 8, color: 'violet', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Tactical Command Center</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">Manual Override & Agent Orchestration</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 p-1.5 bg-black/40 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 px-3">
              <span className={`w-2 h-2 rounded-full ${isAutoPilot ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-500'}`} />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Autonomous Mode</span>
            </div>
            <Switch 
              checked={isAutoPilot} 
              onCheckedChange={onToggleAutoPilot}
              className="data-[state=checked]:bg-emerald-500"
            />
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setIsLocked(!isLocked)}
            className={`rounded-xl border-white/10 ${isLocked ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-black/40 text-slate-400'}`}
          >
            {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Heartbeat */}
        <Card className="lg:col-span-2 glass-panel border-white/5 overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-white/5">
            <CardTitle className="text-white text-xs font-black flex items-center gap-2 uppercase tracking-widest">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Agent Neural Core Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {agents.map((agent) => {
                const Icon = agent.icon;
                const colors = {
                  emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-900/10',
                  cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20 shadow-cyan-900/10',
                  violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20 shadow-violet-900/10',
                }[agent.color as keyof typeof colors];

                return (
                  <div key={agent.name} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg ${colors} flex items-center justify-center border`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-black text-white uppercase">{agent.name}</span>
                      </div>
                      <Badge className="bg-white/5 font-mono text-[9px] uppercase tracking-tighter text-slate-400">
                        {agent.status}
                      </Badge>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase">
                        <span>Neural Load</span>
                        <span>{agent.load}%</span>
                      </div>
                      <Progress value={agent.load} className="h-1 bg-white/5" indicatorClassName={`bg-${agent.color}-500 shadow-[0_0_10px_rgba(255,255,255,0.1)]`} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 p-4 bg-black/40 rounded-2xl border border-white/5 font-mono text-[10px] text-emerald-400/70 space-y-1">
              <div className="flex gap-2">
                <span className="text-slate-600 uppercase">[14:02:11]</span>
                <span>HAZARD_CORE: Recalibrating hydrology weights for basin MH-04...</span>
              </div>
              <div className="flex gap-2 text-cyan-400/70">
                <span className="text-slate-600 uppercase">[14:02:15]</span>
                <span>ACTION_DISPATCH: Multi-agent handshake protocol verified.</span>
              </div>
              <div className="flex gap-2 text-violet-400/70">
                <span className="text-slate-600 uppercase">[14:02:22]</span>
                <span>GUARDRAIL_SENTINEL: Integrity check complete. NDMA §4.2 Pass.</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Simulation Hub */}
        <Card className="glass-panel border-white/5 flex flex-col">
          <CardHeader className="border-b border-white/5 bg-white/5">
            <CardTitle className="text-white text-xs font-black flex items-center gap-2 uppercase tracking-widest text-amber-500">
              <Zap className="w-4 h-4" />
              Scenario Simulation Hub
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col">
            <div className="space-y-3 flex-1">
              {[
                { id: 'flash_flood', label: 'Simulate Flash Flood', desc: 'Rapid level rise in Pune-NW basin', icon: AlertOctagon },
                { id: 'cloudburst', label: 'Cloudburst Event', desc: 'Concentrated 100mm/hr rainfall spike', icon: Activity },
                { id: 'sensor_failure', label: 'Sensor Grid Dropout', desc: 'Verify system failover logic', icon: ShieldAlert },
                { id: 'reset', label: 'Clear Synthetic Data', desc: 'Return to live telemetry feed', icon: RotateCcw, color: 'slate' },
              ].map((sim) => {
                const SimIcon = sim.icon;
                const isActive = activeSim === sim.id;
                return (
                  <Button
                    key={sim.id}
                    disabled={isLocked && sim.id !== 'reset'}
                    onClick={() => handleSimulate(sim.id, sim.label)}
                    className={`w-full justify-start h-auto p-4 rounded-2xl border transition-all relative overflow-hidden group ${
                      isActive 
                      ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                      : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:border-white/10'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 ${isActive ? 'bg-black/20' : 'bg-black/40 group-hover:scale-110 transition-transform'}`}>
                      <SimIcon className={`w-5 h-5 ${isActive ? 'text-black' : sim.color === 'slate' ? 'text-slate-400' : 'text-amber-400'}`} />
                    </div>
                    <div className="text-left">
                      <p className={`text-xs font-black uppercase tracking-tight ${isActive ? 'text-black' : 'text-white'}`}>{sim.label}</p>
                      <p className={`text-[9px] font-bold uppercase tracking-tighter opacity-60 ${isActive ? 'text-black' : ''}`}>{sim.desc}</p>
                    </div>
                    {isActive && (
                      <motion.div 
                        layoutId="active-highlight"
                        className="absolute inset-0 bg-white/20 pointer-events-none"
                      />
                    )}
                  </Button>
                );
              })}
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                <div className="flex-1">
                  <p className="text-[10px] font-black text-amber-500 uppercase">Supervisor Protocol</p>
                  <p className="text-[9px] text-slate-500 font-medium leading-tight mt-0.5">Simulations override live Groq processing for 5-min intervals.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Terminal log */}
        <Card className="glass-panel border-white/5 overflow-hidden">
          <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between py-4">
            <CardTitle className="text-white text-xs font-black flex items-center gap-2 uppercase tracking-widest text-slate-400">
              <Terminal className="w-4 h-4" />
              Agent Interlink Log
            </CardTitle>
            <Badge variant="outline" className="text-[9px] border-white/10 text-slate-500">LIVESTREAM</Badge>
          </CardHeader>
          <CardContent className="p-0 h-[300px] overflow-y-auto bg-black/20 font-mono text-[11px]">
            <div className="p-4 space-y-2">
              <div className="flex gap-3">
                <span className="text-slate-700">04:12:01</span>
                <span className="text-emerald-500">SYST_KRNL:</span>
                <span className="text-slate-400">Interrupt received from simulation hub. Routing to agent buffer...</span>
              </div>
              <div className="flex gap-3">
                <span className="text-slate-700">04:12:05</span>
                <span className="text-cyan-500">ACT_DISP:</span>
                <span className="text-slate-400">Simulating Pune-NW flash flood. Injecting water_level: 5.8m (Critical).</span>
              </div>
              <div className="flex gap-3">
                <span className="text-slate-700">04:12:08</span>
                <span className="text-amber-500">HAZ_CORE:</span>
                <span className="text-slate-400">Executing Risk Threshold Analysis... Detected level 112% over baseline.</span>
              </div>
              <div className="flex gap-3">
                <span className="text-slate-700">04:12:12</span>
                <span className="text-violet-500">GRD_SENT:</span>
                <span className="text-slate-400">Verifying autonomous evacuation directive. CWC Protocols OK.</span>
              </div>
              <div className="flex gap-3">
                <span className="text-slate-700">04:12:15</span>
                <span className="text-red-500">ROOT:</span>
                <span className="text-slate-400 font-black italic">! EVACUATION ORDER ISSUED FOR DOWNSTREAM SECTOR 4 !</span>
              </div>
              <div className="animate-pulse flex gap-3 text-slate-600">
                <span>04:12:18</span>
                <span>_</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manual Directives */}
        <Card className="glass-panel border-white/5">
          <CardHeader className="border-b border-white/5 py-4">
            <CardTitle className="text-white text-xs font-black flex items-center gap-2 uppercase tracking-widest text-slate-400">
              <MessageSquare className="w-4 h-4" />
              Manual Nodal Directives
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[
                { label: 'Panic Mode Override', desc: 'Force agents to ignore false-positive thresholds.', type: 'danger' },
                { label: 'Downstream Gate Lock', desc: 'Manual control signal to Mula-Mutha dam nodes.', type: 'action' },
                { label: 'Global Alert Mute', desc: 'Suppress all non-critical community notifications.', type: 'caution' },
              ].map((dir) => (
                <div key={dir.label} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-tight group-hover:text-emerald-400 transition-colors">{dir.label}</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter mt-1">{dir.desc}</p>
                  </div>
                  <Switch disabled={isLocked} />
                </div>
              ))}
              <Button 
                variant="destructive" 
                disabled={isLocked}
                className="w-full h-14 rounded-2xl bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white font-black uppercase tracking-widest text-xs"
              >
                Global Emergency Lockdown
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
