import { useState, useRef, useMemo } from 'react';
import { 
  MapPin, Droplets, CloudRain, Wind, Thermometer, AlertTriangle, Bell, History,
  FileDown, Activity, Users, Clock, TrendingUp, TrendingDown, Minus, Filter,
  Download, CheckCircle2, XCircle, Brain, Gauge, Waves, Navigation, RefreshCw,
  Network, BarChart3, Trophy, ChevronRight, Shield
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

// Map icons
const makeIcon = (color: string) => new Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3" fill="${color}"/></svg>`)}`,
  iconSize: [28, 28], iconAnchor: [14, 14],
});
const safeIcon = makeIcon('#10a981');
const warningIcon = makeIcon('#f97316');
const dangerIcon = makeIcon('#ef4444');

const getStatusIcon = (s: string) => ({
  danger: <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse inline-block" />,
  warning: <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse inline-block" />,
  safe: <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />,
}[s] ?? <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block" />);

const getTrendIcon = (t: string) => ({
  rising: <TrendingUp className="w-3.5 h-3.5 text-red-400" />,
  falling: <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />,
  stable: <Minus className="w-3.5 h-3.5 text-slate-400" />,
}[t] ?? null);

const getSeverityColor = (s: string) => ({
  critical: 'bg-red-500/15 text-red-300 border-red-500/25',
  high: 'bg-orange-500/15 text-orange-300 border-orange-500/25',
  medium: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  low: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
}[s] ?? 'bg-slate-500/15 text-slate-300 border-slate-500/25');

const getRiskColor = (r: string) => ({
  critical: 'text-red-400', high: 'text-orange-400', medium: 'text-amber-400', low: 'text-emerald-400',
}[r] ?? 'text-slate-400');

export default function App() {
  const [selectedSensor, setSelectedSensor] = useState<string>('all');
  const { waterLevels, weatherData, predictions, alerts, agentLogs, isLoading, lastUpdated, refresh, setAlerts } = useRealTimeData();
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
      const canvas = await html2canvas(reportRef.current);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210, pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, Math.min(imgHeight, pageHeight));
      pdf.save(`FloodGuard-Report-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`);
      toast.success('Report downloaded!');
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
      <div className="min-h-screen bg-slate-950 font-sans">
        <Toaster richColors position="top-right" />

        {/* ── Header ── */}
        <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
            {/* Brand */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Waves className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-white leading-none">FloodGuard AI</h1>
                  <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 text-[9px] py-0 px-1.5 font-semibold tracking-wide">
                    ET HACKATHON 2026
                  </Badge>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Autonomous Flood Intelligence · PS#5 · Updated {isLoading ? '…' : format(lastUpdated, 'HH:mm:ss')}
                </p>
              </div>
            </div>

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
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {[
              { label: 'Sensors', val: stats.total, icon: Gauge, color: 'cyan' },
              { label: 'Active Alerts', val: stats.active, icon: Bell, color: 'red' },
              { label: 'Warning', val: stats.warning, icon: AlertTriangle, color: 'amber' },
              { label: 'Danger', val: stats.danger, icon: Activity, color: 'red' },
              { label: 'Rainfall mm/hr', val: stats.rainfall, icon: CloudRain, color: 'blue' },
              { label: 'High Risk', val: stats.predictions, icon: Brain, color: 'violet' },
            ].map(s => {
              const Icon = s.icon;
              const cls: Record<string, string> = {
                cyan: 'bg-cyan-500/10 text-cyan-400',
                red: 'bg-red-500/10 text-red-400',
                amber: 'bg-amber-500/10 text-amber-400',
                blue: 'bg-blue-500/10 text-blue-400',
                violet: 'bg-violet-500/10 text-violet-400',
              };
              return (
                <Card key={s.label} className="bg-slate-900/60 border-slate-800 hover:border-slate-700 transition-all">
                  <CardContent className="p-3 flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg ${cls[s.color]} flex items-center justify-center shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-white leading-none">{s.val}</p>
                      <p className="text-[9px] text-slate-500 uppercase tracking-wide mt-0.5">{s.label}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* ── Main Tabs ── */}
          <Tabs defaultValue="overview">
            <TabsList className="bg-slate-900/80 border border-slate-800 flex-wrap h-auto gap-1 p-1">
              {[
                { val: 'overview', label: 'Overview', icon: Activity },
                { val: 'map', label: 'Live Map', icon: Navigation },
                { val: 'analytics', label: 'Analytics', icon: BarChart3 },
                { val: 'alerts', label: `Alerts (${stats.active})`, icon: Bell },
                { val: 'predictions', label: 'AI Predictions', icon: Brain },
                { val: 'history', label: 'Historical', icon: History },
                { val: 'architecture', label: 'Architecture', icon: Network },
                { val: 'impact', label: 'Impact Model', icon: Trophy },
              ].map(t => {
                const Icon = t.icon;
                return (
                  <TabsTrigger key={t.val} value={t.val}
                    className="text-xs data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400 flex items-center gap-1.5 px-3 py-1.5">
                    <Icon className="w-3.5 h-3.5" />{t.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* OVERVIEW */}
            <TabsContent value="overview" className="mt-4 space-y-4">
              {/* Top: Chart + Agent */}
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
                <Card className="xl:col-span-3 bg-slate-900/60 border-slate-800">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-sm flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-cyan-400" />
                        Water Level & Rainfall — {selectedSensorData?.name ?? 'All Stations'}
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-700">Real-time · Open-Meteo</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={timeSeriesData}>
                          <defs>
                            <linearGradient id="wlGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="timestamp" tickFormatter={v => format(new Date(v), 'HH:mm')} stroke="#475569" tick={{ fontSize: 10 }} />
                          <YAxis stroke="#475569" tick={{ fontSize: 10 }} />
                          <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }} labelStyle={{ color: '#94a3b8' }} />
                          <Area type="monotone" dataKey="waterLevel" stroke="#06b6d4" fill="url(#wlGrad)" strokeWidth={2} name="Water Level (m)" />
                          <Line type="monotone" dataKey="rainfall" stroke="#3b82f6" strokeDasharray="5 3" strokeWidth={1.5} dot={false} name="Rainfall (mm)" />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                <div className="xl:col-span-1">
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
            </TabsContent>

            {/* MAP */}
            <TabsContent value="map" className="mt-4">
              <Card className="bg-slate-900/60 border-slate-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-cyan-400" /> Live Flood Risk Map — India
                    </CardTitle>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Safe</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Warning</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Danger</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-2">
                  <div className="h-[520px] rounded-xl overflow-hidden border border-slate-700">
                    <MapContainer center={[22.5937, 78.9629] as LatLngExpression} zoom={5} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="&copy; CartoDB" />
                      {sensorLocations.map(sensor => {
                        const w = waterLevels.find(wl => wl.sensorId === sensor.id);
                        const icon = w?.status === 'danger' ? dangerIcon : w?.status === 'warning' ? warningIcon : safeIcon;
                        const color = w?.status === 'danger' ? '#ef4444' : w?.status === 'warning' ? '#f97316' : '#10a981';
                        return (
                          <Marker key={sensor.id} position={[sensor.lat, sensor.lng] as LatLngExpression} icon={icon}>
                            <Popup>
                              <div className="p-1 min-w-[160px]">
                                <p className="font-bold text-sm">{sensor.name}</p>
                                <p className="text-xs text-gray-600">{sensor.river} · {sensor.district}, {sensor.state}</p>
                                {w && (
                                  <div className="mt-2 space-y-1 text-xs">
                                    <p>Level: <strong>{w.currentLevel.toFixed(1)}m</strong> / {w.dangerLevel}m</p>
                                    <p>Status: <strong style={{ color }}>{w.status.toUpperCase()}</strong></p>
                                    <p>Trend: {w.trend}</p>
                                  </div>
                                )}
                              </div>
                            </Popup>
                            <Circle center={[sensor.lat, sensor.lng] as LatLngExpression}
                              radius={w?.status === 'danger' ? 40000 : w?.status === 'warning' ? 25000 : 12000}
                              pathOptions={{ fillColor: color, fillOpacity: 0.12, color, weight: 1.5, opacity: 0.4 }}
                            />
                          </Marker>
                        );
                      })}
                    </MapContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ANALYTICS */}
            <TabsContent value="analytics" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="bg-slate-900/60 border-slate-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-white">24-Hour AI Flood Forecast</CardTitle>
                    <CardDescription className="text-slate-500 text-xs">Open-Meteo Flood API · {selectedSensorData?.name ?? 'S001'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[260px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={forecastData}>
                          <defs>
                            <linearGradient id="fGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="timestamp" tickFormatter={v => format(new Date(v), 'HH:mm')} stroke="#475569" tick={{ fontSize: 10 }} />
                          <YAxis stroke="#475569" tick={{ fontSize: 10 }} />
                          <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', fontSize: 11 }} />
                          <Area type="monotone" dataKey="waterLevel" stroke="#8b5cf6" fill="url(#fGrad)" strokeWidth={2} name="Predicted Level (m)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/60 border-slate-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-white">Rainfall Distribution by Station</CardTitle>
                    <CardDescription className="text-slate-500 text-xs">IMD / Open-Meteo · mm/hr</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[260px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weatherData.slice(0, 8)} barSize={18}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="sensorId"
                            tickFormatter={v => sensorLocations.find(s => s.id === v)?.name.split(' ')[0] ?? v}
                            stroke="#475569" tick={{ fontSize: 9 }} />
                          <YAxis stroke="#475569" tick={{ fontSize: 10 }} />
                          <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', fontSize: 11 }} />
                          <Bar dataKey="rainfall" fill="#3b82f6" name="Rainfall (mm/hr)" radius={[3, 3, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ALERTS */}
            <TabsContent value="alerts" className="mt-4">
              <Card className="bg-slate-900/60 border-slate-800">
                <CardHeader className="pb-3 flex-row items-center justify-between">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Bell className="w-4 h-4 text-red-400" /> Active Alert Feed
                    {stats.active > 0 && <Badge className="bg-red-500 text-white text-[10px] py-0">{stats.active} new</Badge>}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-slate-700 text-slate-400 h-7 px-2 text-xs">
                      <Filter className="w-3 h-3 mr-1" /> Filter
                    </Button>
                    <Button size="sm" variant="outline" className="border-slate-700 text-slate-400 h-7 px-2 text-xs" onClick={downloadCSV}>
                      <Download className="w-3 h-3 mr-1" /> Export
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-2.5">
                      {filteredAlerts.length === 0 && (
                        <div className="py-16 text-center text-slate-500">
                          <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500/40" />
                          <p className="text-sm">All clear — no active alerts</p>
                        </div>
                      )}
                      {filteredAlerts.map(alert => (
                        <div key={alert.id}
                          className={`p-4 rounded-xl border ${getSeverityColor(alert.severity)} ${!alert.isRead ? 'ring-1 ring-inset ring-blue-500/30' : 'opacity-80'}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                <span className="font-semibold text-sm">{alert.locationName}</span>
                                <Badge variant="outline" className="text-[9px] capitalize border-current">
                                  {alert.type.replace('_', ' ')}
                                </Badge>
                                {!alert.isRead && <Badge className="bg-blue-600 text-white text-[9px] border-0">NEW</Badge>}
                              </div>
                              <p className="text-xs opacity-90 mb-2 leading-relaxed">{alert.message}</p>
                              <div className="flex items-center gap-4 text-[10px] opacity-60">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{format(new Date(alert.timestamp), 'MMM d, HH:mm')}</span>
                                {alert.affectedPopulation && (
                                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{alert.affectedPopulation.toLocaleString()} at risk</span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              {!alert.isRead && (
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => markRead(alert.id)}>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </Button>
                              )}
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => dismiss(alert.id)}>
                                <XCircle className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI PREDICTIONS */}
            <TabsContent value="predictions" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-3">
                  {filteredPredictions.length === 0 && predictions.length === 0 && (
                    <Card className="bg-slate-900/60 border-slate-800">
                      <CardContent className="py-16 text-center text-slate-500">
                        <Brain className="w-8 h-8 mx-auto mb-2 animate-pulse text-violet-500/40" />
                        <p className="text-sm">Fetching AI predictions from flood models…</p>
                      </CardContent>
                    </Card>
                  )}
                  {(filteredPredictions.length > 0 ? filteredPredictions : predictions).map((p, i) => (
                    <Card key={i} className="bg-slate-900/60 border-slate-800 hover:border-slate-700 transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="font-semibold text-white">{p.locationName}</h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Forecast: {format(new Date(p.predictionTime), 'MMM d, HH:mm')}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={`text-2xl font-bold ${getRiskColor(p.riskLevel)}`}>{p.confidence.toFixed(0)}%</p>
                            <p className="text-[10px] text-slate-500">Confidence</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 mt-3">
                          {[
                            { label: 'Predicted Level', val: `${p.predictedLevel.toFixed(1)}m`, color: 'text-cyan-400' },
                            { label: 'Risk Level', val: p.riskLevel.toUpperCase(), color: getRiskColor(p.riskLevel) },
                            { label: 'Time to Flood', val: p.timeToFlood ? `${p.timeToFlood}h` : 'N/A', color: 'text-amber-400' },
                          ].map(m => (
                            <div key={m.label} className="text-center p-2.5 bg-slate-800/50 rounded-lg">
                              <p className={`text-base font-bold ${m.color}`}>{m.val}</p>
                              <p className="text-[9px] text-slate-500 mt-0.5">{m.label}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 p-2.5 bg-violet-900/20 border border-violet-500/15 rounded-lg flex items-start gap-2">
                          <Brain className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />
                          <p className="text-[11px] text-violet-300 leading-relaxed">{p.recommendation}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div>
                  <AgentPanel logs={agentLogs} isLoading={isLoading} onRefresh={refresh} />
                </div>
              </div>
            </TabsContent>

            {/* HISTORY */}
            <TabsContent value="history" className="mt-4">
              <Card className="bg-slate-900/60 border-slate-800">
                <CardHeader className="pb-3 flex-row items-center justify-between">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <History className="w-4 h-4 text-amber-400" /> Historical Flood Events
                  </CardTitle>
                  <Button size="sm" variant="outline" className="border-slate-700 text-slate-400 h-7 px-2 text-xs" onClick={downloadCSV}>
                    <Download className="w-3 h-3 mr-1" /> Export
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-800">
                        {['Date', 'Location', 'Peak Level', 'Rainfall', 'Duration (h)', 'Casualties', 'Evacuated', 'Damage (₹Cr)'].map(h => (
                          <TableHead key={h} className="text-slate-400 text-xs">{h}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historicalEvents.map(ev => (
                        <TableRow key={ev.id} className="border-slate-800/50 hover:bg-slate-800/30">
                          <TableCell className="text-slate-300 text-xs">{ev.date}</TableCell>
                          <TableCell className="text-white text-xs font-medium">{ev.location}</TableCell>
                          <TableCell className="text-cyan-400 text-xs">{ev.maxWaterLevel}m</TableCell>
                          <TableCell className="text-blue-400 text-xs">{ev.rainfall} mm</TableCell>
                          <TableCell className="text-slate-300 text-xs">{ev.duration}h</TableCell>
                          <TableCell className="text-red-400 text-xs">{ev.casualties}</TableCell>
                          <TableCell className="text-amber-400 text-xs">{ev.evacuationCount.toLocaleString()}</TableCell>
                          <TableCell className="text-orange-400 text-xs">₹{(ev.damageEstimate / 1e7).toFixed(0)} Cr</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ARCHITECTURE */}
            <TabsContent value="architecture" className="mt-4">
              <ArchitecturePage />
            </TabsContent>

            {/* IMPACT MODEL */}
            <TabsContent value="impact" className="mt-4">
              <ImpactModelPage />
            </TabsContent>
          </Tabs>
        </main>

        {/* ── Report Dialog ── */}
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileDown className="w-5 h-5 text-cyan-400" /> Generate Situation Report
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Export a PDF or CSV snapshot of the current flood situation.
              </DialogDescription>
            </DialogHeader>
            <div ref={reportRef} className="space-y-4 py-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Active Sensors', val: stats.total, color: 'text-cyan-400' },
                  { label: 'Critical Alerts', val: stats.danger, color: 'text-red-400' },
                  { label: 'Predictions', val: predictions.length, color: 'text-violet-400' },
                ].map(m => (
                  <div key={m.label} className="text-center p-3 bg-slate-800 rounded-lg">
                    <p className={`text-2xl font-bold ${m.color}`}>{m.val}</p>
                    <p className="text-xs text-slate-400">{m.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 text-center">Generated: {format(new Date(), 'PPpp')}</p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={generatePDF} className="flex-1 bg-cyan-600 hover:bg-cyan-500">
                <FileDown className="w-4 h-4 mr-2" /> Download PDF
              </Button>
              <Button variant="outline" onClick={downloadCSV} className="flex-1 border-slate-700 text-slate-300">
                <Download className="w-4 h-4 mr-2" /> Export CSV
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
