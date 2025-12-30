import React, { useState, useEffect } from 'react';
import { User, Order, Product, Customer } from '../types';
import { mockService } from '../services/mockDataService';
import { AiOpportunityMatcher } from './AiOpportunityMatcher';
import { DeliListingForm } from './DeliListingForm';
import { Settings as SettingsComponent } from './Settings';
import { 
  Package, Truck, MapPin, Users, Clock, CheckCircle, 
  Settings, AlertTriangle, LayoutGrid, Search, Store, Camera
} from 'lucide-react';

interface DashboardProps {
  user: User;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('Order Management');
  const [orderSubTab, setOrderSubTab] = useState('PENDING');
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const allOrders = mockService.getOrders(user.id).filter(o => o.sellerId === user.id);
    setOrders(allOrders);
    setCustomers(mockService.getCustomers());
  }, [user]);

  const pendingAcceptance = orders.filter(o => o.status === 'Pending');
  const acceptedOrders = orders.filter(o => o.status === 'Confirmed' || o.status === 'Ready for Delivery' || o.status === 'Shipped');
  const fulfilledOrders = orders.filter(o => o.status === 'Delivered');

  const displayedOrders = orderSubTab === 'PENDING' ? pendingAcceptance : orderSubTab === 'ACCEPTED' ? acceptedOrders : fulfilledOrders;

  return (
    <div className="animate-in fade-in duration-500 min-h-screen">
      <div className="mb-10">
        <div className="flex justify-between items-start mb-10">
            <div>
                <h1 className="text-[32px] font-black text-[#0F172A] tracking-tight">Partner Operations</h1>
                <p className="text-gray-500 font-medium text-sm">Manage orders, logistics, and Deli App storefront.</p>
            </div>
            <button className="hidden md:flex items-center gap-2 px-6 py-3 bg-white border border-blue-100 rounded-xl text-blue-600 font-black text-[10px] uppercase tracking-widest shadow-sm">
                <Truck size={18}/> Driver Logistics
            </button>
        </div>

        <div className="flex items-center gap-8 border-b border-gray-100 overflow-x-auto no-scrollbar whitespace-nowrap">
            {[
                { id: 'Order Management', icon: LayoutGrid },
                { id: 'Sell to Deli', icon: Store },
                { id: 'Scanner', icon: Camera },
                { id: 'Customers', icon: Users },
                { id: 'Settings', icon: Settings }
            ].map((tab) => (
            <button 
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
                className={`flex items-center gap-2 pb-4 text-xs font-black uppercase tracking-widest transition-all relative shrink-0 ${
                    activeTab === tab.id ? 'text-gray-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-gray-900 after:rounded-t-full' : 'text-gray-400 hover:text-gray-600'
                }`}
            >
                <tab.icon size={16} />
                {tab.id}
            </button>
            ))}
        </div>
      </div>

      <div className="pb-20">
        {activeTab === 'Order Management' && (
          <div className="space-y-10">
            {pendingAcceptance.length > 0 && (
                <div className="bg-[#FFF1F2] border border-[#FECDD3] rounded-[2rem] p-8 space-y-6 animate-in slide-in-from-top-4 duration-500 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-500 border border-[#FECDD3] shadow-sm"><AlertTriangle size={24}/></div>
                        <div>
                            <h2 className="text-sm font-black text-[#9F1239] uppercase tracking-widest">Awaiting Acceptance</h2>
                            <p className="text-xs text-[#E11D48] font-bold">{pendingAcceptance.length} orders need your attention</p>
                        </div>
                    </div>
                    <button onClick={() => setOrderSubTab('PENDING')} className="w-full py-4 bg-[#F43F5E] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-red-100 transition-all active:scale-[0.98]">Review All Pending</button>
                </div>
            )}

            <div className="space-y-6">
                <div className="bg-gray-100/50 p-1 rounded-xl inline-flex gap-1 border border-gray-200/50 overflow-x-auto no-scrollbar whitespace-nowrap">
                    <button onClick={() => setOrderSubTab('PENDING')} className={`px-8 py-2.5 rounded-lg text-xs font-black uppercase tracking-[0.1em] transition-all flex items-center gap-2 ${orderSubTab === 'PENDING' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Pending</button>
                    <button onClick={() => setOrderSubTab('ACCEPTED')} className={`px-8 py-2.5 rounded-lg text-xs font-black uppercase tracking-[0.1em] transition-all ${orderSubTab === 'ACCEPTED' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Accepted</button>
                    <button onClick={() => setOrderSubTab('FULFILLED')} className={`px-8 py-2.5 rounded-lg text-xs font-black uppercase tracking-[0.1em] transition-all ${orderSubTab === 'FULFILLED' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Fulfilled</button>
                </div>

                <div className="space-y-4">
                    {displayedOrders.length === 0 ? (
                        <div className="py-24 text-center bg-white rounded-3xl border border-gray-100 shadow-sm"><CheckCircle size={48} className="mx-auto text-gray-100 mb-4"/><p className="text-gray-300 font-bold uppercase tracking-widest text-xs">Queue is clear</p></div>
                    ) : displayedOrders.map(order => {
                        const buyer = customers.find(c => c.id === order.buyerId);
                        return (
                            <div key={order.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 flex flex-col md:flex-row justify-between items-center gap-6 hover:border-gray-200 transition-all">
                                <div className="flex items-center gap-6 flex-1 w-full">
                                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 font-black text-xl">{buyer?.businessName.charAt(0)}</div>
                                    <div className="min-w-0"><h3 className="font-bold text-gray-900 truncate">{buyer?.businessName}</h3><p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-tighter">REF: #{order.id.split('-').pop()}</p></div>
                                </div>
                                <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                                    <div className="text-right"><p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Amount</p><p className="font-black text-gray-900">${order.totalAmount.toFixed(2)}</p></div>
                                    <div className="px-6 py-2 rounded-lg bg-gray-50 text-gray-400 font-bold text-xs uppercase">{order.status}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
          </div>
        )}

        {activeTab === 'Sell to Deli' && (
          <div className="py-8"><DeliListingForm user={user} onComplete={() => setActiveTab('Order Management')} /></div>
        )}

        {activeTab === 'Scanner' && (<div className="animate-in fade-in zoom-in-95 duration-500"><AiOpportunityMatcher user={user} /></div>)}
        {activeTab === 'Settings' && (<div className="animate-in fade-in duration-300"><SettingsComponent user={user} onRefreshUser={() => {}} /></div>)}
      </div>
    </div>
  );
};
