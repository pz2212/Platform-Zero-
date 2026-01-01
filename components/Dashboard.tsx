
import React, { useState, useEffect, useRef } from 'react';
import { User, Order, Product, Customer, SupplierPriceRequest, UserRole, AppNotification, RegistrationRequest, InventoryItem } from '../types';
import { mockService } from '../services/mockDataService';
import { AiOpportunityMatcher } from './AiOpportunityMatcher';
import { DeliListingForm } from './DeliListingForm';
import { Settings as SettingsComponent } from './Settings';
import { InviteBuyerModal } from './InviteBuyerModal';
import { InterestsModal } from './InterestsModal';
import { triggerNativeSms, generateProductDeepLink } from '../services/smsService';
import { 
  Package, Truck, MapPin, LayoutDashboard, 
  Users, Clock, CheckCircle, X, Mail, Smartphone, Building,
  Settings, Calculator, FileText, ChevronRight, LayoutGrid, Search, Bell, History, Calendar, Printer, AlertTriangle, TrendingUp, Globe, Star, UserPlus, ArrowUpRight,
  Plus, Store, MessageSquare, Camera, Image as ImageIcon, Loader2, Send, ChevronDown, DollarSign, HelpCircle, Sparkles, ArrowLeft, ShoppingCart, ShoppingBag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardProps {
  user: User;
}

const AU_STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];

const SA_PRODUCE_MARKET_SUPPLIERS = [
    { name: 'AMJ Produce', mobile: '08 8349 4500', email: 'sales@amjproduce.com.au', location: 'Burma Drive, Pooraka', specialty: 'Fruit & Veg' },
    { name: 'Bache Bros', mobile: '08 8349 4555', email: 'bachebros@internode.on.net', location: 'Pooraka Market', specialty: 'Potatoes & Onions' },
    { name: 'Ceravolo Orchards', mobile: '08 8389 6188', email: 'info@ceravolo.com.au', location: 'Adelaide Hills / Pooraka', specialty: 'Apples, Pears, Cherries' },
    { name: 'Costa Group (SA)', mobile: '08 8349 4544', email: 'sa.sales@costagroup.com.au', location: 'Market Complex, Pooraka', specialty: 'Global Produce' },
    { name: 'GD Produce', mobile: '08 8349 4444', email: 'sales@gdproduce.com.au', location: 'Wholesale Store 12', specialty: 'Leafy Greens' },
    { name: 'Mackays Produce', mobile: '08 8349 4333', email: 'sales@mackays.com.au', location: 'Wholesale Store 45', specialty: 'Bananas & Tropical' },
    { name: 'Perfection Fresh', mobile: '08 8349 4222', email: 'sales@perfection.com.au', location: 'Pooraka Hub', specialty: 'Branded Specialty' },
    { name: 'Quality Produce International', mobile: '08 8349 4111', email: 'info@qpi.com.au', location: 'Pooraka Market Store', specialty: 'Export Quality' },
    { name: 'SA Potato Company', mobile: '08 8349 4000', email: 'admin@sapota.com.au', location: 'Potatoes Central', specialty: 'Potatoes' },
    { name: 'Vizzarri Farms', mobile: '08 8349 3999', email: 'admin@vizzarri.com.au', location: 'Pooraka HQ', specialty: 'Fresh Herbs' },
];

