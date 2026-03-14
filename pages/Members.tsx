import React, { useState, useMemo } from 'react';
import { GlassCard, NeonButton, Badge } from '../components/UI';
import { 
  Users, Search, UserPlus, Filter, Phone, Mail, 
  MoreVertical, Calendar, Star, ShieldCheck, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
type MemberStatus = 'Active' | 'Inactive' | 'Pending';
type MembershipTier = 'Basic' | 'Pro' | 'VIP';

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: MemberStatus;
  tier: MembershipTier;
  joinDate: string;
  points: number;
  lastVisit?: string;
}

// --- Mock Data ---
const initialMembers: Member[] = [
  { id: 'M-001', firstName: 'Alice', lastName: 'Morgan', email: 'alice.m@example.com', phone: '+66 81 234 5678', status: 'Active', tier: 'VIP', joinDate: '2023-01-15', points: 1250, lastVisit: '2023-10-25' },
  { id: 'M-002', firstName: 'Bob', lastName: 'King', email: 'bob.king@example.com', phone: '+66 89 987 6543', status: 'Active', tier: 'Pro', joinDate: '2023-03-10', points: 450, lastVisit: '2023-10-20' },
  { id: 'M-003', firstName: 'Charlie', lastName: 'Davis', email: 'charlie.d@example.com', phone: '+66 82 456 7890', status: 'Inactive', tier: 'Basic', joinDate: '2022-11-05', points: 20, lastVisit: '2023-08-15' },
  { id: 'M-004', firstName: 'Diana', lastName: 'Prince', email: 'diana.p@example.com', phone: '+66 83 567 8901', status: 'Pending', tier: 'Basic', joinDate: '2023-10-26', points: 0 },
  { id: 'M-005', firstName: 'Evan', lastName: 'Wright', email: 'evan.w@example.com', phone: '+66 84 678 9012', status: 'Active', tier: 'Pro', joinDate: '2023-06-15', points: 320, lastVisit: '2023-10-27' },
];

const Members: React.FC = () => {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | MemberStatus>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Member Form State
  const [newMember, setNewMember] = useState<Partial<Member>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    tier: 'Basic',
    status: 'Active'
  });

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchesSearch = 
        m.firstName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.lastName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'All' || m.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [members, searchQuery, filterStatus]);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const member: Member = {
      id: `M-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      firstName: newMember.firstName || '',
      lastName: newMember.lastName || '',
      email: newMember.email || '',
      phone: newMember.phone || '',
      status: (newMember.status as MemberStatus) || 'Active',
      tier: (newMember.tier as MembershipTier) || 'Basic',
      joinDate: new Date().toISOString().split('T')[0],
      points: 0
    };
    setMembers([...members, member]);
    setIsModalOpen(false);
    setNewMember({ firstName: '', lastName: '', email: '', phone: '', tier: 'Basic', status: 'Active' });
  };

  const getTierColor = (tier: MembershipTier) => {
    switch (tier) {
      case 'VIP': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Pro': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: MemberStatus) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Inactive': return 'bg-red-50 text-red-500';
      case 'Pending': return 'bg-yellow-50 text-yellow-600';
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-light text-gray-900">Member Directory</h2>
          <p className="text-gray-500 text-sm">Manage customer relationships and memberships.</p>
        </div>
        <NeonButton icon={<UserPlus size={18} />} onClick={() => setIsModalOpen(true)}>
          Add Member
        </NeonButton>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Total Members</p>
            <h3 className="text-2xl font-bold text-gray-900">{members.length}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Users size={20} />
          </div>
        </GlassCard>
        <GlassCard className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Active Now</p>
            <h3 className="text-2xl font-bold text-gray-900">{members.filter(m => m.status === 'Active').length}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
            <ShieldCheck size={20} />
          </div>
        </GlassCard>
        <GlassCard className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">New (This Month)</p>
            <h3 className="text-2xl font-bold text-gray-900">3</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <Star size={20} />
          </div>
        </GlassCard>
      </div>

      {/* Toolbar */}
      <GlassCard className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between bg-white/50">
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
           {(['All', 'Active', 'Inactive', 'Pending'] as const).map(status => (
             <button
               key={status}
               onClick={() => setFilterStatus(status)}
               className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                 filterStatus === status 
                   ? 'bg-brand-black text-white shadow-md' 
                   : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
               }`}
             >
               {status}
             </button>
           ))}
        </div>
        <div className="relative w-full md:w-64 group">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-orange transition-colors" size={16} />
           <input 
             type="text" 
             placeholder="Search name or email..." 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full bg-white border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all"
           />
        </div>
      </GlassCard>

      {/* Members List */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Member</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Tier & Points</th>
                <th className="px-6 py-4">Join Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence>
                {filteredMembers.map(member => (
                  <motion.tr 
                    key={member.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold border border-white shadow-sm">
                          {member.firstName[0]}{member.lastName[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{member.firstName} {member.lastName}</div>
                          <div className="text-xs text-gray-500 font-mono">{member.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs text-gray-600">
                        <div className="flex items-center gap-1.5"><Mail size={12} className="text-gray-400"/> {member.email}</div>
                        <div className="flex items-center gap-1.5"><Phone size={12} className="text-gray-400"/> {member.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex flex-col gap-1">
                          <Badge color={getTierColor(member.tier)}>{member.tier} Member</Badge>
                          <span className="text-xs text-gray-500 font-medium ml-1">{member.points} pts</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                        <Calendar size={14} className="text-gray-400"/>
                        {new Date(member.joinDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-gray-400 hover:text-brand-orange hover:bg-orange-50 rounded-lg transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filteredMembers.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              <Users size={48} className="mx-auto mb-3 opacity-20"/>
              <p>No members found matching your search.</p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Add Member Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <GlassCard 
              className="w-full max-w-md !bg-white shadow-2xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                <h3 className="font-medium text-gray-900">Add New Member</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
              
              <form onSubmit={handleAddMember} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">First Name</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none"
                      value={newMember.firstName}
                      onChange={(e) => setNewMember({...newMember, firstName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Last Name</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none"
                      value={newMember.lastName}
                      onChange={(e) => setNewMember({...newMember, lastName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                  <input 
                    required
                    type="email" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none"
                    value={newMember.email}
                    onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                   <label className="text-xs font-bold text-gray-500 uppercase">Phone</label>
                   <input 
                     required
                     type="tel" 
                     className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none"
                     value={newMember.phone}
                     onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Tier</label>
                    <select 
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brand-orange outline-none"
                      value={newMember.tier}
                      onChange={(e) => setNewMember({...newMember, tier: e.target.value as MembershipTier})}
                    >
                      <option value="Basic">Basic</option>
                      <option value="Pro">Pro</option>
                      <option value="VIP">VIP</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                     <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                     <select 
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brand-orange outline-none"
                        value={newMember.status}
                        onChange={(e) => setNewMember({...newMember, status: e.target.value as MemberStatus})}
                      >
                        <option value="Active">Active</option>
                        <option value="Pending">Pending</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <NeonButton type="submit" className="flex-1">
                    Create Member
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

export default Members;