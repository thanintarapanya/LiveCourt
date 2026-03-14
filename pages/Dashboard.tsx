import React, { useState, useEffect } from 'react';
import { GlassCard, Badge } from '../components/UI';
import { Court, KPIMetric } from '../types';
import { DollarSign, Activity, Users, Zap, TrendingUp, Thermometer, Clock } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { motion } from 'framer-motion';

// Mock Data for Charts
const revenueData = [
  { time: '08:00', value: 1200 },
  { time: '10:00', value: 2400 },
  { time: '12:00', value: 1800 },
  { time: '14:00', value: 3200 },
  { time: '16:00', value: 4800 },
  { time: '18:00', value: 6500 },
  { time: '20:00', value: 5900 },
  { time: '22:00', value: 4200 },
];

const sourceData = [
  { name: 'Court Rental', value: 65 },
  { name: 'Vending', value: 25 },
  { name: 'Gear Rental', value: 10 },
];

const COLORS = ['#F97316', '#111827', '#9CA3AF']; // Orange, Black, Grey

const kpis: KPIMetric[] = [
  { label: 'Daily Revenue', value: '฿45,200', change: '+12%', isPositive: true, icon: DollarSign },
  { label: 'Active Courts', value: '6/8', change: '78%', isPositive: true, icon: Activity },
  { label: 'Total Bookings', value: '42', change: '-2%', isPositive: false, icon: Users },
  { label: 'Energy Saved', value: '14.2 kWh', change: '+5%', isPositive: true, icon: Zap },
];

// Generate 8 Courts with realistic progress data
const courts: Court[] = Array.from({ length: 8 }, (_, i) => {
  const isOccupied = [0, 1, 4, 5, 6].includes(i);
  const isMaintenance = i === 3;
  const isCleaning = i === 7;
  
  let status: Court['status'] = 'available';
  if (isOccupied) status = 'occupied';
  if (isMaintenance) status = 'maintenance';
  if (isCleaning) status = 'cleaning';

  // Mock time logic
  const now = new Date();
  const startTime = new Date(now.getTime() - Math.random() * 45 * 60000); // Started 0-45 mins ago
  const endTime = new Date(startTime.getTime() + 60 * 60000); // 1 hour duration

  return {
    id: `c-${i + 1}`,
    name: `Court ${i + 1}`,
    status,
    temperature: 24 + Math.random() * 2,
    humidity: 45 + Math.random() * 10,
    lights: isOccupied,
    currentBooking: isOccupied ? { 
      user: ['John Doe', 'Badminton Club A', 'Sarah Smith', 'Team Rocket'][i % 4], 
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      groupSize: 2 + Math.floor(Math.random() * 3) * 2 // 2, 4, or 6 people
    } : undefined
  };
});

const Dashboard: React.FC = () => {
  const [now, setNow] = useState(new Date());

  // Update timer every minute to refresh progress bars
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const calculateProgress = (start: string, end: string) => {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    const n = now.getTime();
    const total = e - s;
    const elapsed = n - s;
    const pct = Math.min(100, Math.max(0, (elapsed / total) * 100));
    return Math.round(pct);
  };

  const calculateTimeLeft = (end: string) => {
    const e = new Date(end).getTime();
    const n = now.getTime();
    const diff = Math.max(0, Math.ceil((e - n) / 60000));
    return `${diff}m`;
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Hero: Court Pipeline */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-light text-gray-900">Live Court Overview</h2>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-gray-500 uppercase tracking-wider">Realtime Socket</span>
          </div>
        </div>
        
        {/* Single Container for All Courts */}
        <GlassCard className="p-6 bg-white/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {courts.map((court) => {
              const progress = court.currentBooking 
                ? calculateProgress(court.currentBooking.startTime, court.currentBooking.endTime)
                : 0;
              const timeLeft = court.currentBooking
                ? calculateTimeLeft(court.currentBooking.endTime)
                : '';

              return (
                <div 
                  key={court.id} 
                  className="bg-white/60 rounded-xl p-4 border border-white/60 shadow-sm relative overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{court.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge color={
                          court.status === 'occupied' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 
                          court.status === 'available' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }>
                          {court.status}
                        </Badge>
                      </div>
                    </div>
                    <div className={`p-1.5 rounded-full ${court.lights ? 'bg-yellow-100 text-yellow-600 shadow-sm border border-yellow-200' : 'bg-gray-100 text-gray-400'}`}>
                      <Zap size={16} fill={court.lights ? "currentColor" : "none"} />
                    </div>
                  </div>
                  
                  {/* Stats Row */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1" title="Temperature">
                        <Thermometer size={12} />
                        <span>{court.temperature.toFixed(1)}°</span>
                      </div>
                      <div className="flex items-center gap-1" title="Humidity">
                        <Activity size={12} />
                        <span>{court.humidity.toFixed(0)}%</span>
                      </div>
                    </div>
                    {court.currentBooking && (
                      <div className="flex items-center gap-1 font-medium text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded-md">
                        <Users size={12} />
                        <span>{court.currentBooking.groupSize}</span>
                      </div>
                    )}
                  </div>

                  {court.currentBooking ? (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <div className="flex justify-between items-end mb-1">
                        <p className="text-sm text-gray-900 font-medium truncate max-w-[100px]">{court.currentBooking.user}</p>
                        <div className="text-right">
                           <span className="text-[10px] text-gray-400 block font-medium uppercase tracking-wide">Time Left</span>
                           <span className="text-xs font-bold text-brand-orange">{timeLeft}</span>
                        </div>
                      </div>
                      
                      <div className="relative pt-1">
                        <div className="flex justify-between items-center text-[10px] text-gray-500 mb-1 font-medium">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-brand-orange to-orange-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1 }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 pt-4 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-400 italic">Ready for booking</p>
                    </div>
                  )}
                  
                  {/* Background Glow for Active Courts */}
                  {court.status === 'occupied' && (
                    <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-orange-400/10 blur-[30px] pointer-events-none" />
                  )}
                </div>
              );
            })}
          </div>
        </GlassCard>
      </section>

      {/* KPI Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <GlassCard key={idx} className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">{kpi.label}</p>
              <h4 className="text-2xl font-semibold text-gray-900">{kpi.value}</h4>
              <div className={`flex items-center text-xs mt-1 font-medium ${kpi.isPositive ? 'text-green-600' : 'text-red-500'}`}>
                {kpi.isPositive ? <TrendingUp size={12} className="mr-1" /> : <TrendingUp size={12} className="mr-1 rotate-180" />}
                <span>{kpi.change}</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100 text-brand-orange">
              <kpi.icon size={20} />
            </div>
          </GlassCard>
        ))}
      </section>

      {/* Analytics Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <GlassCard className="col-span-1 lg:col-span-2 p-6 min-h-[300px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Revenue Trends</h3>
            <select className="bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 px-2 py-1 outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange">
              <option>Today</option>
              <option>This Week</option>
            </select>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `฿${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#111827' }}
                />
                <Area type="monotone" dataKey="value" stroke="#F97316" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Sources Pie Chart */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Revenue Sources</h3>
          <div className="h-[200px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                   itemStyle={{ color: '#111827' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-gray-900">100%</span>
              <span className="text-[10px] text-gray-400 uppercase">Total</span>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {sourceData.map((entry, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-gray-600">{entry.name}</span>
                </div>
                <span className="text-gray-900 font-medium">{entry.value}%</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>
    </div>
  );
};

export default Dashboard;