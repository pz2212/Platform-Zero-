
import React, { useState } from 'react';
import { X, Building2, ShieldAlert, CheckCircle2, Mail, Phone, MapPin, Globe, ChevronDown } from 'lucide-react';
import { User, UserRole } from '../types';
import { mockService } from '../services/mockDataService';

interface CompleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onComplete: () => void;
}

const SOPHISTICATED_NDA = `
CONFIDENTIALITY AND INTELLECTUAL PROPERTY PROTECTION AGREEMENT (NDA)

This Agreement is entered into to preserve the proprietary integrity and trade secrets of Platform Zero ("the Discloser").

1. OWNERSHIP OF INTELLECTUAL PROPERTY: The Recipient acknowledges and agrees that all proprietary information, software architecture, source code, user interface designs, database schemas, unique business methodologies, and all professional relationships established or facilitated via the platform (collectively, "Proprietary Assets") are the sole and exclusive property of Platform Zero. All design aesthetics and platform functionality are protected as trade secrets.

2. NON-COMPETE AND ARCHITECTURAL PROTECTION: The Recipient agrees that they shall not, directly or indirectly, develop, or assist in the development of, any digital marketplace or software solution that possesses a structural, functional, or aesthetic similarity of 5% or greater to the Platform Zero framework.

3. LEGAL ENFORCEMENT AND INDEMNIFICATION: In the event of an established breach of this Agreement, the Recipient agrees to be held liable for the total sum of all legal expenditures, solicitor fees, and court costs incurred by Platform Zero in the enforcement of this Agreement. This indemnification is absolute and covers all costs associated with protecting Platform Zero's intellectual property and business relationships.

4. GOVERNING LAW: This Agreement shall be governed by and construed in accordance with the laws of the jurisdiction in which Platform Zero is headquartered.
`;

