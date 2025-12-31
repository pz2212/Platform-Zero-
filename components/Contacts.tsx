
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, InventoryItem, Product, ChatMessage, UserRole, Customer } from '../types';
import { mockService } from '../services/mockDataService';
import { triggerNativeSms, generateProductDeepLink } from '../services/smsService';
import { InviteBuyerModal } from './InviteBuyerModal';
import { 
  MessageCircle, Send, Plus, X, Search, Info, 
  ShoppingBag, Link as LinkIcon, CheckCircle, Clock,
  Store, MapPin, Phone, ShieldCheck, Tag, ChevronRight, Users, UserCheck,
  ArrowLeft, UserPlus, Smartphone, Contact, Loader2, Building, Mail, BookOpen,
  Package, DollarSign, Truck, Camera, Image as ImageIcon, ChevronDown, FolderOpen,
  Sprout, ShoppingCart, MessageSquare, Globe, ArrowUpRight, HelpCircle
} from 'lucide-react';

interface ContactsProps {
  user: User;
}

const AU_STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];

// Comprehensive Data Expanded from SA Produce Market Directory
const SA_PRODUCE_MARKET_SUPPLIERS = [
    { name: 'AMJ Produce', mobile: '08 8349 4500', email: 'sales@amjproduce.com.au', location: 'Burma Drive, Pooraka', specialty: 'Fruit & Veg', store: 'Store 1' },
    { name: 'Bache Bros', mobile: '08 8349 4555', email: 'bachebros@internode.on.net', location: 'Pooraka Market', specialty: 'Potatoes & Onions', store: 'Store 60' },
    { name: 'Ceravolo Orchards', mobile: '08 8389 6188', email: 'info@ceravolo.com.au', location: 'Adelaide Hills / Pooraka', specialty: 'Apples, Pears, Cherries', store: 'Store 32' },
    { name: 'Costa Group (SA)', mobile: '08 8349 4544', email: 'sa.sales@costagroup.com.au', location: 'Market Complex, Pooraka', specialty: 'Global Produce', store: 'Store 101' },
    { name: 'GD Produce', mobile: '08 8349 4444', email: 'sales@gdproduce.com.au', location: 'Wholesale Store 12', specialty: 'Leafy Greens', store: 'Store 12' },
    { name: 'Mackays Produce', mobile: '08 8349 4333', email: 'sales@mackays.com.au', location: 'Wholesale Store 45', specialty: 'Bananas & Tropical', store: 'Store 45' },
    { name: 'Perfection Fresh', mobile: '08 8349 4222', email: 'sales@perfection.com.au', location: 'Pooraka Hub', specialty: 'Branded Specialty', store: 'Store 52' },
    { name: 'Quality Produce International', mobile: '08 8349 4111', email: 'info@qpi.com.au', location: 'Pooraka Market Store', specialty: 'Export Quality', store: 'Store 27' },
    { name: 'SA Potato Company', mobile: '08 8349 4000', email: 'admin@sapota.com.au', location: 'Potatoes Central', specialty: 'Potatoes', store: 'Store 70' },
    { name: 'Vizzarri Farms', mobile: '08 8349 3999', email: 'admin@vizzarri.com.au', location: 'Pooraka HQ', specialty: 'Fresh Herbs', store: 'Store 88' },
    { name: 'A&S Produce', mobile: '08 8349 6177', email: 'sales@asproduce.com.au', location: 'Wholesale Store 2', specialty: 'General Fruit', store: 'Store 2' },
    { name: 'ADT Produce', mobile: '08 8349 6633', email: 'info@adtproduce.com.au', location: 'Wholesale Store 21', specialty: 'Vegetables', store: 'Store 21' },
    { name: 'B&A Produce', mobile: '08 8349 4118', email: 'orders@baproduce.com.au', location: 'Market Shed C', specialty: 'Root Veg', store: 'Shed C' },
    { name: 'Scalzi Produce', mobile: '08 8349 9900', email: 'orders@scalzi.com.au', location: 'Store 55', specialty: 'Asian Greens', store: 'Store 55' },
    { name: 'Sunrise Produce', mobile: '08 8349 1122', email: 'sales@sunriseproduce.com.au', location: 'Wholesale Hub', specialty: 'Apples & Pears', store: 'Store 35' },
    { name: 'George Harrison & Sons', mobile: '08 8349 4011', email: 'sales@gharrison.com.au', location: 'Pooraka Store 4', specialty: 'Stonefruit', store: 'Store 4' },
    { name: 'Interfruiter', mobile: '08 8349 4322', email: 'orders@interfruiter.com.au', location: 'Pooraka Market', specialty: 'Specialty Fruit', store: 'Store 18' },
    { name: 'Kapiris Bros', mobile: '08 8349 4110', email: 'sa@kapirisbros.com.au', location: 'Pooraka Store 8', specialty: 'Tomatoes', store: 'Store 8' },
    { name: 'M&C Giosia', mobile: '08 8349 4599', email: 'admin@mcgiosia.com.au', location: 'Pooraka Store 22', specialty: 'Mixed Veg', store: 'Store 22' },
    { name: 'Marinucci Produce', mobile: '08 8349 4088', email: 'sales@marinucci.com.au', location: 'Pooraka Store 14', specialty: 'Leafy Greens', store: 'Store 14' },
    { name: 'Northern Citrus', mobile: '08 8349 4255', email: 'sales@northerncitrus.com.au', location: 'Pooraka Store 5', specialty: 'Citrus', store: 'Store 5' },
    { name: 'Pivotal Produce', mobile: '08 8349 4144', email: 'sales@pivotal.com.au', location: 'Pooraka Store 33', specialty: 'Berries', store: 'Store 33' },
    { name: 'Thorndon Park Produce', mobile: '08 8349 4600', email: 'sales@thorndonpark.com.au', location: 'Pooraka Store 11', specialty: 'Celery & Lettuce', store: 'Store 11' },
    { name: 'Venus Citrus', mobile: '08 8349 4122', email: 'sales@venuscitrus.com.au', location: 'Pooraka Store 9', specialty: 'Oranges', store: 'Store 9' },
    { name: 'Zest Produce', mobile: '08 8349 4888', email: 'sales@zestproduce.com.au', location: 'Pooraka Store 41', specialty: 'Exotics', store: 'Store 41' },
];

