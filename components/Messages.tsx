
import React, { useState, useRef, useEffect } from 'react';
import { Search, Phone, Video, Info, Image as ImageIcon, Mic, Send, MoreHorizontal, Plus, X, FileText, ChevronRight, Smile, Paperclip, Check, CheckCheck, Users, Stethoscope, ShoppingBag, HeartHandshake, MicOff, VideoOff, ChevronLeft, ArrowLeft, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

// --- Mock Contacts Directory (Cross-Role) ---
const MOCK_DIRECTORY = [
    { id: 'u1', name: 'Dr. Sarah Jenkins', role: 'Veterinarian', avatar: 'https://picsum.photos/id/1011/200/200', status: 'online' },
    { id: 'u2', name: 'Paws & Strides', role: 'Dog Walker', avatar: 'https://picsum.photos/id/1025/200/200', status: 'offline' },
    { id: 'u3', name: 'Downtown Pet Clinic', role: 'Clinic', avatar: 'https://picsum.photos/id/1062/200/200', status: 'online' },
    { id: 'u4', name: 'PetMart Store', role: 'Vendor', avatar: 'https://picsum.photos/id/1080/200/200', status: 'online' },
    { id: 'u5', name: 'Ali Khan', role: 'Pet Owner', avatar: 'https://picsum.photos/id/64/200/200', status: 'online' },
    { id: 'u6', name: 'Furry Styles Grooming', role: 'Groomer', avatar: 'https://picsum.photos/id/237/200/200', status: 'offline' },
];

// --- Mock Data ---
const INITIAL_CONVERSATIONS = [
  {
    id: 'c1',
    userId: 'u1',
    user: MOCK_DIRECTORY[0],
    lastMessage: 'The blood work results look good for Barnaby.',
    time: '10:30 AM',
    unread: 2,
    messages: [
      { id: 'm1', sender: 'them', text: 'Hi Jane! Just following up on the visit.', time: '10:28 AM', type: 'text', status: 'read' },
      { id: 'm2', sender: 'them', text: 'The blood work results look good for Barnaby. No signs of infection.', time: '10:30 AM', type: 'text', status: 'read' },
    ]
  },
  {
    id: 'c2',
    userId: 'u2',
    user: MOCK_DIRECTORY[1],
    lastMessage: 'Did Rex enjoy the walk today?',
    time: 'Yesterday',
    unread: 0,
    messages: [
      { id: 'm1', sender: 'me', text: 'Did Rex enjoy the walk today?', time: '4:00 PM', type: 'text', status: 'read' },
    ]
  },
  {
    id: 'c3',
    userId: 'u3',
    user: MOCK_DIRECTORY[2],
    lastMessage: 'Appointment confirmed for Tuesday.',
    time: 'Tue',
    unread: 0,
    messages: [
        { id: 'm1', sender: 'them', text: 'Appointment confirmed for Tuesday at 2:00 PM.', time: '9:00 AM', type: 'text', status: 'read' },
        { id: 'm2', sender: 'me', text: 'Great, see you then!', time: '9:05 AM', type: 'text', status: 'read' },
    ]
  }
];

const SHARED_MEDIA = [
    'https://picsum.photos/id/237/200/200',
    'https://picsum.photos/id/238/200/200',
    'https://picsum.photos/id/239/200/200',
    'https://picsum.photos/id/240/200/200',
];

interface MessagesProps {
    initialContext?: any;
}

// Local ShareMenu Component
const ShareMenu = ({ title, text, buttonLabel, className, icon }: { title: string, text: string, buttonLabel: string, className?: string, icon: React.ReactNode, variant?: string }) => {
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({ title, text });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            alert(`Shared: ${text}`);
        }
    };

    return (
        <button 
            onClick={handleShare} 
            className={`flex items-center gap-3 p-3 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors ${className}`}
        >
            {icon} {buttonLabel}
        </button>
    );
};

