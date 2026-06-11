
import React, { useState, useRef, useEffect } from 'react';
import { MOCK_FEED, MOCK_EVENTS, MOCK_CONNECTIONS, MOCK_PATIENTS_DETAILED, MOCK_PETS } from '../constants';
import { Calendar, MapPin, Users, Share2, Plus, X, Filter, MessageCircle, Copy, Heart, Image as ImageIcon, Send, ThumbsUp, MoreHorizontal, CheckCircle, ShoppingBag, AlertTriangle, Info, ArrowUpRight, Clock, Camera, Sparkles, Ticket, Flame, Megaphone, Coins, Lock, ArrowRight, UserPlus, UserCheck, UserX, Trash2, PawPrint, Activity, Shield, Syringe, Tag } from 'lucide-react';
import { Event, Post, PostType, UserRole, Connection, Comment } from '../types';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { fileToDataUrl } from '../services/image';

// --- SUB-COMPONENT: Create Post Widget ---
const CreatePostWidget = ({ onPost }: { onPost: (post: Partial<Post>) => void }) => {
    const [text, setText] = useState('');
    const [postType, setPostType] = useState<PostType>('GENERAL');
    const [isExpanded, setIsExpanded] = useState(false);
    const [image, setImage] = useState<string | undefined>(undefined);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                setImage(await fileToDataUrl(e.target.files[0]));
                setIsExpanded(true);
            } catch {
                // ignore unreadable files
            }
        }
        e.target.value = ''; // allow re-selecting the same file
    };

    const handleSubmit = () => {
        if(!text.trim() && !image) return;
        onPost({ content: text, type: postType, image });
        setText('');
        setPostType('GENERAL');
        setImage(undefined);
        setIsExpanded(false);
    };

    return (
        <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 mb-6 transition-all duration-300 ${isExpanded ? 'p-5 ring-2 ring-teal-50' : 'p-4'}`}>
            <div className="flex gap-4">
                <img src="https://picsum.photos/id/64/100/100" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                <div className="flex-1">
                    <textarea 
                        placeholder="What's on your mind?" 
                        className="w-full bg-transparent border-none p-2 text-sm focus:ring-0 outline-none resize-none placeholder:text-slate-400"
                        rows={isExpanded ? 3 : 1}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onFocus={() => setIsExpanded(true)}
                    />

                    {image && (
                        <div className="relative mt-2 rounded-xl overflow-hidden border border-slate-100 w-fit">
                            <img src={image} className="max-h-48 object-cover" />
                            <button
                                onClick={() => setImage(undefined)}
                                className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                                title="Remove image"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    {/* Hidden file inputs for image / camera */}
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                    <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageSelect} />

                    {isExpanded && (
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 gap-4 pt-3 border-t border-slate-50 animate-in fade-in">
                            <div className="flex gap-2 overflow-x-auto scrollbar-hide max-w-full pb-1">
                                {['GENERAL', 'TIP', 'ALERT', 'PROMOTION'].map(t => (
                                    <button 
                                        key={t}
                                        onClick={() => setPostType(t as PostType)}
                                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all border whitespace-nowrap ${
                                            postType === t 
                                            ? 'bg-slate-900 text-white border-slate-900' 
                                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                                <div className="flex gap-1">
                                    <button onClick={() => fileInputRef.current?.click()} title="Add photo" className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-colors"><ImageIcon size={18} /></button>
                                    <button onClick={() => cameraInputRef.current?.click()} title="Take photo" className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-colors"><Camera size={18} /></button>
                                </div>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!text.trim() && !image}
                                    className="bg-teal-600 text-white px-6 py-2 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-teal-700 disabled:opacity-50 transition-all shadow-md shadow-teal-200"
                                >
                                    Post
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- SUB-COMPONENT: Feed Post ---
const FeedPost: React.FC<{ post: Post; onNotify: (message: string) => void }> = ({ post, onNotify }) => {
    const [isLiked, setIsLiked] = useState(post.isLiked);
    const [likes, setLikes] = useState(post.likes);
    const [comments, setComments] = useState<Comment[]>(post.comments);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleLike = () => {
        setIsLiked(!isLiked);
        setLikes(prev => isLiked ? prev - 1 : prev + 1);
    };

    const handleShare = async () => {
        const shareUrl = window.location.href;
        const shareData = {
            title: `PawPortal — post by ${post.author.name}`,
            text: post.content,
            url: shareUrl,
        };
        try {
            if (typeof navigator !== 'undefined' && navigator.share) {
                await navigator.share(shareData);
            } else if (navigator.clipboard) {
                await navigator.clipboard.writeText(`${post.content}\n\n${shareUrl}`);
                onNotify('Post link copied to clipboard!');
            } else {
                onNotify('Sharing is not supported on this browser.');
            }
        } catch (err) {
            // User cancelled the native share sheet — not an error, so stay silent.
        }
    };

    const handleCopyLink = async () => {
        setMenuOpen(false);
        try {
            await navigator.clipboard.writeText(window.location.href);
            onNotify('Link copied to clipboard!');
        } catch {
            onNotify('Could not copy link.');
        }
    };

    const handleReport = () => {
        setMenuOpen(false);
        onNotify('Thanks — this post has been reported for review.');
    };

    const addComment = () => {
        if (!commentText.trim()) return;
        const newComment: Comment = {
            id: `c-${Date.now()}`,
            user: 'Jane Doe',
            avatar: 'https://picsum.photos/id/64/100/100',
            text: commentText.trim(),
            timestamp: 'Just now',
        };
        setComments(prev => [...prev, newComment]);
        setCommentText('');
    };

    const getRoleBadge = (role: UserRole) => {
        switch(role) {
            case UserRole.VET: return <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 border border-blue-100"><CheckCircle size={10} /> VET</span>;
            case UserRole.VENDOR: return <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 border border-emerald-100"><ShoppingBag size={10} /> STORE</span>;
            case UserRole.CARE_GIVER: return <span className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md text-[10px] font-bold border border-rose-100">WALKER</span>;
            default: return null;
        }
    };

    const getTypeBadge = (type: PostType) => {
        if (type === 'TIP') return <span className="text-[10px] font-bold text-purple-600 flex items-center gap-1 bg-purple-50 px-2 py-1 rounded-full border border-purple-100"><Sparkles size={12} /> PRO TIP</span>;
        if (type === 'ALERT') return <span className="text-[10px] font-bold text-red-600 flex items-center gap-1 bg-red-50 px-2 py-1 rounded-full border border-red-100 animate-pulse"><AlertTriangle size={12} /> ALERT</span>;
        if (type === 'PROMOTION') return <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100"><ShoppingBag size={12} /> DEAL</span>;
        return null;
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-4 hover:shadow-md transition-all duration-300 group">
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <img src={post.author.avatar} className="w-10 h-10 rounded-full object-cover border border-slate-100" />
                        {post.author.verified && <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-0.5 border-2 border-white"><CheckCircle size={8}/></div>}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-800 text-sm hover:underline cursor-pointer">{post.author.name}</h4>
                            {getRoleBadge(post.author.role)}
                        </div>
                        <p className="text-xs text-slate-400">{post.timestamp}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {getTypeBadge(post.type)}
                    <div className="relative">
                        <button
                            onClick={() => setMenuOpen(o => !o)}
                            className="text-slate-300 hover:text-slate-500 p-1 rounded-full hover:bg-slate-50 transition-colors"
                        >
                            <MoreHorizontal size={16}/>
                        </button>
                        {menuOpen && (
                            <>
                                {/* Click-away overlay */}
                                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                                <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20 animate-in fade-in">
                                    <button onClick={handleCopyLink} className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                                        <Copy size={14} /> Copy link
                                    </button>
                                    <button onClick={handleReport} className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2">
                                        <AlertTriangle size={14} /> Report post
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="mb-4 pl-[3.25rem]">
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{post.content}</p>
            </div>

            {/* Media / Action */}
            {post.image && (
                <div className="mb-4 ml-[3.25rem] rounded-xl overflow-hidden relative shadow-sm border border-slate-100">
                    <img src={post.image} className="w-full h-auto object-cover max-h-80 transition-transform duration-700 group-hover:scale-105" />
                    {/* Commerce Overlay for Promotions */}
                    {post.type === 'PROMOTION' && (
                         <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-12 flex justify-between items-end">
                             <div className="text-white">
                                 <p className="text-[10px] font-bold opacity-90 mb-0.5 uppercase tracking-wider">Limited Time Offer</p>
                                 {post.price && <p className="text-xl font-black text-emerald-300">PKR {post.price.toLocaleString()}</p>}
                             </div>
                             <button
                                 onClick={() => post.actionLink ? window.open(post.actionLink, '_blank', 'noopener') : onNotify('Opening deal…')}
                                 className="bg-white text-slate-900 px-4 py-2 rounded-lg font-bold text-xs hover:bg-emerald-50 transition-colors shadow-lg"
                             >
                                 {post.actionLabel || 'Shop Deal'}
                             </button>
                         </div>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-50 ml-[3.25rem]">
                <div className="flex gap-6">
                    <button 
                        onClick={toggleLike}
                        className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${isLiked ? 'text-rose-500' : 'text-slate-500 hover:text-rose-500'}`}
                    >
                        <Heart size={16} className={isLiked ? "fill-current" : ""} /> {likes}
                    </button>
                    <button
                        onClick={() => setShowComments(s => !s)}
                        className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${showComments ? 'text-blue-500' : 'text-slate-500 hover:text-blue-500'}`}
                    >
                        <MessageCircle size={16} /> {comments.length}
                    </button>
                </div>
                <button
                    onClick={handleShare}
                    title="Share post"
                    className="text-slate-400 hover:text-teal-600 p-1.5 rounded-full hover:bg-teal-50 transition-colors"
                >
                     <Share2 size={16} />
                </button>
            </div>

            {/* Comments */}
            {showComments && (
                <div className="mt-4 ml-[3.25rem] pt-4 border-t border-slate-50 animate-in fade-in space-y-3">
                    {comments.map(c => (
                        <div key={c.id} className="flex gap-2.5">
                            <img src={c.avatar} className="w-7 h-7 rounded-full object-cover border border-slate-100 flex-shrink-0" />
                            <div className="bg-slate-50 rounded-2xl px-3 py-2 flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="text-xs font-bold text-slate-700">{c.user}</p>
                                    <p className="text-[10px] text-slate-400">{c.timestamp}</p>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">{c.text}</p>
                            </div>
                        </div>
                    ))}
                    {comments.length === 0 && (
                        <p className="text-xs text-slate-400 italic">No comments yet. Be the first!</p>
                    )}

                    {/* Add comment */}
                    <div className="flex gap-2 items-center pt-1">
                        <img src="https://picsum.photos/id/64/100/100" className="w-7 h-7 rounded-full object-cover border border-slate-100 flex-shrink-0" />
                        <input
                            type="text"
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') addComment(); }}
                            placeholder="Write a comment..."
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <button
                            onClick={addComment}
                            disabled={!commentText.trim()}
                            className="p-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 disabled:opacity-40 transition-colors flex-shrink-0"
                            title="Send comment"
                        >
                            <Send size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- SUB-COMPONENT: Connection Card ---
const ConnectionCard: React.FC<{ 
    connection: Connection, 
    onAction: (id: string, action: 'ACCEPT' | 'REJECT' | 'DISCONNECT') => void,
    onViewProfile: (petId: string) => void 
}> = ({ connection, onAction, onViewProfile }) => {
    const isPending = connection.status === 'PENDING';
    const isReceiver = connection.receiverId === 'me'; // Assuming current user is 'me'

    // Only show pending cards if I am the receiver. If I am requester, show "Sent" state.
    if (isPending && !isReceiver) {
        // I sent this request
        return (
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <img src={connection.pet.image} className="w-10 h-10 rounded-full object-cover grayscale opacity-70" />
                    <div>
                        <p className="font-bold text-slate-600 text-sm">{connection.pet.name}</p>
                        <p className="text-xs text-slate-400">Request Sent</p>
                    </div>
                </div>
                <button 
                    onClick={() => onAction(connection.id, 'DISCONNECT')}
                    className="text-xs text-slate-400 hover:text-red-500 font-bold"
                >
                    Cancel
                </button>
            </div>
        )
    }

    return (
        <div 
            onClick={() => onViewProfile(connection.pet.id)}
            className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-teal-200"
        >
            <div className="flex items-center gap-3">
                <div className="relative">
                    <img src={connection.pet.image} className="w-12 h-12 rounded-full object-cover border border-slate-100 group-hover:scale-105 transition-transform" />
                    {connection.status === 'CONNECTED' && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>}
                </div>
                <div>
                    <p className="font-bold text-slate-800 text-sm group-hover:text-teal-700 transition-colors">{connection.pet.name}</p>
                    <p className="text-xs text-slate-500">{connection.pet.breed}</p>
                </div>
            </div>
            
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                {isPending ? (
                    <>
                        <button 
                            onClick={() => onAction(connection.id, 'ACCEPT')}
                            className="p-2 bg-slate-900 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                            title="Accept"
                        >
                            <UserCheck size={16} />
                        </button>
                        <button 
                            onClick={() => onAction(connection.id, 'REJECT')}
                            className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"
                            title="Decline"
                        >
                            <X size={16} />
                        </button>
                    </>
                ) : (
                    <button 
                        onClick={() => onAction(connection.id, 'DISCONNECT')}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove Connection"
                    >
                        <UserX size={16} />
                    </button>
                )}
            </div>
        </div>
    );
};

// --- SUB-COMPONENT: Network Pet Modal (Read-Only) ---
const NetworkPetModal = ({ pet, onClose }: { pet: any, onClose: () => void }) => {
    // Merge basic pet info with detailed info if available
    // In a real app, this would fetch data by ID
    const fullDetails = MOCK_PATIENTS_DETAILED.find(p => p.id === pet.id) || pet;
    
    // Safety check for required fields if they are missing in basic 'pet' object from connection
    const displayPet = {
        ...fullDetails,
        // Fallbacks
        image: fullDetails.image || 'https://via.placeholder.com/150',
        breed: fullDetails.breed || 'Unknown Breed',
        age: fullDetails.age || '?',
        gender: fullDetails.gender || 'Unknown',
        weight: fullDetails.weight || (fullDetails.vitals?.weight ? parseFloat(fullDetails.vitals.weight) : 0),
        color: fullDetails.color || 'Unknown',
        microchip: fullDetails.microchip || null,
        dietaryNotes: fullDetails.dietaryNotes || null,
        history: fullDetails.history || [],
        personality: fullDetails.personality || { tags: [] }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 relative">
                {/* Header Image */}
                <div className="h-64 relative bg-slate-100">
                    <img src={displayPet.image} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors">
                        <X size={20} />
                    </button>
                    <div className="absolute bottom-0 left-0 p-6 text-white w-full">
                        <h2 className="text-3xl font-black mb-1">{displayPet.name}</h2>
                        <p className="text-sm opacity-90 font-medium flex items-center gap-2">
                            {displayPet.breed} • {displayPet.age} Years Old
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${displayPet.gender === 'Male' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-pink-100 text-pink-700 border-pink-200'}`}>
                            {displayPet.gender}
                        </span>
                        {displayPet.personality?.tags?.map((tag: string) => (
                            <span key={tag} className="px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-full text-xs font-bold shadow-sm">
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Vitals */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Weight</p>
                            <p className="text-lg font-black text-slate-800">{displayPet.weight > 0 ? `${displayPet.weight} kg` : 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Color</p>
                            <p className="text-lg font-black text-slate-800">{displayPet.color}</p>
                        </div>
                        {displayPet.microchip && (
                            <div className="col-span-2 border-t border-slate-100 pt-2">
                                <p className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                                    <Tag size={12} /> Microchip ID
                                </p>
                                <p className="font-mono text-sm font-medium text-slate-600">{displayPet.microchip}</p>
                            </div>
                        )}
                    </div>

                    {/* Health Summary (Public Only) */}
                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                        <h4 className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2">
                            <Activity size={16} /> Health Summary
                        </h4>
                        
                        {displayPet.history && displayPet.history.length > 0 ? (
                            <div className="space-y-3">
                                {displayPet.history.slice(0, 2).map((h: any, i: number) => (
                                    <div key={i} className="flex items-start gap-2 text-xs">
                                        <div className="mt-0.5 p-1 bg-white rounded-full text-emerald-600 shadow-sm">
                                            {h.type === 'Vaccination' ? <Syringe size={10} /> : <CheckCircle size={10} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-emerald-900">{h.type}</p>
                                            <p className="text-emerald-700">{h.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-emerald-600 italic">No public health records available.</p>
                        )}
                        
                        {displayPet.dietaryNotes && (
                            <div className="mt-3 pt-3 border-t border-emerald-200/50">
                                <p className="text-xs font-bold text-emerald-800 uppercase mb-1">Notes</p>
                                <p className="text-xs text-emerald-700 leading-relaxed">{displayPet.dietaryNotes}</p>
                            </div>
                        )}
                    </div>

                    {/* Privacy Notice */}
                    <div className="flex items-center gap-2 justify-center text-[10px] text-slate-400 bg-slate-100 p-2 rounded-lg">
                        <Shield size={12} />
                        <span>Owner identity hidden for privacy</span>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-white border-t border-slate-100 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors">
                        Close
                    </button>
                    <button className="flex-1 py-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl font-bold text-sm hover:bg-rose-100 transition-colors flex items-center justify-center gap-2">
                        <Heart size={16} /> Favorite
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- SUB-COMPONENT: Event Mini Card ---
const EventMiniCard: React.FC<{ event: Event; compact?: boolean }> = ({ event, compact }) => {
    const [isAttending, setIsAttending] = useState(false);

    return (
        <div className={`bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex gap-3 hover:border-teal-200 transition-all cursor-pointer group ${compact ? 'flex-col items-start' : ''}`}>
            <div className={`w-12 h-12 bg-slate-50 rounded-lg flex flex-col items-center justify-center text-slate-700 border border-slate-100 flex-shrink-0 group-hover:bg-teal-50 group-hover:text-teal-700 transition-colors ${compact ? 'w-full h-24' : ''}`}>
                 {compact ? (
                     <img src={event.image} className="w-full h-full object-cover rounded-lg mix-blend-multiply" />
                 ) : (
                     <>
                        <span className="text-[10px] font-bold uppercase">{event.date.split(' ')[0]}</span>
                        <span className="text-lg font-black leading-none">{event.date.split(' ')[1]}</span>
                     </>
                 )}
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
                <h4 className="font-bold text-slate-800 text-sm truncate group-hover:text-teal-700 transition-colors">{event.title}</h4>
                <div className="text-xs text-slate-500 flex flex-col gap-1 mt-1">
                    <span className="flex items-center gap-1"><Clock size={10}/> {event.time}</span>
                    <span className="flex items-center gap-1"><MapPin size={10}/> {event.location}</span>
                </div>
                <div className="mt-2 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-bold">{event.attendees} going</span>
                    <button 
                        onClick={(e) => {e.stopPropagation(); setIsAttending(!isAttending);}}
                        className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors ${isAttending ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        {isAttending ? 'Going' : 'Join'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- SUB-COMPONENT: Create Event Modal ---
const CreateEventModal = ({ onClose, onCreate }: { onClose: () => void, onCreate: (e: Event) => void }) => {
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        time: '',
        location: '',
        description: '',
        category: 'Meetup',
        image: 'https://picsum.photos/id/1083/300/200'
    });

    const categories = [
        { id: 'Meetup', icon: Users },
        { id: 'Workshop', icon: Sparkles },
        { id: 'Walk', icon: MapPin },
        { id: 'Competition', icon: Ticket }
    ];

    const handleSubmit = () => {
        const newEvent: Event = {
            id: `e-${Date.now()}`,
            title: formData.title,
            date: new Date(formData.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            time: formData.time,
            location: formData.location,
            description: formData.description,
            category: formData.category as any,
            image: formData.image,
            attendees: 1,
            organizer: { name: 'You', role: 'Owner', avatar: 'https://picsum.photos/id/64/100/100' }
        };
        onCreate(newEvent);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const imageUrl = URL.createObjectURL(file);
            setFormData(prev => ({ ...prev, image: imageUrl }));
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-black text-slate-800">Host an Event</h3>
                        <p className="text-xs text-slate-500">Create a gathering for the community.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20}/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left: Form */}
                        <div className="space-y-5">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Event Title</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Golden Retriever Park Day"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-teal-500"
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Date</label>
                                    <input 
                                        type="date" 
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 outline-none focus:ring-2 focus:ring-teal-500"
                                        value={formData.date}
                                        onChange={e => setFormData({...formData, date: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Time</label>
                                    <input 
                                        type="time" 
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 outline-none focus:ring-2 focus:ring-teal-500"
                                        value={formData.time}
                                        onChange={e => setFormData({...formData, time: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Category</label>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map(cat => {
                                        const Icon = cat.icon;
                                        return (
                                            <button
                                                key={cat.id}
                                                onClick={() => setFormData({...formData, category: cat.id})}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border whitespace-nowrap transition-all ${
                                                    formData.category === cat.id 
                                                    ? 'bg-slate-800 text-white border-slate-800 shadow-md' 
                                                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                                }`}
                                            >
                                                <Icon size={14} /> {cat.id}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 text-slate-400" size={16} />
                                    <input 
                                        type="text" 
                                        placeholder="Add address or link..."
                                        className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500"
                                        value={formData.location}
                                        onChange={e => setFormData({...formData, location: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Description</label>
                                <textarea 
                                    rows={3}
                                    placeholder="What's this event about?"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* Right: Preview & Image */}
                        <div className="flex flex-col gap-4">
                            <div className="relative group rounded-2xl overflow-hidden bg-slate-100 aspect-video border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-teal-500 transition-colors">
                                <img src={formData.image} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" />
                                <div className="relative z-10 flex flex-col items-center text-slate-500 group-hover:text-teal-600">
                                    <Camera size={32} className="mb-2" />
                                    <span className="text-xs font-bold uppercase">Change Cover</span>
                                </div>
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} accept="image/*" />
                            </div>

                            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Preview Card</span>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-16 h-16 bg-teal-50 rounded-xl flex flex-col items-center justify-center text-teal-700 border border-teal-100 flex-shrink-0">
                                        <span className="text-[10px] font-bold uppercase">{formData.date ? new Date(formData.date).toLocaleString('en-US', {month:'short'}) : 'OCT'}</span>
                                        <span className="text-xl font-black leading-none">{formData.date ? new Date(formData.date).getDate() : '24'}</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{formData.title || 'Event Title'}</h4>
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{formData.location || 'Location'}</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <img src="https://picsum.photos/id/64/100/100" className="w-5 h-5 rounded-full border border-white shadow-sm" />
                                            <span className="text-[10px] text-slate-400">Hosted by You</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors">Cancel</button>
                    <button 
                        onClick={handleSubmit}
                        disabled={!formData.title}
                        className="px-8 py-2.5 bg-teal-600 text-white rounded-xl font-bold shadow-lg hover:bg-teal-700 disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                        <Sparkles size={16} /> Create Event
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- SUB-COMPONENT: Create Group Modal ---
const CreateGroupModal = ({ onClose, onCreate, balance }: { onClose: () => void, onCreate: (group: any) => void, balance: number }) => {
    const COST = 1000;
    const canAfford = balance >= COST;
    const [formData, setFormData] = useState({ 
        name: '', 
        description: '', 
        image: `https://picsum.photos/seed/${Date.now()}/200/200` 
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const imageUrl = URL.createObjectURL(file);
            setFormData(prev => ({ ...prev, image: imageUrl }));
        }
    };

    const handleSubmit = () => {
        if (!canAfford || !formData.name) return;
        onCreate(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 relative">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h3 className="text-xl font-black text-slate-800">Create New Group</h3>
                        <p className="text-xs text-slate-500">Build your own community.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400"><X size={20}/></button>
                </div>

                <div className="p-6 space-y-5">
                    <div className="flex justify-center mb-2">
                        <div 
                            className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-slate-100 shadow-sm relative group cursor-pointer hover:border-teal-500 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <img src={formData.image} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="text-white" />
                            </div>
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            className="hidden" 
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Group Name</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Downtown Dog Walkers" 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-teal-500"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                        <textarea 
                            rows={3}
                            placeholder="What is this group about?" 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    {/* Cost Summary */}
                    <div className={`p-4 rounded-xl border-2 flex justify-between items-center ${canAfford ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full text-white ${canAfford ? 'bg-emerald-500' : 'bg-red-500'}`}>
                                <Coins size={20} />
                            </div>
                            <div>
                                <p className={`text-xs font-bold uppercase ${canAfford ? 'text-emerald-700' : 'text-red-700'}`}>Creation Cost</p>
                                <p className={`font-black ${canAfford ? 'text-emerald-800' : 'text-red-800'}`}>{COST} PawPoints</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Your Balance</p>
                            <p className="font-bold text-slate-700">{balance}</p>
                        </div>
                    </div>
                    
                    {!canAfford && (
                        <div className="flex items-center gap-2 text-red-500 text-xs font-bold justify-center bg-red-50 p-2 rounded-lg">
                            <Lock size={12} /> Insufficient Funds. Earn more points to create a group.
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
                    <button 
                        onClick={handleSubmit}
                        disabled={!canAfford || !formData.name}
                        className={`flex-1 py-3 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
                            canAfford 
                            ? 'bg-slate-900 hover:bg-slate-800 hover:shadow-slate-300' 
                            : 'bg-slate-400 cursor-not-allowed'
                        }`}
                    >
                        Create Group <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---
const Community: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
  const [groups, setGroups] = useState([
       { id: 'g1', name: 'Golden Retrievers PK', members: '1.2k' },
       { id: 'g2', name: 'Cat Lovers Lahore', members: '850' },
       { id: 'g3', name: 'Raw Food Diet', members: '340' }
  ]);
  const [feedFilter, setFeedFilter] = useState<'ALL' | 'TIP' | 'PROMOTION' | 'ALERT'>('ALL');
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [pawPoints, setPawPoints] = useState(2450); // Mock Wallet Balance
  const [joinedGroups, setJoinedGroups] = useState<Set<string>>(new Set());

  const toggleJoinGroup = (id: string, name: string) => {
      setJoinedGroups(prev => {
          const next = new Set(prev);
          if (next.has(id)) { next.delete(id); notify(`Left "${name}".`); }
          else { next.add(id); notify(`Joined "${name}"!`); }
          return next;
      });
  };

  const handleCopyInvite = async () => {
      try {
          await navigator.clipboard.writeText(window.location.origin);
          notify('Invite link copied to clipboard!');
      } catch {
          notify('Could not copy invite link.');
      }
  };
  
  // Connections State
  const [connections, setConnections] = useState<Connection[]>(MOCK_CONNECTIONS);
  const pendingRequests = connections.filter(c => c.status === 'PENDING' && c.receiverId === 'me'); // Assume current user is 'me'
  const myConnections = connections.filter(c => c.status === 'CONNECTED');
  
  // Mobile Tab State
  const [activeMobileTab, setActiveMobileTab] = useState<'FEED' | 'EVENTS' | 'GROUPS' | 'CONNECTIONS'>('FEED');

  // Deletion Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string, name: string } | null>(null);
  const [toast, setToast] = useState<{ message: string, onUndo?: () => void } | null>(null);
  
  // Viewing Pet Profile Modal State
  const [viewingPetId, setViewingPetId] = useState<string | null>(null);

  // Helper to fetch pet details for the modal
  const getPetDetails = (petId: string) => {
      // 1. Try to find in mock detailed patients
      const detailed = MOCK_PATIENTS_DETAILED.find(p => p.id === petId);
      if (detailed) return detailed;
      
      // 2. Try to find in basic mock pets
      const basic = MOCK_PETS.find(p => p.id === petId);
      if (basic) return basic;
      
      // 3. Try to find in connections (fallback to basic data in connection)
      const conn = connections.find(c => c.pet.id === petId);
      if (conn) return conn.pet;
      
      return null;
  };

  // Lightweight toast helper for transient feedback (share/copy/etc.)
  const notify = (message: string) => {
      setToast({ message });
      setTimeout(() => setToast(current => (current?.message === message ? null : current)), 3000);
  };

  // Load shared community posts from the backend once we have a logged-in user.
  // If the global feed is empty, seed it once from MOCK_FEED so the first user
  // doesn't land on an empty page.
  useEffect(() => {
      if (!user) return;
      let cancelled = false;

      (async () => {
          try {
              let list = await api.list<Post>('global', 'posts');

              if (list.length === 0) {
                  // Seed the shared feed once. Strip client-only ids so the server
                  // assigns its own, then use the persisted objects in state.
                  const seeded: Post[] = [];
                  for (const item of MOCK_FEED) {
                      const { id, ...rest } = item;
                      try {
                          seeded.push(await api.create<Post>('global', 'posts', rest));
                      } catch {
                          // If seeding a single item fails, keep going.
                      }
                  }
                  list = seeded;
              }

              if (!cancelled) setPosts(list);
          } catch {
              // Backend unreachable — fall back to mock so the UI still renders.
              if (!cancelled) setPosts(MOCK_FEED);
          }
      })();

      return () => { cancelled = true; };
  }, [user]);

  const handleNewPost = (newPost: Partial<Post>) => {
      const author = {
          id: user?.id || 'me',
          name: user?.name || 'Anonymous',
          role: user?.role || UserRole.OWNER,
          avatar: user?.avatar || 'https://picsum.photos/id/64/100/100',
      };
      const post: Post = {
          id: `p-${Date.now()}`,
          author,
          type: newPost.type || 'GENERAL',
          content: newPost.content || '',
          image: newPost.image,
          timestamp: 'Just now',
          likes: 0,
          comments: []
      };

      // Optimistic: show immediately, then persist in the background and swap
      // in the server-backed object (with its real id) on success.
      setPosts(prev => [post, ...prev]);
      notify('Your post is live!');

      const { id, ...payload } = post;
      api.create<Post>('global', 'posts', payload)
          .then(saved => {
              setPosts(prev => prev.map(p => (p.id === post.id ? saved : p)));
          })
          .catch(() => {
              notify('Could not save your post. It may disappear on refresh.');
          });
  };

  const handleCreateEvent = (newEvent: Event) => {
      setEvents([newEvent, ...events]);
      setShowEventModal(false);
  };

  const handleCreateGroup = (groupData: any) => {
      if (pawPoints < 1000) return;
      
      // Transaction
      setPawPoints(prev => prev - 1000);
      
      const newGroup = {
          id: `g-${Date.now()}`,
          name: groupData.name,
          members: '1'
      };
      
      setGroups([newGroup, ...groups]);
      setShowCreateGroupModal(false);
  };

  // Connection Actions
  const performAction = (id: string, action: 'ACCEPT' | 'REJECT' | 'DISCONNECT') => {
      if (action === 'DISCONNECT' || action === 'REJECT') {
          const removedConn = connections.find(c => c.id === id);
          setConnections(prev => prev.filter(c => c.id !== id));
          
          if (action === 'DISCONNECT' && removedConn) {
               setToast({
                   message: "Pet removed from your network.",
                   onUndo: () => {
                       setConnections(prev => [...prev, removedConn]);
                       setToast(null);
                   }
               });
               // Auto hide toast
               setTimeout(() => setToast((current) => (current?.message === "Pet removed from your network." ? null : current)), 5000);
          }
      } else if (action === 'ACCEPT') {
          setConnections(prev => prev.map(c => c.id === id ? { ...c, status: 'CONNECTED' } : c));
      }
  };

  const handleConnectionAction = (id: string, action: 'ACCEPT' | 'REJECT' | 'DISCONNECT') => {
      if (action === 'DISCONNECT') {
          const conn = connections.find(c => c.id === id);
          if (conn) {
              setDeleteConfirm({ id, name: conn.pet.name });
          }
      } else {
          performAction(id, action);
      }
  };

  const filteredPosts = posts.filter(p => feedFilter === 'ALL' || p.type === feedFilter);

  const isMobile = window.innerWidth < 1024;

  const FilterPill = ({ id, label, icon: Icon }: { id: string, label: string, icon?: any }) => (
      <button
        onClick={() => setFeedFilter(id as any)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
            feedFilter === id 
            ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-105' 
            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
        }`}
      >
          {Icon && <Icon size={14} className={feedFilter === id ? 'text-white' : 'text-slate-400'} />}
          {label}
      </button>
  );

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-fade-in relative">
       
       {/* Header Section (Scrolls away) */}
       <div className="text-center py-8">
           <h2 className="text-3xl font-black text-slate-800 mb-2">Community Hub</h2>
           <p className="text-slate-500">Connect, share, and discover with local pet lovers.</p>
       </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-6 px-4 sticky top-0 z-20 md:static">
            <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 flex w-full max-w-lg overflow-x-auto scrollbar-hide">
                {['FEED', 'EVENTS', 'GROUPS', 'CONNECTIONS'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveMobileTab(tab as any)}
                        className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                            activeMobileTab === tab 
                            ? 'bg-slate-900 text-white shadow-sm' 
                            : 'text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                        {tab === 'CONNECTIONS' ? 'My Network' : tab.charAt(0) + tab.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>
        </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start px-4 md:px-0">
           
           {/* CONNECTIONS TAB CONTENT */}
           {activeMobileTab === 'CONNECTIONS' && (
               <div className="lg:col-span-3 space-y-8 animate-in fade-in">
                   {/* Pending Requests */}
                   <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                       <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                           <UserPlus size={20} className="text-amber-500" /> Pending Requests
                           {pendingRequests.length > 0 && <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs">{pendingRequests.length}</span>}
                       </h3>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                           {pendingRequests.map(conn => (
                               <ConnectionCard 
                                    key={conn.id} 
                                    connection={conn} 
                                    onAction={handleConnectionAction} 
                                    onViewProfile={() => setViewingPetId(conn.pet.id)}
                                />
                           ))}
                           {pendingRequests.length === 0 && (
                               <div className="col-span-full text-center py-8 text-slate-400 text-sm">No new requests.</div>
                           )}
                       </div>
                   </div>

                   {/* My Network */}
                   <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                       <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                           <PawPrint size={20} className="text-teal-600" /> My Pet Network
                       </h3>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                           {myConnections.map(conn => (
                               <ConnectionCard 
                                    key={conn.id} 
                                    connection={conn} 
                                    onAction={handleConnectionAction}
                                    onViewProfile={() => setViewingPetId(conn.pet.id)} 
                                />
                           ))}
                           {myConnections.length === 0 && (
                               <div className="col-span-full text-center py-8 text-slate-400 text-sm">
                                   You haven't connected with anyone yet. Visit the Directory to find friends!
                               </div>
                           )}
                       </div>
                   </div>
               </div>
           )}

           {/* FEED CONTENT */}
           <div className={`lg:col-span-2 ${activeMobileTab === 'FEED' ? 'block' : 'hidden lg:block'}`}>
               
               {/* Sticky Filter Bar */}
               <div className="sticky top-14 lg:top-0 z-10 bg-slate-50/95 backdrop-blur-md py-2 mb-6 -mx-4 px-4 md:mx-0 md:px-0 border-b border-slate-200/50 transition-all">
                   <div className="flex gap-2 overflow-x-auto scrollbar-hide no-scrollbar items-center">
                       <FilterPill id="ALL" label="All Posts" icon={Filter} />
                       <FilterPill id="TIP" label="Vet Advice" icon={Info} />
                       <FilterPill id="PROMOTION" label="Deals" icon={ShoppingBag} />
                       <FilterPill id="ALERT" label="Alerts" icon={AlertTriangle} />
                   </div>
               </div>

               <CreatePostWidget onPost={handleNewPost} />
               
               <div className="space-y-6">
                   {filteredPosts.map(post => (
                       <FeedPost key={post.id} post={post} onNotify={notify} />
                   ))}
                   {filteredPosts.length === 0 && (
                       <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                           <Filter size={48} className="mx-auto text-slate-200 mb-4" />
                           <p className="text-slate-400 font-medium">No posts found in this category.</p>
                           <button onClick={() => setFeedFilter('ALL')} className="mt-2 text-teal-600 font-bold hover:underline">View All</button>
                       </div>
                   )}
               </div>
           </div>

           {/* Right Sidebar: Widgets (1/3rd) */}
           <div className={`space-y-6 sticky top-20 ${activeMobileTab === 'EVENTS' || activeMobileTab === 'GROUPS' ? 'block' : 'hidden lg:block'}`}>
               
               {/* Invite Widget */}
               <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                   <h3 className="font-bold text-lg mb-2 relative z-10">Invite Friends</h3>
                   <p className="text-xs text-teal-100 mb-4 relative z-10">Earn PawPoints for every friend who joins the pack!</p>
                   <button onClick={handleCopyInvite} className="w-full py-3 bg-white/20 text-white border border-white/30 hover:bg-white/30 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors relative z-10">
                        <Copy size={16} /> Copy Invite Link
                   </button>
               </div>

               {/* Events Widget */}
               {(activeMobileTab === 'EVENTS' || !isMobile) && (
                   <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 animate-in fade-in">
                       <div className="flex justify-between items-center mb-4">
                           <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                               <Calendar size={14} /> Upcoming Events
                           </h3>
                           <button onClick={() => setActiveMobileTab('EVENTS')} className="text-teal-600 text-xs font-bold hover:underline">View All</button>
                       </div>
                       <div className="space-y-3">
                           {events.slice(0,3).map(e => <EventMiniCard key={e.id} event={e} />)}
                           {events.length === 0 && <p className="text-xs text-slate-400 italic text-center py-4">No upcoming events.</p>}
                       </div>
                       <button 
                            onClick={() => setShowEventModal(true)}
                            className="w-full mt-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-colors border-2 border-dashed border-slate-200 flex items-center justify-center gap-2"
                        >
                           <Plus size={14} /> Host an Event
                       </button>
                   </div>
               )}

               {/* Groups Widget */}
               {(activeMobileTab === 'GROUPS' || !isMobile) && (
                   <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 animate-in fade-in">
                       <div className="flex justify-between items-center mb-4">
                           <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                               <Users size={14} /> Popular Groups
                           </h3>
                           <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded">
                               <Coins size={10} /> {pawPoints}
                           </div>
                       </div>
                       <div className="space-y-4">
                           {groups.map((g, i) => {
                               const joined = joinedGroups.has(g.id);
                               return (
                               <div key={g.id ?? i} className="flex items-center justify-between group">
                                   <div className="flex items-center gap-3">
                                       <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-400 text-xs group-hover:bg-teal-100 group-hover:text-teal-600 transition-colors">{g.name[0]}</div>
                                       <div>
                                           <p className="text-xs font-bold text-slate-700 group-hover:text-teal-700">{g.name}</p>
                                           <p className="text-[10px] text-slate-400">{g.members} Members</p>
                                       </div>
                                   </div>
                                   <button
                                       onClick={() => toggleJoinGroup(g.id, g.name)}
                                       title={joined ? 'Leave group' : 'Join group'}
                                       className={`p-1.5 rounded-lg transition-colors ${joined ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-slate-50 hover:bg-teal-50 text-slate-400 hover:text-teal-600'}`}
                                   >
                                       {joined ? <CheckCircle size={14} /> : <Plus size={14} />}
                                   </button>
                               </div>
                               );
                           })}
                       </div>
                       <button 
                            onClick={() => setShowCreateGroupModal(true)}
                            className="w-full mt-4 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                        >
                           <Plus size={14} /> Create New Group <span className="opacity-60 font-normal">(1000 pts)</span>
                       </button>
                   </div>
               )}
           </div>

       </div>

       {/* Event Creation Modal */}
       {showEventModal && <CreateEventModal onClose={() => setShowEventModal(false)} onCreate={handleCreateEvent} />}
       
       {/* Create Group Modal */}
       {showCreateGroupModal && <CreateGroupModal onClose={() => setShowCreateGroupModal(false)} onCreate={handleCreateGroup} balance={pawPoints} />}

       {/* Deletion Confirmation Modal */}
       {deleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
                    <div className="p-6">
                        <h3 className="text-xl font-black text-slate-800 mb-2 flex items-center gap-2">
                            <AlertTriangle className="text-red-500" size={24} /> Confirm Deletion
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Are you sure you want to remove <span className="font-bold text-slate-800">{deleteConfirm.name}</span> from your network? This action cannot be undone.
                        </p>
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                        <button 
                            onClick={() => setDeleteConfirm(null)}
                            className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={() => {
                                performAction(deleteConfirm.id, 'DISCONNECT');
                                setDeleteConfirm(null);
                            }}
                            className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 shadow-lg shadow-red-200 transition-colors flex items-center justify-center gap-2"
                        >
                            <Trash2 size={16} /> Delete
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Pet Network Profile Modal */}
        {viewingPetId && (
            <NetworkPetModal 
                pet={getPetDetails(viewingPetId) || { id: viewingPetId, name: 'Unknown Pet' }}
                onClose={() => setViewingPetId(null)}
            />
        )}

        {/* Toast Notification */}
        {toast && (
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-4 animate-in slide-in-from-bottom-10 fade-in">
                <span className="text-sm font-medium">{toast.message}</span>
                {toast.onUndo && (
                    <button 
                        onClick={toast.onUndo}
                        className="text-xs font-bold text-teal-400 hover:text-teal-300 uppercase tracking-wider bg-white/10 px-2 py-1 rounded transition-colors"
                    >
                        Undo
                    </button>
                )}
            </div>
        )}
    </div>
  );
};

export default Community;
