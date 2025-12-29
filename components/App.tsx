import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { UserRole, User, AppNotification } from '../types';
import { mockService } from '../services/mockDataService';
import { Dashboard } from './Dashboard';
import { FarmerDashboard } from './FarmerDashboard';
import { ConsumerDashboard } from './ConsumerDashboard';
import { ProductPricing } from './ProductPricing';
import { Marketplace } from './Marketplace';
import { SupplierMarket } from './SupplierMarket';
import { AdminDashboard } from './AdminDashboard';
import { Settings as SettingsComponent } from './Settings';
import { LoginRequests } from './LoginRequests';
import { ConsumerOnboarding } from './ConsumerOnboarding';
import { CustomerPortals } from './CustomerPortals';
import { Accounts } from './Accounts';
import { PricingRequests } from './PricingRequests';
import { AdminPriceRequests } from './AdminPriceRequests';
import { ConsumerLanding } from './ConsumerLanding';
import { CustomerOrders } from './CustomerOrders'; 
import { AdminRepManagement } from './AdminRepManagement';
import { AdminSuppliers } from './AdminSuppliers';
import { TradingInsights } from './TradingInsights';
import { Contacts } from './Contacts';
import { Notifications } from './Notifications';
import { LiveActivity } from './LiveActivity';
import { 
  LayoutDashboard, ShoppingCart, Users, Settings, LogOut, Tags, ChevronDown, UserPlus, 
  DollarSign, X, Lock, ArrowLeft, Bell, 
  ShoppingBag, ShieldCheck, TrendingUp, Target, Plus, ChevronUp, Layers, 
  Sparkles, User as UserIcon, Building, ChevronRight,
  Sprout, Globe, Users2, Circle, LogIn, ArrowRight, Menu, Search, Calculator, BarChart3
} from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, label, active, onClick, isSubItem = false, badge = 0, subLabel }: any) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center justify-between px-4 py-2.5 rounded-xl transition-all group ${
      active 
        ? 'bg-emerald-50 text-[#043003]' 
        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
    } ${isSubItem ? 'pl-10 py-2.5 text-sm' : ''}`}
  >
    <div className="flex items-center space-x-3 min-w-0">
        <Icon size={18} className={active ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-500 transition-colors'} />
        <div className="truncate">
          <span className={`block truncate text-[13px] tracking-tight ${active ? 'font-bold' : 'font-semibold'}`}>{label}</span>
          {subLabel && <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{subLabel}</span>}
        </div>
    </div>
    {badge > 0 && (
        <span className="bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm shrink-0">
            {badge}
        </span>
    )}
  </Link>
);

const NotificationDropdown = ({ user, onClose }: { user: User, onClose: () => void }) => {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        setNotifications(mockService.getAppNotifications(user.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5));
        const interval = setInterval(() => {
            setNotifications(mockService.getAppNotifications(user.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5));
        }, 5000);
        return () => clearInterval(interval);
    }, [user.id]);

    const handleRead = (notif: AppNotification) => {
        mockService.markNotificationAsRead(notif.id);
        if (notif.link) {
            navigate(notif.link);
        }
        onClose();
    };

    return (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 z-[100] animate-in zoom-in-95 duration-200 origin-top-right overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-black text-gray-900 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
                    <Bell size={14} className="text-emerald-600"/> Recent Activity
                </h3>
                <Link to="/notifications" onClick={onClose} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View History</Link>
            </div>
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar bg-white">
                {notifications.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        <Bell size={32} className="mx-auto mb-3 opacity-20"/>
                        <p className="text-xs font-bold uppercase tracking-widest">No notifications yet.</p>
                    </div>
                ) : (
                    notifications.map(n => (
                        <div 
                            key={n.id} 
                            onClick={() => handleRead(n)}
                            className={`p-4 border-b border-gray-50 cursor-pointer transition-all hover:bg-emerald-50/30 relative group ${!n.isRead ? 'bg-white' : 'bg-gray-50/20'}`}
                        >
                            <div className="flex gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                                    n.type === 'ORDER' ? 'bg-blue-100 text-blue-600' :
                                    n.type === 'APPLICATION' ? 'bg-orange-100 text-orange-600' :
                                    n.type === 'PRICE_REQUEST' ? 'bg-indigo-100 text-indigo-600' :
                                    'bg-emerald-100 text-emerald-600'
                                }`}>
                                    {n.type === 'ORDER' ? <ShoppingCart size={18}/> :
                                     n.type === 'APPLICATION' ? <UserPlus size={18}/> :
                                     n.type === 'PRICE_REQUEST' ? <Calculator size={18}/> :
                                     <Sparkles size={18}/>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <p className="text-sm font-black text-gray-900 truncate pr-4 uppercase tracking-tight">{n.title}</p>
                                        {!n.isRead && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0 mt-1.5"></span>}
                                    </div>
                                    <p className="text-xs text-gray-500 leading-snug line-clamp-2">{n.message}</p>
                                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-tighter mt-1">{new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100">
                <button onClick={() => { mockService.markAllNotificationsRead(user.id); onClose(); }} className="w-full py-2.5 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-emerald-600 transition-colors">Clear All Read</button>
            </div>
        </div>
    );
};

