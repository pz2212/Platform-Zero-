import React, { useState, useEffect } from 'react';
import { User, Product, InventoryItem, UserRole } from '../types';
import { mockService } from '../services/mockDataService';
import { ShoppingCart, Search, ChevronDown, Plus, X, Leaf, Minus, CheckCircle, MessageCircle, ArrowRight, DollarSign, UserPlus, LogIn, Store, Eye, MessageSquare, Handshake } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface MarketplaceProps {
  user: User | null;
}

const ProductCard: React.FC<any> = ({ product, onAdd, isOutOfStock }) => {
    const [qty, setQty] = useState(1);
    const co2Savings = product.co2SavingsPerKg !== undefined 
        ? product.co2SavingsPerKg.toFixed(2) 
        : (product.name.length * 0.05 + 0.1).toFixed(1);

    return (
        <div className={`bg-white rounded-xl border border-gray-200 p-6 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow relative ${isOutOfStock ? 'opacity-75' : ''}`}>
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl text-gray-900 font-bold leading-tight">{product.name}</h3>
                {isOutOfStock && <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded border border-red-100 uppercase tracking-wider">Out of Stock</span>}
            </div>
            <div className="text-xs space-y-1 mb-3">
                <p className="text-gray-500"><span className="text-gray-400">Category:</span> {product.category}</p>
                <p className="text-gray-500"><span className="text-gray-400">Variety:</span> {product.variety}</p>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold mb-6"><Leaf size={12} className="fill-current" /><span>Saves {co2Savings}kg CO2/kg</span></div>
            <div className="mt-auto space-y-3">
                <div className="flex gap-3 h-10">
                    <div className="flex-1 flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden">
                        <button onClick={() => setQty(Math.max(1, qty - 1))} disabled={isOutOfStock} className="px-3 h-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-50"><Minus size={14}/></button>
                        <input className="flex-1 text-center font-bold text-sm outline-none w-full h-full bg-transparent text-gray-900" value={qty} readOnly />
                        <button onClick={() => setQty(qty + 1)} disabled={isOutOfStock} className="px-3 h-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-50"><Plus size={14}/></button>
                    </div>
                </div>
                <button onClick={() => onAdd(qty)} disabled={isOutOfStock} className="w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors bg-[#043003] text-white hover:bg-[#064004] shadow-sm">Add {qty}kg to Cart</button>
            </div>
        </div>
    );
};

export const Marketplace: React.FC<MarketplaceProps> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const sharedItemId = queryParams.get('item');
  const sharedFrom = queryParams.get('from');
  const sharedPrice = queryParams.get('price');

  const [sharedItem, setSharedItem] = useState<InventoryItem | null>(null);
  const [sharedProduct, setSharedProduct] = useState<Product | null>(null);
  const [showInviteOverlay, setShowInviteOverlay] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [allInventory, setAllInventory] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setProducts(mockService.getAllProducts().sort((a, b) => a.name.localeCompare(b.name)));
    setAllInventory(mockService.getAllInventory());
  }, []);

  useEffect(() => {
    if (sharedItemId) {
      const item = mockService.getAllInventory().find(i => i.id === sharedItemId);
      if (item) {
        setSharedItem(item);
        setSharedProduct(mockService.getProduct(item.productId) || null);
        setShowInviteOverlay(true);
      }
    }
  }, [sharedItemId]);

  const handleAction = (type: 'connect' | 'purchase' | 'chat') => {
    if (user) {
        if (type === 'chat' || type === 'connect') {
            const owner = mockService.getAllUsers().find(u => u.id === sharedItem?.ownerId);
            if (owner) navigate(`/contacts?id=${owner.id}`);
        } else {
            alert("Proceeding to checkout...");
            navigate('/orders');
        }
    } else {
        alert(`To ${type}, please create an account or sign in to the secure Platform Zero marketplace.`);
        // Assuming there's a global way to trigger auth or redirect to landing
        window.location.hash = '#/'; 
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 relative pb-20">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-[#043003]">
                    <ShoppingCart size={28} />
                </div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Fresh Marketplace</h1>
            </div>
            {!user && (
                <button onClick={() => window.location.hash = '#/'} className="flex items-center gap-2 px-6 py-2.5 bg-[#0F172A] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95">
                    <LogIn size={16}/> Sign In
                </button>
            )}
        </div>

        <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
            <input 
                type="text" 
                placeholder="Search catalog..." 
                className="w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/5 shadow-sm" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => {
                const isAvailable = allInventory.some(i => i.productId === product.id && i.status === 'Available');
                return <ProductCard key={product.id} product={product} onAdd={() => {}} isOutOfStock={!isAvailable} />;
            })}
        </div>

        {showInviteOverlay && sharedProduct && sharedItem && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-500 overflow-y-auto">
                <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:flex-row min-h-[500px] my-8 border-4 border-white/20">
                    
                    {/* LEFT IMAGE PANEL */}
                    <div className="w-full md:w-1/2 h-64 md:h-auto relative overflow-hidden bg-slate-100">
                        <img 
                            src={sharedItem.batchImageUrl || sharedProduct.imageUrl} 
                            className="w-full h-full object-cover" 
                            alt={sharedProduct.name}
                        />
                        <div className="absolute top-8 left-8">
                            <span className="bg-[#10B981] text-white text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-widest shadow-2xl border-2 border-white/20 backdrop-blur-sm">Live Market Offer</span>
                        </div>
                        
                        {/* Wholesaler Floating Badge */}
                        <div className="absolute bottom-8 left-8 right-8">
                            <div className="bg-black/50 backdrop-blur-xl p-5 rounded-[2rem] border border-white/20 text-white flex items-center gap-4 shadow-2xl">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-black text-xl text-emerald-400 border border-white/10">
                                    {sharedFrom?.charAt(0) || 'W'}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] leading-none mb-1.5">Supplier Partner</p>
                                    <p className="font-black text-lg leading-none uppercase tracking-tight">{sharedFrom || 'Verified Wholesaler'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT CONTENT PANEL */}
                    <div className="w-full md:w-1/2 flex flex-col h-full bg-white relative">
                        <button onClick={() => setShowInviteOverlay(false)} className="absolute top-8 right-8 text-gray-300 hover:text-red-500 transition-colors bg-gray-50 p-3 rounded-full active:scale-90 shadow-sm border border-gray-100 z-10">
                            <X size={24} strokeWidth={2.5}/>
                        </button>

                        <div className="p-8 md:p-14 flex-1 flex flex-col">
                            <div className="mb-12">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-100">{sharedProduct.variety}</span>
                                    <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-black uppercase tracking-widest"><Leaf size={12} fill="currentColor"/> Eco-Direct</div>
                                </div>
                                <h2 className="text-5xl font-black text-[#0F172A] tracking-tighter leading-[0.9] uppercase">{sharedProduct.name}</h2>
                            </div>

                            <div className="space-y-12 flex-1">
                                {/* PRICE DISPLAY */}
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Market Trade Rate</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-black text-[#043003] mr-1">$</span>
                                        <p className="text-8xl font-black text-[#043003] tracking-tighter leading-none">
                                            {sharedPrice ? parseFloat(sharedPrice).toFixed(2) : sharedProduct.defaultPricePerKg.toFixed(2)}
                                        </p>
                                        <span className="text-xl text-gray-300 font-black ml-2 uppercase tracking-widest">/kg</span>
                                    </div>
                                </div>

                                {/* PREMIUM ACTIONS GRID */}
                                <div className="grid grid-cols-2 gap-4">
                                    <button 
                                        onClick={() => handleAction('purchase')}
                                        className="py-6 bg-[#043003] text-white rounded-[1.75rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-emerald-900/20 hover:bg-black transition-all flex flex-col items-center justify-center gap-2 active:scale-95 border-b-4 border-black/20"
                                    >
                                        <ShoppingCart size={24}/> <span>Purchase</span>
                                    </button>
                                    <button 
                                        onClick={() => setShowInviteOverlay(false)}
                                        className="py-6 bg-white border-2 border-gray-100 text-gray-500 rounded-[1.75rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-gray-50 transition-all flex flex-col items-center justify-center gap-2 active:scale-95 shadow-sm"
                                    >
                                        <Eye size={24}/> <span>View All</span>
                                    </button>
                                    <button 
                                        onClick={() => handleAction('chat')}
                                        className="py-6 bg-indigo-50 text-indigo-700 rounded-[1.75rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-indigo-100 transition-all flex flex-col items-center justify-center gap-2 active:scale-95 border-b-4 border-indigo-200/50"
                                    >
                                        <MessageSquare size={24}/> <span>Chat</span>
                                    </button>
                                    <button 
                                        onClick={() => handleAction('connect')}
                                        className="py-6 bg-emerald-50 text-emerald-700 rounded-[1.75rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-emerald-100 transition-all flex flex-col items-center justify-center gap-2 active:scale-95 border-b-4 border-emerald-200/50"
                                    >
                                        <Handshake size={24}/> <span>Connect</span>
                                    </button>
                                </div>

                                {/* GUEST FOOTER */}
                                {!user && (
                                    <div className="pt-8 border-t border-gray-100 animate-in slide-in-from-bottom-4 duration-1000 delay-300">
                                        <p className="text-center text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-6">Trade Securely on Platform Zero</p>
                                        <button 
                                            onClick={() => window.location.hash = '#/'}
                                            className="w-full flex items-center justify-between p-6 bg-[#0F172A] text-white rounded-[1.75rem] hover:bg-black transition-all group shadow-2xl border-b-4 border-black"
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className="p-3 bg-white/10 rounded-2xl border border-white/10"><UserPlus size={24} className="text-emerald-400"/></div>
                                                <span className="font-black text-sm uppercase tracking-[0.15em]">Provision Buyer Portal</span>
                                            </div>
                                            <ArrowRight size={20} className="text-white/40 group-hover:text-white group-hover:translate-x-2 transition-all"/>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};