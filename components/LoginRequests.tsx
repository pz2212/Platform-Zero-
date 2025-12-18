
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegistrationRequest } from '../types';
import { mockService } from '../services/mockDataService';
import { Check, X, Clock, UserCheck, UserX, Info, ShoppingBag, FileText, Calculator } from 'lucide-react';

export const LoginRequests: React.FC = () => {
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Login Requests & Leads</h1>
        <p className="text-gray-500">Review and approve new Business applications and inbound Consumer leads.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <Clock size={20} className="text-orange-500"/> Pending Applications
            </h2>
            <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded-full">
                {pendingRequests.length} Pending
            </span>
        </div>
        
        {pendingRequests.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
                No pending requests at the moment.
            </div>
        ) : (
            <div className="divide-y divide-gray-100">
                {pendingRequests.map(req => (
                    <div key={req.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-bold text-gray-900">{req.businessName}</h3>
                                    {getRoleBadge(req.requestedRole)}
                                </div>
                                <div className="text-sm text-gray-600 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                                    <p><span className="font-medium">Contact:</span> {req.name}</p>
                                    <p><span className="font-medium">Email:</span> {req.email}</p>
                                    <p><span className="font-medium">Submitted:</span> {new Date(req.submittedDate).toLocaleDateString()}</p>
                                    {req.consumerData && (
                                        <>
                                            <p><span className="font-medium">Mobile:</span> {req.consumerData.mobile}</p>
                                            <p><span className="font-medium">Location:</span> {req.consumerData.location}</p>
                                        </>
                                    )}
                                </div>
                                
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {req.details && (
                                        <div className="bg-blue-50 p-2 px-3 rounded-lg text-sm text-blue-800 border border-blue-100 flex gap-2 items-center">
                                            <Info size={16} className="shrink-0"/>
                                            <p>{req.details}</p>
                                        </div>
                                    )}
                                    
                                    {/* Invoice Viewer Button */}
                                    {req.consumerData?.invoiceFile && (
                                        <button 
                                            onClick={() => {
                                                const win = window.open();
                                                if (win) {
                                                    const content = req.consumerData!.invoiceFile!.startsWith('data:') 
                                                        ? `<iframe src="${req.consumerData!.invoiceFile}" width="100%" height="100%" style="border:none;"></iframe>`
                                                        : `<img src="data:image/png;base64,${req.consumerData!.invoiceFile}" style="max-width:100%;"/>`; // Fallback assumption if prefix missing
                                                    
                                                    // Handle pure text for mock demo gracefully
                                                    const src = req.consumerData!.invoiceFile!.startsWith('data:') 
                                                        ? req.consumerData!.invoiceFile 
                                                        : `data:application/pdf;base64,${req.consumerData!.invoiceFile}`; 

                                                    win.document.write(`<body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#f0f0f0;"><iframe src="${src}" width="100%" height="100%" style="border:none;background:white;"></iframe></body>`);
                                                }
                                            }}
                                            className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 p-2 px-4 rounded-lg text-sm border border-indigo-200 flex gap-2 items-center font-bold transition-colors shadow-sm"
                                        >
                                            <FileText size={16} /> View Uploaded Invoice
                                        </button>
                                    )}

                                    {/* Create Quote Button */}
                                    {req.requestedRole === 'CONSUMER' && (
                                        <button 
                                            onClick={() => handleCreateQuote(req)}
                                            className="bg-purple-100 hover:bg-purple-200 text-purple-800 p-2 px-4 rounded-lg text-sm border border-purple-200 flex gap-2 items-center font-bold transition-colors shadow-sm"
                                        >
                                            <Calculator size={16} /> Create Quote
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3 self-start md:self-center">
                                <button 
                                    onClick={() => handleApprove(req.id)}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium flex items-center gap-2 shadow-sm"
                                >
                                    <UserCheck size={18}/> Approve
                                </button>
                                <button 
                                    onClick={() => handleReject(req.id)}
                                    className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 font-medium flex items-center gap-2"
                                >
                                    <UserX size={18}/> Reject
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden opacity-80">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
            <h2 className="font-bold text-gray-800">History</h2>
        </div>
        <div className="divide-y divide-gray-100">
            {historyRequests.map(req => (
                 <div key={req.id} className="p-4 flex justify-between items-center text-sm text-gray-500">
                    <div>
                        <span className="font-medium text-gray-900">{req.businessName}</span> ({req.name}) - <span className="text-xs uppercase">{req.requestedRole}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {req.status === 'Approved' ? (
                            <span className="flex items-center gap-1 text-emerald-600 font-medium"><Check size={14}/> Approved</span>
                        ) : (
                            <span className="flex items-center gap-1 text-red-600 font-medium"><X size={14}/> Rejected</span>
                        )}
                        <span className="text-gray-400 text-xs">{new Date(req.submittedDate).toLocaleDateString()}</span>
                    </div>
                 </div>
            ))}
            {historyRequests.length === 0 && <div className="p-6 text-center text-sm text-gray-400">No history yet.</div>}
        </div>
      </div>
    </div>
  );
};
