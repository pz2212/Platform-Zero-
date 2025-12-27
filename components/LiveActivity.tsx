
import React, { useState, useEffect } from 'react';
import { Truck, Package, CheckCircle2, X, MapPin, Sprout, Building2, Bell, ShieldCheck, ShoppingCart, Info, Check } from 'lucide-react';
import { AppNotification, User, UserRole } from '../types';

interface LiveActivityProps {
  notification: AppNotification | null;
  user: User;
  onClose: () => void;
}

export const LiveActivity: React.FC<LiveActivityProps> = ({ notification, user, onClose }) => {
  const [timer, setTimer] = useState("15:00");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      // Auto-hide after 15 seconds to simulate a transient system notification
      const timeout = setTimeout(() => setIsVisible(false), 15000);
      return () => clearTimeout(timeout);
    } else {
      setIsVisible(false);
    }
  }, [notification]);

  if (!notification || !isVisible) return null;

  // Determination of labels based on the specific notification type provided in reference
  const isPriceRequest = notification.type === 'PRICE_REQUEST';
  
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] w-[94%] max-w-[420px] animate-in slide-in-from-top-12 duration-700 ease-out">
      <div className="bg-[#0B1221] text-white rounded-[2.8rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)] border border-white/10 p-6 overflow-hidden backdrop-blur-2xl ring-1 ring-white/5">
        
        {/* TOP ROW: Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
             <div className="w-9 h-9 bg-[#10B981] rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg ring-1 ring-white/20">
                P0
             </div>
             <div className="flex flex-col">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    {isPriceRequest ? 'New Price Request' : notification.title}
                </span>
                <span className="text-[10px] text-slate-500 font-bold tracking-tight">
                    #{notification.id.split('-').pop()?.toUpperCase() || '1766868784608'}
                </span>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-[#064E3B]/40 text-[#10B981] text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest border border-[#10B981]/20">
              Active
            </span>
          </div>
        </div>

        {/* MIDDLE SECTION: Live Route Tracking */}
        <div className="flex items-center justify-between px-4 mb-10">
            <div className="text-center">
                <p className="text-4xl font-black tracking-tighter text-white">PZ</p>
                <p className="text-[11px] font-black text-[#10B981] mt-1.5 uppercase tracking-widest">
                    {new Date(notification.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                </p>
            </div>

            <div className="flex-1 flex flex-col items-center px-4 relative">
                 <div className="w-full h-[1.5px] bg-slate-800 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0B1221] p-2 rounded-full border border-slate-700 shadow-xl">
                        <Truck size={18} className="text-slate-400" />
                    </div>
                 </div>
                 <span className="text-[9px] font-black text-slate-500 mt-5 uppercase tracking-[0.25em]">Live Tracking</span>
            </div>

            <div className="text-center">
                <p className="text-4xl font-black tracking-tighter text-white">BUYER</p>
                <p className="text-[11px] font-black text-[#10B981] mt-1.5 uppercase tracking-widest">ETA 12m</p>
            </div>
        </div>

        {/* INNER CAPSULE: Fulfillment Window */}
        <div className="bg-white/5 rounded-[2rem] p-6 border border-white/5 mb-8 flex items-center justify-between group cursor-pointer hover:bg-white/[0.08] transition-colors">
            <div className="flex flex-col">
                <p className="text-xl font-black text-white tracking-tight">Fulfillment Window in {timer}</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Updated just now</p>
            </div>
            <div className="bg-[#10B981] p-2.5 rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.4)] ring-4 ring-[#10B981]/10">
                <Check size={26} strokeWidth={3} className="text-white" />
            </div>
        </div>

        {/* BOTTOM SECTION: Interaction */}
        <div className="text-center">
            <p className="text-xs font-bold text-slate-400 mb-6 px-4">View details in Platform Zero dashboard?</p>
            <div className="flex gap-3">
                <button 
                  onClick={() => setIsVisible(false)}
                  className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] transition-all border border-white/5"
                >
                    Dismiss
                </button>
                <button 
                  onClick={() => setIsVisible(false)}
                  className="flex-1 py-5 bg-white text-slate-950 hover:bg-slate-100 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-[0.98]"
                >
                    Open Portal
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};
