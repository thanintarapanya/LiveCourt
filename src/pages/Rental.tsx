import React, { useState } from 'react';
import { GlassCard, NeonButton, Badge } from '@/components/UI';
import { Search, Package, Clock, AlertTriangle, RotateCcw, CheckCircle2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
interface RentalItem {
  id: string;
  name: string;
  category: 'Racket' | 'Shoes' | 'Shuttlecock Tube';
  size?: string;
  status: 'Available' | 'Rented' | 'Maintenance' | 'Lost';
  condition: 'New' | 'Good' | 'Fair' | 'Poor';
  lastRentedBy?: string;
  rentedAt?: string;
  hourlyRate: number;
}

// --- Mock Data ---
const initialInventory: RentalItem[] = [
  { id: 'R001', name: 'Yonex Astrox 99', category: 'Racket', status: 'Available', condition: 'New', hourlyRate: 150 },
  { id: 'R002', name: 'Yonex Astrox 99', category: 'Racket', status: 'Rented', condition: 'Good', lastRentedBy: 'John Doe', rentedAt: '2023-10-27T10:30:00', hourlyRate: 150 },
  { id: 'R003', name: 'Li-Ning Woods N90', category: 'Racket', status: 'Maintenance', condition: 'Fair', hourlyRate: 120 },
  { id: 'S001', name: 'Yonex Power Cushion', category: 'Shoes', size: '42', status: 'Available', condition: 'Good', hourlyRate: 80 },
  { id: 'S002', name: 'Yonex Power Cushion', category: 'Shoes', size: '43', status: 'Rented', condition: 'Good', lastRentedBy: 'Mike Ross', rentedAt: '2023-10-27T11:00:00', hourlyRate: 80 },
  { id: 'T001', name: 'RSL No.1 Tourney', category: 'Shuttlecock Tube', status: 'Available', condition: 'New', hourlyRate: 450 }, // Selling mostly, but keeping simplified structure
];

const Rental: React.FC = () => {
  const [items, setItems] = useState<RentalItem[]>(initialInventory);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleReturn = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'Available', lastRentedBy: undefined, rentedAt: undefined } : item
    ));
  };

  const handleRent = (id: string) => {
    // In a real app, this would open a user selection modal
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'Rented', lastRentedBy: 'Walk-in Guest', rentedAt: new Date().toISOString() } : item
    ));
  };

  const getStatusColor = (status: RentalItem['status']) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-700 border-green-200';
      case 'Rented': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Maintenance': return 'bg-red-100 text-red-700 border-red-200';
      case 'Lost': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-light text-gray-900">Rental & Gear Inventory</h2>
          <p className="text-gray-500 text-sm">Track equipment usage, condition, and availability.</p>
        </div>
        <NeonButton icon={<Package size={16} />}>Add New Item</NeonButton>
      </div>

      {/* Filters */}
      <GlassCard className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between bg-white/50">
         <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {['All', 'Racket', 'Shoes', 'Shuttlecock Tube'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  filterCategory === cat 
                    ? 'bg-brand-orange text-white shadow-md shadow-orange-200' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
         </div>
         <div className="relative w-full md:w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-orange transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search ID or Name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all"
            />
         </div>
      </GlassCard>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence>
          {filteredItems.map(item => (
            <GlassCard key={item.id} className="p-5 flex flex-col justify-between group hover:border-brand-orange/30 transition-colors">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <Badge color={getStatusColor(item.status)}>{item.status}</Badge>
                  <span className="text-xs font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{item.id}</span>
                </div>
                
                <h3 className="font-semibold text-gray-900 text-lg mb-1">{item.name}</h3>
                <div className="text-xs text-gray-500 mb-4 flex items-center gap-2">
                  <span>{item.category}</span>
                  {item.size && <span className="w-1 h-1 bg-gray-300 rounded-full"/>}
                  {item.size && <span>Size: {item.size}</span>}
                </div>

                {item.status === 'Rented' && (
                  <div className="bg-orange-50 rounded-lg p-3 mb-4 border border-orange-100">
                    <div className="flex items-center gap-2 text-xs text-orange-800 font-medium mb-1">
                      <User size={12} />
                      {item.lastRentedBy}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-orange-600">
                      <Clock size={10} />
                      Rented: {item.rentedAt ? new Date(item.rentedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                    </div>
                  </div>
                )}
                
                {item.status === 'Maintenance' && (
                  <div className="bg-red-50 rounded-lg p-3 mb-4 border border-red-100 flex items-center gap-2 text-xs text-red-700">
                    <AlertTriangle size={14} />
                    <span>String broken - Repair scheduled</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 mt-auto flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900">฿{item.hourlyRate}<span className="text-xs font-normal text-gray-400">/hr</span></span>
                
                {item.status === 'Available' ? (
                  <button 
                    onClick={() => handleRent(item.id)}
                    className="px-3 py-1.5 bg-brand-black text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Rent Now
                  </button>
                ) : item.status === 'Rented' ? (
                  <button 
                    onClick={() => handleReturn(item.id)}
                    className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 flex items-center gap-1"
                  >
                    <RotateCcw size={12}/> Return
                  </button>
                ) : (
                  <button disabled className="px-3 py-1.5 bg-gray-100 text-gray-400 text-xs font-medium rounded-lg cursor-not-allowed">
                    Unavailable
                  </button>
                )}
              </div>
            </GlassCard>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Rental;