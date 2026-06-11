
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Paperclip, Image as ImageIcon, Smile, MoreHorizontal, Phone, Video, Minus, Check, CheckCheck } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  timestamp: Date;
  type: 'text' | 'image';
  status: 'sent' | 'delivered' | 'read';
  fileUrl?: string;
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [callNotice, setCallNotice] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCall = (kind: 'voice' | 'video') => {
    setCallNotice(`Starting ${kind} call with PawPortal Support…`);
    setTimeout(() => setCallNotice(''), 2500);
  };

  // Mock Conversation Starter
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi there! How can we help you and your pet today?',
      sender: 'them',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      type: 'text',
      status: 'read'
    }
  ]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isTyping]);

  // Simulate receiving a message
  const simulateResponse = () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const newMsg: Message = {
        id: Date.now().toString(),
        text: "Thanks for reaching out! A support agent will be with you shortly.",
        sender: 'them',
        timestamp: new Date(),
        type: 'text',
        status: 'delivered'
      };
      setMessages(prev => [...prev, newMsg]);
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
        // Play sound here in a real app
      }
    }, 2500);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'me',
      timestamp: new Date(),
      type: 'text',
      status: 'sent'
    };

    setMessages(prev => [...prev, newMsg]);
    setInputValue('');
    setShowEmojiPicker(false);

    // Simulate "Delivered" -> "Read" status update
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === newMsg.id ? { ...m, status: 'delivered' } : m));
    }, 1000);
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === newMsg.id ? { ...m, status: 'read' } : m));
    }, 2000);

    simulateResponse();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      
      const newMsg: Message = {
        id: Date.now().toString(),
        text: '',
        sender: 'me',
        timestamp: new Date(),
        type: 'image',
        fileUrl: url,
        status: 'sent'
      };
      
      setMessages(prev => [...prev, newMsg]);
      simulateResponse();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
      setIsMinimized(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      
      {/* Chat Window */}
      {isOpen && !isMinimized && (
        <div className="mb-4 w-[350px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-10 duration-300 origin-bottom-right">
          
          {/* Header */}
          <div className="bg-white border-b border-slate-100 p-3 flex justify-between items-center shadow-sm z-10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src="https://picsum.photos/id/1025/100/100" alt="Support" className="w-10 h-10 rounded-full border border-slate-100" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">PawPortal Support</h3>
                <p className="text-xs text-emerald-600 font-medium">Typically replies in 2m</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-blue-600">
              <button onClick={() => startCall('voice')} className="p-2 hover:bg-blue-50 rounded-full transition-colors"><Phone size={18} /></button>
              <button onClick={() => startCall('video')} className="p-2 hover:bg-blue-50 rounded-full transition-colors"><Video size={18} /></button>
              <button onClick={() => setIsMinimized(true)} className="p-2 hover:bg-blue-50 rounded-full transition-colors"><Minus size={18} /></button>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-blue-50 rounded-full transition-colors"><X size={18} /></button>
            </div>
          </div>

          {/* Call notice */}
          {callNotice && (
            <div className="bg-blue-50 text-blue-700 text-xs font-medium px-4 py-2 border-b border-blue-100 animate-in fade-in">
              {callNotice}
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 bg-white overflow-y-auto p-4 space-y-4">
            <div className="text-center text-xs text-slate-400 font-medium my-4">Today</div>
            
            {messages.map((msg, idx) => {
              const isMe = msg.sender === 'me';
              return (
                <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                   <div className={`flex max-w-[80%] gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!isMe && (
                         <img src="https://picsum.photos/id/1025/50/50" className="w-6 h-6 rounded-full self-end mb-1" />
                      )}
                      
                      <div className="flex flex-col gap-1 items-end">
                         {msg.type === 'text' ? (
                            <div className={`px-4 py-2 text-sm rounded-2xl shadow-sm leading-relaxed ${
                                isMe 
                                ? 'bg-blue-600 text-white rounded-br-sm' 
                                : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                            }`}>
                                {msg.text}
                            </div>
                         ) : (
                            <div className={`p-1 rounded-2xl shadow-sm ${isMe ? 'bg-blue-600 rounded-br-sm' : 'bg-slate-100 rounded-bl-sm'}`}>
                                <img src={msg.fileUrl} className="rounded-xl max-w-[150px]" alt="attachment" />
                            </div>
                         )}
                         
                         {/* Meta info */}
                         <div className={`flex items-center gap-1 text-[10px] text-slate-400 ${isMe ? 'justify-end' : 'justify-start'}`}>
                             {formatTime(msg.timestamp)}
                             {isMe && (
                                 <span>
                                     {msg.status === 'sent' && <Check size={12} />}
                                     {msg.status === 'delivered' && <CheckCheck size={12} />}
                                     {msg.status === 'read' && <CheckCheck size={12} className="text-blue-600" />}
                                 </span>
                             )}
                         </div>
                      </div>
                   </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex justify-start w-full animate-in fade-in">
                 <div className="flex items-center gap-2">
                    <img src="https://picsum.photos/id/1025/50/50" className="w-6 h-6 rounded-full self-end" />
                    <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1">
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                    </div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-slate-100 bg-white">
             <div className="flex items-center gap-2">
                 <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                 >
                     <Paperclip size={20} />
                 </button>
                 <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*" />

                 <div className="flex-1 bg-slate-100 rounded-full flex items-center px-3 py-2 focus-within:ring-2 focus-within:ring-blue-100 transition-all relative">
                     <input 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Aa"
                        className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-slate-400"
                        autoFocus
                     />
                     <button 
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="text-slate-400 hover:text-amber-500 transition-colors"
                     >
                         <Smile size={20} />
                     </button>
                     
                     {/* Mini Emoji Picker */}
                     {showEmojiPicker && (
                         <div className="absolute bottom-12 right-0 bg-white shadow-xl border border-slate-100 rounded-xl p-2 grid grid-cols-4 gap-2 w-48 z-20">
                             {['👍', '❤️', '😂', '😮', '😢', '👋', '🐾', '🐈'].map(emoji => (
                                 <button 
                                    key={emoji} 
                                    onClick={() => { setInputValue(prev => prev + emoji); setShowEmojiPicker(false); }}
                                    className="text-xl hover:bg-slate-100 rounded p-1"
                                 >
                                     {emoji}
                                 </button>
                             ))}
                         </div>
                     )}
                 </div>

                 <button 
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-90"
                 >
                     <Send size={20} className={inputValue.trim() ? 'fill-current' : ''} />
                 </button>
             </div>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button 
        onClick={toggleChat}
        className="group relative h-14 w-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center transition-all duration-300 hover:scale-110"
      >
        {isOpen && !isMinimized ? (
           <X size={28} className="transition-transform group-hover:rotate-90" />
        ) : (
           <MessageCircle size={28} />
        )}
        
        {unreadCount > 0 && !isOpen && (
            <span className="absolute -top-1 -right-1 h-6 w-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-bounce">
                {unreadCount}
            </span>
        )}
      </button>

    </div>
  );
};

export default ChatWidget;
