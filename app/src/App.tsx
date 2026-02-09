import { useState, useRef, useMemo } from 'react';
import { 
  MapPin, 
  Droplets, 
  CloudRain, 
  Wind, 
  Thermometer, 
  AlertTriangle, 
  Bell, 
  History, 
  FileDown, 
  Activity,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Filter,
  Download,
  CheckCircle2,
  XCircle,
  Brain,
  Gauge,
  Waves,
  Navigation
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
import { toast } from 'sonner';
import { 
  Area, 
  AreaChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Icon } from 'leaflet';
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { 
  sensorLocations, 
  waterLevelData, 
  weatherData, 
  floodAlerts, 
  aiPredictions,
  historicalEvents,
  dashboardStats,
  generateTimeSeriesData,
  generateForecastData
} from '@/data/mockData';
import type { FloodAlert } from '@/types/flood';

// Custom map markers
const safeIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMTBhOTgxIiBzdHJva2Utd2lkdGg9IjIiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIi8+PC9zdmc+',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const warningIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZjk3MzE2IiBzdHJva2Utd2lkdGg9IjIiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIi8+PC9zdmc+',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const dangerIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZWY0NDQ0IiBzdHJva2Utd2lkdGg9IjIiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIi8+PC9zdmc+',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'safe': return <div className="w-3 h-3 rounded-full bg-emerald-500" />;
    case 'warning': return <div className="w-3 h-3 rounded-full bg-amber-500" />;
    case 'danger': return <div className="w-3 h-3 rounded-full bg-red-500" />;
    default: return <div className="w-3 h-3 rounded-full bg-slate-500" />;
  }
};

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'rising': return <TrendingUp className="w-4 h-4 text-red-500" />;
    case 'falling': return <TrendingDown className="w-4 h-4 text-emerald-500" />;
    case 'stable': return <Minus className="w-4 h-4 text-slate-500" />;
    default: return null;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
};

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'critical': return 'text-red-500';
    case 'high': return 'text-orange-500';
    case 'medium': return 'text-amber-500';
    case 'low': return 'text-emerald-500';
    default: return 'text-slate-500';
  }
};

