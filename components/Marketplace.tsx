
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { User, Product, InventoryItem, UserRole } from '../types';
import { mockService } from '../services/mockDataService';
import { generateSeasonalCatalog, SeasonalProduct } from '../services/geminiService';
import { ProductPricing } from './ProductPricing';
import { ShoppingCart, Search, ChevronDown, Plus, Package, Edit2, Trash2, X, Image as ImageIcon, Tag, DollarSign, Upload, LayoutGrid, Leaf, Minus, Loader2, Calendar, Clock, User as UserIcon, CreditCard, FileText, ShieldCheck, CheckCircle, ArrowRight, PartyPopper, Truck, Sparkles, Check, MessageCircle, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface MarketplaceProps {
  user: User | null;
}

interface ProductCardProps {
    product: Product;
    supplierName: string;
    onAdd: (qty: number) => void;
    isOutOfStock: boolean;
    cartQty: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, supplierName, onAdd, isOutOfStock, cartQty }) => {
    const [qty, setQty] = useState(1);

    const co2Savings = product.co2SavingsPerKg !== undefined 
        ? product.co2SavingsPerKg.toFixed(2) 
        : (product.name.length * 0.05 + 0.1).toFixed(1);

    return (
        <div className={`bg-white rounded-xl border border-gray-200 p-6 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow relative ${isOutOfStock ? 'opacity-75' : ''}`}>
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl text-gray-900 font-bold leading-tight">{product.name}</h3>
                {isOutOfStock && (
                    <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded border border-red-100 uppercase tracking-wider whitespace-nowrap ml-2">
                        Out of Stock
                    </span>
                )}
            </div>

            <div className="text-xs space-y-1 mb-3">
                <p className="text-gray-500"><span className="text-gray-400">Category:</span> {product.category}</p>
                <p className="text-gray-500"><span className="text-gray-400">Variety:</span> {product.variety}</p>
            </div>

            <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold mb-6">
                <Leaf size={12} className="fill-current" />
                <span>Saves {co2Savings}kg CO2/kg</span>
            </div>

            <div className="mt-auto space-y-3">
                <div className="flex gap-3 h-10">
                    <div className="w-24 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between px-3 text-sm text-gray-600 font-medium">
                        <span>kg</span>
                        <ChevronDown size={14} className="text-gray-400"/>
                    </div>
                    <div className="flex-1 flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden">
                        <button 
                            onClick={() => setQty(Math.max(1, qty - 1))} 
                            disabled={isOutOfStock}
                            className="px-3 h-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            <Minus size={14}/>
                        </button>
                        <input 
                            className="flex-1 text-center font-bold text-sm outline-none w-full h-full bg-transparent text-gray-900" 
                            value={qty} 
                            readOnly 
                        />
                        <button 
                            onClick={() => setQty(qty + 1)} 
                            disabled={isOutOfStock}
                            className="px-3 h-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            <Plus size={14}/>
                        </button>
                    </div>
                </div>

                <button
                    onClick={() => { onAdd(qty); setQty(1); }}
                    disabled={isOutOfStock}
                    className={`w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                        isOutOfStock
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-[#043003] text-white hover:bg-[#064004] shadow-sm'
                    }`}
                >
                    {isOutOfStock ? 'Out of Stock' : (
                        <>
                            <Plus size={16} /> Add {qty}kg to Cart
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export const Marketplace: React.FC<MarketplaceProps> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  // Shared Link Params
  const sharedItemId = queryParams.get('item');
  const sharedFrom = queryParams.get('from');

  const [sharedItem, setSharedItem] = useState<InventoryItem | null>(null);
  const [sharedProduct, setSharedProduct] = useState<Product | null>(null);
  const [showInviteOverlay, setShowInviteOverlay] = useState(false);

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
        // Logged in: Add to cart automatically if it's a specific product link
        if (sharedProduct) {
            addToCart(sharedProduct, 1);
        }
        
        // Go to chat directory
        const owner = mockService.getAllUsers().find(u => u.id === sharedItem?.ownerId);
        if (owner) {
            navigate(`/contacts?id=${owner.id}`);
        }
    } else {
        // Not logged in: Show auth modal
        alert("Welcome! Please sign in or create an account to connect with this supplier and start trading.");
        // Reload to trigger auth flow on landing
        window.location.hash = '#/'; 
    }
  };

  if (user?.role === UserRole.ADMIN) {
      const [allProducts, setAllProducts] = useState<Product[]>([]);
      const [isAddModalOpen, setIsAddModalOpen] = useState(false);
      const [isAnalyzing, setIsAnalyzing] = useState(false);
      const [isGenerating, setIsGenerating] = useState(false);
      const [aiSuggestedProducts, setAiSuggestedProducts] = useState<SeasonalProduct[]>([]);
      const [showAiPreview, setShowAiPreview] = useState(false);
      const [newProduct, setNewProduct] = useState<Partial<Product>>({ name: '', category: 'Vegetable', variety: '', defaultPricePerKg: 0, imageUrl: '' });

      useEffect(() => { refreshList(); }, []);
      const refreshList = () => { setAllProducts(mockService.getAllProducts().sort((a, b) => a.name.localeCompare(b.name))); };

      const handleAddProduct = async (e: React.FormEvent) => {
          e.preventDefault();
          if (newProduct.name) {
              setIsAnalyzing(true);
              let co2Val = 0.5;
              try {
                  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                  const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: `Calculate CO2e avoidance for 1kg of ${newProduct.name}. Return ONLY number.` });
                  const match = response.text?.match(/[\d\.]+/);
                  co2Val = match ? parseFloat(match[0]) : 0.5;
              } catch (e) {}
              mockService.addProduct({ id: `p-${Date.now()}`, name: newProduct.name!, category: newProduct.category as any, variety: newProduct.variety || 'Standard', defaultPricePerKg: 0, imageUrl: '', co2SavingsPerKg: co2Val });
              refreshList(); setIsAnalyzing(false); setIsAddModalOpen(false); setNewProduct({ name: '', category: 'Vegetable', variety: '', defaultPricePerKg: 0, imageUrl: '' });
          }
      };

      const handleGenerateAiCatalog = async () => {
          setIsGenerating(true);
          try {
              const seasonal = await generateSeasonalCatalog();
              const existingNames = allProducts.map(p => p.name.toLowerCase());
              setAiSuggestedProducts(seasonal.filter(s => !existingNames.includes(s.name.toLowerCase())));
              setShowAiPreview(true);
          } catch (e) { alert("Failed to generate AI catalog."); } finally { setIsGenerating(false); }
      };

      const handleBulkAdd = () => {
          aiSuggestedProducts.forEach(s => { mockService.addProduct({ id: `p-ai-${Math.random().toString(36).substr(2, 9)}`, name: s.name, category: s.category, variety: s.variety, defaultPricePerKg: 0, imageUrl: '', co2SavingsPerKg: s.co2Savings }); });
          refreshList(); setShowAiPreview(false); setAiSuggestedProducts([]);
      };

      return (
          <div className="space-y-8 pb-20">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div><h1 className="text-3xl font-black text-gray-900 tracking-tight">Marketplace Catalog</h1><p className="text-gray-500 font-medium">Manage global products visible to all wholesalers and buyers.</p></div>
                  <div className="flex gap-3">
                    <button onClick={handleGenerateAiCatalog} disabled={isGenerating} className="bg-emerald-50 text-emerald-700 px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-emerald-100 border-2 border-emerald-100 transition-all shadow-sm disabled:opacity-50">{isGenerating ? <Loader2 size={16} className="animate-spin"/> : <Sparkles size={16} className="text-emerald-500"/>}Generate Seasonal Catalog</button>
                    <button onClick={() => setIsAddModalOpen(true)} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-indigo-700 shadow-md"><Plus size={18}/> Add New Product</button>
                  </div>
              </div>
              {showAiPreview && aiSuggestedProducts.length > 0 && (
                  <div className="bg-emerald-900 text-white rounded-[2rem] p-10 shadow-2xl animate-in slide-in-from-top-4 duration-500 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transform scale-150 rotate-12"><Sparkles size={200}/></div>
                      <div className="relative z-10"><div className="flex justify-between items-start mb-8"><div><h2 className="text-2xl font-black tracking-tight mb-2 flex items-center gap-3"><Sparkles className="text-emerald-400" size={32}/> AI Seasonal Discovery</h2><p className="text-emerald-200 font-medium max-w-lg">We found {aiSuggestedProducts.length} seasonal items for your catalog.</p></div><button onClick={() => setShowAiPreview(false)} className="text-emerald-400 hover:text-white p-2"><X size={24}/></button></div><div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">{aiSuggestedProducts.slice(0, 10).map((p, idx) => (<div key={idx} className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-2xl flex flex-col justify-between h-24"><p className="font-black text-sm text-white truncate">{p.name}</p><div className="flex justify-between items-end"><span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{p.category}</span><div className="flex items-center gap-1 text-[10px] font-bold text-white/60"><Leaf size={10}/> {p.co2Savings}</div></div></div>))}</div><div className="flex items-center gap-4"><button onClick={handleBulkAdd} className="px-10 py-4 bg-emerald-400 text-emerald-950 font-black rounded-2xl uppercase tracking-[0.2em] text-xs shadow-xl hover:bg-white transition-all">Bulk Add Items</button></div></div></div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {allProducts.map(product => (
                      <div key={product.id} className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full justify-between animate-in zoom-in-95 duration-200"><div className="mb-6"><div className="flex justify-between items-start mb-2"><h3 className="font-black text-gray-900 text-2xl tracking-tight leading-none mb-2">{product.name}</h3><span className="text-[10px] font-black bg-gray-100 text-gray-400 px-2 py-1 rounded-lg uppercase tracking-widest border border-gray-50">{product.category}</span></div><p className="text-sm font-bold text-indigo-600 uppercase tracking-widest opacity-60 mb-4">{product.variety}</p></div><div className="pt-6 mt-auto border-t border-gray-50 flex justify-between items-center"><span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Active ID: {product.id.split('-').pop()}</span><button onClick={() => mockService.deleteProduct(product.id)} className="text-gray-300 hover:text-red-500 flex items-center gap-1.5 text-xs font-black uppercase tracking-widest transition-all p-2 rounded-xl hover:bg-red-50"><Trash2 size={16}/> Remove</button></div></div>
                  ))}
                  <button onClick={() => setIsAddModalOpen(true)} className="border-4 border-dashed border-gray-100 rounded-[2rem] flex flex-col items-center justify-center h-full min-h-[220px] hover:bg-gray-50 hover:border-indigo-200 transition-all group p-10"><div className="bg-white p-5 rounded-3xl shadow-lg mb-4 group-hover:scale-110 transition-transform border border-gray-100"><Plus size={32} className="text-gray-300 group-hover:text-indigo-600"/></div><span className="font-black text-gray-400 uppercase tracking-[0.2em] text-xs group-hover:text-indigo-600">Manual Entry</span></button>
              </div>
          </div>
      );
  }

  if (user?.role === UserRole.WHOLESALER || user?.role === UserRole.FARMER) return <ProductPricing user={user} />;

  // BUYER / PUBLIC VIEW
  const [products, setProducts] = useState<Product[]>([]);
  const [allInventory, setAllInventory] = useState<InventoryItem[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    setProducts(mockService.getAllProducts().sort((a, b) => a.name.localeCompare(b.name)));
    setAllInventory(mockService.getAllInventory());
  }, []);

  const addToCart = (product: Product, qty: number) => {
    if (!user) {
        alert("Please sign in to add items to your cart.");
        window.location.hash = '#/';
        return;
    }
    setCart(prev => ({ ...prev, [product.id]: (prev[product.id] || 0) + qty }));
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 relative pb-20">
        <div className="flex items-center gap-3 mb-2"><ShoppingCart size={28} className="text-gray-900"/><h1 className="text-2xl font-bold text-gray-900">Fresh Marketplace</h1></div>

        <div className="relative w-full md:w-80"><Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Search produce..." className="w-full pl-9 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/></div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => {
                const isAvailable = allInventory.some(i => i.productId === product.id && i.status === 'Available');
                return <ProductCard key={product.id} product={product} supplierName="Partner Network" onAdd={(qty) => addToCart(product, qty)} isOutOfStock={!isAvailable} cartQty={cart[product.id] || 0} />;
            })}
        </div>

        {/* --- SHARED PRODUCT INVITATION OVERLAY --- */}
        {showInviteOverlay && sharedProduct && sharedItem && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-in fade-in duration-500">
                <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:flex-row h-[550px] md:h-[450px]">
                    
                    {/* Image Section */}
                    <div className="w-full md:w-1/2 h-48 md:h-full relative overflow-hidden bg-slate-100">
                        <img 
                            src={sharedProduct.imageUrl || 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?auto=format&fit=crop&q=80&w=400'} 
                            className="w-full h-full object-cover" 
                            alt={sharedProduct.name}
                        />
                        <div className="absolute top-4 left-4">
                            <span className="bg-[#043003] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">New Offer</span>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black text-gray-900 tracking-tighter leading-none">{sharedProduct.name}</h2>
                                <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest">{sharedProduct.variety}</p>
                            </div>
                            <button onClick={() => setShowInviteOverlay(false)} className="text-gray-300 hover:text-red-500 transition-colors">
                                <X size={24}/>
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Invitation From</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs">
                                        {sharedFrom?.charAt(0) || 'P'}
                                    </div>
                                    <p className="font-black text-gray-900 text-lg tracking-tight">{sharedFrom || 'Verified Partner'}</p>
                                </div>
                            </div>

                            <div className="flex items-baseline gap-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rate:</span>
                                <p className="text-4xl font-black text-[#043003] tracking-tighter">${sharedProduct.defaultPricePerKg.toFixed(2)}<span className="text-sm text-gray-400 font-bold ml-1">/kg</span></p>
                            </div>
                        </div>

                        <div className="space-y-3 pt-6">
                            <p className="text-xs text-slate-500 font-medium leading-relaxed italic text-center">
                                "{sharedFrom || 'This partner'} would like to connect and chat with you regarding this listing."
                            </p>
                            
                            <div className="flex flex-col gap-2">
                                <button 
                                    onClick={handleConnectRequest}
                                    className="w-full py-4 bg-[#043003] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2 active:scale-95"
                                >
                                    <MessageCircle size={18}/>
                                    {user ? 'Connect & Chat' : 'Sign In to Connect'}
                                </button>
                                {!user && (
                                    <button 
                                        onClick={() => setShowInviteOverlay(false)}
                                        className="w-full py-3 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors"
                                    >
                                        Browse marketplace first
                                    </button>
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
