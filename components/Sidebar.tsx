import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Wifi, Calendar, Settings, Activity, LogOut, 
  ChevronRight, ChevronDown, ShoppingBag, CreditCard, Refrigerator, 
  Users, Store, Package 
} from 'lucide-react';
import { NavItem, ViewState, User } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  user: User;
  onLogout: () => void;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, view: ViewState.DASHBOARD },
  { id: 'iot', label: 'IoT Control', icon: Wifi, view: ViewState.IOT },
  { id: 'reservations', label: 'Reservations', icon: Calendar, view: ViewState.RESERVATIONS },
  { id: 'members', label: 'Members', icon: Users, view: ViewState.MEMBERS },
  { 
    id: 'commerce', 
    label: 'Sales & Rental', 
    icon: Store, 
    children: [
      { id: 'pos', label: 'Point of Sale', icon: CreditCard, view: ViewState.POS },
      { id: 'rental', label: 'Gear Rentals', icon: Package, view: ViewState.RENTAL },
      { id: 'vending', label: 'Smart Vending', icon: Refrigerator, view: ViewState.VENDING },
    ]
  },
  { id: 'analytics', label: 'Analytics', icon: Activity, view: ViewState.ANALYTICS },
  { id: 'settings', label: 'Settings', icon: Settings, view: ViewState.SETTINGS },
];

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, user, onLogout }) => {
  // Track expanded parent items
  const [expandedItems, setExpandedItems] = useState<string[]>(['commerce']);

  // Auto-expand group if a child is active
  useEffect(() => {
    const activeParent = navItems.find(item => 
      item.children?.some(child => child.view === currentView)
    );
    if (activeParent && !expandedItems.includes(activeParent.id)) {
      setExpandedItems(prev => [...prev, activeParent.id]);
    }
  }, [currentView]);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const renderNavItem = (item: NavItem, isChild = false) => {
    const isActive = item.view === currentView;
    const isExpanded = expandedItems.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const isParentActive = hasChildren && item.children?.some(child => child.view === currentView);

    return (
      <div key={item.id} className="mb-1">
        <button
          onClick={() => {
            if (hasChildren) {
              toggleExpand(item.id);
            } else if (item.view) {
              onChangeView(item.view);
            }
          }}
          className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
            isActive 
              ? 'text-brand-orange bg-orange-50/80' 
              : isParentActive 
                ? 'text-brand-orange/80 bg-orange-50/30'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
          } ${isChild ? 'pl-11 text-sm' : ''}`}
        >
          <div className="flex items-center gap-4 relative z-10">
            {isActive && !isChild && (
              <motion.div
                layoutId="activeTab"
                className="absolute -left-3 top-0 bottom-0 w-1 bg-brand-orange rounded-r-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <item.icon size={isChild ? 18 : 20} className={`transition-colors ${isActive || isParentActive ? 'text-brand-orange' : 'text-gray-400 group-hover:text-gray-600'}`} />
            <span className={`hidden lg:block font-medium tracking-wide ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
          </div>

          {hasChildren && (
            <div className="hidden lg:block text-gray-400">
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
          )}
        </button>

        {/* Sub-menu */}
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-1 space-y-1">
                {item.children?.map(child => renderNavItem(child, true))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <motion.aside 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed left-0 top-0 h-full w-20 lg:w-64 bg-white/80 backdrop-blur-xl border-r border-white/50 shadow-sm flex flex-col z-50"
    >
      <div className="p-6 flex items-center gap-3">
        <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-brand-orange to-red-500 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/30">
          <Activity size={18} className="text-white" />
        </div>
        <span className="hidden lg:block text-xl font-light tracking-wide text-gray-900">
          CourtFlow
        </span>
      </div>

      <nav className="flex-1 px-4 py-8 overflow-y-auto custom-scrollbar">
        {navItems.map(item => renderNavItem(item))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2 py-3 bg-gray-50/50 rounded-xl border border-gray-100">
          <div className="w-8 h-8 rounded-full bg-gray-200 border border-white overflow-hidden shrink-0">
            <img src={`https://picsum.photos/seed/${user.id}/200`} alt="User" className="w-full h-full object-cover opacity-90" />
          </div>
          <div className="hidden lg:block flex-1 min-w-0">
            <p className="text-sm text-gray-900 font-semibold truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          <button 
            onClick={onLogout}
            className="hidden lg:flex p-2 hover:bg-white rounded-lg text-gray-400 hover:text-red-500 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;