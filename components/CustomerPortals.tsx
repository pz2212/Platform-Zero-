
import React, { useState } from 'react';
import { 
  Gift, Users, Tag, Calendar, Megaphone, Plus, Trash2, 
  ToggleLeft, ToggleRight, LayoutDashboard, Settings, DollarSign, ArrowRight
} from 'lucide-react';

interface PromoCode {
  id: string;
  code: string;
  discountDisplay: string;
  redemptions: number;
  status: 'Active' | 'Paused';
  type: 'percent' | 'fixed';
  value: number;
}

export const CustomerPortals: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'growth' | 'credits'>('growth');
  const [bonusEnabled, setBonusEnabled] = useState(true);
  const [bonusAmount, setBonusAmount] = useState(15);
  const [referralEnabled, setReferralEnabled] = useState(true);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([
    { id: '1', code: 'WELCOME50', discountDisplay: '50% OFF', redemptions: 124, status: 'Active', type: 'percent', value: 50 },
    { id: '2', code: 'FREELUNCH', discountDisplay: '$15 CREDIT', redemptions: 45, status: 'Paused', type: 'fixed', value: 15 },
  ]);

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Customer Portal</h1>
        <div className="flex space-x-8 border-b border-gray-200 mt-8">
          <button onClick={() => setActiveTab('overview')} className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-colors border-b-2 ${activeTab === 'overview' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-400'}`}>Overview & Payouts</button>
          <button onClick={() => setActiveTab('growth')} className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-colors border-b-2 ${activeTab === 'growth' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-400'}`}>Growth & Incentives</button>
          <button onClick={() => setActiveTab('credits')} className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-colors border-b-2 ${activeTab === 'credits' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-400'}`}>Credits & Economy</button>
        </div>
      </div>

      {activeTab === 'growth' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-10 group transition-all hover:shadow-xl">
              <div className="flex justify-between items-start mb-10">
                <div className="flex gap-5">
                  <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center shadow-inner-sm"><Gift size={28} /></div>
                  <div><h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase">New User Bonus</h3><p className="text-sm text-gray-500 font-medium">Auto-incentivize new signups.</p></div>
                </div>
                <button onClick={() => setBonusEnabled(!bonusEnabled)} className="transition-all active:scale-90">{bonusEnabled ? <ToggleRight size={48} className="text-emerald-500 fill-current"/> : <ToggleLeft size={48} className="text-gray-200"/>}</button>
              </div>
              <div className="space-y-6">
                <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Bonus Amount (Credits)</label>
                <div className="relative"><DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"/><input type="number" value={bonusAmount} onChange={(e) => setBonusAmount(parseFloat(e.target.value))} className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-black text-xl text-gray-900 outline-none focus:ring-4 focus:ring-emerald-500/5"/></div></div>
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex gap-4 items-start"><Megaphone size={20} className="text-blue-600 shrink-0 mt-0.5"/><div className="text-xs text-blue-800 font-bold uppercase tracking-wide leading-relaxed">Active Campaign: All new users receive <span className="text-blue-900 font-black underline">{bonusAmount} Credits</span> automatically.</div></div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-10 group transition-all hover:shadow-xl flex flex-col h-full">
              <div className="flex justify-between items-start mb-10">
                <div className="flex gap-5">
                  <div className="w-14 h-14 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center shadow-inner-sm"><Users size={28} /></div>
                  <div><h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Referral Program</h3><p className="text-sm text-gray-500 font-medium">Reward viral network growth.</p></div>
                </div>
                <button onClick={() => setReferralEnabled(!referralEnabled)} className="transition-all active:scale-90">{referralEnabled ? <ToggleRight size={48} className="text-emerald-500 fill-current"/> : <ToggleLeft size={48} className="text-gray-200"/>}</button>
              </div>
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2rem] p-8 text-center flex-1 flex flex-col justify-center items-center">
                <h4 className="text-2xl font-black text-gray-800 mb-1 uppercase tracking-tighter">"Give 10, Get 10"</h4>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Global Marketplace Message</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-10 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <div className="flex gap-5 items-center">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-inner-sm"><Tag size={24} /></div>
                <div><h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Promo Codes</h3><p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">Manage active discount tokens.</p></div>
              </div>
              <button className="px-6 py-3 bg-[#0F172A] text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-lg"><Plus size={16}/> Create Code</button>
            </div>
            <div className="p-8">
              <table className="w-full text-left">
                <thead className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <tr><th className="py-4 px-4">CODE NAME</th><th className="py-4">DISCOUNT</th><th className="py-4">REDEMPTIONS</th><th className="py-4">STATUS</th><th className="py-4 text-right px-4">ACTIONS</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {promoCodes.map(code => (
                    <tr key={code.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="py-6 px-4 font-black text-gray-900 font-mono tracking-tighter text-lg">{code.code}</td>
                      <td className="py-6"><span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-gray-200">{code.discountDisplay}</span></td>
                      <td className="py-6 font-bold text-gray-500 text-sm">{code.redemptions} Uses</td>
                      <td className="py-6"><span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${code.status === 'Active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>{code.status}</span></td>
                      <td className="py-6 text-right px-4"><button className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={20}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
