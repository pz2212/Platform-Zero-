
import React, { useState, useEffect, useRef } from 'react';
import { User, Order, InventoryItem, Product, SupplierPriceRequest, Driver, Packer, OrderItem, Customer } from '../types';
import { mockService } from '../services/mockDataService';
import { AiOpportunityMatcher } from './AiOpportunityMatcher';
import { ConsumerOnboarding } from './ConsumerOnboarding';
import { ProductPricing } from './ProductPricing';
import { Settings as SettingsComponent } from './Settings';
import { 
  Package, Truck, MapPin, AlertTriangle, LayoutDashboard, 
  Tags, Users, Clock, CheckCircle, Store, X, UploadCloud, 
  DollarSign, Camera, Check, ChevronDown, Info, Trash2, Search, Bell, Settings, GitPullRequest, ScanLine
} from 'lucide-react';

interface DashboardProps {
  user: User;
}

/* HIGH FIDELITY PACKING LIST MODAL - MATCHING REFINED USER REQUIREMENTS */
const PackingListModal: React.FC<{
    order: Order;
    onClose: () => void;
    onComplete: (packerId: string, driverId: string, photo: string) => void;
    drivers: Driver[];
    packers: Packer[];
}> = ({ order, onClose, onComplete, drivers, packers }) => {
    const [packedItems, setPackedItems] = useState<Record<string, boolean>>({});
    const [reportingItemId, setReportingItemId] = useState<string | null>(null);
    const [itemIssues, setItemIssues] = useState<Record<string, string>>({});
    const [selectedDriver, setSelectedDriver] = useState('');
    const [selectedPacker, setSelectedPacker] = useState('');
    const [proofPhoto, setProofPhoto] = useState<string | null>(null);

    const packedCount = Object.values(packedItems).filter(Boolean).length;
    const totalItems = order.items.length;
    const progress = (packedCount / totalItems) * 100;

    const handleReportIssue = (productId: string, issue: string) => {
        if (!issue || issue === "Select issue type") return;
        
        setItemIssues(prev => ({ ...prev, [productId]: issue }));
        setReportingItemId(null);
        
        // OPERATIONAL FLOW: Notify PZ Admin (u1) and Customer (order.buyerId)
        const product = mockService.getProduct(productId);
        const productName = product?.name || 'Unknown Item';
        
        // 1. Notify Platform Zero Admin (u1)
        mockService.addNotification('u1', `URGENT: Order #${order.id} - Issue reported for ${productName}: ${issue}`);
        
        // 2. Notify the Customer (order.buyerId)
        mockService.addNotification(order.buyerId, `Status update for Order #${order.id}: A packing issue has been reported for ${productName} (${issue}). Platform Zero is resolving this for you.`);
        
        // Ensure item is not marked as packed if there is an issue
        setPackedItems(prev => ({ ...prev, [productId]: false }));
    };

    const togglePacked = (productId: string) => {
        setPackedItems(prev => ({...prev, [productId]: !prev[productId]}));
        if (itemIssues[productId]) {
            setItemIssues(prev => {
                const n = {...prev};
                delete n[productId];
                return n;
            });
        }
        if (reportingItemId === productId) {
            setReportingItemId(null);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-white">
                    <div className="flex items-center gap-3">
                        <div className="bg-gray-100 p-2.5 rounded-xl text-gray-700"><Package size={24}/></div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Packing List - Order #{order.id.split('-')[1] || order.id}</h2>
                            <p className="text-sm text-gray-500 font-medium">Ordered on Dec 18, 2025</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><X size={24}/></button>
                </div>

                {/* Customer & Packer Assignment Row */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8 bg-gray-50/30 border-b border-gray-100 items-end">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Customer</p>
                        <p className="text-lg font-bold text-gray-900">{mockService.getCustomers().find(c => c.id === order.buyerId)?.contactName || 'Sarah Johnson'}</p>
                        <p className="text-sm text-gray-500">{mockService.getCustomers().find(c => c.id === order.buyerId)?.email || 'orders@freshmarket.com'}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Assign Packer</p>
                        <div className="relative">
                            <select 
                                value={selectedPacker}
                                onChange={e => setSelectedPacker(e.target.value)}
                                className="w-full pl-4 pr-10 py-2.5 border border-emerald-400 rounded-xl font-bold bg-white text-sm text-black outline-none focus:ring-2 focus:ring-emerald-500 appearance-none shadow-sm"
                            >
                                <option value="" className="text-black">Select a registered packer...</option>
                                {packers.map(p => <option key={p.id} value={p.id} className="text-black">{p.name}</option>)}
                            </select>
                            <Users size={18} className="absolute right-4 top-2.5 text-gray-400 pointer-events-none"/>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order Status</p>
                        <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-bold border border-purple-100">
                            <Clock size={12}/> assigned
                        </span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {/* Items Table */}
                    <div>
                        <h3 className="text-base font-bold text-gray-900 mb-4">Items to Pack</h3>
                        <table className="w-full text-left">
                            <thead className="bg-white border-b border-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest w-24 text-center">Status</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Item</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Quantity</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Issue Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {order.items.map((item, idx) => {
                                    const product = mockService.getProduct(item.productId);
                                    const isPacked = packedItems[item.productId];
                                    const issue = itemIssues[item.productId];
                                    const isReporting = reportingItemId === item.productId;

                                    return (
                                        <tr key={idx} className="group hover:bg-gray-50/50">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button 
                                                        onClick={() => togglePacked(item.productId)}
                                                        className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-all ${isPacked ? 'bg-white border-gray-900 text-gray-900 shadow-sm' : 'border-gray-300 hover:border-gray-900 bg-white text-transparent'}`}
                                                    >
                                                        <Check size={20} strokeWidth={3}/>
                                                    </button>
                                                    <button 
                                                        onClick={() => setReportingItemId(isReporting ? null : item.productId)}
                                                        className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-all ${isReporting || issue ? 'bg-[#EF4444] border-[#EF4444] text-white shadow-md scale-105' : 'bg-white border-gray-300 hover:border-red-400 text-gray-400'}`}
                                                    >
                                                        <AlertTriangle size={18}/>
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="font-bold text-gray-900">{product?.name}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">{product?.category || 'Vegetable'}</p>
                                            </td>
                                            <td className="px-4 py-4 text-right font-black text-gray-700 text-lg">{item.quantityKg}kg</td>
                                            <td className="px-4 py-4 text-right">
                                                {isReporting ? (
                                                    <div className="relative inline-block text-left animate-in slide-in-from-right-4">
                                                        <div className="relative flex items-center">
                                                            <select 
                                                                autoFocus
                                                                onChange={(e) => handleReportIssue(item.productId, e.target.value)}
                                                                onBlur={() => {
                                                                    setTimeout(() => setReportingItemId(null), 250);
                                                                }}
                                                                className="appearance-none text-sm px-4 py-2.5 border-2 border-red-200 rounded-xl bg-white font-bold outline-none ring-2 ring-red-50 text-black shadow-lg pr-10 min-w-[200px]"
                                                            >
                                                                <option className="text-black">Select issue type</option>
                                                                <option className="text-black" value="No Available Stock">No Available Stock</option>
                                                                <option className="text-black" value="Product Damaged">Product Damaged</option>
                                                                <option className="text-black" value="Product Expired">Product Expired</option>
                                                                <option className="text-black" value="Other Issue">Other Issue</option>
                                                            </select>
                                                            <ChevronDown className="absolute right-3 text-gray-400 pointer-events-none" size={16}/>
                                                        </div>
                                                    </div>
                                                ) : issue ? (
                                                    <span className="text-red-500 font-black text-xs uppercase tracking-tight bg-red-50 px-3 py-1 rounded-full border border-red-100">{issue}</span>
                                                ) : null}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-[#EFF6FF] rounded-xl p-5 border border-[#DBEAFE]">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-bold text-[#1E40AF]">Packing Progress</h4>
                            <span className="text-xs font-bold text-[#1E40AF]">{packedCount} / {totalItems} items packed</span>
                        </div>
                        <div className="w-full bg-white h-2.5 rounded-full overflow-hidden border border-[#BFDBFE]">
                            <div className="h-full bg-blue-500 transition-all duration-700 ease-out shadow-sm" style={{width: `${progress}%`}}></div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-base font-bold text-gray-900">Packing Verification Photo</h3>
                        <div 
                            onClick={() => setProofPhoto('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600')}
                            className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden h-52 ${proofPhoto ? 'border-emerald-300 bg-emerald-50/30' : 'border-gray-200 hover:bg-gray-50 hover:border-blue-400'}`}
                        >
                            {proofPhoto ? (
                                <img src={proofPhoto} className="absolute inset-0 w-full h-full object-cover" />
                            ) : (
                                <>
                                    <div className="bg-gray-100 p-3 rounded-full mb-3 text-gray-400"><Camera size={24}/></div>
                                    <button className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-blue-700 transition-colors flex items-center gap-2">
                                        <UploadCloud size={18}/> Upload Packing Photo
                                    </button>
                                    <p className="text-xs text-gray-500 mt-4 font-medium">Take a photo of all packed items ready for truck loading</p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Assign Truck Driver</label>
                        <div className="relative">
                            <Truck size={18} className="absolute left-4 top-3.5 text-gray-400 pointer-events-none"/>
                            <select 
                                value={selectedDriver}
                                onChange={e => setSelectedDriver(e.target.value)}
                                className="w-full pl-11 pr-10 py-3.5 border border-gray-200 rounded-xl font-bold bg-white text-sm text-black outline-none focus:ring-2 focus:ring-blue-500 appearance-none shadow-sm"
                            >
                                <option value="" className="text-black">Select a driver for this delivery</option>
                                {drivers.map(d => <option key={d.id} value={d.id} className="text-black">{d.name} ({d.vehicleType})</option>)}
                                <option value="ext" className="text-black">3rd Party Logistics (Little Logistics)</option>
                            </select>
                            <ChevronDown size={18} className="absolute right-4 top-3.5 text-gray-400 pointer-events-none"/>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-8 py-3 bg-white border border-gray-300 rounded-xl text-gray-600 font-bold hover:bg-gray-100 transition-colors">Close</button>
                    <button 
                        onClick={() => onComplete(selectedPacker, selectedDriver, proofPhoto || '')}
                        disabled={packedCount + Object.keys(itemIssues).length < totalItems || !selectedDriver || !selectedPacker}
                        className="px-10 py-3 bg-[#0F172A] text-white rounded-xl font-bold shadow-lg hover:bg-black disabled:opacity-50 transition-all uppercase tracking-widest text-xs"
                    >
                        Packing completed
                    </button>
                </div>
            </div>
        </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('Order Management');
  const [orderSubTab, setOrderSubTab] = useState('Pending Acceptance');
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [priceRequests, setPriceRequests] = useState<SupplierPriceRequest[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [packers, setPackers] = useState<Packer[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // UI / Modal States
  const [packingOrder, setPackingOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const loadData = () => {
    const allOrders = mockService.getOrders(user.id).filter(o => o.sellerId === user.id);
    setOrders(allOrders);
    setInventory(mockService.getInventory(user.id));
    setProducts(mockService.getAllProducts());
    setPriceRequests(mockService.getSupplierPriceRequests(user.id));
    setDrivers(mockService.getDrivers(user.id));
    setPackers(mockService.getPackers(user.id));
    setCustomers(mockService.getCustomers());
  };

  const handleAcceptOrder = (order: Order) => {
    mockService.acceptOrderV2(order.id);
    loadData();
    alert("Order Accepted! Platform Zero Admin and the customer have been notified.");
  };

  const handleRejectOrder = (order: Order) => {
      if(confirm(`Are you sure you want to reject this order?`)) {
          alert("Order Rejected.");
      }
  };

  const handleCompletePacking = (packerId: string, driverId: string, photo: string) => {
    if (!packingOrder) return;
    const packerName = packers.find(p => p.id === packerId)?.name || 'Internal Team';
    const driverName = drivers.find(d => d.id === driverId)?.name || 'Logistics Partner';
    
    mockService.packOrder(packingOrder.id, packerName, driverId, driverName);
    setPackingOrder(null);
    loadData();
    alert(`Order #${packingOrder.id.split('-')[1]} is fully packed and ready!`);
  };

  const pendingAcceptance = orders.filter(o => o.status === 'Pending');
  const acceptedOrders = orders.filter(o => o.status === 'Confirmed' || o.status === 'Ready for Delivery' || o.status === 'Shipped');
  const fulfilledOrders = orders.filter(o => o.status === 'Delivered');
  const expiredOrders = orders.filter(o => o.status === 'Cancelled');

  const displayedOrders = 
    orderSubTab === 'Pending Acceptance' ? pendingAcceptance :
    orderSubTab === 'Accepted' ? acceptedOrders :
    orderSubTab === 'Fulfilled' ? fulfilledOrders : expiredOrders;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="mb-6 flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">Partner Operations</h1>
            <p className="text-gray-500 mt-1 text-lg">Manage orders, price requests, and network.</p>
        </div>
        <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 rounded-xl text-blue-600 font-bold text-sm hover:bg-blue-50 shadow-sm transition-all">
                <Truck size={18}/> Driver Logistics
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 border border-emerald-500 rounded-xl text-white font-bold text-sm hover:bg-emerald-700 shadow-md transition-all">
                <ScanLine size={18}/> Rapid Capture
            </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
            { name: 'Order Management', icon: LayoutDashboard },
            { name: 'Sell', icon: Package },
            { name: 'Price Requests', icon: Tags, badge: priceRequests.filter(r => r.status === 'PENDING').length },
            { name: 'Customers', icon: Users },
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
            {tab.badge ? <span className="bg-red-50 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">{tab.badge}</span> : null}
          </button>
        ))}
      </div>

      {activeTab === 'Order Management' && (
        <div className="space-y-8">
          
          {/* URGENT RED BANNER */}
          {pendingAcceptance.length > 0 && (
            <div className="bg-[#FEF2F2] border border-[#FEE2E2] rounded-[2rem] p-8 space-y-6 animate-in slide-in-from-top-4 duration-500 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="bg-white p-2.5 rounded-full shadow-md text-red-600 border border-red-100">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#991B1B]">Urgent: Orders Awaiting Acceptance</h2>
                  <p className="text-[#B91C1C] font-semibold mt-1">You have {pendingAcceptance.length} orders that need to be accepted within 60 minutes</p>
                </div>
              </div>

              <div className="space-y-3">
                {pendingAcceptance.map(order => {
                  const customer = mockService.getCustomers().find(c => c.id === order.buyerId);
                  return (
                    <div key={order.id} className="bg-white rounded-2xl p-5 border border-red-100 shadow-sm flex justify-between items-center hover:shadow-md transition-all group cursor-pointer" onClick={() => setPackingOrder(order)}>
                      <div>
                        <h4 className="text-lg font-black text-gray-900 tracking-tight">{customer?.businessName || 'Fresh Market Co'}</h4>
                        <p className="text-xs text-red-600 font-bold mt-0.5 uppercase tracking-wider">Order #{order.id.split('-')[1] || '1001'} • ${order.totalAmount.toFixed(2)}</p>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <div className="flex items-center gap-2 text-red-600 font-black mb-1">
                          <Clock size={18} className="animate-pulse" />
                          <span>30 min left</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-black uppercase text-red-400 tracking-[0.2em]">URGENT • {order.items.length} items</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button 
                onClick={() => setOrderSubTab('Pending Acceptance')}
                className="w-full py-4 bg-[#EF4444] hover:bg-[#DC2626] text-white font-black rounded-2xl shadow-xl shadow-red-100 transition-all uppercase tracking-[0.2em] text-xs"
              >
                View All Pending Orders
              </button>
            </div>
          )}

          {/* MAIN WORKSPACE */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm space-y-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Order Management</h2>
                    <p className="text-gray-600 font-medium mt-1">Manage orders assigned to you by Platform Zero. Accept, fulfill, and track orders.</p>
                </div>
                <div className="flex items-center gap-6 self-end md:self-center">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        Auto-refresh: 30 seconds | <span className="text-emerald-500">Live countdown updates</span>
                    </div>
                    {pendingAcceptance.length > 0 && (
                        <div className="bg-[#FFF7ED] text-[#EA580C] px-5 py-2.5 rounded-full border border-[#FED7AA] flex items-center gap-2 text-xs font-black uppercase tracking-widest shadow-sm animate-pulse">
                            <Bell size={16}/> {pendingAcceptance.length} orders need acceptance
                        </div>
                    )}
                </div>
              </div>

              {/* Sub-Tabs */}
              <div className="flex flex-wrap bg-gray-100/50 p-1.5 rounded-2xl w-fit border border-gray-100">
                  {['Pending Acceptance', 'Accepted', 'Fulfilled', 'Expired'].map(t => (
                      <button 
                        key={t}
                        onClick={() => setOrderSubTab(t)}
                        className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3 ${orderSubTab === t ? 'bg-white text-gray-900 shadow-md border border-gray-100 scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                          {t}
                          {t === 'Pending Acceptance' && pendingAcceptance.length > 0 && <span className="bg-orange-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">{pendingAcceptance.length}</span>}
                          {t === 'Accepted' && acceptedOrders.length > 0 && <span className="bg-blue-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{acceptedOrders.length}</span>}
                      </button>
                  ))}
              </div>

              {/* YELLOW CARDS LIST */}
              <div className="space-y-8">
                {displayedOrders.length === 0 ? (
                    <div className="py-24 text-center flex flex-col items-center">
                        <div className="bg-gray-50 p-6 rounded-full text-gray-200 mb-6"><CheckCircle size={80}/></div>
                        <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-xs">No orders in this category.</p>
                    </div>
                ) : displayedOrders.map(order => {
                    const customer = mockService.getCustomers().find(c => c.id === order.buyerId);
                    const isAccepted = order.status !== 'Pending';

                    return (
                        <div 
                            key={order.id} 
                            onClick={() => setPackingOrder(order)}
                            className="bg-[#FFFDF0] rounded-[2rem] border-2 border-[#FDE68A] p-10 shadow-sm hover:shadow-xl transition-all relative group cursor-pointer animate-in fade-in zoom-in-95 duration-300"
                        >
                            <div className="flex flex-col lg:flex-row justify-between gap-12">
                                <div className="flex-1 space-y-10">
                                    <div className="flex items-center gap-5">
                                        <h3 className="text-3xl font-black text-[#1E293B] tracking-tight">{customer?.businessName || 'Healthy Eats Restaurant'}</h3>
                                        {order.priority && (
                                            <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${order.priority === 'URGENT' ? 'bg-[#EF4444] text-white' : 'bg-[#EA580C] text-white'}`}>
                                                {order.priority}
                                            </span>
                                        )}
                                    </div>
                                    
                                    <p className="text-[#B45309] font-black text-xs uppercase tracking-[0.2em] opacity-60">Order #{order.id.split('-')[1] || '1002'}</p>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-12 border-t border-[#FEF3C7] pt-8">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Total Amount</p>
                                            <p className="text-3xl font-black text-[#1E293B]">${order.totalAmount.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Items</p>
                                            <p className="text-3xl font-black text-[#1E293B]">{order.items.length} products</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Delivery Date</p>
                                            <p className="text-3xl font-black text-[#1E293B]">Dec 18, 2025</p>
                                        </div>
                                    </div>

                                    {order.customerNotes && (
                                        <div className="bg-[#EFF6FF] border border-[#BFDBFE] p-8 rounded-2xl shadow-inner-sm">
                                            <p className="text-xs font-black text-[#1D4ED8] uppercase tracking-[0.1em] mb-2 flex items-center gap-2"><Info size={14}/> Customer Notes:</p>
                                            <p className="text-sm text-[#1E40AF] font-medium leading-relaxed italic">"{order.customerNotes}"</p>
                                        </div>
                                    )}
                                </div>

                                <div className="w-full lg:w-64 flex flex-col justify-between items-end border-l border-[#FEF3C7] lg:pl-10">
                                    <div className="text-right">
                                        <p className="text-5xl font-black text-[#B45309] tracking-tighter mb-1">30 min</p>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">Time remaining</p>
                                    </div>

                                    <div className="w-full space-y-4">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setPackingOrder(order); }}
                                            className="w-full py-3.5 bg-white border-2 border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:bg-gray-50 transition-all shadow-sm"
                                        >
                                            View Full Details
                                        </button>
                                        <div className="flex gap-3">
                                            {!isAccepted && (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleRejectOrder(order); }}
                                                    className="flex-1 py-4 bg-white border-2 border-red-100 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-50 transition-all shadow-sm"
                                                >
                                                    Reject
                                                </button>
                                            )}
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); isAccepted ? setPackingOrder(order) : handleAcceptOrder(order); }}
                                                className={`flex-[2] py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all text-white ${isAccepted ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#22C55E] hover:bg-[#16A34A]'}`}
                                            >
                                                {isAccepted ? 'Pack Order' : 'Accept Order'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
              </div>
          </div>
        </div>
      )}

      {/* SELL TAB - RAPID AI CAPTURE & MATCHING */}
      {activeTab === 'Sell' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <AiOpportunityMatcher user={user} />
        </div>
      )}

      {/* PRICE REQUESTS TAB */}
      {activeTab === 'Price Requests' && (
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Price Requests</h2>
                    <p className="text-gray-500 font-medium">Respond to bulk pricing inquiries from Platform Zero Admin.</p>
                </div>
            </div>
            {priceRequests.length === 0 ? (
                <div className="py-32 text-center text-gray-400">
                    <GitPullRequest size={48} className="mx-auto mb-4 opacity-20"/>
                    <p className="font-bold uppercase tracking-widest text-xs">No active price requests.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {priceRequests.map(req => (
                        <div key={req.id} className="p-6 border border-gray-200 rounded-2xl hover:border-blue-400 transition-all group bg-gray-50/30">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-bold text-gray-900 text-lg">{req.customerContext}</h3>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${req.status === 'WON' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{req.status}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span className="flex items-center gap-1"><MapPin size={12}/> {req.customerLocation}</span>
                                        <span className="flex items-center gap-1"><Clock size={12}/> Received: {new Date(req.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <button className="bg-[#0F172A] text-white px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors">
                                    Review Items
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      )}

      {/* CUSTOMERS TAB */}
      {activeTab === 'Customers' && (
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Connected Network</h2>
                    <p className="text-gray-500 font-medium">Manage your relationships and set custom pricing tiers.</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customers.filter(c => c.connectedSupplierId === user.id).map(customer => (
                    <div key={customer.id} className="p-6 border border-gray-200 rounded-3xl hover:shadow-lg transition-all bg-white relative group overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Users size={64} className="text-indigo-600"/>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 font-black text-xl">
                            {customer.businessName.charAt(0)}
                        </div>
                        <h3 className="font-black text-gray-900 text-xl tracking-tight mb-1">{customer.businessName}</h3>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-4">{customer.category}</p>
                        
                        <div className="space-y-2 mb-6">
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <MapPin size={14} className="text-gray-400"/> {customer.location || 'Melbourne, VIC'}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <DollarSign size={14} className="text-emerald-500"/> Tier: Premium Wholesale
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-colors">Details</button>
                            <button className="flex-1 py-2.5 bg-[#0F172A] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors">Set Price</button>
                        </div>
                    </div>
                ))}
            </div>
          </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === 'Settings' && (
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm animate-in fade-in duration-500">
            <SettingsComponent user={user} onRefreshUser={loadData} />
          </div>
      )}

      {/* PACKING STATION MODAL */}
      {packingOrder && (
          <PackingListModal 
              order={packingOrder} 
              onClose={() => setPackingOrder(null)} 
              onComplete={handleCompletePacking}
              drivers={drivers}
              packers={packers}
          />
      )}
    </div>
  );
};
