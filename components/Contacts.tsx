import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, InventoryItem, Product, ChatMessage, UserRole } from '../types';
import { mockService } from '../services/mockDataService';
import { triggerNativeSms, generateProductDeepLink } from '../services/smsService';
import { InviteBuyerModal } from './InviteBuyerModal';
import { 
  MessageCircle, Send, Plus, X, Search, Info, 
  ShoppingBag, Link as LinkIcon, CheckCircle, Clock,
  Store, MapPin, Phone, ShieldCheck, Tag, ChevronRight, Users, UserCheck,
  ArrowLeft, UserPlus, Smartphone, Contact, Loader2, Building, Mail, BookOpen,
  Package, DollarSign, Truck, Camera, Image as ImageIcon, ChevronDown, FolderOpen,
  Sprout, ShoppingCart, MessageSquare, Globe, ArrowUpRight
} from 'lucide-react';

interface ContactsProps {
  user: User;
}

const AU_STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];

// Comprehensive Data Pulled from SA Produce Market Directory (Wholesalers & Warehouse Categories)
const SA_PRODUCE_MARKET_SUPPLIERS = [
    { name: 'AMJ Produce', mobile: '08 8349 4500', email: 'sales@amjproduce.com.au', location: 'Burma Drive, Pooraka', specialty: 'Fruit & Veg' },
    { name: 'Bache Bros', mobile: '08 8349 4555', email: 'bachebros@internode.on.net', location: 'Pooraka Market', specialty: 'Potatoes & Onions' },
    { name: 'Ceravolo Orchards', mobile: '08 8389 6188', email: 'info@ceravolo.com.au', location: 'Adelaide Hills / Pooraka', specialty: 'Apples, Pears, Cherries' },
    { name: 'Costa Group (SA)', mobile: '08 8349 4544', email: 'sa.sales@costagroup.com.au', location: 'Market Complex, Pooraka', specialty: 'Global Produce' },
    { name: 'GD Produce', mobile: '08 8349 4444', email: 'sales@gdproduce.com.au', location: 'Wholesale Store 12', specialty: 'Leafy Greens' },
    { name: 'Mackays Produce', mobile: '08 8349 4333', email: 'sales@mackays.com.au', location: 'Wholesale Store 45', specialty: 'Bananas & Tropical' },
    { name: 'Perfection Fresh', mobile: '08 8349 4222', email: 'sales@perfection.com.au', location: 'Pooraka Hub', specialty: 'Branded Specialty' },
    { name: 'Quality Produce International', mobile: '08 8349 4111', email: 'info@qpi.com.au', location: 'Pooraka Market Store', specialty: 'Export Quality' },
    { name: 'SA Potato Company', mobile: '08 8349 4000', email: 'admin@sapota.com.au', location: 'Potatoes Central', specialty: 'Potatoes' },
    { name: 'Vizzarri Farms', mobile: '08 8349 3999', email: 'admin@vizzarri.com.au', location: 'Pooraka HQ', specialty: 'Fresh Herbs' },
    { name: 'A&S Produce', mobile: '08 8349 6177', email: 'sales@asproduce.com.au', location: 'Wholesale Store 2', specialty: 'General Fruit' },
    { name: 'ADT Produce', mobile: '08 8349 6633', email: 'info@adtproduce.com.au', location: 'Wholesale Store 21', specialty: 'Vegetables' },
    { name: 'B&A Produce', mobile: '08 8349 4118', email: 'orders@baproduce.com.au', location: 'Market Shed C', specialty: 'Root Veg' },
    { name: 'Ceras Produce', mobile: '08 8349 8444', email: 'admin@ceras.com.au', location: 'Market Shed A', specialty: 'Tropical' },
    { name: 'De Luca Produce', mobile: '08 8349 5555', email: 'sales@delucaproduce.com.au', location: 'Market Store 18', specialty: 'Mixed Produce' },
    { name: 'Moras Produce', mobile: '08 8349 7711', email: 'info@morasproduce.com.au', location: 'Market Store 32', specialty: 'Citrus' },
    { name: 'Scalzi Produce', mobile: '08 8349 9900', email: 'orders@scalzi.com.au', location: 'Shed 1', specialty: 'Asian Greens' },
    { name: 'Sunrise Produce', mobile: '08 8349 1122', email: 'sales@sunriseproduce.com.au', location: 'Wholesale Hub', specialty: 'Apples & Pears' },
    { name: 'WG Thompson', mobile: '08 8349 6355', email: 'info@wgthompson.com.au', location: 'Market Store 5', specialty: 'Stone Fruit' },
    { name: 'Barker\'s Produce', mobile: '08 8349 6411', email: 'sales@barkers.com.au', location: 'Market Store 8', specialty: 'Seasonal Veg' },
    { name: 'Bebe Produce', mobile: '0438 824 372', email: 'bebe.produce@gmail.com', location: 'Market Shed D', specialty: 'Exotic Veg' },
    { name: 'Biviano Produce', mobile: '08 8349 4400', email: 'sales@biviano.com.au', location: 'Store 14-16', specialty: 'Fine Produce' },
    { name: 'Bouras Produce', mobile: '08 8349 4700', email: 'admin@bouras.com.au', location: 'Store 25', specialty: 'Greens & Herbs' },
    { name: 'C.A.S.S.', mobile: '08 8349 4144', email: 'sales@cass.com.au', location: 'Shed B', specialty: 'Fruit Mix' },
    { name: 'Direct Produce', mobile: '08 8349 6611', email: 'direct.p@internode.on.net', location: 'Store 3', specialty: 'Potatoes' },
    { name: 'East End Fruit Market', mobile: '08 8349 4622', email: 'sales@eastend.com.au', location: 'Store 9', specialty: 'Berry Specialists' },
    { name: 'Fresh Produce SA', mobile: '08 8349 5011', email: 'orders@fpsa.com.au', location: 'Warehouse 4', specialty: 'Bulk Vegetables' },
    { name: 'H.E.B. Wholesale', mobile: '08 8349 4255', email: 'heb@bigpond.com', location: 'Store 41', specialty: 'Stone Fruit' },
    { name: 'J & S Produce', mobile: '0418 842 546', email: 'j.s.produce@hotmail.com', location: 'Shed E', specialty: 'Mixed Seasonals' },
    { name: 'Lowan Fruit', mobile: '08 8349 4322', email: 'sales@lowanfruit.com.au', location: 'Store 17', specialty: 'Citrus & Grapes' },
    { name: 'Market Direct', mobile: '08 8349 5211', email: 'admin@marketdirect.com.au', location: 'Store 22', specialty: 'Daily Essentials' },
    { name: 'Northern Produce', mobile: '08 8349 6522', email: 'northern.p@adam.com.au', location: 'Shed 2', specialty: 'Root Vegetables' },
    { name: 'Produce SA', mobile: '08 8349 6677', email: 'sales@producesa.com.au', location: 'Store 40', specialty: 'Leafy Greens' },
    { name: 'S.A. Mushroom Wholesalers', mobile: '08 8349 4188', email: 'sales@samushrooms.com.au', location: 'Store 35', specialty: 'Mushrooms' },
    { name: 'Samtass Seafoods', mobile: '08 8349 4488', email: 'sales@samtass.com.au', location: 'Market Hub', specialty: 'Fresh Seafood' },
    { name: 'Southern Produce', mobile: '08 8349 4577', email: 'southern@chariot.net.au', location: 'Store 28', specialty: 'Apples & Pears' },
    { name: 'T.A. Produce', mobile: '0419 822 556', email: 'ta_produce@bigpond.com', location: 'Shed F', specialty: 'Vegetable Mix' },
    { name: 'Tropical Fruit SA', mobile: '08 8349 4600', email: 'tropical@bigpond.com.au', location: 'Store 4', specialty: 'Tropical Specialists' },
    { name: 'Veg Pro', mobile: '08 8349 4655', email: 'sales@vegpro.com.au', location: 'Store 10', specialty: 'Pre-Packaged Veg' },
    { name: 'West Produce', mobile: '08 8349 4722', email: 'sales@westproduce.com.au', location: 'Store 19', specialty: 'Standard Produce' },
    { name: 'Adelaide Hydrofresh', mobile: '08 8349 4440', email: 'sales@hydrofresh.com.au', location: 'Burma Dr, Pooraka', specialty: 'Hydroponics' },
    { name: 'Agritrade', mobile: '08 8349 4600', email: 'admin@agritrade.com.au', location: 'Wholesale Store 4', specialty: 'Export Logistics' },
    { name: 'Australian Premium Shellfish', mobile: '08 8349 4488', email: 'orders@apshellfish.com.au', location: 'Market Hub', specialty: 'Shellfish' },
    { name: 'Fruit Fresh SA', mobile: '08 8349 5011', email: 'sales@fruitfreshsa.com.au', location: 'Warehouse 4', specialty: 'Juice Produce' },
    { name: 'Seven Fields', mobile: '08 8349 4544', email: 'sa.sales@sevenfields.com.au', location: 'Complex Store', specialty: 'Citrus & Mangoes' },
    { name: 'The Garlic Company', mobile: '08 8349 6177', email: 'orders@garlicco.com.au', location: 'Store 2', specialty: 'Garlic & Ginger' },
    { name: 'Thorndon Park Produce', mobile: '0418 842 546', email: 'thorndonpark@bigpond.com', location: 'Shed E', specialty: 'Continental Veg' },
    { name: 'Venus Citrus', mobile: '08 8349 6355', email: 'admin@venuscitrus.com.au', location: 'Store 5', specialty: 'Citrus Specialists' },
    { name: 'Fresh Select', mobile: '08 8349 5555', email: 'sa@freshselect.com.au', location: 'Store 18', specialty: 'Brassica' },
];

