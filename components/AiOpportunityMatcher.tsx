
import React, { useState, useRef } from 'react';
import { Camera, Upload, ScanLine, CheckCircle, Send, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';
import { mockService } from '../services/mockDataService';
import { identifyProductFromImage } from '../services/geminiService';
import { Customer } from '../types';
import { ChatDialog } from './ChatDialog';

export const AiOpportunityMatcher: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{name: string, quality: string} | null>(null);
  const [matchedBuyers, setMatchedBuyers] = useState<Customer[]>([]);
  const [price, setPrice] = useState<number>(0);
  
  const [isSending, setIsSending] = useState(false);
  const [offersSent, setOffersSent] = useState(false);
  
  // Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [activeBuyerName, setActiveBuyerName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImage(base64String);
        analyzeImage(base64String.split(',')[1]); // Send only base64 data, remove prefix
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (base64Data: string) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setMatchedBuyers([]);
    setOffersSent(false);

    try {
        // AI Service Call
        const result = await identifyProductFromImage(base64Data);
        setAnalysisResult({ name: result.name, quality: result.quality });
        
        // Find Buyers from Mock Data
        const buyers = mockService.findBuyersForProduct(result.name);
        setMatchedBuyers(buyers);
        
    } catch (error) {
        console.error("Analysis failed", error);
        alert("Could not analyze image. Please try again.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleSendOffers = () => {
    setIsSending(true);
    setTimeout(() => {
        setIsSending(false);
        setOffersSent(true);
        // Reset after 3 seconds so they can do it again if needed
        setTimeout(() => setOffersSent(false), 5000);
    }, 1500);
  };

  const openChat = (buyer: Customer) => {
      setActiveBuyerName(buyer.businessName);
      setChatOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ScanLine className="text-indigo-600"/> AI Opportunity Matcher
        </h1>
        <p className="text-gray-500">Snap a photo of your produce, set a price, and instantly notify active buyers looking for this product.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: UPLOAD & PREVIEW */}
        <div className="space-y-6">
            <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl h-80 flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden ${image ? 'border-indigo-200 bg-gray-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/30'}`}
            >
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange}
                />
                
                {image ? (
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                    <div className="text-center p-6">
                        <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                            <Camera size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Upload Product Photo</h3>
                        <p className="text-sm text-gray-500 mt-2">Click or drag and drop to identify</p>
                    </div>
                )}
                
                {isAnalyzing && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center flex-col z-10">
                         <Loader2 size={40} className="text-indigo-600 animate-spin mb-4"/>
                         <p className="text-indigo-800 font-bold animate-pulse">Analyzing Produce...</p>
                    </div>
                )}
            </div>

            {analysisResult && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">{analysisResult.name}</h3>
                            <p className="text-sm text-gray-500">AI Confidence: High</p>
                        </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4">
                        <span className="text-xs font-bold text-gray-500 uppercase">Quality Assessment</span>
                        <p className="text-gray-900 font-medium">{analysisResult.quality}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Set Your Price ($/kg)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-400 font-bold">$</span>
                            <input 
                                type="number" 
                                className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 font-bold text-lg"
                                placeholder="0.00"
                                value={price || ''}
                                onChange={(e) => setPrice(parseFloat(e.target.value))}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* RIGHT COLUMN: MATCHED BUYERS */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[600px] overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-900">Active Buyers</h2>
                <p className="text-sm text-gray-500">
                    {matchedBuyers.length > 0 
                        ? `Found ${matchedBuyers.length} buyers looking for ${analysisResult?.name}` 
                        : "Upload a photo to find interested buyers"}
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {matchedBuyers.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center">
                        <ScanLine size={48} className="mb-4 opacity-20"/>
                        <p>No matches yet.</p>
                    </div>
                ) : (
                    matchedBuyers.map(buyer => (
                        <div key={buyer.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-gray-900">{buyer.businessName}</h3>
                                {buyer.connectionStatus === 'Active' ? (
                                    <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded font-bold">Connected</span>
                                ) : (
                                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded font-medium">Not Connected</span>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mb-3">{buyer.category} • {buyer.onboardingData?.deliveryAddress}</p>
                            
                            {buyer.connectionStatus === 'Active' ? (
                                <button 
                                    onClick={() => openChat(buyer)}
                                    className="w-full py-2 bg-white border border-indigo-200 text-indigo-700 font-bold text-sm rounded-lg hover:bg-indigo-50 flex items-center justify-center gap-2"
                                >
                                    <MessageSquare size={16}/> Chat Now
                                </button>
                            ) : (
                                <button className="w-full py-2 bg-gray-100 text-gray-400 font-medium text-sm rounded-lg cursor-not-allowed flex items-center justify-center gap-2">
                                    <AlertCircle size={16}/> Connect to Sell
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>

            {matchedBuyers.length > 0 && (
                <div className="p-6 border-t border-gray-100 bg-gray-50">
                    {offersSent ? (
                        <div className="bg-emerald-100 text-emerald-800 p-3 rounded-xl flex items-center justify-center gap-2 font-bold animate-in zoom-in duration-300">
                            <CheckCircle size={20}/> Notifications Sent!
                        </div>
                    ) : (
                        <button 
                            onClick={handleSendOffers}
                            disabled={!price || isSending}
                            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                        >
                            {isSending ? (
                                <>
                                    <Loader2 size={20} className="animate-spin"/> Sending...
                                </>
                            ) : (
                                <>
                                    <Send size={20} /> Blast Offer to All ({matchedBuyers.length})
                                </>
                            )}
                        </button>
                    )}
                </div>
            )}
        </div>
      </div>

      {/* Reused Chat Dialog for quick negotiation */}
      <ChatDialog 
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        orderId="PRE-SALE"
        issueType={`Inquiry: ${analysisResult?.name} @ $${price}/kg`}
        repName={activeBuyerName} // Reusing prop to show Buyer Name in header for demo
      />
    </div>
  );
};
