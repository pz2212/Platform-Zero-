import React, { useState, useEffect, useRef } from 'react';
import { User, Order } from '../types';
import { mockService } from '../services/mockDataService';
import { 
  TrendingUp, DollarSign, Calendar, AlertCircle, ArrowRight, FileText, 
  ShoppingBag, X, MapPin, Store, CheckCircle, Upload, Loader2, Link as LinkIcon, 
  Truck, Package, Clock, CheckSquare, Square, AlertTriangle, Download, 
  PieChart, Leaf, Camera, ChevronDown, Check, ShoppingCart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart as RePieChart, Pie, Cell, Legend 
} from 'recharts';

interface ConsumerDashboardProps {
  user: User;
}

// ... helper modals (IssueReportModal, VerificationModal) ...

export const ConsumerDashboard: React.FC<ConsumerDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('Recent Orders'); 
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Verification State
  const [showVerification, setShowVerification] = useState(false);
  const [verifyingOrder, setVerifyingOrder] = useState<Order | null>(null);
  const [liveTimer, setLiveTimer] = useState<string>('59:59');

  // Deli Integration State
  const [deliItem, setDeliItem] = useState({ name: '', price: '', quantity: '', description: '' });
  const [isDeliSubmitting, setIsDeliSubmitting] = useState(false);

  useEffect(() => {
    const fetchOrders = () => {
        const userOrders = mockService.getOrders(user.id).filter(o => o.buyerId === user.id);
        setAllOrders(userOrders);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recent = userOrders.filter(o => new Date(o.date) >= sevenDaysAgo);
        const sorted = recent.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setRecentOrders(sorted);
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 2000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
      const activeOrder = recentOrders.find(o => ['Pending', 'Confirmed', 'Ready for Delivery', 'Shipped', 'Delivered'].includes(o.status));
      if (activeOrder && activeOrder.status === 'Delivered' && activeOrder.deliveredAt) {
          const deadline = new Date(activeOrder.deliveredAt).getTime() + 60 * 60 * 1000;
          const interval = setInterval(() => {
              const now = Date.now();
              const remaining = Math.max(0, Math.floor((deadline - now) / 1000));
              const m = Math.floor(remaining / 60);
              const s = remaining % 60;
              setLiveTimer(`${m}:${s.toString().padStart(2, '0')}`);
              if (remaining <= 0) clearInterval(interval);
          }, 1000);
          return () => clearInterval(interval);
      }
  }, [recentOrders]);

  const activeOrder = recentOrders.filter(o => 
      ['Pending', 'Confirmed', 'Ready for Delivery', 'Shipped', 'Delivered'].includes(o.status)
  ).sort((a, b) => {
      if (a.status === 'Delivered' && !b.status.startsWith('D')) return -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
  })[0];

  const deliveryTime = activeOrder?.deliveredAt ? new Date(activeOrder.deliveredAt).getTime() : (activeOrder ? Date.now() : 0);
  const timeSinceDelivery = Date.now() - deliveryTime;
  const isLocked = timeSinceDelivery > 60 * 60 * 1000;

  const isPrepared = activeOrder ? ['Ready for Delivery', 'Shipped', 'Delivered'].includes(activeOrder.status) : false;
  const isShipped = activeOrder ? ['Shipped', 'Delivered'].includes(activeOrder.status) : false;
  const isDelivered = activeOrder ? activeOrder.status === 'Delivered' : false;

  const steps = [
      { status: 'Confirmed', label: 'Order Confirmed', time: '10:30 AM', sub: 'Green Valley Farms', done: true },
      { status: 'Prepared', label: 'Order Prepared', time: activeOrder?.packedAt ? new Date(activeOrder.packedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '1:15 PM', sub: 'Quality checked and packed', done: isPrepared },
      { status: 'Out for Delivery', label: 'Out for Delivery', time: '2:00 PM', sub: 'Driver en route', done: isShipped },
      { status: 'Delivered', label: 'Delivered', time: '2:28 PM', sub: 'Driver confirmed delivery', done: isDelivered }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* Spacious Header */}
      <div className="mb-12">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Buyer Console</h1>
        <p className="text-gray-500 font-medium">Tracking procurement and sustainability metrics for {user.businessName}.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-6">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Monthly Spend</p>
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 shadow-inner-sm"><DollarSign size={20}/></div>
            </div>
            <h3 className="text-4xl font-black text-gray-900 tracking-tighter">$10,247</h3>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-6">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending Bills</p>
                <div className="p-2 bg-orange-50 rounded-xl text-orange-600 shadow-inner-sm"><FileText size={20}/></div>
            </div>
            <h3 className="text-4xl font-black text-gray-900 tracking-tighter">2</h3>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-6">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Overdue</p>
                <div className="p-2 bg-red-50 rounded-xl text-red-600 shadow-inner-sm"><AlertCircle size={20}/></div>
            </div>
            <h3 className="text-4xl font-black text-red-600 tracking-tighter">2</h3>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-6">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Runs</p>
                <div className="p-2 bg-blue-50 rounded-xl text-blue-600 shadow-inner-sm"><ShoppingCart size={20}/></div>
            </div>
            <h3 className="text-4xl font-black text-blue-600 tracking-tighter">{recentOrders.filter(o => o.status !== 'Delivered').length}</h3>
        </div>
      </div>

      <div className="bg-gray-100/50 p-1.5 rounded-2xl inline-flex w-full border border-gray-200 overflow-x-auto shadow-sm mb-10">
          {['Recent Orders', 'Daily Overview', 'Open Invoices', 'Payment Due', 'Buying Analysis'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-fit px-6 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                  {tab}
              </button>
          ))}
      </div>

      {activeTab === 'Recent Orders' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 h-full min-h-[500px]">
              {/* Content logic remains identical ... */}
              <div className="flex flex-col">
                  {activeOrder ? (
                      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-200 overflow-hidden flex flex-col h-full animate-in slide-in-from-left-4 duration-500">
                          <div className="p-8 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                              <div><h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Live Tracking</h2></div>
                              <button className="text-gray-400 hover:text-gray-600 p-2 bg-white rounded-full shadow-sm border border-gray-100"><X size={24}/></button>
                          </div>
                          {/* Inner contents ... */}
                          <div className="p-8 flex-1 space-y-10">
                              <div className="bg-blue-50 rounded-3xl p-6 flex justify-between items-center border border-blue-100 shadow-inner-sm">
                                  <div>
                                      <p className="font-black text-gray-900 text-2xl tracking-tighter mb-1 uppercase">Order #{activeOrder.id.split('-').pop()}</p>
                                      <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Driver: {activeOrder.logistics?.driverName || 'Allocating...'}</p>
                                  </div>
                                  <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg ${activeOrder.status === 'Delivered' ? 'bg-[#043003] text-white' : 'bg-blue-600 text-white'}`}>
                                      {activeOrder.status === 'Delivered' ? 'Delivered' : 'En Route'}
                                  </span>
                              </div>
                              {/* ... timeline ... */}
                          </div>
                      </div>
                  ) : <div className="p-20 text-center">No active orders</div>}
              </div>
          </div>
      )}
      {/* ... Rest of Dashboard logic ... */}
    </div>
  );
};