// --- CALLING OVERLAY COMPONENT ---
const CallOverlay = ({ user, type, onClose }: { user: any, type: 'voice' | 'video', onClose: () => void }) => {
    const [callStatus, setCallStatus] = useState('Connecting...');
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(type === 'voice');

    useEffect(() => {
        const timer = setTimeout(() => setCallStatus('Ringing...'), 1500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="fixed inset-0 z-[60] bg-slate-900 text-white flex flex-col items-center justify-center animate-in fade-in duration-300">
            {/* Background Blur Effect */}
            <div className="absolute inset-0 opacity-30 pointer-events-none">
                <img src={user.avatar} className="w-full h-full object-cover blur-3xl scale-110" />
            </div>

            <div className="relative z-10 flex flex-col items-center w-full max-w-md p-8">
                <div className="relative mb-8">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
                        <img src={user.avatar} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute inset-0 rounded-full border-4 border-white/10 animate-ping"></div>
                </div>
                
                <h2 className="text-3xl font-black mb-2 text-center">{user.name}</h2>
                <p className="text-slate-300 font-medium mb-12 flex items-center gap-2">
                    {type === 'video' ? <Video size={16} /> : <Phone size={16} />} {callStatus}
                </p>

                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => setIsMuted(!isMuted)}
                        className={`p-4 rounded-full transition-all ${isMuted ? 'bg-white text-slate-900' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                    >
                        {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                    </button>
                    
                    <button 
                        onClick={onClose}
                        className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-xl transform hover:scale-110 transition-all"
                    >
                        <Phone size={32} className="rotate-135" />
                    </button>

                    <button
                        onClick={() => setIsCameraOff(prev => !prev)}
                        className={`p-4 rounded-full transition-all ${isCameraOff ? 'bg-white text-slate-900' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                    >
                        {isCameraOff ? <VideoOff size={24} /> : <Video size={24} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Messages: React.FC<MessagesProps> = ({ initialContext }) => {
  const { user } = useAuth();
  const [activeConversationId, setActiveConversationId] = useState<string>(INITIAL_CONVERSATIONS[0].id);
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [input, setInput] = useState('');
  const [convSearch, setConvSearch] = useState('');

  // Load the user's saved inbox once, then persist on every change. Conversations
  // are stored as a single per-user document so sent messages survive a refresh.
  const loadedRef = useRef(false);
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const rows = await api.list<any>('user', 'inbox');
        if (cancelled) return;
        const saved = rows[0]?.conversations;
        if (saved && saved.length) {
          setConversations(saved);
          setActiveConversationId(saved[0].id);
        } else {
          api.create('user', 'inbox', { id: 'state', conversations: INITIAL_CONVERSATIONS }).catch(() => {});
        }
      } catch {
        // keep the in-memory defaults
      } finally {
        loadedRef.current = true;
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (!loadedRef.current) return;
    // POST upserts (server does ON CONFLICT DO UPDATE), so this saves the latest state.
    api.create('user', 'inbox', { id: 'state', conversations }).catch(() => {});
  }, [conversations]);
  const [showInfoPane, setShowInfoPane] = useState(false); 
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [activeCall, setActiveCall] = useState<{ user: any, type: 'voice' | 'video' } | null>(null);
  const [directorySearch, setDirectorySearch] = useState('');
  
  // Mobile View State: Default to false (List View) unless deep linked
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Chat customization (local, demo-only)
  const THEME_COLORS = ['bg-teal-500', 'bg-blue-500', 'bg-purple-500', 'bg-rose-500', 'bg-amber-500'];
  const QUICK_EMOJIS = ['👍', '🐾', '❤️', '😂', '🎉'];
  const [themeIndex, setThemeIndex] = useState(0);
  const [emojiIndex, setEmojiIndex] = useState(0);
  const [showMedia, setShowMedia] = useState(true);
  const [showPetActions, setShowPetActions] = useState(true);

  const showToast = (msg: string) => {
      setToast(msg);
      setTimeout(() => setToast(null), 2500);
  };

  const activeChat = conversations.find(c => c.id === activeConversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages, showMobileChat]);

  // Handle Initial Context (Navigation from other components)
  useEffect(() => {
      if (initialContext?.contact) {
          handleStartChat(initialContext.contact);
      }
  }, [initialContext]);

  const handleSend = () => {
      if (!input.trim()) return;
      
      const newMsg = {
          id: Date.now().toString(),
          sender: 'me',
          text: input,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text',
          status: 'sent'
      };

      setConversations(prev => prev.map(c => {
          if (c.id === activeConversationId) {
              return {
                  ...c,
                  messages: [...c.messages, newMsg],
                  lastMessage: input,
                  time: 'Just now'
              };
          }
          return c;
      }));
      setInput('');
  };

  const handleStartChat = (contact: any) => {
      // Check if conversation exists
      const existing = conversations.find(c => c.userId === contact.id);
      if (existing) {
          setActiveConversationId(existing.id);
      } else {
          // Create new
          const newChat = {
              id: `c-${Date.now()}`,
              userId: contact.id,
              user: contact,
              lastMessage: 'Start a conversation',
              time: 'New',
              unread: 0,
              messages: []
          };
          setConversations(prev => [newChat, ...prev]);
          setActiveConversationId(newChat.id);
      }
      setShowNewChatModal(false);
      setShowMobileChat(true); // Open chat on mobile
  };

  const handleConversationClick = (id: string) => {
      setActiveConversationId(id);
      setShowMobileChat(true);
      
      // Mark as read
      setConversations(prev => prev.map(c => 
          c.id === id ? { ...c, unread: 0 } : c
      ));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSend();
      }
  };

  const getRoleBadge = (role: string) => {
      switch(role) {
          case 'Veterinarian': return <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ml-1 border border-blue-200">Vet</span>;
          case 'Vendor': return <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ml-1 border border-emerald-200">Store</span>;
          case 'Clinic': return <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ml-1 border border-indigo-200">Clinic</span>;
          case 'Dog Walker': return <span className="bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ml-1 border border-rose-200">Walker</span>;
          default: return null;
      }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in relative">

      {/* Transient Toast */}
      {toast && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[80] bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-2">
              {toast}
          </div>
      )}

      {/* Call Overlay */}
      {activeCall && (
          <CallOverlay 
            user={activeCall.user} 
            type={activeCall.type} 
            onClose={() => setActiveCall(null)} 
          />
      )}

      {/* LEFT PANE: Conversations List */}
      <div className={`w-full md:w-80 border-r border-slate-200 flex flex-col ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-slate-100">
              <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-black text-slate-800">Chats</h2>
                  <div className="flex gap-2">
                      <button onClick={() => setShowNewChatModal(true)} className="p-2 bg-slate-900 text-white rounded-full hover:bg-slate-700 transition-colors shadow-md">
                          <Plus size={20} />
                      </button>
                  </div>
              </div>
              
              {/* Search */}
              <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search Messenger"
                    value={convSearch}
                    onChange={(e) => setConvSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:ring-2 focus:ring-teal-500 rounded-full text-sm transition-all outline-none"
                  />
              </div>
          </div>

          <div className="flex-1 overflow-y-auto">
              {conversations
                .filter(chat => {
                  const q = convSearch.trim().toLowerCase();
                  if (!q) return true;
                  return chat.user.name.toLowerCase().includes(q)
                    || chat.user.role.toLowerCase().includes(q)
                    || chat.lastMessage.toLowerCase().includes(q);
                })
                .map(chat => (
                  <div 
                    key={chat.id}
                    onClick={() => handleConversationClick(chat.id)}
                    className={`flex items-center gap-3 p-4 cursor-pointer transition-colors hover:bg-slate-50 relative border-b border-slate-50 last:border-0 ${activeConversationId === chat.id ? 'bg-teal-50/50 hover:bg-teal-50' : ''}`}
                  >
                      <div className="relative shrink-0">
                          <img src={chat.user.avatar} alt={chat.user.name} className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border border-slate-100" />
                          {chat.user.status === 'online' && (
                              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                          )}
                      </div>
                      <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-1">
                              <h4 className={`text-sm truncate flex items-center gap-1 ${chat.unread > 0 ? 'font-black text-slate-800' : 'font-bold text-slate-700'}`}>
                                  {chat.user.name}
                                  {getRoleBadge(chat.user.role)}
                              </h4>
                              <span className={`text-[10px] md:text-xs shrink-0 ${chat.unread > 0 ? 'text-teal-600 font-bold' : 'text-slate-400'}`}>{chat.time}</span>
                          </div>
                          <div className="flex justify-between items-center">
                              <p className={`text-xs md:text-sm truncate pr-2 ${chat.unread > 0 ? 'font-bold text-slate-800' : 'text-slate-500'}`}>
                                  {chat.unread > 0 ? (
                                      <span className="text-slate-900">{chat.lastMessage}</span>
                                  ) : (
                                      <span>{chat.lastMessage}</span>
                                  )}
                              </p>
                              {chat.unread > 0 && (
                                  <div className="w-5 h-5 bg-teal-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                                      {chat.unread}
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      </div>

      {/* MIDDLE PANE: Active Chat */}
      <div className={`flex-1 flex-col bg-white min-w-0 ${showMobileChat ? 'flex fixed inset-0 z-20 md:static' : 'hidden md:flex'}`}>
          {activeChat ? (
              <>
                  {/* Header */}
                  <div className="h-16 border-b border-slate-200 flex items-center justify-between px-4 shadow-sm z-10 bg-white/95 backdrop-blur-sm shrink-0">
                      <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setShowMobileChat(false)} 
                            className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                          >
                              <ArrowLeft size={20} />
                          </button>
                          
                          <div className="relative">
                               <img src={activeChat.user.avatar} className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover" />
                               {activeChat.user.status === 'online' && (
                                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                               )}
                          </div>
                          <div className="ml-1">
                              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm md:text-base leading-tight">
                                  {activeChat.user.name}
                                  <span className="hidden sm:inline-flex">{getRoleBadge(activeChat.user.role)}</span>
                              </h3>
                              <p className="text-[10px] md:text-xs text-slate-500 flex items-center gap-1 leading-tight">
                                  {activeChat.user.status === 'online' ? 'Active now' : 'Offline'}
                              </p>
                          </div>
                      </div>
                      <div className="flex items-center gap-1 md:gap-3 text-teal-600">
                          <button 
                            onClick={() => setActiveCall({ user: activeChat.user, type: 'voice' })}
                            className="p-2 hover:bg-slate-50 rounded-full transition-colors" title="Voice Call"
                          >
                              <Phone size={20} />
                          </button>
                          <button 
                            onClick={() => setActiveCall({ user: activeChat.user, type: 'video' })}
                            className="p-2 hover:bg-slate-50 rounded-full transition-colors" title="Video Call"
                          >
                              <Video size={24} />
                          </button>
                          <button 
                            onClick={() => setShowInfoPane(!showInfoPane)}
                            className={`hidden md:block p-2 rounded-full transition-colors ${showInfoPane ? 'bg-teal-50 text-teal-700' : 'hover:bg-slate-50'}`}
                          >
                              <Info size={24} />
                          </button>
                      </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white scroll-smooth pb-20 md:pb-4">
                      {/* Timestamp Separator */}
                      <div className="text-center my-4">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded-full">Today</span>
                      </div>

                      {activeChat.messages.map((msg, idx) => {
                          const isMe = msg.sender === 'me';
                          const isLast = idx === activeChat.messages.length - 1;
                          
                          return (
                              <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`flex max-w-[85%] md:max-w-[70%] gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                      {!isMe && (
                                          <img src={activeChat.user.avatar} className="w-6 h-6 md:w-8 md:h-8 rounded-full self-end mb-1" />
                                      )}
                                      
                                      <div className="group relative">
                                          <div 
                                            className={`p-3 px-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                                isMe 
                                                ? 'bg-teal-600 text-white rounded-br-none' 
                                                : 'bg-slate-100 text-slate-800 rounded-bl-none'
                                            }`}
                                          >
                                              {msg.text}
                                          </div>
                                          
                                          {/* Read Receipt & Time */}
                                          <div className={`flex items-center gap-1 mt-1 text-[10px] text-slate-300 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                              <span className="opacity-70">{msg.time}</span>
                                              {isMe && isLast && (
                                                  msg.status === 'read' ? <CheckCheck size={12} className="text-teal-500"/> : <Check size={12}/>
                                              )}
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          )
                      })}
                      <div ref={messagesEndRef} />
                  </div>

                  {/* Footer Input */}
                  <div className="p-3 bg-white border-t border-slate-100 flex items-end gap-2 shrink-0 pb-safe">
                      <div className="hidden md:flex gap-1 pb-2">
                          <button onClick={() => showToast('Attachments are not available in this demo.')} className="p-2 text-teal-600 hover:bg-slate-50 rounded-full transition-colors"><Plus size={20} /></button>
                          <button onClick={() => showToast('Photo sharing is not available in this demo.')} className="p-2 text-teal-600 hover:bg-slate-50 rounded-full transition-colors"><ImageIcon size={20} /></button>
                          <button onClick={() => showToast('Voice messages are not available in this demo.')} className="p-2 text-teal-600 hover:bg-slate-50 rounded-full transition-colors"><Mic size={20} /></button>
                      </div>

                      {/* Mobile Plus Button */}
                      <button onClick={() => showToast('Attachments are not available in this demo.')} className="md:hidden p-2 mb-1.5 text-teal-600 bg-slate-50 rounded-full">
                          <Plus size={20} />
                      </button>

                      <div className="flex-1 bg-slate-100 rounded-3xl flex items-center px-4 py-2 focus-within:ring-2 focus-within:ring-teal-100 transition-all border border-transparent focus-within:border-teal-300">
                          <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Type a message..." 
                            className="flex-1 bg-transparent border-none outline-none text-sm py-1 text-slate-800 placeholder:text-slate-500 min-w-0"
                          />
                          <button onClick={() => setInput(prev => prev + '🐾')} className="p-1 text-slate-400 hover:text-amber-500 transition-colors hidden sm:block"><Smile size={20} /></button>
                      </div>
                      
                      <button 
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="p-3 mb-0.5 bg-teal-600 text-white hover:bg-teal-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                      >
                          <Send size={18} className={input.trim() ? "fill-current" : ""} />
                      </button>
                  </div>
              </>
          ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <MessageCircle size={40} className="text-slate-300" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-700">Your Messages</h3>
                  <p className="text-sm max-w-xs mt-2">Select a chat to start messaging or start a new conversation.</p>
                  <button onClick={() => setShowNewChatModal(true)} className="mt-6 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors shadow-lg">
                      Start New Chat
                  </button>
              </div>
          )}
      </div>

      {/* RIGHT PANE: Chat Info (Collapsible, Desktop Only) */}
      {showInfoPane && activeChat && (
          <div className="hidden lg:flex w-80 border-l border-slate-200 flex-col bg-white animate-in slide-in-from-right duration-300">
              <div className="p-8 flex flex-col items-center text-center border-b border-slate-100">
                  <img src={activeChat.user.avatar} className="w-24 h-24 rounded-full object-cover mb-4 shadow-lg border-4 border-white ring-1 ring-slate-100" />
                  <h3 className="text-xl font-black text-slate-800 mb-1">{activeChat.user.name}</h3>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider">
                      {activeChat.user.role}
                  </span>
                  
                  <div className="flex gap-4 mt-6 w-full">
                      <button onClick={() => showToast(`Viewing ${activeChat.user.name}'s profile is not available in this demo.`)} className="flex-1 py-2 flex flex-col items-center gap-1 hover:bg-slate-50 rounded-xl transition-colors group">
                           <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                               <Info size={16} className="text-slate-600 group-hover:text-teal-600" />
                           </div>
                           <span className="text-[10px] font-bold text-slate-500">Profile</span>
                      </button>
                      <button onClick={() => showToast('In-conversation search is not available in this demo.')} className="flex-1 py-2 flex flex-col items-center gap-1 hover:bg-slate-50 rounded-xl transition-colors group">
                           <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                               <Search size={16} className="text-slate-600 group-hover:text-teal-600" />
                           </div>
                           <span className="text-[10px] font-bold text-slate-500">Search</span>
                      </button>
                  </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                   {/* Customize Chat */}
                   <div className="py-2">
                       <button onClick={() => setThemeIndex(prev => (prev + 1) % THEME_COLORS.length)} className="w-full flex justify-between items-center py-3 px-2 hover:bg-slate-50 rounded-lg text-sm font-bold text-slate-700 group">
                           Change Theme
                           <div className={`w-4 h-4 rounded-full shadow-sm group-hover:scale-110 transition-transform ${THEME_COLORS[themeIndex]}`}></div>
                       </button>
                       <button onClick={() => setEmojiIndex(prev => (prev + 1) % QUICK_EMOJIS.length)} className="w-full flex justify-between items-center py-3 px-2 hover:bg-slate-50 rounded-lg text-sm font-bold text-slate-700">
                           Change Emoji
                           <span>{QUICK_EMOJIS[emojiIndex]}</span>
                       </button>
                   </div>

                   {/* Media & Files */}
                   <div>
                       <button onClick={() => setShowMedia(prev => !prev)} className="w-full flex justify-between items-center py-2 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600">
                           Media & Files <ChevronRight size={14} className={`transition-transform ${showMedia ? 'rotate-90' : ''}`} />
                       </button>
                       {showMedia && (
                           <div className="grid grid-cols-3 gap-2 mt-2">
                               {SHARED_MEDIA.map((url, i) => (
                                   <img key={i} src={url} className="w-full h-20 object-cover rounded-lg hover:opacity-90 cursor-pointer" />
                               ))}
                           </div>
                       )}
                   </div>

                   {/* Pet Specific Actions */}
                   <div>
                        <button onClick={() => setShowPetActions(prev => !prev)} className="w-full flex justify-between items-center py-2 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600">
                           Pet Actions <ChevronRight size={14} className={`transition-transform ${showPetActions ? 'rotate-90' : ''}`} />
                        </button>
                        {showPetActions && (
                        <div className="space-y-2 mt-2">
                            <button onClick={() => showToast('Lab report sharing is not available in this demo.')} className="w-full flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors">
                                <FileText size={16} /> Share Lab Report
                            </button>
                             <ShareMenu 
                                 title="Payment Details"
                                 text="Here are my payment details"
                                 buttonLabel="Share Payment Details"
                                 variant="button"
                                 className="w-full"
                                 icon={<Paperclip size={16} />}
                             />
                        </div>
                        )}
                   </div>
              </div>
          </div>
      )}

      {/* NEW CHAT MODAL */}
      {showNewChatModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-bold text-lg text-slate-800">New Message</h3>
                      <button onClick={() => setShowNewChatModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><X size={20}/></button>
                  </div>
                  
                  <div className="p-4 border-b border-slate-100">
                      <div className="relative">
                          <Search className="absolute left-3 top-2.5 text-slate-400" size={18}/>
                          <input 
                            type="text" 
                            placeholder="Search people, clinics, vendors..." 
                            autoFocus
                            value={directorySearch}
                            onChange={(e) => setDirectorySearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                      </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-2">
                      {MOCK_DIRECTORY.filter(u => u.name.toLowerCase().includes(directorySearch.toLowerCase()) || u.role.toLowerCase().includes(directorySearch.toLowerCase())).map(user => (
                          <button 
                            key={user.id}
                            onClick={() => handleStartChat(user)}
                            className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors text-left group"
                          >
                              <img src={user.avatar} className="w-12 h-12 rounded-full object-cover border border-slate-100" />
                              <div className="flex-1">
                                  <h4 className="font-bold text-slate-800 text-sm group-hover:text-teal-700 transition-colors">{user.name}</h4>
                                  <div className="flex items-center gap-2 mt-0.5">
                                      {getRoleBadge(user.role) || <span className="text-[10px] font-bold text-slate-500 uppercase">{user.role}</span>}
                                      {user.status === 'online' && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" title="Online"></span>}
                                  </div>
                              </div>
                              <div className="p-2 bg-slate-100 rounded-full text-slate-400 group-hover:bg-teal-100 group-hover:text-teal-600 transition-colors">
                                  <Send size={16} />
                              </div>
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default Messages;
