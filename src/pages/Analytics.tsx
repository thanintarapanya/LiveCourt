import React, { useState } from 'react';
import { GlassCard, NeonButton, Badge } from '@/components/Ui';
import { 
  Settings, Droplets, Zap, DollarSign, Calendar, TrendingUp, 
  X, CheckSquare, Square, BarChart3, Users, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
type MetricType = 'revenue' | 'electricity' | 'water' | 'court_usage' | 'bookings' | 'vending';

interface ColumnConfig {
  id: number;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  visibleMetrics: MetricType[];
}

interface MonthlyData {
  days: number;
  revenue: number;
  bookings: number;
  vendingSales: number;
  electricity: {
    units: number; // kWh
    rate: number;
    cost: number;
  };
  water: {
    units: number; // Cubic meters
    rate: number;
    cost: number;
  };
  courtUsage: { id: string; name: string; hours: number; capacity: number }[];
}

// --- Constants & Config ---
const ALL_METRICS: { id: MetricType; label: string; icon: any }[] = [
  { id: 'revenue', label: 'Total Revenue', icon: DollarSign },
  { id: 'bookings', label: 'Total Bookings', icon: Calendar },
  { id: 'court_usage', label: 'Court Usage Breakdown', icon: BarChart3 },
  { id: 'electricity', label: 'Electricity Fee', icon: Zap },
  { id: 'water', label: 'Water Fee', icon: Droplets },
  { id: 'vending', label: 'Vending Sales', icon: Users },
];

const DEFAULT_METRICS: MetricType[] = ['revenue', 'court_usage', 'electricity', 'water'];

// --- Realistic Data Engine ---
const generateDataForRange = (startDate: string, endDate: string): MonthlyData => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive

  // Seed generator based on date string to keep it deterministic for same dates
  // This ensures if you look at "Jan 1 - Jan 31" today, it looks the same tomorrow
  let seedVal = (startDate + endDate).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = () => {
      const x = Math.sin(seedVal++) * 10000;
      return x - Math.floor(x);
  };

  // --- Facility Constants ---
  const NUM_COURTS = 8;
  const OPEN_HOURS = 15; // 9 AM - 12 AM
  const PRICE_PER_HOUR = 350; // THB
  const AVG_BOOKING_DURATION = 1.6; // Hours
  const VENDING_SPEND_PER_BOOKING = 85; // THB
  
  // --- Simulation Logic ---
  const totalCapacityHours = days * NUM_COURTS * OPEN_HOURS;
  
  // Utilization fluctuates between 55% and 85% based on "random" factors
  const utilizationRate = 0.55 + (random() * 0.30); 
  
  const soldHours = Math.floor(totalCapacityHours * utilizationRate);
  const bookingsCount = Math.floor(soldHours / AVG_BOOKING_DURATION);

  // Financials
  const courtRevenue = soldHours * PRICE_PER_HOUR;
  const vendingRevenue = bookingsCount * VENDING_SPEND_PER_BOOKING;
  const totalRevenue = courtRevenue + vendingRevenue;

  // Utilities Calculation
  // Electricity: Base load (fridges, servers, standby) + Active load (High Bay Lights + AC per court hour)
  const baseLoadPerDay = 120; // kWh
  const activeLoadPerHour = 3.5; // kWh (AC is heavy)
  const elecUnits = Math.floor((days * baseLoadPerDay) + (soldHours * activeLoadPerHour));
  const elecRate = 5.5; // Commercial THB/unit

  // Water: Showers and Toilets
  const baseWaterPerDay = 1.5; // Units
  const waterPerBooking = 0.12; // Units (Showers)
  const waterUnits = Math.floor((days * baseWaterPerDay) + (bookingsCount * waterPerBooking));
  const waterRate = 18;

  // Court Distribution (Some courts are more popular/closer to entrance)
  const courtUsage = Array.from({ length: NUM_COURTS }, (_, i) => {
    const popularity = 1 + ((random() - 0.5) * 0.4); // +/- 20% variance
    let hours = Math.floor((soldHours / NUM_COURTS) * popularity);
    // Cap at physical limits
    hours = Math.min(hours, days * OPEN_HOURS);
    return {
      id: `c-${i}`,
      name: `Court ${i + 1}`,
      hours,
      capacity: days * OPEN_HOURS
    };
  });

  return {
    days,
    revenue: totalRevenue,
    bookings: bookingsCount,
    vendingSales: vendingRevenue,
    electricity: {
      units: elecUnits,
      rate: elecRate,
      cost: Math.floor(elecUnits * elecRate)
    },
    water: {
      units: waterUnits,
      rate: waterRate,
      cost: Math.floor(waterUnits * waterRate)
    },
    courtUsage
  };
};

