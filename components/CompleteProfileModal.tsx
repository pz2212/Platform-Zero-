
import React, { useState } from 'react';
import { X, BookOpen, Building, Truck, Users, CreditCard, DollarSign, FileText } from 'lucide-react';
import { User, BusinessProfile } from '../types';
import { mockService } from '../services/mockDataService';

interface CompleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onComplete: () => void;
}

const STRICT_TERMS_CONTENT = `
PLATFORM ZERO - TERMS & CONDITIONS AND NON-DISCLOSURE AGREEMENT

1. CONFIDENTIALITY & NON-DISCLOSURE (NDA)
You agree to keep all information regarding Platform Zero's technology, business model, customer lists, and pricing strictly confidential. You must not disclose this information to any third party without express written consent.

2. NON-COMPETE & TECHNOLOGY RESTRICTIONS
You expressly agree not to create, develop, or assist in the creation of any technology, software, or platform that competes with Platform Zero or mimics its functionality. This restriction applies during your partnership and for a period of 24 months thereafter.

3. WHITE LABELING & BRANDING RESTRICTIONS
When fulfilling orders for Platform Zero customers:
- You MUST NOT include any of your own branding, marketing materials, or contact information.
- You MUST NOT include your own invoices or picking slips. Only Platform Zero documentation is permitted.
- All packaging must be unbranded or branded as per Platform Zero's specifications.

4. NON-SOLICITATION & DIRECT DEALING
You agree NOT to sell directly to any customer introduced to you by Platform Zero. If you bypass Platform Zero to sell directly to our customers, you agree that Platform Zero reserves the right to take immediate legal action.

5. DAMAGES & COMPENSATION
In the event of a breach of Clause 3 or 4 (Direct Dealing / Branding), you agree to pay Platform Zero compensation equal to the specific customer's estimated ANNUAL SPENDING amount, plus all legal fees and costs incurred by Platform Zero in enforcing this agreement.

6. PAYMENT TERMS
You agree to the payment terms selected in this onboarding document.

7. ACCEPTANCE
By clicking "Accept" below, you acknowledge that you have read, understood, and agreed to be legally bound by these terms.
`;

