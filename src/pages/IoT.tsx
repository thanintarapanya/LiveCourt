import React, { useState } from 'react';
import { GlassCard, NeonButton } from '@/components/SharedComponents';
import { Device } from '@/types';
import { 
  Lightbulb, Fan, Wind, Power, AlertTriangle, RefreshCw, 
  DoorOpen, Flame, Droplets, Video, Cctv, Zap,
  CheckCircle2, XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const initialDevices: Device[] = [
  // Lights
  { id: 'd1', name: 'Court 1 Main Light', type: 'light', status: 'online', value: 80, location: 'Court 1' },
  { id: 'd3', name: 'Court 2 Main Light', type: 'light', status: 'online', value: 0, location: 'Court 2' },
  { id: 'd5', name: 'Court 3 Main Light', type: 'light', status: 'offline', value: 0, location: 'Court 3' },
  { id: 'd6', name: 'Court 4 Main Light', type: 'light', status: 'online', value: 100, location: 'Court 4' },
  
  // Air (AC/Fan)
  { id: 'd2', name: 'Court 1 AC Unit', type: 'ac', status: 'online', value: true, location: 'Court 1' },
  { id: 'd4', name: 'Ventilation Fan A', type: 'fan', status: 'warning', value: true, location: 'Hallway' },
  
  // Camera
  { id: 'c1', name: 'Entrance Cam', type: 'camera', status: 'online', value: true, location: 'Main Entrance' },
  { id: 'c2', name: 'Court Area Cam', type: 'camera', status: 'online', value: true, location: 'Zone A' },

  // Door
  { id: 'dr1', name: 'Main Gate', type: 'door', status: 'online', value: false, location: 'Entrance' },
  { id: 'dr2', name: 'Staff Room', type: 'door', status: 'online', value: false, location: 'Office' },

  // Smoke
  { id: 's1', name: 'Kitchen Smoke Det', type: 'smoke', status: 'online', value: false, location: 'Cafeteria' },
  { id: 's2', name: 'Hallway Smoke Det', type: 'smoke', status: 'online', value: false, location: 'Zone B' },

  // Utility
  { id: 'u1', name: 'Water Pump', type: 'utility', status: 'online', value: true, location: 'Basement' },
  { id: 'u2', name: 'Main Generator', type: 'utility', status: 'warning', value: false, location: 'External' },
];

type Category = 'All' | 'Light' | 'Air' | 'Camera' | 'Door' | 'Smoke' | 'Utility';

const IoT: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [activeCategory, setActiveCategory] = useState<Category>('All');

  const categories: Category[] = ['All', 'Light', 'Air', 'Camera', 'Door', 'Smoke', 'Utility'];

  const toggleDevice = (id: string) => {
    setDevices(prev => prev.map(d => {
      if (d.id === id) {
        // For boolean values, just flip. For numbers (lights), flip between 0 and 100.
        if (typeof d.value === 'boolean') return { ...d, value: !d.value };
        return { ...d, value: d.value > 0 ? 0 : 100 };
      }
      return d;
    }));
  };

  const handleSliderChange = (id: string, newVal: number) => {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, value: newVal } : d));
  };

  const getIcon = (type: Device['type']) => {
    switch (type) {
      case 'light': return Lightbulb;
      case 'ac': return Wind;
      case 'fan': return Fan;
      case 'camera': return Video;
      case 'door': return DoorOpen;
      case 'smoke': return Flame;
      case 'utility': return Zap; // Or Droplets if water
      default: return Power;
    }
  };

  const getFilteredDevices = () => {
    if (activeCategory === 'All') return devices;
    
    return devices.filter(d => {
      switch (activeCategory) {
        case 'Light': return d.type === 'light';
        case 'Air': return d.type === 'ac' || d.type === 'fan';
        case 'Camera': return d.type === 'camera';
        case 'Door': return d.type === 'door';
        case 'Smoke': return d.type === 'smoke';
        case 'Utility': return d.type === 'utility';
        default: return true;
      }
    });
  };

  const getStatusColor = (status: Device['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500 shadow-[0_0_8px_#22c55e]';
      case 'warning': return 'bg-yellow-500 animate-pulse';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-light text-gray-900 mb-1">IoT Control Center</h2>
          <p className="text-gray-500 text-sm">Monitor and control your facility's connected ecosystem.</p>
        </div>
        <NeonButton variant="secondary" icon={<RefreshCw size={16} />}>Scan Devices</NeonButton>
      </div>

      {/* Categories Tab */}
      <div className="flex flex-wrap gap-2 pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border ${
              activeCategory === cat
                ? 'bg-brand-orange text-white border-brand-orange shadow-md shadow-orange-200'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {getFilteredDevices().map((device) => {
            const Icon = getIcon(device.type);
            const isOn = typeof device.value === 'boolean' ? device.value : device.value > 0;
            const isDanger = device.type === 'smoke' && isOn;
            const isDoorOpen = device.type === 'door' && isOn;
            
            return (
              <GlassCard 
                key={device.id} 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`p-6 relative group overflow-hidden border-t-4 transition-all ${
                  isDanger ? 'border-t-red-500 bg-red-50' : 
                  isOn ? 'border-t-brand-orange' : 'border-t-transparent'
                }`}
              >
                 <div className="flex justify-between items-start mb-6">
                   <div className="flex items-center gap-4">
                     <div className={`p-3.5 rounded-2xl transition-all duration-300 ${
                       isDanger ? 'bg-red-100 text-red-600 animate-pulse' :
                       isOn ? 'bg-orange-100 text-brand-orange shadow-inner' : 'bg-gray-100 text-gray-400'
                     }`}>
                       <Icon size={24} />
                     </div>
                     <div>
                       <h3 className="text-gray-900 font-semibold">{device.name}</h3>
                       <p className="text-xs text-gray-500 font-medium">{device.location}</p>
                     </div>
                   </div>
                   <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(device.status)}`} />
                 </div>
  
                 <div className="space-y-4">
                   {device.type === 'camera' ? (
                     <div className="relative rounded-lg overflow-hidden h-24 bg-gray-900 group-hover:shadow-md transition-shadow">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Cctv className="text-gray-700 opacity-20" size={48} />
                        </div>
                        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-white font-medium">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                          LIVE
                        </div>
                        <NeonButton className="!absolute !bottom-2 !right-2 !py-1 !px-3 !text-xs !bg-white/10 hover:!bg-white/20 !backdrop-blur-md !border-white/20" variant="secondary">View</NeonButton>
                     </div>
                   ) : device.type === 'door' ? (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                         <span className="text-sm text-gray-600 font-medium">Status</span>
                         <div className={`flex items-center gap-2 text-sm font-bold ${isDoorOpen ? 'text-orange-600' : 'text-green-600'}`}>
                           {isDoorOpen ? (
                             <>Open <AlertTriangle size={14} /></>
                           ) : (
                             <>Closed <CheckCircle2 size={14} /></>
                           )}
                         </div>
                         <button 
                           onClick={() => toggleDevice(device.id)}
                           className="ml-2 text-xs text-blue-600 hover:underline font-medium"
                         >
                           {isDoorOpen ? 'Lock' : 'Unlock'}
                         </button>
                      </div>
                   ) : device.type === 'smoke' ? (
                      <div className={`flex items-center justify-between p-3 rounded-xl border ${isDanger ? 'bg-red-100 border-red-200' : 'bg-green-50 border-green-100'}`}>
                         <span className={`text-sm font-medium ${isDanger ? 'text-red-800' : 'text-green-800'}`}>
                            {isDanger ? 'SMOKE DETECTED' : 'System Normal'}
                         </span>
                         {isDanger && <AlertTriangle size={18} className="text-red-600 animate-bounce" />}
                      </div>
                   ) : (
                     // Default Toggle (Light, AC, Fan, Utility)
                     <div className="flex items-center justify-between">
                       <span className="text-sm text-gray-500 font-medium">
                         {device.type === 'light' ? 'Light Status' : 'Power Status'}
                       </span>
                       <button 
                         onClick={() => toggleDevice(device.id)}
                         className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isOn ? 'bg-brand-orange' : 'bg-gray-300'}`}
                       >
                         <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isOn ? 'translate-x-6' : 'translate-x-0'}`} />
                       </button>
                     </div>
                   )}
                 </div>
  
                 {device.status === 'warning' && (
                   <div className="mt-4 flex items-center gap-2 text-yellow-700 text-xs bg-yellow-50 p-2.5 rounded-lg border border-yellow-200 font-medium">
                     <AlertTriangle size={14} />
                     <span>Maintenance required. Check system.</span>
                   </div>
                 )}
              </GlassCard>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default IoT;