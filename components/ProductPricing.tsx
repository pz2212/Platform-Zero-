
import React, { useState, useEffect, useRef } from 'react';
import { Product, PricingRule, BusinessCategory, User, InventoryItem, Order } from '../types';
import { mockService } from '../services/mockDataService';
import { SellProductDialog } from './SellProductDialog';
import { 
  Tag, Edit2, Check, X, DollarSign, Percent, MapPin, Calendar, 
  User as UserIcon, Truck, MoreVertical, Trash2, ShoppingBag, 
  Share2, PackagePlus, Heart, LayoutTemplate, Save, ChevronDown, Filter
} from 'lucide-react';

interface ProductPricingProps {
  user: User;
}

const BUSINESS_CATEGORIES: BusinessCategory[] = [
  'Cafe',
  'Restaurant',
  'Pub',
  'Food Manufacturer'
];

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const ProductPricing: React.FC<ProductPricingProps> = ({ user }) => {
  const [products] = useState<Product[]>(mockService.getAllProducts());
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Sell Modal State
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [productToSell, setProductToSell] = useState<Product | null>(null);
  
  // State for the editing modal
  const [rules, setRules] = useState<PricingRule[]>([]);

  // State for Dropdown Menu
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // State for Filtering
  const [activeFilter, setActiveFilter] = useState<string | 'FREQUENT'>('FREQUENT');

  useEffect(() => {
    // Fetch inventory to link specific batch details to products
    const userInventory = mockService.getInventory(user.id).filter(i => i.ownerId === user.id);
    setInventory(userInventory);

    // Click outside listener to close dropdowns
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [user]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    const existingRules = mockService.getPricingRules(user.id, product.id);
    
    // Initialize rules for all categories if they don't exist
    const initializedRules: PricingRule[] = BUSINESS_CATEGORIES.map(category => {
      const existing = existingRules.find(r => r.category === category);
      return existing || {
        id: Math.random().toString(36).substr(2, 9),
        ownerId: user.id,
        productId: product.id,
        category,
        strategy: 'PERCENTAGE_DISCOUNT', // Default strategy
        value: 0,
        isActive: false
      };
    });
    
    setRules(initializedRules);
  };

  const handleSave = () => {
    mockService.savePricingRules(rules);
    setSelectedProduct(null);
  };

  const updateRule = (index: number, updates: Partial<PricingRule>) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], ...updates };
    setRules(newRules);
  };

  const calculatePrice = (basePrice: number, rule: PricingRule) => {
    if (!rule.isActive) return basePrice;
    if (rule.strategy === 'FIXED') return rule.value;
    // Percentage discount
    return basePrice * (1 - rule.value / 100);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Helper to find inventory item for the selected product
  const getProductInventory = (productId: string) => {
    return inventory.find(i => i.productId === productId);
  };

  const toggleMenu = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation(); // Prevent opening the product modal
    setActiveMenuId(activeMenuId === productId ? null : productId);
  };

  const handleMenuAction = (e: React.MouseEvent, action: string, product: Product) => {
    e.stopPropagation();
    setActiveMenuId(null);
    
    switch(action) {
        case 'Edit':
            handleProductClick(product); // Opens the pricing/details modal
            break;
        case 'Delete':
            if(confirm(`Are you sure you want to delete ${product.name} from your catalog?`)) {
                // Mock delete logic
                alert(`${product.name} removed from catalog.`);
            }
            break;
        case 'Sell':
             setProductToSell(product);
             setIsSellModalOpen(true);
             break;
        case 'Share':
             alert(`Sharing link for ${product.name} copied to clipboard.`);
             break;
        case 'AddInventory':
             alert(`${product.name} added to your inventory list.`);
             break;
        case 'Favorite':
             alert(`${product.name} added to favorites.`);
             break;
    }
  };

  const handleSellComplete = (data: any) => {
      // 1. Handle New Customer Creation if needed
      let customerId = data.customer.id;
      let customerName = '';
      
      if (data.customer.isNew) {
          const newCustomer = {
              id: `c-new-${Date.now()}`,
              businessName: data.customer.businessName,
              contactName: data.customer.contactName,
              email: data.customer.email,
              phone: data.customer.mobile,
              category: 'Restaurant',
              connectionStatus: 'Active',
              connectedSupplierName: user.businessName,
              connectedSupplierId: user.id
          };
          // In a real app, we'd add this to DB. Here we mock it or alert.
          customerId = newCustomer.id;
          customerName = newCustomer.businessName;
          // Mock adding to service
          mockService.addMarketplaceCustomer(newCustomer as any);
      } else {
          const existing = mockService.getCustomers().find(c => c.id === customerId);
          customerName = existing?.businessName || 'Customer';
      }

      // 2. Create Order Object
      const status = data.action === 'QUOTE' ? 'Pending' : 'Confirmed';
      
      // We don't have a direct "createOrder" exposed that takes full object in mockService, 
      // but we can simulate it or use createMarketplaceOrder logic.
      // For this demo, we'll use a simulated success alert which is often enough for "Making a Sale" UI demo.
      
      if (data.action === 'QUOTE') {
          alert(`Quote Sent to ${customerName}!\n\nSMS sent to ${data.customer.mobile || 'mobile number'}:\n"Hello ${data.customer.contactName || 'there'}, quote for ${data.quantity}kg of ${data.product.name} is ready. Click here to accept."`);
      } else {
          alert(`Sale Recorded!\n\n${data.quantity}kg of ${data.product.name} sold to ${customerName}.\nInvoice generated.`);
      }
      
      setIsSellModalOpen(false);
      setProductToSell(null);
  };

  // --- Filtering Logic ---
  const getDisplayedProducts = () => {
      if (activeFilter === 'FREQUENT') {
          // Mocking "Frequent" by returning first 8 products for demo
          // In a real app, this would filter by sales count
          return products.slice(0, 8);
      }
      return products.filter(p => p.name.toUpperCase().startsWith(activeFilter));
  };

  const displayedProducts = getDisplayedProducts();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Make a Sale</h1>
          <p className="text-gray-500">Manage your product catalog, view supply chain details, and set customer pricing.</p>
        </div>
      </div>

      {/* ALPHABETICAL FILTER BAR */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-wrap gap-2 items-center justify-center">
             <button
                onClick={() => setActiveFilter('FREQUENT')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeFilter === 'FREQUENT' 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
             >
                Most Frequent
             </button>
             <div className="w-px h-6 bg-gray-200 mx-2 hidden sm:block"></div>
             {ALPHABET.map(letter => {
                 // Check if any products exist for this letter to disable/enable
                 const hasProducts = products.some(p => p.name.toUpperCase().startsWith(letter));
                 
                 return (
                    <button
                        key={letter}
                        onClick={() => hasProducts && setActiveFilter(letter)}
                        disabled={!hasProducts}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                            activeFilter === letter 
                            ? 'bg-emerald-600 text-white shadow-md' 
                            : hasProducts 
                                ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-100' 
                                : 'text-gray-300 cursor-not-allowed bg-gray-50/50'
                        }`}
                    >
                        {letter}
                    </button>
                 );
             })}
          </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
          <Filter size={16} className="text-gray-500"/>
          <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
              {activeFilter === 'FREQUENT' ? 'Most Frequently Used Products' : `Products starting with "${activeFilter}"`}
          </span>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2">
        {displayedProducts.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <ShoppingBag size={48} className="mx-auto mb-3 opacity-20"/>
                <p>No products found for filter "{activeFilter}"</p>
            </div>
        ) : (
            displayedProducts.map(product => {
                const activeRuleCount = mockService.getPricingRules(user.id, product.id).filter(r => r.isActive).length;
                const hasStock = inventory.some(i => i.productId === product.id);
                const isMenuOpen = activeMenuId === product.id;
                
                return (
                <div 
                    key={product.id} 
                    onClick={() => handleProductClick(product)}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible hover:shadow-md transition-all cursor-pointer group relative"
                >
                    {/* 3 Dots Menu Button */}
                    <div className="absolute top-3 right-3 z-20">
                        <button 
                            onClick={(e) => toggleMenu(e, product.id)}
                            className="p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-500 hover:text-gray-900 shadow-sm border border-gray-100 transition-colors"
                        >
                            <MoreVertical size={18} />
                        </button>

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                            <div ref={menuRef} className="absolute right-0 top-8 w-56 bg-white rounded-lg shadow-xl border border-gray-100 z-30 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                                <div className="py-1">
                                    <button 
                                        onClick={(e) => handleMenuAction(e, 'Edit', product)}
                                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <Edit2 size={16} /> Edit
                                    </button>
                                    <button 
                                        onClick={(e) => handleMenuAction(e, 'Delete', product)}
                                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                        <Trash2 size={16} /> Delete
                                    </button>
                                </div>
                                <div className="border-t border-gray-100 py-1">
                                    <button 
                                        onClick={(e) => handleMenuAction(e, 'Sell', product)}
                                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-bold"
                                    >
                                        <ShoppingBag size={16} /> Sell
                                    </button>
                                    <button 
                                        onClick={(e) => handleMenuAction(e, 'Share', product)}
                                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <Share2 size={16} /> Share
                                    </button>
                                </div>
                                <div className="border-t border-gray-100 py-1">
                                    <button 
                                        onClick={(e) => handleMenuAction(e, 'AddInventory', product)}
                                        className="w-full text-left px-4 py-2.5 text-sm text-emerald-600 hover:bg-emerald-50 flex items-center gap-2 font-medium"
                                    >
                                        <PackagePlus size={16} /> Add This to my Inventory
                                    </button>
                                    <button 
                                        onClick={(e) => handleMenuAction(e, 'Favorite', product)}
                                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <Heart size={16} /> Add to favorites
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-5">
                        <div className="flex justify-between items-start mb-2 pr-8">
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg mb-1">{product.name}</h3>
                                <p className="text-sm text-gray-500">{product.variety}</p>
                            </div>
                            {!hasStock && (
                                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-200 uppercase tracking-wide">
                                    No Stock
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                            <span className="text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg text-sm border border-emerald-100">
                                ${product.defaultPricePerKg.toFixed(2)} / kg
                            </span>
                        </div>
                    </div>
                    
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                        <div className="text-xs text-gray-500 font-medium">
                            {activeRuleCount > 0 
                            ? <span className="text-indigo-600 flex items-center gap-1"><Tag size={12}/> {activeRuleCount} active pricing rules</span> 
                            : 'Standard pricing only'}
                        </div>
                        <span className="text-xs text-gray-400 font-medium group-hover:text-indigo-600 transition-colors">Manage Pricing</span>
                    </div>
                </div>
                );
            })
        )}
      </div>

      {/* Product Details & Pricing Configuration Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600">
                     <Tag size={24} /> 
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">{selectedProduct.name} <span className="text-gray-500 font-normal">| {selectedProduct.variety}</span></h2>
                    <p className="text-sm text-gray-500">Managing Details & Pricing</p>
                </div>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              
              {/* SECTION 1: Supply Chain Details */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <Truck size={16}/> Supply Chain Information
                </h3>
                
                {getProductInventory(selectedProduct.id) ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="space-y-1">
                            <span className="text-xs text-slate-500 font-semibold uppercase">Farmer / Source</span>
                            <div className="flex items-start gap-2 text-slate-900 font-medium">
                                <UserIcon size={16} className="mt-0.5 text-slate-400"/>
                                {getProductInventory(selectedProduct.id)?.originalFarmerName || 'Unknown Origin'}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <span className="text-xs text-slate-500 font-semibold uppercase">Harvest Location</span>
                            <div className="flex items-start gap-2 text-slate-900 font-medium">
                                <MapPin size={16} className="mt-0.5 text-slate-400"/>
                                {getProductInventory(selectedProduct.id)?.harvestLocation || 'Not Specified'}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <span className="text-xs text-slate-500 font-semibold uppercase">Date Picked</span>
                            <div className="flex items-start gap-2 text-slate-900 font-medium">
                                <Calendar size={16} className="mt-0.5 text-slate-400"/>
                                {formatDate(getProductInventory(selectedProduct.id)?.harvestDate)}
                            </div>
                        </div>

                         <div className="space-y-1">
                            <span className="text-xs text-slate-500 font-semibold uppercase">Date Received</span>
                            <div className="flex items-start gap-2 text-slate-900 font-medium">
                                <Truck size={16} className="mt-0.5 text-slate-400"/>
                                {formatDate(getProductInventory(selectedProduct.id)?.receivedDate) || 'Direct from Farm'}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-4 text-slate-500 italic">
                        No active stock for this product in your inventory. Supply chain details unavailable.
                    </div>
                )}
              </div>

              {/* SECTION 2: Pricing Configuration */}
              <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Customer Pricing Matrix</h3>
                    <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                        Base Market Price: ${selectedProduct.defaultPricePerKg.toFixed(2)} / kg
                    </div>
                </div>
                
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50">
                        <tr className="border-b border-gray-200">
                        <th className="py-3 px-4 text-sm font-semibold text-gray-600">Business Category</th>
                        <th className="py-3 px-4 text-sm font-semibold text-gray-600 w-24">Enabled</th>
                        <th className="py-3 px-4 text-sm font-semibold text-gray-600">Pricing Strategy</th>
                        <th className="py-3 px-4 text-sm font-semibold text-gray-600">Value</th>
                        <th className="py-3 px-4 text-sm font-semibold text-gray-600 text-right">Final Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rules.map((rule, idx) => (
                        <tr key={rule.category} className={`border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${!rule.isActive ? 'bg-gray-50/50' : ''}`}>
                            <td className="py-4 px-4 font-medium text-gray-800">{rule.category}</td>
                            <td className="py-4 px-4">
                            <button 
                                onClick={() => updateRule(idx, { isActive: !rule.isActive })}
                                className={`w-10 h-6 rounded-full p-1 transition-colors ${rule.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${rule.isActive ? 'translate-x-4' : ''}`} />
                            </button>
                            </td>
                            <td className="py-4 px-4">
                            <div className="flex bg-gray-100 rounded-lg p-1 w-max">
                                <button 
                                disabled={!rule.isActive}
                                onClick={() => updateRule(idx, { strategy: 'FIXED' })}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${rule.strategy === 'FIXED' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                Fixed Price
                                </button>
                                <button 
                                disabled={!rule.isActive}
                                onClick={() => updateRule(idx, { strategy: 'PERCENTAGE_DISCOUNT' })}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${rule.strategy === 'PERCENTAGE_DISCOUNT' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                % Discount
                                </button>
                            </div>
                            </td>
                            <td className="py-4 px-4">
                            <div className="relative max-w-[120px]">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                {rule.strategy === 'FIXED' ? <DollarSign size={14} className="text-gray-400"/> : <Percent size={14} className="text-gray-400"/>}
                                </div>
                                <input
                                type="number"
                                disabled={!rule.isActive}
                                min="0"
                                step={rule.strategy === 'FIXED' ? "0.01" : "1"}
                                value={rule.value}
                                onChange={(e) => updateRule(idx, { value: parseFloat(e.target.value) || 0 })}
                                className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm disabled:bg-gray-100"
                                />
                            </div>
                            </td>
                            <td className="py-4 px-4 text-right font-mono font-medium text-gray-900">
                            ${calculatePrice(selectedProduct.defaultPricePerKg, rule).toFixed(2)}
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 font-medium shadow-sm flex items-center gap-2"
              >
                <Check size={18} />
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SELL MODAL */}
      {isSellModalOpen && productToSell && (
          <SellProductDialog 
              isOpen={isSellModalOpen}
              onClose={() => setIsSellModalOpen(false)}
              product={productToSell}
              onComplete={handleSellComplete}
          />
      )}
    </div>
  );
};
