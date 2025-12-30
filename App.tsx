import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { UserRole, User, AppNotification } from './types';
import { mockService } from './services/mockDataService';
import { Dashboard } from './components/Dashboard';
import { FarmerDashboard } from './components/FarmerDashboard';
import { ConsumerDashboard } from './components/ConsumerDashboard';
import { ProductPricing } from './components/ProductPricing';
import { Marketplace } from './components/Marketplace';
import { SupplierMarket } from './components/SupplierMarket';
import { AdminDashboard } from './components/AdminDashboard';
import { Settings as SettingsComponent } from './components/Settings';
import { LoginRequests } from './components/LoginRequests';
import { ConsumerOnboarding } from './components/ConsumerOnboarding';
import { CustomerPortals } from './components/CustomerPortals';
import { Accounts } from './components/Accounts';
import { PricingRequests } from './components/PricingRequests';
import { AdminPriceRequests } from './components/AdminPriceRequests';
import { ConsumerLanding } from './components/ConsumerLanding';
import { CustomerOrders } from './components/CustomerOrders'; 
import { AdminRepManagement } from './components/AdminRepManagement';
import { AdminSuppliers } from './components/AdminSuppliers';
import { TradingInsights } from './components/TradingInsights';
import { Contacts } from './components/Contacts';
import { Notifications } from './components/Notifications';
import { LiveActivity } from './components/LiveActivity';
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
    }, [user.id]);

    return (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-[2rem] shadow-2xl border border-gray-100 z-[100] overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-black text-gray-900 uppercase text-[10px] tracking-[0.2em]">Recent Activity</h3>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? <div className="p-12 text-center text-gray-400 text-xs uppercase tracking-widest font-black">All Caught Up</div> : notifications.map(n => (
                    <div key={n.id} className="p-4 border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer">
                        <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{n.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{n.message}</p>
                    </div>
                ))}
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
      const newTags = [...sellingTags, sellInput.trim()]; setSellingTags(newTags); setSellInput(''); mockService.updateUserInterests(user.id, newTags, buyingTags);
    } else if (type === 'buy' && buyInput.trim()) {
      const newTags = [...buyingTags, buyInput.trim()]; setBuyingTags(newTags); setBuyInput(''); mockService.updateUserInterests(user.id, sellingTags, newTags);
    }
  };

  const widgetContent = (
    <div className="overflow-hidden w-full">
       <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center justify-between w-full text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1 px-1">
         <span>Daily Signals</span>
         {isExpanded ? <ChevronDown size={14}/> : <ChevronUp size={14} />}
       </button>
       {isExpanded && (
         <div className="mt-4 space-y-4 px-1">
            <div>
               <div className="flex items-center gap-2 text-[10px] font-black text-[#10B981] mb-2 uppercase tracking-wide"><TrendingUp size={12}/> Selling</div>
               <div className="flex gap-1.5 h-8">
                    <input className="flex-1 bg-[#1E293B] border border-slate-700 rounded-md px-2 py-1 text-xs text-white outline-none" placeholder="Apples..." value={sellInput} onChange={e => setSellInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd('sell')} />
                    <button onClick={() => handleAdd('sell')} className="bg-emerald-600 rounded-md w-8 flex items-center justify-center"><Plus size={14}/></button>
               </div>
               <div className="flex flex-wrap gap-1.5 mt-2">
                 {sellingTags.map(tag => <span key={tag} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[9px] font-black">{tag}</span>)}
               </div>
            </div>
            <div>
               <div className="flex items-center gap-2 text-[10px] font-black text-[#3B82F6] mb-2 uppercase tracking-wide"><Target size={12}/> Buying</div>
               <div className="flex gap-1.5 h-8">
                    <input className="flex-1 bg-[#1E293B] border border-slate-700 rounded-md px-2 py-1 text-xs text-white outline-none" placeholder="Packing..." value={buyInput} onChange={e => setBuyInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd('buy')} />
                    <button onClick={() => handleAdd('buy')} className="bg-blue-600 rounded-md w-8 flex items-center justify-center"><Plus size={14}/></button>
               </div>
               <div className="flex flex-wrap gap-1.5 mt-2">
                 {buyingTags.map(tag => <span key={tag} className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded text-[9px] font-black">{tag}</span>)}
               </div>
            </div>
         </div>
       )}
    </div>
  );

  return <div className="mt-auto px-3 pb-4"><div className="bg-[#0B1221] rounded-2xl p-4 text-white shadow-xl border border-slate-800">{widgetContent}</div></div>;
};

const AuthModal = ({ isOpen, onClose, step, setStep, onLogin, email, setEmail, password, setPassword, onAutoLogin }: any) => {
    if (!isOpen) return null;
    const handleCategorySelect = (category: any) => setStep('credentials');
    const demoLogins = [
        { label: 'ADMIN HQ', email: 'admin@pz.com' },
        { label: 'WHOLESALER', email: 'sarah@fresh.com' },
        { label: 'FARMER', email: 'bob@greenvalley.com' },
        { label: 'MARKETPLACE', email: 'alice@cafe.com' },
    ];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Portal Access</h2>
                    <button onClick={onClose} className="text-gray-300 hover:text-gray-600"><X size={28} /></button>
                </div>
                <div className="p-8">
                    {step === 'category' ? (
                        <div className="space-y-6">
                            <button onClick={() => handleCategorySelect('PARTNER')} className="w-full flex items-center justify-between p-6 bg-gray-50 hover:bg-white border-2 border-transparent hover:border-emerald-50 rounded-[1.5rem] transition-all group">
                                <div className="flex items-center gap-5"><Building size={24} className="text-indigo-600"/><div className="text-left font-black uppercase"><h3 className="text-sm tracking-widest">Partner Portal</h3><p className="text-[10px] text-gray-400">Farms & Wholesalers</p></div></div>
                                <ChevronRight size={20} className="text-gray-300 group-hover:text-emerald-500 transition-all"/>
                            </button>
                            <button onClick={() => handleCategorySelect('MARKETPLACE')} className="w-full flex items-center justify-between p-6 bg-gray-50 hover:bg-white border-2 border-transparent hover:border-emerald-50 rounded-[1.5rem] transition-all group">
                                <div className="flex items-center gap-5"><ShoppingCart size={24} className="text-emerald-600"/><div className="text-left font-black uppercase"><h3 className="text-sm tracking-widest">Marketplace</h3><p className="text-[10px] text-gray-400">Buyers & Restaurants</p></div></div>
                                <ChevronRight size={20} className="text-gray-300 group-hover:text-emerald-500 transition-all"/>
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={onLogin} className="space-y-6">
                            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 font-bold" placeholder="name@business.com"/>
                            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 font-bold" placeholder="••••••••"/>
                            <button type="submit" className="w-full py-5 bg-[#043003] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-black transition-all">Sign In</button>
                        </form>
                    )}
                    <div className="mt-12 pt-8 border-t border-gray-100"><p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4 text-center">Development Access</p><div className="grid grid-cols-2 gap-3">{demoLogins.map(demo => (<button key={demo.label} onClick={() => onAutoLogin(demo.email)} className="flex flex-col items-start p-4 bg-gray-50 hover:bg-emerald-50 rounded-2xl border border-transparent hover:border-emerald-100 transition-all"><span className="text-[11px] font-black text-gray-900 uppercase">{demo.label}</span><span className="text-[10px] text-gray-400 truncate w-full mt-1 font-medium">{demo.email}</span></button>))}</div></div>
                </div>
            </div>
        </div>
    );
};

const AppLayout = ({ children, user, onLogout }: any) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const isPartner = user.role === UserRole.WHOLESALER || user.role === UserRole.FARMER;
  return (
    <div className="flex min-h-screen bg-white">
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 fixed inset-y-0 z-30">
        <div className="p-6 flex items-center gap-3"><div className="w-8 h-8 bg-[#043003] rounded-lg flex items-center justify-center text-white font-bold text-lg">P</div><span className="font-bold text-xl tracking-tight text-gray-900">Platform Zero</span></div>
        <div className="flex-1 py-4 px-3 space-y-8 flex flex-col no-scrollbar">
            {user.role === UserRole.ADMIN ? (
                  <div className="space-y-1">
                    <SidebarLink to="/" icon={LayoutDashboard} label="Overview" active={isActive('/')} />
                    <SidebarLink to="/marketplace" icon={Layers} label="Catalog Manager" active={isActive('/marketplace')} />
                  </div>
              ) : user.role === UserRole.CONSUMER ? (
                <div className="space-y-1">
                    <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" active={isActive('/')} />
                    <SidebarLink to="/orders" icon={ShoppingCart} label="Track Orders" active={isActive('/orders')} />
                    <SidebarLink to="/marketplace" icon={ShoppingBag} label="Fresh Catalog" active={isActive('/marketplace')} />
                </div>
              ) : isPartner ? (
                <div className="space-y-1">
                    <SidebarLink to="/" icon={LayoutDashboard} label="Order Management" active={isActive('/')} />
                    <SidebarLink to="/pricing" icon={Tags} label="Inventory & Price" active={isActive('/pricing')} />
                    <SidebarLink to="/accounts" icon={DollarSign} label="Financials" active={isActive('/accounts')} />
                    <SidebarLink to="/market" icon={Globe} label="Supplier Market" active={isActive('/market')} />
                </div>
              ) : null}
              <div className="pt-4 border-t border-gray-100">
                  <SidebarLink to="/notifications" icon={Bell} label="Activity History" active={isActive('/notifications')} />
                  <SidebarLink to="/settings" icon={Settings} label="Settings" active={isActive('/settings')} />
              </div>
        </div>
        <div className="p-4 border-t border-gray-50"><button onClick={onLogout} className="w-full flex items-center gap-2 px-2 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-bold"><LogOut size={18} /><span>Sign Out</span></button></div>
        {isPartner && <NetworkSignalsWidget user={user} mode="sidebar" />}
      </aside>
      <main className="flex-1 md:ml-64 w-full min-h-screen flex flex-col">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-20">
            <div className="hidden sm:flex items-center gap-4 flex-1"><div className="relative max-w-md w-full group"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18}/><input type="text" placeholder="Search orders, stock..." className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all"/></div></div>
            <div className="flex items-center gap-4"><button className="p-3 rounded-xl bg-gray-50 text-gray-400"><Bell size={20}/></button><div className="h-8 w-px bg-gray-100 mx-2"></div><div className="flex items-center gap-3"><div className="text-right hidden sm:block"><p className="text-xs font-black text-gray-900 tracking-tight leading-none mb-1 uppercase">{user.name}</p><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{user.role}</p></div><Link to="/settings" className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-black shadow-sm">{user.name.charAt(0)}</Link></div></div>
        </header>
        <div className="flex-1 p-8">{children}</div>
      </main>
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authStep, setAuthStep] = useState<'category' | 'credentials'>('category');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAutoLogin = (email: string) => {
    const foundUser = mockService.getAllUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser) { setUser(foundUser); setShowAuthModal(false); } else { alert("Account not found."); }
  };

  if (!user) return (
    <>
      <ConsumerLanding onLogin={() => { setAuthStep('category'); setShowAuthModal(true); }} />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} step={authStep} setStep={setAuthStep} onLogin={(e: any) => {e.preventDefault(); handleAutoLogin(email);}} email={email} setEmail={setEmail} password={password} setPassword={setPassword} onAutoLogin={handleAutoLogin} />
    </>
  );

  return (
    <Router>
      <AppLayout user={user} onLogout={() => setUser(null)}>
        <Routes>
          <Route path="/marketplace" element={<Marketplace user={user} />} />
          <Route path="/orders" element={<CustomerOrders user={user} />} />
          <Route path="/pricing" element={<ProductPricing user={user} />} />
          <Route path="/accounts" element={<Accounts user={user} />} />
          <Route path="/market" element={<SupplierMarket user={user} />} />
          <Route path="/notifications" element={<Notifications user={user} />} />
          <Route path="/settings" element={<SettingsComponent user={user} onRefreshUser={() => setUser({...mockService.getAllUsers().find(u => u.id === user.id)!})} />} />
          <Route path="/" element={user.role === UserRole.CONSUMER ? <ConsumerDashboard user={user} /> : user.role === UserRole.ADMIN ? <AdminDashboard /> : user.role === UserRole.FARMER ? <FarmerDashboard user={user} /> : <Dashboard user={user} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </Router>
  );
};

export default App;
