
import React, { useState, useEffect } from 'react';
import { InventoryItem, User, UserRole, Order, Customer } from '../types';
import { mockService } from '../services/mockDataService';
import { 
  LayoutDashboard, ShoppingCart, DollarSign, Box, Users, 
  ArrowRight, Store, Search, MoreVertical, CheckCircle, TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    gmv: 0,
    orders: 0,
    stock: 0,
    partners: 0
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const orders = mockService.getOrders('u1');
    const inv = mockService.getAllInventory();
    const users = mockService.getAllUsers();
    const reqs = mockService.getRegistrationRequests().filter(r => r.status === 'Pending');
    
    setPendingCount(reqs.length);
    setStats({
      gmv: orders.reduce((sum, o) => sum + o.totalAmount, 0),
      orders: orders.length,
      stock: inv.length,
      partners: users.filter(u => u.role === UserRole.WHOLESALER || u.role === UserRole.FARMER).length
    });
    setCustomers(mockService.getCustomers());
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.businessName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase leading-none">HQ Control Center</h1>
          <p className="text-gray-500 font-medium mt-2">Overseeing marketplace growth and partner relationships.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
            <button 
                onClick={() => navigate('/login-requests')} 
                className="relative flex-1 sm:flex-none px-6 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 font-black text-[10px] uppercase tracking-widest shadow-sm hover:shadow-md transition-all active:scale-95 group"
            >
                Review Requests
                {pendingCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg animate-bounce border-2 border-white ring-4 ring-red-500/10">
                        {pendingCount}
                    </span>
                )}
            </button>
            <button 
                onClick={() => navigate('/negotiations')} 
                className="flex-1 sm:flex-none px-6 py-3 bg-[#043003] text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-black transition-all active:scale-95"
            >
                View Pipeline
            </button>
        </div>
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
            { label: 'Total GMV', value: `$${stats.gmv.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Market Orders', value: stats.orders, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Partner Stock', value: stats.stock, icon: Box, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Active Partners', value: stats.partners, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' }
        ].map((kpi, idx) => (
            <div key={idx} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1 transition-all">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">{kpi.label}</p>
                <div className="flex justify-between items-end">
                    <h3 className="text-3xl font-black text-gray-900 tracking-tighter">{kpi.value}</h3>
                    <div className={`p-3 ${kpi.bg} ${kpi.color} rounded-2xl group-hover:scale-110 transition-transform`}><kpi.icon size={24} /></div>
                </div>
            </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 bg-gray-50/30">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl text-gray-900 border border-gray-200 shadow-sm">
                    <Store size={28}/>
                </div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Buyer Relationships</h2>
            </div>
            <div className="relative w-full md:w-96 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                <input 
                    type="text" 
                    placeholder="Search directory..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-50 outline-none transition-all shadow-sm" 
                />
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-white border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    <tr>
                        <th className="px-8 py-6">Customer Entity</th>
                        <th className="px-8 py-6">Segment</th>
                        <th className="px-8 py-6">Status</th>
                        <th className="px-8 py-6">Connected Supplier</th>
                        <th className="px-8 py-6 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {filteredCustomers.map(customer => (
                        <tr key={customer.id} className="hover:bg-gray-50 transition-colors group">
                            <td className="px-8 py-6">
                                <div className="font-black text-gray-900 text-base leading-tight uppercase">{customer.businessName}</div>
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-1">{customer.email || 'No email record'}</div>
                            </td>
                            <td className="px-8 py-6">
                                <span className="inline-flex items-center px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest bg-gray-100 text-gray-600 border border-gray-200">
                                    {customer.category}
                                </span>
                            </td>
                            <td className="px-8 py-6">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                                    customer.connectionStatus === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-orange-50 text-orange-700 border-orange-100'
                                }`}>
                                    {customer.connectionStatus}
                                </span>
                            </td>
                            <td className="px-8 py-6">
                                <div className="font-bold text-gray-900 text-sm">{customer.connectedSupplierName || 'Direct Connection'}</div>
                            </td>
                            <td className="px-8 py-6 text-right">
                                <button className="p-3 rounded-xl hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100 text-gray-400 transition-all">
                                    <MoreVertical size={20}/>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};
