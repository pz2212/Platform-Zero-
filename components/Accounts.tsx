import React, { useState, useEffect, useMemo } from 'react';
import { User, Order, Product, Customer } from '../types';
import { mockService } from '../services/mockDataService';
import { 
  ArrowDownLeft, ArrowUpRight, FileText, Download, Filter, Search, 
  DollarSign, Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  Clock, Package, User as UserIcon, CreditCard, Banknote, ChevronDown,
  TrendingUp, ChevronUp
} from 'lucide-react';

interface AccountsProps {
  user: User;
}

const SalesCalendar = ({ orders, products, customers }: { orders: Order[], products: Product[], customers: Customer[] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const monthYear = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const salesByDate = useMemo(() => {
    const map: Record<string, Order[]> = {};
    orders.forEach(order => {
      const dateKey = new Date(order.date).toDateString();
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(order);
    });
    return map;
  }, [orders]);

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = daysInMonth(year, month);
    const startOffset = firstDayOfMonth(year, month);
    const calendar = [];

    // Padding for start of month
    for (let i = 0; i < startOffset; i++) calendar.push(null);

    // Actual days
    for (let i = 1; i <= days; i++) {
      const date = new Date(year, month, i);
      calendar.push(date);
    }
    return calendar;
  }, [currentDate]);

  const selectedDaySales = salesByDate[selectedDate.toDateString()] || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* CALENDAR INTERFACE */}
      <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-fit">
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight">{monthYear}</h3>
          <div className="flex gap-2">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-50 rounded-xl transition-all border border-gray-100"><ChevronLeft size={20}/></button>
            <button onClick={handleNextMonth} className="p-2 hover:bg-gray-50 rounded-xl transition-all border border-gray-100"><ChevronRight size={20}/></button>
          </div>
        </div>

        <div className="grid grid-cols-7 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, idx) => {
            if (!date) return <div key={`empty-${idx}`} className="h-12" />;
            
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const hasSales = salesByDate[date.toDateString()];
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <button 
                key={idx}
                onClick={() => {
                  setSelectedDate(date);
                  setExpandedOrderId(null);
                }}
                className={`h-12 relative flex flex-col items-center justify-center rounded-xl transition-all group ${
                  isSelected ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span className={`text-sm font-bold ${isToday && !isSelected ? 'text-indigo-600 underline decoration-2' : ''}`}>{date.getDate()}</span>
                {hasSales && (
                  <div className={`absolute bottom-1.5 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`}></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SALES LOG FOR SELECTED DAY */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-end">
           <div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Sales Log</h3>
              <p className="text-gray-500 font-medium text-sm">{selectedDate.toLocaleDateString('default', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
           </div>
           <div className="bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 flex items-center gap-3">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Total Sales</span>
              <span className="font-black text-emerald-700 text-xl">${selectedDaySales.reduce((sum, s) => sum + s.totalAmount, 0).toFixed(2)}</span>
           </div>
        </div>

        <div className="space-y-4">
          {selectedDaySales.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
               <DollarSign size={48} className="mx-auto text-gray-200 mb-4 opacity-20"/>
               <p className="text-gray-400 font-black uppercase tracking-widest text-xs">No sales recorded for this date.</p>
            </div>
          ) : selectedDaySales.map(sale => {
            const customer = customers.find(c => c.id === sale.buyerId);
            const timeStr = new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const isExpanded = expandedOrderId === sale.id;
            
            return (
              <div key={sale.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col">
                <div 
                  onClick={() => setExpandedOrderId(isExpanded ? null : sale.id)}
                  className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center gap-6"
                >
                  <div className="flex items-center gap-4 min-w-[200px]">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-lg shadow-inner-sm">
                      {customer?.businessName.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 leading-none mb-1 group-hover:text-indigo-600 transition-colors">{customer?.businessName || 'Guest User'}</h4>
                      <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                         <Clock size={12}/> {timeStr}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="col-span-2 md:col-span-1">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Products</p>
                      <div className="flex -space-x-2">
                        {sale.items.map((item, i) => (
                          <div key={i} title={products.find(p => p.id === item.productId)?.name} className="w-8 h-8 rounded-full border-2 border-white bg-gray-50 overflow-hidden shadow-sm">
                             <img src={products.find(p => p.id === item.productId)?.imageUrl} className="w-full h-full object-cover"/>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Payment</p>
                      <div className={`flex items-center gap-1.5 font-black text-[10px] uppercase tracking-tight ${
                          sale.paymentMethod === 'invoice' ? 'text-orange-600' : 'text-blue-600'
                      }`}>
                        {sale.paymentMethod === 'invoice' ? <Banknote size={14}/> : <CreditCard size={14}/>}
                        {sale.paymentMethod === 'invoice' ? 'Invoice/Cash' : 'Credit Card'}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total</p>
                      <p className="font-black text-gray-900 text-lg">${sale.totalAmount.toFixed(2)}</p>
                    </div>
                  </div>

                  <button className="p-3 bg-gray-50 text-gray-400 rounded-2xl group-hover:bg-gray-900 group-hover:text-white transition-all shadow-sm">
                    {isExpanded ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                  </button>
                </div>

                {/* EXPANDED PRODUCT DETAILS */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 animate-in slide-in-from-top-4 duration-300">
                    <div className="bg-gray-50/50 rounded-2xl border border-gray-100 overflow-hidden">
                      <table className="w-full text-left">
                        <thead className="bg-gray-100/50 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">
                          <tr>
                            <th className="px-5 py-3">Product Item</th>
                            <th className="px-5 py-3 text-center">Quantity</th>
                            <th className="px-5 py-3 text-right">Unit Price</th>
                            <th className="px-5 py-3 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {sale.items.map((item, idx) => {
                            const product = products.find(p => p.id === item.productId);
                            return (
                              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shadow-sm">
                                      <img src={product?.imageUrl} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                      <p className="font-black text-gray-900 text-xs">{product?.name || 'Unknown Produce'}</p>
                                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{product?.variety || 'Standard'}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-5 py-4 text-center font-bold text-gray-900 text-sm">
                                  {item.quantityKg}kg
                                </td>
                                <td className="px-5 py-4 text-right font-medium text-gray-500 text-xs">
                                  ${item.pricePerKg.toFixed(2)}/kg
                                </td>
                                <td className="px-5 py-4 text-right font-black text-gray-900 text-sm">
                                  ${(item.quantityKg * item.pricePerKg).toFixed(2)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const Accounts: React.FC<AccountsProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'receivables' | 'payables' | 'sales'>('receivables');
  const [receivables, setReceivables] = useState<Order[]>([]);
  const [payables, setPayables] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    // Receivables: Money owed TO me (I am the Seller)
    const rec = mockService.getOrders(user.id).filter(o => o.sellerId === user.id);
    setReceivables(rec);

    // Payables: Money I owe (I am the Buyer)
    const pay = mockService.getOrders(user.id).filter(o => o.buyerId === user.id);
    setPayables(pay);

    setProducts(mockService.getAllProducts());
    setCustomers(mockService.getCustomers());
  }, [user]);

  const getCounterpartyName = (order: Order, type: 'receivables' | 'payables') => {
      if (type === 'receivables') {
          return mockService.getCustomers().find(c => c.id === order.buyerId)?.businessName || 'Unknown Buyer';
      } else {
          const seller = mockService.getAllUsers().find(u => u.id === order.sellerId);
          return seller ? seller.businessName : 'Unknown Supplier';
      }
  };

  const getTotalAmount = (orders: Order[]) => {
      return orders.reduce((sum, o) => sum + o.totalAmount, 0);
  };

  const getStatusColor = (status: string) => {
      switch (status) {
          case 'Paid': return 'bg-green-100 text-green-700';
          case 'Unpaid': return 'bg-yellow-100 text-yellow-700';
          case 'Overdue': return 'bg-red-100 text-red-700';
          default: return 'bg-gray-100 text-gray-600';
      }
  };

  const handleDownloadInvoice = (order: Order) => {
      const counterparty = getCounterpartyName(order, activeTab === 'sales' ? 'receivables' : activeTab);
      const invoiceData = `
PLATFORM ZERO - INVOICE #${order.id.split('-')[1] || order.id}
------------------------------------------------
Date: ${new Date(order.date).toLocaleDateString()}
Status: ${order.paymentStatus || order.status}

${activeTab === 'receivables' ? 'BILL TO:' : 'FROM:'}
${counterparty}

AMOUNT: $${order.totalAmount.toFixed(2)}
------------------------------------------------
Items:
${order.items.map(i => `- ${i.productId}: ${i.quantityKg}kg @ $${i.pricePerKg}/kg`).join('\n')}

------------------------------------------------
Thank you for using Platform Zero.
      `;

      const blob = new Blob([invoiceData], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${order.id}.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
  };

  const handleExportReport = () => {
      const list = activeTab === 'receivables' || activeTab === 'sales' ? receivables : payables;
      const data = list.map(o => {
          return `${new Date(o.date).toLocaleDateString()},${o.id},${getCounterpartyName(o, activeTab === 'sales' ? 'receivables' : activeTab)},${o.totalAmount},${o.paymentStatus}`;
      }).join('\n');
      
      const header = "Date,InvoiceID,Counterparty,Amount,Status\n";
      const blob = new Blob([header + data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${activeTab}_Report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const currentList = activeTab === 'receivables' ? receivables : payables;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Financial Hub</h1>
            <p className="text-gray-500 font-medium">Track invoices, payments, and live sales performance.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
            <button 
                onClick={handleExportReport}
                className="flex-1 md:flex-none px-6 py-3 bg-white border border-gray-200 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 shadow-sm"
            >
                <Download size={16}/> Export Statement
            </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shadow-inner-sm">
                          <ArrowDownLeft size={24} />
                      </div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Receivables</span>
                  </div>
                  <div className="bg-gray-50 p-1.5 rounded-lg text-gray-300 group-hover:text-emerald-500 transition-colors">
                    <DollarSign size={18}/>
                  </div>
              </div>
              <h3 className="text-4xl font-black text-gray-900 tracking-tighter">${getTotalAmount(receivables).toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-2">{receivables.length} Active Invoices</p>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                      <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl shadow-inner-sm">
                          <ArrowUpRight size={24} />
                      </div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payables</span>
                  </div>
                  <div className="bg-gray-50 p-1.5 rounded-lg text-gray-300 group-hover:text-orange-500 transition-colors">
                    <DollarSign size={18}/>
                  </div>
              </div>
              <h3 className="text-4xl font-black text-gray-900 tracking-tighter">${getTotalAmount(payables).toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
              <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mt-2">{payables.length} Bills Due</p>
          </div>

          <div className="bg-[#0F172A] p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 transform scale-150"><TrendingUp size={120} className="text-emerald-400"/></div>
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl">
                          <TrendingUp size={24} />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Sales Hub</span>
                  </div>
                  <h3 className="text-4xl font-black text-white tracking-tighter">${getTotalAmount(receivables).toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-2">Lifetime Transactional Volume</p>
                </div>
                <button 
                  onClick={() => setActiveTab('sales')}
                  className="mt-6 w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-[#0F172A] rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <CalendarIcon size={16}/> Go to Sales Tab
                </button>
              </div>
          </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-200 overflow-visible min-h-[600px] flex flex-col">
          {/* Tabs */}
          <div className="border-b border-gray-100 flex overflow-x-auto no-scrollbar">
            <button
                onClick={() => setActiveTab('receivables')}
                className={`flex-1 min-w-[150px] py-6 px-1 text-center font-black text-[10px] uppercase tracking-[0.2em] transition-all border-b-4 ${
                    activeTab === 'receivables'
                        ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30'
                        : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
            >
                Receivables
            </button>
            <button
                onClick={() => setActiveTab('payables')}
                className={`flex-1 min-w-[150px] py-6 px-1 text-center font-black text-[10px] uppercase tracking-[0.2em] transition-all border-b-4 ${
                    activeTab === 'payables'
                        ? 'border-emerald-500 text-emerald-600 bg-emerald-50/30'
                        : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
            >
                Payables
            </button>
            <button
                onClick={() => setActiveTab('sales')}
                className={`flex-1 min-w-[150px] py-6 px-1 text-center font-black text-[10px] uppercase tracking-[0.2em] transition-all border-b-4 ${
                    activeTab === 'sales'
                        ? 'border-indigo-900 text-indigo-900 bg-indigo-50'
                        : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
            >
                Sales History
            </button>
          </div>

          <div className="p-8 flex-1">
            {activeTab === 'sales' ? (
              <SalesCalendar orders={receivables} products={products} customers={customers} />
            ) : (
              <div className="space-y-6">
                {/* Filters Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50 p-4 rounded-3xl border border-gray-100">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                        <input 
                          type="text" 
                          placeholder="Search reference # or business..." 
                          className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-[1.25rem] text-xs font-black text-gray-900 focus:ring-4 focus:ring-indigo-500/10 outline-none"
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button className="flex-1 sm:flex-none px-6 py-3.5 bg-white border border-gray-200 rounded-[1.25rem] text-[10px] font-black text-gray-500 hover:bg-gray-100 flex items-center justify-center gap-2 uppercase tracking-widest shadow-sm">
                            <Filter size={16}/> Filter Range
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-[2rem] border border-gray-100">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-6">Statement Date</th>
                                <th className="px-8 py-6">Invoice Ref</th>
                                <th className="px-8 py-6">{activeTab === 'receivables' ? 'Customer Profile' : 'Supplier Profile'}</th>
                                <th className="px-8 py-6">Amount</th>
                                <th className="px-8 py-6">Due Date</th>
                                <th className="px-8 py-6">Status</th>
                                <th className="px-8 py-6 text-right">Accounting</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {currentList.map(order => (
                                <tr key={order.id} className="hover:bg-gray-50/80 transition-colors group">
                                    <td className="px-8 py-6 text-sm font-bold text-gray-500">{new Date(order.date).toLocaleDateString()}</td>
                                    <td className="px-8 py-6 font-mono font-black text-xs text-indigo-600">INV-{order.id.split('-')[1] || order.id}</td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400">
                                              {getCounterpartyName(order, activeTab).charAt(0)}
                                            </div>
                                            <span className="font-black text-gray-900 text-sm tracking-tight">{getCounterpartyName(order, activeTab)}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 font-black text-gray-900 text-lg">${order.totalAmount.toFixed(2)}</td>
                                    <td className="px-8 py-6 text-xs font-bold text-gray-400">
                                        {new Date(new Date(order.date).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(order.issue ? 'Disputed' : (order.paymentStatus || 'Unpaid'))}`}>
                                            {order.issue ? 'Disputed' : (order.paymentStatus || 'Unpaid')}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button 
                                          onClick={() => handleDownloadInvoice(order)}
                                          className="p-2.5 bg-white border border-gray-200 text-gray-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 ml-auto"
                                        >
                                            <FileText size={18}/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {currentList.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-8 py-32 text-center">
                                        <DollarSign size={40} className="mx-auto text-gray-200 mb-4 opacity-10"/>
                                        <p className="text-gray-300 font-black uppercase tracking-widest text-xs">No {activeTab} records found.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
              </div>
            )}
          </div>
      </div>
    </div>
  );
};