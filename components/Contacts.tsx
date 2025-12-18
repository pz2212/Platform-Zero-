
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, InventoryItem, Product, ChatMessage } from '../types';
import { mockService } from '../services/mockDataService';
import { generateProductDeepLink } from '../services/smsService';
import { 
  MessageCircle, Send, Plus, X, Search, Info, 
  ShoppingBag, Link as LinkIcon, CheckCircle, Clock,
  Store, MapPin, Phone, ShieldCheck, Tag, ChevronRight
} from 'lucide-react';

interface ContactsProps {
  user: User;
}

export const Contacts: React.FC<ContactsProps> = ({ user }) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const targetId = queryParams.get('id');

  const [activeContact, setActiveContact] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [myInventory, setMyInventory] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (targetId) {
      const found = mockService.getAllUsers().find(u => u.id === targetId);
      if (found) {
        setActiveContact(found);
        // Load persistent messages from mockService
        const chatHistory = mockService.getChatMessages(user.id, targetId);
        setMessages(chatHistory);
        
        // Seed if first time ever chatting
        if (chatHistory.length === 0) {
            mockService.sendChatMessage(targetId, user.id, `Hi ${user.name.split(' ')[0]}, thanks for reaching out. We are looking for fresh stock this morning.`);
            setMessages(mockService.getChatMessages(user.id, targetId));
        }
      }
    }
    
    // Load my items for sharing
    setMyInventory(mockService.getInventory(user.id));
    setProducts(mockService.getAllProducts());
  }, [targetId, user.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, activeContact]);

  const handleSendMessage = (text: string, isProductLink = false, productId?: string) => {
    if (!activeContact || (!text.trim() && !isProductLink)) return;

    // Send via service for persistence
    mockService.sendChatMessage(user.id, activeContact.id, text, isProductLink, productId);
    
    // Refresh local UI
    setMessages(mockService.getChatMessages(user.id, activeContact.id));

    if (!isProductLink) setInputText('');
    
    // Auto-reply simulation for specific demo users
    if (activeContact.id === 'u2') {
        setTimeout(() => {
            mockService.sendChatMessage(activeContact.id, user.id, "Thanks, looking into this now. Will confirm details shortly.");
            setMessages(mockService.getChatMessages(user.id, activeContact.id));
        }, 2000);
    }
  };

  const handleShareProduct = (item: InventoryItem) => {
    const product = products.find(p => p.id === item.productId);
    if (!product) return;

    const link = generateProductDeepLink('product', item.id, user.id);
    const text = `Check out my fresh ${product.name}! 🌟 Available now at $${product.defaultPricePerKg.toFixed(2)}/kg. View details: ${link}`;
    
    handleSendMessage(text, true, product.id);
    setIsShareModalOpen(false);
  };

  if (!activeContact) {
      return (
          <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-4 animate-in fade-in duration-500">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
                  <MessageCircle size={48} />
              </div>
              <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Direct Network Messaging</h2>
                  <p className="text-gray-500 max-w-sm mt-2 font-medium">Select a contact from the sidebar to start negotiating or sharing product links.</p>
              </div>
          </div>
      );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      
      {/* HEADER */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm ${
            activeContact.role === 'FARMER' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {activeContact.businessName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
                <h2 className="font-black text-gray-900 text-xl tracking-tight leading-none">{activeContact.businessName}</h2>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{activeContact.role} • Active Now</p>
          </div>
        </div>
        <div className="flex gap-2">
            <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-indigo-600 transition-all shadow-sm"><Phone size={18}/></button>
            <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-indigo-600 transition-all shadow-sm"><Info size={18}/></button>
        </div>
      </div>

      {/* CHAT AREA */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30 custom-scrollbar"
      >
        <div className="text-center py-4">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] bg-white border border-gray-100 px-4 py-1.5 rounded-full shadow-sm">
                Messaging encrypted via Platform Zero Secure
            </span>
        </div>

        {messages.map(msg => {
          const isMe = msg.senderId === user.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`p-4 rounded-3xl shadow-sm text-sm ${
                  isMe 
                    ? 'bg-slate-900 text-white rounded-br-none' 
                    : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                }`}>
                  {msg.isProductLink ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                            <Tag size={12}/> Product Offer Attached
                        </div>
                        <p className="leading-relaxed font-medium break-words">{msg.text}</p>
                    </div>
                  ) : (
                    <p className="leading-relaxed font-medium break-words">{msg.text}</p>
                  )}
                  <p className={`text-[10px] mt-2 opacity-50 font-bold uppercase ${isMe ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* INPUT AREA */}
      <div className="p-6 border-t border-gray-100 bg-white">
        <div className="flex gap-4 items-center">
            <button 
                onClick={() => setIsShareModalOpen(true)}
                className="p-3.5 bg-gray-100 text-gray-500 rounded-2xl hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-100 flex items-center justify-center shadow-inner-sm group"
                title="Send Product Link"
            >
                <LinkIcon size={20} className="group-hover:rotate-45 transition-transform" />
            </button>
            <div className="flex-1 relative">
                <input 
                    type="text" 
                    placeholder="Type a message or share a link..."
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 pr-12 font-bold text-gray-900 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder-gray-400"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage(inputText)}
                />
                <button 
                    onClick={() => handleSendMessage(inputText)}
                    disabled={!inputText.trim()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-[#043003] text-white rounded-xl hover:bg-black transition-all shadow-md disabled:opacity-30 disabled:scale-100 active:scale-90"
                >
                    <Send size={18}/>
                </button>
            </div>
        </div>
      </div>

      {/* SHARE PRODUCT MODAL */}
      {isShareModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-md p-4">
              <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                  <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                      <div>
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Share My Stock</h2>
                        <p className="text-sm text-gray-500 font-medium">Select a product to share as a direct link.</p>
                      </div>
                      <button onClick={() => setIsShareModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 bg-white rounded-full shadow-sm border border-gray-100 transition-all"><X size={24}/></button>
                  </div>
                  
                  <div className="p-6 flex-1 overflow-y-auto max-h-[60vh] space-y-3 custom-scrollbar">
                      {myInventory.length === 0 ? (
                          <div className="py-20 text-center text-gray-400 flex flex-col items-center">
                              <ShoppingBag size={48} className="opacity-20 mb-4"/>
                              <p className="font-black uppercase tracking-widest text-xs">You have no active items in inventory.</p>
                          </div>
                      ) : myInventory.map(item => {
                          const product = products.find(p => p.id === item.productId);
                          return (
                              <div 
                                key={item.id} 
                                onClick={() => handleShareProduct(item)}
                                className="group flex items-center justify-between p-4 rounded-2xl border-2 border-gray-50 bg-white hover:border-emerald-500 hover:bg-emerald-50/30 transition-all cursor-pointer shadow-sm"
                              >
                                  <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 rounded-xl border border-gray-100 overflow-hidden bg-gray-50">
                                          <img src={product?.imageUrl} className="w-full h-full object-cover" />
                                      </div>
                                      <div>
                                          <p className="font-black text-gray-900 text-sm leading-tight">{product?.name}</p>
                                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{item.quantityKg}kg Available</p>
                                      </div>
                                  </div>
                                  <div className="text-right">
                                      <p className="font-black text-emerald-600">${product?.defaultPricePerKg.toFixed(2)}/kg</p>
                                      <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          Share Link <ChevronRight size={12}/>
                                      </div>
                                  </div>
                              </div>
                          );
                      })}
                  </div>

                  <div className="p-8 border-t border-gray-100 bg-gray-50/50">
                      <button onClick={() => setIsShareModalOpen(false)} className="w-full py-4 bg-white border-2 border-gray-200 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all">Cancel</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
