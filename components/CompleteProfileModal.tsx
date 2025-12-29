import React, { useState, useRef } from 'react';
import { 
  X, Building2, ShieldAlert, CheckCircle2, Mail, Phone, MapPin, 
  ChevronRight, Landmark, Users2, PackageSearch, HelpCircle,
  TrendingUp, Sparkles, Sprout, ShoppingCart, CheckCircle, Truck, BookOpen,
  /* Fix: Added missing Check import from lucide-react */
  Check
} from 'lucide-react';
import { User, UserRole, BusinessProfile } from '../types';
import { mockService } from '../services/mockDataService';

interface CompleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onComplete: () => void;
}

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
  
  const [formData, setFormData] = useState({
    businessName: user.businessName || '',
    abn: user.businessProfile?.abn || '',
    address: user.businessProfile?.businessLocation || '',
    // Banking
    bankName: user.businessProfile?.bankName || '',
    bsb: user.businessProfile?.bsb || '',
    accountNumber: user.businessProfile?.accountNumber || '',
    // Director
    directorName: user.businessProfile?.directorName || '',
    directorEmail: user.businessProfile?.directorEmail || '',
    directorPhone: user.businessProfile?.directorPhone || '',
    // Accounts
    accountsName: user.businessProfile?.accountsName || '',
    accountsEmail: user.businessProfile?.accountsEmail || '',
    accountsPhone: user.businessProfile?.accountsPhone || '',
    // Trade Mix
    productsSell: user.businessProfile?.productsSell || '',
    productsGrow: user.businessProfile?.productsGrow || '',
    productsBuy: user.businessProfile?.productsBuy || '',
    // Logistics
    hasLogistics: user.businessProfile?.hasLogistics || false,
    wantPzAgent: user.businessProfile?.isPzAgent || false,
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
      companyName: formData.businessName,
      businessLocation: formData.address,
      isPzAgent: formData.wantPzAgent,
      isComplete: true,
    } as any);

    alert("Your onboarding profile has been submitted successfully!");
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

  const FormInput = ({ label, name, placeholder, required = true, type = "text" }: any) => (
    <div>
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1 block">{label}</label>
      <input 
        name={name} 
        type={type}
        placeholder={placeholder} 
        required={required}
        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-gray-300" 
        value={(formData as any)[name]} 
        onChange={handleInputChange} 
      />
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto">
        <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-3xl my-8 animate-in zoom-in-95 duration-200 overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
          
          <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#043003] rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg">P</div>
              <div>
                <h2 className="text-2xl font-black text-[#0F172A] tracking-tight leading-none uppercase">Wholesaler Onboarding</h2>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-1">Official Trade Registration • Australia</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-300 hover:text-gray-600 transition-colors p-2 bg-gray-50 rounded-full">
              <X size={24} strokeWidth={2.5} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 pt-6 space-y-12 custom-scrollbar">
            
            {/* SECTION 1: ENTITY */}
            <section className="animate-in slide-in-from-left-4">
              <SectionHeader icon={Building2} title="Business Entity" sub="Trading Identity Information" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <FormInput label="Full Trading Name" name="businessName" placeholder="e.g. Fresh Wholesalers Pty Ltd" />
                </div>
                <FormInput label="ABN" name="abn" placeholder="53 667 679 003" />
                <FormInput label="Principal Place of Business" name="address" placeholder="Store 12, Pooraka Produce Market" />
              </div>
            </section>

            {/* SECTION 2: BANKING */}
            <section className="bg-emerald-50/20 p-8 rounded-[2.5rem] border border-emerald-100/50 animate-in slide-in-from-left-4 duration-300">
              <SectionHeader icon={Landmark} title="Banking Details" sub="For Automated Payout Settlement" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormInput label="Bank Name" name="bankName" placeholder="e.g. Commonwealth Bank" />
                <FormInput label="BSB" name="bsb" placeholder="000-000" />
                <FormInput label="Account Number" name="accountNumber" placeholder="12345678" />
              </div>
            </section>

            {/* SECTION 3: KEY CONTACTS */}
            <section className="animate-in slide-in-from-left-4 duration-500">
              <SectionHeader icon={Users2} title="Key Stakeholders" sub="Operational Decision Makers" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest border-b border-indigo-50 pb-2 mb-4">
                    <CheckCircle size={14}/> Primary Director
                  </div>
                  <FormInput label="Director Name" name="directorName" placeholder="Full Name" />
                  <FormInput label="Director Email" name="directorEmail" type="email" placeholder="email@business.com" />
                  <FormInput label="Director Phone" name="directorPhone" placeholder="Mobile preferred" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest border-b border-indigo-50 pb-2 mb-4">
                    <CheckCircle size={14}/> Accounts / AP
                  </div>
                  <FormInput label="Accounts Contact" name="accountsName" placeholder="Accounts Manager" />
                  <FormInput label="Accounts Email" name="accountsEmail" type="email" placeholder="accounts@business.com" />
                  <FormInput label="Accounts Phone" name="accountsPhone" placeholder="Direct Line" />
                </div>
              </div>
            </section>

            {/* SECTION 4: PRODUCT CATEGORIES */}
            <section className="animate-in slide-in-from-left-4 duration-700">
              <SectionHeader icon={PackageSearch} title="Produce Inventory" sub="Market Catalog Categorization" />
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
                    <TrendingUp size={14} className="text-emerald-500"/> Products You Sell (Active Inventory)
                  </label>
                  <textarea 
                    name="productsSell" 
                    placeholder="e.g. Premium Tomatoes, Onions, Potatoes..." 
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 h-24 resize-none outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all" 
                    value={formData.productsSell} 
                    onChange={handleInputChange} 
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
                      <Sprout size={14} className="text-indigo-500"/> Products You Grow
                    </label>
                    <textarea 
                      name="productsGrow" 
                      placeholder="e.g. Seasonal stone fruits, leafy greens..." 
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 h-24 resize-none outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all" 
                      value={formData.productsGrow} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
                      <ShoppingCart size={14} className="text-indigo-500"/> Products You Buy (Sourcing Needs)
                    </label>
                    <textarea 
                      name="productsBuy" 
                      placeholder="e.g. Specialty herbs, organic root veg..." 
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 h-24 resize-none outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all" 
                      value={formData.productsBuy} 
                      onChange={handleInputChange} 
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 5: LOGISTICS & AGENT STATUS */}
            <section className="bg-indigo-50/40 p-8 rounded-[2.5rem] border border-indigo-100/50 space-y-6">
              <SectionHeader icon={Truck} title="Delivery Logistics" sub="Fulfillment Capabilities" />
              
              <div className="flex items-center justify-between p-6 bg-white rounded-2xl border border-indigo-100 shadow-sm">
                <div className="flex items-center gap-4">
                   <div className={`p-4 rounded-2xl transition-all shadow-md ${formData.hasLogistics ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <Truck size={28}/>
                   </div>
                   <div>
                      <p className="font-black text-gray-900 uppercase text-sm tracking-tight leading-none">Fleet Operations</p>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1.5">Do you operate your own distribution fleet?</p>
                   </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="hasLogistics" className="sr-only peer" checked={formData.hasLogistics} onChange={handleInputChange}/>
                  <div className="w-16 h-9 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-indigo-600 shadow-inner"></div>
                </label>
              </div>

              {formData.hasLogistics && (
                <div className="p-8 bg-emerald-600 rounded-[2rem] text-white shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden group border-2 border-emerald-400/30">
                  <div className="absolute top-0 right-0 p-10 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                    <Sparkles size={180}/>
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-start gap-5 mb-8">
                      <div className="bg-white/20 p-3 rounded-2xl shadow-lg border border-white/20">
                        <CheckCircle2 size={32}/>
                      </div>
                      <div>
                        <h4 className="font-black uppercase tracking-[0.2em] text-lg leading-none mb-2">Platform Zero Agent Program</h4>
                        <p className="text-xs text-emerald-50 font-medium leading-relaxed max-w-md">
                          As an Agent, we send you pre-paid marketplace orders for delivery within your operational region. 
                          <span className="font-black text-white ml-1">Receive new customers automatically and earn freight margin.</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                       <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-200">Opt-in to Agency Status?</span>
                       <button 
                          type="button"
                          onClick={() => setFormData(prev => ({...prev, wantPzAgent: !prev.wantPzAgent}))}
                          className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.wantPzAgent ? 'bg-white text-emerald-700 shadow-xl' : 'bg-emerald-700/50 text-emerald-300 border border-white/20'}`}
                       >
                          {formData.wantPzAgent ? 'AGENT STATUS ACTIVE' : 'REQUEST AGENT STATUS'}
                       </button>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* SECTION 6: COMPLIANCE */}
            <section className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#10B981] mb-6">
                <ShieldAlert size={18} strokeWidth={2.5}/>
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900">Compliance & Agreement</h3>
              </div>
              
              <div 
                onClick={() => !formData.acceptTerms && setIsTermsOpen(true)}
                className={`flex items-center gap-5 p-6 border-2 rounded-[2rem] transition-all shadow-sm cursor-pointer ${formData.acceptTerms ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-100 hover:border-emerald-300 group'}`}
              >
                <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all ${formData.acceptTerms ? 'bg-emerald-500 border-emerald-200 text-white' : 'bg-white border-gray-200 text-transparent group-hover:border-emerald-200'}`}>
                  {/* Fix: Added missing Check component call */}
                  <Check size={24} strokeWidth={4}/>
                </div>
                <div className="flex-1">
                  <p className="text-base text-gray-900 font-black tracking-tight leading-none mb-1.5">Official Terms of Trade</p>
                  <p className="text-xs text-gray-400 font-medium">I confirm that I am an authorized representative of the business entity.</p>
                </div>
                {!formData.acceptTerms && <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest group-hover:underline">Review & Accept</span>}
              </div>

              <div className="flex justify-between items-center px-4 mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsTermsOpen(true)}
                  className="text-gray-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:text-indigo-600 transition-colors"
                >
                  <BookOpen size={14}/> Wholesaler Agreement PDF
                </button>
                <div className="flex items-center gap-2">
                   <span className={`w-2 h-2 rounded-full ${formData.acceptTerms ? 'bg-emerald-500' : 'bg-orange-500 animate-pulse'}`}></span>
                   <span className={`font-black text-[10px] uppercase tracking-widest ${formData.acceptTerms ? 'text-emerald-600' : 'text-orange-500'}`}>
                     {formData.acceptTerms ? 'Terms Accepted' : 'Awaiting Acceptance'}
                   </span>
                </div>
              </div>
            </section>
          </form>

          {/* Footer Actions */}
          <div className="p-8 border-t border-gray-100 bg-white sticky bottom-0 z-10 flex gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-5 bg-gray-50 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95"
            >
              Close
            </button>
            <button 
              onClick={handleSubmit}
              disabled={!formData.acceptTerms}
              className="flex-[2] py-5 bg-[#043003] hover:bg-black disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              Submit Onboarding Profile <ChevronRight size={18}/>
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
