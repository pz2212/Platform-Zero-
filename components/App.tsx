
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { UserRole, User, AppNotification, RegistrationRequest } from '../types';
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
import { Inventory } from './Inventory';
import { NativePushBanner } from './NativePushBanner';
import { SharedProductLanding } from './SharedProductLanding';
import { notificationService } from '../services/notificationService';
import { 
  LayoutDashboard, ShoppingCart, Users, Settings, LogOut, Tags, ChevronDown, UserPlus, 
  DollarSign, X, Lock, ArrowLeft, Bell, 
  ShoppingBag, ShieldCheck, TrendingUp, Target, Plus, ChevronUp, Layers, 
  Sparkles, User as UserIcon, Building, ChevronRight,
  Sprout, Globe, Users2, Circle, LogIn, ArrowRight, Menu, Search, Calculator, BarChart3,
  Wallet, FileText, CreditCard, Activity, Briefcase, Store
} from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, label, active, onClick, badge = 0, children }: any) => (
  <div className="flex flex-col">
    <Link 
      to={to} 
      onClick={onClick}
      className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all group ${
        active 
          ? 'bg-emerald-50 text-[#043003] shadow-sm' 
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <div className="flex items-center space-x-3 min-w-0">
          <Icon size={20} className={active ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-500 transition-colors'} />
          <span className={`truncate text-sm font-black tracking-tight uppercase`}>{label}</span>
      </div>
      {badge > 0 && (
          <span className="bg-red-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg animate-pulse ring-4 ring-red-500/20 shrink-0">
              {badge}
          </span>
      )}
    </Link>
    {children && active && (
        <div className="mt-1 ml-4 space-y-1 animate-in slide-in-from-top-1">
            {children}
        </div>
    )}
  </div>
);

const AppLayout = ({ children, user, onLogout }: any) => {
  const location = useLocation();
  const [pendingLeads, setPendingLeads] = useState<RegistrationRequest[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  
  useEffect(() => {
      const fetchCounts = () => {
          if (user.role === UserRole.ADMIN) {
              const reqs = mockService.getRegistrationRequests().filter(r => r.status === 'Pending' && r.consumerData?.invoiceFile);
              setPendingLeads(reqs);
              
              const notifs = mockService.getAppNotifications(user.id).filter(n => !n.isRead);
              setUnreadNotifications(notifs.length);
          }
      };
      fetchCounts();
      const int = setInterval(fetchCounts, 5000);
      return () => clearInterval(int);
  }, [user]);

  const isActive = (path: string, exact: boolean = false) => {
      if (exact) return location.pathname === path;
      return location.pathname.startsWith(path);
  };
  const isPartner = user.role === UserRole.WHOLESALER || user.role === UserRole.FARMER;
  
  return (
    <div className="flex min-h-screen bg-white">
      <NativePushBanner />
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 fixed inset-y-0 z-30">
        <div className="p-8 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#043003] rounded-lg flex items-center justify-center text-white font-bold text-lg">P</div>
          <span className="font-black text-xl tracking-tighter text-gray-900 uppercase">Platform Zero</span>
        </div>
        
        <div className="flex-1 px-4 space-y-8 flex flex-col no-scrollbar">
            {user.role === UserRole.ADMIN ? (
                  <div className="space-y-1">
                    <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Command HQ</p>
                    <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" active={isActive('/', true)} />
                    <div className="pt-4 mt-4 border-t border-gray-50">
                        <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Management</p>
                        <SidebarLink to="/login-requests" icon={UserPlus} label="Login Requests" active={isActive('/login-requests')} badge={pendingLeads.length} />
                        <SidebarLink to="/consumer-onboarding" icon={Users} label="Consumer Onboarding" active={isActive('/consumer-onboarding')} />
                        <SidebarLink to="/customer-portal" icon={Store} label="Customer Portal" active={isActive('/customer-portal')} />
                        <SidebarLink 
                            to="/pricing-requests" 
                            icon={Calculator} 
                            label="Pricing Requests" 
                            active={isActive('/pricing-requests')}
                        >
                            {pendingLeads.length > 0 && (
                                <div className="space-y-1 pt-1">
                                    <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest pl-2 mb-2">Invoiced Leads</p>
                                    {pendingLeads.map(lead => (
                                        <Link 
                                            key={lead.id} 
                                            to="/pricing-requests" 
                                            state={{ req: lead }}
                                            className="block px-4 py-2 text-[10px] font-black text-gray-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-all truncate uppercase border-l-2 border-transparent hover:border-indigo-400"
                                        >
                                            {lead.businessName}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </SidebarLink>
                        <SidebarLink to="/marketplace-activity" icon={ShoppingCart} label="Market Activity" active={isActive('/marketplace-activity')} />
                    </div>
                  </div>
              ) : user.role === UserRole.CONSUMER ? (
                <div className="space-y-1">
                    <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" active={isActive('/', true)} />
                    <SidebarLink to="/orders" icon={ShoppingCart} label="Track Orders" active={isActive('/orders')} />
                    <SidebarLink to="/marketplace" icon={ShoppingBag} label="Fresh Catalog" active={isActive('/marketplace')} />
                    <SidebarLink to="/accounts" icon={Wallet} label="Accounts & Billing" active={isActive('/accounts')} />
                </div>
              ) : isPartner ? (
                <div className="space-y-1">
                    <SidebarLink to="/" icon={LayoutDashboard} label="Order Management" active={isActive('/', true)} />
                    <SidebarLink to="/pricing" icon={Tags} label="Inventory & Price" active={isActive('/pricing')} />
                    <SidebarLink to="/accounts" icon={DollarSign} label="Financials" active={isActive('/accounts')} />
                    <SidebarLink to="/market" icon={Globe} label="Supplier Market" active={isActive('/market')} />
                </div>
              ) : null}
        </div>

        <div className="p-4 border-t border-gray-50 space-y-1">
            <SidebarLink to="/settings" icon={Settings} label="Settings" active={isActive('/settings')} />
            <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl text-sm font-black transition-all uppercase">
                <LogOut size={20} />
                <span>Sign Out</span>
            </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 w-full min-h-screen bg-[#F8FAFC]">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-20">
            <div className="hidden sm:flex items-center gap-4 flex-1">
              <div className="relative max-w-md w-full group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18}/>
                <input type="text" placeholder="Search HQ records..." className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all"/>
              </div>
            </div>
            <div className="flex items-center gap-4">
                <button 
                  onClick={() => notificationService.notify("Trade Alert", "A new wholesale lead has arrived.")}
                  className="p-3 bg-gray-50 text-gray-400 hover:text-indigo-600 rounded-xl relative transition-all"
                >
                    <Bell size={20} />
                    {unreadNotifications > 0 && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
                </button>
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-black text-gray-900 leading-none mb-1 uppercase">{user.name}</p>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">{user.role}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-black shadow-sm">{user.name.charAt(0)}</div>
                </div>
            </div>
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

  const handleAutoLogin = (email: string) => {
    const foundUser = mockService.getAllUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser) { setUser(foundUser); setShowAuthModal(false); } else { alert("Account not found."); }
  };

  const wrapLayout = (element: React.ReactElement) => (
    <Router>
        <Routes>
            <Route path="/l/:itemId" element={<SharedProductLanding user={user} onLogin={() => { setAuthStep('category'); setShowAuthModal(true); }} />} />
            <Route path="/*" element={
                user ? (
                    <AppLayout user={user} onLogout={() => setUser(null)}>
                        {element}
                    </AppLayout>
                ) : (
                    <>
                        <ConsumerLanding onLogin={() => { setAuthStep('category'); setShowAuthModal(true); }} />
                        <AuthModal 
                            isOpen={showAuthModal} 
                            onClose={() => setShowAuthModal(false)} 
                            step={authStep} 
                            setStep={setAuthStep} 
                            onLogin={(e: any) => {e.preventDefault();}} 
                            onAutoLogin={handleAutoLogin} 
                        />
                    </>
                )
            } />
        </Routes>
    </Router>
  );

  return wrapLayout(
    <Routes>
      <Route path="/" element={user?.role === UserRole.ADMIN ? <AdminDashboard /> : user?.role === UserRole.CONSUMER ? <ConsumerDashboard user={user} /> : user ? <Dashboard user={user} /> : <Navigate to="/" />} />
      <Route path="/login-requests" element={<LoginRequests />} />
      <Route path="/consumer-onboarding" element={<ConsumerOnboarding />} />
      <Route path="/customer-portal" element={<CustomerPortals />} />
      <Route path="/pricing-requests" element={<PricingRequests user={user!} />} />
      <Route path="/marketplace-activity" element={<Marketplace user={user} />} />
      <Route path="/marketplace" element={<Marketplace user={user} />} />
      <Route path="/pricing" element={<ProductPricing user={user!} />} />
      <Route path="/inventory" element={<Inventory items={mockService.getAllInventory()} />} />
      <Route path="/accounts" element={<Accounts user={user!} />} />
      <Route path="/settings" element={<SettingsComponent user={user!} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const AuthModal = ({ isOpen, onClose, step, setStep, onAutoLogin }: any) => {
    if (!isOpen) return null;
    const demoLogins = [
        { label: 'ADMIN HQ', email: 'admin@pz.com' },
        { label: 'WHOLESALER', email: 'sarah@fresh.com' },
        { label: 'FARMER', email: 'bob@greenvalley.com' },
        { label: 'BUYER', email: 'alice@cafe.com' },
    ];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Portal Access</h2>
                    <button onClick={onClose} className="text-gray-300 hover:text-gray-600"><X size={28} /></button>
                </div>
                <div className="p-10 space-y-6">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">Development Demo Logins</p>
                    <div className="grid grid-cols-1 gap-3">
                        {demoLogins.map(demo => (
                            <button 
                                key={demo.label} 
                                onClick={() => onAutoLogin(demo.email)} 
                                className="flex items-center justify-between p-6 bg-gray-50 hover:bg-emerald-50 rounded-2xl border border-transparent hover:border-emerald-100 transition-all group"
                            >
                                <div className="text-left">
                                    <span className="text-[11px] font-black text-gray-900 uppercase tracking-widest">{demo.label}</span>
                                    <span className="block text-xs text-gray-400 font-medium">{demo.email}</span>
                                </div>
                                <ArrowRight size={20} className="text-gray-300 group-hover:text-emerald-600 transition-all"/>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
