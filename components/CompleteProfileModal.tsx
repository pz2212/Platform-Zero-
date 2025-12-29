import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Building2, ShieldAlert, CheckCircle2, Mail, Phone, MapPin, 
  Globe, ChevronDown, CreditCard, Truck, BookOpen, ChevronRight, 
  Check, Landmark, Users2, ShoppingBag, PackageSearch, HelpCircle,
  TrendingUp, Sparkles, Sprout, ShoppingCart, CheckCircle
} from 'lucide-react';
import { User, UserRole } from '../types';
import { mockService } from '../services/mockDataService';

interface CompleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onComplete: () => void;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const TermsModal = ({ isOpen, onClose, onAccept }: { isOpen: boolean, onClose: () => void, onAccept: () => void }) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      if (scrollHeight - scrollTop <= clientHeight + 5) {
        setHasScrolledToBottom(true);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white">
          <div>
            <h2 className="text-2xl font-black text-[#0F172A] tracking-tight uppercase">Terms of Trade</h2>
            <p className="text-xs text-gray-400 font-black uppercase tracking-widest mt-1">Platform Zero Solutions</p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-600 transition-colors p-1">
            <X size={28} strokeWidth={2.5} />
          </button>
        </div>

        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-10 space-y-6 text-sm text-gray-600 leading-relaxed custom-scrollbar bg-gray-50/30"
        >
          <div className="space-y-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-black text-gray-900 text-lg">Platform Zero Wholesaler Agreement</h3>
            <div className="space-y-4">
              <p><strong className="text-gray-900 font-black">1. Agency & Direct Trade</strong><br/>Wholesalers using the Platform Zero marketplace acknowledge that Platform Zero acts as a facilitator for trade between primary producers and end consumers. Direct circumvention of the platform for active PZ-introduced leads is prohibited.</p>
              <p><strong className="text-gray-900 font-black">2. Payment & Settlement</strong><br/>Platform Zero facilitates payments via automated clearing. Bank details provided must match the registered ABN entity name. Payouts are processed on a T+7 basis unless otherwise agreed.</p>
              <p><strong className="text-gray-900 font-black">3. Logistic Agency (Optional)</strong><br/>Wholesalers opting to become "Platform Zero Agents" agree to maintain a fleet capable of fulfilling PZ marketplace orders according to agreed service levels.</p>
            </div>
            <div className="pt-8 border-t border-gray-100 text-[10px] font-bold text-gray-400">
              ABN 53 667 679 003 • 10-20 Gwynne St, Cremorne, VIC 3121<br/>
              commercial@platformzerosolutions.com
            </div>
          </div>
        </div>

