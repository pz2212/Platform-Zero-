
import React, { useState, useEffect, useRef } from 'react';
import { User, Order, InventoryItem, Product, Driver, Packer, Customer, SupplierPriceRequest, SupplierPriceRequestItem } from '../types';
import { mockService } from '../services/mockDataService';
import { AiOpportunityMatcher } from './AiOpportunityMatcher';
import { Settings as SettingsComponent } from './Settings';
import { 
  Package, Truck, MapPin, AlertTriangle, LayoutDashboard, 
  Users, Clock, CheckCircle, X, UploadCloud, 
  // Added FileText to the imports from lucide-react
  DollarSign, Camera, Check, ChevronDown, Info, Search, Bell, Settings, Lock, Calculator, TrendingUp, Send, Percent, Loader2, ChevronRight, LayoutGrid, ShoppingBag, FileText
} from 'lucide-react';

interface DashboardProps {
  user: User;
}

/* --- PRICE REQUESTS VIEW COMPONENTS --- */
const WinProbability = ({ target, offered }: { target: number, offered: number }) => {
    if (offered <= target) return { percent: 95, color: 'text-emerald-500', label: 'Very High' };
    const diff = ((offered - target) / target) * 100;
    if (diff < 5) return { percent: 75, color: 'text-emerald-400', label: 'High' };
    if (diff < 15) return { percent: 45, color: 'text-orange-500', label: 'Medium' };
    if (diff < 25) return { percent: 20, color: 'text-red-400', label: 'Low' };
    return { percent: 5, color: 'text-red-600', label: 'Unlikely' };
};

