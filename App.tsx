
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { UserRole, User } from './types';
import { mockService } from './services/mockDataService';
import { Dashboard } from './components/Dashboard';
import { ConsumerDashboard } from './components/ConsumerDashboard';
import { Inventory } from './components/Inventory';
import { ProductPricing } from './components/ProductPricing';
import { Marketplace } from './components/Marketplace';
import { SupplierMarket } from './components/SupplierMarket';
import { AdminDashboard } from './components/AdminDashboard';
import { DriverDashboard } from './components/DriverDashboard';
import { RepDashboard } from './components/RepDashboard';
import { Settings as SettingsComponent } from './components/Settings';
import { LoginRequests } from './components/LoginRequests';
import { ConsumerOnboarding } from './components/ConsumerOnboarding';
import { CustomerPortals } from './components/CustomerPortals';
import { AiOpportunityMatcher } from './components/AiOpportunityMatcher';
import { Accounts } from './components/Accounts';
import { PricingRequests } from './components/PricingRequests';
import { ConsumerLanding } from './components/ConsumerLanding';
import { SellerDashboardV1 } from './components/SellerDashboardV1';
import { CustomerOrders } from './components/CustomerOrders'; 
import { AdminRepManagement } from './components/AdminRepManagement';
import { TradingInsights } from './components/TradingInsights';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  Tags,
  ChevronDown,
  ChevronRight,
  UserPlus,
  ClipboardList, 
  ScanLine, 
  DollarSign, 
  Store, 
  X, 
  Lock, 
  ArrowLeft, 
  Briefcase, 
  Eye, 
  EyeOff, 
  Bell, 
  Award,
  ShoppingBag,
  Sprout,
  Handshake,
  ShieldCheck,
  TrendingUp,
  Target,
  Plus,
  ChevronUp,
  BarChart4,
  Layers,
  FileText,
  Gift,
  Truck,
  Sparkles
} from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, label, active, onClick }: any) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
      active 
        ? 'bg-emerald-50 text-[#043003] font-bold' 
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

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
         {isExpanded ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronUp size={14} className="text-slate-500" />}
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
            {mode === 'popup' && (
                <button 
                  onClick={onFinish}
                  className="w-full mt-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] uppercase tracking-widest rounded-lg transition-all border border-slate-700"
                >
                    Done for Now
                </button>
            )}
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