export default function App() {
  const [selectedSensor, setSelectedSensor] = useState<string>('all');
  const [alerts, setAlerts] = useState<FloodAlert[]>(floodAlerts);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Filter data based on selected sensor
  const filteredWaterData = useMemo(() => {
    if (selectedSensor === 'all') return waterLevelData;
    return waterLevelData.filter(w => w.sensorId === selectedSensor);
  }, [selectedSensor]);

  const filteredWeatherData = useMemo(() => {
    if (selectedSensor === 'all') return weatherData;
    return weatherData.filter(w => w.sensorId === selectedSensor);
  }, [selectedSensor]);

  const filteredAlerts = useMemo(() => {
    if (selectedSensor === 'all') return alerts;
    return alerts.filter(a => a.sensorId === selectedSensor);
  }, [alerts, selectedSensor]);

  const filteredPredictions = useMemo(() => {
    if (selectedSensor === 'all') return aiPredictions;
    return aiPredictions.filter(p => p.sensorId === selectedSensor);
  }, [selectedSensor]);

  const selectedSensorData = useMemo(() => {
    if (selectedSensor === 'all') return null;
    return sensorLocations.find(s => s.id === selectedSensor);
  }, [selectedSensor]);

  const timeSeriesData = useMemo(() => {
    const sensor = selectedSensor === 'all' ? 'S001' : selectedSensor;
    return generateTimeSeriesData(sensor, 24);
  }, [selectedSensor]);

  const forecastData = useMemo(() => {
    const sensor = selectedSensor === 'all' ? 'S001' : selectedSensor;
    return generateForecastData(sensor, 24);
  }, [selectedSensor]);

  const markAlertAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, isRead: true } : a));
    toast.success('Alert marked as read');
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    toast.success('Alert dismissed');
  };

  const generatePDF = async () => {
    if (!reportRef.current) return;
    
    try {
      const canvas = await html2canvas(reportRef.current);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`FloodGuard-Report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      toast.success('Report downloaded successfully');
      setShowReportDialog(false);
    } catch (error) {
      toast.error('Failed to generate report');
    }
  };

  const downloadCSV = () => {
    const csvContent = [
      ['Sensor ID', 'Location', 'Current Level', 'Warning Level', 'Danger Level', 'Status', 'Trend'].join(','),
      ...waterLevelData.map(w => {
        const sensor = sensorLocations.find(s => s.id === w.sensorId);
        return [w.sensorId, sensor?.name, w.currentLevel, w.warningLevel, w.dangerLevel, w.status, w.trend].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FloodGuard-Data-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('CSV downloaded successfully');
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-950">
        {/* Header */}
        <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Waves className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">FloodGuard AI</h1>
                  <p className="text-xs text-slate-400">AI-Powered Flood Detection & Monitoring</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Select value={selectedSensor} onValueChange={setSelectedSensor}>
                  <SelectTrigger className="w-[220px] bg-slate-800 border-slate-700 text-white">
                    <MapPin className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all" className="text-white hover:bg-slate-700">All Locations</SelectItem>
                    {sensorLocations.map((sensor) => (
                      <SelectItem key={sensor.id} value={sensor.id} className="text-white hover:bg-slate-700">
                        {sensor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={() => setShowReportDialog(true)}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Report
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Gauge className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{dashboardStats.totalSensors}</p>
                    <p className="text-xs text-slate-400">Total Sensors</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{alerts.filter(a => !a.isRead).length}</p>
                    <p className="text-xs text-slate-400">Active Alerts</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{dashboardStats.sensorsInWarning}</p>
                    <p className="text-xs text-slate-400">Warning Stage</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{dashboardStats.sensorsInDanger}</p>
                    <p className="text-xs text-slate-400">Danger Stage</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <CloudRain className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{dashboardStats.avgRainfall24h}mm</p>
                    <p className="text-xs text-slate-400">Avg Rainfall (24h)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{dashboardStats.predictedFloods}</p>
                    <p className="text-xs text-slate-400">AI Predictions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-slate-900 border border-slate-800">
              <TabsTrigger value="overview" className="data-[state=active]:bg-slate-800">Overview</TabsTrigger>
              <TabsTrigger value="map" className="data-[state=active]:bg-slate-800">Live Map</TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-slate-800">Analytics</TabsTrigger>
              <TabsTrigger value="alerts" className="data-[state=active]:bg-slate-800">Alerts</TabsTrigger>
              <TabsTrigger value="predictions" className="data-[state=active]:bg-slate-800">AI Predictions</TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-slate-800">History</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Water Level Chart */}
                <Card className="lg:col-span-2 bg-slate-900/50 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Droplets className="w-5 h-5 text-cyan-400" />
                      Water Level Monitoring
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      {selectedSensorData ? selectedSensorData.name : 'All monitoring stations'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={timeSeriesData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis 
                            dataKey="timestamp" 
                            tickFormatter={(value) => format(new Date(value), 'HH:mm')}
                            stroke="#64748b"
                          />
                          <YAxis stroke="#64748b" />
                          <RechartsTooltip 
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                            labelStyle={{ color: '#94a3b8' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="waterLevel" 
                            stroke="#06b6d4" 
                            fill="#06b6d4" 
                            fillOpacity={0.3}
                            name="Water Level (m)"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="rainfall" 
                            stroke="#3b82f6" 
                            strokeDasharray="5 5"
                            name="Rainfall (mm)"
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Current Status */}
                <Card className="bg-slate-900/50 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Activity className="w-5 h-5 text-emerald-400" />
                      Current Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[280px]">
                      <div className="space-y-3">
                        {filteredWaterData.map((data) => {
                          const sensor = sensorLocations.find(s => s.id === data.sensorId);
                          const percent = Math.min(100, (data.currentLevel / data.dangerLevel) * 100);
                          return (
                            <div key={data.sensorId} className="p-3 bg-slate-800/50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-white">{sensor?.name}</span>
                                <div className="flex items-center gap-2">
                                  {getTrendIcon(data.trend)}
                                  {getStatusIcon(data.status)}
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                                <span>{data.currentLevel.toFixed(1)}m</span>
                                <span>Danger: {data.dangerLevel}m</span>
                              </div>
                              <Progress 
                                value={percent} 
                                className="h-2"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Weather Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredWeatherData.slice(0, selectedSensor === 'all' ? 4 : 1).map((weather) => {
                  const sensor = sensorLocations.find(s => s.id === weather.sensorId);
                  return (
                    <Card key={weather.sensorId} className="bg-slate-900/50 border-slate-800">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-400">{sensor?.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <Thermometer className="w-4 h-4 text-orange-400" />
                            <span className="text-white">{weather.temperature}°C</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Droplets className="w-4 h-4 text-blue-400" />
                            <span className="text-white">{weather.humidity}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CloudRain className="w-4 h-4 text-cyan-400" />
                            <span className="text-white">{weather.rainfall24h}mm</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Wind className="w-4 h-4 text-emerald-400" />
                            <span className="text-white">{weather.windSpeed}km/h</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Map Tab */}
            <TabsContent value="map">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-cyan-400" />
                    Live Flood Risk Map
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[500px] rounded-lg overflow-hidden">
                    <MapContainer 
                      center={[22.5937, 78.9629] as LatLngExpression} 
                      zoom={5} 
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {sensorLocations.map((sensor) => {
                        const waterData = waterLevelData.find(w => w.sensorId === sensor.id);
                        const icon = waterData?.status === 'danger' ? dangerIcon : 
                                     waterData?.status === 'warning' ? warningIcon : safeIcon;
                        const color = waterData?.status === 'danger' ? '#ef4444' : 
                                      waterData?.status === 'warning' ? '#f97316' : '#10a981';
                        
                        return (
                          <Marker key={sensor.id} position={[sensor.lat, sensor.lng] as LatLngExpression} icon={icon}>
                            <Popup>
                              <div className="p-2">
                                <h3 className="font-bold">{sensor.name}</h3>
                                <p className="text-sm">{sensor.river} River</p>
                                <p className="text-sm">{sensor.district}, {sensor.state}</p>
                                {waterData && (
                                  <div className="mt-2">
                                    <p className="text-sm">Water Level: {waterData.currentLevel}m</p>
                                    <p className="text-sm">Status: <span className={`font-semibold`} style={{ color }}>
                                      {waterData.status.toUpperCase()}
                                    </span></p>
                                  </div>
                                )}
                              </div>
                            </Popup>
                            <Circle 
                              center={[sensor.lat, sensor.lng] as LatLngExpression}
                              radius={waterData?.status === 'danger' ? 30000 : waterData?.status === 'warning' ? 20000 : 10000}
                              pathOptions={{ 
                                fillColor: color, 
                                fillOpacity: 0.2, 
                                color: color,
                                weight: 2 
                              }}
                            />
                          </Marker>
                        );
                      })}
                    </MapContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-900/50 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white">24-Hour Forecast</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={forecastData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis 
                            dataKey="timestamp" 
                            tickFormatter={(value) => format(new Date(value), 'HH:mm')}
                            stroke="#64748b"
                          />
                          <YAxis stroke="#64748b" />
                          <RechartsTooltip 
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="waterLevel" 
                            stroke="#8b5cf6" 
                            fill="#8b5cf6" 
                            fillOpacity={0.3}
                            name="Predicted Level"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white">Rainfall Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weatherData.slice(0, 8)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis 
                            dataKey="sensorId" 
                            tickFormatter={(value) => sensorLocations.find(s => s.id === value)?.name.split(' ')[0] || value}
                            stroke="#64748b"
                          />
                          <YAxis stroke="#64748b" />
                          <RechartsTooltip 
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                          />
                          <Bar dataKey="rainfall24h" fill="#3b82f6" name="24h Rainfall (mm)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Alerts Tab */}
            <TabsContent value="alerts">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Bell className="w-5 h-5 text-red-400" />
                    Active Alerts
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-slate-600 text-slate-300"
                      onClick={downloadCSV}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3">
                      {filteredAlerts.map((alert) => (
                        <div 
                          key={alert.id} 
                          className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)} ${!alert.isRead ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-blue-500/50' : ''}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle className="w-4 h-4" />
                                <span className="font-semibold">{alert.locationName}</span>
                                <Badge variant="outline" className="text-xs capitalize">
                                  {alert.type.replace('_', ' ')}
                                </Badge>
                                {!alert.isRead && (
                                  <Badge className="bg-blue-500 text-white text-xs">New</Badge>
                                )}
                              </div>
                              <p className="text-sm opacity-90 mb-2">{alert.message}</p>
                              <div className="flex items-center gap-4 text-xs opacity-70">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {format(new Date(alert.timestamp), 'MMM dd, HH:mm')}
                                </span>
                                {alert.affectedPopulation && (
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {alert.affectedPopulation.toLocaleString()} affected
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 ml-4">
                              {!alert.isRead && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => markAlertAsRead(alert.id)}
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => dismissAlert(alert.id)}
                              >
                                <XCircle className="w-4 h-4" />
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

            {/* Predictions Tab */}
            <TabsContent value="predictions">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Brain className="w-5 h-5 text-violet-400" />
                    AI Flood Predictions
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Machine learning models analyzing weather patterns and water levels
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredPredictions.map((prediction, idx) => (
                      <div key={idx} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-lg font-semibold text-white">{prediction.locationName}</h4>
                            <p className="text-sm text-slate-400">
                              Prediction for {format(new Date(prediction.predictionTime), 'MMM dd, HH:mm')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-2xl font-bold ${getRiskColor(prediction.riskLevel)}`}>
                              {prediction.confidence}%
                            </p>
                            <p className="text-xs text-slate-400">Confidence</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <div className="text-center p-3 bg-slate-900/50 rounded">
                            <p className="text-lg font-semibold text-cyan-400">
                              {prediction.predictedLevel.toFixed(1)}m
                            </p>
                            <p className="text-xs text-slate-400">Predicted Level</p>
                          </div>
                          <div className="text-center p-3 bg-slate-900/50 rounded">
                            <p className={`text-lg font-semibold ${getRiskColor(prediction.riskLevel)}`}>
                              {prediction.riskLevel.toUpperCase()}
                            </p>
                            <p className="text-xs text-slate-400">Risk Level</p>
                          </div>
                          <div className="text-center p-3 bg-slate-900/50 rounded">
                            <p className="text-lg font-semibold text-amber-400">
                              {prediction.timeToFlood}h
                            </p>
                            <p className="text-xs text-slate-400">Time to Flood</p>
                          </div>
                        </div>
                        
                        <div className="mt-4 p-3 bg-violet-500/10 border border-violet-500/20 rounded">
                          <p className="text-sm text-violet-300">
                            <span className="font-semibold">AI Recommendation:</span> {prediction.recommendation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <History className="w-5 h-5 text-amber-400" />
                    Historical Flood Events
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    className="border-slate-600 text-slate-300"
                    onClick={downloadCSV}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-400">Date</TableHead>
                        <TableHead className="text-slate-400">Location</TableHead>
                        <TableHead className="text-slate-400">Max Level</TableHead>
                        <TableHead className="text-slate-400">Rainfall</TableHead>
                        <TableHead className="text-slate-400">Duration</TableHead>
                        <TableHead className="text-slate-400">Evacuated</TableHead>
                        <TableHead className="text-slate-400">Damage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historicalEvents.map((event) => (
                        <TableRow key={event.id} className="border-slate-700">
                          <TableCell className="text-white">{format(new Date(event.date), 'MMM dd, yyyy')}</TableCell>
                          <TableCell className="text-white">{event.location}</TableCell>
                          <TableCell className="text-cyan-400">{event.maxWaterLevel}m</TableCell>
                          <TableCell className="text-blue-400">{event.rainfall}mm</TableCell>
                          <TableCell className="text-white">{event.duration}h</TableCell>
                          <TableCell className="text-amber-400">{event.evacuationCount.toLocaleString()}</TableCell>
                          <TableCell className="text-red-400">₹{(event.damageEstimate / 1000000).toFixed(0)}M</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        {/* Report Dialog */}
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogContent className="bg-slate-800 border-slate-700 max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Generate Report</DialogTitle>
              <DialogDescription className="text-slate-400">
                Preview and download the flood monitoring report
              </DialogDescription>
            </DialogHeader>
            
            <div ref={reportRef} className="bg-white text-slate-900 p-8 rounded-lg">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-900">FloodGuard AI</h1>
                <p className="text-lg text-slate-600">Flood Monitoring Report</p>
                <p className="text-sm text-slate-500">{format(new Date(), 'MMMM dd, yyyy HH:mm')}</p>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Executive Summary</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-100 rounded">
                    <p className="text-sm text-slate-600">Total Sensors</p>
                    <p className="text-2xl font-bold">{dashboardStats.totalSensors}</p>
                  </div>
                  <div className="p-4 bg-slate-100 rounded">
                    <p className="text-sm text-slate-600">Active Alerts</p>
                    <p className="text-2xl font-bold">{alerts.filter(a => !a.isRead).length}</p>
                  </div>
                  <div className="p-4 bg-slate-100 rounded">
                    <p className="text-sm text-slate-600">Sensors in Warning</p>
                    <p className="text-2xl font-bold">{dashboardStats.sensorsInWarning}</p>
                  </div>
                  <div className="p-4 bg-slate-100 rounded">
                    <p className="text-sm text-slate-600">Sensors in Danger</p>
                    <p className="text-2xl font-bold">{dashboardStats.sensorsInDanger}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Current Water Levels</h2>
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="p-2 text-left">Location</th>
                      <th className="p-2 text-left">Current Level</th>
                      <th className="p-2 text-left">Danger Level</th>
                      <th className="p-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {waterLevelData.map((w) => {
                      const sensor = sensorLocations.find(s => s.id === w.sensorId);
                      return (
                        <tr key={w.sensorId} className="border-b">
                          <td className="p-2">{sensor?.name}</td>
                          <td className="p-2">{w.currentLevel}m</td>
                          <td className="p-2">{w.dangerLevel}m</td>
                          <td className="p-2 capitalize">{w.status}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Active Alerts</h2>
                {alerts.filter(a => !a.isRead).map((alert) => (
                  <div key={alert.id} className="p-4 bg-red-50 border border-red-200 rounded mb-2">
                    <p className="font-semibold">{alert.locationName}</p>
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs text-slate-500">
                      {format(new Date(alert.timestamp), 'MMM dd, HH:mm')}
                    </p>
                  </div>
                ))}
              </div>
              
              <div>
                <h2 className="text-xl font-bold mb-4">AI Predictions</h2>
                {aiPredictions.map((pred, idx) => (
                  <div key={idx} className="p-4 bg-violet-50 border border-violet-200 rounded mb-2">
                    <p className="font-semibold">{pred.locationName}</p>
                    <p className="text-sm">Risk Level: {pred.riskLevel.toUpperCase()}</p>
                    <p className="text-sm">Confidence: {pred.confidence}%</p>
                    <p className="text-sm">{pred.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowReportDialog(false)}>
                Cancel
              </Button>
              <Button onClick={generatePDF} className="bg-blue-600 hover:bg-blue-700">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