const SendProductOfferModal = ({ isOpen, onClose, targetPartner, products }: { 
    isOpen: boolean, 
    onClose: () => void, 
    targetPartner: any, 
    products: Product[]
}) => {
    const [offerData, setOfferData] = useState({
        productId: '',
        price: '',
        unit: 'KG',
        minOrder: '',
        logisticsPrice: '0',
    });
    const [customImage, setCustomImage] = useState<string | null>(null);
    const [isSubmitting, setSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    if (!isOpen) return null;

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => setCustomImage(ev.target?.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const mobile = targetPartner.mobile || targetPartner.phone;
        if (!mobile) { alert("No mobile number available."); return; }
        setSubmitting(true);
        const productName = products.find(p => p.id === offerData.productId)?.name || "Fresh Produce";
        const message = `PZ OFFER: ${productName}\nPrice: $${offerData.price}/${offerData.unit}\nMin Order: ${offerData.minOrder}${offerData.unit}\nView & Accept: ${generateProductDeepLink('quote', 'off-' + Date.now())}`;
        triggerNativeSms(mobile, message);
        setTimeout(() => { setSubmitting(false); alert("Offer sent via native SMS!"); onClose(); }, 800);
    };

    return (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div><h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Direct Photo Offer</h2><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Target: {targetPartner.name || targetPartner.businessName}</p></div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2"><X size={24}/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div onClick={() => fileInputRef.current?.click()} className={`h-48 border-4 border-dashed rounded-[2rem] flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all bg-gray-50 shadow-inner-sm ${customImage ? 'border-emerald-500' : 'border-gray-200 hover:border-indigo-400'}`}>
                        {customImage ? <img src={customImage} className="w-full h-full object-cover" alt=""/> : <div className="text-center"><Camera size={32} className="text-gray-300 mx-auto mb-2"/><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Product Photo</p></div>}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFile}/>
                    </div>
                    <div className="space-y-4">
                        <select required className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50/10" value={offerData.productId} onChange={e => setOfferData({...offerData, productId: e.target.value})}>
                            <option value="">Select Catalog Variety...</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <div className="grid grid-cols-2 gap-3">
                            <input required type="number" step="0.01" placeholder="Price ($/kg)" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50/10" value={offerData.price} onChange={e => setOfferData({...offerData, price: e.target.value})}/>
                            <input required type="number" placeholder="Min Qty (kg)" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50/10" value={offerData.minOrder} onChange={e => setOfferData({...offerData, minOrder: e.target.value})}/>
                        </div>
                    </div>
                    <button type="submit" disabled={isSubmitting || !customImage || !offerData.productId} className="w-full py-5 bg-[#043003] text-white rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
                        {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <><Send size={18}/> Dispatch to Buyer</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export const Contacts: React.FC<ContactsProps> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const targetId = queryParams.get('id');
  const tabParam = queryParams.get('tab');

  const [activeTab, setActiveTab] = useState<'customers' | 'suppliers'>(tabParam === 'suppliers' ? 'suppliers' : 'customers');
  const [selectedState, setSelectedState] = useState('SA');
  const [activeContact, setActiveContact] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sendProductTarget, setSendProductTarget] = useState<any>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [myCustomers, setMyCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    setActiveTab(tabParam === 'suppliers' ? 'suppliers' : 'customers');
  }, [tabParam]);

  useEffect(() => {
    setProducts(mockService.getAllProducts());
    setMyCustomers(mockService.getCustomers());
    
    if (targetId) {
      const found = mockService.getAllUsers().find(u => u.id === targetId);
      if (found) {
        setActiveContact(found);
        setMessages(mockService.getChatMessages(user.id, targetId));
      }
    } else {
      setActiveContact(null);
    }
  }, [targetId, user.id]);

  const handleSendMessage = (text: string) => {
    if (!activeContact || !text.trim()) return;
    mockService.sendChatMessage(user.id, activeContact.id, text);
    setMessages(mockService.getChatMessages(user.id, activeContact.id));
    setInputText('');
  };

  const filteredCustomers = myCustomers.filter(c => 
    c.connectedSupplierId === user.id &&
    (c.businessName.toLowerCase().includes(searchTerm.toLowerCase()) || 
     c.contactName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredSaSuppliers = selectedState === 'SA' 
    ? SA_PRODUCE_MARKET_SUPPLIERS.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      ) 
    : [];

  const getStatusConfig = (status: string | undefined) => {
      switch(status) {
          case 'Active': return { color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: UserCheck };
          case 'Pending Connection': return { color: 'text-orange-600 bg-orange-50 border-orange-100', icon: Clock };
          case 'Pricing Pending': return { color: 'text-blue-600 bg-blue-50 border-blue-100', icon: DollarSign };
          default: return { color: 'text-gray-500 bg-gray-50 border-gray-100', icon: HelpCircle };
      }
  };

  if (activeContact) {
      return (
          <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate('/contacts')} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><ArrowLeft size={20}/></button>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg bg-indigo-100 text-indigo-700 shadow-inner-sm`}>{activeContact.businessName.charAt(0)}</div>
                <div><h2 className="font-black text-gray-900 text-xl tracking-tight leading-none uppercase">{activeContact.businessName}</h2><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{activeContact.role}</p></div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/30 custom-scrollbar">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-5 rounded-[1.75rem] text-sm max-w-[75%] shadow-sm ${msg.senderId === user.id ? 'bg-[#043003] text-white rounded-br-none' : 'bg-white text-gray-900 border border-gray-100 rounded-bl-none'}`}>
                        {msg.text}
                    </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                    <MessageSquare size={48} className="opacity-10 mb-4"/>
                    <p className="text-xs font-black uppercase tracking-widest">Start the conversation</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-100 bg-white">
                <div className="flex gap-4">
                    <input type="text" placeholder="Type a message..." className="flex-1 bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-900 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all" value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage(inputText)} />
                    <button onClick={() => handleSendMessage(inputText)} className="p-4 bg-[#043003] text-white rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95"><Send size={20}/></button>
                </div>
            </div>
          </div>
      );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="px-2 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white rounded-[1.25rem] shadow-sm border border-gray-100 flex items-center justify-center text-[#043003]">
                {activeTab === 'customers' ? <Users size={36} /> : <Store size={36} />}
            </div>
            <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase leading-none">{activeTab === 'customers' ? 'Buyer Network' : 'Market Suppliers'}</h1>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-2">{activeTab === 'customers' ? 'Connected accounts & manual lead management' : 'South Australian Produce Market Directory'}</p>
            </div>
          </div>
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input 
                type="text" 
                placeholder={activeTab === 'customers' ? "Search connected buyers..." : "Search SA wholesalers..."} 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full pl-14 pr-8 py-5 bg-white border-2 border-gray-100 rounded-[1.5rem] text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-indigo-50/5 transition-all shadow-sm"
            />
          </div>
      </div>

      <div className="bg-gray-100/50 p-1.5 rounded-[1.5rem] inline-flex border border-gray-200 shadow-sm mx-2">
        <button onClick={() => setActiveTab('customers')} className={`px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === 'customers' ? 'bg-white text-gray-900 shadow-md ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}>My Customers</button>
        <button onClick={() => setActiveTab('suppliers')} className={`px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 whitespace-nowrap ${activeTab === 'suppliers' ? 'bg-white text-gray-900 shadow-md ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}><Globe size={14}/> Wholesale Suppliers</button>
      </div>
      
      {activeTab === 'customers' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2">
              <div onClick={() => setIsInviteModalOpen(true)} className="border-4 border-dashed border-gray-100 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center group hover:bg-emerald-50/30 hover:border-emerald-200 transition-all cursor-pointer min-h-[400px] shadow-inner-sm bg-white/50">
                  <div className="w-20 h-20 bg-white rounded-[1.5rem] shadow-xl flex items-center justify-center mb-8 border border-gray-50 transition-transform group-hover:scale-110 group-hover:-rotate-3 group-hover:shadow-emerald-100">
                    <UserPlus size={36} className="text-emerald-500"/>
                  </div>
                  <h3 className="text-2xl font-black text-gray-400 group-hover:text-gray-900 tracking-tight uppercase leading-none">Provision Buyer</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-4 max-w-[180px]">Generate a direct-connect onboarding portal link</p>
              </div>

              {filteredCustomers.map(contact => {
                  const statusCfg = getStatusConfig(contact.connectionStatus);
                  const StatusIcon = statusCfg.icon;
                  return (
                    <div key={contact.id} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group flex flex-col justify-between min-h-[400px] animate-in zoom-in-95 duration-300">
                        <div>
                            <div className="flex items-start justify-between mb-8">
                                <div className="w-16 h-16 rounded-[1.25rem] bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-3xl shadow-inner-sm border border-indigo-100/50">{contact.businessName.charAt(0)}</div>
                                <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-sm ${statusCfg.color}`}>
                                    <StatusIcon size={16}/>
                                    <span className="text-[10px] font-black uppercase tracking-widest">{contact.connectionStatus || 'Connected'}</span>
                                </div>
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tighter group-hover:text-indigo-600 mb-1 uppercase leading-none transition-colors">{contact.businessName}</h3>
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-6">{contact.category || 'MARKETPLACE BUYER'}</p>
                            
                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-6">
                                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                                    <Store size={12} className="text-indigo-400"/> Primary Supplier Link
                                </div>
                                <p className="text-xs font-black text-gray-900 uppercase tracking-tight truncate">
                                    {contact.connectedSupplierName || 'Direct Platform Zero'}
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-4 text-xs text-gray-500 font-bold uppercase tracking-wide truncate"><div className="p-2 bg-gray-50 rounded-lg text-gray-300"><Mail size={16}/></div> {contact.email}</div>
                                <div className="flex items-center gap-4 text-xs text-gray-500 font-bold uppercase tracking-wide"><div className="p-2 bg-gray-50 rounded-lg text-gray-300"><Smartphone size={16}/></div> {contact.phone || '0400 123 456'}</div>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-8">
                            <button onClick={() => setSendProductTarget(contact)} className="flex-1 py-4 bg-white border-2 border-indigo-100 text-indigo-600 rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest transition-all hover:bg-indigo-600 hover:text-white shadow-sm active:scale-95"><Camera size={16}/> Offer</button>
                            <button onClick={() => navigate(`/contacts?id=${contact.id}`)} className="flex-[2] py-4 bg-[#043003] text-white rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest transition-all hover:bg-black shadow-xl active:scale-95 flex items-center justify-center gap-2"><MessageSquare size={18}/> Manage</button>
                        </div>
                    </div>
                  );
              })}
          </div>
      ) : (
          <div className="space-y-8 px-2">
              <div className="bg-white p-2 rounded-[1.5rem] border border-gray-200 shadow-sm flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full">
                {AU_STATES.map(state => <button key={state} onClick={() => setSelectedState(state)} className={`flex-1 min-w-[100px] py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all shrink-0 ${selectedState === state ? 'bg-[#043003] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}>{state}</button>)}
              </div>
              
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-10 bg-gray-50/50 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-2xl shadow-sm text-emerald-600 ring-1 ring-black/5"><Store size={28}/></div>
                        <div>
                          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight leading-none">{selectedState} Wholesale Directory</h2>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1.5">Official Market Trading Entities</p>
                        </div>
                      </div>
                      {selectedState === 'SA' && (
                        <a href="https://www.saproducemarket.com.au/directory/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-600 bg-white px-5 py-2.5 rounded-xl border border-indigo-100 shadow-sm hover:bg-indigo-50 transition-all">Official Directory <ArrowUpRight size={14}/></a>
                      )}
                  </div>
                  <div className="overflow-x-auto">
                    {filteredSaSuppliers.length > 0 ? (
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead className="bg-white text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                <tr>
                                  <th className="px-10 py-6">Trading Entity</th>
                                  <th className="px-10 py-6">Contact Detail</th>
                                  <th className="px-10 py-6">Market Location</th>
                                  <th className="px-10 py-6">Category</th>
                                  <th className="px-10 py-6 text-right">Market Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredSaSuppliers.map((supplier, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="px-10 py-8">
                                          <div className="font-black text-gray-900 tracking-tight text-lg uppercase leading-none mb-1.5">{supplier.name}</div>
                                          <div className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{supplier.store}</div>
                                        </td>
                                        <td className="px-10 py-8">
                                          <div className="flex items-center gap-2 text-sm font-bold text-gray-500 mb-1"><Smartphone size={14} className="text-gray-300"/> {supplier.mobile}</div>
                                          <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1.5"><Mail size={12} className="text-indigo-300"/> {supplier.email}</div>
                                        </td>
                                        <td className="px-10 py-8">
                                          <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-bold uppercase"><MapPin size={12} className="text-gray-300"/> {supplier.location}</div>
                                        </td>
                                        <td className="px-10 py-8">
                                          <span className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-inner-sm">{supplier.specialty}</span>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex justify-end gap-3">
                                                <button onClick={() => triggerNativeSms(supplier.mobile, `Hi ${supplier.name}, checking price for today's market...`)} className="p-4 bg-white border border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-200 rounded-2xl transition-all shadow-sm active:scale-90 group-hover:shadow-md" title="Send Message"><Smartphone size={20}/></button>
                                                <button onClick={() => setSendProductTarget(supplier)} className="p-4 bg-white border border-gray-200 text-gray-400 hover:text-orange-600 hover:border-orange-200 rounded-2xl transition-all shadow-sm active:scale-90 group-hover:shadow-md" title="Create Visual Offer"><Camera size={20}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                      ) : (
                        <div className="py-32 text-center flex flex-col items-center gap-6">
                          <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center border-2 border-dashed border-gray-200">
                            <Globe size={48} className="text-gray-200"/>
                          </div>
                          <div>
                            <h3 className="text-2xl font-black text-gray-300 uppercase tracking-tighter">No Network Found</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">Connecting global supply for {selectedState}...</p>
                          </div>
                        </div>
                      )}
                  </div>
              </div>
          </div>
      )}
      {sendProductTarget && (
        <SendProductOfferModal 
          isOpen={!!sendProductTarget} 
          onClose={() => setSendProductTarget(null)} 
          targetPartner={sendProductTarget} 
          products={products}
        />
      )}
      <InviteBuyerModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} wholesaler={user} />
    </div>
  );
};
