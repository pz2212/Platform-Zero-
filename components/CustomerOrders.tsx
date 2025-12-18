
import React, { useState, useEffect } from 'react';
import { User, Order } from '../types';
import { mockService } from '../services/mockDataService';
import { Package, Clock, CheckCircle, Truck, X, Calendar, MapPin, DollarSign, ChevronRight, AlertTriangle, MessageSquare } from 'lucide-react';
import { ChatDialog } from './ChatDialog';

interface CustomerOrdersProps {
  user: User;
}

export const CustomerOrders: React.FC<CustomerOrdersProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Checklist State
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  
  // Issue Reporting State
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [selectedIssueOrder, setSelectedIssueOrder] = useState<Order | null>(null);
  const [selectedIssueItem, setSelectedIssueItem] = useState<{name: string, id: string} | null>(null);

  useEffect(() => {
    // Filter orders where the current user is the buyer
    const allOrders = mockService.getOrders(user.id).filter(o => o.buyerId === user.id);
    setOrders(allOrders);
  }, [user]);

  // Filter orders based on status
  const activeOrders = orders.filter(o => ['Pending', 'Confirmed', 'Ready for Delivery', 'Shipped'].includes(o.status));
  const historyOrders = orders.filter(o => ['Delivered', 'Cancelled'].includes(o.status));

  const displayedOrders = activeTab === 'active' ? activeOrders : historyOrders;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Ready for Delivery': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Shipped': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
      switch (status) {
          case 'Pending': return <Clock size={14} />;
          case 'Confirmed': return <CheckCircle size={14} />;
          case 'Ready for Delivery': return <Package size={14} />;
          case 'Shipped': return <Truck size={14} />;
          case 'Delivered': return <CheckCircle size={14} />;
          case 'Cancelled': return <X size={14} />;
          default: return <Clock size={14} />;
      }
  };

  const toggleItemCheck = (orderId: string, productId: string) => {
      const key = `${orderId}-${productId}`;
      setCheckedItems(prev => ({...prev, [key]: !prev[key]}));
  };

  const handleReportIssue = (order: Order, item?: {name: string, id: string}) => {
      setSelectedIssueOrder(order);
      setSelectedIssueItem(item || null);
      setIssueModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('active')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'active'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Package size={18}/>
            Current Orders
            {activeOrders.length > 0 && (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full ml-1">
                    {activeOrders.length}
                </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'history'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Clock size={18}/>
            Past Orders
          </button>
        </nav>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {displayedOrders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                <Package size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
                <p className="text-gray-500 mt-1">
                    {activeTab === 'active' ? "You don't have any active orders." : "You haven't placed any orders yet."}
                </p>
            </div>
        ) : (
            displayedOrders.map(order => (
                <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    {/* Header */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Order #</span>
                                <div className="font-mono font-bold text-gray-900">{order.id.split('-')[1] || order.id}</div>
                            </div>
                            <div>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Date Placed</span>
                                <div className="font-medium text-gray-900">{new Date(order.date).toLocaleDateString()}</div>
                            </div>
                            <div>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total</span>
                                <div className="font-bold text-gray-900">${order.totalAmount.toFixed(2)}</div>
                            </div>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold uppercase ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status}
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                        {/* Delivery Info Block */}
                        <div className="mb-6 bg-blue-50/50 rounded-lg p-4 border border-blue-100 flex flex-col sm:flex-row gap-6">
                            <div className="flex items-start gap-3">
                                <Calendar size={18} className="text-blue-600 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-blue-800 uppercase mb-1">Estimated Delivery</p>
                                    <p className="text-gray-900 font-medium">{order.logistics?.deliveryDate ? new Date(order.logistics.deliveryDate).toLocaleDateString() : 'Pending'} {order.logistics?.deliveryTime && `• ${order.logistics.deliveryTime}`}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin size={18} className="text-blue-600 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-blue-800 uppercase mb-1">Delivery Location</p>
                                    <p className="text-gray-900 font-medium">{order.logistics?.deliveryLocation}</p>
                                </div>
                            </div>
                        </div>

                        {/* Items List / Checklist */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <Package size={16}/> Items in Shipment
                                </h4>
                                {order.status === 'Delivered' && (
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Check Items Received</span>
                                )}
                            </div>
                            
                            <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
                                {order.items.map((item, idx) => {
                                    const productName = mockService.getAllProducts().find(p => p.id === item.productId)?.name || 'Unknown Product';
                                    const isChecked = checkedItems[`${order.id}-${item.productId}`];
                                    
                                    return (
                                        <div 
                                            key={idx} 
                                            className={`p-3 flex justify-between items-center transition-colors ${
                                                order.status === 'Delivered' 
                                                    ? isChecked ? 'bg-green-50/50' : 'bg-white hover:bg-gray-50' 
                                                    : 'bg-white'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {order.status === 'Delivered' && (
                                                    <div 
                                                        onClick={() => toggleItemCheck(order.id, item.productId)}
                                                        className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                                                            isChecked 
                                                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                                                            : 'bg-white border-gray-300 hover:border-emerald-400'
                                                        }`}
                                                    >
                                                        {isChecked && <CheckCircle size={14}/>}
                                                    </div>
                                                )}
                                                
                                                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                                                    <img 
                                                        src={mockService.getAllProducts().find(p => p.id === item.productId)?.imageUrl} 
                                                        alt="" 
                                                        className={`h-full w-full object-cover rounded-lg ${order.status === 'Delivered' && !isChecked ? 'opacity-70' : ''}`}
                                                    />
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-medium ${order.status === 'Delivered' && isChecked ? 'text-emerald-800' : 'text-gray-900'}`}>
                                                        {productName}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {item.quantityKg} kg &times; ${item.pricePerKg.toFixed(2)}/kg
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-4">
                                                <div className="text-sm font-bold text-gray-900">
                                                    ${(item.quantityKg * item.pricePerKg).toFixed(2)}
                                                </div>
                                                {order.status === 'Delivered' && (
                                                    <button 
                                                        onClick={() => handleReportIssue(order, {name: productName, id: item.productId})}
                                                        className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-full transition-colors"
                                                        title="Report Issue with this item"
                                                    >
                                                        <AlertTriangle size={16}/>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        
                        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                            {order.status === 'Delivered' ? (
                                <button 
                                    onClick={() => handleReportIssue(order)}
                                    className="text-red-600 hover:text-red-700 text-sm font-bold flex items-center gap-2 border border-red-200 bg-red-50 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors"
                                >
                                    <MessageSquare size={16}/> Report General Issue
                                </button>
                            ) : (
                                <div></div>
                            )}
                            <button className="text-indigo-600 hover:text-indigo-800 text-sm font-bold flex items-center gap-1">
                                View Invoice Details <ChevronRight size={16}/>
                            </button>
                        </div>
                    </div>
                </div>
            ))
        )}
      </div>

      {/* Report Issue Dialog */}
      {issueModalOpen && selectedIssueOrder && (
          <ChatDialog 
              isOpen={issueModalOpen}
              onClose={() => setIssueModalOpen(false)}
              orderId={selectedIssueOrder.id.split('-')[1] || selectedIssueOrder.id}
              issueType={selectedIssueItem ? `Quality Issue with ${selectedIssueItem.name}` : `Delivery Issue`}
              repName="PZ Admin"
          />
      )}
    </div>
  );
};
