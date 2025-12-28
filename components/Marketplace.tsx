
import React, { useState, useEffect } from 'react';
import { User, Product, InventoryItem, UserRole } from '../types';
import { mockService } from '../services/mockDataService';
import { ShoppingCart, Search, ChevronDown, Plus, X, Leaf, Minus, CheckCircle, MessageCircle, ArrowRight, DollarSign, UserPlus, LogIn, Store } from 'lucide-react';
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

  const handleConnectRequest = () => {
    if (user) {
        const owner = mockService.getAllUsers().find(u => u.id === sharedItem?.ownerId);
        if (owner) {
            navigate(`/contacts?id=${owner.id}`);
        }
    } else {
        alert("Please sign in or create an account to start a secure chat with this wholesaler.");
        window.location.hash = '#/'; 
    }
  };

  const handlePurchaseNow = () => {
      if (user) {
          alert("Item added to cart! Proceeding to checkout...");
          navigate('/orders');
      } else {
          alert("Please sign in to complete your purchase.");
          window.location.hash = '#/';
      }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 relative pb-20">
        <div className="flex items-center gap-3 mb-2"><ShoppingCart size={28} className="text-gray-900"/><h1 className="text-2xl font-bold text-gray-900">Fresh Marketplace</h1></div>
        <div className="relative w-full md:w-80"><Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Search produce..." className="w-full pl-9 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/></div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => {
                const isAvailable = allInventory.some(i => i.productId === product.id && i.status === 'Available');
                return <ProductCard key={product.id} product={product} onAdd={() => {}} isOutOfStock={!isAvailable} />;
            })}
        </div>

        {showInviteOverlay && sharedProduct && sharedItem && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-500 overflow-y-auto">
                <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:flex-row min-h-[500px] my-8">
                    
                    {/* LEFT IMAGE PANEL */}
                    <div className="w-full md:w-1/2 h-64 md:h-auto relative overflow-hidden bg-slate-100">
                        <img 
                            src={sharedProduct.imageUrl || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=600'} 
                            className="w-full h-full object-cover" 
                            alt={sharedProduct.name}
                        />
                        <div className="absolute top-6 left-6">
                            <span className="bg-[#10B981] text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl">Direct Offer</span>
                        </div>
                    </div>

                    {/* RIGHT CONTENT PANEL */}
                    <div className="w-full md:w-1/2 flex flex-col h-full bg-white">
                        <div className="p-8 md:p-12 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-8">
                                <div className="space-y-1">
                                    <h2 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">{sharedProduct.name}</h2>
                                    <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest">{sharedProduct.variety}</p>
                                </div>
                                <button onClick={() => setShowInviteOverlay(false)} className="text-gray-300 hover:text-red-500 transition-colors bg-gray-50 p-2 rounded-full">
                                    <X size={24}/>
                                </button>
                            </div>

                            <div className="space-y-8 flex-1">
                                {/* WHOLESALER DETAILS */}
                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Wholesaler Details</p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-xl shadow-sm">
                                            {sharedFrom?.charAt(0) || 'P'}
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 text-xl tracking-tight leading-none mb-1">{sharedFrom || 'Verified Partner'}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">In Stock • Verified Quality</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* PRICE DISPLAY */}
                                <div className="flex items-baseline gap-2 pt-2">
                                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Rate</span>
                                    <p className="text-6xl font-black text-[#043003] tracking-tighter">
                                        ${sharedPrice ? parseFloat(sharedPrice).toFixed(2) : sharedProduct.defaultPricePerKg.toFixed(2)}
                                        <span className="text-base text-gray-400 font-bold ml-1 uppercase tracking-widest">/kg</span>
                                    </p>
                                </div>

                                {/* ACTIONS */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                    <button 
                                        onClick={handlePurchaseNow}
                                        className="py-5 bg-[#043003] text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95"
                                    >
                                        <ShoppingCart size={18}/> {user ? 'Purchase Now' : 'Sign in to buy'}
                                    </button>
                                    <button 
                                        onClick={handleConnectRequest}
                                        className="py-5 bg-white border-2 border-slate-900 text-slate-900 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-sm"
                                    >
                                        <MessageCircle size={18}/> Open Chat
                                    </button>
                                </div>

                                {/* GUEST FLOW: LOGIN / SIGNUP FLOOR */}
                                {!user && (
                                    <div className="mt-8 pt-8 border-t border-gray-100 animate-in slide-in-from-bottom-4 duration-700 delay-200">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 text-center">New to Platform Zero?</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <button 
                                                onClick={() => window.location.hash = '#/'}
                                                className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-emerald-50 hover:border-emerald-100 transition-all group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <UserPlus size={20} className="text-emerald-600"/>
                                                    <span className="font-black text-sm text-gray-900">Create Account</span>
                                                </div>
                                                <ArrowRight size={16} className="text-gray-300 group-hover:text-emerald-600 transition-all"/>
                                            </button>
                                            <button 
                                                onClick={() => window.location.hash = '#/'}
                                                className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-indigo-50 hover:border-indigo-100 transition-all group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <LogIn size={20} className="text-indigo-600"/>
                                                    <span className="font-black text-sm text-gray-900">Partner Login</span>
                                                </div>
                                                <ArrowRight size={16} className="text-gray-300 group-hover:text-indigo-600 transition-all"/>
                                            </button>
                                        </div>
                                        <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-6">Secure trading for the fresh food supply chain</p>
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