export const CompleteProfileModal: React.FC<CompleteProfileModalProps> = ({ isOpen, onClose, user, onComplete }) => {
  const [formData, setFormData] = useState<BusinessProfile>({
    // Company Info
    companyName: user.businessProfile?.companyName || user.businessName || '',
    tradingName: user.businessProfile?.tradingName || '',
    abn: user.businessProfile?.abn || '',
    businessLocation: user.businessProfile?.businessLocation || '',
    directorName: user.businessProfile?.directorName || '',
    businessMobile: user.businessProfile?.businessMobile || '',
    email: user.businessProfile?.email || user.email || '',
    
    // Accounts
    accountsEmail: user.businessProfile?.accountsEmail || '',
    accountsMobile: user.businessProfile?.accountsMobile || '',
    
    // Operations
    tradingDaysHours: user.businessProfile?.tradingDaysHours || '',
    productsSold: user.businessProfile?.productsSold || '',
    
    // Logistics
    hasLogistics: user.businessProfile?.hasLogistics ?? null,
    deliversStatewide: user.businessProfile?.deliversStatewide || false,
    deliveryDistanceKm: user.businessProfile?.deliveryDistanceKm || '',
    deliversInterstate: user.businessProfile?.deliversInterstate || false,
    logisticPartner1: user.businessProfile?.logisticPartner1 || '',
    logisticPartner2: user.businessProfile?.logisticPartner2 || '',
    logisticPartner3: user.businessProfile?.logisticPartner3 || '',
    
    // Banking
    bankName: user.businessProfile?.bankName || '',
    bsb: user.businessProfile?.bsb || '',
    accountNumber: user.businessProfile?.accountNumber || '',
    
    // Commercial
    agreeTo14DayTerms: user.businessProfile?.agreeTo14DayTerms || false,
    agreeTo20PercentDiscount: user.businessProfile?.agreeTo20PercentDiscount ?? null,
    alternativeDiscount: user.businessProfile?.alternativeDiscount || '',
    
    // Legal
    acceptedTandCs: user.businessProfile?.acceptedTandCs || false,
    isComplete: false
  });

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleRadioChange = (name: string, value: boolean) => {
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.acceptedTandCs) {
        alert("You must read and accept the Terms & Conditions to proceed.");
        return;
    }
    
    if (!formData.agreeTo14DayTerms) {
        alert("You must agree to the 14-day payment terms to partner with Platform Zero.");
        return;
    }

    if (formData.hasLogistics === null) {
        alert("Please specify if you have logistics.");
        return;
    }

    if (formData.agreeTo20PercentDiscount === null) {
        alert("Please answer the upfront payment discount question.");
        return;
    }

    // Save to mock service
    mockService.updateBusinessProfile(user.id, formData);
    
    alert("Business Profile completed successfully!");
    onComplete();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8 relative animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-xl sticky top-0 z-10">
          <div>
              <h2 className="text-xl font-bold text-gray-900">Complete Business Profile</h2>
              <p className="text-sm text-gray-500">Required for all Partners</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8 max-h-[80vh] overflow-y-auto">
          
          {/* Section 1: Business Info */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2 border-b border-gray-100 pb-2">
              <Building size={14} className="text-emerald-600"/> COMPANY DETAILS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="companyName" required placeholder="Company Name" className="p-3 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" value={formData.companyName} onChange={handleInputChange} />
              <input name="tradingName" required placeholder="Trading Name" className="p-3 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" value={formData.tradingName} onChange={handleInputChange} />
              <input name="abn" required placeholder="ABN" className="p-3 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" value={formData.abn} onChange={handleInputChange} />
              <input name="businessLocation" required placeholder="Business Location" className="p-3 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" value={formData.businessLocation} onChange={handleInputChange} />
              <input name="directorName" required placeholder="Director Name" className="p-3 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" value={formData.directorName} onChange={handleInputChange} />
              <input name="businessMobile" required placeholder="Business Mobile" className="p-3 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" value={formData.businessMobile} onChange={handleInputChange} />
              <input name="email" type="email" required placeholder="General Email" className="p-3 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 md:col-span-2" value={formData.email} onChange={handleInputChange} />
            </div>
          </div>

          {/* Section 2: Accounts Info */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2 border-b border-gray-100 pb-2">
              <FileText size={14} className="text-emerald-600"/> ACCOUNTS CONTACT
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="accountsEmail" type="email" required placeholder="Accounts Email" className="p-3 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" value={formData.accountsEmail} onChange={handleInputChange} />
              <input name="accountsMobile" required placeholder="Accounts Mobile" className="p-3 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" value={formData.accountsMobile} onChange={handleInputChange} />
            </div>
          </div>

          {/* Section 3: Operations */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2 border-b border-gray-100 pb-2">
              <Users size={14} className="text-emerald-600"/> OPERATIONS
            </h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Trading Days and Hours</label>
                    <textarea name="tradingDaysHours" required placeholder="e.g. Mon-Fri 6am-3pm" className="w-full p-3 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 h-20 resize-none" value={formData.tradingDaysHours} onChange={handleInputChange} />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Products that you sell</label>
                    <textarea name="productsSold" required placeholder="List your main product categories..." className="w-full p-3 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 h-20 resize-none" value={formData.productsSold} onChange={handleInputChange} />
                </div>
            </div>
          </div>

          {/* Section 4: Logistics */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2 border-b border-gray-100 pb-2">
              <Truck size={14} className="text-emerald-600"/> LOGISTICS
            </h3>
            <div className="space-y-4">
                <div className="flex items-center gap-6">
                    <label className="text-sm font-medium text-gray-700">Do you have logistics?</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="hasLogistics" className="text-emerald-600 focus:ring-emerald-500" checked={formData.hasLogistics === true} onChange={() => handleRadioChange('hasLogistics', true)} /> Yes
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="hasLogistics" className="text-emerald-600 focus:ring-emerald-500" checked={formData.hasLogistics === false} onChange={() => handleRadioChange('hasLogistics', false)} /> No
                        </label>
                    </div>
                </div>

                {/* If YES */}
                {formData.hasLogistics === true && (
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-6">
                            <span className="text-sm text-gray-600 w-48">Do you deliver products state wide?</span>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer text-sm">
                                    <input type="radio" name="deliversStatewide" checked={formData.deliversStatewide === true} onChange={() => handleRadioChange('deliversStatewide', true)} /> Yes
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer text-sm">
                                    <input type="radio" name="deliversStatewide" checked={formData.deliversStatewide === false} onChange={() => handleRadioChange('deliversStatewide', false)} /> No
                                </label>
                            </div>
                        </div>
                        <div>
                            <input name="deliveryDistanceKm" placeholder="If No, how far? (e.g. 50km radius)" className="w-full p-2 border border-gray-300 rounded text-sm" value={formData.deliveryDistanceKm} onChange={handleInputChange} />
                        </div>
                        <div className="flex items-center gap-6">
                            <span className="text-sm text-gray-600 w-48">Do you deliver interstate?</span>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer text-sm">
                                    <input type="radio" name="deliversInterstate" checked={formData.deliversInterstate === true} onChange={() => handleRadioChange('deliversInterstate', true)} /> Yes
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer text-sm">
                                    <input type="radio" name="deliversInterstate" checked={formData.deliversInterstate === false} onChange={() => handleRadioChange('deliversInterstate', false)} /> No
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {/* If NO */}
                {formData.hasLogistics === false && (
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3 animate-in fade-in slide-in-from-top-2">
                        <label className="block text-sm font-medium text-gray-700">What logistic businesses do you use? (List 3)</label>
                        <input name="logisticPartner1" placeholder="Provider 1" className="w-full p-2 border border-gray-300 rounded text-sm" value={formData.logisticPartner1} onChange={handleInputChange} />
                        <input name="logisticPartner2" placeholder="Provider 2" className="w-full p-2 border border-gray-300 rounded text-sm" value={formData.logisticPartner2} onChange={handleInputChange} />
                        <input name="logisticPartner3" placeholder="Provider 3" className="w-full p-2 border border-gray-300 rounded text-sm" value={formData.logisticPartner3} onChange={handleInputChange} />
                    </div>
                )}
            </div>
          </div>

          {/* Section 5: Banking */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2 border-b border-gray-100 pb-2">
              <DollarSign size={14} className="text-emerald-600"/> BANK DETAILS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input name="bankName" required placeholder="Bank Name" className="p-3 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" value={formData.bankName} onChange={handleInputChange} />
                <input name="bsb" required placeholder="BSB" className="p-3 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" value={formData.bsb} onChange={handleInputChange} />
                <input name="accountNumber" required placeholder="Account Number" className="p-3 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" value={formData.accountNumber} onChange={handleInputChange} />
            </div>
          </div>

          {/* Section 6: Commercial Agreements */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2 border-b border-gray-100 pb-2">
              <CreditCard size={14} className="text-emerald-600"/> COMMERCIAL TERMS
            </h3>
            <div className="space-y-4">
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer border border-gray-200">
                    <input type="checkbox" name="agreeTo14DayTerms" className="text-emerald-600 focus:ring-emerald-500" checked={formData.agreeTo14DayTerms} onChange={handleCheckboxChange} />
                    <span className="text-sm text-gray-700">If Platform Zero sends you new customers/orders, do you agree to <strong>14 Day Payment Terms</strong>?</span>
                </label>

                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                    <div className="text-sm text-gray-700">If Platform Zero pays you upfront, will you give PZ a <strong>20% Discount</strong>?</div>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                            <input type="radio" name="agreeTo20PercentDiscount" checked={formData.agreeTo20PercentDiscount === true} onChange={() => handleRadioChange('agreeTo20PercentDiscount', true)} /> Yes
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                            <input type="radio" name="agreeTo20PercentDiscount" checked={formData.agreeTo20PercentDiscount === false} onChange={() => handleRadioChange('agreeTo20PercentDiscount', false)} /> No
                        </label>
                    </div>
                    {formData.agreeTo20PercentDiscount === false && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <input name="alternativeDiscount" placeholder="If no, what discount amount (%) would you give?" className="w-full p-2 border border-gray-300 rounded text-sm" value={formData.alternativeDiscount} onChange={handleInputChange} />
                        </div>
                    )}
                </div>
            </div>
          </div>

          {/* Section 7: Legal T&Cs */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2 border-b border-gray-100 pb-2">
              <BookOpen size={14} className="text-emerald-600"/> LEGAL ACCEPTANCE
            </h3>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-600 h-48 overflow-y-auto whitespace-pre-wrap font-serif mb-4">
                {STRICT_TERMS_CONTENT}
            </div>
            <label className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-lg cursor-pointer">
                <input type="checkbox" name="acceptedTandCs" className="mt-1 text-red-600 focus:ring-red-500" checked={formData.acceptedTandCs} onChange={handleCheckboxChange} />
                <span className="text-sm text-red-900 font-bold">
                    I have read and accept the Terms & Conditions, NDA, Non-Compete, and Branding Restrictions. I understand that legal action may be taken for breaches.
                </span>
            </label>
          </div>

        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-white rounded-b-xl sticky bottom-0 z-10">
          <button 
            onClick={handleSubmit}
            className="w-full py-3 bg-[#043003] text-white rounded-lg font-bold hover:bg-[#064004] shadow-sm transition-all text-sm"
          >
            Submit & Complete Profile
          </button>
        </div>
      </div>
    </div>
  );
};
