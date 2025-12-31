import React, { useState, KeyboardEvent } from 'react';
import { X, Sprout, ShoppingCart, Check, Sparkles, ArrowRight, Plus } from 'lucide-react';
import { User } from '../types';
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
  const [customInput, setCustomInput] = useState('');

  if (!isOpen) return null;

  const toggleInterest = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const addCustomItem = (type: 'selling' | 'buying') => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    
    // Capitalize first letter
    const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    
    if (type === 'selling' && !selling.includes(formatted)) {
      setSelling([...selling, formatted]);
    } else if (type === 'buying' && !buying.includes(formatted)) {
      setBuying([...buying, formatted]);
    }
    setCustomInput('');
  };

  const handleKeyDown = (e: KeyboardEvent, type: 'selling' | 'buying') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomItem(type);
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
                Type or select items you currently have in stock or grow. We'll match you with buyers looking for these.
              </p>
              
              {/* Custom Type Input */}
              <div className="flex gap-2">
                <div className="relative flex-1 group">
                  <input 
                    type="text" 
                    placeholder="Type a product name..." 
                    className="w-full pl-4 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 font-bold text-gray-900 transition-all shadow-inner-sm"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, 'selling')}
                  />
                </div>
                <button 
                  onClick={() => addCustomItem('selling')}
                  className="bg-[#043003] text-white p-4 rounded-2xl shadow-lg active:scale-95 transition-all"
                >
                  <Plus size={24}/>
                </button>
              </div>

              {/* Selection View */}
              <div className="space-y-4">
                {selling.length > 0 && (
                  <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1">
                    {selling.map(item => (
                      <button
                        key={item}
                        onClick={() => toggleInterest(selling, setSelling, item)}
                        className="px-4 py-2 bg-emerald-600 border-2 border-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 group transition-all"
                      >
                        <Check size={12} strokeWidth={4} />
                        {item}
                        <X size={12} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="h-px bg-gray-50"></div>

                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Common Market Suggestions</p>
                <div className="flex flex-wrap gap-2">
                  {COMMON_PRODUCE.filter(p => !selling.includes(p)).map(item => (
                    <button
                      key={item}
                      onClick={() => toggleInterest(selling, setSelling, item)}
                      className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 bg-white border-gray-100 text-gray-400 hover:border-emerald-200 transition-all"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => { setStep(2); setCustomInput(''); }}
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
                Type or select items you frequently source. We'll find network partners who grow or wholesale these.
              </p>

              {/* Custom Type Input */}
              <div className="flex gap-2">
                <div className="relative flex-1 group">
                  <input 
                    type="text" 
                    placeholder="Type what you need..." 
                    className="w-full pl-4 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 font-bold text-gray-900 transition-all shadow-inner-sm"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, 'buying')}
                  />
                </div>
                <button 
                  onClick={() => addCustomItem('buying')}
                  className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg active:scale-95 transition-all"
                >
                  <Plus size={24}/>
                </button>
              </div>

              {/* Selection View */}
              <div className="space-y-4">
                {buying.length > 0 && (
                  <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1">
                    {buying.map(item => (
                      <button
                        key={item}
                        onClick={() => toggleInterest(buying, setBuying, item)}
                        className="px-4 py-2 bg-indigo-600 border-2 border-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 group transition-all"
                      >
                        <Check size={12} strokeWidth={4} />
                        {item}
                        <X size={12} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="h-px bg-gray-50"></div>

                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Common Market Suggestions</p>
                <div className="flex flex-wrap gap-2">
                  {COMMON_PRODUCE.filter(p => !buying.includes(p)).map(item => (
                    <button
                      key={item}
                      onClick={() => toggleInterest(buying, setBuying, item)}
                      className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 bg-white border-gray-100 text-gray-400 hover:border-indigo-200 transition-all"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button 
                  onClick={() => { setStep(1); setCustomInput(''); }}
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