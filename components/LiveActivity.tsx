
import React, { useState, useEffect } from 'react';
import { Truck, Package, CheckCircle2, X, MapPin, Sprout, Building2, Bell, ShieldCheck, ShoppingCart, Info } from 'lucide-react';
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
      // Auto-hide after 10 seconds if it's just a system message
      if (notification.type === 'SYSTEM') {
          const timeout = setTimeout(() => setIsVisible(false), 8000);
          return () => clearTimeout(timeout);
      }
    } else {
      setIsVisible(false);
    }
  }, [notification]);

  if (!notification || !isVisible) return null;

  // Custom mapping for different roles to make it feel specific
  const getRouteInfo = () => {
    switch(user.role) {
      case UserRole.FARMER: 
        return { from: "FIELD", to: "PZ", label: "Collection Window", icon: <Sprout size={14}/> };
      case UserRole.WHOLESALER:
        return { from: "PZ", to: "BUYER", label: "Fulfillment Window", icon: <Truck size={14}/> };
      case UserRole.CONSUMER:
        return { from: "HUB", to: "HOME", label: "Delivery Arrival", icon: <ShoppingCart size={14}/> };
      default:
        return { from: "LEAD", to: "PZ", label: "Admin Action", icon: <ShieldCheck size={14}/> };
    }
  };

  const route = getRouteInfo();

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] w-[92%] max-w-[400px] animate-in slide-in-from-top-10 duration-500">
      <div className="bg-[#0B101B] text-white rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-white/10 p-5 overflow-hidden backdrop-blur-xl">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-lg">P0</div>
             <div className="flex flex-col">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{notification.title}</span>
                <span className="text-[10px] text-slate-500 font-bold">#{notification.id.split('-').pop()?.toUpperCase()}</span>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-950 text-emerald-400 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-900/50">
              {notification.type === 'ORDER' ? 'CONFIRMED' : 'ACTIVE'}
            </span>
          </div>
        </div>

        {/* Route Visualization */}
        <div className="flex items-center justify-between px-2 mb-8">
            <div className="text-center">
                <p className="text-3xl font-black tracking-tighter text-white">{route.from}</p>
                <p className="text-[10px] font-black text-emerald-500 mt-1 uppercase tracking-widest">{new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</p>
            </div>

            <div className="flex-1 flex flex-col items-center px-6 relative">
                 <div className="w-full h-[2px] bg-slate-800 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 p-1.5 rounded-full border border-slate-700">
                        {route.icon}
                    </div>
                 </div>
                 <span className="text-[9px] font-black text-slate-500 mt-4 uppercase tracking-[0.2em]">Live Tracking</span>
            </div>

            <div className="text-center">
                <p className="text-3xl font-black tracking-tighter text-white">{route.to}</p>
                <p className="text-[10px] font-black text-emerald-500 mt-1 uppercase tracking-widest">ETA 12m</p>
            </div>
        </div>

        {/* Countdown Area */}
        <div className="bg-white/5 rounded-3xl p-5 border border-white/5 mb-6 flex items-center justify-between">
            <div className="flex flex-col">
                <p className="text-lg font-black text-white">{route.label} in {timer}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Updated just now</p>
            </div>
            <div className="bg-emerald-500 p-2 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <CheckCircle2 size={24} className="text-white" />
            </div>
        </div>

        {/* System Interaction Footer */}
        <div className="text-center pb-2">
            <p className="text-[11px] font-bold text-slate-400 mb-5">View details in Platform Zero dashboard?</p>
            <div className="flex gap-3">
                <button 
                  onClick={() => setIsVisible(false)}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                >
                    Dismiss
                </button>
                <button 
                  onClick={() => setIsVisible(false)}
                  className="flex-1 py-4 bg-white text-slate-950 hover:bg-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl"
                >
                    Open Portal
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};
