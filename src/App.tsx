import React, { useState, useEffect } from 'react';
import { User, UserRole, ViewState } from '@/types';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import IoT from '@/pages/IoT';
import Reservations from '@/pages/Reservations';
import Analytics from '@/pages/Analytics';
import Rental from '@/pages/Rental';
import POS from '@/pages/POS';
import Vending from '@/pages/Vending';
import Members from '@/pages/Members';
import Settings from '@/pages/Settings';
import Sidebar from '@/components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, LogOut } from 'lucide-react';
import { auth } from '@/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setCurrentUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email || '',
          role: firebaseUser.email === 'info@embeddedlinuxgroup.com' ? UserRole.SUPER_ADMIN : UserRole.STAFF,
          avatarUrl: firebaseUser.photoURL || undefined
        });
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentView(ViewState.DASHBOARD);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-brand-grey flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-200 rounded-full" />
          <div className="absolute top-0 left-0 w-12 h-12 border-4 border-brand-orange rounded-full border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login />;
  }

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard />;
      case ViewState.IOT:
        return <IoT />;
      case ViewState.RESERVATIONS:
        return <Reservations />;
      case ViewState.MEMBERS:
        return <Members />;
      case ViewState.RENTAL:
        return <Rental />;
      case ViewState.POS:
        return <POS />;
      case ViewState.VENDING:
        return <Vending />;
      case ViewState.ANALYTICS:
        return <Analytics />;
      case ViewState.SETTINGS:
        return <Settings />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
            <h3 className="text-xl font-light">Module Under Construction</h3>
            <p className="text-sm mt-2">Check back later for updates.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-brand-grey text-gray-900 font-sans selection:bg-brand-orange/20 selection:text-brand-orange">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        user={currentUser}
        onLogout={handleLogout}
      />

      <main className="pl-20 lg:pl-64 min-h-screen transition-all duration-300">
        {/* Top Header */}
        <header className="sticky top-0 z-40 px-8 py-5 flex justify-between items-center backdrop-blur-md bg-white/60 border-b border-white/50">
           <div className="flex-1 max-w-md hidden md:block">
             <div className="relative group">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-orange transition-colors" size={16} />
               <input 
                 type="text" 
                 placeholder="Search bookings, devices, or customers..." 
                 className="w-full bg-white border border-gray-200 rounded-full py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition-all shadow-sm"
               />
             </div>
           </div>
           
           <div className="flex items-center gap-4">
             <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900">
               <Bell size={20} />
               <span className="absolute top-2 right-2.5 w-2 h-2 bg-brand-orange rounded-full animate-pulse shadow-sm" />
             </button>
           </div>
        </header>

        {/* Content Area */}
        <div className="p-4 md:p-8 w-full max-w-[1800px] mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default App;