export const CompleteProfileModal: React.FC<CompleteProfileModalProps> = ({ isOpen, onClose, user, onComplete }) => {
  const isPartner = user.role === UserRole.FARMER || user.role === UserRole.WHOLESALER;

  const [formData, setFormData] = useState({
    businessName: user.businessName || '',
    abn: user.businessProfile?.abn || '',
    mobile: user.businessProfile?.businessMobile || '',
    email: user.email || '',
    location: user.businessProfile?.businessLocation || '',
    state: '',
    wholesalerMarkets: '',
    acceptNDA: false,
    accept7DayTerms: false
  });

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isPartner && !formData.acceptNDA) {
      alert("Please read and accept the Intellectual Property Protection Agreement (NDA) to proceed.");
      return;
    }

    if (!isPartner && !formData.accept7DayTerms) {
      alert("Please agree to the Payment Terms to proceed.");
      return;
    }
    
    mockService.updateBusinessProfile(user.id, {
      ...user.businessProfile,
      companyName: formData.businessName,
      abn: formData.abn,
      businessMobile: formData.mobile,
      businessLocation: formData.location,
      email: formData.email,
      isComplete: true,
    } as any);

    alert("Onboarding documentation submitted successfully!");
    onComplete();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[550px] my-8 relative animate-in zoom-in-95 duration-200 overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="p-6 pb-2 flex justify-between items-center bg-white">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
            Advanced Business Profile
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-6">
          
          <div className="space-y-5">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#0E946A]">
                <Building2 size={18} />
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-900">BUSINESS VERIFICATION</h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <input 
                  name="businessName" 
                  placeholder="Business Trading Name" 
                  required
                  className="w-full p-3 bg-[#F8FAFC] border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#0E946A] outline-none font-medium" 
                  value={formData.businessName} 
                  onChange={handleInputChange} 
                />
                <input 
                  name="abn" 
                  placeholder="Business ABN" 
                  required
                  className="w-full p-3 bg-[#F8FAFC] border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#0E946A] outline-none font-medium" 
                  value={formData.abn} 
                  onChange={handleInputChange} 
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#0E946A]">
                <Phone size={18} />
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-900">CONTACT DETAILS</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-3.5 text-gray-400"/>
                  <input 
                    name="mobile" 
                    placeholder="Mobile" 
                    required
                    className="w-full pl-9 p-3 bg-[#F8FAFC] border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#0E946A] outline-none font-medium" 
                    value={formData.mobile} 
                    onChange={handleInputChange} 
                  />
                </div>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-3.5 text-gray-400"/>
                  <input 
                    name="email" 
                    type="email"
                    placeholder="Email" 
                    required
                    className="w-full pl-9 p-3 bg-[#F8FAFC] border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#0E946A] outline-none font-medium" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#0E946A]">
                <MapPin size={18} />
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-900">LOCATION</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input 
                  name="location" 
                  placeholder="Physical Address" 
                  required
                  className="w-full p-3 bg-[#F8FAFC] border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#0E946A] outline-none font-medium" 
                  value={formData.location} 
                  onChange={handleInputChange} 
                />
                <div className="relative">
                  <select 
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-[#F8FAFC] border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#0E946A] outline-none text-gray-700 appearance-none pr-10 font-medium"
                  >
                    <option value="">Select State</option>
                    <option value="VIC">VIC</option>
                    <option value="NSW">NSW</option>
                    <option value="QLD">QLD</option>
                    <option value="WA">WA</option>
                    <option value="SA">SA</option>
                    <option value="TAS">TAS</option>
                    <option value="ACT">ACT</option>
                    <option value="NT">NT</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {isPartner && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#0E946A]">
                  <Globe size={18} />
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-900">DISTRIBUTION</h3>
                </div>
                <div className="relative">
                  <select 
                    name="wholesalerMarkets"
                    required
                    value={formData.wholesalerMarkets}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-[#F8FAFC] border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#0E946A] outline-none text-gray-700 appearance-none pr-10 font-medium"
                  >
                    <option value="">Do you supply wholesaler markets?</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}

            {/* NDA SECTION */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-indigo-600">
                <ShieldAlert size={18} />
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-900">TERMS OF TRADE & IP PROTECTION</h3>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-[11px] text-gray-600 leading-relaxed max-h-32 overflow-y-auto font-sans">
                  {SOPHISTICATED_NDA}
              </div>

              {isPartner ? (
                <label className="flex items-start gap-3 p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl cursor-pointer group hover:bg-indigo-50 transition-colors">
                  <input 
                    type="checkbox" 
                    name="acceptNDA" 
                    className="mt-1 w-5 h-5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500" 
                    checked={formData.acceptNDA} 
                    onChange={(e) => setFormData({...formData, acceptNDA: e.target.checked})} 
                  />
                  <div className="flex-1">
                    <span className="text-xs text-indigo-900 font-bold block group-hover:text-indigo-700 transition-colors">Accept NDA & IP Assignment</span>
                    <p className="text-[10px] text-indigo-700/70 mt-1">
                        I acknowledge Platform Zero's sole ownership of all platform assets, designs, and relationships, and agree to full legal cost indemnification.
                    </p>
                  </div>
                </label>
              ) : (
                <label className="flex items-center gap-3 p-3.5 bg-[#F8FAFC] rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <input 
                    type="checkbox" 
                    name="accept7DayTerms" 
                    className="w-4 h-4 rounded border-gray-300 text-[#0E946A] focus:ring-[#0E946A]" 
                    checked={formData.accept7DayTerms} 
                    onChange={(e) => setFormData({...formData, accept7DayTerms: e.target.checked})} 
                  />
                  <span className="text-xs text-gray-600 font-medium">I agree to Platform Zero's <strong className="text-gray-900 font-bold">Standard Payment Terms</strong>.</span>
                </label>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              className="w-full py-5 bg-[#043003] hover:bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={18} />
              Submit Finalized Profile
            </button>
            <p className="text-center text-[10px] text-gray-400 font-black uppercase tracking-widest mt-4">
              Status: <span className="text-orange-500 ml-1">Awaiting Submission</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
