
import React, { useState, useEffect, useRef } from 'react';
import { Customer, UserRole, User, RegistrationRequest } from '../types';
import { mockService } from '../services/mockDataService';
import { 
  Search, MoreVertical, Users, CheckCircle, Clock, ShoppingCart, 
  Eye, Edit, Settings, UserPlus, FileText, 
  ChevronDown, AlertCircle, Percent, LayoutDashboard, Store, X, Building, MapPin, Truck, Phone, Mail, DollarSign, Calendar, Upload, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ConsumerOnboarding: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pendingRequests, setPendingRequests] = useState<RegistrationRequest[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    connected: 0,
    pending: 0,
    activeOrders: 0
  });
  const [activeTab, setActiveTab] = useState<'customers' | 'orders' | 'waiting'>('customers');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
  
  // --- ONBOARDING MODAL STATE ---
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [onboardType, setOnboardType] = useState<'Buyer' | 'Supplier'>('Buyer');
  const [newBusiness, setNewBusiness] = useState({
      // Basic Info
      businessName: '',
      abn: '',
      address: '',
      
      // Operations (Buyer Only)
      weeklySpend: '',
      orderFreq: '',
      deliveryWindow: '',
      products: '',
      
      // Contacts (Buyer Only)
      directorName: '',
      directorEmail: '',
      directorPhone: '',
      accountsName: '',
      accountsEmail: '',
      accountsMobile: '',
      chefName: '',
      chefEmail: '',
      chefMobile: '',

      // PZ Admin Config (Removed from UI, kept in state for type safety if needed, but unused)
      customerType: 'Restaurant',
      connectedSupplierId: '',
      pzMarkup: '',
      pricingTier: 'Tier 2'
  });
  
  const [productFile, setProductFile] = useState<File | null>(null);
  
  // Wholesalers list for selection
  const [wholesalers, setWholesalers] = useState<User[]>([]);

  // Ref for click outside to close menu
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    refreshData();
    setWholesalers(mockService.getWholesalers());

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

    // Calculate Stats
    const allOrders = mockService.getOrders('u1'); // u1 is admin
    const activeOrdersCount = allOrders.filter(o => ['Pending', 'Confirmed', 'Ready for Delivery', 'Shipped'].includes(o.status)).length;

    setStats({
      total: allCustomers.length,
      connected: allCustomers.filter(c => c.connectionStatus === 'Active').length,
      pending: allCustomers.filter(c => c.connectionStatus === 'Pending Connection' || c.connectionStatus === 'Pricing Pending').length,
      activeOrders: activeOrdersCount
    });
  };

  const toggleActionMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveActionMenu(activeActionMenu === id ? null : id);
  };

  const getCustomerMetrics = (customerId: string) => {
    const allOrders = mockService.getOrders('u1'); // Get all as admin to filter
    const orders = allOrders.filter(o => o.buyerId === customerId);
    
    const orderCount = orders.length;
    const activeInvoices = orders.filter(o => o.paymentStatus === 'Unpaid' || o.paymentStatus === 'Overdue').length;
    const outstanding = orders
      .filter(o => o.paymentStatus === 'Unpaid' || o.paymentStatus === 'Overdue')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const ltv = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    return { orderCount, activeInvoices, outstanding, ltv };
  };

  const handleApproveRequest = (id: string) => {
      mockService.approveRegistration(id);
      refreshData();
      alert("Application accepted! Customer profile created.");
  };

  const handleRejectRequest = (id: string) => {
      if(confirm("Reject this application?")) {
          mockService.rejectRegistration(id);
          refreshData();
      }
  };

  const handleViewFile = (fileData: string) => {
      const win = window.open();
      if (win) {
          // Simple display logic for base64
          const src = fileData.startsWith('data:') ? fileData : `data:application/pdf;base64,${fileData}`;
          win.document.write(`<body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#f0f0f0;"><iframe src="${src}" width="100%" height="100%" style="border:none;background:white;"></iframe></body>`);
      }
  };

  const handleCreateBusiness = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Default to "Not Connected" / "Pending" since Admin Config is removed
      const customer: Customer = {
          id: `c-${Date.now()}`,
          businessName: newBusiness.businessName,
          contactName: newBusiness.directorName || 'Director',
          email: newBusiness.directorEmail,
          category: newBusiness.customerType as any, // Default from initial state
          abn: newBusiness.abn,
          location: newBusiness.address,
          deliveryAddress: newBusiness.address,
          
          weeklySpend: parseFloat(newBusiness.weeklySpend) || 0,
          orderFrequency: newBusiness.orderFreq,
          deliveryTimeWindow: newBusiness.deliveryWindow,
          commonProducts: newBusiness.products + (productFile ? ` (File attached: ${productFile.name})` : ''),

          director: { name: newBusiness.directorName, email: newBusiness.directorEmail, phone: newBusiness.directorPhone },
          accounts: { name: newBusiness.accountsName, email: newBusiness.accountsEmail, phone: newBusiness.accountsMobile },
          chef: { name: newBusiness.chefName, email: newBusiness.chefEmail, phone: newBusiness.chefMobile },

          // Admin Config Defaults
          connectionStatus: 'Pending Connection',
          pricingStatus: 'Not Set',
          
          joinedDate: new Date().toISOString()
      };

      mockService.addMarketplaceCustomer(customer);
      refreshData();
      setIsOnboardModalOpen(false);
      // Reset form
      setNewBusiness({
          businessName: '', abn: '', address: '', weeklySpend: '', orderFreq: '', deliveryWindow: '', products: '',
          directorName: '', directorEmail: '', directorPhone: '', accountsName: '', accountsEmail: '', accountsMobile: '',
          chefName: '', chefEmail: '', chefMobile: '', customerType: 'Restaurant', connectedSupplierId: '', pzMarkup: '', pricingTier: 'Tier 2'
      });
      setProductFile(null);
      alert(`Business "${customer.businessName}" successfully onboarded! Please configure supplier and pricing in the list view.`);
  };

  const filteredCustomers = customers.filter(c => 
    c.businessName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Marketplace Management</h1>
            <p className="text-gray-500">Manage marketplace customers, supplier connections, and order fulfillment</p>
        </div>
        <button 
            onClick={() => setIsOnboardModalOpen(true)}
            className="px-4 py-2.5 bg-[#043003] hover:bg-[#064004] text-white font-bold rounded-lg shadow-sm flex items-center gap-2 transition-all"
        >
            <UserPlus size={18}/> Onboard Business
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Customers</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Connected</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.connected}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Pending Connection</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.pending}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
            <ShoppingCart size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Orders</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.activeOrders}</h3>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-100/50 p-1 rounded-lg inline-flex w-full md:w-auto border border-gray-200">
        <button 
          onClick={() => setActiveTab('customers')}
          className={`px-6 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'customers' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Customers
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'orders' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Orders
        </button>
        <button 
          onClick={() => setActiveTab('waiting')}
          className={`px-6 py-2 text-sm font-bold rounded-md transition-all flex items-center gap-2 ${activeTab === 'waiting' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Waiting
          {pendingRequests.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full animate-pulse shadow-sm">
                  {pendingRequests.length}
              </span>
          )}
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-visible min-h-[500px]">
        {/* Table Header Controls */}
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Store size={20} className="text-gray-900"/>
            <h2 className="text-lg font-bold text-gray-900">
                {activeTab === 'waiting' ? 'Pending Applications' : 'Marketplace Customers'}
            </h2>
          </div>
          {activeTab !== 'waiting' && (
            <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                type="text" 
                placeholder="Search customers..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                />
            </div>
          )}
        </div>

        {/* CUSTOMERS & ORDERS TAB CONTENT */}
        {activeTab === 'customers' && (
            <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Connected Supplier</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Pricing Tier</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">PZ Markup</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Pricing Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Orders</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Active Invoices</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Outstanding Amount</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Lifetime Value</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map(customer => {
                    const metrics = getCustomerMetrics(customer.id);
                    
                    return (
                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{customer.businessName}</div>
                        <div className="text-xs text-gray-500">{customer.email || 'No email'}</div>
                        </td>
                        <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                            {customer.category}
                        </span>
                        </td>
                        <td className="px-6 py-4">
                        {customer.connectionStatus === 'Active' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                            Active
                            </span>
                        )}
                        {customer.connectionStatus === 'Pending Connection' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-white text-orange-700 border border-orange-300">
                            Pending Connection
                            </span>
                        )}
                        {customer.connectionStatus === 'Pricing Pending' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-white text-blue-600 border border-blue-300">
                            Pricing Pending
                            </span>
                        )}
                        </td>
                        <td className="px-6 py-4">
                        {customer.connectedSupplierName ? (
                            <>
                            <div className="text-sm font-bold text-gray-900">{customer.connectedSupplierName}</div>
                            <div className="text-xs text-gray-500">{customer.connectedSupplierRole}</div>
                            </>
                        ) : (
                            <span className="text-xs text-gray-400 italic">Not connected</span>
                        )}
                        </td>
                        <td className="px-6 py-4">
                        {customer.pricingTier ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                            {customer.pricingTier}
                            </span>
                        ) : (
                            <span className="text-xs text-gray-400">Not set</span>
                        )}
                        </td>
                        <td className="px-6 py-4">
                        {customer.pzMarkup ? (
                            <span className="text-sm font-bold text-green-600">% {customer.pzMarkup}%</span>
                        ) : (
                            <span className="text-xs text-gray-400">Not set</span>
                        )}
                        </td>
                        <td className="px-6 py-4">
                        {customer.pricingStatus === 'Approved' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-green-100 text-green-800">
                            Approved
                            </span>
                        )}
                        {customer.pricingStatus === 'Pending PZ Approval' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
                            Pending PZ Approval
                            </span>
                        )}
                        {(!customer.pricingStatus || customer.pricingStatus === 'Not Set') && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold border border-gray-300 text-gray-500">
                            Not Set
                            </span>
                        )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {metrics.orderCount}
                        </td>
                        <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm font-medium text-green-700">
                            <FileText size={14}/> {metrics.activeInvoices}
                        </div>
                        </td>
                        <td className="px-6 py-4">
                        {metrics.outstanding > 0 ? (
                            <div className="flex items-center gap-1 text-sm font-bold text-red-600">
                            <AlertCircle size={14}/> ${metrics.outstanding.toLocaleString(undefined, {minimumFractionDigits: 2})}
                            </div>
                        ) : (
                            <span className="text-sm text-gray-400">$0</span>
                        )}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                        ${metrics.ltv.toLocaleString(undefined, {maximumFractionDigits: 0})}
                        </td>
                        <td className="px-6 py-4 text-right relative">
                        <button 
                            onClick={(e) => toggleActionMenu(e, customer.id)}
                            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 border border-transparent hover:border-gray-300 transition-all"
                        >
                            <MoreVertical size={16}/>
                        </button>

                        {/* Action Dropdown */}
                        {activeActionMenu === customer.id && (
                            <div ref={menuRef} className="absolute right-8 top-8 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right overflow-hidden">
                            <div className="py-1">
                                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                <Eye size={16} className="text-gray-400"/> View Profile
                                </button>
                                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                <Edit size={16} className="text-green-600"/> Edit Pricing
                                </button>
                                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                <Percent size={16} className="text-purple-600"/> Set Pricing Tier
                                </button>
                                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                <Settings size={16} className="text-orange-600"/> Configure Markup
                                </button>
                                <div className="border-t border-gray-100 my-1"></div>
                                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                <UserPlus size={16} className="text-gray-400"/> Assign Sales Rep
                                </button>
                                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                <FileText size={16} className="text-gray-400"/> Assign Accounts Rep
                                </button>
                            </div>
                            </div>
                        )}
                        </td>
                    </tr>
                    );
                })}
                </tbody>
            </table>
            {filteredCustomers.length === 0 && (
                <div className="p-12 text-center text-gray-400">
                    No customers found matching "{searchTerm}"
                </div>
            )}
            </div>
        )}

        {/* WAITING TAB CONTENT */}
        {activeTab === 'waiting' && (
            <div className="divide-y divide-gray-100">
                {pendingRequests.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="bg-gray-50 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle size={40} className="text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">All caught up!</h3>
                        <p className="text-gray-500 mt-1">No pending onboarding applications.</p>
                    </div>
                ) : (
                    pendingRequests.map(req => (
                        <div key={req.id} className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                <div className="space-y-3 flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-bold text-gray-900">{req.businessName}</h3>
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-blue-100 text-blue-700 border border-blue-200">
                                            New Submission
                                        </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-8 text-sm text-gray-600">
                                        <p className="flex items-center gap-2"><Users size={16} className="text-gray-400"/> {req.name}</p>
                                        <p className="flex items-center gap-2"><Mail size={16} className="text-gray-400"/> {req.email}</p>
                                        <p className="flex items-center gap-2"><Phone size={16} className="text-gray-400"/> {req.consumerData?.mobile || 'N/A'}</p>
                                        <p className="flex items-center gap-2"><MapPin size={16} className="text-gray-400"/> {req.consumerData?.location}</p>
                                        <p className="flex items-center gap-2"><DollarSign size={16} className="text-gray-400"/> Spend: ${req.consumerData?.weeklySpend}</p>
                                        <p className="flex items-center gap-2"><Clock size={16} className="text-gray-400"/> Freq: {req.consumerData?.orderFrequency}</p>
                                    </div>

                                    {req.consumerData?.invoiceFile && (
                                        <div className="pt-2">
                                            <button 
                                                onClick={() => handleViewFile(req.consumerData!.invoiceFile!)}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-bold rounded-lg hover:bg-indigo-100 border border-indigo-200 transition-colors"
                                            >
                                                <FileText size={14}/> View Submitted Documents
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 self-start md:self-center min-w-fit">
                                    <button 
                                        onClick={() => handleApproveRequest(req.id)}
                                        className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold shadow-sm flex items-center gap-2 transition-all"
                                    >
                                        <Check size={18}/> Accept
                                    </button>
                                    <button 
                                        onClick={() => handleRejectRequest(req.id)}
                                        className="px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 font-bold flex items-center gap-2 transition-all"
                                    >
                                        <X size={18}/> Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        )}
        
        {/* Placeholder for Orders Tab */}
        {activeTab === 'orders' && (
            <div className="p-12 text-center text-gray-400">
                <ShoppingCart size={48} className="mx-auto mb-4 opacity-20"/>
                <h3 className="text-lg font-medium text-gray-500">Order Management</h3>
                <p className="text-sm">View active orders from connected customers here.</p>
            </div>
        )}
      </div>

      {/* ONBOARDING MODAL */}
      {isOnboardModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8 animate-in zoom-in-95 duration-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                      <div>
                          <h2 className="text-2xl font-bold text-gray-900">Onboard New Business</h2>
                          <p className="text-sm text-gray-500 mt-1">Create profiles for buyers or suppliers manually.</p>
                      </div>
                      <button onClick={() => setIsOnboardModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition-colors">
                          <X size={24}/>
                      </button>
                  </div>

                  <form onSubmit={handleCreateBusiness} className="flex flex-col h-full max-h-[80vh] overflow-y-auto">
                      <div className="p-8 space-y-8">
                          
                          {/* Role Selection */}
                          <div className="flex justify-center mb-6">
                              <div className="bg-gray-100 p-1 rounded-xl inline-flex">
                                  <button 
                                      type="button" 
                                      onClick={() => setOnboardType('Buyer')}
                                      className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm ${onboardType === 'Buyer' ? 'bg-white text-gray-900 ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900'}`}
                                  >
                                      Buyer (Customer)
                                  </button>
                                  <button 
                                      type="button" 
                                      onClick={() => setOnboardType('Supplier')}
                                      className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm ${onboardType === 'Supplier' ? 'bg-white text-gray-900 ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900'}`}
                                  >
                                      Supplier
                                  </button>
                              </div>
                          </div>

                          {/* SECTION 1: BUSINESS DETAILS */}
                          <div className="space-y-4">
                              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2 border-b border-gray-100 pb-2">
                                  <Building size={18} className="text-emerald-600"/> Business Details
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                      <label className="block text-sm font-semibold text-gray-700 mb-1">Business Name</label>
                                      <input required type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                                          value={newBusiness.businessName} onChange={e => setNewBusiness({...newBusiness, businessName: e.target.value})} placeholder="e.g. The Morning Cafe"
                                      />
                                  </div>
                                  <div>
                                      <label className="block text-sm font-semibold text-gray-700 mb-1">ABN</label>
                                      <input required type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                                          value={newBusiness.abn} onChange={e => setNewBusiness({...newBusiness, abn: e.target.value})} placeholder="XX XXX XXX XXX"
                                      />
                                  </div>
                                  <div className="md:col-span-2">
                                      <label className="block text-sm font-semibold text-gray-700 mb-1">Address / Location</label>
                                      <div className="relative">
                                          <MapPin size={18} className="absolute left-3 top-3 text-gray-400"/>
                                          <input required type="text" className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                                              value={newBusiness.address} onChange={e => setNewBusiness({...newBusiness, address: e.target.value})} placeholder="123 Main St, Melbourne VIC 3000"
                                          />
                                      </div>
                                  </div>
                              </div>
                          </div>

                          {/* SECTION 2: OPERATIONS (BUYER ONLY) */}
                          {onboardType === 'Buyer' && (
                              <div className="space-y-4">
                                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2 border-b border-gray-100 pb-2">
                                      <Truck size={18} className="text-blue-600"/> Operational Profile
                                  </h3>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                      <div>
                                          <label className="block text-sm font-semibold text-gray-700 mb-1">Est. Weekly Spend</label>
                                          <div className="relative">
                                              <DollarSign size={16} className="absolute left-3 top-3.5 text-gray-400"/>
                                              <input type="number" className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                                                  value={newBusiness.weeklySpend} onChange={e => setNewBusiness({...newBusiness, weeklySpend: e.target.value})} placeholder="2000"
                                              />
                                          </div>
                                      </div>
                                      <div>
                                          <label className="block text-sm font-semibold text-gray-700 mb-1">Order Frequency</label>
                                          <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                                              value={newBusiness.orderFreq} onChange={e => setNewBusiness({...newBusiness, orderFreq: e.target.value})}
                                          >
                                              <option value="">Select Frequency</option>
                                              <option value="Daily">Daily</option>
                                              <option value="2-3 Times/Week">2-3 Times/Week</option>
                                              <option value="Weekly">Weekly</option>
                                          </select>
                                      </div>
                                      <div>
                                          <label className="block text-sm font-semibold text-gray-700 mb-1">Delivery Window</label>
                                          <div className="relative">
                                              <Clock size={16} className="absolute left-3 top-3.5 text-gray-400"/>
                                              <input type="text" className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                                                  value={newBusiness.deliveryWindow} onChange={e => setNewBusiness({...newBusiness, deliveryWindow: e.target.value})} placeholder="e.g. 6am - 10am"
                                              />
                                          </div>
                                      </div>
                                      <div className="md:col-span-3">
                                          <div className="flex justify-between items-center mb-1">
                                              <label className="block text-sm font-semibold text-gray-700">Frequently Ordered Products</label>
                                              <div className="relative overflow-hidden">
                                                  <label htmlFor="product-file-upload" className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer bg-indigo-50 px-2 py-1 rounded transition-colors">
                                                      <Upload size={12} /> {productFile ? 'Change File' : 'Upload List'}
                                                  </label>
                                                  <input 
                                                      id="product-file-upload"
                                                      type="file" 
                                                      className="hidden" 
                                                      onChange={(e) => {
                                                          if(e.target.files?.[0]) setProductFile(e.target.files[0]);
                                                      }}
                                                  />
                                              </div>
                                          </div>
                                          
                                          {productFile && (
                                              <div className="mb-2 flex items-center justify-between bg-indigo-50 p-2 rounded border border-indigo-100 text-sm">
                                                  <span className="flex items-center gap-2 text-indigo-800 font-medium">
                                                      <FileText size={14}/> {productFile.name}
                                                  </span>
                                                  <button type="button" onClick={() => setProductFile(null)} className="text-gray-400 hover:text-red-500"><X size={14}/></button>
                                              </div>
                                          )}

                                          <textarea className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none h-20 resize-none" 
                                              value={newBusiness.products} onChange={e => setNewBusiness({...newBusiness, products: e.target.value})} placeholder="e.g. Tomatoes, Milk, Eggs, Avocados..."
                                          />
                                      </div>
                                  </div>
                              </div>
                          )}

                          {/* SECTION 3: CONTACTS (BUYER ONLY) */}
                          {onboardType === 'Buyer' && (
                              <div className="space-y-4">
                                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2 border-b border-gray-100 pb-2">
                                      <Users size={18} className="text-purple-600"/> Key Contacts
                                  </h3>
                                  
                                  {/* Director */}
                                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                      <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Director / Owner</h4>
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                          <input type="text" className="p-2 border border-gray-200 rounded text-sm" placeholder="Full Name" value={newBusiness.directorName} onChange={e => setNewBusiness({...newBusiness, directorName: e.target.value})}/>
                                          <input type="email" className="p-2 border border-gray-200 rounded text-sm" placeholder="Email" value={newBusiness.directorEmail} onChange={e => setNewBusiness({...newBusiness, directorEmail: e.target.value})}/>
                                          <input type="tel" className="p-2 border border-gray-200 rounded text-sm" placeholder="Mobile" value={newBusiness.directorPhone} onChange={e => setNewBusiness({...newBusiness, directorPhone: e.target.value})}/>
                                      </div>
                                  </div>

                                  {/* Accounts */}
                                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                      <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Accounts Payable</h4>
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                          <input type="text" className="p-2 border border-gray-200 rounded text-sm" placeholder="Full Name" value={newBusiness.accountsName} onChange={e => setNewBusiness({...newBusiness, accountsName: e.target.value})}/>
                                          <input type="email" className="p-2 border border-gray-200 rounded text-sm" placeholder="Email" value={newBusiness.accountsEmail} onChange={e => setNewBusiness({...newBusiness, accountsEmail: e.target.value})}/>
                                          <input type="tel" className="p-2 border border-gray-200 rounded text-sm" placeholder="Mobile" value={newBusiness.accountsMobile} onChange={e => setNewBusiness({...newBusiness, accountsMobile: e.target.value})}/>
                                      </div>
                                  </div>

                                  {/* Chef */}
                                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                      <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Head Chef</h4>
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                          <input type="text" className="p-2 border border-gray-200 rounded text-sm" placeholder="Full Name" value={newBusiness.chefName} onChange={e => setNewBusiness({...newBusiness, chefName: e.target.value})}/>
                                          <input type="email" className="p-2 border border-gray-200 rounded text-sm" placeholder="Email" value={newBusiness.chefEmail} onChange={e => setNewBusiness({...newBusiness, chefEmail: e.target.value})}/>
                                          <input type="tel" className="p-2 border border-gray-200 rounded text-sm" placeholder="Mobile" value={newBusiness.chefMobile} onChange={e => setNewBusiness({...newBusiness, chefMobile: e.target.value})}/>
                                      </div>
                                  </div>
                              </div>
                          )}

                          {/* Removed Admin Configuration Section per request */}

                      </div>

                      <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 sticky bottom-0">
                          <button 
                              type="button" 
                              onClick={() => setIsOnboardModalOpen(false)}
                              className="px-6 py-3 text-gray-700 font-bold hover:bg-gray-200 rounded-lg transition-colors"
                          >
                              Cancel
                          </button>
                          <button 
                              type="submit"
                              className="px-8 py-3 bg-[#043003] text-white font-bold rounded-lg hover:bg-[#064004] shadow-lg flex items-center gap-2 transition-all"
                          >
                              <CheckCircle size={20}/> Complete Onboarding
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};
