
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { UserRole, User } from './types';
import { USERS, mockService } from './services/mockDataService';
import { Dashboard } from './components/Dashboard';
import { ConsumerDashboard } from './components/ConsumerDashboard';
import { Inventory } from './components/Inventory';
import { ProductPricing } from './components/ProductPricing';
import { Marketplace } from './components/Marketplace';
import { SupplierMarket } from './components/SupplierMarket';
import { AdminDashboard } from './components/AdminDashboard';
import { DriverManagement } from './components/DriverManagement';
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
  BarChart4
} from 'lucide-react';

// --- Sidebar Navigation Component ---
const SidebarLink = ({ to, icon: Icon, label, active, onClick }: any) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
      active 
        ? 'bg-emerald-50 text-emerald-600 font-bold' 
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

const NetworkSignalsWidget = ({ user }: { user: User }) => {
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

  return (
    <div className="mx-3 mt-4 mb-2 bg-slate-900 rounded-xl p-3 text-white overflow-hidden shadow-lg border border-slate-800">
       <button 
         onClick={() => setIsExpanded(!isExpanded)}
         className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
       >
         <span>Daily Signals</span>
         {isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
       </button>
       
       {isExpanded && (
         <div className="mt-3 space-y-4 animate-in slide-in-from-top-2">
            {/* Selling */}
            <div>
               <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-2">
                  <TrendingUp size={12}/> Selling Today
               </div>
               <div className="flex gap-1 mb-2">
                  <input 
                    className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                    placeholder="e.g. Apples"
                    value={sellInput}
                    onChange={e => setSellInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAdd('sell')}
                  />
                  <button onClick={() => handleAdd('sell')} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded p-1"><Plus size={14}/></button>
               </div>
               <div className="flex flex-wrap gap-1.5">
                  {sellingTags.length === 0 && <span className="text-[10px] text-slate-600 italic">No items listed.</span>}
                  {sellingTags.map(tag => (
                     <span key={tag} className="bg-slate-800 text-slate-200 text-[10px] px-2 py-0.5 rounded flex items-center gap-1 border border-slate-700">
                        {tag}
                        <button onClick={() => handleRemove('sell', tag)} className="hover:text-red-400"><X size={10}/></button>
                     </span>
                  ))}
               </div>
            </div>

            {/* Buying */}
            <div>
               <div className="flex items-center gap-2 text-xs font-bold text-blue-400 mb-2">
                  <Target size={12}/> Buying Today
               </div>
               <div className="flex gap-1 mb-2">
                  <input 
                    className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                    placeholder="e.g. Packing"
                    value={buyInput}
                    onChange={e => setBuyInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAdd('buy')}
                  />
                  <button onClick={() => handleAdd('buy')} className="bg-blue-600 hover:bg-blue-700 text-white rounded p-1"><Plus size={14}/></button>
               </div>
               <div className="flex flex-wrap gap-1.5">
                  {buyingTags.length === 0 && <span className="text-[10px] text-slate-600 italic">No items listed.</span>}
                  {buyingTags.map(tag => (
                     <span key={tag} className="bg-slate-800 text-slate-200 text-[10px] px-2 py-0.5 rounded flex items-center gap-1 border border-slate-700">
                        {tag}
                        <button onClick={() => handleRemove('buy', tag)} className="hover:text-red-400"><X size={10}/></button>
                     </span>
                  ))}
               </div>
            </div>
         </div>
       )}
    </div>
  );
};

const AppLayout = ({ children, user, onLogout }: any) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  
  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Admin Management Dropdown State
  const [isManagementOpen, setIsManagementOpen] = useState(true);
  
  // Notification State
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      const fetchNotifs = () => {
          const notifs = mockService.getNotifications(user.id);
          setNotifications(notifs);
      };
      
      fetchNotifs();
      const interval = setInterval(fetchNotifs, 10000); // Poll every 10s
      
      return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
              setShowNotifications(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed inset-y-0 z-30">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#043003] rounded-lg flex items-center justify-center text-white font-bold text-lg">P</div>
          <span className="font-bold text-xl tracking-tight text-gray-900">Platform Zero</span>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {/* Admin Links */}
          {user.role === UserRole.ADMIN && (
            <>
              <SidebarLink to="/admin" icon={LayoutDashboard} label="Overview" active={isActive('/admin') || isActive('/')} />
              <SidebarLink to="/marketplace" icon={ShoppingBag} label="Marketplace Catalog" active={isActive('/marketplace')} />
              <SidebarLink to="/login-requests" icon={UserPlus} label="Leads & Requests" active={isActive('/login-requests')} />
              <SidebarLink to="/pricing-requests" icon={Tags} label="Pricing & Quotes" active={isActive('/pricing-requests')} />
              
              <div className="pt-4 pb-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Management
              </div>
              <button 
                  onClick={() => setIsManagementOpen(!isManagementOpen)}
                  className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-500 hover:text-gray-900 font-medium"
              >
                  <span>Operations</span>
                  {isManagementOpen ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
              </button>
              
              {isManagementOpen && (
                  <div className="space-y-1 pl-2">
                      <SidebarLink to="/consumer-onboarding" icon={Users} label="Partner Network" active={isActive('/consumer-onboarding')} />
                      <SidebarLink to="/customer-portals" icon={Store} label="Customer Portals" active={isActive('/customer-portals')} />
                      <SidebarLink to="/rep-management" icon={Award} label="Sales Team" active={isActive('/rep-management')} />
                  </div>
              )}
            </>
          )}

          {/* Wholesaler/Farmer Links */}
          {(user.role === UserRole.WHOLESALER || user.role === UserRole.FARMER) && (
            <>
              <SidebarLink to="/" icon={LayoutDashboard} label="Operations Dashboard" active={isActive('/')} />
              <SidebarLink to="/trading-insights" icon={BarChart4} label="Trading Insights" active={isActive('/trading-insights')} />
              <SidebarLink to="/orders" icon={ClipboardList} label="Orders" active={isActive('/orders')} />
              <SidebarLink to="/inventory" icon={Package} label="Inventory" active={isActive('/inventory')} />
              <SidebarLink to="/pricing" icon={Tags} label="Product & Pricing" active={isActive('/pricing')} />
              <SidebarLink to="/accounts" icon={DollarSign} label="Accounts" active={isActive('/accounts')} />
              
              <div className="pt-4 pb-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Growth
              </div>
              <SidebarLink to="/market" icon={Store} label="Supplier Market" active={isActive('/market')} />
              <SidebarLink to="/ai-matcher" icon={ScanLine} label="AI Opportunity Matcher" active={isActive('/ai-matcher')} />
            </>
          )}

          {/* Consumer Links */}
          {user.role === UserRole.CONSUMER && (
            <>
              <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" active={isActive('/')} />
              <SidebarLink to="/marketplace" icon={ShoppingBag} label="Order Now" active={isActive('/marketplace')} />
              <SidebarLink to="/my-orders" icon={ClipboardList} label="My Orders" active={isActive('/my-orders')} />
              <SidebarLink to="/accounts" icon={DollarSign} label="Invoices" active={isActive('/accounts')} />
            </>
          )}

          {/* Rep Links */}
          {user.role === UserRole.PZ_REP && (
            <>
              <SidebarLink to="/" icon={LayoutDashboard} label="My Dashboard" active={isActive('/')} />
              <SidebarLink to="/marketplace" icon={ShoppingBag} label="Marketplace" active={isActive('/marketplace')} />
            </>
          )}

          <div className="pt-4 mt-auto border-t border-gray-100">
            <SidebarLink to="/settings" icon={Settings} label="Settings" active={isActive('/settings')} />
          </div>
        </nav>

        {/* Network Signals Widget for Sellers */}
        {(user.role === UserRole.WHOLESALER || user.role === UserRole.FARMER) && (
            <NetworkSignalsWidget user={user} />
        )}

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3 px-2">
             <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                {user.name.charAt(0)}
             </div>
             <div className="overflow-hidden">
                <div className="text-sm font-bold text-gray-900 truncate">{user.name}</div>
                <div className="text-xs text-gray-500 truncate">{user.businessName}</div>
             </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-2 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 p-4 z-40 flex justify-between items-center">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#043003] rounded-lg flex items-center justify-center text-white font-bold">P</div>
            <span className="font-bold text-gray-900 tracking-tight">Platform Zero</span>
         </div>
         <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
         </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-white pt-20 px-4 pb-4 overflow-y-auto">
           <nav className="space-y-2">
              <SidebarLink to="/" icon={LayoutDashboard} label="Home" onClick={() => setIsMobileMenuOpen(false)} />
              
              {user.role === UserRole.ADMIN && (
                  <>
                    <SidebarLink to="/admin" icon={LayoutDashboard} label="Overview" onClick={() => setIsMobileMenuOpen(false)} />
                    <SidebarLink to="/marketplace" icon={ShoppingBag} label="Marketplace Catalog" onClick={() => setIsMobileMenuOpen(false)} />
                    <SidebarLink to="/login-requests" icon={UserPlus} label="Leads & Requests" onClick={() => setIsMobileMenuOpen(false)} />
                    <SidebarLink to="/pricing-requests" icon={Tags} label="Pricing & Quotes" onClick={() => setIsMobileMenuOpen(false)} />
                    
                    <div className="pt-4 pb-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Management
                    </div>
                    <SidebarLink to="/consumer-onboarding" icon={Users} label="Partner Network" onClick={() => setIsMobileMenuOpen(false)} />
                    <SidebarLink to="/customer-portals" icon={Store} label="Customer Portals" onClick={() => setIsMobileMenuOpen(false)} />
                    <SidebarLink to="/rep-management" icon={Award} label="Sales Team" onClick={() => setIsMobileMenuOpen(false)} />
                  </>
              )}

              {(user.role === UserRole.WHOLESALER || user.role === UserRole.FARMER) && (
                <>
                  <SidebarLink to="/trading-insights" icon={BarChart4} label="Trading Insights" onClick={() => setIsMobileMenuOpen(false)} />
                  <SidebarLink to="/orders" icon={ClipboardList} label="Orders" onClick={() => setIsMobileMenuOpen(false)} />
                  <SidebarLink to="/inventory" icon={Package} label="Inventory" onClick={() => setIsMobileMenuOpen(false)} />
                  <SidebarLink to="/pricing" icon={Tags} label="Product & Pricing" onClick={() => setIsMobileMenuOpen(false)} />
                  <SidebarLink to="/accounts" icon={DollarSign} label="Accounts" onClick={() => setIsMobileMenuOpen(false)} />
                  
                  <div className="pt-4 pb-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Growth
                  </div>
                  <SidebarLink to="/market" icon={Store} label="Supplier Market" onClick={() => setIsMobileMenuOpen(false)} />
                  <SidebarLink to="/ai-matcher" icon={ScanLine} label="AI Opportunity Matcher" onClick={() => setIsMobileMenuOpen(false)} />
                </>
              )}

              {user.role === UserRole.CONSUMER && (
                  <>
                    <SidebarLink to="/marketplace" icon={ShoppingBag} label="Order Now" onClick={() => setIsMobileMenuOpen(false)} />
                    <SidebarLink to="/my-orders" icon={ClipboardList} label="My Orders" onClick={() => setIsMobileMenuOpen(false)} />
                    <SidebarLink to="/accounts" icon={DollarSign} label="Invoices" onClick={() => setIsMobileMenuOpen(false)} />
                  </>
              )}

              {user.role === UserRole.PZ_REP && (
                 <SidebarLink to="/marketplace" icon={ShoppingBag} label="Marketplace" onClick={() => setIsMobileMenuOpen(false)} />
              )}

              <div className="pt-4 border-t border-gray-100">
                <SidebarLink to="/settings" icon={Settings} label="Settings" onClick={() => setIsMobileMenuOpen(false)} />
              </div>
              
              <button 
                onClick={onLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50"
              >
                <LogOut size={20} />
                <span className="font-medium">Sign Out</span>
              </button>
           </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 w-full overflow-x-hidden">
         {/* Top Bar (Notification Center) */}
         <div className="flex justify-end mb-6 relative">
             <div className="relative" ref={notifRef}>
                 <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors relative"
                 >
                     <Bell size={20}/>
                     {notifications.length > 0 && (
                         <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                     )}
                 </button>
                 
                 {showNotifications && (
                     <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 animate-in fade-in zoom-in-95 duration-200">
                         <div className="p-4 border-b border-gray-100 font-bold text-gray-900">Notifications</div>
                         <div className="max-h-64 overflow-y-auto">
                             {notifications.length === 0 ? (
                                 <div className="p-4 text-sm text-gray-500 text-center">No new notifications</div>
                             ) : (
                                 notifications.map((note, idx) => (
                                     <div key={idx} className="p-4 border-b border-gray-50 text-sm hover:bg-gray-50 last:border-0">
                                         {note}
                                     </div>
                                 ))
                             )}
                         </div>
                     </div>
                 )}
             </div>
         </div>

         {children}
      </main>
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Login Flow State
  const [loginView, setLoginView] = useState<'SELECT' | 'EMAIL'>('SELECT');
  const [email, setEmail] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedRoleContext, setSelectedRoleContext] = useState<string>('');

  const handlePortalSelect = (portal: 'MARKETPLACE' | 'PARTNERS' | 'ADMIN') => {
      setSelectedRoleContext(portal);
      setLoginView('EMAIL');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API Call
    setTimeout(() => {
      const foundUser = USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (foundUser) {
        setUser(foundUser);
        setShowLoginModal(false);
        setLoginView('SELECT'); // Reset for next time
      } else {
        alert("User not found. Try 'admin@pz.com', 'sarah@fresh.com' (Wholesaler), 'bob@greenvalley.com' (Farmer), 'alice@cafe.com' (Consumer), 'rep1@pz.com' (Rep)");
      }
      setLoading(false);
    }, 800);
  };

  const handleLogout = () => {
    setUser(null);
    setEmail('');
    setLoginView('SELECT');
  };

  const resetLoginModal = () => {
      setShowLoginModal(false);
      setLoginView('SELECT');
      setEmail('');
  };

  // If not logged in, show Landing Page or Login Modal
  if (!user) {
    return (
      <>
        {!showLoginModal ? (
           <ConsumerLanding onLogin={() => setShowLoginModal(true)} />
        ) : (
           <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
              <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md animate-in zoom-in-95 duration-300 relative overflow-hidden">
                <button 
                    onClick={resetLoginModal}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
                >
                    <X size={20}/>
                </button>

                {loginView === 'SELECT' ? (
                    <div className="text-center">
                        <div className="w-12 h-12 bg-[#043003] rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-6 shadow-md">P</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Choose Portal</h1>
                        <p className="text-gray-500 text-sm mb-8">Select your account type to login.</p>
                        
                        <div className="space-y-4">
                            <button 
                                onClick={() => handlePortalSelect('MARKETPLACE')}
                                className="w-full p-4 border border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group flex items-center gap-4 text-left"
                            >
                                <div className="bg-emerald-100 p-3 rounded-full text-emerald-700 group-hover:bg-emerald-200 transition-colors">
                                    <ShoppingBag size={24}/>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">Marketplace</h3>
                                    <p className="text-xs text-gray-500">For Restaurants, Cafes & Retailers</p>
                                </div>
                            </button>

                            <button 
                                onClick={() => handlePortalSelect('PARTNERS')}
                                className="w-full p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group flex items-center gap-4 text-left"
                            >
                                <div className="bg-blue-100 p-3 rounded-full text-blue-700 group-hover:bg-blue-200 transition-colors">
                                    <Handshake size={24}/>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">Partners</h3>
                                    <p className="text-xs text-gray-500">For Wholesalers, Farmers & Agents</p>
                                </div>
                            </button>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <button 
                                onClick={() => handlePortalSelect('ADMIN')}
                                className="text-xs text-gray-400 hover:text-gray-600 font-medium flex items-center justify-center gap-1 mx-auto transition-colors"
                            >
                                <Lock size={12}/> Platform Zero
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <button 
                            onClick={() => setLoginView('SELECT')}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 font-bold mb-6 transition-colors"
                        >
                            <ArrowLeft size={14}/> Back to Selection
                        </button>

                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {selectedRoleContext === 'MARKETPLACE' ? 'Buyer Login' : 
                                 selectedRoleContext === 'PARTNERS' ? 'Partner Login' : 
                                 'Admin Access'}
                            </h1>
                            <p className="text-gray-500 text-sm">Sign in to Platform Zero</p>
                        </div>
                        
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input 
                                    type="email" 
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            
                            <button 
                                type="submit" 
                                disabled={loading}
                                className={`w-full py-3 text-white rounded-lg font-bold transition-colors disabled:opacity-50 ${
                                    selectedRoleContext === 'PARTNERS' ? 'bg-blue-600 hover:bg-blue-700' :
                                    selectedRoleContext === 'ADMIN' ? 'bg-slate-800 hover:bg-slate-900' :
                                    'bg-emerald-600 hover:bg-emerald-700'
                                }`}
                            >
                                {loading ? 'Signing In...' : 'Sign In'}
                            </button>
                        </form>

                        <div className="mt-6 text-center text-xs text-gray-400">
                            <p className="mb-2 font-bold">Demo Credentials:</p>
                            {selectedRoleContext === 'ADMIN' ? (
                                <p>Admin: admin@pz.com</p>
                            ) : selectedRoleContext === 'PARTNERS' ? (
                                <>
                                    <p>Wholesaler: sarah@fresh.com</p>
                                    <p>Farmer: bob@greenvalley.com</p>
                                    <p>Rep: rep1@pz.com</p>
                                </>
                            ) : (
                                <p>Consumer: alice@cafe.com</p>
                            )}
                        </div>
                    </div>
                )}
              </div>
           </div>
        )}
      </>
    );
  }

  return (
    <Router>
      <AppLayout user={user} onLogout={handleLogout}>
        <Routes>
            <Route path="/" element={
              user.role === UserRole.ADMIN ? <Navigate to="/admin" replace /> :
              user.role === UserRole.WHOLESALER || user.role === UserRole.FARMER ? (
                <Dashboard user={user} />
              ) : 
              user.role === UserRole.DRIVER ? <DriverDashboard user={user} /> :
              user.role === UserRole.PZ_REP ? <RepDashboard user={user} /> :
              user.role === UserRole.CONSUMER ? <ConsumerDashboard user={user} /> :
              <Navigate to="/" replace />
            } />
            
            {/* Common Routes */}
            <Route path="/settings" element={<SettingsComponent user={user} onRefreshUser={() => setUser({...user, dashboardVersion: 'v1'})} />} />
            
            {/* Admin Routes */}
            {user.role === UserRole.ADMIN && (
              <>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/login-requests" element={<LoginRequests />} />
                <Route path="/marketplace" element={<Marketplace user={user} />} />
                <Route path="/consumer-onboarding" element={<ConsumerOnboarding />} />
                <Route path="/customer-portals" element={<CustomerPortals />} />
                <Route path="/pricing-requests" element={<PricingRequests user={user} />} />
                <Route path="/rep-management" element={<AdminRepManagement />} />
              </>
            )}

            {/* Seller Routes */}
            {(user.role === UserRole.WHOLESALER || user.role === UserRole.FARMER) && (
              <>
                <Route path="/trading-insights" element={<TradingInsights user={user} />} />
                <Route path="/inventory" element={<Inventory items={mockService.getInventory(user.id)} />} />
                <Route path="/pricing" element={<ProductPricing user={user} />} />
                <Route path="/market" element={<SupplierMarket user={user} />} />
                <Route path="/orders" element={<SellerDashboardV1 user={user} />} />
                <Route path="/ai-matcher" element={<AiOpportunityMatcher />} />
                <Route path="/accounts" element={<Accounts user={user} />} />
              </>
            )}

            {/* Consumer Routes */}
            {user.role === UserRole.CONSUMER && (
              <>
                <Route path="/marketplace" element={<Marketplace user={user} />} />
                <Route path="/my-orders" element={<CustomerOrders user={user} />} />
                <Route path="/accounts" element={<Accounts user={user} />} />
              </>
            )}

            {/* Rep Routes */}
            {user.role === UserRole.PZ_REP && (
               <Route path="/marketplace" element={<Marketplace user={user} />} />
            )}

        </Routes>
      </AppLayout>
    </Router>
  );
};

export default App;
