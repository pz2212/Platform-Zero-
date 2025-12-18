
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Product, UserRole, SupplierPriceRequest, SupplierPriceRequestItem, Customer } from '../types';
import { mockService } from '../services/mockDataService';
import { extractInvoiceItems } from '../services/geminiService';
import { 
  Calculator, Download, Mail, Building, TrendingDown, 
  FileText, Upload, X, Loader2, Eye, EyeOff, Send, CheckCircle, MapPin, Handshake, ChevronRight, UserPlus, DollarSign, Clock,
  Store, ChevronDown, Info, Check, MessageSquare, Rocket
} from 'lucide-react';

interface PricingRequestsProps {
  user: User;
}

interface ComparisonItem {
  product: Product;
  invoicePrice: number;    
  pzPrice: number;         
  supplierTargetPrice: number; 
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
  const [invoiceFileName, setInvoiceFileName] = useState<string>(state.invoiceFile ? 'Attached from Lead Record' : '');
  
  // Stats Fields
  const [weeklySpend, setWeeklySpend] = useState<number | string>(state.weeklySpend || '');
  const [orderFreq, setOrderFreq] = useState<string>(state.orderFreq || 'Weekly');

  // Settings
  const [targetSavings, setTargetSavings] = useState<number>(30); 
  const [supplierTarget, setSupplierTarget] = useState<number>(35); 
  const [showSupplierTargets, setShowSupplierTargets] = useState(false);

  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [comparison, setComparison] = useState<ComparisonItem[]>([]);
  