const SendPhotoOfferModal = ({ isOpen, onClose, supplier, products }: any) => {
    const [image, setImage] = useState<string | null>(null);
    const [price, setPrice] = useState('');
    const [productId, setProductId] = useState('');
    const [minOrder, setMinOrder] = useState('');
    const [logisticsPrice, setLogisticsPrice] = useState('');
    const [description, setDescription] = useState('');
    const [isSending, setIsSending] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => setImage(ev.target?.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSend = () => {
        if (!supplier?.mobile) {
            alert("No mobile number attached to this profile.");
            return;
        }
        setIsSending(true);
        const productObj = products.find((p: any) => p.id === productId);
        const productName = productObj?.name || "Fresh Produce";
        const link = generateProductDeepLink('quote', Math.random().toString(36).substr(2, 9));
        const message = `PZ OFFER: ${productName}\nPrice: $${price}/kg\nMin Order: ${minOrder}kg\nLogistics: $${logisticsPrice}\nDescription: ${description}\n\nView product photo & accept offer here: ${link}`;
        triggerNativeSms(supplier.mobile, message);
        setTimeout(() => {
            setIsSending(false);
            alert(`Offer dispatched to ${supplier.name}!`);
            onClose();
        }, 1200);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 uppercase">Send Photo Offer</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">To: {supplier.name}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
                </div>
                <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all ${image ? 'border-emerald-500' : 'border-gray-200 hover:border-indigo-400 hover:bg-gray-50'}`}
                    >
                        {image ? <img src={image} className="w-full h-full object-cover" alt="Preview"/> : (
                            <div className="text-center">
                                <Camera size={32} className="text-gray-300 mx-auto mb-2"/>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Select Product Photo</p>
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFile}/>
                    </div>
                    <div className="space-y-4">
                        <select className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm outline-none" value={productId} onChange={e => setProductId(e.target.value)}>
                            <option value="">Select Category...</option>
                            {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <textarea placeholder="e.g. Premium Grade A..." className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm h-20 resize-none outline-none" value={description} onChange={e => setDescription(e.target.value)}/>
                        <div className="grid grid-cols-1 gap-4">
                            <input type="number" placeholder="Price ($/kg)" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm outline-none" value={price} onChange={e => setPrice(e.target.value)}/>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <input type="number" placeholder="Min Order (kg)" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm outline-none" value={minOrder} onChange={e => setMinOrder(e.target.value)}/>
                            <input type="number" placeholder="Logistics ($)" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm outline-none" value={logisticsPrice} onChange={e => setLogisticsPrice(e.target.value)}/>
                        </div>
                    </div>
                    <button onClick={handleSend} disabled={isSending || !image || !price} className="w-full py-4 bg-[#043003] text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl disabled:opacity-50">
                        {isSending ? <Loader2 className="animate-spin" size={18}/> : <><Send size={16}/> Dispatch Offer</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Home');
  const [orderSubTab, setOrderSubTab] = useState('PENDING');
  const [selectedState, setSelectedState] = useState('SA');
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [leads, setLeads] = useState<RegistrationRequest[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplierForPhoto, setSelectedSupplierForPhoto] = useState<any>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isInterestsModalOpen, setIsInterestsModalOpen] = useState(false);
  const [marketLots, setMarketLots] = useState<{product: Product, item: InventoryItem}[]>([]);

  const products = mockService.getAllProducts();

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    if ((!user.activeSellingInterests || user.activeSellingInterests.length === 0) && (!user.activeBuyingInterests || user.activeBuyingInterests.length === 0)) {
        setIsInterestsModalOpen(true);
    }
    return () => clearInterval(interval);
  }, [user]);

  const loadData = () => {
    const allOrders = mockService.getOrders(user.id).filter(o => o.sellerId === user.id);
    setOrders(allOrders);
    setCustomers(mockService.getCustomers());
    setNotifications(mockService.getAppNotifications(user.id));
    setLeads(mockService.getRegistrationRequests().filter(r => r.status === 'Pending'));

    // Wholesale Market logic (Right Panel)
    const inventory = mockService.getAllInventory();
    const now = new Date();
    const aged = inventory.filter(item => {
        if (item.status !== 'Available') return false;
        const uploadedAt = new Date(item.uploadedAt);
        const diffDays = (now.getTime() - uploadedAt.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays >= (item.discountAfterDays || 3);
    }).map(item => ({
        item,
        product: products.find(p => p.id === item.productId)!
    })).filter(x => !!x.product);
    setMarketLots(aged);
  };

  const handleAcceptOrder = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    mockService.acceptOrderV2(orderId);
    loadData();
    alert("Order Accepted!");
  };

  const pendingAcceptance = orders.filter(o => o.status === 'Pending');
  const acceptedOrders = orders.filter(o => o.status === 'Confirmed' || o.status === 'Ready for Delivery' || o.status === 'Shipped');
  const fulfilledOrders = orders.filter(o => o.status === 'Delivered');

  const displayedOrders = orderSubTab === 'PENDING' ? pendingAcceptance : orderSubTab === 'ACCEPTED' ? acceptedOrders : fulfilledOrders;

  const filteredCustomers = customers.filter(c => 
    c.connectedSupplierId === user.id && 
    (c.businessName.toLowerCase().includes(searchTerm.toLowerCase()) || c.contactName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredSaSuppliers = selectedState === 'SA' 
    ? SA_PRODUCE_MARKET_SUPPLIERS.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.specialty.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  const getStatusConfig = (status: string | undefined) => {
    switch(status) {
        case 'Active': return { color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: CheckCircle };
        case 'Pending Connection': return { color: 'text-orange-600 bg-orange-50 border-orange-100', icon: Clock };
        case 'Pricing Pending': return { color: 'text-blue-600 bg-blue-50 border-blue-100', icon: DollarSign };
        default: return { color: 'text-gray-500 bg-gray-50 border-gray-100', icon: HelpCircle };
    }
  };

  const menuButtons = [
    { 
        id: 'Platform Zero', 
        label: 'Platform Zero', 
        icon: Sparkles, 
        color: 'bg-emerald-600', 
        desc: 'Hub',
        badge: leads.length + notifications.filter(n => !n.isRead).length
    },
    { 
        id: 'SELL', 
        label: 'Scanner', 
        icon: Camera, 
        color: 'bg-indigo-600', 
        desc: 'AI Matching' 
    },
    { 
        id: 'Orders', 
        label: 'Orders', 
        icon: LayoutGrid, 
        color: 'bg-slate-900', 
        desc: 'Trade',
        badge: pendingAcceptance.length
    },
    { 
        id: 'Customers', 
        label: 'Buyers', 
        icon: Users, 
        color: 'bg-slate-900', 
        desc: 'Directory' 
    },
    { 
        id: 'Suppliers', 
        label: 'Vendors', 
        icon: Store, 
        color: 'bg-slate-900', 
        desc: 'Network' 
    }
  ];

  return (
    <div className="animate-in fade-in duration-500 min-h-screen pb-20">
      {/* HEADER SECTION */}
      <div className="mb-10 flex justify-between items-start">
        <div>
            {activeTab !== 'Home' && (
                <button 
                    onClick={() => setActiveTab('Home')}
                    className="mb-4 flex items-center gap-2 text-gray-400 hover:text-gray-900 font-black text-[10px] uppercase tracking-widest transition-all"
                >
                    <ArrowLeft size={16}/> Control Center
                </button>
            )}
            <h1 className="text-[42px] font-black text-[#0F172A] tracking-tighter uppercase leading-none">
                {activeTab === 'Home' ? 'Partner Operations' : activeTab}
            </h1>
            <p className="text-gray-500 font-medium text-sm mt-2">
                {activeTab === 'Home' ? `Management Console • ${user.businessName}` : `Managing your ${activeTab.toLowerCase()} interface.`}
            </p>
        </div>
        {activeTab === 'Home' && (
            <button onClick={() => setActiveTab('Settings')} className="p-4 bg-white border border-gray-100 rounded-3xl text-gray-400 hover:text-gray-900 shadow-sm transition-all hover:shadow-md">
                <Settings size={28}/>
            </button>
        )}
      </div>

      {/* MAIN VIEW - HOME GRID */}
      {activeTab === 'Home' && (
        <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
            
            {/* PLATFORM ZERO ORDERS TO ACCEPT */}
            {pendingAcceptance.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2 text-red-600 font-black text-[11px] uppercase tracking-[0.25em]">
                            <AlertTriangle size={16}/> Orders Awaiting Acceptance
                        </div>
                        <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100">{pendingAcceptance.length} Action Items</span>
                    </div>
                    
                    <div className="space-y-3">
                        {pendingAcceptance.slice(0, 2).map(order => {
                            const buyer = customers.find(c => c.id === order.buyerId);
                            return (
                                <div key={order.id} className="bg-white rounded-[2rem] border-2 border-red-50 p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm hover:shadow-md transition-all group">
                                    <div className="flex items-center gap-5 flex-1">
                                        <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner-sm shrink-0 uppercase border border-red-100">
                                            {buyer?.businessName.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-gray-900 uppercase tracking-tight leading-none mb-1.5">{buyer?.businessName}</h4>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Package size={12}/> {order.items.length} Varieties • Ref: #{order.id.split('-').pop()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Trade Total</p>
                                            <p className="text-2xl font-black text-emerald-600 tracking-tighter">${order.totalAmount.toFixed(2)}</p>
                                        </div>
                                        <button 
                                            onClick={(e) => handleAcceptOrder(e, order.id)}
                                            className="px-10 py-4 bg-emerald-600 hover:bg-black text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-100 transition-all flex items-center gap-2 group-hover:scale-105"
                                        >
                                            <CheckCircle size={18}/> Accept Order
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* SPLIT PRIMARY WORKSPACES */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                
                {/* LEFT: DELI STOREFRONT MANAGER */}
                <div className="xl:col-span-7">
                    <div className="h-full">
                        <DeliListingForm user={user} onComplete={loadData} />
                    </div>
                </div>

                {/* RIGHT: LIVE WHOLESALE MARKET FEED */}
                <div className="xl:col-span-5">
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[650px]">
                        <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                                    <Globe className="text-indigo-600" size={24}/> Wholesale Market
                                </h3>
                                <p className="text-[10px] font-black text-indigo-50 uppercase tracking-widest mt-1">Live Network Procurement</p>
                            </div>
                            <button onClick={() => navigate('/grocer/marketplace')} className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-400 hover:text-indigo-600 transition-all"><ArrowUpRight size={20}/></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            {marketLots.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-30">
                                    <ShoppingBag size={48} className="text-gray-300 mb-4" />
                                    <p className="text-xs font-black uppercase tracking-widest">No wholesale lots listed today</p>
                                </div>
                            ) : marketLots.map(({ product, item }, idx) => (
                                <div key={idx} className="p-5 bg-white border border-gray-50 rounded-3xl shadow-sm hover:shadow-md transition-all group">
                                    <div className="flex items-center gap-5 mb-4">
                                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 border border-gray-50 shrink-0">
                                            <img src={product.imageUrl} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-black text-gray-900 text-base uppercase tracking-tight truncate">{product.name}</h4>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{product.variety}</span>
                                                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{item.quantityKg}kg Ready</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 flex justify-between items-center">
                                        <div>
                                            <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-1">Platform Zero Rate</p>
                                            <p className="text-xl font-black text-emerald-600 tracking-tighter">${(item.discountPricePerKg || product.defaultPricePerKg * 0.7).toFixed(2)}/kg</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">Market Standard</p>
                                            <p className="text-xs font-bold text-gray-400 line-through">${product.defaultPricePerKg.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => navigate('/grocer/marketplace')} className="w-full mt-4 py-3 bg-[#0F172A] hover:bg-black text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] shadow-lg transition-all flex items-center justify-center gap-2">
                                        <ShoppingCart size={14}/> Procure Lot
                                    </button>
                                </div>
                            ))}
                        </div>
                        
                        <div className="p-6 border-t border-gray-100 bg-white">
                             <button onClick={() => navigate('/grocer/marketplace')} className="w-full py-4 border-2 border-indigo-100 text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-50 transition-all">
                                Open Full Marketplace
                             </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECONDARY ACTION GRID */}
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-6">
                {menuButtons.map((btn) => (
                    <button 
                        key={btn.id}
                        onClick={() => setActiveTab(btn.id)}
                        className="relative group bg-white border border-gray-100 hover:border-indigo-100 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all active:scale-[0.98]"
                    >
                        <div className={`w-14 h-14 ${btn.color} rounded-2xl flex items-center justify-center text-white shadow-xl mb-4 group-hover:scale-110 transition-transform duration-500`}>
                            <btn.icon size={28} strokeWidth={2.5}/>
                        </div>
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight mb-1">{btn.label}</h3>
                        <p className="text-gray-400 font-bold uppercase text-[8px] tracking-widest">{btn.desc}</p>
                        
                        {btn.badge ? (
                            <span className="absolute top-4 right-4 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] shadow-lg ring-2 ring-white">
                                {btn.badge}
                            </span>
                        ) : null}
                    </button>
                ))}
                
                <button 
                    onClick={() => setActiveTab('Settings')}
                    className="bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center hover:bg-gray-100/80 hover:border-gray-300 transition-all group"
                >
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-gray-300 shadow-sm mb-4 group-hover:rotate-45 transition-transform">
                        <Settings size={24} />
                    </div>
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-tight">Account</h3>
                </button>
            </div>
        </div>
      )}

      {/* PLATFORM ZERO HUB */}
      {activeTab === 'Platform Zero' && (
          <div className="space-y-10 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="bg-white rounded-[3rem] border border-gray-100 p-12 shadow-sm">
                      <div className="flex justify-between items-center mb-10">
                          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-4"><Users className="text-indigo-600" size={32}/> Marketplace Leads</h2>
                          <span className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest">{leads.length} New</span>
                      </div>
                      <div className="space-y-5">
                          {leads.length === 0 ? (
                              <div className="text-center py-16 opacity-30 grayscale">
                                <Users size={48} className="mx-auto mb-4"/>
                                <p className="text-sm font-bold uppercase tracking-widest">No active leads</p>
                              </div>
                          ) : leads.map(lead => (
                              <div 
                                key={lead.id} 
                                onClick={() => navigate('/login-requests')}
                                className="p-6 bg-gray-50 rounded-3xl flex justify-between items-center border border-transparent hover:border-indigo-200 hover:bg-white transition-all shadow-sm group cursor-pointer"
                              >
                                  <div>
                                      <p className="font-black text-gray-900 uppercase text-base leading-none mb-2">{lead.businessName}</p>
                                      <div className="flex items-center gap-3">
                                          <span className="text-[10px] text-indigo-600 font-black uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded">{lead.requestedRole}</span>
                                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{lead.consumerData?.location || 'Australia'}</p>
                                      </div>
                                  </div>
                                  <button className="bg-white p-3 rounded-2xl text-gray-300 hover:text-indigo-600 shadow-sm border border-gray-100 transition-all group-hover:shadow-md"><ChevronRight size={20}/></button>
                              </div>
                          ))}
                      </div>
                  </div>

                  <div className="bg-white rounded-[3rem] border border-gray-100 p-12 shadow-sm">
                      <div className="flex justify-between items-center mb-10">
                          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-4"><Bell className="text-emerald-500" size={32}/> Market Activity</h2>
                          <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-emerald-600 transition-colors">Clear All</button>
                      </div>
                      <div className="space-y-5 max-h-[500px] overflow-y-auto no-scrollbar pr-2">
                          {notifications.map(n => (
                              <div key={n.id} className={`p-6 rounded-3xl border-2 transition-all ${!n.isRead ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-gray-50'}`}>
                                  <div className="flex justify-between items-start mb-2">
                                      <p className="font-black text-gray-900 text-sm uppercase tracking-tight leading-none">{n.title}</p>
                                      <span className="text-[9px] text-gray-400 font-black uppercase">{new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                  </div>
                                  <p className="text-xs text-gray-500 leading-relaxed font-medium">{n.message}</p>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* SELL / SCANNER */}
      {activeTab === 'SELL' && (
        <div className="animate-in fade-in zoom-in-95 duration-500">
            <AiOpportunityMatcher user={user} />
        </div>
      )}

      {/* ORDERS LIST */}
      {activeTab === 'Orders' && (
        <div className="space-y-10 animate-in fade-in duration-300">
            <div className="bg-gray-100/50 p-2 rounded-3xl inline-flex gap-1.5 border border-gray-200/50 shadow-inner">
                <button onClick={() => setOrderSubTab('PENDING')} className={`px-12 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${orderSubTab === 'PENDING' ? 'bg-white text-gray-900 shadow-lg ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}>
                    Acceptance {pendingAcceptance.length > 0 && <span className="bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[9px]">{pendingAcceptance.length}</span>}
                </button>
                <button onClick={() => setOrderSubTab('ACCEPTED')} className={`px-12 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all ${orderSubTab === 'ACCEPTED' ? 'bg-white text-gray-900 shadow-lg ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}>Current</button>
                <button onClick={() => setOrderSubTab('FULFILLED')} className={`px-12 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all ${orderSubTab === 'FULFILLED' ? 'bg-white text-gray-900 shadow-lg ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}>Fulfilled</button>
            </div>

            <div className="space-y-4">
                {displayedOrders.length === 0 ? (
                    <div className="py-32 text-center bg-white rounded-[3.5rem] border-2 border-dashed border-gray-100 shadow-sm opacity-50 grayscale">
                        <CheckCircle size={64} className="mx-auto text-indigo-100 mb-6"/>
                        <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-xs">No entries found</p>
                    </div>
                ) : displayedOrders.map(order => {
                    const buyer = customers.find(c => c.id === order.buyerId);
                    const isExpanded = expandedOrderId === order.id;
                    return (
                        <div key={order.id} onClick={() => setExpandedOrderId(isExpanded ? null : order.id)} className={`bg-white rounded-[2.5rem] border transition-all cursor-pointer overflow-hidden ${isExpanded ? 'border-gray-900 shadow-2xl z-10 relative scale-[1.01]' : 'border-gray-100 shadow-sm hover:border-indigo-100'}`}>
                            <div className="p-8 flex flex-col md:flex-row justify-between items-center gap-10">
                                <div className="flex items-center gap-8 flex-1">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-gray-50 flex items-center justify-center text-gray-400 font-black text-2xl shadow-inner-sm uppercase border border-gray-100">{buyer?.businessName.charAt(0)}</div>
                                    <div><h3 className="font-black text-gray-900 text-xl uppercase tracking-tighter mb-1">{buyer?.businessName}</h3><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ORDER REF: #{order.id.split('-').pop()} • {new Date(order.date).toLocaleDateString()}</p></div>
                                </div>
                                <div className="flex items-center gap-12 w-full md:w-auto justify-between md:justify-end">
                                    <div className="text-right"><p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Trade Amount</p><p className="text-3xl font-black text-gray-900 tracking-tighter">${order.totalAmount.toFixed(2)}</p></div>
                                    {order.status === 'Pending' ? (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleAcceptOrder(e, order.id); }} 
                                            className="px-12 py-4 bg-emerald-600 hover:bg-black text-white font-black rounded-2xl text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-100 active:scale-95"
                                        >
                                            Accept Now
                                        </button>
                                    ) : (
                                        <div className="px-8 py-3 rounded-xl bg-gray-100 text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] border border-gray-200">{order.status}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      )}

      {/* CUSTOMERS VIEW */}
      {activeTab === 'Customers' && (
        <div className="space-y-12 animate-in fade-in duration-300">
            <div className="relative w-full group max-w-4xl mx-auto">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors" size={24}/>
                <input placeholder="Search global buyer network..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-16 pr-10 py-6 bg-white border-2 border-gray-100 rounded-[2.5rem] outline-none focus:ring-8 focus:ring-indigo-50/50 focus:border-indigo-400 shadow-xl font-black text-lg uppercase tracking-tight transition-all" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredCustomers.map(customer => {
                    const statusCfg = getStatusConfig(customer.connectionStatus);
                    const StatusIcon = statusCfg.icon;
                    return (
                        <div key={customer.id} className="p-12 bg-white border border-gray-100 rounded-[3.5rem] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all group flex flex-col justify-between min-h-[460px] animate-in zoom-in-95">
                            <div>
                                <div className="flex justify-between items-start mb-10">
                                    <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center font-black text-3xl text-indigo-700 shadow-inner-sm border border-indigo-100/50">{customer.businessName.charAt(0)}</div>
                                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-sm ${statusCfg.color}`}><StatusIcon size={16}/><span className="text-[10px] font-black uppercase tracking-widest">{customer.connectionStatus || 'Active'}</span></div>
                                </div>
                                <h3 className="font-black text-gray-900 text-3xl tracking-tighter leading-none mb-3 group-hover:text-indigo-600 transition-colors uppercase">{customer.businessName}</h3>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] mb-10">{customer.category}</p>
                            </div>
                            <button 
                                onClick={() => navigate('/customer-portal')}
                                className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-[0.25em] shadow-2xl hover:bg-black transition-all"
                            >
                                Open Records
                            </button>
                        </div>
                    );
                })}
                <div onClick={() => setIsInviteModalOpen(true)} className="border-4 border-dashed border-gray-100 rounded-[3.5rem] p-12 flex flex-col items-center justify-center text-center group hover:bg-emerald-50/20 hover:border-emerald-200 transition-all cursor-pointer min-h-[460px] bg-white/50">
                    <div className="w-24 h-24 bg-white rounded-full shadow-2xl flex items-center justify-center mb-10 border border-gray-50 group-hover:scale-110 transition-transform"><Plus size={40} className="text-emerald-500"/></div>
                    <h3 className="text-2xl font-black text-gray-400 group-hover:text-gray-900 uppercase tracking-tighter">Provision Buyer</h3>
                    <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.2em] mt-4">Invite Direct Account</p>
                </div>
            </div>
        </div>
      )}

      {/* SUPPLIERS VIEW */}
      {activeTab === 'Suppliers' && (
        <div className="space-y-10 animate-in fade-in duration-300">
            <div className="bg-white p-3 rounded-3xl border border-gray-200 shadow-sm flex items-center gap-2 overflow-x-auto no-scrollbar whitespace-nowrap">
                {AU_STATES.map(state => <button key={state} onClick={() => setSelectedState(state)} className={`flex-1 min-w-[100px] py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${selectedState === state ? 'bg-emerald-600 text-white shadow-xl ring-4 ring-emerald-50' : 'text-gray-400 hover:bg-gray-50'}`}>{state}</button>)}
            </div>
            <div className="bg-white rounded-[3.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-12 bg-gray-50/50 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white rounded-[1.5rem] shadow-xl text-emerald-600 border border-gray-100"><Store size={32}/></div>
                        <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">{selectedState} Market Directory</h2>
                    </div>
                    <button className="px-8 py-3.5 bg-white border-2 border-indigo-100 text-indigo-600 font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-sm hover:bg-indigo-50 transition-all flex items-center gap-3">
                        <Globe size={18}/> Global Sourcing
                    </button>
                </div>
                <div className="overflow-x-auto">
                    {filteredSaSuppliers.length > 0 ? (
                        <table className="w-full text-left">
                            <thead className="bg-white border-b border-gray-100 text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]">
                                <tr><th className="px-12 py-8">Trading Entity</th><th className="px-12 py-8">Mobile</th><th className="px-12 py-8">Location</th><th className="px-12 py-8 text-right">Actions</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredSaSuppliers.map((s, i) => (
                                    <tr key={i} className="hover:bg-gray-50/80 transition-all group">
                                        <td className="px-12 py-10 font-black text-gray-900 uppercase tracking-tighter text-xl">{s.name}</td>
                                        <td className="px-12 py-10 text-base font-bold text-gray-500">{s.mobile}</td>
                                        <td className="px-12 py-10 text-[11px] font-black text-gray-400 uppercase tracking-widest">{s.location}</td>
                                        <td className="px-12 py-10 text-right"><button onClick={() => setSelectedSupplierForPhoto(s)} className="p-5 bg-white border border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-200 rounded-[1.5rem] transition-all shadow-md group-hover:scale-110 active:scale-95"><Camera size={24}/></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : <div className="p-40 text-center text-gray-200 font-black uppercase tracking-[0.5em]">Network Search Found 0 Partners</div>}
                </div>
            </div>
        </div>
      )}

      {/* SETTINGS VIEW */}
      {activeTab === 'Settings' && (
        <div className="animate-in fade-in duration-300">
          <SettingsComponent user={user} onRefreshUser={loadData} />
        </div>
      )}

      {/* MODALS */}
      <SendPhotoOfferModal isOpen={!!selectedSupplierForPhoto} onClose={() => setSelectedSupplierForPhoto(null)} supplier={selectedSupplierForPhoto} products={products} />
      <InviteBuyerModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} wholesaler={user} />
      <InterestsModal user={user} isOpen={isInterestsModalOpen} onClose={() => setIsInterestsModalOpen(false)} onSaved={loadData} />
    </div>
  );
};
