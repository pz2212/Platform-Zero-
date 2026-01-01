
import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole, SupplierPriceRequest, SupplierPriceRequestItem, Product, InventoryItem } from '../types';
import { mockService } from '../services/mockDataService';
import { 
  Store, MapPin, Tag, MessageSquare, ChevronDown, ChevronUp, ShoppingCart, 
  X, CheckCircle, Bell, DollarSign, Truck, Send, 
  TrendingUp, Loader2, Users, Zap, Star, AlertCircle, Package, ArrowRight,
  // Add ShieldCheck to the imports
  HelpCircle, BrainCircuit, ShieldCheck
} from 'lucide-react';
import { ChatDialog } from './ChatDialog';

interface SupplierMarketProps {
  user: User;
}

const WinProbability = ({ target, offered }: { target: number, offered: number }) => {
    // Basic AI logic: Closer to or below target is higher win probability
    if (offered <= target) return { percent: 98, color: 'text-emerald-500', label: 'OPTIMAL' };
    const diffPercent = ((offered - target) / target) * 100;
    
    if (diffPercent < 5) return { percent: 85, color: 'text-emerald-400', label: 'HIGH' };
    if (diffPercent < 12) return { percent: 60, color: 'text-indigo-400', label: 'MODERATE' };
    if (diffPercent < 20) return { percent: 35, color: 'text-orange-500', label: 'LOW' };
    return { percent: 12, color: 'text-red-500', label: 'CRITICAL' };
};

