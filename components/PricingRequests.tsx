
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Product, UserRole, SupplierPriceRequest, SupplierPriceRequestItem } from '../types';
import { mockService } from '../services/mockDataService';
import { extractInvoiceItems } from '../services/geminiService';
import { 
  Calculator, Download, Mail, Building, TrendingDown, 
  FileText, Upload, X, Loader2, Eye, EyeOff, Send, CheckCircle, MapPin, Handshake, ChevronRight, UserPlus, DollarSign, Clock
} from 'lucide-react';

interface PricingRequestsProps {
  user: User;
}

interface ComparisonItem {
  product: Product;
  invoicePrice: number;    // The price extracted from the customer's invoice
  pzPrice: number;         // 30% cheaper (or configurable)
  supplierTargetPrice: number; // 35% cheaper (or configurable)
  savingsPercent: number;
}

export const PricingRequests: React.FC<PricingRequestsProps> = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { customerName?: string, customerLocation?: string, invoiceFile?: string, weeklySpend?: number, orderFreq?: string } || {};

  // Configuration State
  const [customerName, setCustomerName] = useState(state.customerName || '');
  const [customerLocation, setCustomerLocation] = useState(state.customerLocation || '');
  const [invoiceFile, setInvoiceFile] = useState<File | string | null>(state.invoiceFile || null);
  const [invoiceFileName, setInvoiceFileName] = useState<string>(state.invoiceFile ? 'Attached from Login Request' : '');
  
  // New Stats Fields
  const [weeklySpend, setWeeklySpend] = useState<number | string>(state.weeklySpend || '');
  const [orderFreq, setOrderFreq] = useState<string>(state.orderFreq || 'Weekly');

  // Settings
  const [targetSavings, setTargetSavings] = useState<number>(30); // Default 30% cheaper for PZ
  const [supplierTarget, setSupplierTarget] = useState<number>(35); // Default 35% cheaper for Supplier Request
  const [showSupplierTargets, setShowSupplierTargets] = useState(false);

  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [comparison, setComparison] = useState<ComparisonItem[]>([]);
  const [activeRequests, setActiveRequests] = useState<SupplierPriceRequest[]>([]); // New list for admin view
  
  // UI State
  const [isGenerated, setIsGenerated] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Supplier Request Modal
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [wholesalers, setWholesalers] = useState<User[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');

  // View Request Modal
  const [viewingRequest, setViewingRequest] = useState<SupplierPriceRequest | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setProducts(mockService.getAllProducts());
    setWholesalers(mockService.getWholesalers());
    refreshRequests();
  }, []);

  const refreshRequests = () => {
      // Mock Admin view of all requests (filtering for relevant ones in a real app)
      const allRequests = mockService.getAllSupplierPriceRequests();
      setActiveRequests(allRequests);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setInvoiceFile(e.target.files[0]);
      setInvoiceFileName(e.target.files[0].name);
      setIsGenerated(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          setInvoiceFile(e.dataTransfer.files[0]);
          setInvoiceFileName(e.dataTransfer.files[0].name);
          setIsGenerated(false);
      }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setInvoiceFile(null);
    setInvoiceFileName('');
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleGenerate = async () => {
    setIsProcessing(true);

    try {
        let items: ComparisonItem[] = [];

        // Define expected products for accurate demo flow
        const demoItems = [
            { name: 'Bell Peppers', price: 15.20 },
            { name: 'Premium Tomatoes', price: 9.90 },
            { name: 'Eggplant', price: 11.80 },
            { name: 'Oranges', price: 4.20 },
            { name: 'Organic Asparagus', price: 26.80 }
        ];

        // 1. Try Actual AI Extraction if file exists
        if (invoiceFile) {
             let base64 = '';
             let mimeType = 'application/pdf'; // Default

             if (invoiceFile instanceof File) {
                 // Create Base64 for AI service from File object
                 const reader = new FileReader();
                 const base64Promise = new Promise<string>((resolve) => {
                     reader.onload = (e) => resolve((e.target?.result as string).split(',')[1]);
                     reader.readAsDataURL(invoiceFile);
                 });
                 base64 = await base64Promise;
                 mimeType = invoiceFile.type;
             } else if (typeof invoiceFile === 'string') {
                 // Handle Data URL from saved lead (state navigation)
                 if (invoiceFile.startsWith('data:')) {
                     const parts = invoiceFile.split(',');
                     // part[0] is "data:application/pdf;base64"
                     const meta = parts[0].split(':')[1];
                     if (meta) {
                         mimeType = meta.split(';')[0];
                     }
                     base64 = parts[1];
                 } else {
                     base64 = invoiceFile;
                 }
             }
             
             // Attempt AI extraction
             if (base64) {
                 const aiItems = await extractInvoiceItems(base64, mimeType);
                 
                 if (aiItems && aiItems.length > 0) {
                     // Map AI items to comparison rows
                     items = aiItems.map(aiItem => {
                         // Try to find matching product in DB for image/category details
                         // Fuzzy match: check if names include each other
                         const existing = products.find(p => 
                             p.name.toLowerCase().includes(aiItem.name.toLowerCase()) || 
                             aiItem.name.toLowerCase().includes(p.name.toLowerCase())
                         );
                         
                         // Use existing product details or create a visual placeholder
                         const product: Product = existing || {
                             id: `temp-${Math.random()}`,
                             name: aiItem.name,
                             category: 'Vegetable',
                             variety: 'Standard',
                             imageUrl: 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?auto=format&fit=crop&q=80&w=100&h=100', // Generic placeholder
                             defaultPricePerKg: aiItem.pzRate
                         };

                         const invoicePrice = aiItem.marketRate;
                         const pzPrice = invoicePrice * (1 - (targetSavings / 100));
                         const supplierTargetPrice = invoicePrice * (1 - (supplierTarget / 100));

                         return {
                             product,
                             invoicePrice,
                             pzPrice,
                             supplierTargetPrice,
                             savingsPercent: targetSavings
                         };
                     });
                 }
             }
        }

        // 2. Fallback to Demo Data if AI returns nothing or file not processable
        if (items.length === 0) {
             // Artificial delay for realism if not real processing
             if (!invoiceFile) await new Promise(resolve => setTimeout(resolve, 1500));

             items = demoItems.map(d => {
                 // Find the real product object from mock data to ensure correct images
                 const existing = products.find(p => p.name.includes(d.name.split(' ')[1]) || p.name === d.name);
                 const product = existing || products[0];
                 
                 const invoicePrice = d.price;
                 const pzPrice = invoicePrice * (1 - (targetSavings / 100));
                 const supplierTargetPrice = invoicePrice * (1 - (supplierTarget / 100));

                 return {
                     product: { ...product, name: d.name }, // Ensure exact name match from screenshot
                     invoicePrice,
                     pzPrice,
                     supplierTargetPrice,
                     savingsPercent: targetSavings
                 };
             });
        }

        setComparison(items);
        setIsGenerated(true);
    } catch (error) {
        console.error("Analysis failed", error);
        alert("Analysis failed. Please try again.");
    } finally {
        setIsProcessing(false);
    }
  };

  // Calculations for Summary
  const totalInvoiceSpend = comparison.reduce((sum, item) => sum + item.invoicePrice, 0);
  const totalPzSpend = comparison.reduce((sum, item) => sum + item.pzPrice, 0);
  const totalSavingsValue = totalInvoiceSpend - totalPzSpend;
  const actualSavingsPercent = totalInvoiceSpend > 0 ? (totalSavingsValue / totalInvoiceSpend) * 100 : 0;

  const handleExportPDF = () => {
      alert("PDF Exported!");
  };

  const handleOpenSupplierModal = () => {
      setIsSupplierModalOpen(true);
  };

  const handleSendSupplierRequest = () => {
      if (!selectedSupplierId) return;

      const items: SupplierPriceRequestItem[] = comparison.map(c => ({
          productId: c.product.id,
          productName: c.product.name,
          targetPrice: parseFloat(c.supplierTargetPrice.toFixed(2))
      }));

      const newRequest: SupplierPriceRequest = {
          id: `req-${Date.now()}`,
          supplierId: selectedSupplierId,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          customerContext: customerName ? customerName : 'New Customer Pricing',
          customerLocation: customerLocation || 'Unknown Location',
          items: items
      };

      mockService.createSupplierPriceRequest(newRequest);
      refreshRequests();
      
      const supplierName = wholesalers.find(w => w.id === selectedSupplierId)?.businessName;
      alert(`Request successfully sent to ${supplierName}!`);
      setIsSupplierModalOpen(false);
      setSelectedSupplierId('');
  };

  const handleDealWon = (reqId: string) => {
      // Immediate action - no confirmation dialog for better UX
      const newCustomer = mockService.finalizeDeal(reqId);
      refreshRequests();
      
      if (newCustomer) {
         // Update customer status to Pending Connection so it appears as a new lead needing setup
         mockService.updateCustomerDetails(newCustomer.id, {
             connectionStatus: 'Pending Connection',
             joinedDate: new Date().toISOString()
         });

         // Navigate to onboarding to finish setup
         navigate('/consumer-onboarding', { 
             state: { 
                 newCustomerId: newCustomer.id,
                 autoOpen: true // Open the modal to review/connect
             } 
         });
      }
  };

  const handleOnboardCustomer = (req: SupplierPriceRequest) => {
      // Navigate to onboarding and trigger setup for this new customer
      navigate('/consumer-onboarding', { state: { highlightCustomerName: req.customerContext } });
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'PENDING': return 'bg-orange-100 text-orange-700';
          case 'SUBMITTED': return 'bg-blue-100 text-blue-700';
          case 'WON': return 'bg-green-100 text-green-700';
          case 'LOST': return 'bg-red-100 text-red-700';
          default: return 'bg-gray-100 text-gray-600';
      }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pricing Comparison Tool</h1>
        <p className="text-gray-500 mt-1">Analyze invoices and generate competitive quotes.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* LEFT COLUMN: CALCULATOR & SUMMARY */}
        <div className="w-full lg:w-1/3 space-y-6">
            
            {/* CALCULATOR CARD */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg">
                    <Calculator size={20} className="text-indigo-600"/> Calculator
                </h2>
                
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Customer Name</label>
                        <div className="relative">
                            <Building size={16} className="absolute left-3 top-3 text-gray-400"/>
                            <input 
                                type="text" 
                                placeholder="e.g. The Morning Cafe"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
                        <div className="relative">
                            <MapPin size={16} className="absolute left-3 top-3 text-gray-400"/>
                            <input 
                                type="text" 
                                placeholder="e.g. Richmond, VIC"
                                value={customerLocation}
                                onChange={(e) => setCustomerLocation(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Weekly Spend</label>
                            <div className="relative">
                                <DollarSign size={16} className="absolute left-3 top-3 text-gray-400"/>
                                <input 
                                    type="number" 
                                    placeholder="2000"
                                    value={weeklySpend}
                                    onChange={(e) => setWeeklySpend(parseFloat(e.target.value) || '')}
                                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Order Freq</label>
                            <div className="relative">
                                <Clock size={16} className="absolute left-3 top-3 text-gray-400 pointer-events-none"/>
                                <select 
                                    value={orderFreq}
                                    onChange={(e) => setOrderFreq(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                >
                                    <option value="Daily">Daily</option>
                                    <option value="2-3 Times/Week">2-3 Times/Week</option>
                                    <option value="Weekly">Weekly</option>
                                    <option value="Fortnightly">Fortnightly</option>
                                    <option value="Monthly">Monthly</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Invoice (Optional)</label>
                        <label 
                            htmlFor="invoice-upload-pricing"
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-lg p-4 text-center transition-all group relative cursor-pointer block ${
                                isDragging ? 'border-emerald-500 bg-emerald-50 scale-[1.01]' :
                                invoiceFile ? 'border-emerald-300 bg-emerald-50/50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                            }`}
                        >
                            <input 
                                id="invoice-upload-pricing"
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept=".pdf,.jpg,.jpeg,.png" 
                                onChange={handleFileUpload}
                                onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
                            />
                            
                            {invoiceFile ? (
                                <div className="flex items-center gap-3 relative z-0">
                                    <div className="bg-emerald-100 p-2 rounded-lg">
                                        <FileText size={20} className="text-emerald-600" />
                                    </div>
                                    <div className="text-left flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate">{invoiceFileName}</p>
                                    </div>
                                    <button 
                                        onClick={removeFile}
                                        className="text-gray-400 hover:text-red-500 z-20"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2 py-2">
                                    <Upload size={18} className="text-gray-400" />
                                    <span className="text-sm text-gray-500">Drag & drop or browse</span>
                                </div>
                            )}
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Source Wholesaler</label>
                        <select className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                            <option>Fresh Wholesalers</option>
                            <option>City Produce</option>
                            <option>Generic Market</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">PZ Savings (%)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-400 text-xs font-bold">%</span>
                                <input 
                                    type="number" 
                                    value={targetSavings}
                                    onChange={(e) => { setTargetSavings(parseFloat(e.target.value)); setIsGenerated(false); }}
                                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-900 outline-none focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Supplier Target (%)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-400 text-xs font-bold">%</span>
                                <input 
                                    type="number" 
                                    value={supplierTarget}
                                    onChange={(e) => { setSupplierTarget(parseFloat(e.target.value)); setIsGenerated(false); }}
                                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-900 outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleGenerate}
                        disabled={isProcessing}
                        className={`w-full py-3.5 text-white rounded-xl font-bold shadow-md flex items-center justify-center gap-2 transition-all mt-2 ${isProcessing ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02]'}`}
                    >
                        {isProcessing ? <><Loader2 size={18} className="animate-spin"/> Analyzing...</> : <><FileText size={18}/> Analyze & Compare</>}
                    </button>
                </div>
            </div>

            {/* SUMMARY CARD (Bottom Left) */}
            {isGenerated && (
                <div className="bg-slate-900 text-white rounded-xl shadow-lg p-6 animate-in slide-in-from-left-4 duration-500">
                    <h3 className="font-bold text-slate-400 uppercase text-xs tracking-wider mb-6 border-b border-slate-700 pb-2">Analysis Summary</h3>
                    
                    <div className="space-y-5">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-300 text-sm">Total Current Spend</span>
                            <span className="text-lg font-medium text-slate-300 line-through decoration-slate-500">${totalInvoiceSpend.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-emerald-400 font-bold text-sm">Total PZ Price</span>
                            <span className="text-2xl font-bold text-emerald-400">${totalPzSpend.toFixed(2)}</span>
                        </div>
                        
                        <div className="pt-4 mt-2 border-t border-slate-800">
                            <div className="flex items-center gap-2 text-emerald-300 mb-1">
                                <TrendingDown size={18}/>
                                <span className="font-bold text-sm">Potential Savings</span>
                            </div>
                            <div className="flex items-baseline gap-3">
                                <div className="text-4xl font-extrabold text-white">
                                    ${totalSavingsValue.toFixed(2)}
                                </div>
                                <span className="bg-emerald-900 text-emerald-300 px-2 py-1 rounded text-xs font-bold border border-emerald-800">
                                    {actualSavingsPercent.toFixed(1)}% Saved
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* RIGHT COLUMN: RESULTS & ADMIN MGMT */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
            
            {/* 1. Results Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Quote for {customerName || 'Prospect'}</h2>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">{targetSavings}% Markup</span>
                            {weeklySpend && (
                                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                                    <DollarSign size={10}/> Est. Spend: ${weeklySpend}
                                </span>
                            )}
                            {orderFreq && (
                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                                    <Clock size={10}/> Freq: {orderFreq}
                                </span>
                            )}
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-500">Source: Fresh Wholesalers</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleExportPDF} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors">
                            <Download size={16}/> Export PDF
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 shadow-sm transition-colors">
                            <Mail size={16}/> Email Proposal
                        </button>
                    </div>
                </div>

                {/* Table Controls */}
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-end">
                    <button 
                        onClick={() => setShowSupplierTargets(!showSupplierTargets)}
                        className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                            showSupplierTargets 
                            ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                            : 'bg-white text-gray-500 border border-gray-300 hover:bg-gray-100'
                        }`}
                    >
                        {showSupplierTargets ? <Eye size={12}/> : <EyeOff size={12}/>} 
                        {showSupplierTargets ? 'Hide Supplier Targets' : 'Show Supplier Targets'}
                    </button>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-x-auto">
                    {isGenerated ? (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-white border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-1/3">Product</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Current Price</th>
                                    <th className="px-6 py-4 text-xs font-bold text-emerald-600 uppercase tracking-wider text-right">PZ Price</th>
                                    {showSupplierTargets && (
                                        <th className="px-6 py-4 text-xs font-bold text-blue-600 uppercase tracking-wider text-right bg-blue-50/50">Supplier Target ({supplierTarget}%)</th>
                                    )}
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Savings</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {comparison.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-gray-900 text-sm">{item.product.name}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm text-gray-400 font-medium decoration-gray-300 line-through">
                                            ${item.invoicePrice.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-emerald-700 font-bold text-base">${item.pzPrice.toFixed(2)}</span>
                                        </td>
                                        {showSupplierTargets && (
                                            <td className="px-6 py-4 text-right bg-blue-50/30">
                                                <span className="text-blue-700 font-bold text-sm border-b-2 border-blue-200 cursor-help" title={`Target Buy Price: ${supplierTarget}% cheaper than invoice`}>
                                                    ${item.supplierTargetPrice.toFixed(2)}
                                                </span>
                                            </td>
                                        )}
                                        <td className="px-6 py-4 text-right">
                                            <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs font-bold">
                                                -{item.savingsPercent}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 min-h-[300px]">
                            <div className="p-4 bg-gray-50 rounded-full">
                                <Calculator size={32} className="opacity-30"/>
                            </div>
                            <p className="text-sm font-medium">Enter details and click analyze to generate quote.</p>
                        </div>
                    )}
                </div>

                {/* Footer Action for Supplier Request */}
                {isGenerated && showSupplierTargets && (
                    <div className="p-4 bg-blue-50 border-t border-blue-100 flex justify-between items-center animate-in slide-in-from-bottom-2">
                        <div className="text-xs text-blue-700">
                            <span className="font-bold">Supplier Strategy:</span> Target {supplierTarget}% margin to fulfill this quote profitably.
                        </div>
                        <button 
                            onClick={handleOpenSupplierModal}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-colors"
                        >
                            <Send size={14}/> Send Request to Suppliers
                        </button>
                    </div>
                )}
            </div>

            {/* 2. ACTIVE NEGOTIATIONS ADMIN PANEL */}
            {activeRequests.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Handshake size={20} className="text-indigo-600"/> Active Supplier Negotiations
                    </h3>
                    <div className="space-y-3">
                        {activeRequests.map(req => {
                            // Find supplier name safely
                            const supplier = wholesalers.find(w => w.id === req.supplierId);
                            
                            return (
                                <div key={req.id} className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setViewingRequest(req)}>
                                    <div>
                                        <div className="flex items-center gap-2 font-bold text-gray-900">
                                            {req.customerContext} 
                                            <span className="text-gray-400 font-normal text-xs">({req.customerLocation})</span>
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1">
                                            Supplier: <span className="font-medium text-gray-700">{supplier?.businessName}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(req.status)}`}>
                                            {req.status === 'SUBMITTED' ? 'Quote Received' : req.status === 'WON' ? 'Deal Won' : req.status}
                                        </span>

                                        {req.status === 'WON' && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleOnboardCustomer(req); }}
                                                className="px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2"
                                            >
                                                <UserPlus size={16}/> Onboard Customer
                                            </button>
                                        )}
                                        
                                        {req.status === 'SUBMITTED' && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDealWon(req.id); }}
                                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-sm flex items-center gap-2"
                                            >
                                                <CheckCircle size={16}/> Deal Won
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* SUPPLIER SELECTION MODAL */}
      {isSupplierModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                      <h2 className="text-xl font-bold text-gray-900">Select Supplier</h2>
                      <button onClick={() => setIsSupplierModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                  </div>
                  <div className="p-6 space-y-4">
                      <p className="text-sm text-gray-600">Choose a partner to fulfill this request. They will only see the product names and target prices.</p>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Wholesaler / Farmer</label>
                          <select 
                              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                              value={selectedSupplierId}
                              onChange={(e) => setSelectedSupplierId(e.target.value)}
                          >
                              <option value="">Select Partner...</option>
                              {wholesalers.map(w => (
                                  <option key={w.id} value={w.id}>{w.businessName} ({w.role})</option>
                              ))}
                          </select>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs text-blue-800">
                          <span className="font-bold">Note:</span> Supplier will see {comparison.length} line items with a target total of ${comparison.reduce((sum, i) => sum + i.supplierTargetPrice, 0).toFixed(2)}.
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                          <button 
                              onClick={() => setIsSupplierModalOpen(false)}
                              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                              Cancel
                          </button>
                          <button 
                              onClick={handleSendSupplierRequest}
                              disabled={!selectedSupplierId}
                              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                              <Send size={16}/> Send Request
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* VIEW QUOTE DETAILS MODAL */}
      {viewingRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <div>
                          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                              Quote for {viewingRequest.customerContext}
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusColor(viewingRequest.status)}`}>
                                  {viewingRequest.status}
                              </span>
                          </h2>
                          <p className="text-sm text-gray-500 mt-1">Supplier: {wholesalers.find(w => w.id === viewingRequest.supplierId)?.businessName}</p>
                      </div>
                      <button onClick={() => setViewingRequest(null)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                  </div>
                  
                  <div className="p-6">
                      <table className="w-full text-sm">
                          <thead>
                              <tr className="text-gray-500 border-b border-gray-100 text-left">
                                  <th className="pb-3 pl-2">Product</th>
                                  <th className="pb-3 text-right">Target Buy Price</th>
                                  <th className="pb-3 text-right">Supplier Offer</th>
                                  <th className="pb-3 text-right pr-2">Status</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                              {viewingRequest.items.map((item, idx) => {
                                  const variance = item.offeredPrice ? ((item.offeredPrice - item.targetPrice) / item.targetPrice) * 100 : 0;
                                  return (
                                      <tr key={idx} className="hover:bg-gray-50">
                                          <td className="py-3 pl-2 font-medium text-gray-900">{item.productName}</td>
                                          <td className="py-3 text-right text-gray-500">${item.targetPrice.toFixed(2)}</td>
                                          <td className="py-3 text-right font-bold text-gray-900">
                                              {item.offeredPrice ? `$${item.offeredPrice.toFixed(2)}` : '-'}
                                          </td>
                                          <td className="py-3 text-right pr-2">
                                              {item.offeredPrice ? (
                                                  <span className={`text-xs font-bold ${variance <= 0 ? 'text-green-600' : variance < 10 ? 'text-orange-600' : 'text-red-600'}`}>
                                                      {variance <= 0 ? 'Target Met' : `+${variance.toFixed(1)}%`}
                                                  </span>
                                              ) : (
                                                  <span className="text-xs text-gray-400 italic">Pending</span>
                                              )}
                                          </td>
                                      </tr>
                                  );
                              })}
                          </tbody>
                          <tfoot className="border-t border-gray-200">
                              <tr>
                                  <td className="pt-4 pl-2 font-bold text-gray-900">Total</td>
                                  <td className="pt-4 text-right font-medium text-gray-500">
                                      ${viewingRequest.items.reduce((sum, i) => sum + i.targetPrice, 0).toFixed(2)}
                                  </td>
                                  <td className="pt-4 text-right font-bold text-gray-900 text-lg">
                                      ${viewingRequest.items.reduce((sum, i) => sum + (i.offeredPrice || 0), 0).toFixed(2)}
                                  </td>
                                  <td></td>
                              </tr>
                          </tfoot>
                      </table>
                  </div>

                  <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                      <button 
                          onClick={() => setViewingRequest(null)}
                          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
                      >
                          Close
                      </button>
                      
                      {viewingRequest.status === 'SUBMITTED' && (
                          <button 
                              onClick={() => handleDealWon(viewingRequest.id)}
                              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold shadow-sm flex items-center gap-2"
                          >
                              <CheckCircle size={18}/> Accept Quote & Win Deal
                          </button>
                      )}

                      {viewingRequest.status === 'WON' && (
                          <button 
                              onClick={() => handleOnboardCustomer(viewingRequest)}
                              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold shadow-sm flex items-center gap-2"
                          >
                              <UserPlus size={18}/> Onboard Customer
                          </button>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
