
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { User, Product, InventoryItem, UserRole } from '../types';
import { mockService } from '../services/mockDataService';
import { ProductPricing } from './ProductPricing';
import { ShoppingCart, Search, ChevronDown, Plus, Package, Edit2, Trash2, X, Image as ImageIcon, Tag, DollarSign, Upload, LayoutGrid, Leaf, Minus, Loader2, Calendar, Clock, User as UserIcon, CreditCard, FileText, ShieldCheck, CheckCircle } from 'lucide-react';

interface MarketplaceProps {
  user: User;
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

    // Use stored CO2 savings if available, otherwise mock based on name length for legacy data
    const co2Savings = product.co2SavingsPerKg !== undefined 
        ? product.co2SavingsPerKg.toFixed(2) 
        : (product.name.length * 0.05 + 0.1).toFixed(1);

    return (
        <div className={`bg-white rounded-xl border border-gray-200 p-6 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow relative ${isOutOfStock ? 'opacity-75' : ''}`}>
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl text-gray-900 font-bold leading-tight">{product.name}</h3>
                {isOutOfStock && (
                    <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded border border-red-100 uppercase tracking-wider whitespace-nowrap ml-2">
                        Out of Stock
                    </span>
                )}
            </div>

            {/* Meta Info */}
            <div className="text-xs space-y-1 mb-3">
                <p className="text-gray-500"><span className="text-gray-400">Category:</span> {product.category}</p>
                <p className="text-gray-500"><span className="text-gray-400">Variety:</span> {product.variety}</p>
            </div>

            {/* CO2 Badge */}
            <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold mb-6">
                <Leaf size={12} className="fill-current" />
                <span>Saves {co2Savings}kg CO2/kg</span>
            </div>

            {/* Actions */}
            <div className="mt-auto space-y-3">
                {/* Quantity Selector Row */}
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

                {/* Add Button */}
                <button
                    onClick={() => { onAdd(qty); setQty(1); }}
                    disabled={isOutOfStock}
                    className={`w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                        isOutOfStock
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-[#043003] text-white hover:bg-[#064004] shadow-sm' // Dark forest green matching screenshot
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
  // --- ADMIN VIEW: PRODUCT CATALOG MANAGEMENT ---
  if (user.role === UserRole.ADMIN) {
      const [allProducts, setAllProducts] = useState<Product[]>([]);
      const [isAddModalOpen, setIsAddModalOpen] = useState(false);
      const [isAnalyzing, setIsAnalyzing] = useState(false);
      const [newProduct, setNewProduct] = useState<Partial<Product>>({
          name: '',
          category: 'Vegetable',
          variety: '',
          defaultPricePerKg: 0,
          imageUrl: ''
      });

      useEffect(() => {
          // Load and sort alphabetically
          const products = mockService.getAllProducts().sort((a, b) => a.name.localeCompare(b.name));
          setAllProducts(products);
      }, []);

      const handleAddProduct = async (e: React.FormEvent) => {
          e.preventDefault();
          if (newProduct.name) {
              setIsAnalyzing(true);
              let co2Val = 0;
              
              try {
                  // Initialize AI to calculate sustainability metrics
                  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                  const prompt = `Calculate the sustainability impact of preventing 1kg of ${newProduct.name} (${newProduct.category}) from going to landfill. 
                  Focus on Carbon Dioxide Equivalent (CO2e) emissions avoided.
                  Return ONLY the numerical value in kg CO2e (e.g. 1.25). Do not include units or text.`;
                  
                  const response = await ai.models.generateContent({
                      model: 'gemini-2.5-flash',
                      contents: prompt
                  });
                  
                  const text = response.text || "";
                  const match = text.match(/[\d\.]+/);
                  if (match) {
                      co2Val = parseFloat(match[0]);
                  } else {
                      co2Val = 0.5; // Default fallback if parsing fails
                  }
              } catch (error) {
                  console.error("AI Impact Calculation Failed:", error);
                  co2Val = 0.5; // Default fallback if API fails
              }

              const newId = `p-${Date.now()}`;
              // Price is determined by backend/supplier logic, default to 0 here
              const price = 0; 

              const product: Product = {
                  id: newId,
                  name: newProduct.name!,
                  category: newProduct.category as any,
                  variety: newProduct.variety || 'Standard',
                  defaultPricePerKg: price, 
                  imageUrl: '', 
                  co2SavingsPerKg: co2Val // Store the AI calculated metric
              };
              
              mockService.addProduct(product);

              // AUTOMATICALLY ADD STOCK SO CONSUMERS CAN BUY IT
              mockService.addInventoryItem({
                  id: `i-${Date.now()}`,
                  productId: newId,
                  ownerId: 'u2', // Assign to 'Fresh Wholesalers' automatically for demo
                  quantityKg: 500, // Default 500kg stock
                  expiryDate: new Date(Date.now() + 86400000 * 14).toISOString(), // 2 weeks expiry
                  harvestDate: new Date().toISOString(),
                  status: 'Available',
                  originalFarmerName: 'Partner Network'
              });

              // Refresh list with sort
              setAllProducts(mockService.getAllProducts().sort((a, b) => a.name.localeCompare(b.name)));
              setIsAnalyzing(false);
              setIsAddModalOpen(false);
              setNewProduct({ name: '', category: 'Vegetable', variety: '', defaultPricePerKg: 0, imageUrl: '' });
              alert(`Product added! AI calculated sustainability impact: ${co2Val} kg CO2e per kg.`);
          }
      };

      const handleDeleteProduct = (id: string) => {
          if(confirm('Delete this product from the global catalog?')) {
              mockService.deleteProduct(id);
              // Refresh list with sort
              setAllProducts(mockService.getAllProducts().sort((a, b) => a.name.localeCompare(b.name)));
          }
      }

      return (
          <div className="space-y-8">
              <div className="flex justify-between items-center">
                  <div>
                      <h1 className="text-2xl font-bold text-gray-900">Marketplace Catalog</h1>
                      <p className="text-gray-500">Manage global products visible to all wholesalers and buyers.</p>
                  </div>
                  <button 
                      onClick={() => setIsAddModalOpen(true)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-sm"
                  >
                      <Plus size={18}/> Add New Product
                  </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {allProducts.map(product => (
                      <div key={product.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full justify-between">
                          <div className="mb-4">
                              <div className="flex justify-between items-start mb-2">
                                  <h3 className="font-bold text-gray-900 text-lg leading-tight">{product.name}</h3>
                                  <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded uppercase tracking-wide">{product.category}</span>
                              </div>
                              <p className="text-sm text-gray-500">{product.variety}</p>
                              {product.co2SavingsPerKg !== undefined && (
                                  <div className="mt-2 flex items-center gap-1 text-emerald-600 text-xs font-bold">
                                      <Leaf size={10} /> {product.co2SavingsPerKg.toFixed(2)} kg CO2e / kg
                                  </div>
                              )}
                          </div>
                          
                          <div className="pt-4 mt-auto border-t border-gray-100 flex justify-end">
                              <button 
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-gray-400 hover:text-red-500 flex items-center gap-1.5 text-sm font-medium transition-colors"
                              >
                                  <Trash2 size={16}/> Delete
                              </button>
                          </div>
                      </div>
                  ))}
                  
                  {/* Empty State Card to Add */}
                  <button 
                      onClick={() => setIsAddModalOpen(true)}
                      className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center h-full min-h-[180px] hover:bg-gray-50 hover:border-indigo-300 transition-all group"
                  >
                      <div className="bg-white p-3 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                          <Plus size={24} className="text-gray-400 group-hover:text-indigo-600"/>
                      </div>
                      <span className="font-bold text-gray-500 group-hover:text-indigo-600">Add Product</span>
                  </button>
              </div>

              {/* Add Product Modal */}
              {isAddModalOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                              <h2 className="text-xl font-bold text-gray-900">Add New Product</h2>
                              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                          </div>
                          <form onSubmit={handleAddProduct} className="p-6 space-y-4">
                              <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-1">Product Name</label>
                                  <input 
                                      required
                                      type="text" 
                                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                      placeholder="e.g. Romanesco Broccoli"
                                      value={newProduct.name}
                                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                                  />
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                                      <div className="relative">
                                          <LayoutGrid size={16} className="absolute left-3 top-3 text-gray-400"/>
                                          <select 
                                              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 outline-none bg-white"
                                              value={newProduct.category}
                                              onChange={(e) => setNewProduct({...newProduct, category: e.target.value as any})}
                                          >
                                              <option value="Vegetable">Vegetable</option>
                                              <option value="Fruit">Fruit</option>
                                          </select>
                                      </div>
                                  </div>
                                  <div>
                                      <label className="block text-sm font-bold text-gray-700 mb-1">Variety</label>
                                      <div className="relative">
                                          <Tag size={16} className="absolute left-3 top-3 text-gray-400"/>
                                          <input 
                                              type="text" 
                                              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 outline-none"
                                              placeholder="e.g. Green"
                                              value={newProduct.variety}
                                              onChange={(e) => setNewProduct({...newProduct, variety: e.target.value})}
                                          />
                                      </div>
                                  </div>
                              </div>

                              <div className="pt-4 flex justify-end gap-3">
                                  <button 
                                      type="button" 
                                      onClick={() => setIsAddModalOpen(false)}
                                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                                  >
                                      Cancel
                                  </button>
                                  <button 
                                      type="submit"
                                      disabled={isAnalyzing}
                                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-sm disabled:opacity-70 flex items-center gap-2"
                                  >
                                      {isAnalyzing ? <><Loader2 size={18} className="animate-spin"/> Calculating Impact...</> : 'Save Product'}
                                  </button>
                              </div>
                          </form>
                      </div>
                  </div>
              )}
          </div>
      );
  }

  // If Seller, show ProductPricing (Management Dashboard V2 logic)
  if (user.role === UserRole.WHOLESALER || user.role === UserRole.FARMER) {
      return <ProductPricing user={user} />;
  }

  // CONSUMER LOGIC
  const [products, setProducts] = useState<Product[]>([]);
  const [allInventory, setAllInventory] = useState<InventoryItem[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [alphaFilter, setAlphaFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Consumer Context
  const [connectedSupplierName, setConnectedSupplierName] = useState('');
  const [connectedSupplierId, setConnectedSupplierId] = useState('');

  // Checkout State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
      deliveryDate: '',
      deliveryTime: '',
      contactName: '',
      paymentMethod: 'invoice' as 'pay_now' | 'invoice' | 'amex'
  });

  useEffect(() => {
    // Load and sort alphabetically
    const sortedProducts = mockService.getAllProducts().sort((a, b) => a.name.localeCompare(b.name));
    setProducts(sortedProducts);
    setAllInventory(mockService.getAllInventory());
    
    // Find connected supplier info
    const customer = mockService.getCustomers().find(c => c.id === user.id); 
    setConnectedSupplierName(customer?.connectedSupplierName || 'Partner Network');
    setConnectedSupplierId(customer?.connectedSupplierId || '');
  }, [user]);

  // Match the grouping in the screenshot
  const ALPHABET_GROUPS = [
      { label: 'All', regex: null },
      { label: 'ABC', regex: /^[A-C]/i },
      { label: 'DEF', regex: /^[D-F]/i },
      { label: 'GHI', regex: /^[G-I]/i },
      { label: 'JKL', regex: /^[J-L]/i },
      { label: 'MNO', regex: /^[M-O]/i },
      { label: 'PQR', regex: /^[P-R]/i },
      { label: 'STU', regex: /^[S-U]/i },
      { label: 'VWX', regex: /^[V-X]/i },
      { label: 'YZ', regex: /^[Y-Z]/i },
  ];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by Alphabet Group
    let matchesAlpha = true;
    const activeGroup = ALPHABET_GROUPS.find(g => g.label === alphaFilter);
    if (activeGroup && activeGroup.regex) {
        matchesAlpha = activeGroup.regex.test(p.name);
    }

    return matchesSearch && matchesAlpha;
  });

  const displayedProducts = filteredProducts;

  const addToCart = (product: Product, qty: number) => {
      setCart(prev => ({
          ...prev,
          [product.id]: (prev[product.id] || 0) + qty
      }));
  };

  const calculateCartTotal = () => {
      let subtotal = 0;
      Object.entries(cart).forEach(([id, qty]) => {
          const product = products.find(p => p.id === id);
          if (product) subtotal += product.defaultPricePerKg * (qty as number);
      });
      return subtotal;
  };

  const handlePlaceOrder = () => {
      // 1. Validation
      if (!checkoutForm.deliveryDate || !checkoutForm.deliveryTime || !checkoutForm.contactName) {
          alert("Please fill in all delivery details before placing the order.");
          return;
      }

      // 2. Prepare Items
      const cartItems = Object.entries(cart).map(([id, qty]) => ({
          product: products.find(p => p.id === id)!,
          qty: qty as number
      })).filter(i => i.product);

      if (cartItems.length === 0) {
          alert("Your cart is empty.");
          return;
      }

      // 3. Determine Seller
      // Priority: Connected Supplier -> Inventory Owner -> Default 'u2' (Fresh Wholesalers)
      let finalSellerId = connectedSupplierId;
      
      if (!finalSellerId) {
          // Fallback: Find who owns the stock of the first item
          const firstProductOwner = allInventory.find(i => i.productId === cartItems[0]?.product.id)?.ownerId;
          finalSellerId = firstProductOwner || 'u2'; 
      }

      // 4. Create Order
      mockService.createMarketplaceOrder(
          user.id, 
          finalSellerId, 
          cartItems, 
          {
              deliveryDate: checkoutForm.deliveryDate,
              deliveryTime: checkoutForm.deliveryTime,
              contactName: checkoutForm.contactName,
              deliveryLocation: 'Registered Address' // Mock location from profile
          },
          checkoutForm.paymentMethod
      );

      // 5. Success Feedback
      let message = "Order successfully placed!";
      if (checkoutForm.paymentMethod === 'pay_now') {
          message = "Order Placed! Thank you for your payment. 10% discount applied.";
      } else if (checkoutForm.paymentMethod === 'amex') {
          message = "Order Placed! An invoice has been generated. Platform Zero will take payment within 1-2 business days.";
      } else {
          message = "Order Placed! Invoice sent to your accounts email.";
      }

      alert(message);
      
      // 6. Reset State
      setCart({});
      setIsCheckoutOpen(false);
      setCheckoutForm({
          deliveryDate: '',
          deliveryTime: '',
          contactName: '',
          paymentMethod: 'invoice'
      });
  };

  const subtotal = calculateCartTotal();
  const discount = checkoutForm.paymentMethod === 'pay_now' ? subtotal * 0.10 : 0;
  const total = subtotal - discount;

  return (
    <div className="space-y-8 relative pb-20">
        {/* Header for Consumer */}
        <div className="flex items-center gap-3 mb-2">
            <ShoppingCart size={28} className="text-gray-900"/>
            <h1 className="text-2xl font-bold text-gray-900">Order Now</h1>
        </div>

        {/* Filters Bar - Styled to match screenshot */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
            <div className="flex flex-wrap gap-2">
                {ALPHABET_GROUPS.map(group => (
                    <button
                        key={group.label}
                        onClick={() => setAlphaFilter(group.label)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase border ${
                            alphaFilter === group.label
                                ? 'bg-[#0F172A] text-white border-[#0F172A]'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        {group.label}
                    </button>
                ))}
            </div>
            
            <div className="relative w-full md:w-64">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search..." 
                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-gray-300 shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {displayedProducts.length === 0 ? (
                <div className="col-span-full py-20 text-center text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
                    <p>No products found in this category.</p>
                </div>
            ) : (
                displayedProducts.map(product => {
                    // Determine Out of Stock
                    const isAvailable = allInventory.some(i => 
                        i.productId === product.id && 
                        i.quantityKg > 0 && 
                        i.status === 'Available'
                    );

                    return (
                        <ProductCard 
                            key={product.id} 
                            product={product} 
                            supplierName={connectedSupplierName}
                            onAdd={(qty) => addToCart(product, qty)}
                            isOutOfStock={!isAvailable}
                            cartQty={cart[product.id] || 0}
                        />
                    );
                })
            )}
        </div>
        
        {/* Cart Summary (Floating) */}
        {Object.keys(cart).length > 0 && (
            <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-10 fade-in">
                <button 
                    onClick={() => setIsCheckoutOpen(true)}
                    className="bg-[#0F172A] text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 hover:scale-105 transition-transform"
                >
                    <div className="relative">
                        <ShoppingCart size={24} />
                        <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#0F172A]">
                            {Object.keys(cart).length}
                        </span>
                    </div>
                    <div className="text-left">
                        <span className="block text-xs text-gray-400 font-bold uppercase">Total</span>
                        <span className="font-bold text-lg leading-none">Checkout</span>
                    </div>
                </button>
            </div>
        )}

        {/* Checkout Modal */}
        {isCheckoutOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-200">
                    {/* Left: Order Summary */}
                    <div className="w-full md:w-1/3 bg-gray-50 p-6 border-r border-gray-200 overflow-y-auto">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <ShoppingCart size={20}/> Order Summary
                        </h2>
                        <div className="space-y-3 mb-6">
                            {Object.entries(cart).map(([id, qty]) => {
                                const quantity = qty as number;
                                const product = products.find(p => p.id === id);
                                if(!product) return null;
                                return (
                                    <div key={id} className="flex justify-between items-start text-sm">
                                        <div>
                                            <p className="font-medium text-gray-900">{product.name}</p>
                                            <p className="text-gray-500 text-xs">{quantity}kg @ ${product.defaultPricePerKg.toFixed(2)}</p>
                                        </div>
                                        <p className="font-medium text-gray-900">${(product.defaultPricePerKg * quantity).toFixed(2)}</p>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="border-t border-gray-200 pt-4 space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-sm text-emerald-600 font-medium">
                                    <span>Discount (10%)</span>
                                    <span>-${discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200 mt-2">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Details & Payment */}
                    <div className="w-full md:w-2/3 p-6 overflow-y-auto flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Checkout Details</h2>
                            <button onClick={() => setIsCheckoutOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
                        </div>

                        <div className="space-y-6 flex-1">
                            {/* Delivery Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Delivery Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
                                        <div className="relative">
                                            <Calendar size={16} className="absolute left-3 top-3 text-gray-400"/>
                                            <input 
                                                type="date" 
                                                className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500 outline-none ${!checkoutForm.deliveryDate ? 'border-red-300' : 'border-gray-300'}`}
                                                value={checkoutForm.deliveryDate}
                                                onChange={e => setCheckoutForm({...checkoutForm, deliveryDate: e.target.value})}
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time</label>
                                        <div className="relative">
                                            <Clock size={16} className="absolute left-3 top-3 text-gray-400"/>
                                            <input 
                                                type="time" 
                                                className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500 outline-none ${!checkoutForm.deliveryTime ? 'border-red-300' : 'border-gray-300'}`}
                                                value={checkoutForm.deliveryTime}
                                                onChange={e => setCheckoutForm({...checkoutForm, deliveryTime: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Who made the order?</label>
                                    <div className="relative">
                                        <UserIcon size={16} className="absolute left-3 top-3 text-gray-400"/>
                                        <input 
                                            type="text" 
                                            placeholder="Contact Name"
                                            className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500 outline-none ${!checkoutForm.contactName ? 'border-red-300' : 'border-gray-300'}`}
                                            value={checkoutForm.contactName}
                                            onChange={e => setCheckoutForm({...checkoutForm, contactName: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Payment Method</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${checkoutForm.paymentMethod === 'pay_now' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input 
                                            type="radio" 
                                            name="payment" 
                                            className="mt-1 w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                                            checked={checkoutForm.paymentMethod === 'pay_now'}
                                            onChange={() => setCheckoutForm({...checkoutForm, paymentMethod: 'pay_now'})}
                                        />
                                        <div className="flex-1">
                                            <div className="flex justify-between">
                                                <span className="font-bold text-gray-900">Pay Now</span>
                                                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded">Save 10%</span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">Instant payment via credit card.</p>
                                        </div>
                                    </label>

                                    <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${checkoutForm.paymentMethod === 'invoice' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input 
                                            type="radio" 
                                            name="payment" 
                                            className="mt-1 w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                                            checked={checkoutForm.paymentMethod === 'invoice'}
                                            onChange={() => setCheckoutForm({...checkoutForm, paymentMethod: 'invoice'})}
                                        />
                                        <div className="flex-1">
                                            <span className="font-bold text-gray-900">Invoice</span>
                                            <p className="text-sm text-gray-500 mt-1">Standard 7-day payment terms.</p>
                                        </div>
                                    </label>

                                    <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${checkoutForm.paymentMethod === 'amex' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input 
                                            type="radio" 
                                            name="payment" 
                                            className="mt-1 w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                                            checked={checkoutForm.paymentMethod === 'amex'}
                                            onChange={() => setCheckoutForm({...checkoutForm, paymentMethod: 'amex'})}
                                        />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-gray-900">Amex Program</span>
                                                <CreditCard size={16} className="text-blue-600"/>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">Platform Zero will take payment within 1-2 business days.</p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end gap-3">
                            <button 
                                onClick={() => setIsCheckoutOpen(false)}
                                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handlePlaceOrder}
                                className="px-8 py-3 bg-[#043003] text-white rounded-lg font-bold hover:bg-[#064004] shadow-lg flex items-center gap-2 transition-all"
                            >
                                <CheckCircle size={20}/> Place Order
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
