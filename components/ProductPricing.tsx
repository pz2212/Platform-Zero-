
import React, { useState, useEffect, useRef } from 'react';
import { Product, PricingRule, User, InventoryItem, ProductUnit } from '../types';
import { mockService } from '../services/mockDataService';
import { SellProductDialog } from './SellProductDialog';
import { ShareModal } from './SellerDashboardV1';
import { 
  Tag, Edit2, Check, X, DollarSign, MapPin, 
  MoreVertical, ShoppingBag, 
  Share2, PackagePlus, CheckCircle, Plus, Camera, Loader2, ChevronRight,
  Box, Hash, Printer, QrCode, Sparkles, ChevronDown
} from 'lucide-react';

interface ProductPricingProps {
  user: User;
}

const UNITS: ProductUnit[] = ['KG', 'Tray', 'Bin', 'Tonne', 'loose'];

const EditPricingModal = ({ isOpen, onClose, product, onComplete }: { 
    isOpen: boolean, 
    onClose: () => void, 
    product: Product | null,
    onComplete: () => void 
}) => {
    const [price, setPrice] = useState<string>('');
    const [unit, setUnit] = useState<ProductUnit>('KG');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (product) {
            setPrice(product.defaultPricePerKg.toString());
            setUnit(product.unit || 'KG');
        }
    }, [product]);

    if (!isOpen || !product) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        mockService.updateProductPricing(product.id, parseFloat(price), unit);
        setTimeout(() => {
            setIsSaving(false);
            onComplete();
            onClose();
        }, 600);
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Edit Master Pricing</h2>
                        <p className="text-xs text-gray-400 font-black uppercase tracking-widest mt-1">{product.name}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2"><X size={24}/></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Base Sale Rate</label>
                            <div className="relative group">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors" size={20}/>
                                <input 
                                    required 
                                    type="number" 
                                    step="0.01"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 font-black text-2xl text-gray-900 transition-all" 
                                    value={price} 
                                    onChange={e => setPrice(e.target.value)} 
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Unit of Measurement</label>
                            <div className="grid grid-cols-3 gap-2">
                                {UNITS.map(u => (
                                    <button
                                        key={u}
                                        type="button"
                                        onClick={() => setUnit(u)}
                                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${unit === u ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400 hover:border-indigo-200'}`}
                                    >
                                        {u}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={isSaving}
                        className="w-full py-5 bg-[#043003] text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-emerald-100 hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={20}/> : <><CheckCircle size={20}/> Update Marketplace Rate</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

const AddInventoryModal = ({ isOpen, onClose, user, products, onComplete, initialProductId }: { 
    isOpen: boolean, 
    onClose: () => void, 
    user: User, 
    products: Product[],
    onComplete: () => void,
    initialProductId?: string
}) => {
    const [image, setImage] = useState<string | null>(null);
    const [productId, setProductId] = useState(initialProductId || '');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState<ProductUnit>('KG');
    const [harvestLocation, setHarvestLocation] = useState('');
    const [warehouseLocation, setWarehouseLocation] = useState('');
    const [farmerName, setFarmerName] = useState('');
    const [price, setPrice] = useState('');
    const [discountPrice, setDiscountPrice] = useState('');
    const [discountAfterDays, setDiscountAfterDays] = useState('3');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [isNewProductMode, setIsNewProductMode] = useState(false);
    const [newProductName, setNewProductName] = useState('');
    const [newProductVariety, setNewProductVariety] = useState('');
    const [newProductCategory, setNewProductCategory] = useState<'Vegetable' | 'Fruit'>('Vegetable');

    const [newLotId, setNewLotId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setProductId(initialProductId || '');
        }
    }, [isOpen, initialProductId]);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => setImage(ev.target?.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if ((!isNewProductMode && !productId) || (isNewProductMode && !newProductName) || !quantity || !price) {
            alert("Please fill in all required fields.");
            return;
        }

        setIsSubmitting(true);
        const lotId = mockService.generateLotId();
        
        let targetProductId = productId;

        if (isNewProductMode) {
            const newProdId = `p-man-${Date.now()}`;
            const newProd: Product = {
                id: newProdId,
                name: newProductName,
                variety: newProductVariety || 'Standard',
                category: newProductCategory,
                imageUrl: image || 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=100&h=100',
                defaultPricePerKg: parseFloat(price),
                co2SavingsPerKg: 0.8
            };
            mockService.addProduct(newProd);
            targetProductId = newProdId;
        }

        const newItem: InventoryItem = {
            id: `inv-${Date.now()}`,
            lotNumber: lotId,
            productId: targetProductId,
            ownerId: user.id,
            quantityKg: parseFloat(quantity),
            unit: unit,
            harvestLocation,
            warehouseLocation,
            originalFarmerName: farmerName,
            status: 'Available',
            harvestDate: new Date().toISOString(),
            uploadedAt: new Date().toISOString(),
            expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            discountAfterDays: parseInt(discountAfterDays),
            discountPricePerKg: discountPrice ? parseFloat(discountPrice) : undefined,
            batchImageUrl: image || undefined
        };

        mockService.addInventoryItem(newItem);
        mockService.updateProductPrice(targetProductId, parseFloat(price));

        setTimeout(() => {
            setIsSubmitting(false);
            setNewLotId(lotId);
            onComplete();
            setIsNewProductMode(false);
            setNewProductName('');
            setNewProductVariety('');
        }, 800);
    };

    if (newLotId) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md p-10 text-center animate-in zoom-in-95 duration-200">
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
                        <CheckCircle size={48} />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">STOCK LOGGED</h2>
                    <p className="text-gray-500 mb-8 font-medium">Physical identification tag generated.</p>
                    
                    <div className="bg-gray-50 border-2 border-gray-100 rounded-[2rem] p-8 mb-8 flex flex-col items-center">
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4">
                            <QrCode size={120} className="text-gray-900" />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Assigned Lot ID</p>
                        <p className="text-2xl font-black text-indigo-600 font-mono tracking-tighter">{newLotId}</p>
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-4 flex items-center gap-1.5">
                            <Box size={12}/> Bin: {warehouseLocation || 'Warehouse General'}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button className="w-full py-5 bg-[#043003] text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-black transition-all">
                            <Printer size={18}/> Print Bin Label
                        </button>
                        <button onClick={() => { setNewLotId(null); onClose(); }} className="w-full py-4 bg-white border-2 border-gray-100 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all">
                            Back to Catalog
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Add New Inventory</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2"><X size={24}/></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Product Batch Photo</label>
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-[2rem] h-72 flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden ${image ? 'border-emerald-500' : 'border-gray-200 hover:border-emerald-400 hover:bg-gray-50'}`}
                            >
                                {image ? (
                                    <img src={image} className="w-full h-full object-cover" alt="Preview"/>
                                ) : (
                                    <div className="text-center p-4">
                                        <div className="bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-inner-sm">
                                            <Camera size={32}/>
                                        </div>
                                        <p className="text-sm font-black text-gray-700 uppercase tracking-tight">Upload Photo</p>
                                        <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase">Snap a photo of the stock</p>
                                    </div>
                                )}
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-2 px-1">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Product</label>
                                    <button 
                                        type="button" 
                                        onClick={() => setIsNewProductMode(!isNewProductMode)}
                                        className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-1"
                                    >
                                        {isNewProductMode ? <><ChevronRight size={12}/> Select Existing</> : <><Plus size={12}/> Create New Product</>}
                                    </button>
                                </div>
                                
                                {isNewProductMode ? (
                                    <div className="space-y-3 animate-in slide-in-from-right-2 duration-300">
                                        <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex items-center gap-3 mb-4">
                                            <Sparkles size={18} className="text-indigo-600 shrink-0"/>
                                            <p className="text-[10px] font-black text-indigo-700 uppercase tracking-tight">You are adding a new product entry to the global catalog.</p>
                                        </div>
                                        <input 
                                            required placeholder="e.g. Heirloom Carrots"
                                            className="w-full p-4 bg-white border-2 border-indigo-100 rounded-2xl text-sm font-black text-gray-900 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"
                                            value={newProductName} onChange={e => setNewProductName(e.target.value)}
                                        />
                                        <div className="grid grid-cols-2 gap-3">
                                            <input 
                                                placeholder="Variety (e.g. Purple)"
                                                className="w-full p-4 bg-white border-2 border-indigo-100 rounded-2xl text-sm font-black text-gray-900 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"
                                                value={newProductVariety} onChange={e => setNewProductVariety(e.target.value)}
                                            />
                                            <select 
                                                className="w-full p-4 bg-white border-2 border-indigo-100 rounded-2xl text-sm font-black text-gray-900 outline-none appearance-none"
                                                value={newProductCategory} onChange={e => setNewProductCategory(e.target.value as any)}
                                            >
                                                <option value="Vegetable">Vegetable</option>
                                                <option value="Fruit">Fruit</option>
                                            </select>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative group">
                                        <select 
                                            required
                                            className="w-full p-4 bg-gray-50 border-2 border-gray-50 rounded-2xl text-sm font-black text-gray-900 outline-none appearance-none focus:bg-white focus:border-emerald-500 transition-all shadow-sm"
                                            value={productId}
                                            onChange={e => setProductId(e.target.value)}
                                        >
                                            <option value="">Choose product...</option>
                                            {products.sort((a,b) => a.name.localeCompare(b.name)).map(p => <option key={p.id} value={p.id}>{p.name} ({p.variety})</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-emerald-500 transition-colors pointer-events-none" size={18}/>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Trade Unit</label>
                                    <div className="relative group">
                                        <select 
                                            className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm font-black text-gray-900 outline-none appearance-none focus:bg-white focus:border-indigo-500 transition-all shadow-sm"
                                            value={unit}
                                            onChange={e => setUnit(e.target.value as ProductUnit)}
                                        >
                                            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18}/>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Quantity ({unit})</label>
                                        <input 
                                            type="number" required placeholder="0"
                                            className="w-full p-4 bg-gray-50 border-2 border-gray-50 rounded-2xl text-lg font-black text-gray-900 outline-none focus:bg-white focus:border-emerald-500 transition-all shadow-sm"
                                            value={quantity} onChange={e => setQuantity(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Price ($/{unit})</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black">$</span>
                                            <input 
                                                type="number" required step="0.01" placeholder="0.00"
                                                className="w-full pl-8 pr-4 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl text-lg font-black text-gray-900 outline-none focus:bg-white focus:border-emerald-500 transition-all shadow-sm"
                                                value={price} onChange={e => setPrice(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-1.5">
                                    <Box size={12} className="text-indigo-500"/> Warehouse Bin / Location
                                </label>
                                <div className="relative">
                                    <input 
                                        type="text" placeholder="e.g. Cold Room A, Rack 2"
                                        className="w-full p-4 bg-gray-50 border-2 border-gray-50 rounded-2xl text-sm font-black text-gray-900 outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-sm"
                                        value={warehouseLocation} onChange={e => setWarehouseLocation(e.target.value)}
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Farmer / Source</label>
                                <div className="relative">
                                    <input 
                                        type="text" placeholder="e.g. Green Valley Farms"
                                        className="w-full p-4 bg-gray-50 border-2 border-gray-50 rounded-2xl text-sm font-black text-gray-900 outline-none focus:bg-white focus:border-emerald-500 transition-all shadow-sm"
                                        value={farmerName} onChange={e => setFarmerName(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-emerald-50/50 p-8 rounded-[2rem] border border-emerald-100/50 space-y-6">
                        <div className="flex items-center gap-2 text-emerald-700 font-black text-xs uppercase tracking-[0.2em]">
                            <Tag size={18}/> Automatic Discount Rules
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Discount Price ($/{unit})</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-xs">$</span>
                                    <input 
                                        type="number" step="0.01" placeholder="e.g. 3.50"
                                        className="w-full pl-8 pr-4 py-3 bg-white border-2 border-emerald-100/50 rounded-xl text-sm font-black text-gray-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"
                                        value={discountPrice} onChange={e => setDiscountPrice(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Active After (Days)</label>
                                <input 
                                    type="number" placeholder="3"
                                    className="w-full p-3 bg-white border-2 border-emerald-100/50 rounded-xl text-sm font-black text-gray-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"
                                    value={discountAfterDays} onChange={e => setDiscountAfterDays(e.target.value)}
                                />
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-emerald-600/80 italic text-center">Help reduce waste by automatically lowering the price as expiry approaches.</p>
                    </div>

                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-5 bg-[#043003] text-white rounded-full font-black uppercase tracking-[0.25em] text-xs shadow-2xl shadow-emerald-900/20 hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98]"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <><PackagePlus size={20}/> Add stock to catalog</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export const ProductPricing: React.FC<ProductPricingProps> = ({ user }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isAddInvModalOpen, setIsAddInvModalOpen] = useState(false);
  const [isEditPricingModalOpen, setIsEditPricingModalOpen] = useState(false);
  
  const [productToSell, setProductToSell] = useState<Product | null>(null);
  const [itemToSell, setItemToSell] = useState<InventoryItem | null>(null);
  
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [itemToShare, setItemToShare] = useState<InventoryItem | null>(null);

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | 'FREQUENT'>('FREQUENT');
  
  const [verificationMode, setVerificationMode] = useState<Record<string, 'initial' | 'edit' | 'verified'>>({});
  const [verificationPrices, setVerificationPrices] = useState<Record<string, number>>({});

  const [productId, setProductId] = useState<string>('');

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setActiveMenuId(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [user]);

  const fetchData = () => {
      setProducts(mockService.getAllProducts());
      setInventory(mockService.getInventory(user.id));
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsEditPricingModalOpen(true);
  };

  const toggleMenu = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === productId ? null : productId);
  };

  const handleMenuAction = (e: React.MouseEvent, action: string, product: Product) => {
    e.stopPropagation();
    setActiveMenuId(null);
    const item = inventory.find(i => i.productId === product.id && i.status === 'Available');
    if (!item && (action === 'Sell' || action === 'Share')) {
        alert("No stock lot found for this product.");
        return;
    }
    switch(action) {
        case 'Edit': handleProductClick(product); break;
        case 'Sell': 
            setItemToSell(item!); 
            setProductToSell(product); 
            setIsSellModalOpen(true); 
            break;
        case 'Share': 
            setItemToShare(item!); 
            setIsShareModalOpen(true); 
            break;
    }
  };

  const handleSellComplete = (data: any) => {
    if (!itemToSell) return;
    mockService.createInstantOrder(data.customer.id, itemToSell, data.quantity, data.pricePerKg);
    alert(`Sale Recorded!`);
    setIsSellModalOpen(false);
  };

  const handleVerifyPrice = (invId: string, changed: boolean, currentPrice: number) => {
      if (changed) {
          setVerificationMode(prev => ({ ...prev, [invId]: 'edit' }));
          setVerificationPrices(prev => ({ ...prev, [invId]: currentPrice }));
      } else {
          mockService.verifyPrice(invId);
          fetchData();
          setVerificationMode(prev => ({ ...prev, [invId]: 'verified' }));
      }
  };

  const handleSubmitPriceChange = (invId: string) => {
      mockService.verifyPrice(invId, verificationPrices[invId]);
      fetchData();
      setVerificationMode(prev => ({ ...prev, [invId]: 'verified' }));
  };

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const displayedProducts = activeFilter === 'FREQUENT' 
    ? products.slice(0, 12) 
    : products.filter(p => p.name.toUpperCase().startsWith(activeFilter));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory & Price</h1>
          <p className="text-gray-500">Physical bin tracking and marketplace pricing control.</p>
        </div>
        <button 
            onClick={() => setIsAddInvModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#043003] text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-black transition-all hover:scale-105"
        >
            <Plus size={18}/> Add New Batch
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 overflow-x-auto no-scrollbar">
          <div className="flex flex-wrap gap-2 min-max">
             <button onClick={() => setActiveFilter('FREQUENT')} className={`px-4 py-2 rounded-lg text-sm font-bold ${activeFilter === 'FREQUENT' ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>Frequent</button>
             {alphabet.map(l => (
                <button key={l} onClick={() => setActiveFilter(l)} className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${activeFilter === l ? 'bg-emerald-600 text-white shadow-md' : 'bg-white border border-gray-100 text-gray-400 hover:border-emerald-200 hover:text-emerald-600'}`}>{l}</button>
             ))}
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedProducts.map(product => {
            const myInv = inventory.find(i => i.productId === product.id && i.status === 'Available');
            const hasStock = !!myInv;
            const isVerifiedToday = myInv?.lastPriceVerifiedDate === new Date().toLocaleDateString();
            const mode = verificationMode[myInv?.id || ''] || (isVerifiedToday ? 'verified' : 'initial');
            
            return (
            <div key={product.id} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden group relative flex flex-col hover:shadow-xl transition-all">
                <div className="absolute top-4 right-4 z-20">
                    <button onClick={(e) => toggleMenu(e, product.id)} className="p-2 rounded-full bg-white/90 backdrop-blur shadow border text-gray-500 hover:text-gray-900 transition-colors">
                        <MoreVertical size={18} />
                    </button>
                    {activeMenuId === product.id && (
                        <div ref={menuRef} className="absolute right-0 top-10 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 z-30 overflow-hidden py-1 animate-in zoom-in-95">
                            <button onClick={(e) => handleMenuAction(e, 'Edit', product)} className="w-full text-left px-5 py-3.5 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-3"><Edit2 size={16} className="text-indigo-600" /> Master Pricing</button>
                            <button onClick={(e) => handleMenuAction(e, 'Share', product)} className="w-full text-left px-5 py-3.5 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-3"><Share2 size={16} className="text-blue-600" /> Send Quote Link</button>
                            <div className="h-px bg-gray-50 mx-2"></div>
                            <button onClick={(e) => handleMenuAction(e, 'Sell', product)} className="w-full text-left px-5 py-3.5 text-sm font-black text-emerald-600 hover:bg-emerald-50 flex items-center gap-3 uppercase tracking-widest"><ShoppingBag size={16} /> Instant Sale</button>
                        </div>
                    )}
                </div>

                <div className="relative h-48 w-full bg-gray-100 border-b border-gray-100 overflow-hidden">
                    <img src={myInv?.batchImageUrl || product.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt=""/>
                    {hasStock && (
                        <div className="absolute bottom-4 left-4 bg-indigo-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl border border-white/20 flex items-center gap-2">
                            <Hash size={12}/> {myInv.lotNumber}
                        </div>
                    )}
                </div>
                
                <div className="p-6 flex-1">
                    <div className="mb-4">
                        <div className="flex justify-between items-start">
                            <h3 className="font-black text-gray-900 text-xl tracking-tight leading-tight">{product.name}</h3>
                            <span className="text-emerald-600 font-black text-lg tracking-tighter">${product.defaultPricePerKg.toFixed(2)}<span className="text-xs text-gray-400 font-bold ml-0.5">/kg</span></span>
                        </div>
                        {hasStock && (
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 flex items-center gap-1.5">
                                <Box size={12} className="text-indigo-400"/> Location: <span className="text-indigo-600">{myInv.warehouseLocation || 'General Stock'}</span>
                            </p>
                        )}
                    </div>

                    {hasStock ? (
                        <div className="mt-4 pt-4 border-t border-gray-50">
                            {mode === 'verified' ? (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-black uppercase bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
                                        <CheckCircle size={16}/> Price Verified
                                    </div>
                                    <button onClick={() => setVerificationMode({...verificationMode, [myInv.id]: 'edit'})} className="p-2 text-gray-300 hover:text-indigo-600 transition-colors"><Edit2 size={16}/></button>
                                </div>
                            ) : mode === 'edit' ? (
                                <div className="flex gap-2">
                                    <input 
                                        type="number" step="0.01" className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-black text-gray-900 outline-none"
                                        value={verificationPrices[myInv.id]} onChange={e => setVerificationPrices({...verificationPrices, [myInv.id]: parseFloat(e.target.value)})}
                                    />
                                    <button onClick={() => handleSubmitPriceChange(myInv.id)} className="bg-indigo-600 text-white px-4 rounded-xl text-xs font-black uppercase">Save</button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Verify market price for today?</p>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleVerifyPrice(myInv.id, true, product.defaultPricePerKg)} className="flex-1 py-2.5 bg-white border border-gray-200 rounded-xl text-[10px] font-black text-gray-500 uppercase tracking-widest">Changed</button>
                                        <button onClick={() => handleVerifyPrice(myInv.id, false, product.defaultPricePerKg)} className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Correct</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button onClick={() => { setProductId(product.id); setIsAddInvModalOpen(true); }} className="w-full mt-4 py-3 bg-gray-50 border-2 border-dashed border-gray-200 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white hover:border-emerald-300 hover:text-emerald-600 transition-all">
                            <PackagePlus size={16}/> Record Stock
                        </button>
                    )}
                </div>
                <div onClick={() => handleProductClick(product)} className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center group/footer cursor-pointer">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover/footer:text-indigo-600 transition-colors">Category Rules</span>
                    <ChevronRight size={14} className="text-gray-300 group-hover/footer:text-indigo-600 group-hover/footer:translate-x-1 transition-all"/>
                </div>
            </div>
            );
        })}
      </div>

      <AddInventoryModal 
        isOpen={isAddInvModalOpen} 
        onClose={() => { setIsAddInvModalOpen(false); setProductId(''); }} 
        user={user} 
        products={products} 
        onComplete={fetchData} 
        initialProductId={productId}
      />
      {isSellModalOpen && productToSell && <SellProductDialog isOpen={isSellModalOpen} onClose={() => setIsSellModalOpen(false)} product={productToSell} onComplete={handleSellComplete} />}
      {isShareModalOpen && itemToShare && <ShareModal item={itemToShare} onClose={() => setIsShareModalOpen(false)} onComplete={() => setIsShareModalOpen(false)} currentUser={user} />}
      <EditPricingModal isOpen={isEditPricingModalOpen} onClose={() => { setIsEditPricingModalOpen(false); setSelectedProduct(null); }} product={selectedProduct} onComplete={fetchData} />
    </div>
  );
};
