
import React, { useState, useEffect } from 'react';
import { User, InventoryItem, Product, UserRole, SupplierPriceRequest, SupplierPriceRequestItem, Customer } from '../types';
import { mockService } from '../services/mockDataService';
import { 
  Store, MapPin, Tag, Phone, MessageSquare, ChevronDown, ChevronUp, ShoppingCart, 
  X, CheckCircle, Bell, AlertTriangle, DollarSign, Truck, Send, Check, 
  Percent, TrendingUp, Info, Loader2, Target, Users, Zap, ArrowRight, Star
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
    const [transport, setTransport] = useState('');
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
        <div className="bg-white rounded-3xl border-2 border-indigo-100 p-8 shadow-sm animate-in zoom-in-95 duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2 uppercase">
                        <TrendingUp className="text-indigo-600" size={24}/> Lead ID: #{request.id.split('-').pop()}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><MapPin size={12}/> {request.customerLocation}</span>
                        <span className="flex items-center gap-1.5"><Tag size={12}/> {request.items.length} Line Items</span>
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
                            <th className="px-6 py-4">Product Name</th>
                            <th className="px-6 py-4">PZ Target</th>
                            <th className="px-6 py-4 text-center">Match?</th>
                            <th className="px-6 py-4">Your Offer</th>
                            <th className="px-6 py-4 text-right">Win Likelihood</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {localItems.map((item, idx) => {
                            const prob = WinProbability({ target: item.targetPrice, offered: item.offeredPrice || 0 });
                            return (
                                <tr key={idx} className="group hover:bg-gray-50/30 transition-colors">
                                    <td className="px-6 py-6 font-black text-gray-900 text-lg tracking-tight">{item.productName}</td>
                                    <td className="px-6 py-6 font-black text-indigo-600 text-xl">${item.targetPrice.toFixed(2)}</td>
                                    <td className="px-6 py-6">
                                        <div className="flex justify-center gap-1 bg-gray-100 p-1 rounded-xl w-fit mx-auto shadow-inner-sm">
                                            <button onClick={() => handleToggleMatch(idx, true)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${item.isMatchingTarget ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>Yes</button>
                                            <button onClick={() => handleToggleMatch(idx, false)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${!item.isMatchingTarget ? 'bg-red-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>No</button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="relative w-32">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-black text-xs">$</span>
                                            <input 
                                                type="number" step="0.01" disabled={item.isMatchingTarget}
                                                className={`w-full pl-6 pr-3 py-2.5 rounded-xl text-sm font-black transition-all outline-none border-2 ${item.isMatchingTarget ? 'bg-gray-50 border-gray-100 text-gray-300' : 'bg-white border-red-200 text-gray-900 focus:border-red-500'}`}
                                                value={item.offeredPrice}
                                                onChange={e => handlePriceChange(idx, e.target.value)}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <span className={`text-sm font-black ${prob.color}`}>{prob.label}</span>
                                        <div className="w-24 h-1 bg-gray-100 rounded-full mt-1.5 overflow-hidden ml-auto">
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
                    onClick={handleSubmit} disabled={isSubmitting}
                    className="px-12 py-5 bg-[#0F172A] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {isSubmitting ? <Loader2 size={20} className="animate-spin"/> : <><Send size={18}/> Submit Proposal</>}
                </button>
            </div>
        </div>
    );
};

export const SupplierMarket: React.FC<SupplierMarketProps> = ({ user }) => {
  const [activeRequests, setActiveRequests] = useState<SupplierPriceRequest[]>([]);
  const [suppliers, setSuppliers] = useState<User[]>([]);
  const [demandMatches, setDemandMatches] = useState<Customer[]>([]);
  const [expandedSupplierId, setExpandedSupplierId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedItemSupplier, setSelectedItemSupplier] = useState<User | null>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState<number>(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatRep, setActiveChatRep] = useState('Partner Support');
  const [inventoryMap, setInventoryMap] = useState<Record<string, InventoryItem[]>>({});
  const [products] = useState<Product[]>(mockService.getAllProducts());

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const refreshData = () => {
    const allUsers = mockService.getAllUsers();
    
    // Identified Suppliers to Buy From (Supply side)
    // Sort suppliers by Signal Match first
    const potentialSuppliers = allUsers
      .filter(u => u.id !== user.id && (u.role === UserRole.FARMER || u.role === UserRole.WHOLESALER))
      .sort((a, b) => {
          const aMatch = a.activeSellingInterests?.some(si => user.activeBuyingInterests?.includes(si)) ? 1 : 0;
          const bMatch = b.activeSellingInterests?.some(si => user.activeBuyingInterests?.includes(si)) ? 1 : 0;
          return bMatch - aMatch;
      });
    setSuppliers(potentialSuppliers);

    // Identify active Buyers for what I am currently selling (Demand side)
    const myInv = mockService.getInventory(user.id);
    const buyers = mockService.getCustomers();
    
    // Complex matching: Ranking buyers by how many of our active stock items they typically buy
    const matchedBuyers = buyers.map(b => {
        let score = 0;
        myInv.forEach(inv => {
            const p = products.find(prod => prod.id === inv.productId);
            if (b.commonProducts?.toLowerCase().includes(p?.name.toLowerCase() || '---')) {
                score += 10;
            }
        });
        // Bonus for location proximity (mocked)
        if (b.location === 'Richmond' || b.location === 'CBD') score += 5;
        
        return { ...b, matchScore: Math.min(99, 70 + score) };
    }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 8);
    
    setDemandMatches(matchedBuyers);

    const priceReqs = mockService.getSupplierPriceRequests(user.id).filter(r => r.status === 'PENDING');
    setActiveRequests(priceReqs);

    const invMap: Record<string, InventoryItem[]> = {};
    potentialSuppliers.forEach(supplier => {
        const items = mockService.getInventoryByOwner(supplier.id).filter(i => i.status === 'Available');
        if (items.length > 0) invMap[supplier.id] = items;
    });
    setInventoryMap(invMap);
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
    <div className="space-y-10 pb-20 animate-in fade-in duration-500">
        <div className="flex justify-between items-end">
            <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Market Intelligence Hub</h1>
                <p className="text-gray-500 font-medium mt-1">Cross-referencing global demand with your supply network.</p>
            </div>
        </div>

        {/* --- DEMAND SIDE: PEOPLE LOOKING TO BUY FROM YOU --- */}
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-600 p-2.5 rounded-2xl text-white shadow-xl shadow-emerald-100 border-2 border-emerald-500">
                        <Users size={28}/>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Buyers</h2>
                        <p className="text-gray-500 font-medium text-sm">Customers interested in buying my products</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Matched via PZ AI</span>
                    <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{demandMatches.length} Active Leads</div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {demandMatches.map(buyer => (
                    <div key={buyer.id} className="bg-white rounded-[2.5rem] p-6 border-2 border-emerald-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all group relative overflow-hidden flex flex-col h-full">
                        <div className="absolute top-0 right-0 p-6 opacity-5 transform rotate-12 group-hover:scale-110 transition-transform"><Target size={100} className="text-emerald-900"/></div>
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-lg shadow-inner-sm">
                                    {buyer.businessName.charAt(0)}
                                </div>
                                <div className="bg-emerald-500 text-white px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-md">
                                    {/* @ts-ignore */}
                                    {buyer.matchScore}% Match
                                </div>
                            </div>
                            <h3 className="text-lg font-black text-gray-900 tracking-tight leading-none mb-1 truncate">{buyer.businessName}</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5 mb-6">
                                <MapPin size={12} className="text-emerald-400"/> {buyer.location || 'Melbourne'}
                            </p>
                            
                            <div className="space-y-3 pt-4 border-t border-emerald-50 mt-auto">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Buying Intent</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {buyer.commonProducts?.split(',').slice(0, 2).map((p, i) => (
                                        <span key={i} className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg text-[9px] font-black border border-emerald-100 truncate max-w-full">
                                            {p.trim()}
                                        </span>
                                    ))}
                                </div>
                                <button 
                                    onClick={() => { setActiveChatRep(buyer.businessName); setIsChatOpen(true); }}
                                    className="w-full py-3 bg-[#043003] text-white rounded-xl font-black text-[9px] uppercase tracking-[0.15em] shadow-lg shadow-emerald-100 hover:bg-black transition-all flex items-center justify-center gap-2"
                                >
                                    <MessageSquare size={14}/> Propose Stock
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* --- SUPPLY SIDE: FARMERS & WHOLESALERS YOU WANT TO BUY FROM --- */}
        <div className="space-y-6 pt-10 border-t border-gray-100">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-xl shadow-indigo-100 border-2 border-indigo-500">
                        <Store size={28}/>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Suppliers to purchase from</h2>
                        <p className="text-gray-500 font-medium text-sm">These suppliers or farmers are selling the product I'm looking to purchase</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="bg-white border border-gray-200 text-gray-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-gray-900 transition-all flex items-center gap-2">
                        <Star size={14}/> Manage Favorites
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {suppliers.filter(s => inventoryMap[s.id]).map(supplier => {
                    const items = inventoryMap[supplier.id];
                    const isExpanded = expandedSupplierId === supplier.id;
                    const matchesUserInterest = items.some(item => 
                        user.activeBuyingInterests?.some(interest => 
                            getProductName(item.productId).toLowerCase().includes(interest.toLowerCase())
                        )
                    );

                    return (
                        <div key={supplier.id} className={`bg-white rounded-[2.5rem] shadow-sm border-2 overflow-hidden transition-all duration-300 hover:shadow-md ${matchesUserInterest ? 'border-indigo-400' : 'border-gray-100'}`}>
                            <div onClick={() => toggleSupplier(supplier.id)} className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors">
                                <div className="flex items-center gap-6">
                                    <div className={`h-14 w-14 md:h-16 md:w-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-inner-sm relative ${supplier.role === 'FARMER' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {supplier.businessName.charAt(0)}
                                        {matchesUserInterest && (
                                            <div className="absolute -top-2 -right-2 bg-indigo-600 text-white p-1.5 rounded-full shadow-lg border-2 border-white animate-pulse">
                                                <Zap size={14} fill="currentColor"/>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h3 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">{supplier.businessName}</h3>
                                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border-2 ${supplier.role === 'FARMER' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>{supplier.role}</span>
                                            {matchesUserInterest && <span className="bg-indigo-50 text-indigo-700 text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest animate-in fade-in">Signal Match</span>}
                                        </div>
                                        <div className="flex items-center gap-6 text-xs text-gray-400 mt-2 font-bold uppercase tracking-tight">
                                            <span className="flex items-center gap-1.5"><MapPin size={14}/> {items[0]?.harvestLocation || 'Australia'}</span>
                                            <span className="flex items-center gap-1.5"><Tag size={14}/> {items.length} Products</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 md:mt-0 flex items-center gap-4">
                                    <button className="p-3 bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all shadow-sm border border-transparent hover:border-indigo-100"><MessageSquare size={20}/></button>
                                    <div className="ml-2 bg-gray-100/50 p-2 rounded-xl text-gray-300 transition-transform duration-300">{isExpanded ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}</div>
                                </div>
                            </div>
                            {isExpanded && (
                                <div className="border-t border-gray-100 bg-gray-50/50 p-6 md:p-8 animate-in slide-in-from-top-4 duration-300">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {items.map(item => {
                                            const isPersonalMatch = user.activeBuyingInterests?.some(interest => 
                                                getProductName(item.productId).toLowerCase().includes(interest.toLowerCase())
                                            );
                                            return (
                                                <div key={item.id} onClick={() => handleProductClick(item, supplier)} className={`bg-white rounded-3xl border-2 p-5 flex flex-col gap-4 hover:shadow-xl transition-all cursor-pointer group shadow-sm ${isPersonalMatch ? 'border-indigo-500 bg-indigo-50/10' : 'border-transparent'}`}>
                                                    <div className="relative h-40 w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-50">
                                                        <img src={getProductImage(item.productId)} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
                                                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] font-black text-gray-900 uppercase tracking-widest shadow-sm">{item.quantityKg}kg</div>
                                                        {isPersonalMatch && (
                                                            <div className="absolute bottom-3 left-3 bg-indigo-600 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                                                                <Zap size={10} fill="currentColor"/> Match
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-gray-900 text-lg leading-tight mb-1">{getProductName(item.productId)}</div>
                                                        <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">Verified Stock</div>
                                                        <div className="mt-4 flex justify-between items-end border-t border-gray-50 pt-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Rate</span>
                                                                <span className="font-black text-emerald-600 text-xl">${getProductPrice(item.productId).toFixed(2)}<span className="text-[10px] text-emerald-400">/kg</span></span>
                                                            </div>
                                                            <div className={`p-2.5 rounded-xl transition-all ${isPersonalMatch ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                                                                <ShoppingCart size={20}/>
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

        {/* PRICE REQUESTS SECTION (ADMIN DRIVEN) */}
        {activeRequests.length > 0 && (
            <div className="space-y-6 pt-10 border-t border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="bg-orange-500 p-2.5 rounded-2xl text-white shadow-xl shadow-orange-100">
                        <Bell size={28}/>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Admin Price Assignments</h2>
                        <p className="text-gray-500 font-medium text-sm">Direct sourcing requests assigned to you by Platform Zero.</p>
                    </div>
                </div>
                <div className="space-y-8">
                    {activeRequests.map(req => (
                        <PriceRequestResponse key={req.id} request={req} onUpdate={() => refreshData()} />
                    ))}
                </div>
            </div>
        )}

        {/* ITEM DETAILS MODAL */}
        {selectedItem && selectedItemSupplier && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
                <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="relative h-56 bg-gray-100">
                        <img src={getProductImage(selectedItem.productId)} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => setSelectedItem(null)} className="absolute top-6 right-6 bg-white/90 backdrop-blur p-2 rounded-full text-gray-500 hover:text-red-500 transition-colors shadow-lg"><X size={24}/></button>
                    </div>
                    <div className="p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-1">{getProductName(selectedItem.productId)}</h2>
                                <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Supplier: {selectedItemSupplier.businessName}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-black text-emerald-600 tracking-tight">${getProductPrice(selectedItem.productId).toFixed(2)}</p>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">PER KG</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Order Quantity (kg)</label>
                                <div className="relative">
                                    <input type="number" min="1" max={selectedItem.quantityKg} value={purchaseQuantity} onChange={(e) => setPurchaseQuantity(Number(e.target.value))} className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl p-5 font-black text-2xl text-gray-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"/>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 font-black text-sm uppercase tracking-widest">KG</div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3 pt-2">
                                <button onClick={handleInitiateBuy} className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                                    <ShoppingCart size={20}/> Confirm Purchase
                                </button>
                                <button onClick={() => { setActiveChatRep(selectedItemSupplier.businessName); setIsChatOpen(true); }} className="w-full py-5 bg-white border-2 border-gray-200 text-gray-500 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-gray-50 transition-all flex items-center justify-center gap-3">
                                    <MessageSquare size={20}/> Message Partner
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        <ChatDialog isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} orderId="MARKET-INQUIRY" issueType={`B2B Network Trade: ${activeChatRep}`} repName={activeChatRep} />
    </div>
  );
};
