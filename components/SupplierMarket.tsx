
import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole, SupplierPriceRequest, SupplierPriceRequestItem, Product, InventoryItem } from '../types';
import { mockService } from '../services/mockDataService';
import { 
  Store, MapPin, Tag, MessageSquare, ChevronDown, ChevronUp, ShoppingCart, 
  X, CheckCircle, Bell, DollarSign, Truck, Send, 
  TrendingUp, Loader2, Users, Zap, Star, AlertCircle, Package, ArrowRight
} from 'lucide-react';
import { ChatDialog } from './ChatDialog';

interface SupplierMarketProps {
  user: User;
}

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
        <div className="bg-white rounded-3xl border border-indigo-100 p-6 shadow-sm animate-in zoom-in-95 duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2 uppercase">
                        <TrendingUp className="text-indigo-600" size={20}/> Lead ID: #{request.id.split('-').pop()}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-gray-400 font-bold text-[9px] uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><MapPin size={10}/> {request.customerLocation}</span>
                        <span className="flex items-center gap-1.5"><Tag size={10}/> {request.items.length} Line Items</span>
                    </div>
                </div>
                <div className="bg-indigo-50 px-3 py-1.5 rounded-lg text-indigo-700 font-black text-[9px] uppercase tracking-widest border border-indigo-100">
                    Awaiting Quote
                </div>
            </div>

            <div className="overflow-x-auto mb-6">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                        <tr>
                            <th className="px-4 py-3">Product</th>
                            <th className="px-4 py-3">PZ Target</th>
                            <th className="px-4 py-3 text-center">Match?</th>
                            <th className="px-4 py-3">Your Offer</th>
                            <th className="px-4 py-3 text-right">Win Likelihood</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {localItems.map((item, idx) => {
                            const prob = WinProbability({ target: item.targetPrice, offered: item.offeredPrice || 0 });
                            return (
                                <tr key={idx} className="group hover:bg-gray-50/30 transition-colors">
                                    <td className="px-4 py-4 font-black text-gray-900 text-sm tracking-tight">{item.productName}</td>
                                    <td className="px-4 py-4 font-black text-indigo-600 text-base">${item.targetPrice.toFixed(2)}</td>
                                    <td className="px-4 py-4">
                                        <div className="flex justify-center gap-1 bg-gray-100 p-1 rounded-lg w-fit mx-auto shadow-inner-sm">
                                            <button onClick={() => handleToggleMatch(idx, true)} className={`px-3 py-1 rounded-md text-[9px] font-black uppercase transition-all ${item.isMatchingTarget ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Yes</button>
                                            <button onClick={() => handleToggleMatch(idx, false)} className={`px-3 py-1 rounded-md text-[9px] font-black uppercase transition-all ${!item.isMatchingTarget ? 'bg-red-500 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>No</button>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="relative w-24">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 font-black text-[10px]">$</span>
                                            <input 
                                                type="number" step="0.01" disabled={item.isMatchingTarget}
                                                className="w-full pl-5 pr-2 py-1.5 rounded-lg text-xs font-black transition-all outline-none border border-gray-200 focus:border-indigo-500"
                                                value={item.offeredPrice}
                                                onChange={e => handlePriceChange(idx, e.target.value)}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <span className={`text-xs font-black ${prob.color}`}>{prob.label}</span>
                                        <div className="w-20 h-1 bg-gray-100 rounded-full mt-1 overflow-hidden ml-auto">
                                            <div className={`h-full ${prob.color.replace('text-', 'bg-')}`} style={{width: `${prob.percent}%`}}></div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-50">
                <button 
                    onClick={handleSubmit} disabled={isSubmitting}
                    className="px-8 py-3 bg-[#0F172A] text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin"/> : <><Send size={14}/> Submit Proposal</>}
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
    const potentialSuppliers = allUsers
      .filter(u => u.id !== user.id && (u.role === UserRole.FARMER || u.role === UserRole.WHOLESALER))
      .sort((a, b) => {
          const aMatch = a.activeSellingInterests?.some(si => user.activeBuyingInterests?.includes(si)) ? 1 : 0;
          const bMatch = b.activeSellingInterests?.some(si => user.activeBuyingInterests?.includes(si)) ? 1 : 0;
          return bMatch - aMatch;
      });
    setSuppliers(potentialSuppliers);

    const buyers = [
        { id: 'wh-1', businessName: 'Melbourne Fresh Distributors', product: 'Broccoli', qty: '250kg', priority: 'HIGH' },
        { id: 'wh-2', businessName: 'Sydney Premium Produce', product: 'Asparagus', qty: '180kg', priority: 'MEDIUM' },
        { id: 'wh-3', businessName: 'Brisbane Organic Wholesale', product: 'Carrots', qty: '300kg', priority: 'LOW' },
        { id: 'wh-4', businessName: 'Metro Food Services', product: 'Potatoes', qty: '500kg', priority: 'MEDIUM' }
    ];
    setDemandMatches(buyers);

    const priceReqs = mockService.getSupplierPriceRequests(user.id).filter(r => r.status === 'PENDING');
    setActiveRequests(priceReqs);

    const invMap: Record<string, InventoryItem[]> = {};
    potentialSuppliers.forEach(supplier => {
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
            <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase leading-none">Market Intelligence Hub</h1>
            <p className="text-gray-400 font-bold text-xs tracking-tight mt-1">Cross-referencing global demand with your supply network.</p>
        </div>

        {/* --- READY TO PURCHASE WHOLESALERS SECTION (SCREENSHOT MATCH) --- */}
        <div className="bg-[#F0F7FF] rounded-[2rem] border border-[#D1E9FF] p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#2563EB] shadow-sm border border-blue-50">
                    <Users size={22} />
                </div>
                <div>
                    <h2 className="text-lg font-black text-[#0F172A] tracking-tight">Ready to Purchase Wholesalers</h2>
                    <p className="text-[#3B82F6] font-bold text-xs">Allocated wholesalers ready to purchase products needing quick sale</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {demandMatches.map((buyer, idx) => {
                    const isDropdownOpen = activeDropdownId === buyer.id;
                    return (
                        <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm transition-all hover:shadow-md hover:scale-[1.005]">
                            <div className="flex justify-between items-start">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-base font-black text-[#0F172A] tracking-tight uppercase leading-tight">{buyer.businessName}</h3>
                                        <div className="flex items-center gap-2 text-[#3B82F6] mt-1">
                                            <AlertCircle size={14} className="shrink-0" />
                                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">NEEDS: {buyer.product.toUpperCase()} {buyer.qty}</span>
                                        </div>
                                    </div>
                                    <span className={`inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                        buyer.priority === 'HIGH' ? 'bg-red-50 text-red-500' : 
                                        buyer.priority === 'MEDIUM' ? 'bg-orange-50 text-orange-600' : 
                                        'bg-emerald-50 text-emerald-600'
                                    }`}>
                                        {buyer.priority} PRIORITY
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
                                        {isSubmittingOffer ? <Loader2 size={14} className="animate-spin"/> : <><Send size={14}/> Send back to supplier</>}
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>

        {/* --- SUPPLY SIDE: FARMERS & WHOLESALERS YOU WANT TO BUY FROM (COMPACT) --- */}
        <div className="space-y-5 pt-6">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-md border border-indigo-500">
                        <Store size={20}/>
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-gray-900 tracking-tight uppercase leading-none">Suppliers to purchase from</h2>
                        <p className="text-gray-400 font-bold text-xs tracking-tight mt-1">Selling produce matching your buying interests</p>
                    </div>
                </div>
                <button className="bg-white border border-gray-200 text-gray-400 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:text-gray-900 transition-all flex items-center gap-2">
                    <Star size={12}/> Manage Favorites
                </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {suppliers.filter(s => inventoryMap[s.id]).map(supplier => {
                    const items = inventoryMap[supplier.id];
                    const isExpanded = expandedSupplierId === supplier.id;
                    const matchesUserInterest = items.some(item => 
                        user.activeBuyingInterests?.some(interest => 
                            getProductName(item.productId).toLowerCase().includes(interest.toLowerCase())
                        )
                    );

                    return (
                        <div key={supplier.id} className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all duration-300 hover:shadow-md ${matchesUserInterest ? 'border-indigo-400' : 'border-gray-100'}`}>
                            <div onClick={() => toggleSupplier(supplier.id)} className="p-5 flex flex-col md:flex-row md:items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors">
                                <div className="flex items-center gap-5">
                                    <div className={`h-12 w-12 md:h-14 md:w-14 rounded-xl flex items-center justify-center text-xl font-black shadow-inner-sm relative ${supplier.role === 'FARMER' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {supplier.businessName.charAt(0)}
                                        {matchesUserInterest && (
                                            <div className="absolute -top-2 -right-2 bg-indigo-600 text-white p-1 rounded-full shadow-md border border-white animate-pulse">
                                                <Zap size={10} fill="currentColor"/>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-base md:text-lg font-black text-gray-900 tracking-tight uppercase leading-none">{supplier.businessName}</h3>
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${supplier.role === 'FARMER' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>{supplier.role}</span>
                                            {matchesUserInterest && <span className="bg-indigo-50 text-indigo-700 text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Signal Match</span>}
                                        </div>
                                        <div className="flex items-center gap-4 text-[9px] text-gray-400 mt-2 font-bold uppercase tracking-widest">
                                            <span className="flex items-center gap-1.5"><MapPin size={12} className="text-indigo-300"/> {items[0]?.harvestLocation || 'Australia'}</span>
                                            <span className="flex items-center gap-1.5"><Tag size={12} className="text-indigo-300"/> {items.length} ACTIVE BATCHES</span>
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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {items.map(item => {
                                            const isPersonalMatch = user.activeBuyingInterests?.some(interest => 
                                                getProductName(item.productId).toLowerCase().includes(interest.toLowerCase())
                                            );
                                            return (
                                                <div key={item.id} onClick={() => handleProductClick(item, supplier)} className={`bg-white rounded-2xl border p-4 flex flex-col gap-4 hover:shadow-lg transition-all cursor-pointer group shadow-sm ${isPersonalMatch ? 'border-indigo-500 bg-indigo-50/10' : 'border-transparent'}`}>
                                                    <div className="relative h-32 w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-50">
                                                        <img src={getProductImage(item.productId)} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
                                                        <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-md px-2 py-1 rounded-lg text-[8px] font-black text-gray-900 uppercase tracking-widest shadow-sm">{item.quantityKg}kg</div>
                                                        {isPersonalMatch && (
                                                            <div className="absolute bottom-2 left-2 bg-indigo-600 text-white px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-md flex items-center gap-1.5">
                                                                <Zap size={10} fill="currentColor"/> Match
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-gray-900 text-sm leading-tight mb-0.5 uppercase tracking-tight truncate">{getProductName(item.productId)}</div>
                                                        <div className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Live Inventory Lot</div>
                                                        <div className="mt-4 flex justify-between items-end border-t border-gray-50 pt-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Rate</span>
                                                                <span className="font-black text-emerald-600 text-base tracking-tighter">${getProductPrice(item.productId).toFixed(2)}<span className="text-[10px] text-emerald-400 ml-0.5 font-bold">/kg</span></span>
                                                            </div>
                                                            <div className={`p-2 rounded-xl transition-all shadow-sm ${isPersonalMatch ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                                                                <ShoppingCart size={16}/>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>

        {/* PRICE REQUESTS SECTION (COMPACT) */}
        {activeRequests.length > 0 && (
            <div className="space-y-5 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3 px-2">
                    <div className="bg-orange-500 p-2 rounded-xl text-white shadow-md border border-orange-400">
                        <Bell size={20}/>
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-gray-900 tracking-tight uppercase leading-none">Admin Price Assignments</h2>
                        <p className="text-gray-400 font-bold text-xs tracking-tight mt-1">Direct sourcing requests assigned by Platform Zero.</p>
                    </div>
                </div>
                <div className="space-y-6">
                    {activeRequests.map(req => (
                        <PriceRequestResponse key={req.id} request={req} onUpdate={() => refreshData()} />
                    ))}
                </div>
            </div>
        )}

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
