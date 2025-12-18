
import React, { useState, useEffect, useRef } from 'react';
import { User, Order, Lead, InventoryItem, Product, SupplierPriceRequest, SupplierPriceRequestItem, Driver, Packer } from '../types';
import { mockService } from '../services/mockDataService';
import { identifyProductFromImage } from '../services/geminiService';
import { ChatDialog } from './ChatDialog';
import { SellProductDialog } from './SellProductDialog';
import { 
  Briefcase, Package, Users, ClipboardList, Camera, 
  CheckCircle, MapPin, AlertTriangle, 
  Send, Loader2, X, ChevronRight,
  Target, TrendingUp, Plus, Edit2, ShoppingBag, GitPullRequest, Bell, Store, MoreVertical, Heart, Tag, DollarSign, Phone, Activity, Clock, Truck, Box, CheckSquare, Search, Zap, ArrowRight, UploadCloud, Share2, Smartphone, Contact, Check
} from 'lucide-react';

interface SellerDashboardV1Props {
  user: User;
  onLogout?: () => void;
  onSwitchVersion?: (version: 'v1' | 'v2') => void;
}

// --- SUB-COMPONENT: SHARE MODAL ---
const ShareModal = ({ item, onClose, onComplete }: { item: InventoryItem, onClose: () => void, onComplete: () => void }) => {
    const [activeTab, setActiveTab] = useState<'customers' | 'contacts'>('customers');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Multi-select state
    const [selectedContacts, setSelectedContacts] = useState<Array<{ id: string, name: string, detail: string, phone: string, type: string }>>([]);
    
    // Custom Contact Addition
    const [isAdding, setIsAdding] = useState(false);
    const [newContact, setNewContact] = useState({ name: '', phone: '' });
    const [customContacts, setCustomContacts] = useState<Array<{ id: string, name: string, phone: string }>>([]);
    
    // Send State
    const [isSending, setIsSending] = useState(false);

    const product = mockService.getProduct(item.productId);
    
    // Mock Data
    const customers = mockService.getCustomers();
    const phoneContacts = [
        { id: 'ph1', name: 'Mom', phone: '0400 111 222' },
        { id: 'ph2', name: 'Chef Mario', phone: '0400 333 444' },
        { id: 'ph3', name: 'Market Buyer Tom', phone: '0400 555 666' },
        { id: 'ph4', name: 'Harry Local', phone: '0400 777 888' },
    ];

    const getList = () => {
        if (activeTab === 'customers') {
            return customers
                .filter(c => c.businessName.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(c => ({
                    id: c.id, 
                    name: c.businessName, 
                    detail: c.contactName, 
                    phone: c.phone || '',
                    type: 'App Profile'
                }));
        }
        // Merge hardcoded + custom
        return [...phoneContacts, ...customContacts]
            .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(c => ({
                id: c.id, 
                name: c.name, 
                detail: c.phone, 
                phone: c.phone,
                type: 'Mobile'
            }));
    };

    const toggleContact = (contact: { id: string, name: string, detail: string, phone: string, type: string }) => {
        if (selectedContacts.some(c => c.id === contact.id)) {
            setSelectedContacts(prev => prev.filter(c => c.id !== contact.id));
        } else {
            setSelectedContacts(prev => [...prev, contact]);
        }
    };

    const saveNewContact = () => {
        if (!newContact.name || !newContact.phone) return;
        const newId = `custom-${Date.now()}`;
        const contactObj = { id: newId, name: newContact.name, phone: newContact.phone };
        
        setCustomContacts(prev => [...prev, contactObj]);
        
        // Auto select
        setSelectedContacts(prev => [...prev, { 
            id: newId, 
            name: newContact.name, 
            detail: newContact.phone, 
            phone: newContact.phone,
            type: 'Mobile' 
        }]);
        
        setNewContact({ name: '', phone: '' });
        setIsAdding(false);
    };

    const handleSend = () => {
        if (selectedContacts.length === 0) return;
        
        // Ensure at least one has a number
        const recipients = selectedContacts
            .filter(c => c.phone && c.phone.length > 0)
            .map(c => c.name);

        if (recipients.length === 0) {
            alert("Selected contacts do not have valid mobile numbers.");
            return;
        }
        
        setIsSending(true);

        // SIMULATE AUTOMATIC SEND VIA BACKEND
        setTimeout(() => {
            setIsSending(false);
            const count = selectedContacts.length;
            const names = selectedContacts.slice(0, 2).map(c => c.name).join(', ') + (count > 2 ? ` +${count - 2} more` : '');
            
            // Show success via alert (mocking notification)
            alert(`Platform Zero: Invitation sent automatically to ${names}.\n\nMessage delivered to their mobile devices.`);
            
            onComplete();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Share2 size={20} className="text-emerald-400"/> Share Product
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={24}/></button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    <button 
                        onClick={() => setActiveTab('customers')}
                        className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'customers' ? 'border-emerald-600 text-emerald-700 bg-emerald-50' : 'border-transparent text-gray-500'}`}
                    >
                        <Users size={16}/> Customer Profiles
                    </button>
                    <button 
                        onClick={() => setActiveTab('contacts')}
                        className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'contacts' ? 'border-emerald-600 text-emerald-700 bg-emerald-50' : 'border-transparent text-gray-500'}`}
                    >
                        <Contact size={16}/> Phone Book
                    </button>
                </div>

                {/* Add Contact Form (Overlay or Inline) */}
                {isAdding ? (
                    <div className="p-4 bg-emerald-50 border-b border-emerald-100 animate-in slide-in-from-top-2">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-emerald-900 text-sm">Add New Contact</h3>
                            <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600"><X size={16}/></button>
                        </div>
                        <div className="space-y-3">
                            <input 
                                placeholder="Name" 
                                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={newContact.name}
                                onChange={e => setNewContact({...newContact, name: e.target.value})}
                                autoFocus
                            />
                            <input 
                                placeholder="Mobile Number" 
                                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={newContact.phone}
                                onChange={e => setNewContact({...newContact, phone: e.target.value})}
                            />
                            <button 
                                onClick={saveNewContact}
                                disabled={!newContact.name || !newContact.phone}
                                className="w-full py-2 bg-emerald-600 text-white font-bold rounded text-sm hover:bg-emerald-700 disabled:opacity-50"
                            >
                                Save & Select
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Search & Add Button */}
                        <div className="p-4 bg-white border-b border-gray-100 flex gap-2">
                            <div className="relative flex-1">
                                <Search size={16} className="absolute left-3 top-2.5 text-gray-400"/>
                                <input 
                                    type="text" 
                                    placeholder="Search names..." 
                                    className="w-full pl-9 p-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button 
                                onClick={() => { setActiveTab('contacts'); setIsAdding(true); }}
                                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center justify-center transition-colors"
                                title="Add New Contact"
                            >
                                <Plus size={18}/>
                            </button>
                        </div>
                    </>
                )}

                {/* List */}
                <div className="flex-1 overflow-y-auto bg-gray-50 p-2">
                    <div className="space-y-2">
                        {getList().length === 0 ? (
                            <div className="text-center py-8 text-gray-400 text-sm">No contacts found.</div>
                        ) : (
                            getList().map(contact => {
                                const isSelected = selectedContacts.some(c => c.id === contact.id);
                                return (
                                    <button 
                                        key={contact.id}
                                        onClick={() => toggleContact(contact)}
                                        className={`w-full text-left p-3 rounded-xl flex items-center justify-between border transition-all group ${isSelected ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' : 'bg-white border-gray-200 hover:border-emerald-300'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-gray-300 group-hover:border-emerald-400'}`}>
                                                {isSelected && <Check size={12} className="text-white"/>}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">{contact.name}</p>
                                                <p className="text-xs text-gray-500">{contact.detail} {contact.phone && `• ${contact.phone}`}</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] uppercase font-bold text-gray-300 bg-gray-50 px-2 py-1 rounded">{contact.type}</span>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    {/* Selected Summary */}
                    <div className="flex flex-wrap gap-1 mb-3 max-h-16 overflow-y-auto">
                        {selectedContacts.length === 0 && <span className="text-xs text-gray-400 italic">No contacts selected</span>}
                        {selectedContacts.map(c => (
                            <span key={c.id} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                                {c.name}
                                <button onClick={() => toggleContact(c)} className="hover:text-red-500"><X size={10}/></button>
                            </span>
                        ))}
                    </div>

                    <button 
                        disabled={selectedContacts.length === 0 || isSending}
                        onClick={handleSend}
                        className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2 transition-all"
                    >
                        {isSending ? (
                            <>
                                <Loader2 size={20} className="animate-spin"/> Sending Invites...
                            </>
                        ) : (
                            <>
                                <Smartphone size={20}/> 
                                {selectedContacts.length > 0 
                                    ? `Auto-Send to ${selectedContacts.length} Contact${selectedContacts.length > 1 ? 's' : ''}` 
                                    : 'Select Contacts to Send'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- SUB-COMPONENT: PACKING PORTAL MODAL ---
const PackingPortal = ({ order, onClose, onComplete, drivers }: { order: Order, onClose: () => void, onComplete: (driverId: string) => void, drivers: Driver[] }) => {
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
    const [selectedDriver, setSelectedDriver] = useState<string>(order.logistics?.driverId || '');
    
    const allChecked = order.items.every(i => checkedItems[i.productId]);

    const toggleItem = (productId: string) => {
        setCheckedItems(prev => ({...prev, [productId]: !prev[productId]}));
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-slate-900 p-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Box size={24} className="text-emerald-400"/> Packing Station
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">Order #{order.id.split('-')[1] || order.id} • {mockService.getCustomers().find(c => c.id === order.buyerId)?.businessName}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full"><X size={24}/></button>
                </div>

                {/* Packing List */}
                <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                    <div className="space-y-3">
                        {order.items.map((item, idx) => {
                            const product = mockService.getProduct(item.productId);
                            const isChecked = checkedItems[item.productId];
                            return (
                                <div 
                                    key={idx} 
                                    onClick={() => toggleItem(item.productId)}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center ${isChecked ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-gray-200 hover:border-blue-300'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${isChecked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 bg-white'}`}>
                                            {isChecked && <CheckCircle size={20}/>}
                                        </div>
                                        <div>
                                            <h3 className={`font-bold text-lg ${isChecked ? 'text-emerald-900' : 'text-gray-900'}`}>{product?.name}</h3>
                                            <p className="text-gray-500 text-sm">{product?.variety}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-2xl font-bold text-gray-900">{item.quantityKg}<span className="text-sm text-gray-500 font-medium">kg</span></span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer: Driver Assignment */}
                <div className="p-6 bg-white border-t border-gray-200">
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Confirm Logistics / Driver</label>
                        <select 
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium bg-white"
                            value={selectedDriver}
                            onChange={(e) => setSelectedDriver(e.target.value)}
                        >
                            <option value="">Select Driver or Logistics Partner...</option>
                            {drivers.map(d => (
                                <option key={d.id} value={d.id}>{d.name} ({d.vehicleType})</option>
                            ))}
                            <option value="3rd_party">3rd Party Logistics (External)</option>
                        </select>
                    </div>
                    <button 
                        disabled={!allChecked || !selectedDriver}
                        onClick={() => onComplete(selectedDriver)}
                        className="w-full py-4 bg-emerald-600 text-white font-bold text-lg rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                    >
                        <Truck size={24}/> Complete & Handover to Logistics
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- SUB-COMPONENT: ASSIGN TEAM MODAL ---
const AssignTeamModal = ({ order, packers, drivers, onClose, onConfirm }: { order: Order, packers: Packer[], drivers: Driver[], onClose: () => void, onConfirm: (packerId: string, driverId: string) => void }) => {
    const [selectedPacker, setSelectedPacker] = useState<string>('');
    const [selectedDriver, setSelectedDriver] = useState<string>('');

    const handleConfirm = () => {
        if (!selectedPacker) {
            alert('Please assign a packer.');
            return;
        }
        onConfirm(selectedPacker, selectedDriver);
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Assign Team</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                </div>
                <div className="p-6 space-y-6">
                    <p className="text-sm text-gray-600">Assign staff to fulfill Order #{order.id.split('-')[1]}. This will notify them via their portal.</p>
                    
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Assign Packer <span className="text-red-500">*</span></label>
                        <select 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                            value={selectedPacker}
                            onChange={(e) => setSelectedPacker(e.target.value)}
                        >
                            <option value="">Select Packer...</option>
                            {packers.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Assign Driver <span className="text-gray-400 font-normal">(Optional)</span></label>
                        <select 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                            value={selectedDriver}
                            onChange={(e) => setSelectedDriver(e.target.value)}
                        >
                            <option value="">Select Driver later...</option>
                            {drivers.map(d => (
                                <option key={d.id} value={d.id}>{d.name} ({d.vehicleType})</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                    <button onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-bold transition-colors">Cancel</button>
                    <button 
                        onClick={handleConfirm}
                        className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold shadow-sm"
                    >
                        Confirm & Accept
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
  
  // --- HANDLERS ---

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
      setActiveMatchId(activeMatchId === matchId ? null : matchId);
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
      
      const inviteLink = `https://portal.platformzero.com/join/${partnerForm.businessName.replace(/\s+/g, '-').toLowerCase()}`;
      
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
      // Show Assign Team Modal instead of immediate accept
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

  // --- ORDER WORKFLOW HANDLERS ---
  const handleStartPacking = (order: Order) => {
      setPackingOrder(order);
  };

  const handlePackingComplete = (driverId: string) => {
      if (!packingOrder) return;
      
      // Update Order Status to 'Ready for Delivery' and assign Driver
      // This mocks the backend update
      const driverName = drivers.find(d => d.id === driverId)?.name || 'External Logistics';
      
      // We need to update the actual order object in mockService
      const order = mockService.getOrders(user.id).find(o => o.id === packingOrder.id);
      if (order) {
          order.status = 'Ready for Delivery';
          order.logistics = {
              ...order.logistics,
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

  // --- PRICE REQUEST HANDLERS ---
  const updateOfferPrice = (reqId: string, productId: string, price: number) => {
      setEditingOffers(prev => ({
          ...prev,
          [reqId]: {
              ...(prev[reqId] || {}),
              [productId]: price
          }
      }));
  };

  const calculateLikelihood = (target: number, offer: number) => {
      if (!offer) return { text: 'Unknown', color: 'bg-gray-100 text-gray-500' };
      const diffPercent = ((offer - target) / target) * 100;
      if (diffPercent <= 0) {
          return { text: 'High Probability', color: 'bg-green-100 text-green-700' }; 
      } else if (diffPercent <= 10) {
          return { text: 'Medium Probability', color: 'bg-orange-100 text-orange-700' };
      } else {
          return { text: 'Low Probability', color: 'bg-red-100 text-red-700' };
      }
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

  const handleDealWon = (reqId: string) => {
    const newCustomer = mockService.finalizeDeal(reqId);
    setPriceRequests(mockService.getSupplierPriceRequests(user.id));
    
    if (newCustomer) {
        alert(`Deal Won! ${newCustomer.businessName} has been added to your customer list.`);
    }
  };

  // Helper for requests
  const pendingRequests = priceRequests.filter(r => r.status === 'PENDING');
  const submittedRequests = priceRequests.filter(r => r.status === 'SUBMITTED' || r.status === 'WON' || r.status === 'LOST');

  // Helper for Orders Workflow
  const pendingOrders = orders.filter(o => o.status === 'Pending');
  const packingQueue = orders.filter(o => o.status === 'Confirmed');
  const deliveryQueue = orders.filter(o => o.status === 'Ready for Delivery');

  // Sort orders by priority for the grid view
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
        {/* MAIN NAVIGATION & HEADER */}
        <div className="flex justify-between items-center mt-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Partner Operations</h1>
                <p className="text-gray-500">Manage orders, price requests, and network.</p>
            </div>
        </div>

        {/* TABS */}
        <div className="bg-white border border-gray-200 rounded-lg p-1 flex flex-wrap gap-1">
            {[
                {id: 'orders', label: 'Dashboard', icon: ClipboardList},
                {id: 'price_requests', label: 'Price Requests', icon: GitPullRequest, badge: pendingRequests.length},
                {id: 'leads', label: 'Customers', icon: Users},
                {id: 'inventory', label: 'Sell', icon: Package},
                {id: 'onboarding', label: 'Settings', icon: Briefcase},
            ].map(tab => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-bold transition-all ${
                        activeTab === tab.id 
                        ? 'bg-slate-900 text-white shadow-md' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                    <tab.icon size={16}/> {tab.label}
                    {tab.badge ? (
                        <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">{tab.badge}</span>
                    ) : null}
                </button>
            ))}
        </div>

        {/* --- MAIN DASHBOARD VIEW (ORDERS TAB) --- */}
        {activeTab === 'orders' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4">
                {/* LEFT COLUMN: ORDER COMMAND (FULL WIDTH IF NO QUICK ACTIONS) */}
                <div className="col-span-full space-y-6">
                    
                    {/* 1. STATUS TILES (3 ACROSS - SQUARE BOXES) */}
                    <div className="grid grid-cols-3 gap-4">
                        {/* TO PACK */}
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

                        {/* LOGISTICS QUEUE */}
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

                        {/* OUT FOR DELIVERY */}
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

                    {/* URGENT ACTION BANNER */}
                    {pendingOrders.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-red-100 text-red-600 rounded-full animate-pulse">
                                    <AlertTriangle size={24}/>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-red-900">Urgent: Orders Awaiting Acceptance</h2>
                                    <p className="text-red-700 mt-1">You have {pendingOrders.length} orders that need to be accepted within 60 minutes.</p>
                                </div>
                            </div>
                            {/* Actions are handled in the grid now */}
                        </div>
                    )}

                    {/* ORDERS LIST / DETAIL VIEW */}
                    <div id="orders-list">
                        {!selectedOrder ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {sortedOrders.length === 0 ? (
                                    <div className="col-span-full text-gray-500 text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">No active orders.</div>
                                ) : (
                                    sortedOrders.map(order => (
                                        <div 
                                            key={order.id} 
                                            onClick={() => order.status === 'Confirmed' ? handleStartPacking(order) : openOrder(order)}
                                            className={`bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between aspect-[1/1] overflow-hidden ${order.status === 'Confirmed' ? 'ring-2 ring-blue-100 bg-blue-50/20' : ''} ${order.status === 'Pending' ? 'ring-2 ring-orange-100 bg-orange-50/20' : ''}`}
                                        >
                                            {/* Header: Status & ID */}
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

                                            {/* Center: Customer & Items */}
                                            <div className="text-center my-2 flex-1 flex flex-col justify-center">
                                                <h3 className="font-bold text-gray-900 text-lg line-clamp-2 leading-tight mb-2">
                                                    {mockService.getCustomers().find(c => c.id === order.buyerId)?.businessName}
                                                </h3>
                                                <p className="text-sm text-gray-500 font-medium">{order.items.length} Items</p>
                                                <p className="text-xs text-gray-400 mt-1">${order.totalAmount.toFixed(2)}</p>
                                            </div>

                                            {/* Footer: Action */}
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
                                    ))
                                )}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                                    <button onClick={() => setSelectedOrder(null)} className="text-sm text-gray-500 hover:text-gray-900 font-medium flex items-center gap-1">
                                        <ChevronRight className="rotate-180" size={16}/> Back
                                    </button>
                                    <span className="font-bold text-gray-900">Order #{selectedOrder.id.split('-')[1]}</span>
                                </div>
                                <div className="p-6 space-y-8">
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

        {/* --- TAB CONTENT: PRICE REQUESTS --- */}
        {activeTab === 'price_requests' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                
                {/* SECTION 1: ACTION REQUIRED */}
                {pendingRequests.length > 0 && (
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Bell size={16} className="text-red-500"/> Action Required ({pendingRequests.length})
                        </h3>
                        <div className="space-y-4">
                            {pendingRequests.map(req => (
                                <div key={req.id} className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden ring-1 ring-red-100">
                                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-red-50/30">
                                        <div>
                                            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                                                <Target size={20} className="text-blue-600"/> {req.customerContext}
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-1 font-medium">
                                                {req.customerLocation} • Received: {new Date(req.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-orange-100 text-orange-700 animate-pulse">
                                            Action Required
                                        </span>
                                    </div>
                                    
                                    <div className="p-5">
                                        <table className="w-full text-sm mb-6">
                                            <thead>
                                                <tr className="text-gray-500 border-b border-gray-100 text-left">
                                                    <th className="pb-3 pl-2">Product</th>
                                                    <th className="pb-3">Target Price</th>
                                                    <th className="pb-3 w-40">My Offer</th>
                                                    <th className="pb-3 text-right pr-2">Win Probability</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {req.items.map(item => {
                                                    const currentOffer = editingOffers[req.id]?.[item.productId] ?? item.targetPrice;
                                                    const likelihood = calculateLikelihood(item.targetPrice, currentOffer);
                                                    return (
                                                        <tr key={item.productId} className="hover:bg-gray-50 transition-colors">
                                                            <td className="py-3 pl-2 font-medium text-gray-900">{item.productName}</td>
                                                            <td className="py-3 font-bold text-gray-600">${item.targetPrice.toFixed(2)}</td>
                                                            <td className="py-3">
                                                                <div className="relative">
                                                                    <span className="absolute left-3 top-1.5 text-gray-400 font-bold">$</span>
                                                                    <input 
                                                                        type="number" 
                                                                        step="0.01"
                                                                        value={currentOffer}
                                                                        onChange={(e) => updateOfferPrice(req.id, item.productId, parseFloat(e.target.value))}
                                                                        className={`w-full pl-6 pr-3 py-1.5 border rounded-lg font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none ${
                                                                            currentOffer !== item.targetPrice ? 'bg-blue-50 border-blue-200' : 'border-gray-300'
                                                                        }`}
                                                                    />
                                                                </div>
                                                            </td>
                                                            <td className="py-3 text-right pr-2">
                                                                <span className={`px-2 py-1 rounded text-xs font-bold ${likelihood.color}`}>
                                                                    {likelihood.text}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>

                                        <div className="pt-4 border-t border-gray-100 flex justify-end">
                                            <button 
                                                onClick={() => handleSubmitOffer(req)}
                                                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-sm flex items-center gap-2"
                                            >
                                                <Send size={16}/> Submit Quote
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* SECTION 2: NEW CUSTOMER PENDING (SUBMITTED) */}
                <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Clock size={16}/> New Customer Pending ({submittedRequests.length})
                    </h3>
                    {submittedRequests.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-400 text-sm">No pending customer quotes.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {submittedRequests.map(req => (
                                <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                                            <Store size={24}/>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{req.customerContext}</h3>
                                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                                                    <MapPin size={14}/> {req.customerLocation}
                                                </span>
                                                <span>Submitted: {new Date(req.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        {req.status === 'WON' ? (
                                            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1">
                                                <CheckCircle size={14}/> Deal Won
                                            </span>
                                        ) : req.status === 'LOST' ? (
                                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                                                Closed Lost
                                            </span>
                                        ) : (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDealWon(req.id); }}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 shadow-sm transition-colors"
                                            >
                                                <CheckCircle size={14}/> Deal Won
                                            </button>
                                        )}
                                        <button className="text-gray-400 hover:text-gray-600">
                                            <ChevronRight size={20}/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* INVENTORY TAB (Full List) */}
        {activeTab === 'inventory' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                
                {/* QUICK STOCK ADD (MOVED FROM DASHBOARD) */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-md font-bold text-gray-900 mb-3">Capture & Sell Stock</h2>
                    <div className="flex flex-col gap-4">
                        <div className="w-full relative group">
                            <div 
                                className={`w-full aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all relative overflow-hidden ${
                                    invImage ? 'border-emerald-500' : isDragging ? 'border-emerald-500 bg-emerald-50 scale-[1.02]' : 'border-gray-300 group-hover:bg-gray-50'
                                }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <label htmlFor="inv-upload-sell" className="absolute inset-0 w-full h-full cursor-pointer z-10 flex flex-col items-center justify-center">
                                    {!invImage && (
                                        <div className="text-center p-4">
                                            <Camera size={24} className={`mx-auto mb-2 ${isDragging ? 'text-emerald-500' : 'text-gray-400'}`}/>
                                            <span className={`text-xs font-bold ${isDragging ? 'text-emerald-600' : 'text-gray-600'}`}>
                                                {isDragging ? 'Drop Image Here' : 'Take Photo / Drop Image'}
                                            </span>
                                        </div>
                                    )}
                                </label>
                                <input id="inv-upload-sell" type="file" accept="image/*" className="hidden" onChange={handleInvFileChange} onClick={(e) => { (e.target as HTMLInputElement).value = ''; }} />
                                {invImage && <img src={invImage} className="absolute inset-0 w-full h-full object-cover" />}
                            </div>
                        </div>
                        
                        {invImage && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                <input value={invDetails.productName} onChange={e => setInvDetails({...invDetails, productName: e.target.value})} placeholder="Product Name" className="w-full p-2 border rounded text-sm" />
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="number" value={invDetails.quantity} onChange={e => setInvDetails({...invDetails, quantity: e.target.value})} placeholder="Qty (kg)" className="w-full p-2 border rounded text-sm" />
                                    <input type="number" value={invDetails.price} onChange={e => setInvDetails({...invDetails, price: e.target.value})} placeholder="Price ($)" className="w-full p-2 border rounded text-sm" />
                                </div>
                                <input value={invDetails.origin} onChange={e => setInvDetails({...invDetails, origin: e.target.value})} placeholder="Location Harvest" className="w-full p-2 border rounded text-sm" />
                                
                                <div className="flex gap-2 pt-2">
                                    <button onClick={() => submitInventory('ADD_ONLY')} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                                        <Plus size={16}/> Add to Inventory
                                    </button>
                                    <button onClick={() => submitInventory('SELL_NOW')} className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded-lg text-sm hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                                        <UploadCloud size={16}/> Sell to Customer
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">Current Stock</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                        {inventory.map(item => {
                            const product = products.find(p => p.id === item.productId);
                            const isMenuOpen = activeMenuId === item.id;
                            
                            return (
                                <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden relative group">
                                    <div className="h-48 bg-gray-100 relative">
                                        <img 
                                            src={item.batchImageUrl || product?.imageUrl} 
                                            alt={product?.name} 
                                            className="w-full h-full object-cover"
                                        />
                                        {/* Dropdown Button */}
                                        <div className="absolute top-2 right-2 z-10 inventory-menu-trigger">
                                            <button 
                                                onClick={() => setActiveMenuId(isMenuOpen ? null : item.id)}
                                                className="p-1.5 rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-sm transition-colors"
                                            >
                                                <MoreVertical size={20}/>
                                            </button>
                                            
                                            {isMenuOpen && (
                                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-20 animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
                                                    <button 
                                                        onClick={() => handleMenuAction('Sell', item)}
                                                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
                                                    >
                                                        <DollarSign size={16}/> Sell
                                                    </button>
                                                    <button 
                                                        onClick={() => handleMenuAction('Share', item)}
                                                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
                                                    >
                                                        <Share2 size={16}/> Share
                                                    </button>
                                                    <button 
                                                        onClick={() => handleMenuAction('Discount', item)}
                                                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
                                                    >
                                                        <Tag size={16}/> Add Discount
                                                    </button>
                                                    <button 
                                                        onClick={() => handleMenuAction('Charity', item)}
                                                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                    >
                                                        <Heart size={16}/> Charity
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                                            {item.status}
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-gray-900">{product?.name}</h3>
                                            <span className="text-emerald-600 font-bold">${product?.defaultPricePerKg.toFixed(2)}/kg</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-1">{item.quantityKg}kg Available</p>
                                        <div className="flex items-center gap-1 text-xs text-gray-400">
                                            <MapPin size={12}/> {item.harvestLocation || 'Unknown Location'}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        )}

        {/* LEADS / CUSTOMERS TAB */}
        {activeTab === 'leads' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-end">
                    <button 
                        onClick={() => setIsAddPartnerModalOpen(true)}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-emerald-700 shadow-sm"
                    >
                        <Plus size={18}/> Add Business
                    </button>
                </div>
                {leads.map(lead => (
                    <div key={lead.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-indigo-50 p-4 border-b border-indigo-100 flex justify-between items-center">
                            <h3 className="font-bold text-indigo-900">{lead.businessName}</h3>
                            <button onClick={() => submitLead(lead.id)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg">Submit Quote</button>
                        </div>
                        <div className="p-4">
                            {lead.requestedProducts.map((prod, idx) => (
                                <div key={idx} className="flex justify-between py-2 border-b border-gray-50">
                                    <span>{prod.productName}</span>
                                    <input type="number" className="w-20 border rounded px-2" placeholder="$" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* ONBOARDING TAB */}
        {activeTab === 'onboarding' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Settings</h2>
                    <button onClick={saveOnboarding} className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold">Save Settings</button>
                </div>
            </div>
        )}

        {/* CHAT DIALOG FOR NETWORK MATCHES */}
        {activeChatUser && (
            <ChatDialog 
                isOpen={!!activeChatUser}
                onClose={() => setActiveChatUser(null)}
                orderId="NET-CHAT"
                issueType={`Network Opportunity Chat`}
                repName={activeChatUser.businessName}
            />
        )}

        {/* ADD PARTNER MODAL */}
        {isAddPartnerModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Users className="text-emerald-600" size={24}/> Add New Connection
                        </h2>
                        <button onClick={() => setIsAddPartnerModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                    </div>
                    <form onSubmit={handleSendInvite} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Connection Type</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button 
                                    type="button" 
                                    onClick={() => setPartnerForm({...partnerForm, type: 'Customer'})}
                                    className={`py-2 px-3 rounded-lg border text-sm font-bold transition-all ${partnerForm.type === 'Customer' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-500'}`}
                                >
                                    Customer
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setPartnerForm({...partnerForm, type: 'Supplier'})}
                                    className={`py-2 px-3 rounded-lg border text-sm font-bold transition-all ${partnerForm.type === 'Supplier' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-gray-200 text-gray-500'}`}
                                >
                                    Supplier
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                            <input 
                                required 
                                type="text" 
                                placeholder="e.g. The Fresh Cafe"
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={partnerForm.businessName}
                                onChange={e => setPartnerForm({...partnerForm, businessName: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                            <input 
                                required 
                                type="text" 
                                placeholder="John Doe"
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={partnerForm.contactName}
                                onChange={e => setPartnerForm({...partnerForm, contactName: e.target.value})}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input 
                                    required 
                                    type="email" 
                                    placeholder="john@cafe.com"
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                    value={partnerForm.email}
                                    onChange={e => setPartnerForm({...partnerForm, email: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                                <input 
                                    type="tel" 
                                    placeholder="0400 000 000"
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                    value={partnerForm.phone}
                                    onChange={e => setPartnerForm({...partnerForm, phone: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button 
                                type="button" 
                                onClick={() => setIsAddPartnerModalOpen(false)}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold shadow-sm flex items-center gap-2"
                            >
                                <Send size={16}/> {partnerForm.phone ? 'Send Text Invite' : 'Send Link to Join'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

      {/* SELL MODAL */}
      {isSellModalOpen && itemToSell && (
          <SellProductDialog 
              isOpen={isSellModalOpen}
              onClose={() => setIsSellModalOpen(false)}
              product={mockService.getProduct(itemToSell.productId)!}
              onComplete={handleSellComplete}
          />
      )}

      {/* SHARE MODAL */}
      {itemToShare && (
          <ShareModal 
              item={itemToShare}
              onClose={() => setItemToShare(null)}
              onComplete={() => setItemToShare(null)}
          />
      )}

      {/* PACKING PORTAL MODAL */}
      {packingOrder && (
          <PackingPortal 
              order={packingOrder} 
              onClose={() => setPackingOrder(null)} 
              onComplete={handlePackingComplete}
              drivers={drivers}
          />
      )}

      {/* ASSIGN TEAM MODAL */}
      {assigningOrder && (
          <AssignTeamModal 
              order={assigningOrder} 
              packers={packers}
              drivers={drivers}
              onClose={() => setAssigningOrder(null)} 
              onConfirm={confirmAssignment}
          />
      )}
    </div>
  );
};
