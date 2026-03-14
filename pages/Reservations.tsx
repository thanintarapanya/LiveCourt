import React, { useState, useMemo, useEffect } from 'react';
import { GlassCard, NeonButton, Badge } from '../components/UI';
import { 
  Calendar as CalendarIcon, Clock, User, ChevronLeft, ChevronRight, 
  Filter, Plus, Wrench, Sparkles, X, Check, AlertCircle, Users, 
  Trash2, Lock, Move, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

// --- Types ---
type BookingType = 'booking' | 'maintenance' | 'cleaning';
type BookingStatus = 'confirmed' | 'pending';

interface Booking {
  id: string;
  courtId: number; // 0-7 for Courts 1-8
  date: string; // YYYY-MM-DD
  time: string; // HH:00
  user: string; // Name or "Maintenance"
  duration: number; // Hours
  type: BookingType;
  status: BookingStatus;
  groupSize?: number;
}

const COURTS = Array.from({ length: 8 }, (_, i) => `Court ${i + 1}`);
const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
const ADMIN_PASSWORD = 'admin123';

// --- Mock Initial Data ---
const generateInitialBookings = (): Booking[] => {
  const today = new Date().toISOString().split('T')[0];
  return [
    { id: '1', courtId: 0, date: today, time: '09:00', user: 'Alice M.', duration: 2, type: 'booking', status: 'confirmed', groupSize: 4 },
    { id: '2', courtId: 1, date: today, time: '10:00', user: 'Bob K.', duration: 1, type: 'booking', status: 'pending', groupSize: 2 },
    { id: '3', courtId: 2, date: today, time: '14:00', user: 'Team A', duration: 3, type: 'booking', status: 'confirmed', groupSize: 6 },
    { id: '4', courtId: 3, date: today, time: '18:00', user: 'Coach T.', duration: 2, type: 'booking', status: 'confirmed', groupSize: 2 },
    { id: '5', courtId: 1, date: today, time: '13:00', user: 'Court Repair', duration: 2, type: 'maintenance', status: 'confirmed' },
    { id: '6', courtId: 6, date: today, time: '20:00', user: 'Night League', duration: 2, type: 'booking', status: 'confirmed', groupSize: 8 },
  ];
};

const Reservations: React.FC = () => {
  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isSyncing, setIsSyncing] = useState(true);
  
  // Real-time Firestore Sync
  useEffect(() => {
    setIsSyncing(true);
    const q = query(collection(db, 'reservations'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const firestoreBookings: Booking[] = snapshot.docs.map(doc => {
        const data = doc.data();
        
        // Convert Firestore data to UI Booking type
        // Note: In a real app, we'd handle date/time more robustly
        const start = data.startTime ? new Date(data.startTime) : new Date();
        const end = data.endTime ? new Date(data.endTime) : new Date();
        const duration = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60)));
        
        return {
          id: doc.id,
          courtId: parseInt(data.courtId) || 0,
          date: start.toISOString().split('T')[0],
          time: `${start.getHours().toString().padStart(2, '0')}:00`,
          user: data.customerName || 'Unknown',
          duration: duration,
          type: 'booking',
          status: data.status || 'confirmed',
          groupSize: data.groupSize || 2
        };
      });
      
      setBookings(firestoreBookings);
      setIsSyncing(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setIsSyncing(false);
    });

    return () => unsubscribe();
  }, []);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Booking>>({
    type: 'booking',
    courtId: 0,
    time: '08:00',
    duration: 1,
    user: '',
    groupSize: 2
  });

  // Security Modal State
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);

  // Filter State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'booking' | 'maintenance' | 'cleaning'>('all');

  // Drag State
  const [draggedBookingId, setDraggedBookingId] = useState<string | null>(null);

  // --- Helpers ---
  const formatDateDisplay = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const dateKey = currentDate.toISOString().split('T')[0];

  const handleDateChange = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + days);
    setCurrentDate(newDate);
  };

  // --- Security Logic ---
  const requestAction = (action: () => void) => {
    setPendingAction(() => action);
    setPasswordInput('');
    setAuthError(false);
    setIsSecurityOpen(true);
  };

  const confirmSecurityAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      if (pendingAction) pendingAction();
      setIsSecurityOpen(false);
      setPendingAction(null);
    } else {
      setAuthError(true);
    }
  };

  // --- CRUD Logic ---
  const openNewBooking = (courtId = 0, time = '08:00') => {
    setEditingId(null);
    setFormData({ type: 'booking', courtId, time, duration: 1, user: '', groupSize: 2 });
    setIsModalOpen(true);
  };

  const openEditBooking = (booking: Booking) => {
    setEditingId(booking.id);
    setFormData({ ...booking });
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!editingId) return;
    requestAction(async () => {
      try {
        await deleteDoc(doc(db, 'reservations', editingId));
        setIsModalOpen(false);
      } catch (error) {
        console.error("Error deleting booking:", error);
      }
    });
  };

  const handleSaveBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.user && formData.type === 'booking') return;

    const saveLogic = async () => {
      try {
        const startHour = parseInt(formData.time!.split(':')[0]);
        const startDate = new Date(currentDate);
        startDate.setHours(startHour, 0, 0, 0);
        
        const endDate = new Date(startDate);
        endDate.setHours(startHour + (formData.duration || 1));

        const reservationData = {
          courtId: formData.courtId?.toString() || "0",
          customerName: formData.type === 'booking' ? formData.user! : (formData.type === 'maintenance' ? 'Scheduled Maintenance' : 'Cleaning Service'),
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
          status: 'confirmed',
          groupSize: formData.type === 'booking' ? (formData.groupSize || 2) : 0,
          updatedAt: serverTimestamp()
        };

        if (editingId) {
          await updateDoc(doc(db, 'reservations', editingId), reservationData);
        } else {
          await addDoc(collection(db, 'reservations'), {
            ...reservationData,
            createdAt: serverTimestamp()
          });
        }
        setIsModalOpen(false);
      } catch (error) {
        console.error("Error saving booking:", error);
      }
    };

    if (editingId) {
      requestAction(saveLogic);
    } else {
      saveLogic(); 
    }
  };

  // --- Drag & Drop Logic ---
  const onDragStart = (e: React.DragEvent, bookingId: string) => {
    e.dataTransfer.setData('bookingId', bookingId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedBookingId(bookingId);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (e: React.DragEvent, targetCourtId: number, targetTime: string) => {
    e.preventDefault();
    const bookingId = e.dataTransfer.getData('bookingId');
    
    if (bookingId) {
      requestAction(() => {
        setBookings(prev => prev.map(b => {
          if (b.id === bookingId) {
            return { ...b, courtId: targetCourtId, time: targetTime };
          }
          return b;
        }));
      });
    }
    setDraggedBookingId(null);
  };

  // --- Filter Logic ---
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchesDate = b.date === dateKey;
      if (!matchesDate) return false;
      if (activeFilter === 'all') return true;
      return b.type === activeFilter;
    });
  }, [bookings, dateKey, activeFilter]);

  // --- Render Helpers ---
  const getBookingStyles = (type: BookingType, status: BookingStatus) => {
    if (type === 'maintenance') return 'bg-yellow-50 border-yellow-200 text-yellow-800 striped-bg-yellow';
    if (type === 'cleaning') return 'bg-blue-50 border-blue-200 text-blue-800';
    return status === 'confirmed' 
      ? 'bg-orange-100 border-orange-200 text-orange-900' 
      : 'bg-gray-100 border-gray-200 text-gray-600 border-dashed';
  };

  const getIcon = (type: BookingType) => {
    if (type === 'maintenance') return <Wrench size={10} />;
    if (type === 'cleaning') return <Sparkles size={10} />;
    return <User size={10} />;
  };

  const mockLineReservation = async () => {
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courtId: Math.floor(Math.random() * 8).toString(),
          customerName: "LINE User " + Math.floor(Math.random() * 1000),
          lineUserId: "U" + Math.random().toString(36).substr(2, 9),
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 3600000).toISOString()
        })
      });
      const data = await response.json();
      console.log("Mock LINE reservation response:", data);
    } catch (error) {
      console.error("Mock API error:", error);
    }
  };

  return (
    <div className="space-y-6 pb-4 h-[calc(100vh-140px)] flex flex-col relative">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-light text-gray-900">Reservations</h2>
          <p className="text-gray-500 text-sm">Real-time sync enabled. API ready for LINE Mini App.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
           {/* Mock API Trigger */}
           <button 
             onClick={mockLineReservation}
             className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm font-medium hover:bg-green-100 transition-all"
           >
             <MessageSquare size={16} />
             Mock LINE Booking
           </button>
           {/* Date Nav */}
           <div className="flex items-center bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
             <button onClick={() => handleDateChange(-1)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors"><ChevronLeft size={18} /></button>
             <span className="px-4 text-sm font-medium text-gray-700 min-w-[140px] text-center">{formatDateDisplay(currentDate)}</span>
             <button onClick={() => handleDateChange(1)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors"><ChevronRight size={18} /></button>
           </div>

           {/* Filter Button */}
           <div className="relative">
             <NeonButton 
               variant={activeFilter !== 'all' ? 'primary' : 'secondary'} 
               icon={<Filter size={16} />}
               onClick={() => setIsFilterOpen(!isFilterOpen)}
             >
               {activeFilter === 'all' ? 'Filter' : activeFilter === 'booking' ? 'Bookings' : activeFilter}
             </NeonButton>
             
             <AnimatePresence>
               {isFilterOpen && (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: 10 }}
                   className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-30 overflow-hidden"
                 >
                   {['all', 'booking', 'maintenance', 'cleaning'].map((f) => (
                     <button
                       key={f}
                       onClick={() => { setActiveFilter(f as any); setIsFilterOpen(false); }}
                       className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 capitalize ${activeFilter === f ? 'text-brand-orange font-semibold bg-orange-50' : 'text-gray-700'}`}
                     >
                       {f === 'booking' ? 'Bookings' : f}
                     </button>
                   ))}
                 </motion.div>
               )}
             </AnimatePresence>
           </div>

           <NeonButton icon={<Plus size={18} />} onClick={() => openNewBooking()}>New Booking</NeonButton>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <GlassCard className="flex-1 overflow-hidden flex flex-col !p-0 shadow-md relative">
        <div className="flex-1 overflow-auto custom-scrollbar">
          <div className="min-w-[1200px]">
             {/* Sticky Header */}
             <div className="grid grid-cols-[80px_repeat(8,1fr)] border-b border-gray-200 bg-gray-50/95 backdrop-blur-md sticky top-0 z-30 shadow-sm">
               <div className="p-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider border-r border-gray-100 flex items-center justify-center">
                 <Clock size={14} />
               </div>
               {COURTS.map((court, i) => (
                 <div key={court} className="p-4 text-center text-sm font-semibold text-gray-700 border-r border-gray-100 last:border-r-0">
                   {court}
                 </div>
               ))}
             </div>
     
             {/* Scrollable Body */}
             <div className="bg-white/40 pt-6">
               {TIME_SLOTS.map((time, timeIndex) => (
                 <div key={time} className="grid grid-cols-[80px_repeat(8,1fr)] border-b border-gray-100 hover:bg-gray-50/30 transition-colors group relative min-h-[64px]">
                   {/* Time Column */}
                   <div className="p-3 text-center text-xs text-gray-400 border-r border-gray-100 relative bg-white/50">
                      <span className="-translate-y-1/2 top-0 absolute right-1/2 translate-x-1/2 block bg-white/80 px-1.5 py-0.5 rounded-md border border-gray-100 z-10 font-medium font-mono">{time}</span>
                   </div>
                   
                   {/* Court Columns */}
                   {COURTS.map((_, courtIndex) => {
                     const booking = filteredBookings.find(b => b.courtId === courtIndex && b.time === time);
                     
                     return (
                       <div 
                         key={courtIndex} 
                         className={`relative border-r border-gray-100 last:border-r-0 group/cell transition-colors ${draggedBookingId ? 'hover:bg-brand-orange/10' : ''}`}
                         onDragOver={onDragOver}
                         onDrop={(e) => onDrop(e, courtIndex, time)}
                       >
                         {/* Ghost Add Button (Visible on Hover if empty) */}
                         {!booking && (
                           <button 
                             onClick={() => openNewBooking(courtIndex, time)}
                             className="absolute inset-0 w-full h-full opacity-0 group-hover/cell:opacity-100 bg-brand-orange/5 flex items-center justify-center text-brand-orange transition-all z-0"
                           >
                             <Plus size={20} />
                           </button>
                         )}
     
                         {booking && (
                           <motion.div 
                             layoutId={booking.id}
                             draggable
                             onDragStart={(e) => {
                               // framer motion handles visuals, but we need the native event for data
                               // Using native onDragStart logic
                               onDragStart(e as unknown as React.DragEvent, booking.id);
                             }}
                             onClick={(e) => {
                               e.stopPropagation();
                               openEditBooking(booking);
                             }}
                             initial={{ opacity: 0, scale: 0.95 }}
                             animate={{ opacity: 1, scale: 1 }}
                             className={`absolute inset-x-1 top-1 rounded-lg p-2.5 border text-xs cursor-pointer z-10 transition-transform hover:scale-[1.02] hover:shadow-md shadow-sm flex flex-col justify-between overflow-hidden group/card ${getBookingStyles(booking.type, booking.status)}`}
                             style={{ height: `calc(${booking.duration * 100}% + ${(booking.duration - 1) * 1}px - 8px)` }}
                           >
                             <div>
                               <div className="font-bold flex items-center gap-1.5 mb-0.5">
                                  {getIcon(booking.type)}
                                  <span className="truncate">{booking.user}</span>
                               </div>
                               <div className="flex items-center gap-2 opacity-80 font-medium text-[10px]">
                                 <span className="flex items-center gap-0.5"><Clock size={10} /> {booking.duration}h</span>
                                 {booking.groupSize && <span className="flex items-center gap-0.5"><Users size={10} /> {booking.groupSize}</span>}
                               </div>
                             </div>
                             
                             <div className="flex justify-between items-end">
                               {booking.status === 'pending' && (
                                  <div className="bg-white/50 px-1.5 py-0.5 rounded text-[10px] font-bold self-start mt-1">PENDING</div>
                               )}
                               <div className="opacity-0 group-hover/card:opacity-100 transition-opacity ml-auto">
                                  <Move size={12} className="text-current opacity-50" />
                               </div>
                             </div>
                           </motion.div>
                         )}
                       </div>
                     );
                   })}
                 </div>
               ))}
               {/* Spacer at bottom */}
               <div className="h-20 w-full"></div>
             </div>
          </div>
        </div>
      </GlassCard>

      {/* --- Security Modal --- */}
      <AnimatePresence>
        {isSecurityOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
             <GlassCard className="w-full max-w-sm !bg-white p-6 shadow-2xl animate-blob">
                <div className="flex flex-col items-center mb-6">
                   <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-3">
                     <Lock size={24} />
                   </div>
                   <h3 className="text-lg font-semibold text-gray-900">Admin Authorization</h3>
                   <p className="text-sm text-center text-gray-500 mt-1">
                     Enter admin password to save changes.
                   </p>
                </div>
                
                <form onSubmit={confirmSecurityAction} className="space-y-4">
                  <div className="space-y-1">
                    <input 
                      type="password"
                      autoFocus
                      placeholder="Password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className={`w-full bg-gray-50 border rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 transition-all ${
                        authError 
                          ? 'border-red-300 ring-red-100 focus:border-red-500' 
                          : 'border-gray-200 focus:border-brand-orange focus:ring-brand-orange/20'
                      }`}
                    />
                    {authError && <p className="text-xs text-red-500 font-medium ml-1">Incorrect password. Try 'admin123'.</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button" 
                      onClick={() => { setIsSecurityOpen(false); setPendingAction(null); }}
                      className="py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <NeonButton type="submit" className="justify-center">
                      Confirm
                    </NeonButton>
                  </div>
                </form>
             </GlassCard>
          </div>
        )}
      </AnimatePresence>

      {/* --- New/Edit Booking Modal --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <GlassCard 
              className="w-full max-w-md !bg-white shadow-2xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                <h3 className="font-medium text-gray-900">{editingId ? 'Edit Booking' : 'Add Schedule Block'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
              
              <form onSubmit={handleSaveBooking} className="p-6 space-y-4">
                {/* Type Selection */}
                <div className="grid grid-cols-3 gap-2 bg-gray-100 p-1 rounded-xl mb-4">
                  {(['booking', 'maintenance', 'cleaning'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({...formData, type})}
                      className={`py-1.5 px-3 rounded-lg text-xs font-semibold capitalize transition-all ${
                        formData.type === type 
                          ? 'bg-white text-brand-orange shadow-sm' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {formData.type === 'booking' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">User / Group Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. John Doe or Badminton Club"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none"
                        value={formData.user}
                        onChange={(e) => setFormData({...formData, user: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Number of People</label>
                      <input 
                        type="number" 
                        required
                        min="1"
                        max="8"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none"
                        value={formData.groupSize}
                        onChange={(e) => setFormData({...formData, groupSize: Number(e.target.value)})}
                      />
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Court</label>
                    <select 
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brand-orange outline-none"
                      value={formData.courtId}
                      onChange={(e) => setFormData({...formData, courtId: Number(e.target.value)})}
                    >
                      {COURTS.map((c, i) => <option key={i} value={i}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Time</label>
                     <select 
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brand-orange outline-none"
                        value={formData.time}
                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                      >
                        {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Duration</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" min="1" max="5" step="1"
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: Number(e.target.value)})}
                    />
                    <span className="font-medium text-gray-900 w-12 text-right">{formData.duration}h</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  {editingId && (
                     <NeonButton 
                       type="button" 
                       variant="danger" 
                       icon={<Trash2 size={16}/>}
                       onClick={handleDelete}
                       className="!px-3"
                     >
                     </NeonButton>
                  )}
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <NeonButton type="submit" className="flex-1">
                    {editingId ? 'Save Changes' : (formData.type === 'booking' ? 'Confirm Booking' : `Add ${formData.type}`)}
                  </NeonButton>
                </div>
              </form>
            </GlassCard>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Reservations;