        <div className="p-8 bg-gray-50 border-t border-gray-100">
          {!hasScrolledToBottom ? (
            <div className="flex items-center justify-center gap-3 text-gray-400 font-black text-xs uppercase tracking-widest animate-pulse">
              Scroll to bottom to accept <ChevronRight size={16}/>
            </div>
          ) : (
            <button 
              onClick={onAccept}
              className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-emerald-100 transition-all flex items-center justify-center gap-3 animate-in fade-in"
            >
              <CheckCircle2 size={20}/> Accept Terms of Trade
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const CompleteProfileModal: React.FC<CompleteProfileModalProps> = ({ isOpen, onClose, user, onComplete }) => {
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<number>(0);
  
  const [formData, setFormData] = useState({
    businessName: user.businessName || '',
    abn: '',
    address: '',
    // Banking
    bankName: '',
    bsb: '',
    accountNumber: '',
    // Stakeholders
    directorName: '',
    directorEmail: '',
    directorPhone: '',
    accountsName: '',
    accountsEmail: '',
    accountsPhone: '',
    // Trade
    productsSell: '',
    productsGrow: '',
    productsBuy: '',
    // Logistics
    hasLogistics: false,
    wantPzAgent: false,
    acceptTerms: false
  });

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleAcceptFromModal = () => {
    setFormData(prev => ({ ...prev, acceptTerms: true }));
    setIsTermsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.acceptTerms) {
      alert("Please review and accept the Terms of Trade to proceed.");
      return;
    }
    
    mockService.updateBusinessProfile(user.id, {
      ...formData,
      isComplete: true,
    } as any);

    alert("Your onboarding document has been submitted for verification.");
    onComplete();
    onClose();
  };

  const SectionHeader = ({ icon: Icon, title, sub }: any) => (
    <div className="flex items-center gap-4 mb-6">
      <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner-sm">
        <Icon size={24} strokeWidth={2.5}/>
      </div>
      <div>
        <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight leading-none">{title}</h3>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{sub}</p>
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto">
        <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl my-8 animate-in zoom-in-95 duration-200 overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
          
          <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#043003] rounded-xl flex items-center justify-center text-white font-black text-xl">P</div>
              <div>
                <h2 className="text-2xl font-black text-[#0F172A] tracking-tight leading-none">Onboarding Document</h2>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-1">Wholesaler Setup • Australia</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-300 hover:text-gray-600 transition-colors p-1 bg-gray-50 rounded-full">
              <X size={24} strokeWidth={2.5} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 pt-6 space-y-12 custom-scrollbar">
            
            {/* SECTION 1: IDENTITY */}
            <section className="animate-in slide-in-from-left-4">
              <SectionHeader icon={Building2} title="Business Identity" sub="Entity Information" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1 block">Trading Name</label>
                  <input name="businessName" placeholder="e.g. Smith's Fresh Wholesale" required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-black text-gray-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" value={formData.businessName} onChange={handleInputChange} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1 block">ABN</label>
                  <input name="abn" placeholder="XX XXX XXX XXX" required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-black text-gray-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" value={formData.abn} onChange={handleInputChange} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1 block">Headquarters Address</label>
                  <input name="address" placeholder="Store 1, SA Produce Market" required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-black text-gray-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" value={formData.address} onChange={handleInputChange} />
                </div>
              </div>
            </section>

            {/* SECTION 2: CONTACTS */}
            <section className="animate-in slide-in-from-left-4 duration-500">
              <SectionHeader icon={Users2} title="Stakeholders" sub="Key Decision Makers" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest border-b border-indigo-50 pb-2">Director / Owner</p>
                  <input name="directorName" placeholder="Full Name" required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 outline-none" value={formData.directorName} onChange={handleInputChange} />
                  <input name="directorEmail" type="email" placeholder="Email Address" required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 outline-none" value={formData.directorEmail} onChange={handleInputChange} />
                  <input name="directorPhone" placeholder="Mobile Phone" required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 outline-none" value={formData.directorPhone} onChange={handleInputChange} />
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest border-b border-indigo-50 pb-2">Accounts / AP</p>
                  <input name="accountsName" placeholder="Contact Name" required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 outline-none" value={formData.accountsName} onChange={handleInputChange} />
                  <input name="accountsEmail" type="email" placeholder="Accounts Email" required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 outline-none" value={formData.accountsEmail} onChange={handleInputChange} />
                  <input name="accountsPhone" placeholder="Accounts Direct Line" required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 outline-none" value={formData.accountsPhone} onChange={handleInputChange} />
                </div>
              </div>
            </section>

            {/* SECTION 3: BANKING */}
            <section className="animate-in slide-in-from-left-4 duration-700">
              <SectionHeader icon={Landmark} title="Banking Details" sub="Australian Settlement Info" />
              <div className="bg-emerald-50/30 p-6 rounded-[2rem] border border-emerald-100/50 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1 block">Bank Name</label>
                  <input name="bankName" placeholder="e.g. CBA, Westpac" required className="w-full p-4 bg-white border border-gray-100 rounded-2xl text-sm font-black text-gray-900 outline-none" value={formData.bankName} onChange={handleInputChange} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1 block">BSB</label>
                  <input name="bsb" placeholder="XXX-XXX" required className="w-full p-4 bg-white border border-gray-100 rounded-2xl text-sm font-black text-gray-900 outline-none" value={formData.bsb} onChange={handleInputChange} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1 block">Account Number</label>
                  <input name="accountNumber" placeholder="XXXXXXXXX" required className="w-full p-4 bg-white border border-gray-100 rounded-2xl text-sm font-black text-gray-900 outline-none" value={formData.accountNumber} onChange={handleInputChange} />
                </div>
              </div>
            </section>

            {/* SECTION 4: PRODUCT CATALOG */}
            <section>
              <SectionHeader icon={PackageSearch} title="Trade Catalog" sub="Core Inventory Mix" />
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
                    <TrendingUp size={14} className="text-emerald-500"/> Products You Sell
                  </label>
                  <textarea name="productsSell" placeholder="Apples, Pears, Citrus..." className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 h-20 resize-none outline-none focus:bg-white" value={formData.productsSell} onChange={handleInputChange} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
                            {/* Fix: Added missing Lucide Sprout component */}
                            <Sprout size={14} className="text-emerald-500"/> Products You Grow
                        </label>
                        <textarea name="productsGrow" placeholder="Stone fruit, Cherries..." className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 h-20 resize-none outline-none focus:bg-white" value={formData.productsGrow} onChange={handleInputChange} />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
                            {/* Fix: Added missing Lucide ShoppingCart component */}
                            <ShoppingCart size={14} className="text-emerald-500"/> Products You Buy
                        </label>
                        <textarea name="productsBuy" placeholder="Potatoes, Root Veg..." className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 h-20 resize-none outline-none focus:bg-white" value={formData.productsBuy} onChange={handleInputChange} />
                    </div>
                </div>
              </div>
            </section>

            {/* SECTION 5: LOGISTICS */}
            <section className="bg-indigo-50/30 p-8 rounded-[2.5rem] border border-indigo-100/50 space-y-6">
              <SectionHeader icon={Truck} title="Logistics & Delivery" sub="Fleet Availability" />
              
              <div className="flex items-center justify-between p-6 bg-white rounded-2xl border border-indigo-100 shadow-sm">
                <div className="flex items-center gap-4">
                   <div className={`p-3 rounded-xl transition-all ${formData.hasLogistics ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <Truck size={24}/>
                   </div>
                   <div>
                      <p className="font-black text-gray-900 uppercase text-sm tracking-tight leading-none">Internal Logistics</p>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Do you operate your own fleet?</p>
                   </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="hasLogistics" className="sr-only peer" checked={formData.hasLogistics} onChange={handleInputChange}/>
                  <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {formData.hasLogistics && (
                <div className="p-6 bg-emerald-600 rounded-2xl text-white shadow-xl animate-in zoom-in-95 duration-300 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                    <Sparkles size={120}/>
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="bg-white/20 p-2 rounded-lg">
                        {/* Fix: Added missing Lucide CheckCircle component */}
                        <CheckCircle size={20}/>
                      </div>
                      <div>
                        <h4 className="font-black uppercase tracking-widest text-sm leading-none mb-1">Platform Zero Agent Program</h4>
                        <p className="text-[10px] text-emerald-100 font-medium leading-relaxed opacity-80">
                          As an Agent, we send you pre-paid marketplace orders for delivery within your operational region. 
                          <span className="font-black text-white ml-1">Earn additional freight margin on every load.</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200">Opt-in to Agency status?</span>
                       <button 
                          type="button"
                          onClick={() => setFormData(prev => ({...prev, wantPzAgent: !prev.wantPzAgent}))}
                          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.wantPzAgent ? 'bg-white text-emerald-700 shadow-lg' : 'bg-emerald-700/50 text-emerald-300 border border-white/20'}`}
                       >
                          {formData.wantPzAgent ? 'YES, SIGN ME UP' : 'NO, NOT NOW'}
                       </button>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* SECTION 6: COMPLIANCE */}
            <section className="space-y-4 pt-4">
              <div className="flex items-center gap-2 text-[#10B981]">
                <ShieldAlert size={18} strokeWidth={2.5}/>
                <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-gray-900">FINAL VERIFICATION</h3>
              </div>
              
              <div className={`flex items-center gap-4 p-6 border rounded-[1.5rem] transition-all shadow-sm ${formData.acceptTerms ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-100'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${formData.acceptTerms ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-gray-200 text-transparent'}`}>
                  <Check size={20} strokeWidth={4}/>
                </div>
                <div>
                  <p className="text-sm text-gray-900 font-black tracking-tight leading-none mb-1">Agreement of Terms</p>
                  <p className="text-xs text-gray-500 font-medium">I confirm all business and banking details are accurate for ABN verification.</p>
                </div>
              </div>

              <div className="flex justify-between items-center px-2">
                <button 
                  type="button" 
                  onClick={() => setIsTermsOpen(true)}
                  className="text-[#10B981] font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5 hover:underline"
                >
                  <BookOpen size={14}/> Review Full Wholesaler Agreement
                </button>
                <div className="flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                   <span className="text-orange-500 font-black text-[10px] uppercase tracking-widest">Awaiting Submission</span>
                </div>
              </div>
            </section>
          </form>

          {/* Footer Actions */}
          <div className="p-8 border-t border-gray-100 bg-white sticky bottom-0 z-10 flex gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-gray-50 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={!formData.acceptTerms}
              className="flex-[2] py-4 bg-[#043003] hover:bg-black disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              Complete Onboarding <ChevronRight size={18}/>
            </button>
          </div>
        </div>
      </div>

      <TermsModal 
        isOpen={isTermsOpen} 
        onClose={() => setIsTermsOpen(false)} 
        onAccept={handleAcceptFromModal} 
      />
    </>
  );
};
