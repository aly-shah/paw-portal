
import React, { useState, useEffect } from 'react';
import { MOCK_PETS, MOCK_CONNECTIONS } from '../constants';
import { Pet, Connection } from '../types';
import { Search, Heart, User, PawPrint, Info, X, UserPlus, CheckCircle, Clock } from 'lucide-react';

const PetDirectory: React.FC = () => {
    const [publicPets, setPublicPets] = useState<Pet[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<'ALL' | 'DOG' | 'CAT' | 'OTHER'>('ALL');
    const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
    const [likedPets, setLikedPets] = useState<string[]>([]);
    
    // Simulate current user ID (normally from auth context)
    const CURRENT_USER_ID = 'me'; 
    const [connections, setConnections] = useState<Connection[]>(MOCK_CONNECTIONS);

    useEffect(() => {
        // In a real app, this would be an API call fetching where isPublic = true
        const filtered = MOCK_PETS.filter(p => p.isPublic);
        setPublicPets(filtered);
    }, []);

    const handleLike = (e: React.MouseEvent, petId: string) => {
        e.stopPropagation();
        setLikedPets(prev => prev.includes(petId) ? prev.filter(id => id !== petId) : [...prev, petId]);
    };

    const handleConnect = (pet: Pet) => {
        if (!pet.owner) return;
        
        // Add pending connection
        const newConnection: Connection = {
            id: `c-${Date.now()}`,
            requesterId: CURRENT_USER_ID,
            receiverId: pet.owner.id,
            status: 'PENDING',
            timestamp: 'Just now',
            // In the real app, we'd select WHICH of my pets is connecting.
            // For now, we simulate sending a request TO the target pet.
            pet: { 
                id: pet.id,
                name: pet.name,
                image: pet.image,
                breed: pet.breed,
                type: pet.type
            }
        };
        
        setConnections(prev => [...prev, newConnection]);
    };

    const getConnectionStatus = (ownerId: string): 'NONE' | 'PENDING' | 'CONNECTED' => {
        if (ownerId === CURRENT_USER_ID) return 'CONNECTED'; // Can't connect to self, treat as connected
        
        const conn = connections.find(c => 
            (c.requesterId === CURRENT_USER_ID && c.receiverId === ownerId) || 
            (c.requesterId === ownerId && c.receiverId === CURRENT_USER_ID)
        );
        
        if (!conn) return 'NONE';
        if (conn.status === 'CONNECTED') return 'CONNECTED';
        return 'PENDING';
    };

    const filteredList = publicPets.filter(pet => {
        const matchesSearch = pet.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              pet.breed.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === 'ALL' 
            ? true 
            : activeFilter === 'OTHER' 
                ? (pet.type !== 'Dog' && pet.type !== 'Cat')
                : pet.type.toUpperCase() === activeFilter;
        return matchesSearch && matchesFilter;
    });

    const PetProfileModal = ({ pet, onClose }: { pet: Pet, onClose: () => void }) => {
        const isLiked = likedPets.includes(pet.id);
        const connectionStatus = getConnectionStatus(pet.owner?.id || '');

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
                    {/* Header Image */}
                    <div className="h-64 relative bg-slate-100">
                        <img src={pet.image} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors">
                            <X size={20} />
                        </button>
                        <div className="absolute bottom-0 left-0 p-6 text-white w-full">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h2 className="text-3xl font-black mb-1">{pet.name}</h2>
                                    <p className="text-sm opacity-90 font-medium flex items-center gap-2">
                                        {pet.breed} • {pet.age} Years Old
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={(e) => handleLike(e, pet.id)}
                                        className={`p-3 rounded-full backdrop-blur-md transition-all ${isLiked ? 'bg-rose-500 text-white shadow-lg' : 'bg-white/20 text-white hover:bg-white/30'}`}
                                    >
                                        <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto bg-slate-50 flex-1 space-y-6">
                        {/* Key Traits */}
                        <div className="flex flex-wrap gap-2">
                            {pet.gender && (
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${pet.gender === 'Male' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-pink-100 text-pink-700 border-pink-200'}`}>
                                    {pet.gender}
                                </span>
                            )}
                            {pet.personality?.tags?.map(tag => (
                                <span key={tag} className="px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-full text-xs font-bold">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* About Section */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <Info size={16} className="text-teal-500" /> About {pet.name}
                            </h4>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm border-b border-slate-50 pb-2">
                                    <span className="text-slate-500">Color</span>
                                    <span className="font-medium text-slate-700">{pet.color || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between text-sm border-b border-slate-50 pb-2">
                                    <span className="text-slate-500">Energy Level</span>
                                    <span className="font-medium text-slate-700">{pet.personality?.energyLevel || 'Unknown'}</span>
                                </div>
                                {pet.dynamicDetails?.favorites && pet.dynamicDetails.favorites.length > 0 && (
                                    <div className="pt-1">
                                        <span className="text-slate-500 text-sm block mb-2">Loves</span>
                                        <div className="flex flex-wrap gap-1">
                                            {pet.dynamicDetails.favorites.map((fav: string) => (
                                                <span key={fav} className="text-[10px] bg-rose-50 text-rose-600 px-2 py-1 rounded-md font-bold">{fav}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Owner & Connect */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold border-2 border-white shadow-sm overflow-hidden">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Pet Parent</p>
                                    <p className="font-bold text-slate-800 italic">Private Profile</p>
                                </div>
                            </div>
                            
                            {connectionStatus === 'CONNECTED' ? (
                                <button disabled className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 bg-emerald-100 text-emerald-700 cursor-default border border-emerald-200">
                                    <CheckCircle size={14} /> Connected
                                </button>
                            ) : connectionStatus === 'PENDING' ? (
                                <button disabled className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 bg-amber-100 text-amber-700 cursor-default border border-amber-200">
                                    <Clock size={14} /> Request Sent
                                </button>
                            ) : (
                                <button 
                                    onClick={() => handleConnect(pet)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all bg-slate-900 text-white hover:bg-slate-800 shadow-md"
                                >
                                    <UserPlus size={14} /> Add to Network
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            {/* Header */}
            <div className="text-center py-6">
                <h2 className="text-3xl font-black text-slate-800 mb-2">Pet Directory</h2>
                <p className="text-slate-500 font-medium">Discover and connect with pets in your community.</p>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-10">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by name or breed..." 
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                    {['ALL', 'DOG', 'CAT', 'OTHER'].map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter as any)}
                            className={`px-5 py-2 rounded-full text-xs font-bold border transition-all whitespace-nowrap ${
                                activeFilter === filter 
                                ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            {filter === 'ALL' ? 'All Pets' : filter.charAt(0) + filter.slice(1).toLowerCase() + 's'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredList.map(pet => {
                    const isLiked = likedPets.includes(pet.id);
                    return (
                        <div 
                            key={pet.id} 
                            onClick={() => setSelectedPet(pet)}
                            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-teal-200 hover:-translate-y-1 transition-all cursor-pointer group flex flex-col h-full relative"
                        >
                            <div className="relative h-60 overflow-hidden">
                                <img src={pet.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold text-slate-700 shadow-sm flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Public
                                </div>
                                <button 
                                    onClick={(e) => handleLike(e, pet.id)}
                                    className={`absolute top-3 right-3 p-2 rounded-full shadow-md backdrop-blur-md transition-all ${
                                        isLiked ? 'bg-rose-500 text-white' : 'bg-white/80 text-slate-400 hover:text-rose-500 hover:bg-white'
                                    }`}
                                >
                                    <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
                                </button>
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
                                    <h3 className="text-white font-black text-xl leading-none mb-1">{pet.name}</h3>
                                    <p className="text-white/80 text-xs font-medium">{pet.breed}, {pet.age}y</p>
                                </div>
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {pet.personality?.tags?.slice(0, 3).map(tag => (
                                        <span key={tag} className="px-2 py-1 bg-slate-50 text-slate-600 rounded-md text-[10px] font-bold border border-slate-100">
                                            {tag}
                                        </span>
                                    ))}
                                    {(pet.personality?.tags?.length || 0) > 3 && (
                                        <span className="px-2 py-1 bg-slate-50 text-slate-400 rounded-md text-[10px] font-bold border border-slate-100">+{pet.personality!.tags!.length - 3}</span>
                                    )}
                                </div>
                                <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                                    <span className="flex items-center gap-1"><PawPrint size={12} /> {pet.type}</span>
                                    <span className="text-teal-600 group-hover:underline">View Profile</span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {filteredList.length === 0 && (
                <div className="py-20 text-center text-slate-400">
                    <Search size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-medium">No public pets found matching your criteria.</p>
                    <button onClick={() => {setSearchTerm(''); setActiveFilter('ALL')}} className="mt-2 text-teal-600 font-bold text-sm hover:underline">Clear Filters</button>
                </div>
            )}

            {selectedPet && <PetProfileModal pet={selectedPet} onClose={() => setSelectedPet(null)} />}
        </div>
    );
};

export default PetDirectory;
