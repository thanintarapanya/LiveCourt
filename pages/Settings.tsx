import React, { useState } from 'react';
import { GlassCard, NeonButton, Badge } from '../components/UI';
import { 
  User, Bell, Shield, Globe, Server, CreditCard, 
  Save, ToggleLeft, ToggleRight, Plus, Trash2, Mail, Calendar,
  Zap, Check, Download, Receipt
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserRole } from '../types';

// Mock Data
const initialUsers = [
  { id: 1, name: 'Admin User', email: 'admin@courtflow.io', role: 'SuperAdmin', status: 'Active' },
  { id: 2, name: 'Sarah Manager', email: 'sarah@courtflow.io', role: 'Admin', status: 'Active' },
  { id: 3, name: 'Mike Staff', email: 'mike@courtflow.io', role: 'Staff', status: 'Away' },
];

const invoices = [
  { id: 'INV-001', date: 'Oct 01, 2023', amount: 2500, status: 'Paid' },
  { id: 'INV-002', date: 'Sep 01, 2023', amount: 2500, status: 'Paid' },
  { id: 'INV-003', date: 'Aug 01, 2023', amount: 2500, status: 'Paid' },
];

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'users' | 'billing' | 'integrations' | 'iot'>('general');
  const [notifications, setNotifications] = useState({ email: true, push: true, sms: false });
  const [users, setUsers] = useState(initialUsers);

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'users', label: 'Team & Roles', icon: User },
    { id: 'billing', label: 'Billing & Plan', icon: CreditCard },
    { id: 'integrations', label: 'Integrations', icon: Zap },
    { id: 'iot', label: 'IoT Config', icon: Server },
  ];

  const renderGeneral = () => (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Facility Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Facility Name</label>
            <input type="text" defaultValue="CourtFlow Arena BKK" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-brand-orange outline-none" />
          </div>
          <div className="space-y-1">
             <label className="text-xs font-bold text-gray-500 uppercase">Contact Email</label>
             <input type="email" defaultValue="support@courtflow.io" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-brand-orange outline-none" />
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
        <div className="space-y-4">
          {Object.entries(notifications).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${val ? 'bg-orange-100 text-brand-orange' : 'bg-gray-100 text-gray-400'}`}>
                  {key === 'email' ? <Mail size={18}/> : key === 'push' ? <Bell size={18}/> : <Shield size={18}/>}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 capitalize">{key} Notifications</p>
                  <p className="text-xs text-gray-500">Receive updates via {key}</p>
                </div>
              </div>
              <button 
                onClick={() => setNotifications(prev => ({...prev, [key]: !val}))}
                className={`transition-colors duration-300 ${val ? 'text-brand-orange' : 'text-gray-300'}`}
              >
                {val ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
              </button>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );

  const renderUsers = () => (
    <GlassCard className="p-0 overflow-hidden">
       <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
         <h3 className="font-medium text-gray-900">Team Members</h3>
         <NeonButton variant="secondary" icon={<Plus size={14}/>} className="!py-1.5 !px-3 !text-xs">Add Member</NeonButton>
       </div>
       <div className="overflow-x-auto">
         <table className="w-full text-left text-sm">
           <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
             <tr>
               <th className="px-6 py-3">Name</th>
               <th className="px-6 py-3">Role</th>
               <th className="px-6 py-3">Status</th>
               <th className="px-6 py-3">Action</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-gray-100">
             {users.map(u => (
               <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                 <td className="px-6 py-4">
                   <div className="font-medium text-gray-900">{u.name}</div>
                   <div className="text-xs text-gray-500">{u.email}</div>
                 </td>
                 <td className="px-6 py-4">
                   <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                     u.role === 'SuperAdmin' ? 'bg-purple-100 text-purple-800' :
                     u.role === 'Admin' ? 'bg-blue-100 text-blue-800' :
                     'bg-gray-100 text-gray-800'
                   }`}>
                     {u.role}
                   </span>
                 </td>
                 <td className="px-6 py-4">
                   <div className="flex items-center gap-1.5">
                     <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                     <span className="text-gray-600">{u.status}</span>
                   </div>
                 </td>
                 <td className="px-6 py-4">
                   <button className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>
    </GlassCard>
  );

  const renderBilling = () => (
    <div className="space-y-6">
      {/* Plan Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-black to-gray-800 p-6 text-white shadow-xl">
           <div className="absolute top-0 right-0 p-3 opacity-10">
              <Zap size={150} />
           </div>
           
           <div className="relative z-10 flex flex-col h-full justify-between">
             <div className="flex justify-between items-start">
               <div>
                  <div className="flex items-center gap-2 mb-1">
                     <h3 className="text-2xl font-bold tracking-tight">Professional Plan</h3>
                     <Badge color="bg-brand-orange text-white border-none">Active</Badge>
                  </div>
                  <p className="text-gray-400 text-sm">Advanced automation for growing venues.</p>
               </div>
               <div className="text-right">
                  <span className="text-3xl font-bold">฿2,500</span>
                  <span className="text-gray-400 text-sm"> / month</span>
               </div>
             </div>

             <div className="mt-8 space-y-4">
               <div className="flex flex-col gap-1">
                 <div className="flex justify-between text-xs font-medium text-gray-300">
                   <span>Courts Managed</span>
                   <span>8 / 10 Courts</span>
                 </div>
                 <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                   <div className="h-full bg-brand-orange w-[80%] rounded-full" />
                 </div>
               </div>
               
               <div className="flex gap-4 pt-2">
                 <button className="bg-white text-brand-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors">
                   Upgrade Plan
                 </button>
                 <button className="text-gray-300 hover:text-white px-2 text-xs font-medium transition-colors">
                   Manage Subscription
                 </button>
               </div>
             </div>
           </div>
        </div>

        {/* Payment Method */}
        <GlassCard className="p-6 flex flex-col justify-between">
           <div>
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard size={18} className="text-gray-400"/> Payment Method
              </h4>
              <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl mb-3">
                 <div className="w-10 h-6 bg-blue-900 rounded flex items-center justify-center text-[8px] font-bold text-white italic">
                   VISA
                 </div>
                 <div>
                   <p className="text-sm font-bold text-gray-900">•••• 4242</p>
                   <p className="text-xs text-gray-500">Expires 12/24</p>
                 </div>
              </div>
           </div>
           <NeonButton variant="secondary" className="w-full text-xs">Update Card</NeonButton>
        </GlassCard>
      </div>

      {/* Invoice History */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
           <h3 className="font-medium text-gray-900 flex items-center gap-2">
             <Receipt size={16} className="text-gray-400"/> Invoice History
           </h3>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-white text-gray-500 font-medium border-b border-gray-100">
            <tr>
              <th className="px-6 py-3">Invoice</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Download</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{inv.id}</td>
                <td className="px-6 py-4 text-gray-600">{inv.date}</td>
                <td className="px-6 py-4 text-gray-900">฿{inv.amount.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    <Check size={10} /> {inv.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                   <button className="text-gray-400 hover:text-brand-orange transition-colors">
                     <Download size={16} />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );

  const renderIntegrations = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[
        { name: 'SCB Payment Gateway', status: 'Connected', icon: CreditCard, color: 'bg-purple-600' },
        { name: 'Twilio SMS', status: 'Disconnected', icon: Mail, color: 'bg-red-500' },
        { name: 'Google Calendar', status: 'Connected', icon: Calendar, color: 'bg-blue-500' }, 
      ].map((item, i) => (
        <GlassCard key={i} className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-md ${item.color}`}>
              <item.icon size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{item.name}</h4>
              <p className={`text-xs font-medium ${item.status === 'Connected' ? 'text-green-600' : 'text-gray-400'}`}>
                {item.status}
              </p>
            </div>
          </div>
          <NeonButton 
            variant={item.status === 'Connected' ? 'secondary' : 'primary'} 
            className="!py-1.5 !px-3 !text-xs"
          >
            {item.status === 'Connected' ? 'Configure' : 'Connect'}
          </NeonButton>
        </GlassCard>
      ))}
    </div>
  );

  const renderIoT = () => (
    <div className="space-y-6">
      <GlassCard className="p-6 border-l-4 border-l-brand-orange">
        <div className="flex justify-between items-start mb-4">
          <div>
             <h3 className="text-lg font-medium text-gray-900">MQTT Broker Connection</h3>
             <p className="text-sm text-gray-500">Manage real-time device communication.</p>
          </div>
          <Badge color="bg-green-100 text-green-700">Connected</Badge>
        </div>
        <div className="grid gap-4">
           <div className="space-y-1">
             <label className="text-xs font-bold text-gray-500 uppercase">Broker URL</label>
             <input type="text" defaultValue="wss://broker.courtflow.io:8083/mqtt" disabled className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-500 font-mono" />
           </div>
           <div className="space-y-1">
             <label className="text-xs font-bold text-gray-500 uppercase">Topic Prefix</label>
             <input type="text" defaultValue="courtflow/bkk/main/" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm font-mono focus:ring-1 focus:ring-brand-orange outline-none" />
           </div>
        </div>
      </GlassCard>
      
      <div className="flex justify-end">
        <NeonButton icon={<Save size={16}/>}>Save Changes</NeonButton>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      {/* Sidebar for Settings */}
      <GlassCard className="w-full lg:w-64 flex-shrink-0 !p-2 h-fit bg-white/60">
        <nav className="space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? 'bg-white text-brand-orange shadow-sm border border-gray-100' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>
      </GlassCard>

      {/* Content Area */}
      <div className="flex-1 min-w-0">
        <div className="mb-6">
          <h2 className="text-2xl font-light text-gray-900">{tabs.find(t => t.id === activeTab)?.label} Settings</h2>
          <p className="text-sm text-gray-500">Manage your application preferences and configurations.</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'general' && renderGeneral()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'billing' && renderBilling()}
            {activeTab === 'integrations' && renderIntegrations()}
            {activeTab === 'iot' && renderIoT()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Settings;