const AppLayout = ({ children, user, onLogout }: any) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  
  const [showDailyPopup, setShowDailyPopup] = useState(false);

  useEffect(() => {
    if (user.role === UserRole.WHOLESALER || user.role === UserRole.FARMER) {
        const today = new Date().toLocaleDateString();
        const lastSeen = localStorage.getItem(`pz_daily_signal_${user.id}`);
        if (lastSeen !== today) {
            setShowDailyPopup(true);
        }
    }
  }, [user]);

  const handleClosePopup = () => {
      const today = new Date().toLocaleDateString();
      localStorage.setItem(`pz_daily_signal_${user.id}`, today);
      setShowDailyPopup(false);
  };

  const isPartner = user.role === UserRole.WHOLESALER || user.role === UserRole.FARMER;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed inset-y-0 z-30">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#043003] rounded-lg flex items-center justify-center text-white font-bold text-lg">P</div>
          <span className="font-bold text-xl tracking-tight text-gray-900">Platform Zero</span>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto flex flex-col">
          <div className="flex-1 space-y-1">
              {user.role === UserRole.ADMIN ? (
                  <>
                    <div className="pb-2 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Platform Admin</div>
                    <SidebarLink to="/" icon={LayoutDashboard} label="Overview" active={isActive('/')} />
                    <SidebarLink to="/marketplace" icon={Layers} label="Catalog Manager" active={isActive('/marketplace')} />
                    <SidebarLink to="/login-requests" icon={UserPlus} label="Login Requests" active={isActive('/login-requests')} />
                    <SidebarLink to="/pricing-requests" icon={FileText} label="Quote Generator" active={isActive('/pricing-requests')} />
                    <SidebarLink to="/consumer-onboarding" icon={Handshake} label="Marketplace Manager" active={isActive('/consumer-onboarding')} />
                    <SidebarLink to="/customer-portals" icon={Gift} label="Growth & Portals" active={isActive('/customer-portals')} />
                    <SidebarLink to="/admin-reps" icon={Award} label="Rep Management" active={isActive('/admin-reps')} />
                  </>
              ) : user.role === UserRole.CONSUMER ? (
                <>
                    <div className="pb-2 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Buyer Portal</div>
                    <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" active={isActive('/')} />
                    <SidebarLink to="/orders" icon={ShoppingCart} label="Track Orders" active={isActive('/orders')} />
                    <SidebarLink to="/marketplace" icon={ShoppingBag} label="Fresh Catalog" active={isActive('/marketplace')} />
                </>
              ) : (user.role === UserRole.WHOLESALER || user.role === UserRole.FARMER) ? (
                <>
                  <div className="pb-2 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Partner Operations</div>
                  <SidebarLink to="/" icon={LayoutDashboard} label="Order Management" active={isActive('/')} />
                  <SidebarLink to="/pricing" icon={Tags} label="Inventory & Price" active={isActive('/pricing')} />
                  <SidebarLink to="/accounts" icon={DollarSign} label="Financials" active={isActive('/accounts')} />
                  <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Network</div>
                  <SidebarLink to="/market" icon={Store} label="Supplier Market" active={isActive('/market')} />
                </>
              ) : user.role === UserRole.DRIVER ? (
                <>
                    <SidebarLink to="/" icon={Truck} label="Run Sheet" active={isActive('/')} />
                </>
              ) : user.role === UserRole.PZ_REP ? (
                <>
                    <SidebarLink to="/" icon={Briefcase} label="Sales Console" active={isActive('/')} />
                </>
              ) : null}
              
              <div className="pt-4 border-t border-gray-100">
                <SidebarLink to="/settings" icon={Settings} label="Settings" active={isActive('/settings')} />
              </div>
          </div>

          {isPartner && !showDailyPopup && <NetworkSignalsWidget user={user} mode="sidebar" />}
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <button onClick={onLogout} className="w-full flex items-center gap-2 px-2 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-bold"><LogOut size={18} /><span>Sign Out</span></button>
        </div>
      </aside>
      
      <main className="flex-1 md:ml-64 p-8 w-full overflow-x-hidden relative">
        {isPartner && (
            <div className="flex justify-end mb-6 absolute top-8 right-8 z-20">
                <Link 
                    to="/trading-insights"
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-sm border ${
                        isActive('/trading-insights')
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                >
                    <BarChart4 size={14} className={isActive('/trading-insights') ? 'text-emerald-400' : 'text-slate-400'}/>
                    Market Intelligence
                    {isActive('/trading-insights') && <Sparkles size={12} className="text-emerald-400 animate-pulse"/>}
                </Link>
            </div>
        )}

        <div className={isPartner ? "mt-12" : ""}>
            {children}
        </div>
        
        {isPartner && showDailyPopup && (
            <NetworkSignalsWidget user={user} mode="popup" onFinish={handleClosePopup} />
        )}
      </main>
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginStep, setLoginStep] = useState<'select' | 'form'>('select');
  const [portalType, setPortalType] = useState<'PARTNER' | 'MARKETPLACE' | 'ADMIN'>('PARTNER');
  const [email, setEmail] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // FIX: Use service to search all users including newly created ones
    const found = mockService.getAllUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
        setUser(found);
        setShowLoginModal(false);
        setLoginStep('select');
    } else {
        alert("Account not found. Tip: Try 'sarah@fresh.com' for Partners or 'alice@cafe.com' for Buyers.");
    }
  };

  const selectPortal = (type: 'PARTNER' | 'MARKETPLACE' | 'ADMIN') => {
      setPortalType(type);
      setLoginStep('form');
      if (type === 'ADMIN') setEmail('admin@pz.com');
      else if (type === 'PARTNER') setEmail('sarah@fresh.com');
      else setEmail('alice@cafe.com');
  };

  const resetModal = () => {
      setShowLoginModal(false);
      setLoginStep('select');
      setEmail('');
  };

  return (
    <Router>
      {!user ? (
        <>
            <ConsumerLanding onLogin={() => setShowLoginModal(true)} />
            {showLoginModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                        
                        {loginStep === 'select' ? (
                            <>
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                                    <button onClick={resetModal} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
                                </div>
                                <div className="p-6 space-y-4 bg-white">
                                    <p className="text-gray-500 text-sm font-medium mb-2">Please select your portal to continue.</p>
                                    
                                    <button 
                                        onClick={() => selectPortal('PARTNER')}
                                        className="w-full text-left p-5 border border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group flex items-center gap-4"
                                    >
                                        <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
                                            <Briefcase size={28} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 text-lg">Partners</h3>
                                            <p className="text-sm text-gray-500">Wholesalers & Farmers</p>
                                        </div>
                                        <ChevronRight size={20} className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
                                    </button>

                                    <button 
                                        onClick={() => selectPortal('MARKETPLACE')}
                                        className="w-full text-left p-5 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/30 transition-all group flex items-center gap-4"
                                    >
                                        <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                                            <ShoppingCart size={28} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 text-lg">Marketplace</h3>
                                            <p className="text-sm text-gray-500">Buyers & Consumers</p>
                                        </div>
                                        <ChevronRight size={20} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                                    </button>
                                </div>
                                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
                                    <button 
                                        onClick={() => selectPortal('ADMIN')}
                                        className="text-xs font-bold text-gray-400 hover:text-gray-600 flex items-center gap-2 uppercase tracking-widest py-2 transition-colors"
                                    >
                                        <Lock size={14} /> Admin & Staff Access
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="p-6 border-b border-gray-100 flex items-center gap-4">
                                    <button onClick={() => setLoginStep('select')} className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20}/></button>
                                    <h2 className="text-xl font-bold text-gray-900">Sign in to {portalType.charAt(0) + portalType.slice(1).toLowerCase()}</h2>
                                </div>
                                <form onSubmit={handleLogin} className="p-8 space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Email Address</label>
                                        <input 
                                            type="email" 
                                            autoFocus
                                            value={email} 
                                            onChange={e => setEmail(e.target.value)} 
                                            className="w-full p-4 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 text-lg text-black" 
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                    <button type="submit" className="w-full py-4 bg-[#043003] text-white rounded-xl font-bold text-lg shadow-lg hover:bg-[#064004] transition-all">Continue</button>
                                    <p className="text-xs text-center text-gray-400 italic">
                                        Demo accounts are pre-filled based on your selection.
                                    </p>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
      ) : (
        <AppLayout user={user} onLogout={() => setUser(null)}>
            <Routes>
                <Route path="/" element={
                  user.role === UserRole.ADMIN ? <AdminDashboard /> : 
                  user.role === UserRole.CONSUMER ? <ConsumerDashboard user={user} /> :
                  user.role === UserRole.DRIVER ? <DriverDashboard user={user} /> :
                  user.role === UserRole.PZ_REP ? <RepDashboard user={user} /> :
                  user.dashboardVersion === 'v1' ? <SellerDashboardV1 user={user} /> : <Dashboard user={user} />
                } />
                <Route path="/marketplace" element={<Marketplace user={user} />} />
                <Route path="/login-requests" element={<LoginRequests />} />
                <Route path="/pricing-requests" element={<PricingRequests user={user} />} />
                <Route path="/consumer-onboarding" element={<ConsumerOnboarding />} />
                <Route path="/customer-portals" element={<CustomerPortals />} />
                <Route path="/admin-reps" element={<AdminRepManagement />} />
                <Route path="/trading-insights" element={<TradingInsights user={user} />} />
                <Route path="/pricing" element={<ProductPricing user={user} />} />
                <Route path="/inventory" element={<Inventory items={mockService.getInventory(user.id)} />} />
                <Route path="/market" element={<SupplierMarket user={user} />} />
                <Route path="/ai-matcher" element={<AiOpportunityMatcher user={user} />} />
                <Route path="/accounts" element={<Accounts user={user} />} />
                <Route path="/orders" element={<CustomerOrders user={user} />} />
                <Route path="/settings" element={<SettingsComponent user={user} onRefreshUser={() => setUser({...user})} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AppLayout>
      )}
    </Router>
  );
};

export default App;
