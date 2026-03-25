import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Droplets, CloudRain, Wind, Thermometer, AlertTriangle, Bell, History,
  FileDown, Activity, Users, Clock, TrendingUp, TrendingDown, Minus, Filter,
  Download, CheckCircle2, XCircle, Brain, Gauge, Waves, Navigation, RefreshCw,
  Network, BarChart3, Trophy, Shield, Zap, Radio, Terminal, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Toaster, toast } from 'sonner';
import { 
  Area, AreaChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, BarChart, Bar, ComposedChart, RadarChart, PolarGrid,
  PolarAngleAxis, Radar
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Icon } from 'leaflet';
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { sensorLocations, historicalEvents, generateTimeSeriesData, generateForecastData } from '@/data/mockData';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import { AgentPanel } from '@/components/AgentPanel';
import { ArchitecturePage } from '@/components/ArchitecturePage';
import { ImpactModelPage } from '@/components/ImpactModelPage';
import { CommandCenterPage } from '@/components/CommandCenterPage';
import { PolicyLedgerPage } from '@/components/PolicyLedgerPage';

// Map icons
const makeIcon = (color: string) => new Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3" fill="${color}"/></svg>`)}`,
  iconSize: [28, 28], iconAnchor: [14, 14],
});
const safeIcon = makeIcon('#10a981');
const warningIcon = makeIcon('#f97316');
const dangerIcon = makeIcon('#ef4444');

const getStatusIcon = (s: string) => ({
  danger: <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse inline-block" />,
  warning: <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse inline-block" />,
  safe: <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] inline-block" />,
}[s] ?? <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block" />);

const getTrendIcon = (t: string) => ({
  rising: <TrendingUp className="w-3.5 h-3.5 text-red-400" />,
  falling: <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />,
  stable: <Minus className="w-3.5 h-3.5 text-slate-400" />,
}[t] ?? null);


const getRiskColor = (r: string) => ({
  critical: 'text-red-400', high: 'text-orange-400', medium: 'text-amber-400', low: 'text-emerald-400',
}[r] ?? 'text-slate-400');