  // UI State
  const [isGenerated, setIsGenerated] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Supplier Request Modal & Custom Dropdown State
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [wholesalers, setWholesalers] = useState<User[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProducts(mockService.getAllProducts());
    setWholesalers(mockService.getWholesalers());

    if (state.invoiceFile && !isGenerated && !isProcessing) {
        handleGenerate();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsDropdownOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        const demoItems = [
            { name: 'Bell Peppers', price: 15.20 },
            { name: 'Premium Tomatoes', price: 9.90 },
            { name: 'Eggplant', price: 11.80 },
            { name: 'Oranges', price: 4.20 },
            { name: 'Organic Asparagus', price: 26.80 }
        ];

        if (invoiceFile) {
             let base64 = '';
             let mimeType = 'application/pdf'; 

             if (invoiceFile instanceof File) {
                 const reader = new FileReader();
                 const base64Promise = new Promise<string>((resolve) => {
                     reader.onload = (e) => resolve((e.target?.result as string).split(',')[1]);
                     reader.readAsDataURL(invoiceFile);
                 });
                 base64 = await base64Promise;
                 mimeType = invoiceFile.type;
             } else if (typeof invoiceFile === 'string') {
                 if (invoiceFile.startsWith('data:')) {
                     const parts = invoiceFile.split(',');
                     const meta = parts[0].split(':')[1];
                     if (meta) {
                         mimeType = meta.split(';')[0];
                     }
                     base64 = parts[1];
                 } else {
                     base64 = invoiceFile;
                 }
             }
             
             if (base64) {
                 const aiItems = await extractInvoiceItems(base64, mimeType);
                 
                 if (aiItems && aiItems.length > 0) {
                     items = aiItems.map(aiItem => {
                         const existing = products.find(p => 
                             p.name.toLowerCase().includes(aiItem.name.toLowerCase()) || 
                             aiItem.name.toLowerCase().includes(p.name.toLowerCase())
                         );
                         
                         const product: Product = existing || {
                             id: `temp-${Math.random()}`,
                             name: aiItem.name,
                             category: 'Vegetable',
                             variety: 'Standard',
                             imageUrl: 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?auto=format&fit=crop&q=80&w=100&h=100',
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

        if (items.length === 0) {
             if (!invoiceFile) await new Promise(resolve => setTimeout(resolve, 1500));

             items = demoItems.map(d => {
                 const existing = products.find(p => p.name.includes(d.name.split(' ')[1]) || p.name === d.name);
                 const product = existing || products[0];
                 
                 const invoicePrice = d.price;
                 const pzPrice = invoicePrice * (1 - (targetSavings / 100));
                 const supplierTargetPrice = invoicePrice * (1 - (supplierTarget / 100));

                 return {
                     product: { ...product, name: d.name },
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
    } finally {
        setIsProcessing(false);
    }
  };

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
      
      const supplierName = wholesalers.find(w => w.id === selectedSupplierId)?.businessName;
      alert(`Request successfully sent to ${supplierName}! Track progress in the "Price Requests" tab.`);
      
      setIsGenerated(false);
      setComparison([]);
      setCustomerName('');
      setCustomerLocation('');
      setInvoiceFile(null);
      setInvoiceFileName('');
      setIsSupplierModalOpen(false);
      setSelectedSupplierId('');
  };

  const selectedSupplier = wholesalers.find(w => w.id === selectedSupplierId);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Quote Generator</h1>
            <p className="text-gray-500 mt-1">Extract invoice items and generate competitive platform quotes.</p>
        </div>
        {isGenerated && (
             <div className="flex gap-2">
                <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 border border-emerald-200">
                    <CheckCircle size={14}/> {comparison.length} Items Analysed
                </span>
             </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* LEFT COLUMN: CALCULATOR & SUMMARY */}
        <div className="w-full lg:w-1/3 space-y-6">
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg uppercase tracking-tight">
                    <Calculator size={20} className="text-indigo-600"/> Lead Configuration
                </h2>
                
                <div className="space-y-5">
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Business / Customer</label>
                        <div className="relative">
                            <Building size={16} className="absolute left-3 top-3 text-gray-400"/>
                            <input 
                                type="text" 
                                placeholder="Business Name"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Market Location</label>
                        <div className="relative">
                            <MapPin size={16} className="absolute left-3 top-3 text-gray-400"/>
                            <input 
                                type="text" 
                                placeholder="e.g. Richmond, VIC"
                                value={customerLocation}
                                onChange={(e) => setCustomerLocation(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Weekly Spend</label>
                            <div className="relative">
                                <DollarSign size={16} className="absolute left-3 top-3 text-gray-400"/>
                                <input 
                                    type="number" 
                                    placeholder="0"
                                    value={weeklySpend}
                                    onChange={(e) => setWeeklySpend(parseFloat(e.target.value) || '')}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Order Freq</label>
                            <div className="relative">
                                <Clock size={16} className="absolute left-3 top-3 text-gray-400 pointer-events-none"/>
                                <select 
                                    value={orderFreq}
                                    onChange={(e) => setOrderFreq(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                                >
                                    <option value="Daily">Daily</option>
                                    <option value="Weekly">Weekly</option>
                                    <option value="Fortnightly">Fortnightly</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Attached Invoice</label>
                        <label 
                            htmlFor="invoice-upload-pricing"
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all group relative cursor-pointer block ${
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
                                <div className="flex flex-col items-center gap-2 relative z-0">
                                    <div className="bg-emerald-100 p-3 rounded-full text-emerald-600 shadow-sm">
                                        <FileText size={24} />
                                    </div>
                                    <div className="text-center w-full px-2">
                                        <p className="text-xs font-black text-gray-900 truncate uppercase tracking-tighter">{invoiceFileName}</p>
                                        <p className="text-[10px] text-emerald-600 font-bold mt-1 uppercase tracking-widest">Active Link Created</p>
                                    </div>
                                    <button 
                                        onClick={removeFile}
                                        className="mt-2 text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline z-20"
                                    >
                                        Replace File
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-3 py-4">
                                    <div className="p-3 bg-gray-100 rounded-full text-gray-400 group-hover:text-indigo-500 transition-colors">
                                        <Upload size={24} />
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-900 font-bold block">Drag & drop invoice</span>
                                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1 block">PDF, JPG, PNG</span>
                                    </div>
                                </div>
                            )}
                        </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">PZ Savings (%)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-400 text-xs font-bold">%</span>
                                <input 
                                    type="number" 
                                    value={targetSavings}
                                    onChange={(e) => { setTargetSavings(parseFloat(e.target.value)); setIsGenerated(false); }}
                                    className="w-full pl-7 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-black text-emerald-600 outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">Supplier Target (%)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-400 text-xs font-bold">%</span>
                                <input 
                                    type="number" 
                                    value={supplierTarget}
                                    onChange={(e) => { setSupplierTarget(parseFloat(e.target.value)); setIsGenerated(false); }}
                                    className="w-full pl-7 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-black text-blue-600 outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleGenerate}
                        disabled={isProcessing}
                        className={`w-full py-4 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl flex items-center justify-center gap-3 transition-all mt-4 ${isProcessing ? 'bg-indigo-400 cursor-not-allowed shadow-none' : 'bg-secondary hover:bg-black hover:scale-[1.02]'}`}
                    >
                        {isProcessing ? <><Loader2 size={18} className="animate-spin"/> Scanning Invoice...</> : <><Calculator size={18}/> Analyse & Match</>}
                    </button>
                </div>
            </div>

            {/* SUMMARY CARD */}
            {isGenerated && (
                <div className="bg-slate-900 text-white rounded-[2rem] shadow-2xl p-8 animate-in slide-in-from-left-4 duration-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none transform rotate-12 scale-150"><TrendingDown size={180}/></div>
                    <div className="relative z-10">
                        <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-[0.3em] mb-8 border-b border-slate-700 pb-3">Projection Summary</h3>
                        
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400 font-bold text-xs uppercase">Market Spend</span>
                                <span className="text-xl font-bold text-slate-500 line-through decoration-slate-600">${totalInvoiceSpend.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-emerald-400 font-black text-xs uppercase tracking-widest">Platform Zero</span>
                                <span className="text-3xl font-black text-emerald-400 tracking-tighter">${totalPzSpend.toFixed(2)}</span>
                            </div>
                            
                            <div className="pt-6 mt-2 border-t border-slate-800">
                                <div className="flex items-center gap-2 text-emerald-300 mb-2">
                                    <TrendingDown size={20}/>
                                    <span className="font-black text-[10px] uppercase tracking-widest">In-Pocket Savings</span>
                                </div>
                                <div className="flex items-baseline gap-3">
                                    <div className="text-5xl font-black text-white tracking-tighter">
                                        ${totalSavingsValue.toFixed(0)}
                                    </div>
                                    <span className="bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-xs font-black tracking-wider">
                                        {actualSavingsPercent.toFixed(1)}% OFF
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* RIGHT COLUMN: RESULTS */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
            
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-200 overflow-hidden min-h-[600px] flex flex-col">
                {/* Header */}
                <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gray-50/50">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                             <h2 className="text-2xl font-black text-gray-900 tracking-tight">Active Quote: {customerName || 'New Lead'}</h2>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="bg-white border border-gray-200 text-gray-500 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest">{targetSavings}% Platform Markup</span>
                            {weeklySpend && (
                                <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-emerald-100">
                                    <DollarSign size={12}/> Volume: ${weeklySpend}
                                </span>
                            )}
                            <span className="text-gray-300">|</span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lead Source: Market Analysis</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleExportPDF} className="p-3 bg-white border border-gray-200 text-gray-400 rounded-2xl hover:text-indigo-600 transition-all shadow-sm">
                            <Download size={20}/>
                        </button>
                        <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 shadow-lg transition-all">
                            <Mail size={16}/> Dispatch Proposal
                        </button>
                    </div>
                </div>

                {/* Table Content */}
                <div className="flex-1 overflow-x-auto p-2">
                    {isGenerated ? (
                        <table className="w-full text-left border-separate border-spacing-y-2 px-6">
                            <thead>
                                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                    <th className="px-4 py-2">Line Item Product</th>
                                    <th className="px-4 py-2 text-right">Invoiced Price</th>
                                    <th className="px-4 py-2 text-right text-emerald-600">PZ Marketplace</th>
                                    {showSupplierTargets && (
                                        <th className="px-4 py-2 text-right text-blue-600 bg-blue-50/50 rounded-t-xl">Target Price ({supplierTarget}%)</th>
                                    )}
                                    <th className="px-4 py-2 text-right">Variance</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {comparison.map((item, idx) => (
                                    <tr key={idx} className="group transition-all">
                                        <td className="px-4 py-5 bg-white border-y border-l border-gray-100 rounded-l-2xl group-hover:bg-gray-50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden p-1">
                                                    <img src={item.product.imageUrl} className="w-full h-full object-cover rounded-lg"/>
                                                </div>
                                                <span className="font-black text-gray-900 tracking-tight">{item.product.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-5 bg-white border-y border-gray-100 text-right group-hover:bg-gray-50">
                                            <span className="text-gray-400 font-medium line-through">${item.invoicePrice.toFixed(2)}</span>
                                        </td>
                                        <td className="px-4 py-5 bg-white border-y border-gray-100 text-right group-hover:bg-gray-50">
                                            <span className="text-emerald-600 font-black text-lg tracking-tight">${item.pzPrice.toFixed(2)}</span>
                                        </td>
                                        {showSupplierTargets && (
                                            <td className="px-4 py-5 bg-blue-50/30 border-y border-gray-100 text-right group-hover:bg-blue-50/50">
                                                <span className="text-blue-700 font-black">${item.supplierTargetPrice.toFixed(2)}</span>
                                            </td>
                                        )}
                                        <td className="px-4 py-5 bg-white border-y border-r border-gray-100 rounded-r-2xl text-right group-hover:bg-gray-50">
                                            <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                -{item.savingsPercent}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-6 py-32">
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center border-4 border-dashed border-gray-200">
                                <Calculator size={40} className="opacity-20"/>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-black text-gray-900 tracking-tight uppercase">Ready for Analysis</p>
                                <p className="text-sm text-gray-500 mt-1">Configure the lead details and click "Analyse & Match" to proceed.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Secondary Actions */}
                <div className="p-8 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-6">
                    <button 
                        onClick={() => setShowSupplierTargets(!showSupplierTargets)}
                        className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all shadow-sm ${
                            showSupplierTargets 
                            ? 'bg-blue-600 text-white ring-4 ring-blue-100' 
                            : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-100'
                        }`}
                    >
                        {showSupplierTargets ? <EyeOff size={14}/> : <Eye size={14}/>} 
                        {showSupplierTargets ? 'Hide Procurement Strategy' : 'Show Procurement Strategy'}
                    </button>
                    
                    {isGenerated && showSupplierTargets && (
                        <div className="flex items-center gap-4 animate-in slide-in-from-right-4">
                            <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Target Price Total: <span className="text-sm ml-1">${comparison.reduce((sum, i) => sum + i.supplierTargetPrice, 0).toFixed(2)}</span></p>
                            <button 
                                onClick={handleOpenSupplierModal}
                                className="bg-[#0F172A] text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2"
                            >
                                <Send size={14}/> Source Wholesaler
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {isSupplierModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
              <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden">
                  <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                      <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Select Procurement Source</h2>
                      <button onClick={() => setIsSupplierModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={24}/></button>
                  </div>
                  <div className="p-8 space-y-6">
                      <p className="text-xs text-gray-500 font-medium leading-relaxed">Choose a partner to fulfill this request. They will only see the product varieties and target price goals to protect lead privacy.</p>
                      
                      {/* High-Fidelity Custom Dropdown */}
                      <div className="space-y-2">
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Wholesaler / Farmer</label>
                          <div className="relative" ref={dropdownRef}>
                            <button 
                                type="button"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-left font-bold text-gray-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <Store className="text-gray-400" size={20}/>
                                    <span className={selectedSupplierId ? 'text-gray-900' : 'text-gray-400'}>
                                        {selectedSupplier 
                                            ? `${selectedSupplier.businessName} (${selectedSupplier.role})` 
                                            : "Browse network partners..."}
                                    </span>
                                </div>
                                <ChevronDown size={20} className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}/>
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden py-2 animate-in slide-in-from-top-2 duration-200">
                                    <button 
                                        type="button"
                                        onClick={() => { setSelectedSupplierId(''); setIsDropdownOpen(false); }}
                                        className="w-full text-left px-5 py-3 text-sm font-bold flex items-center justify-between hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="text-gray-400">Browse network partners...</span>
                                        {!selectedSupplierId && <Check size={18} className="text-gray-900"/>}
                                    </button>
                                    <div className="h-px bg-gray-50 mx-4 my-1"></div>
                                    {wholesalers.map(w => (
                                        <button 
                                            key={w.id}
                                            type="button"
                                            onClick={() => { setSelectedSupplierId(w.id); setIsDropdownOpen(false); }}
                                            className={`w-full text-left px-5 py-3 text-sm font-bold flex items-center justify-between hover:bg-gray-50 transition-colors ${selectedSupplierId === w.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                                        >
                                            <span>{w.businessName} <span className="opacity-50 font-medium">({w.role})</span></span>
                                            {selectedSupplierId === w.id && <Check size={18} className="text-blue-600"/>}
                                        </button>
                                    ))}
                                </div>
                            )}
                          </div>
                      </div>
                      
                      <div className="bg-blue-50 p-5 rounded-2xl border-2 border-blue-100 text-[10px] font-bold text-blue-700 flex gap-4">
                          <Info size={18} className="shrink-0"/>
                          <p className="leading-relaxed">Supplier will receive a target total of <span className="text-blue-900 font-black">${comparison.reduce((sum, i) => sum + i.supplierTargetPrice, 0).toFixed(2)}</span> to match.</p>
                      </div>

                      <div className="flex flex-col gap-3 pt-4">
                          <button 
                              onClick={handleSendSupplierRequest}
                              disabled={!selectedSupplierId}
                              className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
                          >
                              <Send size={16}/> Initiate Procurement
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
