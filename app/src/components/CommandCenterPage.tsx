import { useState } from 'react';
import { 
  Zap, 
  Cpu, 
  ShieldCheck, 
  Activity,
  Lock,
  Unlock,
  Terminal,
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import { ScrollArea } from '@/components/ui/scroll-area';

interface CommandCenterProps {
  onSimulate?: (type: string, params?: { rainfall?: number, location?: string }) => void;
  isAutoPilot?: boolean;
  onToggleAutoPilot?: (val: boolean) => void;
}

export function CommandCenterPage({ onSimulate, isAutoPilot = true, onToggleAutoPilot }: CommandCenterProps) {
  const [isLocked, setIsLocked] = useState(false);
  const [activeSim, setActiveSim] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string; type?: 'simulation' | 'text' }[]>([
    { role: 'assistant', content: "Hello! I am EcoTwin Lite, your GenAI Climate Risk Copilot. How can I assist you today? You can try asking me to 'Simulate flood in Pune' or 'Check NDMA protocols for heavy rain'." }
  ]);
  const [input, setInput] = useState('');

  const handleSimulate = (type: string, label: string, params?: { rainfall?: number, location?: string }) => {
    setActiveSim(type);
    toast.info(`Initializing Simulation: ${label}`, {
      description: "Agents are recalibrating for synthetic scenario data.",
      duration: 3000
    });
    onSimulate?.(type, params);
    setTimeout(() => setActiveSim(null), 5000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    const lowerMsg = userMsg.toLowerCase();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');

    // Handle simulation triggers
    if (lowerMsg.includes('simulate') && lowerMsg.includes('flood')) {
      const rainfallMatch = userMsg.match(/(\d+)mm/i);
      const rainfall = rainfallMatch ? parseInt(rainfallMatch[1]) : undefined;
      
      const locationMatch = userMsg.match(/in\s+([a-zA-Z\s]+)/i);
      const location = locationMatch ? locationMatch[1].trim() : (lowerMsg.includes('pune') ? 'Pune' : undefined);

      handleSimulate('flash_flood', `${location || 'Target'} Flood Event`, { rainfall, location });
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Acknowledged. Initializing flood simulation for ${location || 'Simulated Basin'} ${rainfall ? `with ${rainfall}mm precipitation` : ''}. Map is recalibrating to show risk heatmaps. I'm also retrieving relevant NDMA protocols.`,
        type: 'simulation'
      }]);
    } else if (lowerMsg.includes('simulate heatwave')) {
      handleSimulate('heat_risk', 'Urban Heat Island Event');
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Starting thermal stress simulation. Analyzing cooling center locations and vulnerable population density.",
        type: 'simulation'
      }]);
    } else {
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "I've analyzed your query. Based on current telemetry and NDMA guidelines, no immediate hazard is detected in that sector, but I recommend maintaining vigil on downstream river basins." 
        }]);
      }, 1000);
    }
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
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase">EcoTwin Copilot</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">GenAI Climate Risk Intelligence</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Interface */}
        <Card className="lg:col-span-3 glass-panel border-white/5 flex flex-col h-[600px] overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-white/5 p-4 flex flex-row items-center justify-between">
            <CardTitle className="text-white text-xs font-black flex items-center gap-2 uppercase tracking-widest">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              Intelligence Interface
            </CardTitle>
            <Badge variant="outline" className="text-[9px] border-cyan-500/20 text-cyan-400">LLAMA 3.3 70B ENHANCED</Badge>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-4 relative">
              {activeSim && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-cyan-500 animate-spin" />
                  <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Recalibrating Knowledge Matrix...</p>
                </div>
              )}
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] p-3 rounded-2xl border ${
                      msg.role === 'user' 
                      ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-100' 
                      : 'bg-white/5 border-white/10 text-slate-300'
                    }`}>
                      <p className="text-xs font-medium leading-relaxed">{msg.content}</p>
                      {msg.type === 'simulation' && (
                        <div className="mt-2 flex items-center gap-2 py-1 px-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                          <Zap className="w-3 h-3 text-emerald-400 animate-pulse" />
                          <span className="text-[10px] font-black text-emerald-400 uppercase">Interactive Simulation Active</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-4 border-t border-white/5 bg-black/20">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask EcoTwin (e.g. 'Simulate flood in Pune'...)"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                />
                <Button type="submit" size="sm" className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl px-4">
                  <Zap className="w-3.5 h-3.5" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Status */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="glass-panel border-white/5 overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-white/5 p-3">
              <CardTitle className="text-white text-[10px] font-black flex items-center gap-2 uppercase tracking-widest">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {agents.map((agent) => {
                const Icon = agent.icon;
                const colors = {
                  emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                  cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
                  violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
                }[agent.color as keyof typeof colors];

                return (
                  <div key={agent.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg ${colors} flex items-center justify-center border`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[10px] font-black text-white uppercase">{agent.name}</span>
                      </div>
                      <Badge className="bg-white/5 font-mono text-[8px] uppercase tracking-tighter text-slate-400">
                        {agent.status}
                      </Badge>
                    </div>
                    <Progress value={agent.load} className="h-1 bg-white/5" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="glass-panel border-white/5 overflow-hidden flex-1">
            <CardHeader className="border-b border-white/5 bg-white/5 p-3">
              <CardTitle className="text-white text-[10px] font-black flex items-center gap-2 uppercase tracking-widest text-slate-400">
                <Terminal className="w-3.5 h-3.5" />
                Thought Trace
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[240px] overflow-y-auto bg-black/20 font-mono text-[9px] text-slate-500">
              <div className="p-3 space-y-1.5">
                <div className="flex gap-2">
                  <span>[04:12:01]</span>
                  <span className="text-emerald-500">HAZARD:</span>
                  <span>Recalibrating hydrology weights...</span>
                </div>
                <div className="flex gap-2">
                  <span>[04:12:05]</span>
                  <span className="text-cyan-500">ACTION:</span>
                  <span>handshake protocol verified.</span>
                </div>
                <div className="flex gap-2">
                  <span>[04:12:08]</span>
                  <span className="text-violet-500">GUARDRAIL:</span>
                  <span>NDMA §4.2 Pass ✓</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
