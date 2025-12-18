
import React, { useState, useEffect, useRef } from 'react';
import { User, Order, Lead, InventoryItem, Product, SupplierPriceRequest, SupplierPriceRequestItem, Driver, Packer, Customer } from '../types';
import { mockService } from '../services/mockDataService';
import { identifyProductFromImage } from '../services/geminiService';
import { ChatDialog } from './ChatDialog';
import { SellProductDialog } from './SellProductDialog';
import { 
  Briefcase, Package, Users, ClipboardList, Camera, 
  CheckCircle, MapPin, AlertTriangle, 
  Send, Loader2, X, ChevronRight,
  Target, TrendingUp, Plus, Edit2, ShoppingBag, GitPullRequest, Bell, Store, MoreVertical, Heart, Tag, DollarSign, Phone, Activity, Clock, Truck, Box, CheckSquare, Search, Zap, ArrowRight, UploadCloud, Share2, Smartphone, Contact, Check, UserPlus, BookOpen
} from 'lucide-react';

interface SellerDashboardV1Props {
  user: User;
  onLogout?: () => void;
  onSwitchVersion?: (version: 'v1' | 'v2') => void;
}

/* Enhanced ShareModal with recipient selection and manual mobile contact support */
export const ShareModal: React.FC<{
  item: InventoryItem;
  onClose: () => void;
  onComplete: () => void;
  currentUser: User;
}> = ({ item, onClose, onComplete, currentUser }) => {
  const product = mockService.getProduct(item.productId);
  const owner = mockService.getAllUsers().find(u => u.id === item.ownerId);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [manualNumbers, setManualNumbers] = useState<string[]>([]);
  const [currentManualNumber, setCurrentManualNumber] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSyncingContacts, setIsSyncingContacts] = useState(false);

  useEffect(() => {
    // Filter customers connected to this specific wholesaler/farmer
    const myCustomers = mockService.getCustomers().filter(c => c.connectedSupplierId === currentUser.id);
    setCustomers(myCustomers);
    // Default select all connected customers
    setSelectedCustomerIds(myCustomers.map(c => c.id));
  }, [currentUser.id]);

  const toggleCustomer = (id: string) => {
    setSelectedCustomerIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const addManualNumber = () => {
    if (currentManualNumber && !manualNumbers.includes(currentManualNumber)) {
      if (!/^\+?[\d\s-]{8,15}$/.test(currentManualNumber)) {
        alert("Please enter a valid mobile number.");
        return;
      }
      setManualNumbers([...manualNumbers, currentManualNumber]);
      setCurrentManualNumber('');
    }
  };

  const handleConnectContacts = async () => {
    // Check for Contact Picker API support (Chrome on Android)
    const props = ['name', 'tel'];
    const opts = { multiple: true };

    try {
      // @ts-ignore - navigator.contacts is a newer/mobile-only API
      if ('contacts' in navigator && 'select' in navigator.contacts) {
        setIsSyncingContacts(true);
        // @ts-ignore
        const contacts = await navigator.contacts.select(props, opts);
        if (contacts && contacts.length > 0) {
          const numbers = contacts
            .map((c: any) => c.tel?.[0])
            .filter((t: any) => !!t);
          setManualNumbers(prev => [...new Set([...prev, ...numbers])]);
        }
        setIsSyncingContacts(false);
      } else {
        // Fallback: Simulation for Desktop/Other browsers
        setIsSyncingContacts(true);
        setTimeout(() => {
          const mockContacts = ['0411 222 333', '0499 888 777', '0455 123 987'];
          setManualNumbers(prev => [...new Set([...prev, ...mockContacts])]);
          setIsSyncingContacts(false);
          alert("📱 Device Contacts Synced!\n\nAdded 3 contacts from your address book for this session.");
        }, 1200);
      }
    } catch (err) {
      console.error(err);
      setIsSyncingContacts(false);
    }
  };

  const removeManualNumber = (num: string) => {
    setManualNumbers(manualNumbers.filter(n => n !== num));
  };

  const handleSendBlast = () => {
    const totalRecipients = selectedCustomerIds.length + manualNumbers.length;
    if (totalRecipients === 0) {
      alert("Please select at least one recipient.");
      return;
    }

    setIsSending(true);

    // Generate specific marketplace link for this item
    const shortLink = `https://pz.fyi/l/${item.id.slice(-6)}`;
    const smsMessage = `PZ ALERT: Fresh ${product?.name} just listed by ${owner?.businessName}! Only $${product?.defaultPricePerKg.toFixed(2)}/kg. Click to buy: ${shortLink}`;

    // Simulate network delay for SMS dispatch
    setTimeout(() => {
      const recipientDetails = [
        ...customers.filter(c => selectedCustomerIds.includes(c.id)).map(c => `${c.businessName} (${c.phone || 'System contact'})`),
        ...manualNumbers.map(n => `Manual Contact: ${n}`)
      ];

      alert(`🚀 SMS Blast Sent Successfully!\n\nMessage sent to ${totalRecipients} recipients:\n\n"${smsMessage}"\n\nRecipient Log:\n- ${recipientDetails.join('\n- ')}`);
      
      setIsSending(false);
      onComplete();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Blast to Network</h2>
            <p className="text-sm text-gray-500 font-medium">Select profiles or add manual contacts</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X size={24}/>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* SMS Preview Section */}
          <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 relative">
            <span className="absolute -top-2.5 left-4 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">SMS Preview</span>
            <p className="text-sm text-emerald-900 italic leading-relaxed">
              "PZ ALERT: Fresh <span className="font-bold">{product?.name}</span> just listed by <span className="font-bold">{owner?.businessName}</span>! Only <span className="font-bold">${product?.defaultPricePerKg.toFixed(2)}/kg</span>. Click to buy: https://pz.fyi/l/..."
            </p>
          </div>

          {/* Connected Customers Checklist */}
          <div>
            <div className="flex justify-between items-center mb-3">
               <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                 <Users size={14}/> Connected Profiles ({customers.length})
               </h3>
               <button 
                 onClick={() => setSelectedCustomerIds(selectedCustomerIds.length === customers.length ? [] : customers.map(c => c.id))}
                 className="text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-wider"
               >
                 {selectedCustomerIds.length === customers.length ? 'Deselect All' : 'Select All'}
               </button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              {customers.map(customer => (
                <div 
                  key={customer.id} 
                  onClick={() => toggleCustomer(customer.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedCustomerIds.includes(customer.id) ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${selectedCustomerIds.includes(customer.id) ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {customer.businessName.charAt(0)}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${selectedCustomerIds.includes(customer.id) ? 'text-emerald-900' : 'text-gray-700'}`}>{customer.businessName}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{customer.phone || 'No mobile saved'}</p>
                    </div>
                  </div>
                  {selectedCustomerIds.includes(customer.id) ? <CheckCircle className="text-emerald-600" size={20}/> : <div className="w-5 h-5 rounded-full border-2 border-gray-200" />}
                </div>
              ))}
              {customers.length === 0 && <p className="text-xs text-gray-400 italic text-center py-4">No connected profiles found.</p>}
            </div>
          </div>

          {/* Manual Contacts Section */}
          <div>
            <div className="flex justify-between items-center mb-3">
               <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Smartphone size={14}/> Add Mobile Contacts
               </h3>
               <button 
                onClick={handleConnectContacts}
                disabled={isSyncingContacts}
                className="flex items-center gap-1 text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-800 transition-colors"
               >
                 {isSyncingContacts ? <Loader2 size={12} className="animate-spin"/> : <UserPlus size={12}/>}
                 Sync Contacts
               </button>
            </div>
            <div className="flex gap-2">
              <input 
                type="tel" 
                placeholder="Enter mobile number..." 
                value={currentManualNumber}
                onChange={(e) => setCurrentManualNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addManualNumber()}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
              <button 
                onClick={addManualNumber}
                className="bg-[#0F172A] hover:bg-black text-white rounded-xl px-4 py-2.5 transition-all shadow-md active:scale-95"
              >
                <Plus size={20}/>
              </button>
            </div>
            
            {manualNumbers.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 max-h-32 overflow-y-auto">
                {manualNumbers.map(num => (
                  <div key={num} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-[10px] font-black flex items-center gap-2 border border-slate-200 animate-in zoom-in duration-200">
                    {num}
                    <button onClick={() => removeManualNumber(num)} className="text-slate-400 hover:text-red-500 transition-colors"><X size={14}/></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 bg-white border border-gray-200 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-all">
            Cancel
          </button>
          <button 
            onClick={handleSendBlast}
            disabled={isSending || (selectedCustomerIds.length === 0 && manualNumbers.length === 0)}
            className="flex-[2] py-4 bg-[#0F172A] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <>
                <Loader2 size={18} className="animate-spin" /> DISPATCHING...
              </>
            ) : (
              <>
                <Send size={18} /> SEND {selectedCustomerIds.length + manualNumbers.length} ALERTS
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* FIX: Added missing PackingPortal component to provide a dedicated packing interface for orders */
export const PackingPortal: React.FC<{
  order: Order;
  onClose: () => void;
  onComplete: (driverId: string) => void;
  drivers: Driver[];
}> = ({ order, onClose, onComplete, drivers }) => {
  const [packedItems, setPackedItems] = useState<Record<string, boolean>>({});
  const [selectedDriver, setSelectedDriver] = useState('');

  const allPacked = order.items.every(i => packedItems[i.productId]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-600 text-white">
          <div>
            <h2 className="text-xl font-bold">Packing Station</h2>
            <p className="text-blue-100 text-sm">Order #{order.id.split('-')[1] || order.id}</p>
          </div>
          <button onClick={onClose} className="text-blue-100 hover:text-white"><X size={24}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
            {order.items.map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => setPackedItems(prev => ({...prev, [item.productId]: !prev[item.productId]}))}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center ${packedItems[item.productId] ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-blue-300'}`}
              >
                <div>
                    <p className="font-bold text-gray-900">{mockService.getProduct(item.productId)?.name}</p>
                    <p className="text-sm text-gray-500">{item.quantityKg} kg</p>
                </div>
                {packedItems[item.productId] ? <CheckCircle className="text-emerald-600" /> : <div className="w-6 h-6 rounded-full border-2 border-gray-300" />}
              </div>
            ))}
          </div>

          {allPacked && (
            <div className="pt-6 border-t border-gray-100 space-y-4 animate-in fade-in">
              <label className="block text-sm font-bold text-gray-700">Assign Driver for Pickup</label>
              <select 
                value={selectedDriver} 
                onChange={e => setSelectedDriver(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select a driver...</option>
                {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                <option value="3rd_party">3rd Party Logistics</option>
              </select>
            </div>
          )}
        </div>
        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <button 
            onClick={() => onComplete(selectedDriver)}
            disabled={!allPacked || !selectedDriver}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg disabled:opacity-50 shadow-lg"
          >
            Mark Packed & Hand to Driver
          </button>
        </div>
      </div>
    </div>
  );
};

/* FIX: Added missing AssignTeamModal component to enable order acceptance and staff assignment */
export const AssignTeamModal: React.FC<{
  order: Order;
  packers: Packer[];
  drivers: Driver[];
  onClose: () => void;
  onConfirm: (packerId: string, driverId: string) => void;
}> = ({ order, packers, drivers, onClose, onConfirm }) => {
  const [selectedPacker, setSelectedPacker] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">Assign Team</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Assign Packer</label>
            <select 
              value={selectedPacker} 
              onChange={e => setSelectedPacker(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="">Select a packer...</option>
              {packers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Assign Driver (Optional)</label>
            <select 
              value={selectedDriver} 
              onChange={e => setSelectedDriver(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select a driver...</option>
              {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              <option value="3rd_party">3rd Party Logistics</option>
            </select>
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50/50">
          <button onClick={onClose} className="flex-1 py-3 bg-white border border-gray-300 rounded-xl font-bold text-gray-700">Cancel</button>
          <button 
            onClick={() => onConfirm(selectedPacker, selectedDriver)}
            disabled={!selectedPacker}
            className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold disabled:opacity-50"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export const SellerDashboardV1: React.FC<SellerDashboardV1Props> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'price_requests' | 'leads' | 'inventory' | 'onboarding'>('orders');
  
  // --- TAB 1: ONBOARDING STATE ---
  const [paymentTerms] = useState<'14 Days' | '30 Days'>(user.paymentTerms || '14 Days');
  const [acceptFastPay] = useState(user.acceptFastPay || false);
  const [bankDetails] = useState({
      accountName: user.bankDetails?.accountName || '',
      bsb: user.bankDetails?.bsb || '',
      accountNumber: user.bankDetails?.accountNumber || ''
  });

  // --- TAB 2: INVENTORY STATE ---
  const [invImage, setInvImage] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null); 
  const [isDragging, setIsDragging] = useState(false);
  
  // Sell & Share Modal States
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [itemToSell, setItemToSell] = useState<InventoryItem | null>(null);
  const [itemToShare, setItemToShare] = useState<InventoryItem | null>(null);

  // Unified Inventory Form State
  const [invDetails, setInvDetails] = useState({
      productName: '',
      quality: '',
      origin: '',
      quantity: '',
      price: '',
      discountDays: 3
  });
  
  // Existing Inventory List State
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [packers, setPackers] = useState<Packer[]>([]);

  // --- TAB 3: LEADS / CUSTOMERS STATE ---
  const [leads, setLeads] = useState<Lead[]>([]);
  
  // Add Partner Modal State
  const [isAddPartnerModalOpen, setIsAddPartnerModalOpen] = useState(false);
  const [partnerForm, setPartnerForm] = useState({
      type: 'Customer' as 'Customer' | 'Supplier',
      businessName: '',
      contactName: '',
      email: '',
      phone: ''
  });

  // --- TAB 4: ORDERS STATE ---
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [packingOrder, setPackingOrder] = useState<Order | null>(null); // For packing modal
  const [assigningOrder, setAssigningOrder] = useState<Order | null>(null); // For accept modal
  
  // Order Workflow Sub-states
  const [editPrices, setEditPrices] = useState<Record<string, number>>({});

  // --- TAB 5: PRICE REQUESTS STATE ---
  const [priceRequests, setPriceRequests] = useState<SupplierPriceRequest[]>([]);
  const [editingOffers, setEditingOffers] = useState<Record<string, Record<string, number>>>({}); 

  // --- MATCHING BUYERS STATE ---
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [matchPrice, setMatchPrice] = useState<string>('');
  const [matchTransport, setMatchTransport] = useState<string>('0.00');
  
  // Matched Buyers List (Dynamic)
  const [matchedBuyers, setMatchedBuyers] = useState([
      { id: 'mb1', name: 'Melbourne Fresh Distributors', needs: 'Broccoli 250kg', priority: 'High', color: 'bg-red-100 text-red-700' },
      { id: 'mb2', name: 'Sydney Premium Produce', needs: 'Asparagus 180kg', priority: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
      { id: 'mb3', name: 'Brisbane Organic Wholesale', needs: 'Carrots 300kg', priority: 'Low', color: 'bg-green-100 text-green-700' },
      { id: 'mb4', name: 'Metro Food Services', needs: 'Potatoes 1000kg', priority: 'High', color: 'bg-red-100 text-red-700' }
  ]);

  // Chat State
  const [activeChatUser, setActiveChatUser] = useState<User | null>(null);

  useEffect(() => {
    // Load Data
    setOrders(mockService.getOrders(user.id).filter(o => o.sellerId === user.id));
    setLeads(mockService.getLeads());
    setDrivers(mockService.getDrivers(user.id));
    setPackers(mockService.getPackers(user.id));
    
    // Fetch Requests and check if we should auto-switch
    const requests = mockService.getSupplierPriceRequests(user.id);
    setPriceRequests(requests);
    if (requests.some(r => r.status === 'PENDING')) {
        setActiveTab('price_requests');
    }

    refreshInventory();
    
    const handleClickOutside = (event: MouseEvent) => {
        if ((event.target as HTMLElement).closest('.inventory-menu-trigger')) return;
        setActiveMenuId(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [user]);

  const refreshInventory = () => {
    setInventory(mockService.getInventory(user.id));
    setProducts(mockService.getAllProducts());
  };
  
  // --- HANDLERS

  const saveOnboarding = () => {
      mockService.updateUserV1Details(user.id, { paymentTerms, acceptFastPay, bankDetails });
      alert("Settings Saved!");
  };

  const processFile = (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
          const base64 = reader.result as string;
          setInvImage(base64);
          setInvDetails(prev => ({ ...prev, productName: '', quality: '', quantity: '', price: '' }));
          analyzeInventory(base64);
      };
      reader.readAsDataURL(file);
  };

  const handleInvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if(e.target.files && e.target.files[0]) {
          processFile(e.target.files[0]);
      }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          processFile(e.dataTransfer.files[0]);
      }
  };

  const analyzeInventory = async (base64: string) => {
      const res = await identifyProductFromImage(base64.split(',')[1]);
      setInvDetails(prev => {
          const existingProduct = mockService.getAllProducts().find(p => p.name.toLowerCase().includes(res.name.toLowerCase()));
          return { 
              ...prev, 
              productName: res.name, 
              quality: res.quality, 
              price: existingProduct ? existingProduct.defaultPricePerKg.toString() : prev.price 
          };
      });
  };

  const submitInventory = (action: 'ADD_ONLY' | 'SELL_NOW' = 'ADD_ONLY') => {
      let product = mockService.getAllProducts().find(p => p.name.toLowerCase() === invDetails.productName.trim().toLowerCase());
      
      if (!product) {
          product = {
              id: `p-${Date.now()}`,
              name: invDetails.productName.trim() || 'New Product',
              category: 'Vegetable',
              variety: invDetails.quality || 'Standard',
              imageUrl: invImage || 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?auto=format&fit=crop&q=80&w=300&h=300', 
              defaultPricePerKg: parseFloat(invDetails.price) || 0
          };
          mockService.addProduct(product);
      } else {
          if (invDetails.price) {
              const newPrice = parseFloat(invDetails.price);
              if (!isNaN(newPrice)) mockService.updateProductPrice(product.id, newPrice);
          }
      }

      const newItem: InventoryItem = {
          id: `inv-${Date.now()}`,
          ownerId: user.id,
          productId: product.id,
          quantityKg: parseFloat(invDetails.quantity) || 0,
          status: 'Available',
          harvestDate: new Date().toISOString(),
          harvestLocation: invDetails.origin || 'Local Farm',
          expiryDate: new Date(Date.now() + 86400000 * 7).toISOString(),
          discountAfterDays: invDetails.discountDays,
          batchImageUrl: invImage || undefined
      };

      mockService.addInventoryItem(newItem);

      if (action === 'SELL_NOW') {
          setItemToSell(newItem);
          setIsSellModalOpen(true);
      } else {
          alert(`${product.name} Added to Inventory!`);
          setInvImage(null);
          setInvDetails({ productName: '', quality: '', origin: '', quantity: '', price: '', discountDays: 3 });
      }
      
      refreshInventory();
  };

  const handleMenuAction = (action: string, item: InventoryItem) => {
    setActiveMenuId(null);
    if (action === 'Sell') {
        setItemToSell(item);
        setIsSellModalOpen(true);
    } else if (action === 'Share') {
        setItemToShare(item);
        setIsShareModalOpen(true);
    } else if (action === 'Discount') {
        const discount = prompt("Enter discount % (e.g. 20):");
        if (discount) {
            const product = mockService.getProduct(item.productId);
            if (product) {
                const newPrice = product.defaultPricePerKg * (1 - parseInt(discount)/100);
                mockService.updateProductPrice(product.id, newPrice);
                alert(`Price updated to $${newPrice.toFixed(2)}/kg`);
                refreshInventory();
            }
        }
    } else if (action === 'Charity') {
        if (confirm("Mark this item as donated to charity?")) {
            mockService.updateInventoryStatus(item.id, 'Donated');
            refreshInventory();
        }
    }
  };

  const handleSellComplete = (data: any) => {
      if (!itemToSell) return;

      let customerId = data.customer.id;
      let customerName = data.customer.businessName || 'Customer';

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
          mockService.addMarketplaceCustomer(newCustomer as any);
          customerId = newCustomer.id;
      } else {
          const existing = mockService.getCustomers().find(c => c.id === customerId);
          customerName = existing?.businessName || 'Customer';
      }

      if (data.action === 'QUOTE') {
           alert(`Quote Sent to ${customerName}!\n\nSMS sent to ${data.customer.mobile}:\n"Hello ${data.customer.contactName}, quote for ${data.quantity}kg of ${data.product.name} is ready. Click here to accept."`);
      } else {
           mockService.createInstantOrder(customerId, itemToSell, data.quantity, data.pricePerKg);
           alert(`Sale Recorded!\n\n${data.quantity} sold to ${customerName}.\nInvoice generated.`);
           refreshInventory();
      }

      setIsSellModalOpen(false);
      setItemToSell(null);
      // If we were in capture flow, reset image
      if (invImage) {
          setInvImage(null);
          setInvDetails({ productName: '', quality: '', origin: '', quantity: '', price: '', discountDays: 3 });
      }
  };

  const handleConnectMatch = (matchId: string) => {
      setActiveMatchId(matchId === activeMatchId ? null : matchId);
      setMatchPrice('');
      setMatchTransport('0.00');
  };

  const handleSubmitMatch = (buyerName: string, product: string) => {
      if (!matchPrice) {
          alert('Please enter a price.');
          return;
      }
      alert(`Pricing submitted to ${buyerName} for ${product}!\nPrice: $${matchPrice}/kg\nTransport: $${matchTransport}`);
      setActiveMatchId(null);
  };

  const submitLead = (leadId: string) => {
      mockService.removeLead(leadId);
      setLeads(mockService.getLeads());
      alert("Quote submitted to PZ Admin for review!");
  };

  const handleSendInvite = (e: React.FormEvent) => {
      e.preventDefault();
      
      const inviteLink = `https://portal.platformzero.join/${partnerForm.businessName.replace(/\s+/g, '-').toLowerCase()}`;
      
      if (partnerForm.phone || partnerForm.email) {
          alert(`Invitation sent to ${partnerForm.contactName}!\n\nLink: ${inviteLink}`);
      } else {
          alert("Please enter an email or phone number.");
          return;
      }
      
      setIsAddPartnerModalOpen(false);
      setPartnerForm({ type: 'Customer', businessName: '', contactName: '', email: '', phone: '' });
  };

  const openOrder = (order: Order) => {
      setSelectedOrder(order);
      const prices: Record<string, number> = {};
      order.items.forEach(i => prices[i.productId] = i.pricePerKg);
      setEditPrices(prices);
      
      // Auto-scroll to the order details to ensure user sees the change
      setTimeout(() => {
          const element = document.getElementById('orders-list');
          if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
      }, 100);
  };

  const initiateAcceptOrder = () => {
      if(!selectedOrder) return;
      setAssigningOrder(selectedOrder);
  };

  const confirmAssignment = (packerId: string, driverId: string) => {
      if (!selectedOrder) return;
      const updatedItems = selectedOrder.items.map(i => ({ ...i, pricePerKg: editPrices[i.productId] || i.pricePerKg }));
      
      const packerName = packers.find(p => p.id === packerId)?.name;
      const driverName = drivers.find(d => d.id === driverId)?.name;

      mockService.confirmOrderV1(selectedOrder.id, updatedItems, packerId, packerName, driverId, driverName);
      
      setOrders(mockService.getOrders(user.id).filter(o => o.sellerId === user.id));
      setSelectedOrder(null);
      setAssigningOrder(null);
      alert(`Order Accepted! Assigned to ${packerName || 'Packer'}${driverName ? ` & ${driverName}` : ''}.`);
  };

  const handleStartPacking = (order: Order) => {
      setPackingOrder(order);
  };

  const handlePackingComplete = (driverId: string) => {
      if (!packingOrder) return;
      
      const driverName = drivers.find(d => d.id === driverId)?.name || 'External Logistics';
      
      const order = mockService.getOrders(user.id).find(o => o.id === packingOrder.id);
      if (order) {
          order.status = 'Ready for Delivery';
          order.logistics = {
              ...order.logistics!,
              method: 'LOGISTICS',
              driverId: driverId === '3rd_party' ? undefined : driverId,
              driverName: driverName,
              partner: driverId === '3rd_party' ? 'Little Logistics' : undefined
          };
      }

      setPackingOrder(null);
      setOrders(mockService.getOrders(user.id).filter(o => o.sellerId === user.id));
      alert(`Order packed and assigned to ${driverName}!`);
  };

  const updateOfferPrice = (reqId: string, productId: string, price: number) => {
      setEditingOffers(prev => ({
          ...prev,
          [reqId]: {
              ...(prev[reqId] || {}),
              [productId]: price
          }
      }));
  };

  const handleSubmitOffer = (req: SupplierPriceRequest) => {
      const updatedItems: SupplierPriceRequestItem[] = req.items.map(item => ({
          ...item,
          offeredPrice: editingOffers[req.id]?.[item.productId] ?? item.targetPrice
      }));

      const updatedRequest: SupplierPriceRequest = {
          ...req,
          items: updatedItems,
          status: 'SUBMITTED' 
      };

      mockService.updateSupplierPriceRequest(req.id, updatedRequest);
      setPriceRequests(mockService.getSupplierPriceRequests(user.id)); 
      alert("Offer submitted to Admin!");
  };

  const pendingRequests = priceRequests.filter(r => r.status === 'PENDING');
  const packingQueue = orders.filter(o => o.status === 'Confirmed');
  const deliveryQueue = orders.filter(o => o.status === 'Ready for Delivery');

  const priorityMap: Record<string, number> = {
      'Pending': 1,
      'Confirmed': 2,
      'Ready for Delivery': 3,
      'Shipped': 4,
      'Delivered': 5,
      'Cancelled': 6
  };
  
  const sortedOrders = [...orders].sort((a, b) => {
      const pA = priorityMap[a.status] || 99;
      const pB = priorityMap[b.status] || 99;
      return pA - pB;
  });

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center mt-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Partner Operations</h1>
                <p className="text-gray-500">Manage orders, price requests, and network.</p>
            </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-1 flex flex-wrap gap-1">
            {[
                {id: 'orders', label: 'Order Management', icon: ClipboardList},
                {id: 'inventory', label: 'Sell', icon: Package},
                {id: 'price_requests', label: 'Price Requests', icon: GitPullRequest, badge: pendingRequests.length},
                {id: 'leads', label: 'Customers', icon: Users},
                {id: 'onboarding', label: 'Settings', icon: Briefcase},
            ].map(tab => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-bold transition-all ${
                        activeTab === tab.id 
                        ? (tab.id === 'inventory' ? 'bg-[#10B981] text-white shadow-lg' : 'bg-slate-900 text-white shadow-md')
                        : (tab.id === 'inventory' ? 'bg-[#ECFDF5] text-[#059669] border border-[#D1FAE5] hover:bg-[#D1FAE5]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900')
                    }`}
                >
                    <tab.icon size={16}/> {tab.label}
                    {tab.badge ? (
                        <span className="bg-red-50 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">{tab.badge}</span>
                    ) : null}
                </button>
            ))}
        </div>

        {activeTab === 'orders' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="col-span-full space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group h-40">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Box size={64} className="text-blue-600"/>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">To Pack</p>
                                <h3 className="text-4xl font-extrabold text-gray-900">{packingQueue.length}</h3>
                            </div>
                            <div className="relative z-10">
                                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mb-2">
                                    <div className="bg-blue-500 h-full" style={{width: `${packingQueue.length > 0 ? '40%' : '0%'}`}}></div>
                                </div>
                                <p className="text-xs text-gray-500 font-medium">
                                    {packingQueue.length > 0 ? 'Requires attention' : 'All packed'}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group h-40">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Truck size={64} className="text-purple-600"/>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Logistics</p>
                                <h3 className="text-4xl font-extrabold text-gray-900">{deliveryQueue.length}</h3>
                            </div>
                            <div className="relative z-10">
                                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mb-2">
                                    <div className="bg-purple-500 h-full" style={{width: `${deliveryQueue.length > 0 ? '60%' : '0%'}`}}></div>
                                </div>
                                <p className="text-xs text-gray-500 font-medium">Waiting for drivers</p>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group h-40">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <MapPin size={64} className="text-emerald-600"/>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">In Transit</p>
                                <h3 className="text-4xl font-extrabold text-gray-900">{orders.filter(o => o.status === 'Shipped').length}</h3>
                            </div>
                            <div className="relative z-10">
                                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mb-2">
                                    <div className="bg-emerald-500 h-full animate-pulse" style={{width: '100%'}}></div>
                                </div>
                                <p className="text-xs text-gray-500 font-medium">Live tracking active</p>
                            </div>
                        </div>
                    </div>

                    <div id="orders-list">
                        {!selectedOrder ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {sortedOrders.map(order => (
                                    <div 
                                        key={order.id} 
                                        onClick={() => order.status === 'Confirmed' ? handleStartPacking(order) : openOrder(order)}
                                        className={`bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between aspect-[1/1] overflow-hidden ${order.status === 'Confirmed' ? 'ring-2 ring-blue-100 bg-blue-50/20' : ''} ${order.status === 'Pending' ? 'ring-2 ring-orange-100 bg-orange-50/20' : ''}`}
                                    >
                                        <div className="flex justify-between items-start w-full">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                order.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                                                order.status === 'Confirmed' ? 'bg-blue-100 text-blue-700' :
                                                order.status === 'Ready for Delivery' ? 'bg-purple-100 text-purple-700' :
                                                'bg-green-100 text-green-700'
                                            }`}>
                                                {order.status === 'Confirmed' ? 'Ready to Pack' : order.status}
                                            </span>
                                            <span className="text-xs text-gray-400 font-mono">#{order.id.split('-')[1] || order.id}</span>
                                        </div>
                                        <div className="text-center my-2 flex-1 flex flex-col justify-center">
                                            <h3 className="font-bold text-gray-900 text-lg line-clamp-2 leading-tight mb-2">
                                                {mockService.getCustomers().find(c => c.id === order.buyerId)?.businessName}
                                            </h3>
                                            <p className="text-sm text-gray-500 font-medium">{order.items.length} Items</p>
                                            <p className="text-xs text-gray-400 mt-1">${order.totalAmount.toFixed(2)}</p>
                                        </div>
                                        <div className="w-full mt-auto">
                                            <button className={`w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-colors ${
                                                order.status === 'Confirmed' 
                                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                                                : order.status === 'Pending'
                                                ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-sm'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}>
                                                {order.status === 'Confirmed' ? 'Pack Now' : order.status === 'Pending' ? 'Accept Order' : 'View Details'}
                                                {order.status !== 'Confirmed' && order.status !== 'Pending' && <ChevronRight size={14}/>}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                                    <button onClick={() => setSelectedOrder(null)} className="text-sm text-gray-500 hover:text-gray-900 font-medium flex items-center gap-1">
                                        <ChevronRight className="rotate-180" size={16}/> Back
                                    </button>
                                    <span className="font-bold text-gray-900">Order #{selectedOrder.id.split('-')[1]}</span>
                                </div>
                                <div className="p-6">
                                    {selectedOrder.status === 'Pending' && (
                                        <div>
                                            <div className="space-y-4 mb-6">
                                                {selectedOrder.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center border-b border-gray-100 pb-2">
                                                        <div>
                                                            <p className="font-medium text-gray-900">{mockService.getProduct(item.productId)?.name}</p>
                                                            <p className="text-xs text-gray-500">{item.quantityKg} kg</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-400">$/kg</span>
                                                            <input 
                                                                type="number" 
                                                                step="0.10"
                                                                value={editPrices[item.productId]}
                                                                onChange={(e) => setEditPrices({...editPrices, [item.productId]: parseFloat(e.target.value)})}
                                                                className="w-20 p-1 border border-gray-300 rounded text-right font-medium"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <button onClick={initiateAcceptOrder} className="w-full py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700">Accept Order</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {isSellModalOpen && itemToSell && (
            <SellProductDialog 
                isOpen={isSellModalOpen} 
                onClose={() => setIsSellModalOpen(false)} 
                product={mockService.getProduct(itemToSell.productId)!} 
                onComplete={handleSellComplete} 
            />
        )}

        {isShareModalOpen && itemToShare && (
            <ShareModal 
                item={itemToShare} 
                onClose={() => setIsShareModalOpen(false)} 
                onComplete={() => { setIsShareModalOpen(false); setItemToShare(null); }}
                currentUser={user}
            />
        )}

        {assigningOrder && (
            <AssignTeamModal 
                order={assigningOrder} 
                packers={packers} 
                drivers={drivers} 
                onClose={() => setAssigningOrder(null)} 
                onConfirm={confirmAssignment} 
            />
        )}

        {packingOrder && (
            <PackingPortal 
                order={packingOrder} 
                onClose={() => setPackingOrder(null)} 
                onComplete={handlePackingComplete} 
                drivers={drivers} 
            />
        )}
    </div>
  );
};