const Analytics: React.FC = () => {
  // Helper to get default ranges
  const getRange = (offsetMonths: number) => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - offsetMonths, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - offsetMonths + 1, 0); // Last day of month
    
    // For current month (offset 0), end date is today
    if (offsetMonths === 0) {
        return { 
            startDate: start.toISOString().split('T')[0], 
            endDate: new Date().toISOString().split('T')[0] 
        };
    }
    return { 
        startDate: start.toISOString().split('T')[0], 
        endDate: end.toISOString().split('T')[0] 
    };
  };

  const [columns, setColumns] = useState<ColumnConfig[]>([
    { id: 1, ...getRange(0), visibleMetrics: [...DEFAULT_METRICS] },
    { id: 2, ...getRange(1), visibleMetrics: [...DEFAULT_METRICS] },
    { id: 3, ...getRange(2), visibleMetrics: [...DEFAULT_METRICS] },
  ]);

  const [editingColumnId, setEditingColumnId] = useState<number | null>(null);

  // --- Handlers ---
  const handleDateChange = (colId: number, field: 'startDate' | 'endDate', val: string) => {
    setColumns(cols => cols.map(c => c.id === colId ? { ...c, [field]: val } : c));
  };

  const toggleMetric = (colId: number, metric: MetricType) => {
    setColumns(cols => cols.map(c => {
      if (c.id !== colId) return c;
      const exists = c.visibleMetrics.includes(metric);
      return {
        ...c,
        visibleMetrics: exists 
          ? c.visibleMetrics.filter(m => m !== metric)
          : [...c.visibleMetrics, metric]
      };
    }));
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(val);

  // --- Render Component ---
  return (
    <div className="h-full flex flex-col space-y-6 pb-6">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-light text-gray-900">Comparative Analytics</h2>
          <p className="text-gray-500 text-sm">Compare performance, utility costs, and usage across date ranges.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-y-auto pr-1">
        {columns.map((col) => {
          const data = generateDataForRange(col.startDate, col.endDate);
          const isEditing = editingColumnId === col.id;

          return (
            <GlassCard key={col.id} className="flex flex-col h-full !p-0 overflow-hidden relative border-t-4 border-t-brand-orange/50 transition-all hover:shadow-lg">
              
              {/* Column Header - Date Range Picker */}
              <div className="p-4 border-b border-gray-100 bg-white/50 backdrop-blur-md sticky top-0 z-10">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date Range</span>
                    <button 
                        onClick={() => setEditingColumnId(col.id)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-brand-orange transition-colors"
                    >
                        <Settings size={16} />
                    </button>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <input 
                            type="date" 
                            value={col.startDate}
                            onChange={(e) => handleDateChange(col.id, 'startDate', e.target.value)}
                            className="w-full bg-white/50 border border-gray-200 rounded-lg px-2 py-1 text-xs font-medium text-gray-700 focus:ring-1 focus:ring-brand-orange focus:border-brand-orange outline-none"
                        />
                        <span className="text-gray-400"><ArrowRight size={12}/></span>
                        <input 
                            type="date" 
                            value={col.endDate}
                            onChange={(e) => handleDateChange(col.id, 'endDate', e.target.value)}
                            className="w-full bg-white/50 border border-gray-200 rounded-lg px-2 py-1 text-xs font-medium text-gray-700 focus:ring-1 focus:ring-brand-orange focus:border-brand-orange outline-none"
                        />
                    </div>
                    <div className="text-xs text-gray-400 text-center font-medium bg-gray-50 py-0.5 rounded">
                        {data.days} Days Selected
                    </div>
                </div>
              </div>

              {/* Column Content */}
              <div className="p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
                
                {/* Revenue Card */}
                {col.visibleMetrics.includes('revenue') && (
                  <div className="bg-white/60 rounded-xl p-4 border border-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                      <div className="p-1.5 bg-green-100 text-green-600 rounded-lg"><DollarSign size={14} /></div>
                      <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(data.revenue)}</div>
                    <div className="text-xs text-gray-500 mt-1">Avg. {formatCurrency(data.revenue / data.days)} / day</div>
                  </div>
                )}

                {/* Electricity Card */}
                {col.visibleMetrics.includes('electricity') && (
                  <div className="bg-white/60 rounded-xl p-4 border border-white shadow-sm group hover:shadow-md transition-shadow">
                     <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-gray-500">
                          <div className="p-1.5 bg-yellow-100 text-yellow-600 rounded-lg"><Zap size={14} /></div>
                          <span className="text-xs font-bold uppercase tracking-wider">Electricity</span>
                        </div>
                        <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">Avg ฿{data.electricity.rate}/unit</span>
                     </div>
                     <div className="flex justify-between items-end">
                       <div>
                         <div className="text-xl font-bold text-gray-900">{formatCurrency(data.electricity.cost)}</div>
                         <div className="text-xs text-gray-500 mt-0.5">{data.electricity.units.toLocaleString()} kWh ({Math.round(data.electricity.units/data.days)}/day)</div>
                       </div>
                       <div className="h-8 w-1 bg-gray-200 rounded-full overflow-hidden">
                          <div className="bg-yellow-400 w-full h-full transform translate-y-1/2" /> 
                       </div>
                     </div>
                  </div>
                )}

                {/* Water Card */}
                {col.visibleMetrics.includes('water') && (
                  <div className="bg-white/60 rounded-xl p-4 border border-white shadow-sm hover:shadow-md transition-shadow">
                     <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-gray-500">
                          <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><Droplets size={14} /></div>
                          <span className="text-xs font-bold uppercase tracking-wider">Water</span>
                        </div>
                        <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">Avg ฿{data.water.rate}/unit</span>
                     </div>
                     <div className="flex justify-between items-end">
                       <div>
                         <div className="text-xl font-bold text-gray-900">{formatCurrency(data.water.cost)}</div>
                         <div className="text-xs text-gray-500 mt-0.5">{data.water.units.toLocaleString()} units ({Math.round(data.water.units/data.days)}/day)</div>
                       </div>
                       <div className="h-8 w-1 bg-gray-200 rounded-full overflow-hidden">
                          <div className="bg-blue-400 w-full h-full transform translate-y-1/3" /> 
                       </div>
                     </div>
                  </div>
                )}

                {/* Bookings Card */}
                {col.visibleMetrics.includes('bookings') && (
                  <div className="bg-white/60 rounded-xl p-4 border border-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                      <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg"><Calendar size={14} /></div>
                      <span className="text-xs font-bold uppercase tracking-wider">Total Bookings</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{data.bookings}</div>
                    <div className="text-xs text-gray-500 mt-1">~{Math.round(data.bookings / data.days)} bookings/day</div>
                  </div>
                )}

                {/* Vending Card */}
                {col.visibleMetrics.includes('vending') && (
                  <div className="bg-white/60 rounded-xl p-4 border border-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                      <div className="p-1.5 bg-pink-100 text-pink-600 rounded-lg"><Users size={14} /></div>
                      <span className="text-xs font-bold uppercase tracking-wider">Vending Revenue</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(data.vendingSales)}</div>
                    <div className="text-xs text-gray-500 mt-1">~{formatCurrency(data.vendingSales / data.bookings)} per booking</div>
                  </div>
                )}

                {/* Court Usage Breakdown */}
                {col.visibleMetrics.includes('court_usage') && (
                  <div className="bg-white/60 rounded-xl p-4 border border-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 text-gray-500 mb-4">
                      <div className="p-1.5 bg-orange-100 text-brand-orange rounded-lg"><BarChart3 size={14} /></div>
                      <span className="text-xs font-bold uppercase tracking-wider">Court Usage</span>
                    </div>
                    
                    <div className="space-y-3">
                      {data.courtUsage.map((court) => {
                        const pct = Math.round((court.hours / court.capacity) * 100);
                        return (
                          <div key={court.id}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-medium text-gray-700">{court.name}</span>
                              <span className="text-gray-500">{court.hours}h ({pct}%)</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${pct > 75 ? 'bg-green-500' : pct > 45 ? 'bg-brand-orange' : 'bg-gray-400'}`}
                                style={{ width: `${pct}%` }} 
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Edit Metrics Overlay */}
              <AnimatePresence>
                {isEditing && (
                  <motion.div 
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    className="absolute inset-0 z-20 bg-white/95 backdrop-blur-xl p-4 flex flex-col"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-gray-900">Customize View</h3>
                      <button onClick={() => setEditingColumnId(null)} className="p-1 hover:bg-gray-100 rounded-full"><X size={20}/></button>
                    </div>
                    <div className="flex-1 space-y-2 overflow-y-auto">
                      {ALL_METRICS.map((metric) => {
                        const isSelected = col.visibleMetrics.includes(metric.id);
                        return (
                          <button 
                            key={metric.id}
                            onClick={() => toggleMetric(col.id, metric.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                              isSelected 
                                ? 'bg-orange-50 border-brand-orange text-brand-orange' 
                                : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                            <span className="text-sm font-medium">{metric.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    <NeonButton className="w-full mt-4" onClick={() => setEditingColumnId(null)}>
                      Done
                    </NeonButton>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};

export default Analytics;