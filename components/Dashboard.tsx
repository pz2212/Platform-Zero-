import React, { useState, useEffect, useRef } from 'react';
import { User, Order, InventoryItem, Product, Driver, Packer, OrderItem, Customer, SupplierPriceRequest, SupplierPriceRequestItem } from '../types';
import { mockService } from '../services/mockDataService';
import { AiOpportunityMatcher } from './AiOpportunityMatcher';
import { Settings as SettingsComponent } from './Settings';
import { 
  Package, Truck, MapPin, AlertTriangle, LayoutDashboard, 
  Users, Clock, CheckCircle, X, UploadCloud, 
  /* Added ChevronRight to fix 'Cannot find name ChevronRight' */
  DollarSign, Camera, Check, ChevronDown, Info, Search, Bell, Settings, Lock, Calculator, TrendingUp, Send, Percent, Loader2, ChevronRight
} from 'lucide-react';

interface DashboardProps {
  user: User;
}

/* HIGH FIDELITY PACKING LIST MODAL */
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
        
        const product = mockService.getProduct(productId);
        const productName = product?.name || 'Unknown Item';
        
        mockService.addAppNotification('u1', 'Packing Issue Reported', `URGENT: Order #${order.id} - Issue reported for ${productName}: ${issue}`, 'SYSTEM', '/');
        mockService.addAppNotification(order.buyerId, 'Order Update', `Status update for Order #${order.id}: A packing issue has been reported for ${productName} (${issue}). Platform Zero is resolving this for you.`, 'ORDER', '/orders');
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
                        className="px-10 py-3 bg-[#0F172A] text-white rounded-xl font-black uppercase tracking-widest text-xs"
                    >
                        Packing completed
                    </button>
                </div>
            </div>
        </div>
    );
};

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
  const [orderSubTab, setOrderSubTab] = useState('Pending Acceptance');
  const [orders, setOrders] = useState<Order[]>([]);
  const [priceRequests, setPriceRequests] = useState<SupplierPriceRequest[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
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
    setPriceRequests(mockService.getSupplierPriceRequests(user.id).filter(r => r.status === 'PENDING'));
    setInventory(mockService.getInventory(user.id));
    setProducts(mockService.getAllProducts());
    setDrivers(mockService.getDrivers(user.id));
    setPackers(mockService.getPackers(user.id));
    setCustomers(mockService.getCustomers());
  };

  const isProfileComplete = user.businessProfile?.isComplete || false;

  const handleAcceptOrder = (order: Order) => {
    if (!isProfileComplete) {
        alert("Action Required: Please go to Settings and complete your onboarding documents before you can accept orders.");
        return;
    }
    mockService.acceptOrderV2(order.id);
    loadData();
    alert("Order Accepted!");
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
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight">Partner Operations</h1>
            <p className="text-gray-500 mt-1 text-base md:text-lg">Manage orders, logistics, and network.</p>
        </div>
      </div>

      {/* ALERT BANNERS SECTION */}
      <div className="space-y-4">
          {!isProfileComplete && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 animate-in slide-in-from-top-4">
                  <div className="bg-white p-3 rounded-xl text-amber-600 shadow-sm border border-amber-100 hidden md:block"><AlertTriangle size={24} /></div>
                  <div className="flex-1 text-center md:text-left"><h2 className="text-sm font-black text-amber-900 uppercase tracking-tight">Onboarding Documents Pending</h2><p className="text-amber-800 text-xs font-medium mt-0.5">Complete your business profile in settings to unlock full marketplace fulfillment.</p></div>
                  <button onClick={() => setActiveTab('Settings')} className="w-full md:w-auto px-6 py-2 bg-amber-600 text-white rounded-lg font-black uppercase tracking-widest text-[10px] shadow-md hover:bg-amber-700 transition-all">Complete Setup</button>
              </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* URGENT RED BANNER - ORDERS */}
              {pendingAcceptance.length > 0 && (
                <div className="bg-[#FEF2F2] border border-[#FEE2E2] rounded-2xl p-6 space-y-4 shadow-sm h-full">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-1.5 rounded-lg shadow-sm text-red-600 border border-red-100"><AlertTriangle size={20} /></div>
                    <div><h2 className="text-sm font-black text-[#991B1B] uppercase tracking-tight">Orders Awaiting Acceptance</h2><p className="text-[#B91C1C] text-xs font-semibold">{pendingAcceptance.length} orders need acceptance within 60 minutes</p></div>
                  </div>
                  <div className="space-y-2">
                    {pendingAcceptance.map(order => (
                        <div key={order.id} className="bg-white rounded-xl p-3 border border-red-100 shadow-sm flex justify-between items-center hover:border-red-300 transition-all cursor-pointer" onClick={() => { setActiveTab('Order Management'); setOrderSubTab('Pending Acceptance'); }}>
                          <div className="flex-1 min-w-0"><h4 className="text-sm font-black text-gray-900 truncate">{mockService.getCustomers().find(c => c.id === order.buyerId)?.businessName || 'Marketplace Client'}</h4><p className="text-[10px] text-red-600 font-bold uppercase">#{order.id.split('-')[1]} • ${order.totalAmount.toFixed(2)}</p></div>
                          <div className="text-right flex flex-col items-end ml-4"><div className="flex items-center gap-1.5 text-red-600 font-black text-xs"><Clock size={14} className="animate-pulse" /><span>30m left</span></div></div>
                        </div>
                    ))}
                  </div>
                  <button onClick={() => { setActiveTab('Order Management'); setOrderSubTab('Pending Acceptance'); }} className="w-full py-2.5 bg-[#EF4444] hover:bg-[#DC2626] text-white font-black rounded-xl shadow-md transition-all uppercase tracking-widest text-[10px]">View All Pending</button>
                </div>
              )}

              {/* HIGH PRIORITY INDIGO BANNER - PRICE REQUESTS (MATCHING YOUR SCREENSHOT) */}
              {priceRequests.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4 shadow-sm h-full">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                     <div className="flex items-center gap-4">
                        <div className="bg-[#EFF6FF] p-3 rounded-2xl text-indigo-600 shadow-sm"><Calculator size={24}/></div>
                        <div><h2 className="text-base font-black text-slate-900 tracking-tight">New Price Request</h2><p className="text-slate-500 text-xs font-medium">PZ Admin has requested custom pricing for a new lead.</p></div>
                     </div>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div className="space-y-2">
                    {priceRequests.slice(0, 2).map(req => (
                        <div key={req.id} onClick={() => setActiveTab('Price Requests')} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-indigo-50 transition-all group cursor-pointer border border-transparent hover:border-indigo-100">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center font-black text-xs text-indigo-600 shadow-sm">{req.customerContext.charAt(0)}</div>
                              <div><p className="text-sm font-black text-gray-900">{req.customerContext}</p><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{req.items.length} Products • {req.customerLocation}</p></div>
                           </div>
                           <ChevronRight size={18} className="text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all"/>
                        </div>
                    ))}
                  </div>
                  <button onClick={() => setActiveTab('Price Requests')} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-md transition-all uppercase tracking-widest text-[10px]">Open Lead Portal</button>
                </div>
              )}
          </div>
      </div>

      {/* MAIN NAVIGATION BAR */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar sticky top-0 md:static bg-gray-50 z-20 py-2">
        {[
            { name: 'Order Management', icon: LayoutDashboard, badge: pendingAcceptance.length },
            { name: 'Price Requests', icon: Calculator, badge: priceRequests.length },
            { name: 'Sell', icon: Package },
            { name: 'Customers', icon: Users },
            { name: 'Settings', icon: Settings }
        ].map((tab) => (
          <button 
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.name 
                ? 'bg-[#0F172A] text-white shadow-lg' 
                : 'text-[#64748B] bg-white border border-gray-100 hover:bg-gray-100'
            }`}
          >
            <tab.icon size={16} />
            {tab.name}
            {tab.badge && tab.badge > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === tab.name ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white'} animate-pulse`}>
                    {tab.badge}
                </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'Order Management' && (
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-50 pb-6">
                <div><h2 className="text-2xl font-black text-gray-900 tracking-tight">Order Queue</h2><p className="text-gray-500 font-medium text-sm">Assigned by Platform Zero Marketplace.</p></div>
              </div>
              <div className="flex gap-1 bg-gray-100/50 p-1 rounded-xl w-fit">
                  {['Pending Acceptance', 'Accepted', 'Fulfilled'].map(t => (
                      <button 
                        key={t} onClick={() => setOrderSubTab(t)}
                        className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${orderSubTab === t ? 'bg-white text-gray-900 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                          {t.split(' ')[0]}
                      </button>
                  ))}
              </div>
              <div className="space-y-4">
                {displayedOrders.length === 0 ? (
                    <div className="py-20 text-center"><div className="bg-gray-50 p-4 rounded-full text-gray-200 mb-4 inline-block"><CheckCircle size={40}/></div><p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">No orders currently</p></div>
                ) : displayedOrders.map(order => (
                        <div key={order.id} className="bg-[#FFFDF6] rounded-2xl border border-[#FDE68A] p-6 shadow-sm hover:border-[#FBBF24] transition-all relative group animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex flex-col md:flex-row gap-8 items-center">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1"><h3 className="text-lg font-black text-[#1E293B] tracking-tight">{mockService.getCustomers().find(c => c.id === order.buyerId)?.businessName || 'Healthy Eats Restaurant'}</h3>{order.priority && <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${order.priority === 'URGENT' ? 'bg-[#EF4444] text-white' : 'bg-[#EA580C] text-white'}`}>{order.priority}</span>}</div>
                                    <p className="text-[10px] text-[#B45309]/60 font-black uppercase tracking-widest">ORDER #{order.id.split('-')[1] || '1002'}</p>
                                    <div className="mt-4 flex gap-8">
                                        <div><p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Amount</p><p className="text-base font-black text-[#1E293B]">${order.totalAmount.toFixed(2)}</p></div>
                                        <div><p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Qty</p><p className="text-base font-black text-[#1E293B]">{order.items.length} skus</p></div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 border-l border-[#FEF3C7] pl-8">
                                    <div className="text-right mr-4"><p className="text-3xl font-black text-[#B45309] tracking-tighter">30 min</p><p className="text-[8px] text-gray-400 font-black uppercase tracking-widest">Time Window</p></div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setPackingOrder(order)} className="p-3 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-gray-600 transition-all hover:bg-gray-50"><Search size={16}/></button>
                                        <button onClick={() => order.status === 'Pending' ? handleAcceptOrder(order) : setPackingOrder(order)} disabled={order.status === 'Pending' && !isProfileComplete} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md transition-all text-white flex items-center gap-2 ${order.status === 'Pending' && !isProfileComplete ? 'bg-gray-300 cursor-not-allowed' : order.status === 'Pending' ? 'bg-[#22C55E] hover:bg-[#16A34A]' : 'bg-indigo-600 hover:bg-indigo-700'}`}>{order.status === 'Pending' ? 'Accept Order' : 'Start Packing'}</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                ))}
              </div>
          </div>
      )}

      {/* PRICE REQUESTS TAB - NEW FEATURE */}
      {activeTab === 'Price Requests' && (
          <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex items-center justify-between">
                  <div>
                      <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">New Lead Proposals</h2>
                      <p className="text-gray-500 font-medium">Review product targets sent by PZ Admin and submit your best wholesale rates.</p>
                  </div>
              </div>
              
              {priceRequests.length === 0 ? (
                  <div className="bg-white rounded-[2rem] border border-gray-100 p-20 text-center shadow-sm">
                      <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 shadow-inner-sm"><CheckCircle size={40}/></div>
                      <p className="text-lg font-black text-gray-900 tracking-tight uppercase">All caught up!</p>
                      <p className="text-gray-500 mt-1 font-medium">New price requests from Admin will appear here when available.</p>
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
          <div className="bg-white border border-gray-100 rounded-3xl p-10 shadow-sm animate-in fade-in duration-500">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight mb-8">Connected Network</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {customers.filter(c => c.connectedSupplierId === user.id).map(customer => (
                    <div key={customer.id} className="p-6 border border-gray-200 rounded-3xl hover:shadow-lg transition-all bg-white relative group">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 font-black text-xl">{customer.businessName.charAt(0)}</div>
                        <h3 className="font-black text-gray-900 text-xl tracking-tight mb-1">{customer.businessName}</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">{customer.category}</p>
                        <div className="flex gap-2"><button className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-colors">Details</button><button className="flex-1 py-2.5 bg-[#0F172A] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors">Set Price</button></div>
                    </div>
                ))}
            </div>
          </div>
      )}

      {activeTab === 'Settings' && <SettingsComponent user={user} onRefreshUser={loadData} />}

      {packingOrder && (
          <PackingListModal order={packingOrder} onClose={() => setPackingOrder(null)} onComplete={handleCompletePacking} drivers={drivers} packers={packers} />
      )}
    </div>
  );
};