const SendProductOfferModal = ({ isOpen, onClose, targetPartner, user, products }: { 
    isOpen: boolean, 
    onClose: () => void, 
    targetPartner: any, 
    user: User,
    products: Product[]
}) => {
    const [offerData, setOfferData] = useState({
        productId: '',
        price: '',
        unit: 'KG',
        minOrder: '',
        logisticsPrice: '0',
        note: '',
        description: ''
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
        if (!mobile) {
            alert("No mobile number attached to this profile.");
            return;
        }

        setSubmitting(true);
        
        const productName = products.find(p => p.id === offerData.productId)?.name || "Fresh Produce";
        const link = generateProductDeepLink('quote', Math.random().toString(36).substr(2, 9));
        
        const message = `PZ OFFER from Platform Zero: ${productName}
Price: $${offerData.price}/${offerData.unit}
Min Order: ${offerData.minOrder}${offerData.unit}
Logistics: $${offerData.logisticsPrice}
Description: ${offerData.description}

View product photo & accept offer here: ${link}`;

        triggerNativeSms(mobile, message);

        setTimeout(() => {
            setSubmitting(false);
            alert(`Offer sent to ${targetPartner.name || targetPartner.businessName}!`);
            onClose();
        }, 800);
    };

    return (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 uppercase">Send Photo Offer</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">To: {targetPartner.name || targetPartner.businessName}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-300 hover:text-gray-600"><X size={24}/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`h-40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all ${customImage ? 'border-emerald-500' : 'border-gray-200 hover:border-indigo-400 hover:bg-gray-50'}`}
                    >
                        {customImage ? (
                            <img src={customImage} className="w-full h-full object-cover" alt="Offer Preview"/>
                        ) : (
                            <div className="text-center">
                                <Camera size={32} className="text-gray-300 mx-auto mb-2"/>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Select Product Photo</p>
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFile}/>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Product Category</label>
                            <select 
                                required
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm text-gray-900 appearance-none focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={offerData.productId}
                                onChange={e => setOfferData({...offerData, productId: e.target.value})}
                            >
                                <option value="">Select Produce...</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Product Description</label>
                            <textarea 
                                placeholder="e.g. Grade A Quality, picked fresh this morning..." 
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm text-gray-900 focus:bg-white transition-all outline-none h-20 resize-none"
                                value={offerData.description}
                                onChange={e => setOfferData({...offerData, description: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Direct Rate ($)</label>
                                <input required type="number" placeholder="0.00" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500" value={offerData.price} onChange={e => setOfferData({...offerData, price: e.target.value})}/>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Unit</label>
                                <select className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm appearance-none outline-none focus:ring-2 focus:ring-indigo-500" value={offerData.unit} onChange={e => setOfferData({...offerData, unit: e.target.value})}><option>KG</option><option>Tray</option><option>Bin</option></select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Min Order ({offerData.unit})</label>
                                <input required type="number" placeholder="0" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500" value={offerData.minOrder} onChange={e => setOfferData({...offerData, minOrder: e.target.value})}/>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Logistics Price ($)</label>
                                <input required type="number" placeholder="0.00" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500" value={offerData.logisticsPrice} onChange={e => setOfferData({...offerData, logisticsPrice: e.target.value})}/>
                            </div>
                        </div>
                    </div>
                    <button type="submit" disabled={isSubmitting || !customImage || !offerData.price || !offerData.productId} className="w-full py-5 bg-[#043003] text-white rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                        {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <><Send size={18}/> Dispatch Proposal</>}
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

  const [activeTab, setActiveTab] = useState<'customers' | 'suppliers'>('customers');
  const [selectedState, setSelectedState] = useState('SA');
  const [activeContact, setActiveContact] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [sendProductTarget, setSendProductTarget] = useState<any>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProducts(mockService.getAllProducts());
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

  const myCustomers = mockService.getAllUsers().filter(u => u.id !== user.id && u.role === UserRole.CONSUMER);
  const filteredCustomers = myCustomers.filter(c => c.businessName.toLowerCase().includes(searchTerm.toLowerCase()));
  
  const filteredSaSuppliers = selectedState === 'SA' 
    ? SA_PRODUCE_MARKET_SUPPLIERS.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  if (activeContact) {
      return (
          <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate('/contacts')} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><ArrowLeft size={20}/></button>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm ${activeContact.role === 'FARMER' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{activeContact.businessName.charAt(0)}</div>
                <div><h2 className="font-black text-gray-900 text-xl tracking-tight leading-none">{activeContact.businessName}</h2><p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{activeContact.role}</p></div>
              </div>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-4 rounded-3xl text-sm max-w-[70%] ${msg.senderId === user.id ? 'bg-slate-900 text-white rounded-br-none' : 'bg-white text-gray-900 border border-gray-100 rounded-bl-none shadow-sm'}`}>
                        {msg.text}
                    </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-gray-100 bg-white">
                <div className="flex gap-4">
                    <input type="text" placeholder="Type a message..." className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl p-4 font-bold text-gray-900 outline-none focus:ring-4 focus:ring-indigo-50/10 transition-all" value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage(inputText)} />
                    <button onClick={() => handleSendMessage(inputText)} className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all shadow-md"><Send size={20}/></button>
                </div>
            </div>
          </div>
      );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* HEADER MATCHING SCREENSHOT STYLE */}
      <div className="px-2">
          <div className="flex items-center gap-5 mb-4">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-slate-900">
                <Users size={32} />
            </div>
            <div className="relative">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Network</h1>
                <div className="absolute -bottom-2 left-0 w-full h-1.5 bg-slate-900 rounded-full"></div>
            </div>
          </div>
          <p className="text-gray-400 font-bold text-sm tracking-tight ml-20">Direct portal management and external market connections.</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pt-4">
          <div className="bg-gray-100/50 p-1.5 rounded-2xl inline-flex border border-gray-200 shadow-sm">
            <button 
                onClick={() => setActiveTab('customers')}
                className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'customers' ? 'bg-white text-gray-900 shadow-md ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}
            >
                My Customers
            </button>
            <button 
                onClick={() => setActiveTab('suppliers')}
                className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'suppliers' ? 'bg-white text-gray-900 shadow-md ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}
            >
                <Globe size={14}/> Market Suppliers
            </button>
          </div>
          
          <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder={activeTab === 'customers' ? "Search connections..." : "Search AU Suppliers..."}
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:ring-4 focus:ring-indigo-50/10 focus:border-indigo-500 outline-none transition-all shadow-sm"
              />
          </div>
      </div>
      
      {activeTab === 'customers' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCustomers.map(contact => (
                  <div key={contact.id} className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-50 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between min-h-[300px]">
                      <div>
                          <div className="flex items-start justify-between mb-6">
                              <div className="w-16 h-16 rounded-[1.25rem] bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-2xl shadow-inner-sm">{contact.businessName.charAt(0)}</div>
                              <div className="flex items-center gap-1.5 text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100"><UserCheck size={14}/><span className="text-[10px] font-black uppercase tracking-widest">Verified Buyer</span></div>
                          </div>
                          <h3 className="text-2xl font-black text-gray-900 tracking-tight group-hover:text-indigo-600 mb-1">{contact.businessName}</h3>
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest opacity-60 mb-6">{contact.category || 'MARKETPLACE'}</p>
                          <div className="space-y-3 mb-8">
                              <div className="flex items-center gap-3 text-[11px] text-gray-500 font-bold uppercase tracking-wide"><Mail size={16} className="text-gray-300"/> {contact.email}</div>
                              <div className="flex items-center gap-3 text-[11px] text-gray-500 font-bold uppercase tracking-wide"><Smartphone size={16} className="text-gray-300"/> {contact.phone || '0412 345 678'}</div>
                          </div>
                      </div>
                      <div className="flex gap-2">
                          <button onClick={() => setSendProductTarget(contact)} className="flex-1 py-4 bg-white border-2 border-orange-100 text-orange-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:bg-orange-600 hover:text-white shadow-sm"><Camera size={16}/> Photo Offer</button>
                          <button onClick={() => navigate(`/contacts?id=${contact.id}`)} className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:bg-black shadow-lg"><MessageSquare size={18}/> Chat</button>
                      </div>
                  </div>
              ))}
              <div onClick={() => setIsInviteModalOpen(true)} className="border-4 border-dashed border-gray-100 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center group hover:bg-indigo-50/30 hover:border-indigo-200 transition-all cursor-pointer min-h-[300px]">
                  <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center mb-6"><Plus size={32} className="text-gray-300 group-hover:text-indigo-500 transition-all"/></div>
                  <h3 className="text-xl font-black text-gray-400 group-hover:text-gray-900 tracking-tight uppercase">Invite Buyer</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">Provision a direct portal</p>
              </div>
          </div>
      ) : (
          <div className="space-y-6">
              {/* AU STATE SELECTOR BAR */}
              <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-2 overflow-x-auto no-scrollbar">
                {AU_STATES.map(state => (
                    <button
                        key={state}
                        onClick={() => setSelectedState(state)}
                        className={`flex-1 min-w-[80px] py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selectedState === state ? 'bg-slate-900 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700'}`}
                    >
                        {state}
                    </button>
                ))}
              </div>

              <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-8 bg-gray-50/50 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-xl shadow-sm text-emerald-600"><Store size={24}/></div>
                          <h2 className="text-xl font-black text-gray-900 uppercase">{selectedState} Produce Market Wholesalers</h2>
                      </div>
                      <a href="https://www.saproducemarket.com.au/directory/?_sft_directory_categories=wholesaler" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-600 hover:underline">
                          View Official Directory <ArrowUpRight size={14}/>
                      </a>
                  </div>
                  <div className="overflow-x-auto">
                    {filteredSaSuppliers.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-white text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                <tr>
                                    <th className="px-8 py-5">Company Name</th>
                                    <th className="px-8 py-5">Contact Mobile</th>
                                    <th className="px-8 py-5">Email Address</th>
                                    <th className="px-8 py-5">Market Location</th>
                                    <th className="px-8 py-5">Specialty</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredSaSuppliers.map((supplier, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-8 py-6 font-black text-gray-900 tracking-tight text-base uppercase">{supplier.name}</td>
                                        <td className="px-8 py-6 text-sm font-bold text-gray-500">{supplier.mobile}</td>
                                        <td className="px-8 py-6 text-sm font-bold text-indigo-600">{supplier.email}</td>
                                        <td className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-tight">{supplier.location}</td>
                                        <td className="px-8 py-6">
                                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-200">{supplier.specialty}</span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => triggerNativeSms(supplier.mobile, `Hi ${supplier.name}, we are looking to source through Platform Zero...`)} className="p-3 bg-white border border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-200 rounded-xl transition-all shadow-sm" title="SMS Supplier"><Smartphone size={18}/></button>
                                                <button onClick={() => setSendProductTarget(supplier)} className="p-3 bg-white border border-gray-200 text-gray-400 hover:text-orange-600 hover:border-orange-200 rounded-xl transition-all shadow-sm" title="Send Photo Offer"><Camera size={18}/></button>
                                                <button onClick={() => triggerNativeSms(supplier.mobile, `Hi ${supplier.name}, I'd like to connect on Platform Zero. Accept my friendship trade request and you will be added to my contact list.`)} className="p-3 bg-white border border-gray-200 text-gray-400 hover:text-emerald-600 hover:border-emerald-200 rounded-xl transition-all shadow-sm" title="Connect"><UserPlus size={18}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                      ) : (
                        <div className="p-24 text-center">
                            <Globe size={48} className="mx-auto text-gray-100 mb-6"/>
                            <h3 className="text-xl font-black text-gray-300 uppercase tracking-tight">No Active Partners in {selectedState}</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">Try selecting SA for verified market directory.</p>
                        </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {sendProductTarget && <SendProductOfferModal isOpen={!!sendProductTarget} onClose={() => setSendProductTarget(null)} targetPartner={sendProductTarget} user={user} products={products}/>}
      
      <InviteBuyerModal 
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        wholesaler={user}
      />
    </div>
  );
};