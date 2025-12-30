import React, { useState, useEffect, useRef } from 'react';
import { InventoryItem, User, UserRole, OnboardingFormTemplate, FormField, Order, Customer } from '../types';
import { mockService } from '../services/mockDataService';
import { 
  Package, Users, AlertTriangle, Check, X, Settings, LayoutDashboard, 
  Box, FileText, Plus, Trash2, GripVertical, Save, ShoppingCart, 
  TrendingUp, DollarSign, CheckCircle, Search, MoreVertical, 
  Store, Eye, Edit, UserCheck, CreditCard, ChevronDown, UserPlus, Filter, UserCog, Percent, ExternalLink, Download, Printer, ChevronUp
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'pending' | 'orders' | 'forms'>('overview');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [wholesalers, setWholesalers] = useState<User[]>([]);
  const [reps, setReps] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
  
  // Mobile UI States
  const [isMetricsExpanded, setIsMetricsExpanded] = useState(false);

  // Invoice Viewer State
  const [viewingInvoicesCustomer, setViewingInvoicesCustomer] = useState<Customer | null>(null);
  const [customerInvoices, setCustomerInvoices] = useState<Order[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);

  // Modal / Edit States
  const [editingMarkupId, setEditingMarkupId] = useState<string | null>(null);
  const [tempMarkup, setTempMarkup] = useState<number>(0);

  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.CONSUMER);
  const [formTemplate, setFormTemplate] = useState<OnboardingFormTemplate | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 10000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
      if (activeTab === 'forms') {
          const template = mockService.getFormTemplate(selectedRole);
          if (template) setFormTemplate(JSON.parse(JSON.stringify(template)));
      }
  }, [activeTab, selectedRole]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveActionMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const refreshData = () => {
    setInventory(mockService.getAllInventory());
    const allUsers = mockService.getAllUsers();
    setUsers(allUsers);
    const orders = mockService.getOrders('u1');
    setAllOrders(orders);
    setCustomers(mockService.getCustomers());
    setWholesalers(allUsers.filter(u => u.role === UserRole.WHOLESALER || u.role === UserRole.FARMER));
    setReps(allUsers.filter(u => u.role === UserRole.PZ_REP));
  };

  const handleUpdateSupplier = (customerId: string, supplierId: string) => {
      mockService.updateCustomerSupplier(customerId, supplierId);
      refreshData();
  };

  const toggleActionMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveActionMenu(activeActionMenu === id ? null : id);
  };

  const getCustomerMetrics = (customerId: string) => {
    const orders = allOrders.filter(o => o.buyerId === customerId);
    const orderCount = orders.length;
    const activeInvoices = orders.filter(o => o.paymentStatus === 'Unpaid' || o.paymentStatus === 'Overdue').length;
    const outstanding = orders
      .filter(o => o.paymentStatus === 'Unpaid' || o.paymentStatus === 'Overdue')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const ltv = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    return { orderCount, activeInvoices, outstanding, ltv };
  };

  const totalWholesalers = users.filter(u => u.role === 'WHOLESALER').length;
  const totalGMV = allOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const filteredCustomers = customers.filter(c => 
    c.businessName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="mb-4 md:mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6 md:mb-10">
            <div>
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight uppercase leading-none">HQ Control Center</h1>
                <p className="text-gray-500 font-medium text-xs md:text-sm mt-1">Managing marketplace operations and network health.</p>
            </div>
            <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto no-scrollbar border border-gray-200 shadow-sm whitespace-nowrap">
                {[
                    {id: 'overview', label: 'Overview', icon: LayoutDashboard},
                    {id: 'pending', label: 'Approvals', icon: AlertTriangle},
                    {id: 'orders', label: 'All Orders', icon: ShoppingCart},
                    {id: 'forms', label: 'Forms', icon: FileText}
                ].map(t => (
                    <button 
                        key={t.id} onClick={() => setActiveTab(t.id as any)}
                        className={`px-4 md:px-5 py-2 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center justify-center gap-2 ${activeTab === t.id ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <t.icon size={14}/> {t.label}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {activeTab === 'overview' && (
          <div className="space-y-8 md:space-y-12">
            {/* KPI METRICS - CONDESED FOR MOBILE */}
            <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto no-scrollbar -mx-6 px-6 md:mx-0 md:px-0 pb-2">
                <div className="min-w-[180px] md:min-w-0 bg-white p-5 md:p-8 rounded-[1.75rem] md:rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1 transition-all shrink-0">
                    <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Total GMV</p>
                    <div className="flex justify-between items-end">
                        <h3 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tighter">${totalGMV.toLocaleString()}</h3>
                        <div className="p-2 md:p-3 bg-emerald-50 rounded-xl md:rounded-2xl text-emerald-600 shadow-inner-sm"><DollarSign size={18} className="md:w-6 md:h-6" /></div>
                    </div>
                </div>
                <div className="min-w-[180px] md:min-w-0 bg-white p-5 md:p-8 rounded-[1.75rem] md:rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1 transition-all shrink-0">
                    <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Market Orders</p>
                    <div className="flex justify-between items-end">
                        <h3 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tighter">{allOrders.length}</h3>
                        <div className="p-2 md:p-3 bg-blue-50 rounded-xl md:rounded-2xl text-blue-600 shadow-inner-sm"><ShoppingCart size={18} className="md:w-6 md:h-6" /></div>
                    </div>
                </div>
                <div className="min-w-[180px] md:min-w-0 bg-white p-5 md:p-8 rounded-[1.75rem] md:rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1 transition-all shrink-0">
                    <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Partner Stock</p>
                    <div className="flex justify-between items-end">
                        <h3 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tighter">{inventory.length}</h3>
                        <div className="p-2 md:p-3 bg-purple-50 rounded-xl md:rounded-2xl text-purple-600 shadow-inner-sm"><Box size={18} className="md:w-6 md:h-6" /></div>
                    </div>
                </div>
                <div className="min-w-[180px] md:min-w-0 bg-white p-5 md:p-8 rounded-[1.75rem] md:rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1 transition-all shrink-0">
                    <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Connected Partners</p>
                    <div className="flex justify-between items-end">
                        <h3 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tighter">{totalWholesalers}</h3>
                        <div className="p-2 md:p-3 bg-amber-50 rounded-xl md:rounded-2xl text-amber-500 shadow-inner-sm"><Users size={18} className="md:w-6 md:h-6" /></div>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-visible">
                <div className="p-6 md:p-10 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 bg-gray-50/30">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="p-3 bg-white rounded-2xl text-gray-900 border border-gray-200 shadow-sm hidden md:block">
                            <Store size={28}/>
                        </div>
                        <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight uppercase">Buyer Relationships</h2>
                    </div>
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
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
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead className="bg-white border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                            <tr>
                                <th className="px-8 py-6">Customer Entity</th>
                                <th className="px-8 py-6">Segment</th>
                                <th className="px-8 py-6">Status</th>
                                <th className="px-8 py-6">Connected Supplier</th>
                                <th className="px-8 py-6">PZ Markup</th>
                                <th className="px-8 py-6">Pricing</th>
                                <th className="px-8 py-6 text-center">Orders</th>
                                <th className="px-8 py-6">LTV</th>
                                <th className="px-8 py-6 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredCustomers.map(customer => {
                                const metrics = getCustomerMetrics(customer.id);
                                return (
                                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="font-black text-gray-900 text-base leading-tight">{customer.businessName}</div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-1">{customer.email || 'No records'}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="inline-flex items-center px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest bg-gray-100 text-gray-600 border border-gray-200">
                                                {customer.category}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border whitespace-nowrap shadow-sm ${
                                                customer.connectionStatus === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                customer.connectionStatus === 'Pending Connection' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                'bg-blue-50 text-blue-700 border-blue-100'
                                            }`}>
                                                {customer.connectionStatus}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <select 
                                                value={customer.connectedSupplierId || ''} 
                                                onChange={(e) => handleUpdateSupplier(customer.id, e.target.value)}
                                                className="bg-transparent border-0 font-black text-gray-900 text-xs focus:ring-0 outline-none p-0 w-full cursor-pointer hover:text-indigo-600 transition-colors uppercase tracking-tight"
                                            >
                                                <option value="" className="text-gray-900">NO LINK</option>
                                                {wholesalers.map(w => <option key={w.id} value={w.id} className="text-gray-900 font-bold">{w.businessName}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 group/markup">
                                                {customer.pzMarkup ? (
                                                    <span className="text-sm font-black text-emerald-600">%{customer.pzMarkup}</span>
                                                ) : (
                                                    <span className="text-[10px] text-gray-300 font-bold uppercase tracking-tighter">0%</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                                customer.pricingStatus === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-200'
                                            }`}>
                                                {customer.pricingStatus || 'DEFAULT'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center font-black text-gray-900">{metrics.orderCount}</td>
                                        <td className="px-8 py-6 font-black text-gray-900 whitespace-nowrap text-base tracking-tighter">
                                            ${metrics.ltv.toLocaleString()}
                                        </td>
                                        <td className="px-8 py-6 text-right relative">
                                            <button onClick={(e) => toggleActionMenu(e, customer.id)} className="p-3 rounded-xl hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100 text-gray-400 transition-all">
                                                <MoreVertical size={22}/>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
          </div>
      )}
    </div>
  );
};