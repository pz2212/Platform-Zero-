
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegistrationRequest, UserRole } from '../types';
import { mockService } from '../services/mockDataService';
import { Check, X, Clock, UserCheck, UserX, Info, ShoppingBag, FileText, Calculator, UserPlus, Link as LinkIcon, Copy, Building, User, Mail, Smartphone, MapPin, ChevronRight, CheckCircle } from 'lucide-react';

const ManualInviteModal = ({ isOpen, onClose, onInvite }: { isOpen: boolean, onClose: () => void, onInvite: (data: any) => void }) => {
    const [formData, setFormData] = useState({
        businessName: '',
        name: '',
        email: '',
        mobile: '',
        role: UserRole.WHOLESALER as UserRole,
        location: ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onInvite(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                    <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Manual Business Invite</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2"><X size={24}/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Invitation Type</label>
                        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl">
                            <button 
                                type="button" 
                                onClick={() => setFormData({...formData, role: UserRole.WHOLESALER})}
                                className={`py-2 px-2 rounded-lg text-[11px] font-bold transition-all ${formData.role === UserRole.WHOLESALER ? 'bg-white text-gray-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Wholesaler / Farmer
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setFormData({...formData, role: UserRole.CONSUMER})}
                                className={`py-2 px-2 rounded-lg text-[11px] font-bold transition-all ${formData.role === UserRole.CONSUMER ? 'bg-white text-gray-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Buyer / Customer
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="relative">
                            <Building className="absolute left-3 top-3.5 text-slate-400" size={18}/>
                            <input required placeholder="Business Trading Name" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#043003] outline-none text-sm font-black text-slate-900 placeholder-slate-400" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} />
                        </div>
                        <div className="relative">
                            <User className="absolute left-3 top-3.5 text-slate-400" size={18}/>
                            <input required placeholder="Key Contact Name" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#043003] outline-none text-sm font-black text-slate-900 placeholder-slate-400" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 text-slate-400" size={18}/>
                                <input required type="email" placeholder="Email Address" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#043003] outline-none text-sm font-black text-slate-900 placeholder-slate-400" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            </div>
                            <div className="relative">
                                <Smartphone className="absolute left-3 top-3.5 text-slate-400" size={18}/>
                                <input placeholder="Mobile (Optional)" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#043003] outline-none text-sm font-black text-slate-900 placeholder-slate-400" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
                            </div>
                        </div>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3.5 text-slate-400" size={18}/>
                            <input placeholder="Location / Region" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#043003] outline-none text-sm font-black text-slate-900 placeholder-slate-400" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                        </div>
                    </div>

                    <button type="submit" className="w-full py-4 bg-[#043003] text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all">
                        Generate Invite Link
                    </button>
                </form>
            </div>
        </div>
    );
};

const SuccessInviteModal = ({ invite, onClose }: { invite: RegistrationRequest, onClose: () => void }) => {
    const link = `https://portal.platformzero.io/setup/${invite.id.split('-')[1]}`;
    
    const copyLink = () => {
        navigator.clipboard.writeText(link);
        alert("Link copied to clipboard!");
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-md p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center animate-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
                    <LinkIcon size={40} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Invite Generated!</h2>
                <p className="text-gray-500 mb-8">Share this unique setup link with <span className="font-bold text-gray-900">{invite.businessName}</span>. They can now log in with <span className="font-bold text-gray-900">{invite.email}</span> to complete their profile.</p>
                
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-8 flex items-center gap-3">
                    <input readOnly value={link} className="bg-transparent flex-1 text-xs font-mono text-gray-900 font-bold outline-none" />
                    <button onClick={copyLink} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-all shadow-sm">
                        <Copy size={18}/>
                    </button>
                </div>

                <button onClick={onClose} className="w-full py-4 bg-gray-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all">
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export const LoginRequests: React.FC = () => {
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [successInvite, setSuccessInvite] = useState<RegistrationRequest | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setRequests(mockService.getRegistrationRequests());
  }, []);

  const handleApprove = (id: string) => {
    mockService.approveRegistration(id);
    setRequests(mockService.getRegistrationRequests());
    alert("User Approved! Their portal has been created.");
  };

  const handleReject = (id: string) => {
    if(confirm("Are you sure you want to reject this application?")) {
        mockService.rejectRegistration(id);
        setRequests(mockService.getRegistrationRequests());
    }
  };

  const handleManualInvite = (data: any) => {
    const invite = mockService.createManualInvite(data);
    setRequests(mockService.getRegistrationRequests());
    setIsInviteModalOpen(false);
    setSuccessInvite(invite);
  };

  const handleCreateQuote = (req: RegistrationRequest) => {
      navigate('/pricing-requests', { 
          state: { 
              customerName: req.businessName,
              customerLocation: req.consumerData?.location,
              invoiceFile: req.consumerData?.invoiceFile,
              weeklySpend: req.consumerData?.weeklySpend,
              orderFreq: req.consumerData?.orderFrequency
          } 
      });
  };

  const pendingRequests = requests.filter(r => r.status === 'Pending');
  const historyRequests = requests.filter(r => r.status !== 'Pending');

  const getRoleBadge = (role: string) => {
      switch(role) {
          case 'CONSUMER':
              return (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold uppercase flex items-center gap-1">
                      <ShoppingBag size={12} /> Buyer / Consumer
                  </span>
              );
          case 'WHOLESALER':
              return <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-bold uppercase">Wholesaler</span>;
          case 'FARMER':
              return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-bold uppercase">Farmer</span>;
          default:
              return <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-bold uppercase">{role}</span>;
      }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Login Requests & Leads</h1>
            <p className="text-gray-500 font-medium mt-1">Review and approve new Business applications and inbound Consumer leads.</p>
        </div>
        <button 
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#043003] text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-black transition-all hover:scale-105 active:scale-95"
        >
            <UserPlus size={18}/> Manual Invite
        </button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="bg-white p-2.5 rounded-xl text-orange-500 shadow-sm border border-orange-100">
                    <Clock size={20}/>
                </div>
                <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Pending Applications</h2>
            </div>
            <span className="bg-orange-100 text-orange-800 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                {pendingRequests.length} Pending
            </span>
        </div>
        
        {pendingRequests.length === 0 ? (
            <div className="p-24 text-center">
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check size={40} className="text-gray-200"/>
                </div>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No pending requests at the moment.</p>
            </div>
        ) : (
            <div className="divide-y divide-gray-100">
                {pendingRequests.map(req => (
                    <div key={req.id} className="p-8 hover:bg-gray-50 transition-colors group">
                        <div className="flex flex-col lg:flex-row justify-between gap-8">
                            <div className="space-y-4 flex-1">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">{req.businessName}</h3>
                                    {getRoleBadge(req.requestedRole)}
                                    {req.details === 'Admin Invitation' && <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-widest">Invited</span>}
                                </div>
                                <div className="text-sm text-gray-600 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Primary Contact</p>
                                        <p className="font-bold text-gray-900">{req.name}</p>
                                        <p className="text-gray-500">{req.email}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Submission Data</p>
                                        <p className="font-bold text-gray-900">{new Date(req.submittedDate).toLocaleDateString()}</p>
                                        <p className="text-gray-500">PST: {new Date(req.submittedDate).toLocaleTimeString()}</p>
                                    </div>
                                    {req.consumerData && (
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Engagement</p>
                                            <p className="font-bold text-emerald-600">${req.consumerData.weeklySpend}/week</p>
                                            <p className="text-gray-500">{req.consumerData.location}</p>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex flex-wrap gap-3 pt-2">
                                    {req.consumerData?.invoiceFile && (
                                        <button 
                                            onClick={() => {
                                                const win = window.open();
                                                if (win) {
                                                    const src = req.consumerData!.invoiceFile!.startsWith('data:') 
                                                        ? req.consumerData!.invoiceFile 
                                                        : `data:application/pdf;base64,${req.consumerData!.invoiceFile}`; 
                                                    win.document.write(`<body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#f0f0f0;"><iframe src="${src}" width="100%" height="100%" style="border:none;background:white;"></iframe></body>`);
                                                }
                                            }}
                                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl text-xs border border-indigo-100 flex gap-2 items-center font-black uppercase tracking-widest transition-all"
                                        >
                                            <FileText size={14} /> Review Invoice
                                        </button>
                                    )}

                                    {req.requestedRole === 'CONSUMER' && (
                                        <button 
                                            onClick={() => handleCreateQuote(req)}
                                            className="bg-purple-50 hover:bg-purple-100 text-purple-700 px-4 py-2 rounded-xl text-xs border border-purple-100 flex gap-2 items-center font-black uppercase tracking-widest transition-all"
                                        >
                                            <Calculator size={14} /> Quote Matcher
                                        </button>
                                    )}
                                    
                                    {req.details === 'Admin Invitation' && (
                                        <button 
                                            onClick={() => setSuccessInvite(req)}
                                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-xs border border-emerald-100 flex gap-2 items-center font-black uppercase tracking-widest transition-all"
                                        >
                                            <LinkIcon size={14} /> Copy Invite Link
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3 self-start lg:self-center bg-white p-2 rounded-2xl border border-gray-100 shadow-inner-sm">
                                <button 
                                    onClick={() => handleApprove(req.id)}
                                    className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 shadow-md flex items-center gap-2 transition-all hover:scale-105"
                                >
                                    <UserCheck size={18}/> Approve
                                </button>
                                <button 
                                    onClick={() => handleReject(req.id)}
                                    className="px-4 py-3 bg-white text-red-500 border-2 border-red-100 rounded-xl hover:bg-red-50 transition-all"
                                >
                                    <UserX size={20}/>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-200 overflow-hidden opacity-80">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h2 className="font-black text-gray-400 uppercase tracking-widest text-xs">Application History</h2>
        </div>
        <div className="divide-y divide-gray-100">
            {historyRequests.map(req => (
                 <div key={req.id} className="p-6 flex justify-between items-center text-sm">
                    <div>
                        <span className="font-black text-gray-900">{req.businessName}</span> <span className="text-gray-400 mx-2">•</span> <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{req.requestedRole}</span>
                    </div>
                    <div className="flex items-center gap-6">
                        {req.status === 'Approved' ? (
                            <span className="flex items-center gap-1.5 text-emerald-600 font-black uppercase text-[10px] tracking-[0.2em] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100"><CheckCircle size={14}/> Approved</span>
                        ) : (
                            <span className="flex items-center gap-1.5 text-red-500 font-black uppercase text-[10px] tracking-[0.2em] bg-red-50 px-3 py-1 rounded-full border border-red-100"><X size={14}/> Rejected</span>
                        )}
                        <span className="text-gray-300 font-bold tabular-nums">{new Date(req.submittedDate).toLocaleDateString()}</span>
                    </div>
                 </div>
            ))}
            {historyRequests.length === 0 && <div className="p-12 text-center text-xs font-black text-gray-300 uppercase tracking-[0.3em]">No history yet.</div>}
        </div>
      </div>

      <ManualInviteModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)} 
        onInvite={handleManualInvite} 
      />

      {successInvite && (
        <SuccessInviteModal 
            invite={successInvite} 
            onClose={() => setSuccessInvite(null)} 
        />
      )}
    </div>
  );
};
