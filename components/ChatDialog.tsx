
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, ShieldCheck } from 'lucide-react';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'admin' | 'system';
  timestamp: Date;
}

interface ChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  issueType: string;
  repName?: string; // New prop for dynamic rep name
}

export const ChatDialog: React.FC<ChatDialogProps> = ({ isOpen, onClose, orderId, issueType, repName = "PZ Admin Support" }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMessages([
        {
          id: '1',
          text: `Support case started for Order #${orderId}. Issue: ${issueType}`,
          sender: 'system',
          timestamp: new Date()
        },
        {
          id: '2',
          text: `Hello, this is ${repName}. I see you have reported an issue. How can I help resolve this?`,
          sender: 'admin',
          timestamp: new Date(Date.now() + 500)
        }
      ]);
    }
  }, [isOpen, orderId, issueType, repName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');

    // Simulate Admin Reply
    setTimeout(() => {
      const adminMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "Thanks for the details. I'll review the photo evidence and coordinate with the buyer immediately to approve the resolution.",
        sender: 'admin',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, adminMsg]);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
       {/* Backdrop to darken the existing modal slightly more to focus on chat */}
       <div className="absolute inset-0 bg-black/10 pointer-events-auto" onClick={onClose} />
       
       <div className="bg-white w-full sm:w-96 h-[500px] sm:rounded-xl shadow-2xl flex flex-col pointer-events-auto relative z-[70] sm:mr-4 mb-0 sm:mb-4 border border-gray-200 overflow-hidden transform transition-all animate-in slide-in-from-bottom-10 fade-in duration-300">
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 p-1.5 rounded-full relative">
                <ShieldCheck size={18} className="text-white"/>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-slate-900 rounded-full"></span>
              </div>
              <div>
                <h3 className="font-bold text-sm">PZ Support: {repName.split(' ')[0]}</h3>
                <p className="text-xs text-slate-400">Typical reply time: &lt; 2m</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                 {msg.sender === 'system' ? (
                   <div className="w-full text-center my-2">
                     <span className="text-[10px] text-gray-400 font-medium bg-gray-100 px-2 py-1 rounded-full uppercase tracking-wider">{msg.text}</span>
                   </div>
                 ) : (
                   <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                     msg.sender === 'user' 
                       ? 'bg-emerald-600 text-white rounded-br-none' 
                       : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                   }`}>
                     <p>{msg.text}</p>
                     <p className={`text-[10px] mt-1 text-right ${msg.sender === 'user' ? 'text-emerald-100' : 'text-gray-400'}`}>
                       {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                     </p>
                   </div>
                 )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex items-center gap-2"
            >
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Message ${repName.split(' ')[0]}...`}
                className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder-gray-400"
                autoFocus
              />
              <button 
                type="submit"
                disabled={!inputValue.trim()}
                className="p-2.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
       </div>
    </div>
  );
};
