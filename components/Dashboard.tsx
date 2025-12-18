
import React, { useState, useEffect } from 'react';
import { User, Order } from '../types';
import { mockService } from '../services/mockDataService';
import { 
  Box, Truck, MapPin, AlertTriangle, 
  ChevronRight, LayoutDashboard, Tags, Users, Package, Settings
} from 'lucide-react';

interface DashboardProps {
  user: User;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState('Dashboard');

  useEffect(() => {
    const allOrders = mockService.getOrders(user.id);
    setOrders(allOrders);
  }, [user]);

  const sortedOrders = [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getStatusBadge = (status: string) => {
    switch (status) {
        case 'Pending': return 'bg-[#FFF7ED] text-[#EA580C]';
        case 'Delivered': return 'bg-[#F0FDF4] text-[#16A34A]';
        default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">Partner Operations</h1>
        <p className="text-gray-500 mt-1 text-lg">Manage orders, price requests, and network.</p>
      </div>

      {/* Internal Tab Navigation */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {[
            { name: 'Dashboard', icon: LayoutDashboard },
            { name: 'Price Requests', icon: Tags },
            { name: 'Customers', icon: Users },
            { name: 'Sell', icon: Package },
            { name: 'Settings', icon: Settings }
        ].map((tab) => (
          <button 
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.name 
                ? 'bg-[#0F172A] text-white shadow-lg' 
                : 'text-[#64748B] hover:bg-gray-100'
            }`}
          >
            <tab.icon size={18} />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* TO PACK */}
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-start mb-12">
                <div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">To Pack</p>
                    <h3 className="text-6xl font-black text-gray-900">0</h3>
                </div>
                <div className="p-4 bg-white border border-gray-100 rounded-2xl text-blue-100 group-hover:text-blue-200 transition-colors">
                    <Box size={48} strokeWidth={1.5} />
                </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full px-8 pb-6">
                <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-100" style={{ width: '0%' }}></div>
                </div>
                <p className="text-sm font-bold text-gray-400 mt-4 uppercase tracking-wider">All packed</p>
            </div>
        </div>

        {/* LOGISTICS */}
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-start mb-12">
                <div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Logistics</p>
                    <h3 className="text-6xl font-black text-gray-900">0</h3>
                </div>
                <div className="p-4 bg-white border border-gray-100 rounded-2xl text-purple-100 group-hover:text-purple-200 transition-colors">
                    <Truck size={48} strokeWidth={1.5} />
                </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full px-8 pb-6">
                <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-100" style={{ width: '0%' }}></div>
                </div>
                <p className="text-sm font-bold text-gray-400 mt-4 uppercase tracking-wider">Waiting for drivers</p>
            </div>
        </div>

        {/* IN TRANSIT */}
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-start mb-12">
                <div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">In Transit</p>
                    <h3 className="text-6xl font-black text-gray-900">0</h3>
                </div>
                <div className="p-4 bg-white border border-gray-100 rounded-2xl text-emerald-100 group-hover:text-emerald-200 transition-colors">
                    <MapPin size={48} strokeWidth={1.5} />
                </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full px-8 pb-6">
                <div className="h-1.5 w-full bg-[#10B981] rounded-full overflow-hidden">
                    <div className="h-full bg-[#10B981]" style={{ width: '100%' }}></div>
                </div>
                <p className="text-sm font-bold text-emerald-500 mt-4 uppercase tracking-wider">Live tracking active</p>
            </div>
        </div>
      </div>

      {/* Urgent Banner */}
      <div className="bg-[#FEF2F2] border border-[#FEE2E2] rounded-3xl p-8 flex items-center gap-6 shadow-sm">
        <div className="w-16 h-16 bg-[#FFF1F2] rounded-3xl flex items-center justify-center text-[#F43F5E] shadow-inner">
            <AlertTriangle size={32} />
        </div>
        <div>
            <h2 className="text-2xl font-black text-[#991B1B] tracking-tight">Urgent: Orders Awaiting Acceptance</h2>
            <p className="text-[#B91C1C] mt-1 font-bold text-lg opacity-90">You have {orders.filter(o => o.status === 'Pending').length} orders that need to be accepted within 60 minutes.</p>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedOrders.map((order) => {
            const customer = mockService.getCustomers().find(c => c.id === order.buyerId);
            return (
                <div key={order.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col items-center text-center hover:shadow-md transition-all group">
                    <div className="w-full flex justify-between items-center mb-12">
                        <span className={`px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getStatusBadge(order.status)}`}>
                            {order.status}
                        </span>
                        <span className="text-xs font-bold text-gray-300 tracking-tighter">#{order.id.split('-')[1] || order.id}</span>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center mb-12">
                        <h4 className="text-2xl font-black text-[#0F172A] tracking-tight leading-none mb-3">
                            {customer?.businessName}
                        </h4>
                        <div className="space-y-1">
                            <p className="text-gray-400 font-bold text-sm uppercase tracking-wide">{order.items.length} Items</p>
                            <p className="text-gray-300 font-bold text-sm">${order.totalAmount.toFixed(2)}</p>
                        </div>
                    </div>

                    <button 
                        className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                            order.status === 'Pending' 
                            ? 'bg-[#EA580C] text-white shadow-[0_10px_20px_-10px_#EA580C] hover:scale-[1.02]' 
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100 flex items-center justify-center gap-2'
                        }`}
                    >
                        {order.status === 'Pending' ? 'Accept Order' : (
                            <>
                                View Details
                                <ChevronRight size={16} />
                            </>
                        )}
                    </button>
                </div>
            );
        })}
      </div>
    </div>
  );
};
