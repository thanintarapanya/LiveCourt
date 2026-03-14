import React, { useState } from 'react';
import { GlassCard, NeonButton, Badge } from '@/components/UI';
import { 
  Refrigerator, AlertTriangle, RefreshCw, DollarSign, Package, 
  CheckCircle2, Wifi, WifiOff, Zap, MoreVertical 
} from 'lucide-react';
import { motion } from 'framer-motion';

interface VendingMachine {
  id: string;
  name: string;
  location: string;
  type: 'Drinks' | 'Snacks' | 'Mixed';
  status: 'online' | 'offline' | 'maintenance';
  stockLevel: number; // Percentage
  temperature: number; // Celsius
  dailySales: number;
  alerts?: string[];
}

const initialMachines: VendingMachine[] = [
  { id: 'VM-001', name: 'Court 1 Hydration', location: 'Zone A', type: 'Drinks', status: 'online', stockLevel: 78, temperature: 4, dailySales: 1250 },
  { id: 'VM-002', name: 'Lobby Snacks', location: 'Main Entrance', type: 'Snacks', status: 'online', stockLevel: 45, temperature: 18, dailySales: 850 },
  { id: 'VM-003', name: 'Locker Room Dispenser', location: 'Changing Room', type: 'Mixed', status: 'maintenance', stockLevel: 12, temperature: 12, dailySales: 0, alerts: ['Coin Acceptor Jammed'] },
  { id: 'VM-004', name: 'Court 4 Hydration', location: 'Zone B', type: 'Drinks', status: 'offline', stockLevel: 60, temperature: 6, dailySales: 420 },
];

const Vending: React.FC = () => {
  const [machines, setMachines] = useState(initialMachines);
  
  const handleRestock = (id: string) => {
    setMachines(prev => prev.map(m => m.id === id ? {...m, stockLevel: 100, alerts: undefined, status: 'online'} : m));
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-light text-gray-900">Smart Vending Network</h2>
          <p className="text-gray-500 text-sm">Monitor stock, health, and sales of automated dispensers.</p>
        </div>
        <NeonButton icon={<RefreshCw size={16}/>}>Refresh Status</NeonButton>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-4 flex items-center justify-between">
           <div>
             <p className="text-xs font-bold text-gray-400 uppercase">Today's Revenue</p>
             <h3 className="text-2xl font-bold text-gray-900">฿2,520</h3>
           </div>
           <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
             <DollarSign size={20} />
           </div>
        </GlassCard>
        <GlassCard className="p-4 flex items-center justify-between">
           <div>
             <p className="text-xs font-bold text-gray-400 uppercase">Network Status</p>
             <h3 className="text-2xl font-bold text-gray-900">75% <span className="text-sm font-medium text-gray-400">Online</span></h3>
           </div>
           <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
             <Wifi size={20} />
           </div>
        </GlassCard>
        <GlassCard className="p-4 flex items-center justify-between">
           <div>
             <p className="text-xs font-bold text-gray-400 uppercase">Restock Needed</p>
             <h3 className="text-2xl font-bold text-gray-900">2 <span className="text-sm font-medium text-gray-400">Machines</span></h3>
           </div>
           <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
             <Package size={20} />
           </div>
        </GlassCard>
      </div>

      {/* Machines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {machines.map(machine => (
          <GlassCard key={machine.id} className="p-0 overflow-hidden relative group">
             {/* Status Header */}
             <div className={`h-1.5 w-full ${
               machine.status === 'online' ? 'bg-green-500' : 
               machine.status === 'maintenance' ? 'bg-orange-500' : 'bg-gray-400'
             }`} />
             
             <div className="p-6">
               <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600">
                     <Refrigerator size={20} />
                   </div>
                   <div>
                     <h3 className="font-semibold text-gray-900">{machine.name}</h3>
                     <p className="text-xs text-gray-500">{machine.location} • {machine.type}</p>
                   </div>
                 </div>
                 <div className={`p-1.5 rounded-full ${
                   machine.status === 'online' ? 'bg-green-100 text-green-600' : 
                   machine.status === 'maintenance' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'
                 }`}>
                    {machine.status === 'online' ? <Wifi size={14} /> : machine.status === 'maintenance' ? <Zap size={14} /> : <WifiOff size={14} />}
                 </div>
               </div>

               {/* Metrics */}
               <div className="grid grid-cols-2 gap-4 mb-6">
                 <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                   <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Stock Level</p>
                   <div className="flex items-end justify-between">
                     <span className="text-lg font-bold text-gray-900">{machine.stockLevel}%</span>
                     <div className="flex gap-0.5 h-3 items-end">
                       {[1,2,3,4,5].map(i => (
                         <div key={i} className={`w-1 rounded-sm ${machine.stockLevel >= i*20 ? 'bg-brand-orange h-full' : 'bg-gray-200 h-1/2'}`} />
                       ))}
                     </div>
                   </div>
                 </div>
                 <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                   <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Temperature</p>
                   <span className="text-lg font-bold text-gray-900">{machine.temperature}°C</span>
                 </div>
               </div>

               {/* Alerts */}
               {machine.alerts && (
                 <div className="mb-4 bg-red-50 text-red-700 text-xs p-3 rounded-lg flex items-center gap-2 border border-red-100">
                   <AlertTriangle size={14} />
                   <span>{machine.alerts[0]}</span>
                 </div>
               )}

               <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                 <div className="text-xs text-gray-500">
                   Sales: <span className="font-bold text-gray-900">฿{machine.dailySales}</span>
                 </div>
                 {machine.stockLevel < 20 || machine.status === 'maintenance' ? (
                    <NeonButton 
                      variant="secondary" 
                      className="!py-1.5 !px-3 !text-xs"
                      onClick={() => handleRestock(machine.id)}
                    >
                      Restock / Fix
                    </NeonButton>
                 ) : (
                    <button className="text-gray-400 hover:text-brand-orange transition-colors">
                      <MoreVertical size={16} />
                    </button>
                 )}
               </div>
             </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
export default Vending;