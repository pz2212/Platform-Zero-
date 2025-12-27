
import React, { useState, useRef, useEffect } from 'react';
import { X, Building2, ShieldAlert, CheckCircle2, Mail, Phone, MapPin, Globe, ChevronDown, CreditCard, Truck, BookOpen, ChevronRight, Check } from 'lucide-react';
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
      // Allow a small margin (5px) for sub-pixel differences
      if (scrollHeight - scrollTop <= clientHeight + 5) {
        setHasScrolledToBottom(true);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white">
          <div>
            <h2 className="text-2xl font-black text-[#0F172A] tracking-tight uppercase">Full Terms of Trade</h2>
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
            <h3 className="font-black text-gray-900 text-lg">Platform Zero Terms and Conditions</h3>
            <p>These Terms and Conditions govern the sale of fresh goods supplied by Platform Zero (“Platform Zero”) to the customer (“Customer”). By placing an order, the Customer agrees to be bound by these Terms.</p>
            
            <div className="space-y-4">
              <p><strong className="text-gray-900 font-black">1. Payment terms</strong><br/>Standard terms: Unless using Platform Zero’s American Express partnership, invoices must be paid within 7 days of the order date. Extended terms via American Express: Customers seeking extended payment terms through Platform Zero’s American Express partnership must complete the onboarding process, including signing all required documentation.</p>
              
              <p><strong className="text-gray-900 font-black">2. Late payments</strong><br/>If there is an outstanding invoice Platform Zero reserves the right to:<br/>- suspend fulfilment of further orders, and<br/>- take legal action to recover outstanding amounts. The Customer will be liable for all collection costs, including debt collector expenses, court costs, and solicitor fees.</p>
              
              <p><strong className="text-gray-900 font-black">3. Reporting issues</strong><br/>The Customer must notify Platform Zero within one hour of receiving goods if there are any issues (e.g. missing items, damaged goods, or quality concerns). Notification may be made via email, text, or the designated Platform Zero portal. To qualify for credit on damaged or poor-quality goods, the Customer must:<br/>- provide photographic evidence through the Platform Zero portal, and<br/>- return affected goods where requested. Without photographic evidence, no credit will be issued within 4 hours of receving the product.</p>
              
              <p><strong className="text-gray-900 font-black">4. Credits and replacements</strong><br/>Credits or replacements will only be processed once photographic evidence is provided. Credits for quality issues are subject to return of the goods. Claims must be made within 4 hours of receipt. No credits will be issued after this period.</p>
              
              <p><strong className="text-gray-900 font-black">5. Transport costs</strong><br/>Transport is included in product prices at the delivery location 10km radius of the CBD.</p>
              
              <p><strong className="text-gray-900 font-black">6. Pricing</strong><br/>Prices may fluctuate due to market conditions and seasonality. Where a price has been locked in, but the market rate increases by more than 25%, Platform Zero reserves the right to charge the current daily market rate.</p>
              
              <p><strong className="text-gray-900 font-black">7. Governing law</strong><br/>These Terms are governed by the laws of the jurisdiction in which Platform Zero operates.</p>
              
              <p><strong className="text-gray-900 font-black">8. Third-party processing</strong><br/>Platform Zero may use accredited third-party SQF processors for product cutting. Where products carry the processor’s label due to SQF’s requirements, the Customer must not purchase directly from the processor. If the Customer circumvents Platform Zero and orders directly, causing Platform Zero’s orders to decrease or cease, Platform Zero reserves the right to pursue legal action against both the Customer and the processor for loss of income.</p>
              
              <p><strong className="text-gray-900 font-black">9. Pre-orders</strong><br/>To ensure next-day delivery, Platform Zero pre-orders produce in advance to guarantee availability, quality, and on-time delivery. If a Customer does not intend to place their usual order, they must provide Platform Zero with at least 7 days’ notice. Where no order is placed and no notice is given, Platform Zero reserves the right to charge the Customer an amount equal to the average daily order value over the past three weeks.</p>
              
              <p><strong className="text-gray-900 font-black">10. Acceptance</strong><br/>By placing an order, the Customer acknowledges they have read, understood, and agree to comply with these Terms and Conditions. A signature is not required, Platform Zero’s terms are fully accepted from when the first order is made.</p>
            </div>

            <div className="pt-8 border-t border-gray-100 text-[10px] font-bold text-gray-400">
              ABN 53 667 679 003 • 10-20 Gwynne St, Cremorne, VIC 3121<br/>
              0413 470 925 • commercial@platformzerosolutions.com<br/>
              www.platformzero.com.au
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
              className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-emerald-100 transition-all flex items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-2"
            >
              <CheckCircle2 size={20}/> I Accept Terms & Conditions
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
    productsOfInterest: '',
    acceptTerms: false
  });

  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
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
      ...user.businessProfile,
      companyName: formData.businessName,
      abn: formData.abn,
      businessLocation: formData.address,
      isComplete: true,
    } as any);

    alert("Business profile finalized and submitted for review!");
    onComplete();
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
        <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-[500px] my-8 relative animate-in zoom-in-95 duration-200 overflow-hidden border border-gray-100">
          
          {/* Header */}
          <div className="p-8 pb-4 flex justify-between items-center bg-white">
            <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">
              Advanced Business Profile
            </h2>
            <button onClick={onClose} className="text-gray-300 hover:text-gray-600 transition-colors p-1">
              <X size={28} strokeWidth={2.5} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 pt-2 space-y-8">
            
            {/* SECTION: BUSINESS VERIFICATION */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#10B981]">
                <Building2 size={18} strokeWidth={2.5}/>
                <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-gray-900">BUSINESS VERIFICATION</h3>
              </div>
              <div className="space-y-3">
                <input 
                  name="abn" 
                  placeholder="ABN / Tax ID" 
                  required
                  className="w-full p-4 bg-[#F8FAFC] border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] outline-none font-bold text-gray-900 placeholder-gray-300" 
                  value={formData.abn} 
                  onChange={handleInputChange} 
                />
                <input 
                  name="address" 
                  placeholder="Physical Address" 
                  required
                  className="w-full p-4 bg-[#F8FAFC] border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] outline-none font-bold text-gray-900 placeholder-gray-300" 
                  value={formData.address} 
                  onChange={handleInputChange} 
                />
              </div>
            </div>

            {/* SECTION: LOGISTIC PREFERENCES */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#10B981]">
                <Truck size={18} strokeWidth={2.5}/>
                <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-gray-900">LOGISTIC PREFERENCES</h3>
              </div>
              <div className="space-y-4">
                <textarea 
                  name="productsOfInterest"
                  placeholder="Main products of interest..."
                  className="w-full p-4 bg-[#F8FAFC] border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] outline-none font-bold text-gray-900 placeholder-gray-300 h-24 resize-none"
                  value={formData.productsOfInterest}
                  onChange={handleInputChange}
                />
                
                <div>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Preferred Delivery Days</p>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all border-2 ${
                          selectedDays.includes(day)
                          ? 'bg-[#10B981] border-[#10B981] text-white shadow-md'
                          : 'bg-gray-50 border-gray-100 text-gray-500 hover:border-gray-200'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION: TERMS OF TRADE */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 text-[#10B981]">
                <CreditCard size={18} strokeWidth={2.5}/>
                <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-gray-900">TERMS OF TRADE</h3>
              </div>
              
              <div className={`flex items-center gap-3 p-4 border rounded-2xl transition-all ${formData.acceptTerms ? 'bg-emerald-50 border-emerald-200' : 'bg-[#F8FAFC] border-gray-100'}`}>
                {formData.acceptTerms ? (
                  <div className="bg-emerald-500 text-white p-1 rounded-full"><Check size={14}/></div>
                ) : (
                  <div className="w-4 h-4 rounded border-2 border-gray-300"></div>
                )}
                <span className="text-xs text-gray-600 font-bold leading-snug">
                  Terms status: <strong className={formData.acceptTerms ? 'text-emerald-700' : 'text-orange-500'}>{formData.acceptTerms ? 'Accepted' : 'Pending Review'}</strong>
                </span>
              </div>

              <div className="flex justify-between items-center px-1">
                <button 
                  type="button" 
                  onClick={() => setIsTermsOpen(true)}
                  className="text-[#10B981] font-black text-[10px] uppercase tracking-widest flex items-center gap-1 hover:underline"
                >
                  <BookOpen size={14}/> Review Full T&Cs
                </button>
                <span className="text-orange-500 font-black text-[10px] uppercase tracking-widest">Awaiting Review</span>
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={!formData.acceptTerms}
                className="w-full py-5 bg-[#10B981] hover:bg-[#0E946A] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-2xl font-black text-sm uppercase tracking-[0.15em] shadow-xl shadow-emerald-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Submit Finalized Profile
              </button>
            </div>
          </form>
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