const PriceRequestResponse: React.FC<{ request: SupplierPriceRequest, onUpdate: () => void }> = ({ request, onUpdate }) => {
    const [localItems, setLocalItems] = useState<SupplierPriceRequestItem[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setLocalItems(request.items.map(item => ({
            ...item,
            isMatchingTarget: item.isMatchingTarget ?? true,
            offeredPrice: item.offeredPrice ?? item.targetPrice
        })));
    }, [request]);

    const handleToggleMatch = (idx: number, matches: boolean) => {
        const newItems = [...localItems];
        newItems[idx].isMatchingTarget = matches;
        if (matches) {
            newItems[idx].offeredPrice = newItems[idx].targetPrice;
        }
        setLocalItems(newItems);
    };

    const handlePriceChange = (idx: number, val: string) => {
        const newItems = [...localItems];
        newItems[idx].offeredPrice = parseFloat(val) || 0;
        setLocalItems(newItems);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const updatedReq: SupplierPriceRequest = {
            ...request,
            status: 'SUBMITTED',
            items: localItems
        };
        mockService.updateSupplierPriceRequest(request.id, updatedReq);
        setTimeout(() => {
            setIsSubmitting(false);
            onUpdate();
            alert("Pricing submitted to Platform Zero Admin!");
        }, 800);
    };

    return (
        <div className="bg-white rounded-[2rem] border border-gray-100 p-6 md:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase flex items-center gap-2">
                        <Calculator className="text-indigo-600" size={20}/> LEAD ID: #{request.id.split('-').pop()}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><MapPin size={12}/> {request.customerLocation}</span>
                        <span className="flex items-center gap-1.5"><Package size={12}/> {request.items.length} Products</span>
                    </div>
                </div>
                <div className="bg-indigo-50 px-4 py-2 rounded-xl text-indigo-700 font-black text-[10px] uppercase tracking-widest border border-indigo-100">
                    Awaiting Quote
                </div>
            </div>

            <div className="overflow-x-auto mb-8">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                        <tr>
                            <th className="px-4 py-4">Product Name</th>
                            <th className="px-4 py-4 text-center">Match Target?</th>
                            <th className="px-4 py-4">PZ Target ($)</th>
                            <th className="px-4 py-4">Your Offer ($)</th>
                            <th className="px-4 py-4 text-right">Probability</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {localItems.map((item, idx) => {
                            const prob = WinProbability({ target: item.targetPrice, offered: item.offeredPrice || 0 });
                            return (
                                <tr key={idx}>
                                    <td className="px-4 py-5">
                                        <p className="font-bold text-gray-900">{item.productName}</p>
                                    </td>
                                    <td className="px-4 py-5">
                                        <div className="flex justify-center gap-1 bg-gray-100 p-1 rounded-xl w-fit mx-auto">
                                            <button 
                                                onClick={() => handleToggleMatch(idx, true)}
                                                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${item.isMatchingTarget ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                            >
                                                Yes
                                            </button>
                                            <button 
                                                onClick={() => handleToggleMatch(idx, false)}
                                                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${!item.isMatchingTarget ? 'bg-red-500 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                            >
                                                No
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-4 py-5 font-black text-indigo-600 text-lg">
                                        ${item.targetPrice.toFixed(2)}
                                    </td>
                                    <td className="px-4 py-5">
                                        <div className="relative w-28">
                                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">$</span>
                                            <input 
                                                type="number" 
                                                step="0.01"
                                                disabled={item.isMatchingTarget}
                                                className={`w-full pl-5 pr-2 py-2 rounded-lg text-sm font-black outline-none border ${item.isMatchingTarget ? 'bg-gray-50 border-gray-100 text-gray-300' : 'bg-white border-red-100 text-gray-900 focus:border-red-500'}`}
                                                value={item.offeredPrice}
                                                onChange={e => handlePriceChange(idx, e.target.value)}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-5 text-right">
                                        <span className={`text-[10px] font-black ${prob.color} uppercase tracking-widest`}>{prob.label}</span>
                                        <div className="w-16 h-1 bg-gray-100 rounded-full mt-1 ml-auto overflow-hidden">
                                            <div className={`h-full ${prob.color.replace('text-', 'bg-')}`} style={{width: `${prob.percent}%`}}></div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-50">
                <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-10 py-4 bg-[#0F172A] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin"/> : <><Send size={16}/> Submit Pricing Proposal</>}
                </button>
            </div>
        </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('Order Management');
  const [orderSubTab, setOrderSubTab] = useState('PENDING');
  const [orders, setOrders] = useState<Order[]>([]);
  const [priceRequests, setPriceRequests] = useState<SupplierPriceRequest[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const loadData = () => {
    const allOrders = mockService.getOrders(user.id).filter(o => o.sellerId === user.id);
    setOrders(allOrders);
    setPriceRequests(mockService.getSupplierPriceRequests(user.id).filter(r => r.status === 'PENDING'));
    setCustomers(mockService.getCustomers());
  };

  const handleAcceptOrder = (order: Order) => {
    mockService.acceptOrderV2(order.id);
    loadData();
    alert("Order Accepted!");
  };

  const pendingAcceptance = orders.filter(o => o.status === 'Pending');
  const acceptedOrders = orders.filter(o => o.status === 'Confirmed' || o.status === 'Ready for Delivery' || o.status === 'Shipped');
  const fulfilledOrders = orders.filter(o => o.status === 'Delivered');

  const displayedOrders = 
    orderSubTab === 'PENDING' ? pendingAcceptance :
    orderSubTab === 'ACCEPTED' ? acceptedOrders : fulfilledOrders;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* HEADER SECTION */}
      <div className="mb-2">
        <h1 className="text-4xl font-black text-[#0F172A] tracking-tight">Partner Operations</h1>
        <p className="text-gray-500 mt-1 text-lg font-medium">Manage orders, logistics, and network.</p>
      </div>

      {/* URGENT RED BANNER - MATCHING SCREENSHOT */}
      {pendingAcceptance.length > 0 && (
        <div className="bg-[#FEF2F2] border border-[#FEE2E2] rounded-3xl p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-white p-2.5 rounded-xl shadow-sm text-red-600 border border-red-50">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h2 className="text-sm font-black text-[#991B1B] uppercase tracking-widest">ORDERS AWAITING ACCEPTANCE</h2>
              <p className="text-[#B91C1C] text-xs font-bold mt-0.5">{pendingAcceptance.length} orders need acceptance within 60 minutes</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {pendingAcceptance.slice(0, 2).map(order => {
                const buyer = customers.find(c => c.id === order.buyerId);
                return (
                    <div key={order.id} className="bg-white rounded-2xl p-5 border border-red-100 shadow-sm flex justify-between items-center hover:border-red-300 transition-all cursor-pointer">
                      <div>
                        <h4 className="text-base font-black text-gray-900">{buyer?.businessName || 'Marketplace Client'}</h4>
                        <p className="text-[11px] text-red-600 font-bold uppercase mt-0.5">#{order.id.split('-')[1] || order.id} • ${order.totalAmount.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2 text-red-600 font-black text-xs uppercase tracking-widest">
                        <Clock size={18} className="animate-pulse" />
                        <span>30m left</span>
                      </div>
                    </div>
                );
            })}
          </div>
          
          <button 
            onClick={() => { setActiveTab('Order Management'); setOrderSubTab('PENDING'); }} 
            className="w-full py-4 bg-[#EF4444] hover:bg-[#DC2626] text-white font-black rounded-2xl shadow-lg transition-all uppercase tracking-[0.2em] text-xs"
          >
            VIEW ALL PENDING
          </button>
        </div>
      )}

      {/* MAIN NAVIGATION TABS - MATCHING SCREENSHOT */}
      <div className="flex flex-wrap gap-2 pt-2">
        {[
            { id: 'Order Management', label: 'Order Management', icon: LayoutGrid, badge: pendingAcceptance.length },
            { id: 'Price Requests', label: 'Price Requests', icon: FileText, badge: priceRequests.length },
            { id: 'Sell', label: 'Sell', icon: ShoppingBag },
            { id: 'Customers', label: 'Customers', icon: Users },
            { id: 'Settings', label: 'Settings', icon: Settings }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-6 py-4 rounded-xl text-sm font-black transition-all whitespace-nowrap border-2 ${
                activeTab === tab.id 
                ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-xl' 
                : 'text-[#64748B] bg-white border-transparent hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <tab.icon size={20} />
            {tab.label}
            {tab.badge !== undefined && (
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${activeTab === tab.id ? 'bg-emerald-50 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
                    {tab.badge}
                </span>
            )}
          </button>
        ))}
      </div>

      {/* CONTENT AREA */}
      <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-sm min-h-[600px]">
        {activeTab === 'Order Management' && (
          <div className="space-y-8">
            <div className="border-b border-gray-50 pb-8">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Order Queue</h2>
              <p className="text-gray-400 font-bold uppercase text-[11px] tracking-[0.2em] mt-2">Assigned by Platform Zero Marketplace.</p>
            </div>

            <div className="bg-gray-100/50 p-1.5 rounded-2xl inline-flex gap-2">
              {['PENDING', 'ACCEPTED', 'FULFILLED'].map(t => (
                <button 
                  key={t} onClick={() => setOrderSubTab(t)}
                  className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all ${orderSubTab === t ? 'bg-white text-gray-900 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="space-y-6 pt-4">
              {displayedOrders.length === 0 ? (
                <div className="py-32 text-center flex flex-col items-center">
                  <div className="bg-gray-50 p-6 rounded-full text-gray-200 mb-6"><CheckCircle size={60}/></div>
                  <p className="text-gray-300 font-black uppercase tracking-[0.3em] text-xs">No active orders in this queue</p>
                </div>
              ) : displayedOrders.map(order => {
                const buyer = customers.find(c => c.id === order.buyerId);
                return (
                  <div key={order.id} className="bg-[#FFFDF6] rounded-[2.5rem] border border-[#FDE68A] p-8 shadow-sm hover:border-[#FBBF24] transition-all group animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col md:flex-row items-center gap-10">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-black text-gray-900 tracking-tight">{buyer?.businessName || 'Healthy Eats Restaurant'}</h3>
                          <span className="bg-[#EA580C] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">HIGH</span>
                        </div>
                        <p className="text-[11px] font-black text-[#B45309]/60 uppercase tracking-[0.2em]">ORDER #{order.id.split('-')[1] || '1001'}</p>
                        
                        <div className="flex gap-12 mt-10">
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">AMOUNT</p>
                            <p className="text-2xl font-black text-gray-900 tracking-tight">${order.totalAmount.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">QTY</p>
                            <p className="text-2xl font-black text-gray-900 tracking-tight">{order.items.length} skus</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-10 md:border-l md:border-[#FEF3C7] md:pl-10">
                        <div className="text-center">
                          <p className="text-5xl font-black text-[#B45309] tracking-tighter leading-none mb-1">30 min</p>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">TIME WINDOW</p>
                        </div>
                        <div className="flex gap-3">
                          <button className="p-4 bg-white border border-gray-200 rounded-2xl text-gray-400 hover:text-gray-900 transition-all active:scale-95 shadow-sm"><Search size={22}/></button>
                          <button 
                            onClick={() => handleAcceptOrder(order)}
                            className="px-10 py-5 bg-[#22C55E] hover:bg-[#16A34A] text-white font-black rounded-[1.5rem] uppercase tracking-[0.2em] text-xs shadow-xl shadow-emerald-100 transition-all active:scale-95"
                          >
                            ACCEPT ORDER
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'Price Requests' && (
          <div className="space-y-8">
            <div className="border-b border-gray-50 pb-8">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Lead Proposals</h2>
              <p className="text-gray-500 font-medium">Review product targets sent by PZ Admin and submit your best wholesale rates.</p>
            </div>
            
            {priceRequests.length === 0 ? (
                <div className="py-40 text-center">
                    <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 shadow-inner-sm"><CheckCircle size={40}/></div>
                    <p className="text-lg font-black text-gray-900 tracking-tight uppercase">All caught up!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8">
                    {priceRequests.map(req => (
                        <PriceRequestResponse key={req.id} request={req} onUpdate={loadData} />
                    ))}
                </div>
            )}
          </div>
        )}

        {activeTab === 'Sell' && <AiOpportunityMatcher user={user} />}
        
        {activeTab === 'Customers' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Connected Network</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {customers.filter(c => c.connectedSupplierId === user.id).map(customer => (
                    <div key={customer.id} className="p-8 border border-gray-100 rounded-[2.5rem] hover:shadow-xl hover:border-indigo-100 transition-all bg-white relative group flex flex-col justify-between h-64">
                        <div>
                          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 font-black text-xl shadow-sm">{customer.businessName.charAt(0)}</div>
                          <h3 className="font-black text-gray-900 text-xl tracking-tight leading-none mb-1">{customer.businessName}</h3>
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{customer.category}</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="flex-1 py-3 bg-gray-50 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-colors">Details</button>
                          <button className="flex-1 py-3 bg-[#0F172A] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors">Set Price</button>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'Settings' && <SettingsComponent user={user} onRefreshUser={loadData} />}
      </div>
    </div>
  );
};
