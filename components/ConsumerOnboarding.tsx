import React, { useState, useEffect, useRef } from 'react';
import { Customer, UserRole, User, RegistrationRequest, Order, Product } from '../types';
import { mockService } from '../services/mockDataService';
import { 
  Search, MoreVertical, Users, CheckCircle, Clock, ShoppingCart, 
  Eye, Edit, Settings, UserPlus, FileText, 
  ChevronDown, AlertCircle, AlertTriangle, Store, X, Building, MapPin, Truck, Phone, Mail, DollarSign, Calendar, Check, ExternalLink, Download, Printer, Copy, Link as LinkIcon,
  Plus, Rocket, Sprout
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ConsumerOnboarding: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pendingRequests, setPendingRequests] = useState<RegistrationRequest[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    connected: 0,
    pending: 0,
    activeOrders: 0
  });
  const [activeTab, setActiveTab] = useState<'customers' | 'orders' | 'waiting'>('customers');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
  
  // Invoice Viewer State
  const [viewingInvoicesCustomer, setViewingInvoicesCustomer] = useState<Customer | null>(null);
  const [customerInvoices, setCustomerInvoices] = useState<Order[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);

  // Quick Supplier Modal State
  const [isQuickSupplierModalOpen, setIsQuickSupplierModalOpen] = useState(false);
  const [quickSupplier, setQuickSupplier] = useState({ businessName: '', email: '' });
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  // Onboarding Modal State (Advanced)
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [onboardType, setOnboardType] = useState<'Buyer' | 'Supplier'>('Buyer');
  const [newBusiness, setNewBusiness] = useState({
      businessName: '', abn: '', address: '', email: '', phone: '',
      weeklySpend: '', orderFreq: '', deliveryWindow: '', products: '',
      directorName: '', directorEmail: '', directorPhone: '',
      accountsName: '', accountsEmail: '', accountsMobile: '',
      chefName: '', chefEmail: '', chefMobile: '', customerType: 'Restaurant'
  });

  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    refreshData();
    setProducts(mockService.getAllProducts());

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveActionMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const refreshData = () => {
    const allCustomers = mockService.getCustomers();
    const requests = mockService.getRegistrationRequests().filter(r => r.status === 'Pending');
    setCustomers(allCustomers);
    setPendingRequests(requests);

    const allOrders = mockService.getOrders('u1');
    const activeOrdersCount = allOrders.filter(o => ['Pending', 'Confirmed', 'Ready for Delivery', 'Shipped'].includes(o.status)).length;

    setStats({
      total: allCustomers.length,
      connected: allCustomers.filter(c => c.connectionStatus === 'Active').length,
      pending: allCustomers.filter(c => c.connectionStatus === 'Pending Connection' || c.connectionStatus === 'Pricing Pending').length,
      activeOrders: activeOrdersCount
    });
  };

  const handleQuickSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser = mockService.onboardNewBusiness({
        type: 'Supplier',
        businessName: quickSupplier.businessName,
        email: quickSupplier.email,
        phone: 'N/A',
        abn: 'N/A',
        address: 'N/A',
        customerType: 'Supplier'
    });
    
    const link = `https://portal.platformzero.io/setup/${newUser.id}`;
    setGeneratedLink(link);
    refreshData();
  };

  const copyLink = () => {
      if (generatedLink) {
          navigator.clipboard.writeText(generatedLink);
          alert("Link copied to clipboard!");
      }
  };

  const handleApproveRequest = (id: string) => {
    mockService.approveRegistration(id);
    refreshData();
    alert("Application approved!");
  };

  const handleRejectRequest = (id: string) => {
    if(confirm("Are you sure you want to reject this application?")) {
        mockService.rejectRegistration(id);
        refreshData();
    }
  };

  const toggleActionMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveActionMenu(activeActionMenu === id ? null : id);
  };

  const handleGetStarted = (customerId: string) => {
      mockService.sendOnboardingComms(customerId);
      alert("Success! Onboarding link and credentials sent via SMS and Email.");
      refreshData();
  };

  const getCustomerMetrics = (customerId: string) => {
    const allOrders = mockService.getOrders('u1');
    const orders = allOrders.filter(o => o.buyerId === customerId);
    
    const orderCount = orders.length;
    const activeInvoices = orders.filter(o => o.paymentStatus === 'Unpaid' || o.paymentStatus === 'Overdue').length;
    const outstanding = orders
      .filter(o => o.paymentStatus === 'Unpaid' || o.paymentStatus === 'Overdue')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const ltv = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    return { orderCount, activeInvoices, outstanding, ltv };
  };

  const handleOpenInvoices = (customer: Customer) => {
      const allOrders = mockService.getOrders('u1');
      const history = allOrders.filter(o => o.buyerId === customer.id);
      setCustomerInvoices(history);
      setViewingInvoicesCustomer(customer);
  };

  const handleCreateBusiness = (e: React.FormEvent) => {
      e.preventDefault();
      
      mockService.onboardNewBusiness({
          type: onboardType,
          businessName: newBusiness.businessName,
          email: newBusiness.email,
          phone: newBusiness.phone,
          abn: newBusiness.abn,
          address: newBusiness.address,
          customerType: newBusiness.customerType
      });

      refreshData();
      setIsOnboardModalOpen(false);
      alert(`${onboardType} "${newBusiness.businessName}" successfully onboarded!`);
      
      setNewBusiness({
          businessName: '', abn: '', address: '', email: '', phone: '',
          weeklySpend: '', orderFreq: '', deliveryWindow: '', products: '',
          directorName: '', directorEmail: '', directorPhone: '',
          accountsName: '', accountsEmail: '', accountsMobile: '',
          chefName: '', chefEmail: '', chefMobile: '', customerType: 'Restaurant'
      });
  };

  const filteredCustomers = customers.filter(c => 
    c.businessName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Marketplace Management</h1>
            <p className="text-gray-500">Manage marketplace customers, supplier connections, and order fulfillment</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={() => { setGeneratedLink(null); setQuickSupplier({businessName: '', email: ''}); setIsQuickSupplierModalOpen(true); }}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-2 transition-all"
            >
                <Plus size={18}/> Quick Add Supplier
            </button>
            <button 
                onClick={() => setIsOnboardModalOpen(true)}
                className="px-4 py-2.5 bg-[#043003] hover:bg-[#064004] text-white font-bold rounded-lg shadow-sm flex items-center gap-2 transition-all"
            >
                <UserPlus size={18}/> Full Onboard
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center"><Users size={24} /></div>
          <div><p className="text-sm font-medium text-gray-500">Total Customers</p><h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center"><CheckCircle size={24} /></div>
          <div><p className="text-sm font-medium text-gray-500">Connected</p><h3 className="text-2xl font-bold text-gray-900">{stats.connected}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center"><Clock size={24} /></div>
          <div><p className="text-sm font-medium text-gray-500">Pending Approval</p><h3 className="text-2xl font-bold text-gray-900">{pendingRequests.length}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center"><ShoppingCart size={24} /></div>
          <div><p className="text-sm font-medium text-gray-500">Active Orders</p><h3 className="text-2xl font-bold text-gray-900">{stats.activeOrders}</h3></div>
        </div>
      </div>

      <div className="bg-gray-100/50 p-1 rounded-lg inline-flex w-full md:w-auto border border-gray-200 shadow-sm">
        <button onClick={() => setActiveTab('customers')} className={`px-8 py-2.5 text-sm font-bold rounded-md transition-all ${activeTab === 'customers' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Current Customers</button>
        <button onClick={() => setActiveTab('orders')} className={`px-8 py-2.5 text-sm font-bold rounded-md transition-all ${activeTab === 'orders' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Orders</button>
        <button onClick={() => setActiveTab('waiting')} className={`px-8 py-2.5 text-sm font-bold rounded-md transition-all flex items-center gap-2 ${activeTab === 'waiting' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            Waiting
            {pendingRequests.length > 0 && (<span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-sm">{pendingRequests.length}</span>)}
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-visible min-h-[500px]">
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-50 rounded-xl text-gray-900 border border-gray-100">
                  {activeTab === 'waiting' ? <Clock size={24} className="text-orange-500"/> : <Store size={24} className="text-indigo-600"/>}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{activeTab === 'waiting' ? 'Pending Applications' : 'Verified Directory'}</h2>
          </div>
          {activeTab !== 'waiting' && (<div className="relative w-full md:w-80"><Search className="absolute left-3 top-3 text-gray-400" size={18} /><input type="text" placeholder="Search businesses..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner-sm bg-gray-50/30" /></div>)}
        </div>

        {activeTab === 'customers' && (
            <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Business Detail</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Segment</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Connection</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Supplier Pair</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Orders</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Accounting</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map(customer => {
                    const metrics = getCustomerMetrics(customer.id);
                    return (
                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-8 py-6">
                            <div className="font-bold text-gray-900">{customer.businessName}</div>
                            <div className="text-xs text-gray-400 font-medium">{customer.email || 'No primary email'}</div>
                        </td>
                        <td className="px-8 py-6"><span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-600 border border-gray-200">{customer.category}</span></td>
                        <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${customer.connectionStatus === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-orange-400'}`}></div>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${customer.connectionStatus === 'Active' ? 'text-emerald-700' : 'text-orange-700'}`}>{customer.connectionStatus}</span>
                            </div>
                        </td>
                        <td className="px-8 py-6">
                            {customer.connectedSupplierName ? (
                                <>
                                <div className="text-sm font-bold text-gray-900">{customer.connectedSupplierName}</div>
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{customer.connectedSupplierRole}</div>
                                </>
                            ) : (<span className="text-[10px] text-gray-300 font-bold uppercase italic">No Link</span>)}
                        </td>
                        <td className="px-8 py-6 text-sm text-gray-900 font-black text-center">{metrics.orderCount}</td>
                        <td className="px-8 py-6">
                            {metrics.outstanding > 0 ? (
                                <span className="text-sm font-black text-red-600 tracking-tight">${metrics.outstanding.toFixed(2)}</span>
                            ) : (<span className="text-sm text-gray-300 font-bold">$0.00</span>)}
                        </td>
                        <td className="px-8 py-6 text-right relative">
                            {customer.connectionStatus === 'Pending Connection' ? (
                                <button 
                                    onClick={() => handleGetStarted(customer.id)}
                                    className="px-6 py-2.5 bg-emerald-600 text-white font-black rounded-xl text-[10px] uppercase tracking-[0.15em] flex items-center gap-2 shadow-md hover:bg-black transition-all ml-auto"
                                >
                                    <Rocket size={14}/> Provision
                                </button>
                            ) : (
                                <button onClick={(e) => toggleActionMenu(e, customer.id)} className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-400 border border-transparent hover:border-gray-200 transition-all ml-auto block"><MoreVertical size={18}/></button>
                            )}
                            
                            {activeActionMenu === customer.id && (
                                <div ref={menuRef} className="absolute right-8 top-12 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right overflow-hidden py-1">
                                    <button className="w-full text-left px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-3"><Eye size={18} className="text-gray-400"/> Full Profile</button>
                                    <button className="w-full text-left px-5 py-3 text-sm font-bold text-emerald-600 hover:bg-emerald-50 flex items-center gap-3"><Edit size={18}/> Management</button>
                                    <button className="w-full text-left px-5 py-3 text-sm font-bold text-indigo-600 hover:bg-indigo-50 flex items-center gap-3" onClick={() => handleOpenInvoices(customer)}><FileText size={18}/> Invoices</button>
                                </div>
                            )}
                        </td>
                    </tr>
                    );
                })}
                </tbody>
            </table>
            {filteredCustomers.length === 0 && (<div className="p-24 text-center text-gray-400 flex flex-col items-center gap-3"><Store size={40} className="opacity-10"/><p className="text-sm font-black uppercase tracking-widest">No matching connections</p></div>)}
            </div>
        )}

        {activeTab === 'orders' && (
            <div className="p-24 text-center text-gray-400 flex flex-col items-center gap-3">
                <ShoppingCart size={40} className="opacity-10"/>
                <p className="text-sm font-black uppercase tracking-widest">Marketplace Order Feed</p>
            </div>
        )}
        
        {activeTab === 'waiting' && (
            <div className="p-8 space-y-4">
                {pendingRequests.length === 0 ? (
                    <div className="p-20 text-center text-gray-300 flex flex-col items-center gap-3">
                        <CheckCircle size={40} className="opacity-10"/>
                        <p className="text-sm font-black uppercase tracking-widest">Application Queue Empty</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pendingRequests.map(req => (
                            <div key={req.id} className="p-6 bg-gray-50 border border-gray-100 rounded-[2rem] hover:shadow-lg transition-all animate-in zoom-in-95 group">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner-sm ${
                                            req.requestedRole === UserRole.CONSUMER ? 'bg-blue-100 text-blue-700' : 
                                            req.requestedRole === UserRole.FARMER ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                                        }`}>
                                            {req.businessName.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-gray-900 text-lg leading-tight uppercase tracking-tight">{req.businessName}</h3>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Applied: {new Date(req.submittedDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] border-2 ${
                                        req.requestedRole === UserRole.CONSUMER ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                        req.requestedRole === UserRole.FARMER ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                        'bg-indigo-50 text-indigo-600 border-indigo-100'
                                    }`}>
                                        {req.requestedRole === UserRole.CONSUMER ? 'Buyer' : req.requestedRole}
                                    </div>
                                </div>

                                <div className="space-y-3 mb-8">
                                    <div className="flex items-center gap-3 text-xs text-gray-500 font-bold uppercase">
                                        <Building size={16} className="text-gray-300"/> Applied as: {req.requestedRole}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 font-bold uppercase">
                                        <Mail size={16} className="text-gray-300"/> {req.email}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 font-bold uppercase">
                                        <MapPin size={16} className="text-gray-300"/> {req.consumerData?.location || 'Australia'}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleApproveRequest(req.id)} 
                                        className="flex-1 py-4 bg-[#043003] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <Check size={16} strokeWidth={3}/> Approve Application
                                    </button>
                                    <button 
                                        onClick={() => handleRejectRequest(req.id)} 
                                        className="px-5 py-4 bg-white border border-gray-200 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center shadow-sm"
                                    >
                                        <X size={18}/>
                                    </button>
                                </div>
                            </div>
                        ))
                    }
                    </div>
                )}
            </div>
        )}
      </div>

      {/* QUICK ADD SUPPLIER MODAL */}
      {isQuickSupplierModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <h2 className="text-xl font-bold text-gray-900">Quick Add Supplier</h2>
                      <button onClick={() => setIsQuickSupplierModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition-colors"><X size={24}/></button>
                  </div>
                  <div className="p-8 space-y-6">
                      {!generatedLink ? (
                          <form onSubmit={handleQuickSupplierSubmit} className="space-y-4">
                              <p className="text-sm text-gray-500">Provide basic details to create a supplier account. They will appear in connection lists immediately.</p>
                              <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-1">Business Name</label>
                                  <div className="relative">
                                      <Building className="absolute left-3 top-3 text-gray-400" size={18}/>
                                      <input 
                                          required 
                                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 font-bold" 
                                          placeholder="e.g. Green Farms Ltd"
                                          value={quickSupplier.businessName}
                                          onChange={e => setQuickSupplier({...quickSupplier, businessName: e.target.value})}
                                      />
                                  </div>
                              </div>
                              <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                                  <div className="relative">
                                      <Mail className="absolute left-3 top-3 text-gray-400" size={18}/>
                                      <input 
                                          required 
                                          type="email"
                                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 font-bold" 
                                          placeholder="supplier@email.com"
                                          value={quickSupplier.email}
                                          onChange={e => setQuickSupplier({...quickSupplier, email: e.target.value})}
                                      />
                                  </div>
                              </div>
                              <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                                  Generate Invite & Create Account
                              </button>
                          </form>
                      ) : (
                          <div className="text-center space-y-6 animate-in fade-in duration-300">
                              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                                  <LinkIcon size={32} />
                              </div>
                              <div>
                                  <h3 className="text-lg font-bold text-gray-900">Setup Link Generated</h3>
                                  <p className="text-sm text-gray-500 mt-1">Share this link with <span className="font-bold">{quickSupplier.businessName}</span> to complete their onboarding.</p>
                              </div>
                              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                                  <input readOnly value={generatedLink} className="bg-transparent flex-1 text-xs font-mono text-gray-900 font-bold outline-none" />
                                  <button onClick={copyLink} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-all shadow-sm">
                                      <Copy size={18}/>
                                  </button>
                              </div>
                              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-left flex gap-3">
                                  <CheckCircle size={20} className="text-blue-600 shrink-0 mt-0.5" />
                                  <p className="text-xs text-blue-800">
                                      <strong>Instant Availability:</strong> This supplier is now an option in the "Connected Supplier" dropdowns across the platform.
                                  </p>
                              </div>
                              <button onClick={() => setIsQuickSupplierModalOpen(false)} className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm">
                                  Done
                              </button>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* ADVANCED ONBOARDING MODAL */}
      {isOnboardModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8 animate-in zoom-in-95 duration-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <div><h2 className="text-2xl font-bold text-gray-900">Full Business Onboard</h2><p className="text-sm text-gray-500 mt-1">Complete profile creation.</p></div>
                      <button onClick={() => setIsOnboardModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition-colors"><X size={24}/></button>
                  </div>
                  <form onSubmit={handleCreateBusiness} className="flex flex-col h-full max-h-[80vh] overflow-y-auto">
                      <div className="p-8 space-y-8">
                          <div className="flex justify-center mb-6"><div className="bg-gray-100 p-1 rounded-xl inline-flex"><button type="button" onClick={() => setOnboardType('Buyer')} className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm ${onboardType === 'Buyer' ? 'bg-white text-gray-900 ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}>Buyer (Customer)</button><button type="button" onClick={() => setOnboardType('Supplier')} className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm ${onboardType === 'Supplier' ? 'bg-white text-gray-900 ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}>Supplier</button></div></div>
                          <div className="space-y-4">
                              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2 border-b border-gray-100 pb-2"><Building size={18} className="text-emerald-600"/> Business Details</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div><label className="block text-sm font-semibold text-gray-700 mb-1">Business Name</label><input required type="text" className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 font-black" value={newBusiness.businessName} onChange={e => setNewBusiness({...newBusiness, businessName: e.target.value})} placeholder="e.g. The Morning Cafe" /></div>
                                  <div><label className="block text-sm font-semibold text-gray-700 mb-1">ABN</label><input required type="text" className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 font-black" value={newBusiness.abn} onChange={e => setNewBusiness({...newBusiness, abn: e.target.value})} placeholder="XX XXX XXX XXX" /></div>
                                  <div className="md:col-span-2"><label className="block text-sm font-semibold text-gray-700 mb-1">Address / Location</label><div className="relative"><MapPin size={18} className="absolute left-3 top-3 text-gray-400"/><input required type="text" className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 font-black" value={newBusiness.address} onChange={e => setNewBusiness({...newBusiness, address: e.target.value})} placeholder="123 Main St, Melbourne VIC 3000" /></div></div>
                              </div>
                          </div>
                          
                          <div className="space-y-4 pt-4">
                              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2 border-b border-gray-100 pb-2"><Mail size={18} className="text-indigo-600"/> Connection Details</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div><label className="block text-sm font-semibold text-gray-700 mb-1">Login Email Address</label><div className="relative"><Mail size={18} className="absolute left-3 top-3 text-gray-400"/><input required type="email" className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 font-black" value={newBusiness.email} onChange={e => setNewBusiness({...newBusiness, email: e.target.value})} placeholder="orders@business.com" /></div></div>
                                  <div><label className="block text-sm font-semibold text-gray-700 mb-1">Primary Mobile / Phone</label><div className="relative"><Phone size={18} className="absolute left-3 top-3 text-gray-400"/><input required type="tel" className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 font-black" value={newBusiness.phone} onChange={e => setNewBusiness({...newBusiness, phone: e.target.value})} placeholder="0400 000 000" /></div></div>
                              </div>
                          </div>
                      </div>
                      <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 sticky bottom-0">
                          <button type="button" onClick={() => setIsOnboardModalOpen(false)} className="px-6 py-3 text-gray-700 font-bold hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
                          <button type="submit" className="px-8 py-3 bg-[#043003] text-white font-bold rounded-lg hover:bg-[#064004] shadow-lg flex items-center gap-2 transition-all"><CheckCircle size={20}/> Complete Onboarding</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* INVOICE LIST MODAL */}
      {viewingInvoicesCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <div>
                          <h2 className="text-xl font-bold text-gray-900">Account History: {viewingInvoicesCustomer.businessName}</h2>
                          <p className="text-sm text-gray-500">Managing {customerInvoices.length} total orders/invoices</p>
                      </div>
                      <button onClick={() => setViewingInvoicesCustomer(null)} className="text-gray-400 hover:text-gray-600 p-2"><X size={24}/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 bg-white">
                      {customerInvoices.length === 0 ? (
                          <div className="text-center py-20 text-gray-400">No invoices found for this business.</div>
                      ) : (
                          <table className="w-full text-left">
                              <thead className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                  <tr>
                                      <th className="pb-4 px-2">Date</th>
                                      <th className="pb-4 px-2">Invoice #</th>
                                      <th className="pb-4 px-2">Total Amount</th>
                                      <th className="pb-4 px-2">Status</th>
                                      <th className="pb-4 px-2 text-right">Action</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                  {customerInvoices.map(invoice => (
                                      <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                                          <td className="py-4 px-2 text-sm font-bold text-gray-900">{new Date(invoice.date).toLocaleDateString()}</td>
                                          <td className="py-4 px-2 font-mono text-sm text-gray-900">#{invoice.id.split('-')[1] || invoice.id}</td>
                                          <td className="py-4 px-2 font-black text-gray-900">${invoice.totalAmount.toFixed(2)}</td>
                                          <td className="py-4 px-2">
                                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${invoice.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                  {invoice.paymentStatus || 'Unpaid'}
                                              </span>
                                          </td>
                                          <td className="py-4 px-2 text-right">
                                              <button className="text-indigo-600 hover:text-indigo-800 font-bold text-sm flex items-center gap-1 ml-auto">
                                                  View Detailed <ExternalLink size={14}/>
                                              </button>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      )}
                  </div>
                  <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
                      <button onClick={() => setViewingInvoicesCustomer(null)} className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors">Close Viewer</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};