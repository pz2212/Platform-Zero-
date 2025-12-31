
import React, { useState } from 'react';
import { X, Sprout, ShoppingCart, Check, Sparkles, ArrowRight } from 'lucide-react';
import { User, UserRole } from '../types';
import { mockService } from '../services/mockDataService';

interface InterestsModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const COMMON_PRODUCE = [
  'Tomatoes', 'Eggplant', 'Potatoes', 'Onions', 'Lettuce', 
  'Apples', 'Bananas', 'Carrots', 'Broccoli', 'Avocados', 
  'Mangoes', 'Berries', 'Citrus', 'Stonefruit', 'Herbs'
];

export const InterestsModal: React.FC<InterestsModalProps> = ({ user, isOpen, onClose, onSaved }) => {
  const [selling, setSelling] = useState<string[]>(user.activeSellingInterests || []);
  const [buying, setBuying] = useState<string[]>(user.activeBuyingInterests || []);
  const [step, setStep] = useState<1 | 2>(1);

  if (!isOpen) return null;

  const toggleInterest = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSave = () => {
    mockService.updateUserInterests(user.id, selling, buying);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 md:p-10 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#0F172A] tracking-tight leading-none uppercase">Market Alignment</h2>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mt-1">Configure your network visibility</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 md:p-10 space-y-8">
          {step === 1 ? (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="flex items-center gap-3 text-[#043003]">
                <Sprout size={24} className="text-emerald-500" />
                <h3 className="font-black uppercase text-sm tracking-widest">What are you SELLING?</h3>
              </div>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                Select items you currently have in stock or grow. We'll match you with buyers looking for these.
              </p>
              <div className="flex flex-wrap gap-2">
                {COMMON_PRODUCE.map(item => (
                  <button
                    key={item}
                    onClick={() => toggleInterest(selling, setSelling, item)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all flex items-center gap-2 ${
                      selling.includes(item) 
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' 
                        : 'bg-white border-gray-100 text-gray-400 hover:border-emerald-200'
                    }`}
                  >
                    {selling.includes(item) && <Check size={12} strokeWidth={4} />}
                    {item}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setStep(2)}
                className="w-full mt-8 py-5 bg-[#0F172A] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3"
              >
                Continue to Buying <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="flex items-center gap-3 text-indigo-600">
                <ShoppingCart size={24} />
                <h3 className="font-black uppercase text-sm tracking-widest">What are you looking to BUY?</h3>
              </div>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                Select items you frequently source. We'll find network partners who grow or wholesale these.
              </p>
              <div className="flex flex-wrap gap-2">
                {COMMON_PRODUCE.map(item => (
                  <button
                    key={item}
                    onClick={() => toggleInterest(buying, setBuying, item)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all flex items-center gap-2 ${
                      buying.includes(item) 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                        : 'bg-white border-gray-100 text-gray-400 hover:border-indigo-200'
                    }`}
                  >
                    {buying.includes(item) && <Check size={12} strokeWidth={4} />}
                    {item}
                  </button>
                ))}
              </div>
              <div className="flex gap-4 mt-8">
                <button 
                  onClick={() => setStep(1)}
                  className="flex-1 py-5 bg-gray-100 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                >
                  Back
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-[2] py-5 bg-[#043003] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3"
                >
                  Save & Match Market <Sparkles size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