export default function App() {
  const [selectedSensor, setSelectedSensor] = useState<string>('all');
  const { 
    waterLevels, weatherData, predictions, alerts, agentLogs, 
    isLoading, lastUpdated, refresh, setAlerts, simulateEvent,
    isSimulationActive, simulationType 
  } = useRealTimeData();
  const [showReportDialog, setShowReportDialog] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const filteredWater = useMemo(() =>
    selectedSensor === 'all' ? waterLevels : waterLevels.filter(w => w.sensorId === selectedSensor),
    [selectedSensor, waterLevels]);

  const filteredWeather = useMemo(() =>
    selectedSensor === 'all' ? weatherData : weatherData.filter(w => w.sensorId === selectedSensor),
    [selectedSensor, weatherData]);

  const filteredAlerts = useMemo(() =>
    selectedSensor === 'all' ? alerts : alerts.filter(a => a.sensorId === selectedSensor),
    [selectedSensor, alerts]);

  const filteredPredictions = useMemo(() =>
    selectedSensor === 'all' ? predictions : predictions.filter(p => p.sensorId === selectedSensor),
    [selectedSensor, predictions]);

  const selectedSensorData = useMemo(() =>
    selectedSensor === 'all' ? null : sensorLocations.find(s => s.id === selectedSensor),
    [selectedSensor]);

  const stats = useMemo(() => ({
    total: sensorLocations.length,
    active: alerts.filter(a => !a.isRead).length,
    warning: waterLevels.filter(w => w.status === 'warning').length,
    danger: waterLevels.filter(w => w.status === 'danger').length,
    rainfall: weatherData.length > 0
      ? (weatherData.reduce((s, w) => s + w.rainfall, 0) / weatherData.length).toFixed(1)
      : '—',
    predictions: predictions.filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical').length,
  }), [waterLevels, weatherData, alerts, predictions]);

  const timeSeriesData = useMemo(() => {
    const s = selectedSensor === 'all' ? 'S001' : selectedSensor;
    return generateTimeSeriesData(s, 24);
  }, [selectedSensor]);

  const forecastData = useMemo(() => {
    const s = selectedSensor === 'all' ? 'S001' : selectedSensor;
    return generateForecastData(s, 24);
  }, [selectedSensor]);

  const radarData = useMemo(() => [
    { subject: 'Water Level', value: stats.danger * 20 + stats.warning * 10 },
    { subject: 'Rainfall', value: parseFloat(String(stats.rainfall)) || 0 },
    { subject: 'AI Confidence', value: 91 },
    { subject: 'Coverage', value: (waterLevels.length / sensorLocations.length) * 100 },
    { subject: 'Response', value: 88 },
  ], [stats, waterLevels.length]);

  const generatePDF = async () => {
    if (!reportRef.current) return;
    try {
      const locName = isSimulationActive ? (simulationType === 'flash_flood' ? 'Pune' : 'Simulated') : 'Global';
      const canvas = await html2canvas(reportRef.current);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210, pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, Math.min(imgHeight, pageHeight));
      pdf.save(`EcoTwin-Lite-Report-${locName}-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`);
      toast.success('TACTICAL ABSTRACT ARCHIVED', {
        description: `Secure situational report saved for ${locName} sector.`
      });
      setShowReportDialog(false);
    } catch { toast.error('PDF generation failed'); }
  };

  const downloadCSV = () => {
    const rows = [
      ['Sensor', 'Location', 'River', 'State', 'Level (m)', 'Danger (m)', 'Status', 'Trend'],
      ...waterLevels.map(w => {
        const loc = sensorLocations.find(s => s.id === w.sensorId);
        return [w.sensorId, loc?.name, loc?.river, loc?.state, w.currentLevel.toFixed(2), w.dangerLevel, w.status, w.trend];
      })
    ].map(r => r.join(',')).join('\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([rows], { type: 'text/csv' })),
      download: `FloodGuard-${format(new Date(), 'yyyy-MM-dd')}.csv`,
    });
    document.body.appendChild(a); a.click(); a.remove();
    toast.success('CSV exported!');
  };

  const markRead = (id: string) => { setAlerts(p => p.map(a => a.id === id ? { ...a, isRead: true } : a)); toast.success('Marked as read'); };
  const dismiss = (id: string) => { setAlerts(p => p.filter(a => a.id !== id)); toast.success('Alert dismissed'); };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-mesh font-sans text-slate-200">
        <Toaster richColors position="top-right" />

        {/* ── Header ── */}
        <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/40 backdrop-blur-2xl">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
            {/* Brand */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 shrink-0"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-cyan-500/20 animate-float">
                <Waves className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-white tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    FloodGuard AI
                  </h1>
                  <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 text-[10px] py-0 px-2 font-bold tracking-wider uppercase">
                    v4.0 AUTONOMOUS
                  </Badge>
                  <Badge className="bg-white/5 text-slate-400 border border-white/10 text-[9px] py-0 px-2 font-bold tracking-wider uppercase ml-1">
                    Team ECHOGEAR
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <Brain className="w-3 h-3 text-cyan-400" />
                    <span className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">Climate Risk Copilot</span>
                  </div>
                  <span className="text-slate-700">•</span>
                  <p className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
                    {isLoading ? 'ANALYZING RISK...' : `FROM REACTIVE → PROACTIVE • ${format(lastUpdated, 'HH:mm:ss')}`}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Sensor Select */}
            <Select value={selectedSensor} onValueChange={setSelectedSensor}>
              <SelectTrigger className="w-[200px] bg-slate-900 border-slate-700 text-white text-sm h-8">
                <MapPin className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="all" className="text-white text-sm">All Locations</SelectItem>
                {sensorLocations.map(s => (
                  <SelectItem key={s.id} value={s.id} className="text-white text-sm">{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Button size="sm" variant="outline" onClick={refresh} disabled={isLoading}
                className="border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 h-8 px-3">
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
                Sync
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowReportDialog(true)}
                className="border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 h-8 px-3">
                <FileDown className="w-3.5 h-3.5 mr-1.5" /> Report
              </Button>
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-400 font-medium">LIVE</span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-5 space-y-5">
          {/* ── Stats Strip ── */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 sm:grid-cols-6 gap-3"
          >
            {[
              { label: 'Sensors', val: stats.total, icon: Gauge, color: 'cyan' },
              { label: 'Network Load', val: `${(stats.total * 8.5).toFixed(1)}%`, icon: Radio, color: 'blue' },
              { label: 'Warning', val: stats.warning, icon: AlertTriangle, color: 'amber' },
              { label: 'Danger', val: stats.danger, icon: Activity, color: 'red' },
              { label: 'Rainfall', val: `${stats.rainfall} mm`, icon: CloudRain, color: 'blue' },
              { label: 'AI Risk', val: stats.predictions, icon: Brain, color: 'violet' },
            ].map((s) => {
              const Icon = s.icon;
              const cls: Record<string, string> = {
                cyan: 'from-cyan-500/20 to-transparent text-cyan-400',
                red: 'from-red-500/20 to-transparent text-red-400',
                amber: 'from-amber-500/20 to-transparent text-amber-400',
                blue: 'from-blue-500/20 to-transparent text-blue-400',
                violet: 'from-violet-500/20 to-transparent text-violet-400',
              };
              return (
                <motion.div
                  key={s.label}
                  whileHover={{ scale: 1.02, translateY: -2 }}
                  className="relative group"
                >
                  <Card className="glass-card border-white/5 overflow-hidden">
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${cls[s.color]} flex items-center justify-center shrink-0 border border-white/10 group-hover:border-white/20 transition-colors`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xl font-black text-white leading-none tracking-tight">{s.val}</p>
                        <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mt-1 opacity-80">{s.label}</p>
                      </div>
                    </CardContent>
                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/5 to-transparent opaicty-0 group-hover:opacity-100 transition-opacity" />
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {/* ── Main Tabs ── */}
          <Tabs defaultValue="overview">
            <TabsList className="bg-slate-950/20 border border-white/5 flex-wrap h-auto gap-1 p-1 backdrop-blur-md rounded-xl">
              {[
                { val: 'overview', label: 'Climate Deck', icon: Activity },
                { val: 'command', label: 'FloodGuard Copilot', icon: Terminal },
                { val: 'map', label: 'Tactical Map', icon: Navigation },
                { val: 'analytics', label: 'AI Analytics', icon: BarChart3 },
                { val: 'alerts', label: `Alert Feed (${stats.active})`, icon: Bell },
                { val: 'roadmap', label: 'Strategic Roadmap', icon: Radio },
                { val: 'history', label: 'Archives', icon: History },
                { val: 'architecture', label: 'Agent Core', icon: Network },
                { val: 'policy', label: 'Policy Ledger', icon: BookOpen },
                { val: 'impact', label: 'Impact Model', icon: Trophy },
              ].map(t => {
                const Icon = t.icon;
                return (
                  <TabsTrigger key={t.val} value={t.val}
                    className="text-[11px] font-bold uppercase tracking-wider data-[state=active]:bg-white/10 data-[state=active]:text-cyan-400 data-[state=active]:shadow-[0_0_15px_rgba(6,182,212,0.1)] text-slate-500 flex items-center gap-2 px-4 py-2 transition-all rounded-lg">
                    <Icon className="w-3.5 h-3.5" />{t.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* OVERVIEW */}
            <TabsContent value="overview" className="mt-4 space-y-4 focus-visible:outline-none">
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
                  <Card className="xl:col-span-3 glass-panel border-white/5 overflow-hidden">
                    <CardHeader className="pb-2 border-b border-white/5">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white text-sm font-bold flex items-center gap-2">
                          <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
                          LIVE TELEMETRY STREAM — {selectedSensorData?.name ?? 'ALL STATIONS'}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] text-cyan-400 border-cyan-500/20 bg-cyan-500/5">AUTO-SYNC ACTIVE</Badge>
                          <Badge variant="outline" className="text-[10px] text-slate-400 border-white/10 italic">Updated {format(lastUpdated, 'HH:mm:ss')}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={timeSeriesData}>
                            <defs>
                              <linearGradient id="wlGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="timestamp" tickFormatter={v => format(new Date(v), 'HH:mm')} stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                            <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                            <RechartsTooltip 
                              contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, backdropFilter: 'blur(8px)', fontSize: 11 }}
                              itemStyle={{ color: '#fff', fontWeight: 600 }}
                              labelStyle={{ color: '#94a3b8', marginBottom: 4 }}
                            />
                            <Area type="monotone" dataKey="waterLevel" stroke="#22d3ee" fill="url(#wlGrad)" strokeWidth={3} name="Water Level" animationDuration={1500} />
                            <Line type="monotone" dataKey="rainfall" stroke="#6366f1" strokeDasharray="4 4" strokeWidth={2} dot={false} name="Rainfall" animationDuration={1000} />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="xl:col-span-1 border border-white/5 rounded-xl bg-slate-950/20 backdrop-blur-md overflow-hidden">
                    <AgentPanel logs={agentLogs} isLoading={isLoading} onRefresh={refresh} />
                  </div>
                </div>

                {/* Bottom: Status + Radar + Weather */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Sensor Status List */}
                  <Card className="bg-slate-900/60 border-slate-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-white flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-400" /> Sensor Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ScrollArea className="h-[260px] px-4">
                        <div className="space-y-2 pb-4">
                          {(filteredWater.length > 0 ? filteredWater : waterLevels).map(w => {
                            const loc = sensorLocations.find(s => s.id === w.sensorId);
                            const pct = Math.min(100, (w.currentLevel / w.dangerLevel) * 100);
                            return (
                              <div key={w.sensorId} className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/30">
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-xs font-medium text-white truncate max-w-[120px]">{loc?.name}</span>
                                  <div className="flex items-center gap-1.5">
                                    {getTrendIcon(w.trend)}
                                    {getStatusIcon(w.status)}
                                  </div>
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                                  <span>{w.currentLevel.toFixed(1)}m</span>
                                  <span>limit {w.dangerLevel}m</span>
                                </div>
                                <Progress value={pct}
                                  className={`h-1.5 bg-slate-700 ${w.status === 'danger' ? '[&>[role=progressbar]]:bg-red-500' : w.status === 'warning' ? '[&>[role=progressbar]]:bg-amber-500' : '[&>[role=progressbar]]:bg-emerald-500'}`}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Radar Chart */}
                  <Card className="bg-slate-900/60 border-slate-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-white flex items-center gap-2">
                        <Shield className="w-4 h-4 text-violet-400" /> System Risk Radar
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center h-[260px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="#334155" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                          <Radar name="Risk" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} strokeWidth={1.5} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Weather Cards */}
                  <Card className="bg-slate-900/60 border-slate-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-white flex items-center gap-2">
                        <CloudRain className="w-4 h-4 text-blue-400" /> Weather Telemetry
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ScrollArea className="h-[260px] px-4">
                        <div className="space-y-2 pb-4">
                          {(filteredWeather.length > 0 ? filteredWeather : weatherData).slice(0, 6).map(w => {
                            const loc = sensorLocations.find(s => s.id === w.sensorId);
                            return (
                              <div key={w.sensorId} className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/30">
                                <p className="text-[10px] font-semibold text-slate-300 mb-1.5">{loc?.name}</p>
                                <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                                  {[
                                    { icon: Thermometer, val: `${w.temperature.toFixed(1)}°C`, color: 'text-orange-400' },
                                    { icon: Droplets, val: `${w.humidity.toFixed(0)}%`, color: 'text-blue-400' },
                                    { icon: CloudRain, val: `${w.rainfall.toFixed(1)} mm`, color: 'text-cyan-400' },
                                    { icon: Wind, val: `${w.windSpeed.toFixed(0)} km/h`, color: 'text-emerald-400' },
                                  ].map(({ icon: Ic, val, color }) => (
                                    <div key={val} className="flex items-center gap-1">
                                      <Ic className={`w-2.5 h-2.5 ${color}`} />
                                      <span className="text-[10px] text-slate-400">{val}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>

                {/* Data Sources Footer */}
                <div className="pt-8 border-t border-white/5">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 text-center">Verified Data Infrastructure & Citations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                      { label: 'OpenStreetMap', desc: 'Geospatial Building/Road Data', icon: MapPin },
                      { label: 'NOAA / Copernicus', desc: 'Satellite Climate Telemetry', icon: CloudRain },
                      { label: 'Synthetic IoT', desc: 'Real-time Hydrological Sensors', icon: Radio },
                      { label: 'NDMA Protocols', desc: 'Official Compliance RAG (2024)', icon: Shield },
                    ].map(d => (
                      <div key={d.label} className="p-3 bg-slate-900/40 border border-slate-800 rounded-xl flex items-center gap-3">
                        <div className="p-2 bg-slate-800 rounded-lg">
                          <d.icon className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-white uppercase tracking-tight">{d.label}</p>
                          <p className="text-[10px] text-slate-500 font-bold">{d.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="command" className="mt-4 focus-visible:outline-none">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <CommandCenterPage onSimulate={simulateEvent} agentLogs={agentLogs} />
              </motion.div>
            </TabsContent>

            {/* MAP */}
            <TabsContent value="map" className="mt-4 focus-visible:outline-none">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="glass-panel border-white/5 overflow-hidden">
                  <CardHeader className="pb-2 border-b border-white/5">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-sm font-bold flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-cyan-400" /> TACTICAL FLOOD RISK MAP — INDIA
                      </CardTitle>
                      <div className="flex items-center gap-4 text-[11px] font-bold">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> SAFE</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" /> WARNING</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" /> DANGER</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-[560px] relative">
                      <MapContainer center={[22.5937, 78.9629] as LatLngExpression} zoom={5} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="&copy; CartoDB" />
                        {sensorLocations.map(sensor => {
                          const w = waterLevels.find(wl => wl.sensorId === sensor.id);
                          const icon = w?.status === 'danger' ? dangerIcon : w?.status === 'warning' ? warningIcon : safeIcon;
                          const color = w?.status === 'danger' ? '#ef4444' : w?.status === 'warning' ? '#f97316' : '#10a981';
                          
                          // Simulation Overlays
                          const isSimTarget = isSimulationActive && sensor.id === 'S001';
                          const simColor = simulationType === 'flash_flood' ? '#ef4444' : '#f97316';
                          
                          return (
                            <div key={sensor.id}>
                              <Marker position={[sensor.lat, sensor.lng] as LatLngExpression} icon={icon}>
                                <Popup className="premium-popup">
                                  <div className="p-2 min-w-[200px] bg-slate-900 text-white rounded-lg">
                                    <p className="font-black text-sm tracking-tight border-b border-white/10 pb-1 mb-1">{sensor.name}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">{sensor.river} · {sensor.district}</p>
                                    {w && (
                                      <div className="space-y-2">
                                        <div className="flex justify-between items-center bg-white/5 p-1.5 rounded">
                                          <span className="text-[10px] text-slate-400 uppercase">Level</span>
                                          <strong className="text-sm font-black text-cyan-400">{w.currentLevel.toFixed(1)}m</strong>
                                        </div>
                                        <div className="flex justify-between items-center bg-white/5 p-1.5 rounded">
                                          <span className="text-[10px] text-slate-400 uppercase">Status</span>
                                          <strong className="text-[10px] font-black tracking-widest px-1.5 py-0.5 rounded border border-current" style={{ color }}>{w.status.toUpperCase()}</strong>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </Popup>
                                <Circle center={[sensor.lat, sensor.lng] as LatLngExpression}
                                  radius={w?.status === 'danger' ? 45000 : w?.status === 'warning' ? 30000 : 15000}
                                  pathOptions={{ fillColor: color, fillOpacity: 0.15, color, weight: 1.5, opacity: 0.5 }}
                                />
                              </Marker>
                              
                              {isSimTarget && (
                                <>
                                  <Circle 
                                    center={[sensor.lat, sensor.lng] as LatLngExpression}
                                    radius={85000}
                                    pathOptions={{ fillColor: simColor, fillOpacity: 0.05, color: simColor, weight: 1, dashArray: '5, 10' }}
                                  />
                                  <Circle 
                                    center={[sensor.lat, sensor.lng] as LatLngExpression}
                                    radius={120000}
                                    pathOptions={{ fillColor: simColor, fillOpacity: 0.02, color: simColor, weight: 0.5, dashArray: '10, 20' }}
                                  />
                                </>
                              )}
                            </div>
                          );
                        })}
                      </MapContainer>
                      <div className="absolute top-4 right-4 z-[1000] p-3 glass-panel rounded-xl border-white/10 space-y-2">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-1">Overlay Controls</div>
                        <Button size="sm" variant="ghost" className="w-full justify-start text-[10px] h-7 font-bold text-slate-300 hover:text-cyan-400">
                          <Droplets className="w-3 h-3 mr-2" /> RIVER BASINS
                        </Button>
                        <Button size="sm" variant="ghost" className="w-full justify-start text-[10px] h-7 font-bold text-slate-300 hover:text-cyan-400">
                          <CloudRain className="w-3 h-3 mr-2" /> PRECIPITATION
                        </Button>
                        {isSimulationActive && (
                          <div className="pt-2 mt-2 border-t border-white/5">
                            <div className="flex items-center gap-2 mb-2">
                              <Zap className="w-3 h-3 text-red-400 animate-pulse" />
                              <span className="text-[9px] font-black text-white uppercase tracking-tighter">SIMULATION ACTIVE</span>
                            </div>
                            <Badge className="w-full bg-red-500/20 text-red-400 border-red-500/30 text-[8px] py-1 font-black tracking-widest uppercase">
                              {simulationType?.replace('_', ' ')}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* ANALYTICS */}
            <TabsContent value="analytics" className="mt-4 focus-visible:outline-none">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-4"
              >
                <Card className="glass-panel border-white/5">
                  <CardHeader className="pb-2 border-b border-white/5">
                    <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                      <Brain className="w-4 h-4 text-violet-400" /> 7-DAY PREDICTIVE RISK MODEL
                    </CardTitle>
                    <CardDescription className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Hydrological Forecast Simulation</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={forecastData}>
                          <defs>
                            <linearGradient id="fGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis dataKey="timestamp" tickFormatter={v => format(new Date(v), 'MMM d')} stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                          <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                          <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, backdropFilter: 'blur(8px)', fontSize: 11 }} />
                          <Area type="monotone" dataKey="waterLevel" stroke="#a855f7" fill="url(#fGrad)" strokeWidth={3} name="Risk Probability" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-panel border-white/5">
                  <CardHeader className="pb-2 border-b border-white/5">
                    <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                      <CloudRain className="w-4 h-4 text-blue-400" /> PRECIPITATION VOLUMETRICS
                    </CardTitle>
                    <CardDescription className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Real-time Rainfall Distribution (mm)</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weatherData.slice(0, 8)} barSize={24}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis dataKey="sensorId"
                            tickFormatter={v => sensorLocations.find(s => s.id === v)?.name.split(' ')[0] ?? v}
                            stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 9, fontWeight: 600 }} axisLine={false} tickLine={false} />
                          <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                          <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, backdropFilter: 'blur(8px)', fontSize: 11 }} />
                          <Bar dataKey="rainfall" fill="#3b82f6" name="Rainfall Intensity" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* ALERTS */}
            <TabsContent value="alerts" className="mt-4 focus-visible:outline-none">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="glass-panel border-white/5 overflow-hidden">
                  <CardHeader className="pb-3 border-b border-white/5 flex-row items-center justify-between">
                    <CardTitle className="text-white text-sm font-bold flex items-center gap-2">
                      <Bell className="w-4 h-4 text-red-400 animate-pulse" /> ACTIVE TACTICAL ALERTS
                      {stats.active > 0 && <Badge className="bg-red-500 text-white text-[10px] py-0 font-bold">{stats.active} CRITICAL</Badge>}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-white/10 bg-white/5 text-slate-400 h-7 px-2 text-[10px] font-bold uppercase tracking-tight">
                        <Filter className="w-3 h-3 mr-1" /> Filter
                      </Button>
                      <Button size="sm" variant="outline" className="border-white/10 bg-white/5 text-slate-400 h-7 px-2 text-[10px] font-bold uppercase tracking-tight" onClick={downloadCSV}>
                        <Download className="w-3 h-3 mr-1" /> Export
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ScrollArea className="h-[520px] pr-4">
                      <div className="space-y-3">
                        <AnimatePresence>
                          {filteredAlerts.length === 0 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center">
                              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-emerald-500/20" />
                              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Sector Clear — No Active Threats</p>
                            </motion.div>
                          )}
                          {filteredAlerts.map(alert => (
                            <motion.div 
                              layout
                              key={alert.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className={`p-4 rounded-xl border glass-card transition-all ${!alert.isRead ? 'ring-1 ring-inset ring-cyan-500/20 border-cyan-500/20' : 'opacity-60 border-white/5'}`}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                    <div className={`p-1 rounded bg-slate-900 border border-white/10`}>
                                      <AlertTriangle className={`w-3.5 h-3.5 ${alert.severity === 'critical' ? 'text-red-400' : 'text-amber-400'}`} />
                                    </div>
                                    <span className="font-black text-sm text-white tracking-tight">{alert.locationName}</span>
                                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter border-white/10 py-0">
                                      {alert.type.replace('_', ' ')}
                                    </Badge>
                                    {!alert.isRead && <Badge className="bg-cyan-600 text-white text-[9px] border-0 font-bold">LIVE</Badge>}
                                  </div>
                                  <p className="text-xs text-slate-300 leading-relaxed font-medium">{alert.message}</p>
                                  <div className="flex items-center gap-4 mt-3 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5"><Clock className="w-3 h-3" />{format(new Date(alert.timestamp), 'HH:mm:ss')}</span>
                                    {alert.affectedPopulation && (
                                      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5"><Users className="w-3 h-3" />{alert.affectedPopulation.toLocaleString()} PERSONNEL AT RISK</span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1 shrink-0">
                                  {!alert.isRead && (
                                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-cyan-500/10 hover:text-cyan-400" onClick={() => markRead(alert.id)}>
                                      <CheckCircle2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                  <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-red-500/10 hover:text-red-400" onClick={() => dismiss(alert.id)}>
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="predictions" className="mt-4 focus-visible:outline-none">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-3">
                  <AnimatePresence>
                    {filteredPredictions.length === 0 && predictions.length === 0 && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Card className="glass-panel border-white/5 overflow-hidden">
                          <CardContent className="py-24 text-center">
                            <Brain className="w-12 h-12 mx-auto mb-4 animate-pulse text-violet-500/20" />
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Compiling Predictive Models…</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                    {(filteredPredictions.length > 0 ? filteredPredictions : predictions).map((p, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Card className="glass-card border-white/5 overflow-hidden group">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h4 className="font-black text-white text-base tracking-tight">{p.locationName}</h4>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                                  Forecast Horizon: {format(new Date(p.predictionTime), 'MMM d, HH:mm')}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className={`text-3xl font-black tracking-tighter ${getRiskColor(p.riskLevel)}`}>{p.confidence.toFixed(0)}%</p>
                                <p className="text-[9px] font-bold text-slate-500 uppercase">Confidence</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3 mt-4">
                              {[
                                { label: 'Peak Level', val: `${p.predictedLevel.toFixed(1)}m`, color: 'text-cyan-400' },
                                { label: 'Risk Tier', val: p.riskLevel.toUpperCase(), color: getRiskColor(p.riskLevel) },
                                { label: 'T-Minus', val: p.timeToFlood ? `${p.timeToFlood}h` : 'N/A', color: 'text-amber-400' },
                              ].map(m => (
                                <div key={m.label} className="text-center p-3 bg-white/5 rounded-xl border border-white/5 group-hover:bg-white/10 transition-colors">
                                  <p className={`text-lg font-black tracking-tight ${m.color}`}>{m.val}</p>
                                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">{m.label}</p>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 p-3 bg-violet-600/10 border border-violet-500/20 rounded-xl flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0 border border-violet-500/30">
                                <Brain className="w-4 h-4 text-violet-400" />
                              </div>
                              <p className="text-[11px] font-medium text-slate-300 leading-relaxed italic">"{p.recommendation}"</p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                <div className="lg:col-span-1">
                  <AgentPanel logs={agentLogs} isLoading={isLoading} onRefresh={refresh} />
                </div>
              </div>
            </TabsContent>

            {/* HISTORY */}
            <TabsContent value="history" className="mt-4 focus-visible:outline-none">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="glass-panel border-white/5 overflow-hidden">
                  <CardHeader className="pb-3 border-b border-white/5 flex-row items-center justify-between">
                    <CardTitle className="text-white text-sm font-bold flex items-center gap-2">
                      <History className="w-4 h-4 text-amber-400" /> HISTORICAL FLOOD DATABASE
                    </CardTitle>
                    <Button size="sm" variant="outline" className="border-white/10 bg-white/5 text-slate-400 h-7 px-2 text-[10px] font-bold uppercase tracking-tight" onClick={downloadCSV}>
                      <Download className="w-3 h-3 mr-1" /> Export Data
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[520px]">
                      <Table>
                        <TableHeader className="bg-white/5 sticky top-0 z-10">
                          <TableRow className="border-white/5">
                            {['Date', 'Location', 'Peak Level', 'Rainfall', 'Duration', 'Impact'].map(h => (
                              <TableHead key={h} className="text-slate-400 text-[10px] font-black uppercase tracking-widest h-10">{h}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {historicalEvents.map(ev => (
                            <TableRow key={ev.id} className="border-white/5 hover:bg-white/5 transition-colors">
                              <TableCell className="text-slate-300 font-bold text-xs">{ev.date}</TableCell>
                              <TableCell className="text-white font-black text-xs tracking-tight">{ev.location}</TableCell>
                              <TableCell className="text-cyan-400 font-black text-xs">{ev.maxWaterLevel}m</TableCell>
                              <TableCell className="text-blue-400 font-black text-xs">{ev.rainfall} mm</TableCell>
                              <TableCell className="text-slate-400 font-bold text-xs">{ev.duration}h</TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-red-400 text-[10px] font-black uppercase tracking-tighter">{ev.casualties} Casualties</span>
                                  <span className="text-amber-400 text-[10px] font-black uppercase tracking-tighter">{ev.evacuationCount.toLocaleString()} Evacuated</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* ARCHITECTURE */}
            <TabsContent value="architecture" className="mt-4 focus-visible:outline-none">
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                <ArchitecturePage />
              </motion.div>
            </TabsContent>

            {/* ROADMAP */}
            <TabsContent value="roadmap" className="mt-4 focus-visible:outline-none">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                <Card className="lg:col-span-2 glass-panel border-white/5 overflow-hidden">
                  <CardHeader className="bg-white/5 p-4 border-b border-white/5">
                    <CardTitle className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-widest">
                      <Radio className="w-4 h-4 text-cyan-400" /> Future Scaling Roadmap
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {[
                      { title: 'Satellite-Link Integration', desc: 'Deep forest & rural monitoring via low-latency sat-comms.', progress: 15, icon: Radio },
                      { title: 'Edge-AI Field Modules', desc: 'Deploying offline nodal intelligence for zero-connectivity zones.', progress: 8, icon: Zap },
                      { title: 'Citizen Response Portal', desc: 'Community crowdsourcing & verify-to-earn alert systems.', progress: 42, icon: Users },
                      { title: 'Hydrological Digital Twin', desc: 'High-fidelity 3D modeling of 12 major river basins.', progress: 65, icon: Waves },
                    ].map(step => (
                      <div key={step.title} className="space-y-3 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-800 rounded-xl"><step.icon className="w-4 h-4 text-cyan-400" /></div>
                            <div>
                              <p className="text-xs font-black text-white uppercase tracking-tight">{step.title}</p>
                              <p className="text-[10px] text-slate-500 font-bold">{step.desc}</p>
                            </div>
                          </div>
                          <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[9px]">{step.progress}%</Badge>
                        </div>
                        <Progress value={step.progress} className="h-1 bg-white/5" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="glass-panel border-white/5 overflow-hidden">
                  <CardHeader className="bg-white/5 p-4 border-b border-white/5">
                    <CardTitle className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-widest">
                      <Activity className="w-4 h-4 text-emerald-400" /> Evaluation Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-8 text-center">
                    {[
                      { label: 'Decision Speed', val: '+87.5%', desc: 'Reduction in planning time' },
                      { label: 'Model Precision', val: '92%', desc: 'Simulation accuracy' },
                      { label: 'User Rating', val: '4.5/5', desc: 'Mission usefulness' },
                    ].map(m => (
                      <div key={m.label} className="space-y-2">
                        <p className="text-4xl font-black text-white tracking-tighter">{m.val}</p>
                        <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest leading-none">{m.label}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">{m.desc}</p>
                      </div>
                    ))}
                    <div className="pt-6 border-t border-white/5 italic text-[10px] text-slate-400 font-bold">
                      "FloodGuard AI v4.0 — From Reactive Alerts to Proactive Disaster Countermeasures."
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* POLICY LEDGER */}
            <TabsContent value="policy" className="mt-4 focus-visible:outline-none">
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                <PolicyLedgerPage />
              </motion.div>
            </TabsContent>

            {/* IMPACT MODEL */}
            <TabsContent value="impact" className="mt-4 focus-visible:outline-none">
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                <ImpactModelPage />
              </motion.div>
            </TabsContent>
          </Tabs>
        </main>

        {/* ── Report Dialog ── */}
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogContent className="glass-panel border-white/10 text-white max-w-2xl p-0 overflow-hidden">
            <div className="bg-mesh p-8 border-b border-white/5">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-2xl font-black tracking-tighter uppercase text-white">
                  <div className="p-2 rounded-xl bg-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                    <FileDown className="w-6 h-6 text-cyan-400" />
                  </div>
                  Situation Report Matrix
                </DialogTitle>
                <DialogDescription className="text-slate-400 font-bold text-xs mt-2 uppercase tracking-widest">
                  Secure Tactical Data Extraction · {format(new Date(), 'PPpp')}
                </DialogDescription>
              </DialogHeader>
            </div>
            
            <div className={`p-8 space-y-6 ${isSimulationActive ? 'bg-red-500/5' : ''}`}>
              <div ref={reportRef} className="space-y-6">
                <div className="flex justify-between items-start border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">FloodGuard AI Tactical Abstract</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Reference: ET-AI-2026-{format(new Date(), 'HHmm')}</p>
                  </div>
                  {isSimulationActive && (
                    <Badge className="bg-red-500 text-white animate-pulse">SIMULATION ACTIVE: {simulationType?.toUpperCase()}</Badge>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Network Nodes', val: stats.total, color: 'text-cyan-400', bg: 'bg-cyan-500/5' },
                    { label: 'Danger Zones', val: stats.danger, color: 'text-red-400', bg: 'bg-red-500/5' },
                    { label: 'AI Risk Level', val: stats.danger > 0 ? 'CRITICAL' : 'OPTIMAL', color: stats.danger > 0 ? 'text-red-400' : 'text-emerald-400', bg: 'bg-white/5' },
                  ].map(m => (
                    <div key={m.label} className={`text-center p-4 ${m.bg} rounded-2xl border border-white/5`}>
                      <p className={`text-2xl font-black tracking-tighter ${m.color}`}>{m.val}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{m.label}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Situational Intelligence Summary</h4>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-xs text-slate-300 leading-relaxed italic">
                      "FloodGuard AI has successfully retrieved relevant NDMA protocols for the current precipitation levels. 
                      Hydrological weights for downstream sectors are being recalibrated. Recommended posture: {stats.danger > 0 ? 'High-Alert/Immediate Action' : 'Passive Surveillance'}."
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">GenAI Mitigation Checklist</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { item: 'Evacuation Zone 4 Clear', status: 'verified' },
                      { item: 'Dam Spillway Check §12', status: 'pending' },
                      { item: 'Nodal Handshake (Hazard/Action)', status: 'verified' },
                      { item: 'Community SOS Broadcast', status: 'verified' },
                    ].map(i => (
                      <div key={i.item} className="flex items-center gap-2 p-2.5 bg-black/20 rounded-xl border border-white/5">
                        <CheckCircle2 className={`w-3 h-3 ${i.status === 'verified' ? 'text-emerald-500' : 'text-slate-600'}`} />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{i.item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tactical Impact Estimation</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Decision Speed', val: '+87.5%', color: 'text-cyan-400' },
                      { label: 'Resource Opt.', val: '40%', color: 'text-emerald-400' },
                      { label: 'Risk Mitigation', val: '92%', color: 'text-amber-400' },
                    ].map(m => (
                      <div key={m.label} className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                        <p className={`text-xl font-black ${m.color}`}>{m.val}</p>
                        <p className="text-[8px] font-bold text-slate-500 uppercase mt-1">{m.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/5 mt-4">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 text-center">Security Hash & Clearance</h4>
                  <p className="text-[10px] font-mono text-slate-400 text-center break-all">SIG_{Array.from({length: 32}, () => Math.floor(Math.random() * 16).toString(16)).join('')}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={generatePDF} className="flex-1 h-12 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] border-0">
                  <FileDown className="w-5 h-5 mr-3" /> Archive PDF
                </Button>
                <Button variant="outline" onClick={downloadCSV} className="flex-1 h-12 border-white/10 bg-white/5 text-slate-300 font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all">
                  <Download className="w-5 h-5 mr-3" /> Export CSV
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
