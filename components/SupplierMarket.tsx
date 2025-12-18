
import React, { useState, useEffect } from 'react';
import { User, InventoryItem, Product, UserRole } from '../types';
import { mockService } from '../services/mockDataService';
import { Store, MapPin, Tag, Phone, MessageSquare, ChevronDown, ChevronUp, ShoppingCart, X, CheckCircle, FileText, Download } from 'lucide-react';
import { ChatDialog } from './ChatDialog';

interface SupplierMarketProps {
  user: User;
}

export const SupplierMarket: React.FC<SupplierMarketProps> = ({ user }) => {
  const [suppliers, setSuppliers] = useState<User[]>([]);
  const [expandedSupplierId, setExpandedSupplierId] = useState<string | null>(null);
  
  // Interaction State
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedItemSupplier, setSelectedItemSupplier] = useState<User | null>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState<number>(0);
  
  // Invoice Modal State
  const [showInvoice, setShowInvoice] = useState(false);
  
  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Data Cache
  const [inventoryMap, setInventoryMap] = useState<Record<string, InventoryItem[]>>({});
  const [products] = useState<Product[]>(mockService.getAllProducts());

  useEffect(() => {
    // Find all potential suppliers (Farmers & Wholesalers), excluding self
    const allUsers = mockService.getAllUsers();
    const potentialSuppliers = allUsers.filter(u => 
        u.id !== user.id && 
        (u.role === UserRole.FARMER || u.role === UserRole.WHOLESALER)
    );
    setSuppliers(potentialSuppliers);

    // Pre-fetch inventory for them
    const invMap: Record<string, InventoryItem[]> = {};
    potentialSuppliers.forEach(supplier => {
        const items = mockService.getInventoryByOwner(supplier.id).filter(i => i.status === 'Available');
        if (items.length > 0) {
            invMap[supplier.id] = items;
        }
    });
    setInventoryMap(invMap);
  }, [user]);

  const toggleSupplier = (supplierId: string) => {
    setExpandedSupplierId(expandedSupplierId === supplierId ? null : supplierId);
  };

  const handleProductClick = (item: InventoryItem, supplier: User) => {
      setSelectedItem(item);
      setSelectedItemSupplier(supplier);
      setPurchaseQuantity(item.quantityKg); // Default to full amount
      setShowInvoice(false);
  };

  const handleInitiateBuy = () => {
      setShowInvoice(true);
  };

  const handleDownloadInvoice = () => {
      if (!selectedItem || !selectedItemSupplier || !selectedProductDetails) return;

      const total = (purchaseQuantity * selectedProductDetails.defaultPricePerKg * 1.1).toFixed(2);
      const invoiceContent = `
PLATFORM ZERO - TAX INVOICE
------------------------------------------------
Date: ${new Date().toLocaleDateString()}
Invoice #: TMP-${Date.now()}

FROM:
${selectedItemSupplier.businessName}
${selectedItemSupplier.email}
${selectedItem.harvestLocation || 'Australia'}

TO:
${user.businessName}
${user.email}

------------------------------------------------
ITEM DETAILS:
Product: ${selectedProductDetails.name} (${selectedProductDetails.variety})
Quantity: ${purchaseQuantity} kg
Unit Price: $${selectedProductDetails.defaultPricePerKg.toFixed(2)}/kg

Subtotal: $${(purchaseQuantity * selectedProductDetails.defaultPricePerKg).toFixed(2)}
GST (10%): $${(purchaseQuantity * selectedProductDetails.defaultPricePerKg * 0.1).toFixed(2)}
TOTAL DUE: $${total}
------------------------------------------------

Payment Terms: 14 Days
Thank you for your business.
      `;

      const blob = new Blob([invoiceContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PZ_Invoice_${Date.now()}.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
  };

  const handleConfirmPurchase = () => {
      if (selectedItem && selectedItemSupplier) {
          const product = products.find(p => p.id === selectedItem.productId);
          const price = product?.defaultPricePerKg || 0;
          
          mockService.createInstantOrder(user.id, selectedItem, purchaseQuantity, price);
          
          alert(`Order Confirmed! Invoice has been added to your Accounts Payable.`);
          setSelectedItem(null);
          setSelectedItemSupplier(null);
          setShowInvoice(false);
      }
  };

  const handleMessageSupplier = () => {
      setIsChatOpen(true);
  };

  const getProductName = (id: string) => products.find(p => p.id === id)?.name || 'Unknown';
  const getProductImage = (id: string) => products.find(p => p.id === id)?.imageUrl;
  const getProductPrice = (id: string) => products.find(p => p.id === id)?.defaultPricePerKg || 0;

  // Filter out suppliers with no stock
  const activeSuppliers = suppliers.filter(s => inventoryMap[s.id] && inventoryMap[s.id].length > 0);

  const selectedProductDetails = selectedItem ? products.find(p => p.id === selectedItem.productId) : null;

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Supplier Market</h1>
            <p className="text-gray-500">Browse catalogs from connected farmers and wholesalers.</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
            {activeSuppliers.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <Store size={48} className="mx-auto text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No active suppliers found</h3>
                    <p className="text-gray-500">Check back later for new inventory listings.</p>
                </div>
            ) : (
                activeSuppliers.map(supplier => {
                    const items = inventoryMap[supplier.id];
                    const isExpanded = expandedSupplierId === supplier.id;
                    const location = items[0]?.harvestLocation || 'Australia';

                    return (
                        <div key={supplier.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300">
                            {/* Supplier Header Card */}
                            <div 
                                onClick={() => toggleSupplier(supplier.id)}
                                className="p-6 flex flex-col md:flex-row md:items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`h-14 w-14 rounded-full flex items-center justify-center text-xl font-bold shadow-sm ${
                                        supplier.role === 'FARMER' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                        {supplier.businessName.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-bold text-gray-900">{supplier.businessName}</h3>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                                                supplier.role === 'FARMER' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                                            }`}>
                                                {supplier.role}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                            <span className="flex items-center gap-1"><MapPin size={14}/> {location}</span>
                                            <span className="flex items-center gap-1"><Tag size={14}/> {items.length} Products Available</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-4 md:mt-0 flex items-center gap-3">
                                    <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors" title="Chat">
                                        <MessageSquare size={20} />
                                    </button>
                                    <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors" title="Call">
                                        <Phone size={20} />
                                    </button>
                                    {isExpanded ? <ChevronUp size={20} className="text-gray-400"/> : <ChevronDown size={20} className="text-gray-400"/>}
                                </div>
                            </div>

                            {/* Inventory Grid (Collapsible) */}
                            {isExpanded && (
                                <div className="border-t border-gray-100 bg-gray-50 p-6 animate-in slide-in-from-top-2 duration-200">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-wider">Available Products</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {items.map(item => (
                                            <div 
                                                key={item.id} 
                                                onClick={() => handleProductClick(item, supplier)}
                                                className="bg-white rounded-lg border border-gray-200 p-3 flex items-start gap-3 hover:shadow-md transition-all cursor-pointer group hover:border-emerald-300"
                                            >
                                                <img 
                                                    src={getProductImage(item.productId)} 
                                                    alt="" 
                                                    className="w-16 h-16 rounded-md object-cover bg-gray-100 group-hover:scale-105 transition-transform"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-gray-900 truncate">{getProductName(item.productId)}</div>
                                                    <div className="text-xs text-gray-500 mb-2">Expires in {Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 3600 * 24))} days</div>
                                                    <div className="flex justify-between items-end">
                                                        <span className="font-bold text-emerald-600 text-sm">${getProductPrice(item.productId).toFixed(2)}/kg</span>
                                                        <span className="text-xs font-medium bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">{item.quantityKg}kg</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-6 flex justify-end">
                                        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                                            View Full Catalog <ChevronDown size={14} className="-rotate-90"/>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>

        {/* Product Action Modal */}
        {selectedItem && selectedItemSupplier && selectedProductDetails && !showInvoice && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="relative h-40 bg-gray-100">
                        <img src={selectedProductDetails.imageUrl} alt="" className="w-full h-full object-cover" />
                        <button 
                            onClick={() => setSelectedItem(null)}
                            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{selectedProductDetails.name}</h2>
                                <p className="text-sm text-gray-500">{selectedProductDetails.variety}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-emerald-600">${selectedProductDetails.defaultPricePerKg.toFixed(2)}</p>
                                <p className="text-xs text-gray-400">per kg</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-6">
                            <div className="flex items-center gap-2 mb-1">
                                <Store size={14} className="text-gray-400"/>
                                <span className="text-sm font-medium text-gray-700">{selectedItemSupplier.businessName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <MapPin size={12}/> {selectedItem.harvestLocation || 'Local Region'}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quantity (kg)</label>
                                <input 
                                    type="number"
                                    min="1"
                                    max={selectedItem.quantityKg}
                                    value={purchaseQuantity}
                                    onChange={(e) => setPurchaseQuantity(Number(e.target.value))}
                                    className="w-full border border-gray-300 rounded-lg p-2 font-bold text-gray-900 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                                <p className="text-xs text-gray-400 mt-1 text-right">Max available: {selectedItem.quantityKg}kg</p>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={handleInitiateBuy}
                                    className="w-full py-3 bg-emerald-600 text-white rounded-lg font-bold shadow-md hover:bg-emerald-700 flex items-center justify-center gap-2"
                                >
                                    <ShoppingCart size={18} /> Buy Now
                                </button>
                                <button 
                                    onClick={handleMessageSupplier}
                                    className="w-full py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
                                >
                                    <MessageSquare size={18} /> Message Supplier
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                            <CheckCircle size={12} className="text-emerald-500"/> Verified Supplier • Instant Invoice
                        </p>
                    </div>
                </div>
            </div>
        )}

        {/* INVOICE PREVIEW MODAL */}
        {showInvoice && selectedItem && selectedItemSupplier && selectedProductDetails && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
                <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-200">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-start bg-gray-50">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <FileText size={24} className="text-gray-600"/> Tax Invoice
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Review details before purchasing</p>
                        </div>
                        <button onClick={() => setShowInvoice(false)} className="text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-8 space-y-8 bg-white">
                        <div className="flex justify-between">
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">From (Supplier)</h3>
                                <p className="font-bold text-lg text-gray-900">{selectedItemSupplier.businessName}</p>
                                <p className="text-sm text-gray-600">ABN: 12 345 678 901</p>
                                <p className="text-sm text-gray-600">{selectedItem.harvestLocation}</p>
                                <p className="text-sm text-gray-600">{selectedItemSupplier.email}</p>
                            </div>
                            <div className="text-right">
                                <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">To (Buyer)</h3>
                                <p className="font-bold text-lg text-gray-900">{user.businessName}</p>
                                <p className="text-sm text-gray-600">{user.email}</p>
                                <div className="mt-4">
                                    <p className="text-sm text-gray-500">Invoice Date: <span className="font-medium text-gray-900">{new Date().toLocaleDateString()}</span></p>
                                    <p className="text-sm text-gray-500">Due Date: <span className="font-medium text-gray-900">{new Date(Date.now() + 14 * 86400000).toLocaleDateString()}</span></p>
                                </div>
                            </div>
                        </div>

                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-gray-800">
                                    <th className="py-3 text-sm font-bold text-gray-900 uppercase">Item</th>
                                    <th className="py-3 text-sm font-bold text-gray-900 uppercase text-right">Qty</th>
                                    <th className="py-3 text-sm font-bold text-gray-900 uppercase text-right">Price</th>
                                    <th className="py-3 text-sm font-bold text-gray-900 uppercase text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4">
                                        <div className="font-medium text-gray-900">{selectedProductDetails.name}</div>
                                        <div className="text-xs text-gray-500">{selectedProductDetails.variety}</div>
                                    </td>
                                    <td className="py-4 text-right">{purchaseQuantity} kg</td>
                                    <td className="py-4 text-right">${selectedProductDetails.defaultPricePerKg.toFixed(2)}</td>
                                    <td className="py-4 text-right font-medium">${(purchaseQuantity * selectedProductDetails.defaultPricePerKg).toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="flex justify-end">
                            <div className="w-1/2 space-y-3">
                                <div className="flex justify-between text-gray-600 text-sm">
                                    <span>Subtotal</span>
                                    <span>${(purchaseQuantity * selectedProductDetails.defaultPricePerKg).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 text-sm">
                                    <span>GST (10%)</span>
                                    <span>${(purchaseQuantity * selectedProductDetails.defaultPricePerKg * 0.1).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold text-gray-900 border-t border-gray-200 pt-3">
                                    <span>Total Due</span>
                                    <span>${(purchaseQuantity * selectedProductDetails.defaultPricePerKg * 1.1).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                        <button 
                            onClick={handleDownloadInvoice}
                            className="text-gray-500 hover:text-gray-700 text-sm font-medium flex items-center gap-2"
                        >
                            <Download size={16}/> Download PDF
                        </button>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowInvoice(false)}
                                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleConfirmPurchase}
                                className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 shadow-sm flex items-center gap-2"
                            >
                                <CheckCircle size={18}/> Accept & Purchase
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Chat Dialog for Supplier Communication */}
        {selectedItem && selectedItemSupplier && (
            <ChatDialog 
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                orderId="INQUIRY"
                issueType={`Product Inquiry: ${getProductName(selectedItem.productId)}`}
                repName={selectedItemSupplier.businessName}
            />
        )}
    </div>
  );
};