const NetworkSignalsWidget = ({ user, mode = 'sidebar', onFinish }: { user: User, mode?: 'sidebar' | 'popup', onFinish?: () => void }) => {
  const [sellingTags, setSellingTags] = useState<string[]>(user.activeSellingInterests || []);
  const [buyingTags, setBuyingTags] = useState<string[]>(user.activeBuyingInterests || []);
  const [sellInput, setSellInput] = useState('');
  const [buyInput, setBuyInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  const handleAdd = (type: 'sell' | 'buy') => {
    if (type === 'sell' && sellInput.trim()) {
      const newTags = [...sellingTags, sellInput.trim()];
      setSellingTags(newTags);
      setSellInput('');
      mockService.updateUserInterests(user.id, newTags, buyingTags);
    } else if (type === 'buy' && buyInput.trim()) {
      const newTags = [...buyingTags, buyInput.trim()];
      setBuyingTags(newTags);
      setBuyInput('');
      mockService.updateUserInterests(user.id, sellingTags, newTags);
    }
  };

  const handleRemove = (type: 'sell' | 'buy', tag: string) => {
    if (type === 'sell') {
      const newTags = sellingTags.filter(t => t !== tag);
      setSellingTags(newTags);
      mockService.updateUserInterests(user.id, newTags, buyingTags);
    } else {
      const newTags = buyingTags.filter(t => t !== tag);
      setBuyingTags(newTags);
      mockService.updateUserInterests(user.id, sellingTags, newTags);
    }
  };

  const widgetContent = (
    <div className="overflow-hidden w-full">
       <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center justify-between w-full text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1 px-1">
         <span>Daily Signals</span>
         {isExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronUp size={14} className="text-slate-400" />}
       </button>
       {isExpanded && (
         <div className="mt-4 space-y-4 px-1">
            <div>
               <div className="flex items-center gap-2 text-[10px] font-black text-[#10B981] mb-2 uppercase tracking-wide"><TrendingUp size={12}/> Selling Today</div>
               <div className="flex items-center gap-1.5 mb-3 h-8 w-full overflow-hidden">
                  <div className="flex-1 min-w-0">
                    <input 
                      className="w-full bg-[#1E293B] border border-slate-700 rounded-md px-2 py-1 text-xs text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-bold" 
                      placeholder="Apples" 
                      value={sellInput} 
                      onChange={e => setSellInput(e.target.value)} 
                      onKeyDown={e => e.key === 'Enter' && handleAdd('sell')} 
                    />
                  </div>
                  <button onClick={() => handleAdd('sell')} className="bg-[#043003] hover:bg-black text-white rounded-md w-8 h-full flex items-center justify-center transition-colors shadow-lg border border-emerald-900/50 shrink-0"><Plus size={14}/></button>
               </div>
               <div className="flex flex-wrap gap-1.5">
                 {sellingTags.map(tag => (
                   <div key={tag} className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-md text-[9px] font-bold animate-in zoom-in-95">
                     {tag}
                     <button onClick={() => handleRemove('sell', tag)} className="hover:text-emerald-200 transition-colors">
                       <X size={10}/>
                     </button>
                   </div>
                 ))}
               </div>
            </div>
            <div>
               <div className="flex items-center gap-2 text-[10px] font-black text-[#3B82F6] mb-2 uppercase tracking-wide"><Target size={12}/> Buying Today</div>
               <div className="flex items-center gap-1.5 mb-3 h-8 w-full overflow-hidden">
                  <div className="flex-1 min-w-0">
                    <input 
                      className="w-full bg-[#1E293B] border border-slate-700 rounded-md px-2 py-1 text-xs text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-blue-500 transition-all font-bold" 
                      placeholder="Packing" 
                      value={buyInput} 
                      onChange={e => setBuyInput(e.target.value)} 
                      onKeyDown={e => e.key === 'Enter' && handleAdd('buy')} 
                    />
                  </div>
                  <button onClick={() => handleAdd('buy')} className="bg-[#3B82F6] hover:bg-blue-600 text-white rounded-md w-8 h-full flex items-center justify-center transition-colors shadow-lg border border-blue-900/50 shrink-0"><Plus size={14}/></button>
               </div>
               <div className="flex flex-wrap gap-1.5">
                 {buyingTags.map(tag => (
                   <div key={tag} className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-md text-[9px] font-bold animate-in zoom-in-95">
                     {tag}
                     <button onClick={() => handleRemove('buy', tag)} className="hover:text-blue-200 transition-colors">
                       <X size={10}/>
                     </button>
                   </div>
                 ))}
               </div>
            </div>
         </div>
       )}
    </div>
  );

  if (mode === 'popup') {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-sm bg-[#0B1221] rounded-3xl p-8 text-white shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] border border-slate-800 animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-white">Market Status</h2>
                        <p className="text-slate-500 text-sm mt-1">Set your signals for {new Date().toLocaleDateString()}</p>
                    </div>
                    <button onClick={onFinish} className="text-slate-600 hover:text-white p-1 transition-colors"><X size={24}/></button>
                </div>
                {widgetContent}
            </div>
        </div>
    );
  }

  return (
    <div className="mt-auto px-3 pb-4">
        <div className="bg-[#0B1221] rounded-2xl p-4 text-white shadow-xl border border-slate-800 overflow-hidden">
            {widgetContent}
        </div>
    </div>
  );
};

// Fix: Added missing AuthModal component definition to resolve scoping issues in components/App.tsx
const AuthModal = ({ isOpen, onClose, step, setStep, onLogin, email, setEmail, password, setPassword, selectedRole, setSelectedRole, onAutoLogin }: any) => {
    if (!isOpen) return null;

    const handleCategorySelect = (category: 'PARTNER' | 'MARKETPLACE' | 'ADMIN') => {
        if (category === 'PARTNER') setSelectedRole(UserRole.WHOLESALER);
        else if (category === 'MARKETPLACE') setSelectedRole(UserRole.CONSUMER);
        else setSelectedRole(UserRole.ADMIN);
        setStep('credentials');
    };

    const demoLogins = [
        { label: 'ADMIN', email: 'admin@pz.com' },
        { label: 'WHOLESALER', email: 'sarah@fresh.com' },
        { label: 'FARMER', email: 'bob@greenvalley.com' },
        { label: 'GROCER', email: 'alice@cafe.com' },
    ];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#043003] rounded-xl flex items-center justify-center text-white shadow-lg">
                           <Lock size={20}/>
                        </div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Portal Access</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-300 hover:text-gray-600 p-2 transition-colors">
                        <X size={28} />
                    </button>
                </div>

                <div className="p-8">
                    {step === 'category' ? (
                        <div className="space-y-6">
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 text-center">Select Account Type</p>
                            
                            <button onClick={() => handleCategorySelect('PARTNER')} className="w-full flex items-center justify-between p-6 bg-[#F8FAFC] hover:bg-white hover:shadow-lg border border-transparent hover:border-gray-100 rounded-[1.5rem] transition-all group">
                                <div className="flex items-center gap-5"><div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-50 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform"><Building size={24}/></div><div className="text-left"><h3 className="font-black text-gray-900 text-sm tracking-widest uppercase">Partner Portal</h3><p className="text-xs text-gray-500 font-medium">Farms & Wholesalers</p></div></div>
                                <ChevronRight size={20} className="text-gray-300 group-hover:text-indigo-500 transition-all"/>
                            </button>

                            <button onClick={() => handleCategorySelect('MARKETPLACE')} className="w-full flex items-center justify-between p-6 bg-[#F8FAFC] hover:bg-white hover:shadow-lg border border-transparent hover:border-gray-100 rounded-[1.5rem] transition-all group">
                                <div className="flex items-center gap-5"><div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-50 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform"><ShoppingCart size={24}/></div><div className="text-left"><h3 className="font-black text-gray-900 text-sm tracking-widest uppercase">Marketplace</h3><p className="text-xs text-gray-500 font-medium">Buyers & Restaurants</p></div></div>
                                <ChevronRight size={20} className="text-gray-300 group-hover:text-emerald-500 transition-all"/>
                            </button>

                            <button onClick={() => handleCategorySelect('ADMIN')} className="w-full flex items-center justify-between p-6 bg-[#F8FAFC] hover:bg-white hover:shadow-lg border border-transparent hover:border-gray-100 rounded-[1.5rem] transition-all group">
                                <div className="flex items-center gap-5"><div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-50 flex items-center justify-center text-slate-600 group-hover:scale-105 transition-transform"><ShieldCheck size={24}/></div><div className="text-left"><h3 className="font-black text-gray-900 text-sm tracking-widest uppercase">HQ Console</h3><p className="text-xs text-gray-500 font-medium">Administration</p></div></div>
                                <ChevronRight size={20} className="text-gray-300 group-hover:text-slate-500 transition-all"/>
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={onLogin} className="space-y-6">
                            <button type="button" onClick={() => setStep('category')} className="flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-indigo-600 uppercase tracking-widest transition-colors mb-4"><ArrowLeft size={14}/> Back to selection</button>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Work Email</label>
                                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-6 py-4 bg-[#F8FAFC] border-2 border-gray-50 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 font-bold text-gray-900 transition-all" placeholder="name@business.com"/>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                                <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-6 py-4 bg-[#F8FAFC] border-2 border-gray-50 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 font-bold text-gray-900 transition-all" placeholder="••••••••"/>
                            </div>
                            <button type="submit" className="w-full py-5 bg-[#043003] text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3">Sign In</button>
                        </form>
                    )}

                    {/* DEMO LOGINS SECTION */}
                    <div className="mt-12 pt-8 border-t border-gray-100">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-4 text-center">Development Quick Access</p>
                        <div className="grid grid-cols-2 gap-3">
                            {demoLogins.map(demo => (
                                <button 
                                    key={demo.label}
                                    onClick={() => onAutoLogin(demo.email)}
                                    className="flex flex-col items-start p-4 bg-gray-50 hover:bg-emerald-50 rounded-2xl border border-transparent hover:border-emerald-100 transition-all text-left"
                                >
                                    <span className="text-[11px] font-black text-gray-900 uppercase tracking-tight">{demo.label}</span>
                                    <span className="text-[10px] text-gray-400 truncate w-full mt-1 font-medium">{demo.email}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AppLayout = ({ children, user, onLogout }: any) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  
  const [showDailyPopup, setShowDailyPopup] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [latestLiveNotif, setLatestLiveNotif] = useState<AppNotification | null>(null);

  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && (user.role === UserRole.WHOLESALER || user.role === UserRole.FARMER)) {
        const today = new Date().toLocaleDateString();
        const lastSeen = localStorage.getItem(`pz_daily_signal_${user.id}`);
        if (lastSeen !== today) setShowDailyPopup(true);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let lastNotifId = '';
    const updateNotifs = () => {
        const notifs = mockService.getAppNotifications(user.id);
        setNotifCount(notifs.filter(n => !n.isRead).length);
        const latest = notifs.find(n => !n.isRead);
        if (latest && latest.id !== lastNotifId) {
            lastNotifId = latest.id;
            setLatestLiveNotif(latest);
        }
    };
    updateNotifs();
    const interval = setInterval(updateNotifs, 3000);
    return () => clearInterval(interval);
  }, [user.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
            setShowNotifDropdown(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isPartner = user.role === UserRole.WHOLESALER || user.role === UserRole.FARMER;

  const NavItems = () => (
    <div className="flex-1 py-4 px-3 space-y-8 flex flex-col no-scrollbar">
          <div className="space-y-6">
              {user.role === UserRole.ADMIN ? (
                  <div className="space-y-1">
                    <SidebarLink to="/" icon={LayoutDashboard} label="Overview" active={isActive('/')} />
                    <SidebarLink to="/marketplace" icon={Layers} label="Catalog Manager" active={isActive('/marketplace')} />
                    <SidebarLink to="/consumer-onboarding" icon={Users} label="Onboarding" active={isActive('/consumer-onboarding')} />
                    <SidebarLink to="/login-requests" icon={UserPlus} label="Lead Requests" active={isActive('/login-requests')} badge={mockService.getRegistrationRequests().filter(r => r.status === 'Pending').length} />
                    <SidebarLink to="/admin/negotiations" icon={Tags} label="Price Requests" active={isActive('/admin/negotiations')} />
                  </div>
              ) : user.role === UserRole.CONSUMER ? (
                <div className="space-y-1">
                    <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" active={isActive('/')} />
                    <SidebarLink to="/orders" icon={ShoppingCart} label="Track Orders" active={isActive('/orders')} />
                    <SidebarLink to="/marketplace" icon={ShoppingBag} label="Fresh Catalog" active={isActive('/marketplace')} />
                </div>
              ) : isPartner ? (
                <>
                  <div className="space-y-2">
                    <h4 className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Wholesaler Ops</h4>
                    <div className="space-y-0.5">
                      <SidebarLink to="/" icon={LayoutGrid} label="Order Management" active={isActive('/')} badge={mockService.getOrders(user.id).filter(o => o.sellerId === user.id && o.status === 'Pending').length} />
                      <SidebarLink to="/pricing" icon={Tags} label="Inventory & Price" active={isActive('/pricing')} />
                      <SidebarLink to="/accounts" icon={DollarSign} label="Financials" active={isActive('/accounts')} />
                      <SidebarLink to="/trading-insights" icon={BarChart3} label="Market Intelligence" active={isActive('/trading-insights')} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Network</h4>
                    <div className="space-y-0.5">
                      <SidebarLink to="/market" icon={Globe} label="Supplier Market" active={isActive('/market')} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Contacts</h4>
                    <div className="space-y-0.5">
                      <SidebarLink to="/contacts" icon={Users2} label="Directory" active={isActive('/contacts')} />
                    </div>
                  </div>
                </>
              ) : null}
              
              <div className="pt-4 border-t border-gray-100">
                  <SidebarLink to="/notifications" icon={Bell} label="Activity History" active={isActive('/notifications')} badge={notifCount} />
                  <SidebarLink to="/settings" icon={Settings} label="Settings" active={isActive('/settings')} />
              </div>
          </div>
          {isPartner && !showDailyPopup && <NetworkSignalsWidget user={user} mode="sidebar" />}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-white">
      <LiveActivity notification={latestLiveNotif} user={user} onClose={() => setLatestLiveNotif(null)} />
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 fixed inset-y-0 z-30">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#043003] rounded-lg flex items-center justify-center text-white font-bold text-lg">P</div>
          <span className="font-bold text-xl tracking-tight text-gray-900">Platform Zero</span>
        </div>
        <NavItems />
        <div className="p-4 border-t border-gray-50">
          <button onClick={onLogout} className="w-full flex items-center gap-2 px-2 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-bold"><LogOut size={18} /><span>Sign Out</span></button>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 w-full min-h-screen flex flex-col">
        {/* GLOBAL HEADER BAR */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-20">
            <div className="hidden sm:flex items-center gap-4 flex-1">
                <div className="relative max-w-md w-full group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors" size={18}/>
                    <input type="text" placeholder="Search orders, leads, or stock..." className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all"/>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="relative" ref={notifRef}>
                    <button 
                        onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                        className={`p-3 rounded-xl transition-all relative ${showNotifDropdown ? 'bg-emerald-50 text-emerald-600 shadow-inner-sm' : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900'}`}
                    >
                        <Bell size={20}/>
                        {notifCount > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>}
                    </button>
                    {showNotifDropdown && <NotificationDropdown user={user} onClose={() => setShowNotifDropdown(false)} />}
                </div>
                <div className="h-8 w-px bg-gray-100 mx-2"></div>
                <div className="flex items-center gap-3">
                    {user ? (
                      <>
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-black text-gray-900 tracking-tight leading-none mb-1 uppercase">{user.name}</p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{user.role}</p>
                        </div>
                        <Link to="/settings" className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-black shadow-sm overflow-hidden">
                            {user.name.charAt(0)}
                        </Link>
                      </>
                    ) : (
                      <button onClick={() => window.location.hash = '#/'} className="px-6 py-2 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-black transition-all">Sign In</button>
                    )}
                </div>
            </div>
        </header>

        <div className="flex-1 p-8">
            {children}
        </div>
        {isPartner && showDailyPopup && <NetworkSignalsWidget user={user} mode="popup" onFinish={() => setShowDailyPopup(false)} />}
      </main>
    </div>
  );
};

const LayoutGrid = ({ size = 24, ...props }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
);

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authStep, setAuthStep] = useState<'category' | 'credentials'>('category');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogout = () => setUser(null);
  const handleStartAuth = () => { setAuthStep('category'); setShowAuthModal(true); };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAutoLogin(email);
  };

  const handleAutoLogin = (email: string) => {
    const foundUser = mockService.getAllUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser) {
        setUser(foundUser);
        setShowAuthModal(false);
        setAuthStep('category');
        setEmail('');
        setPassword('');
    } else {
        alert("Account not found. Please use the demo emails provided.");
    }
  };

  if (!user) return (
    <>
      <ConsumerLanding onLogin={handleStartAuth} />
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        step={authStep}
        setStep={setAuthStep}
        onLogin={handleLoginSubmit}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        onAutoLogin={handleAutoLogin}
      />
    </>
  );

  return (
    <Router>
      <AppLayout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/settings" element={<SettingsComponent user={user} onRefreshUser={() => setUser({...mockService.getAllUsers().find(u => u.id === user.id)!})} />} />
          <Route path="/marketplace" element={<Marketplace user={user} />} />
          <Route path="/trading-insights" element={<TradingInsights user={user} />} />
          <Route path="/contacts" element={<Contacts user={user} />} />
          <Route path="/notifications" element={<Notifications user={user} />} />
          {user.role === UserRole.ADMIN && (
              <>
                <Route path="/" element={<AdminDashboard />} />
                <Route path="/login-requests" element={<LoginRequests />} />
                <Route path="/consumer-onboarding" element={<ConsumerOnboarding />} />
                <Route path="/customer-portals" element={<CustomerPortals />} />
                <Route path="/pricing-requests" element={<PricingRequests user={user} />} />
                <Route path="/admin/negotiations" element={<AdminPriceRequests />} />
                <Route path="/admin-reps" element={<AdminRepManagement />} />
                <Route path="/admin/suppliers" element={<AdminSuppliers />} />
              </>
          )}
          {user.role === UserRole.CONSUMER && (
              <>
                <Route path="/" element={<ConsumerDashboard user={user} />} />
                <Route path="/orders" element={<CustomerOrders user={user} />} />
              </>
          )}
          {(user.role === UserRole.WHOLESALER || user.role === UserRole.FARMER) && (
              <>
                <Route path="/" element={user.role === UserRole.FARMER ? <FarmerDashboard user={user} /> : <Dashboard user={user} />} />
                <Route path="/pricing" element={<ProductPricing user={user} />} />
                <Route path="/accounts" element={<Accounts user={user} />} />
                <Route path="/market" element={<SupplierMarket user={user} />} />
              </>
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </Router>
  );
};

export default App;