const PriceRequestResponse: React.FC<{ request: SupplierPriceRequest, onUpdate: () => void }> = ({ request, onUpdate }) => {
    const [localItems, setLocalItems] = useState<SupplierPriceRequestItem[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setLocalItems(request.items.map(item => ({
            ...item,
            // Defaults: Match target if not previously set
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
        
        // Notify Admin
        mockService.addAppNotification(
            'u1', 
            'Price Match Response Received', 
            `${mockService.getAllUsers().find(u => u.id === request.supplierId)?.businessName} has responded to the ${request.customerContext} audit.`, 
            'PRICE_REQUEST'
        );

        setTimeout(() => {
            setIsSubmitting(false);
            onUpdate();
            alert("Pricing response submitted to PZ HQ! Your quote is now being reviewed by admin.");
        }, 800);
    };

    return (
        <div className="bg-white rounded-[2.5rem] border-2 border-indigo-100 p-8 shadow-2xl animate-in zoom-in-95 duration-300 mb-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none transform rotate-12 scale-150">
                <BrainCircuit size={300} />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 relative z-10">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-indigo-100"><TrendingUp size={32}/></div>
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase">New Lead Price Assignment</h3>
                        <p className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.2em] mt-1">Audit Trail Entry • Region Restricted</p>
                    </div>
                </div>
                <div className="bg-orange-50 px-6 py-2.5 rounded-xl text-orange-600 font-black text-[10px] uppercase tracking-[0.2em] border border-orange-100 animate-pulse shadow-sm">
                    Awaiting Offer
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10 relative z-10">
                 <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Target Account</span>
                    <p className="text-base font-black text-gray-900 uppercase tracking-tight">{request.customerContext}</p>
                 </div>
                 <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Market Location</span>
                    <p className="text-base font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                        <MapPin size={16} className="text-indigo-400"/> {request.customerLocation}
                    </p>
                 </div>
                 <div className="bg-indigo-600 rounded-3xl p-5 text-white shadow-lg shadow-indigo-100">
                    <span className="text-[9px] font-black text-indigo-200 uppercase tracking-widest block mb-1">Estimated Annual Volume</span>
                    <p className="text-2xl font-black tracking-tighter">$142,500.00</p>
                 </div>
            </div>

            <div className="overflow-x-auto mb-8 relative z-10">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">Market Variety</th>
                            <th className="px-6 py-4 text-right">Avg Weekly Spend</th>
                            <th className="px-6 py-4 text-right">Wholesale Target</th>
                            <th className="px-6 py-4 text-center">Match Target?</th>
                            <th className="px-6 py-4">Custom Price</th>
                            <th className="px-6 py-4 text-right">AI Win Prob.</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {localItems.map((item, idx) => {
                            const prob = WinProbability({ target: item.targetPrice, offered: item.offeredPrice || 0 });
                            const weeklySpend = item.qty * item.invoicePrice;
                            
                            return (
                                <tr key={idx} className="group hover:bg-gray-50/30 transition-colors">
                                    <td className="px-6 py-6">
                                        <div className="font-black text-gray-900 text-base tracking-tight uppercase leading-none mb-1.5">{item.productName}</div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Est. {item.qty} units / wk</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-right font-bold text-gray-500 text-sm italic group-hover:text-gray-900 transition-colors">${weeklySpend.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                    <td className="px-6 py-6 text-right">
                                        <div className="font-black text-emerald-600 text-xl tracking-tighter">${item.targetPrice.toFixed(2)}</div>
                                        <div className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Competitive Floor</div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex justify-center gap-2 bg-white border border-gray-100 p-1.5 rounded-2xl w-fit mx-auto shadow-sm">
                                            <button 
                                                onClick={() => handleToggleMatch(idx, true)} 
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${item.isMatchingTarget ? 'bg-[#043003] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                                            >
                                                {item.isMatchingTarget && <CheckCircle size={14}/>} YES
                                            </button>
                                            <button 
                                                onClick={() => handleToggleMatch(idx, false)} 
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${!item.isMatchingTarget ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                                            >
                                                {!item.isMatchingTarget && <X size={14}/>} NO
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="relative w-36 group">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-sm">$</span>
                                            <input 
                                                type="number" step="0.01" disabled={item.isMatchingTarget}
                                                className={`w-full pl-8 pr-4 py-3.5 rounded-xl text-base font-black transition-all outline-none border-2 ${item.isMatchingTarget ? 'bg-gray-50 border-transparent text-gray-300' : 'bg-white border-indigo-200 focus:border-indigo-500 shadow-inner-sm text-gray-900'}`}
                                                value={item.offeredPrice}
                                                onChange={e => handlePriceChange(idx, e.target.value)}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${prob.color} flex items-center gap-1`}>
                                                <BrainCircuit size={10}/> {prob.label}
                                            </span>
                                            <div className="w-28 h-2 bg-gray-100 rounded-full mt-2 overflow-hidden shadow-inner-sm border border-gray-50">
                                                <div className={`h-full ${prob.color.replace('text-', 'bg-')} transition-all duration-1000 shadow-[0_0_8px_rgba(0,0,0,0.1)]`} style={{width: `${prob.percent}%`}}></div>
                                            </div>
                                            <span className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">{prob.percent}% Match</span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-8 pt-10 border-t border-gray-100 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                        {/* Fix: Added missing ShieldCheck to lucide-react imports */}
                        <ShieldCheck size={20}/>
                    </div>
                    <p className="text-xs text-gray-400 font-medium max-w-sm">By submitting, you agree to the Platform Zero network pricing standards and confidentiality requirements.</p>
                </div>
                <button 
                    onClick={handleSubmit} disabled={isSubmitting}
                    className="w-full sm:w-auto px-16 py-6 bg-[#0F172A] hover:bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.25em] shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98] group"
                >
                    {isSubmitting ? <Loader2 size={24} className="animate-spin"/> : <><Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"/> Submit Response</>}
                </button>
            </div>
        </div>
    );
};

export const SupplierMarket: React.FC<SupplierMarketProps> = ({ user }) => {
  const [activeRequests, setActiveRequests] = useState<SupplierPriceRequest[]>([]);
  const [suppliers, setSuppliers] = useState<User[]>([]);
  const [demandMatches, setDemandMatches] = useState<any[]>([]);
  const [expandedSupplierId, setExpandedSupplierId] = useState<string | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  
  // Dropdown Form State
  const [offerForm, setOfferForm] = useState({ price: '', minOrder: '', logistics: '' });
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedItemSupplier, setSelectedItemSupplier] = useState<User | null>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState<number>(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatRep, setActiveChatRep] = useState('Partner Support');
  const [inventoryMap, setInventoryMap] = useState<Record<string, InventoryItem[]>>({});
  const [products] = useState<Product[]>(mockService.getAllProducts());

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 10000);

    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setActiveDropdownId(null);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
        clearInterval(interval);
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [user]);

  const refreshData = () => {
    const allUsers = mockService.getAllUsers();
    
    // 1. Dynamic Matching: Find people who are selling what I want to buy
    const matchingSuppliers = allUsers
      .filter(u => u.id !== user.id && (u.role === UserRole.FARMER || u.role === UserRole.WHOLESALER))
      .filter(u => {
          // If I have buying interests, find people who sell them
          const matchingSelling = u.activeSellingInterests?.some(item => user.activeBuyingInterests?.includes(item));
          return matchingSelling;
      })
      .sort((a, b) => {
          const aCount = a.activeSellingInterests?.filter(i => user.activeBuyingInterests?.includes(i)).length || 0;
          const bCount = b.activeSellingInterests?.filter(i => user.activeBuyingInterests?.includes(i)).length || 0;
          return bCount - aCount;
      });

    setSuppliers(matchingSuppliers);

    // 2. Dynamic Demand: Find people who want to buy what I am selling
    const potentialBuyers = allUsers
        .filter(u => u.id !== user.id && (u.role === UserRole.FARMER || u.role === UserRole.WHOLESALER))
        .filter(u => {
            const isBuyingWhatISell = u.activeBuyingInterests?.some(item => user.activeSellingInterests?.includes(item));
            return isBuyingWhatISell;
        })
        .map(u => {
            const sharedInterests = u.activeBuyingInterests?.filter(i => user.activeSellingInterests?.includes(i));
            return {
                id: u.id,
                businessName: u.businessName,
                product: sharedInterests?.[0] || 'Produce',
                qty: 'Negotiable',
                priority: 'HIGH'
            };
        });

    setDemandMatches(potentialBuyers);

    // 3. Admin Price Requests
    const priceReqs = mockService.getSupplierPriceRequests(user.id).filter(r => r.status === 'PENDING');
    setActiveRequests(priceReqs);

    const invMap: Record<string, InventoryItem[]> = {};
    matchingSuppliers.forEach(supplier => {
        const items = mockService.getInventoryByOwner(supplier.id).filter(i => i.status === 'Available');
        if (items.length > 0) invMap[supplier.id] = items;
    });
    setInventoryMap(invMap);
  };

  const handleSendOffer = (buyerName: string) => {
      setIsSubmittingOffer(true);
      setTimeout(() => {
          setIsSubmittingOffer(false);
          setActiveDropdownId(null);
          setOfferForm({ price: '', minOrder: '', logistics: '' });
          alert(`Offer for $${offerForm.price}/kg successfully sent back to supplier at ${buyerName}!`);
      }, 1000);
  };

  const toggleSupplier = (supplierId: string) => {
    setExpandedSupplierId(expandedSupplierId === supplierId ? null : supplierId);
  };

  const handleProductClick = (item: InventoryItem, supplier: User) => {
      setSelectedItem(item);
      setSelectedItemSupplier(supplier);
      setPurchaseQuantity(item.quantityKg);
  };

  const handleInitiateBuy = () => {
      if (selectedItem && selectedItemSupplier) {
          const product = products.find(p => p.id === selectedItem.productId);
          mockService.createInstantOrder(user.id, selectedItem, purchaseQuantity, product?.defaultPricePerKg || 0);
          alert(`Order Confirmed! Invoice added to Accounts Payable.`);
          setSelectedItem(null);
      }
  };

  const getProductName = (id: string) => products.find(p => p.id === id)?.name || 'Unknown';
  const getProductImage = (id: string) => products.find(p => p.id === id)?.imageUrl;
  const getProductPrice = (id: string) => products.find(p => p.id === id)?.defaultPricePerKg || 0;

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
        <div className="px-2">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase leading-none">Network Intelligence</h1>
            <p className="text-gray-400 font-bold text-xs tracking-tight mt-1">Direct B2B supply-demand matching hub.</p>
        </div>

        {/* --- PRICE ASSIGNMENTS (PZ HQ Sourcing) --- */}
        {activeRequests.length > 0 && (
            <div className="space-y-4 px-2">
                {activeRequests.map(req => (
                    <PriceRequestResponse key={req.id} request={req} onUpdate={() => refreshData()} />
                ))}
            </div>
        )}

        {/* --- DYNAMIC BUYER MATCHES --- */}
        <div className="bg-[#F0F7FF] rounded-[2rem] border border-[#D1E9FF] p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#2563EB] shadow-sm border border-blue-50">
                    <Users size={22} />
                </div>
                <div>
                    <h2 className="text-lg font-black text-[#0F172A] tracking-tight uppercase">Active Marketplace Demand</h2>
                    <p className="text-[#3B82F6] font-bold text-xs">Buyers in the network looking for items you sell</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {demandMatches.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-blue-100 rounded-3xl">
                        <Users size={32} className="mx-auto mb-2 opacity-20" />
                        <p className="text-xs font-black uppercase tracking-widest">No active buying matches found</p>
                    </div>
                ) : demandMatches.map((buyer, idx) => {
                    const isDropdownOpen = activeDropdownId === buyer.id;
                    return (
                        <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm transition-all hover:shadow-md hover:scale-[1.005]">
                            <div className="flex justify-between items-start">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-base font-black text-[#0F172A] tracking-tight uppercase leading-tight">{buyer.businessName}</h3>
                                        <div className="flex items-center gap-2 text-[#3B82F6] mt-1">
                                            <AlertCircle size={14} className="shrink-0" />
                                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">NEEDS: {buyer.product.toUpperCase()}</span>
                                        </div>
                                    </div>
                                    <span className={`inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                        buyer.priority === 'HIGH' ? 'bg-red-50 text-red-500' : 
                                        buyer.priority === 'MEDIUM' ? 'bg-orange-50 text-orange-600' : 
                                        'bg-emerald-50 text-emerald-600'
                                    }`}>
                                        {buyer.priority} PRIORITY MATCH
                                    </span>
                                </div>
                                <div className="relative">
                                    <button 
                                        onClick={() => setActiveDropdownId(isDropdownOpen ? null : buyer.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm whitespace-nowrap ${isDropdownOpen ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border border-indigo-100 text-indigo-600 hover:bg-indigo-50'}`}
                                    >
                                        Connect <ChevronDown size={14} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>
                            </div>

                            {/* --- CONNECT DROPDOWN FORM --- */}
                            {isDropdownOpen && (
                                <div ref={dropdownRef} className="mt-6 pt-6 border-t border-gray-100 animate-in slide-in-from-top-2 duration-300">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Price ($/kg)</label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={12}/>
                                                <input 
                                                    type="number" step="0.01" placeholder="0.00"
                                                    className="w-full pl-7 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-black text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                                    value={offerForm.price} onChange={e => setOfferForm({...offerForm, price: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Minimum Order</label>
                                            <div className="relative">
                                                <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={12}/>
                                                <input 
                                                    type="number" placeholder="kg"
                                                    className="w-full pl-7 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-black text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                                    value={offerForm.minOrder} onChange={e => setOfferForm({...offerForm, minOrder: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Logistic Cost</label>
                                            <div className="relative">
                                                <Truck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={12}/>
                                                <input 
                                                    type="number" step="0.01" placeholder="0.00"
                                                    className="w-full pl-7 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-black text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                                    value={offerForm.logistics} onChange={e => setOfferForm({...offerForm, logistics: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleSendOffer(buyer.businessName)}
                                        disabled={isSubmittingOffer || !offerForm.price}
                                        className="w-full py-3.5 bg-[#0F172A] text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {isSubmittingOffer ? <Loader2 size={14} className="animate-spin"/> : <><Send size={14}/> Send Direct Match Offer</>}
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>

        {/* --- DYNAMIC SUPPLIER MATCHES --- */}
        <div className="space-y-5 pt-6">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-md border border-indigo-500">
                        <Store size={20}/>
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-gray-900 tracking-tight uppercase leading-none">Suppliers Matching Your Needs</h2>
                        <p className="text-gray-400 font-bold text-xs tracking-tight mt-1">Produce matching your buying interests</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {suppliers.length === 0 ? (
                    <div className="py-20 text-center bg-white border border-gray-100 rounded-3xl">
                        <HelpCircle size={40} className="mx-auto mb-4 text-gray-100" />
                        <p className="text-sm font-black text-gray-300 uppercase tracking-widest">No active suppliers found for your buying interests</p>
                    </div>
                ) : suppliers.map(supplier => {
                    const items = inventoryMap[supplier.id] || [];
                    const isExpanded = expandedSupplierId === supplier.id;
                    const sharedInterests = supplier.activeSellingInterests?.filter(i => user.activeBuyingInterests?.includes(i)) || [];
                    
                    return (
                        <div key={supplier.id} className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all duration-300 hover:shadow-md border-gray-100`}>
                            <div onClick={() => toggleSupplier(supplier.id)} className="p-5 flex flex-col md:flex-row md:items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors">
                                <div className="flex items-center gap-5">
                                    <div className={`h-12 w-12 md:h-14 md:w-14 rounded-xl flex items-center justify-center text-xl font-black shadow-inner-sm relative ${supplier.role === 'FARMER' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {supplier.businessName.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex wrap items-center gap-2">
                                            <h3 className="text-base md:text-lg font-black text-gray-900 tracking-tight uppercase leading-none">{supplier.businessName}</h3>
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${supplier.role === 'FARMER' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>{supplier.role}</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                            {sharedInterests.map(interest => (
                                                <span key={interest} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[8px] font-black uppercase border border-indigo-100">{interest}</span>
                                            ))}
                                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest ml-2 flex items-center gap-1.5"><MapPin size={10} className="text-indigo-300"/> Market Vendor</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 md:mt-0 flex items-center gap-3">
                                    <button className="p-3 bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-indigo-100"><MessageSquare size={18}/></button>
                                    <div className="ml-1 bg-gray-100/50 p-2 rounded-lg text-gray-300 transition-transform duration-300">{isExpanded ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}</div>
                                </div>
                            </div>
                            {isExpanded && (
                                <div className="border-t border-gray-100 bg-gray-50/50 p-5 md:p-6 animate-in slide-in-from-top-2 duration-300">
                                    {items.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400">
                                            <p className="text-xs font-black uppercase tracking-widest">No active catalog listings for this supplier</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                            {items.map(item => (
                                                <div key={item.id} onClick={() => handleProductClick(item, supplier)} className={`bg-white rounded-2xl border p-4 flex flex-col gap-4 hover:shadow-lg transition-all cursor-pointer group shadow-sm border-transparent`}>
                                                    <div className="relative h-32 w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-50">
                                                        <img src={getProductImage(item.productId)} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
                                                        <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-md px-2 py-1 rounded-lg text-[8px] font-black text-gray-900 uppercase tracking-widest shadow-sm">{item.quantityKg}kg</div>
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-gray-900 text-sm leading-tight mb-0.5 uppercase tracking-tight truncate">{getProductName(item.productId)}</div>
                                                        <div className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Live Inventory Lot</div>
                                                        <div className="mt-4 flex justify-between items-end border-t border-gray-50 pt-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Rate</span>
                                                                <span className="font-black text-emerald-600 text-base tracking-tighter">${getProductPrice(item.productId).toFixed(2)}<span className="text-[10px] text-emerald-400 ml-0.5 font-bold">/kg</span></span>
                                                            </div>
                                                            <div className={`p-2 rounded-xl transition-all shadow-sm bg-gray-100 text-gray-400 group-hover:bg-indigo-600 group-hover:text-white`}>
                                                                <ShoppingCart size={16}/>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>

        {/* ITEM DETAILS MODAL */}
        {selectedItem && selectedItemSupplier && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="relative h-48 bg-gray-100">
                        <img src={getProductImage(selectedItem.productId)} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => setSelectedItem(null)} className="absolute top-6 right-6 bg-white/90 backdrop-blur-md p-2 rounded-full text-gray-500 hover:text-red-500 transition-all shadow-md active:scale-90"><X size={24}/></button>
                    </div>
                    <div className="p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tighter leading-none mb-1 uppercase">{getProductName(selectedItem.productId)}</h2>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Supplier: {selectedItemSupplier.businessName}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-black text-emerald-600 tracking-tighter leading-none">${getProductPrice(selectedItem.productId).toFixed(2)}</p>
                                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-1">UNIT RATE / KG</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Trade Volume (kg)</label>
                                <div className="relative group">
                                    <input type="number" min="1" max={selectedItem.quantityKg} value={purchaseQuantity} onChange={(e) => setPurchaseQuantity(Number(e.target.value))} className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-black text-2xl text-gray-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner-sm"/>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 font-black text-xs uppercase tracking-widest">KG</div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3 pt-2">
                                <button onClick={handleInitiateBuy} className="w-full py-4 bg-indigo-600 text-white rounded-[1.25rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3">
                                    <ShoppingCart size={18}/> Confirm Direct Buy
                                </button>
                                <button onClick={() => { setActiveChatRep(selectedItemSupplier.businessName); setIsChatOpen(true); }} className="w-full py-4 bg-white border border-gray-200 text-gray-400 rounded-[1.25rem] font-black uppercase tracking-[0.15em] text-[9px] hover:bg-gray-50 transition-all flex items-center justify-center gap-2 active:scale-95">
                                    <MessageSquare size={16}/> Chat with Partner
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        <ChatDialog isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} orderId="MARKET-INQUIRY" issueType={`Direct Network Inquiry: ${activeChatRep}`} repName={activeChatRep} />
    </div>
  );
};
