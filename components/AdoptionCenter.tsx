
import React, { useState } from 'react';
import { HeartHandshake, DollarSign, Search, Filter, Plus, Camera, MapPin, CheckCircle, Heart, X, MessageCircle, Info, Tag, Eye } from 'lucide-react';
import { PetListing, Pet } from '../types';
import { MOCK_ADOPTION_LISTINGS } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { usePawData } from '../contexts/PawDataContext';

const AdoptionCenter: React.FC = () => {
    const { user } = useAuth();
    const { myPets } = usePawData();
    const [activeTab, setActiveTab] = useState<'BROWSE' | 'MY_LISTINGS'>('BROWSE');
    const [listings, setListings] = useState<PetListing[]>(MOCK_ADOPTION_LISTINGS);
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // Filters
    const [filterType, setFilterType] = useState<'ALL' | 'ADOPTION' | 'SALE'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    // Create Listing Form
    const [newListing, setNewListing] = useState<Partial<PetListing>>({
        type: 'ADOPTION',
        images: [],
        price: 0
    });
    const [selectedPetForListing, setSelectedPetForListing] = useState<string>('');

    // Saved listings + transient toast
    const [savedListings, setSavedListings] = useState<string[]>([]);
    const [toast, setToast] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2500);
    };

    const toggleSaved = (id: string) => {
        setSavedListings(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
    };

    const filteredListings = listings.filter(l => {
        const matchesType = filterType === 'ALL' || l.type === filterType;
        const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              l.petDetails.breed?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              l.owner.location.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
    });

    const handleCreateListing = () => {
        if (!selectedPetForListing || !newListing.title) return;
        
        const pet = myPets.find(p => p.id === selectedPetForListing);

        const created: PetListing = {
            id: `l-${Date.now()}`,
            petId: selectedPetForListing,
            type: newListing.type || 'ADOPTION',
            price: newListing.price || 0,
            title: newListing.title || `Rehoming ${pet?.name}`,
            description: newListing.description || '',
            reason: newListing.reason || 'Personal',
            images: newListing.images?.length ? newListing.images : [pet?.image || 'https://via.placeholder.com/150'],
            status: 'AVAILABLE',
            owner: { id: 'me', name: user?.name || 'You', avatar: user?.avatar || 'https://picsum.photos/id/64/100/100', verified: true, location: 'Karachi' },
            stats: { views: 0, saves: 0 },
            petDetails: pet || {}
        };

        setListings([created, ...listings]);
        setShowCreateModal(false);
        setNewListing({ type: 'ADOPTION', images: [], price: 0 });
        setSelectedPetForListing('');
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
             <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-800">Adoption & Rehoming</h2>
                    <p className="text-slate-500 font-medium">Find a new best friend or find a loving home for a pet.</p>
                </div>
                <div className="flex gap-3 bg-white p-1.5 rounded-xl shadow-sm border border-slate-200">
                    <button 
                        onClick={() => setActiveTab('BROWSE')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'BROWSE' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        Browse Pets
                    </button>
                    <button 
                        onClick={() => setActiveTab('MY_LISTINGS')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'MY_LISTINGS' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        My Listings
                    </button>
                </div>
            </div>

            {/* --- BROWSE TAB --- */}
            {activeTab === 'BROWSE' && (
                <div className="space-y-6">
                    {/* Filters */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                         <div className="flex gap-2">
                             {['ALL', 'ADOPTION', 'SALE'].map(t => (
                                 <button 
                                    key={t}
                                    onClick={() => setFilterType(t as any)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                                        filterType === t 
                                        ? 'bg-teal-50 border-teal-500 text-teal-700' 
                                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                    }`}
                                 >
                                     {t === 'ALL' ? 'All Listings' : t === 'ADOPTION' ? 'For Adoption' : 'For Sale'}
                                 </button>
                             ))}
                         </div>
                         <div className="relative w-full md:w-80">
                             <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                             <input 
                                type="text" 
                                placeholder="Search breed, location..." 
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                             />
                         </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredListings.map(listing => (
                            <div key={listing.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden flex flex-col">
                                <div className="relative h-56 bg-slate-100">
                                    <img src={listing.images[0]} className="w-full h-full object-cover" />
                                    <div className="absolute top-3 left-3">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm border ${
                                            listing.type === 'ADOPTION' 
                                            ? 'bg-teal-500 text-white border-teal-600' 
                                            : 'bg-purple-500 text-white border-purple-600'
                                        }`}>
                                            {listing.type}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                                        <MapPin size={12} /> {listing.owner.location}
                                    </div>
                                    <button
                                        onClick={() => toggleSaved(listing.id)}
                                        className={`absolute top-3 right-3 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-white transition-colors ${savedListings.includes(listing.id) ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}>
                                        <Heart size={16} fill={savedListings.includes(listing.id) ? 'currentColor' : 'none'} />
                                    </button>
                                </div>
                                
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-black text-lg text-slate-800 line-clamp-1">{listing.title}</h3>
                                            <p className="text-sm text-slate-500 font-medium">{listing.petDetails.breed} • {listing.petDetails.age} Years</p>
                                        </div>
                                        <div className="text-right">
                                            {listing.price > 0 ? (
                                                <span className="block font-black text-lg text-slate-900">PKR {listing.price.toLocaleString()}</span>
                                            ) : (
                                                <span className="block font-black text-lg text-teal-600">Free</span>
                                            )}
                                            {listing.type === 'ADOPTION' && <span className="text-[10px] text-slate-400 uppercase font-bold">Adoption Fee</span>}
                                        </div>
                                    </div>
                                    
                                    <p className="text-slate-600 text-sm line-clamp-2 mb-4 flex-1">{listing.description}</p>
                                    
                                    <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
                                        <div className="flex items-center gap-2">
                                            <img src={listing.owner.avatar} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                                            <span className="text-xs font-bold text-slate-700">{listing.owner.name}</span>
                                        </div>
                                        <button
                                            onClick={() => showToast(`Message request sent to ${listing.owner.name}.`)}
                                            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-2">
                                            Contact <MessageCircle size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- MY LISTINGS TAB --- */}
            {activeTab === 'MY_LISTINGS' && (
                <div className="space-y-6">
                     <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-8 text-center">
                         <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600 shadow-sm">
                             <HeartHandshake size={32} />
                         </div>
                         <h3 className="text-2xl font-black text-indigo-900 mb-2">Rehome a Pet</h3>
                         <p className="text-indigo-700 max-w-md mx-auto mb-6">Create a listing to find a loving new home for your pet. You can choose to list for adoption or sale.</p>
                         <button 
                            onClick={() => setShowCreateModal(true)}
                            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2 mx-auto"
                         >
                             <Plus size={18} /> Create New Listing
                         </button>
                     </div>

                     <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                         <div className="p-6 border-b border-slate-100">
                             <h3 className="font-bold text-lg text-slate-800">Active Listings</h3>
                         </div>
                         <div className="divide-y divide-slate-100">
                             {listings.filter(l => l.owner.id === 'me').length > 0 ? (
                                 listings.filter(l => l.owner.id === 'me').map(listing => (
                                     <div key={listing.id} className="p-4 flex items-center gap-4">
                                         <img src={listing.images[0]} className="w-16 h-16 rounded-xl object-cover bg-slate-100" />
                                         <div className="flex-1">
                                             <h4 className="font-bold text-slate-800">{listing.title}</h4>
                                             <div className="flex items-center gap-3 mt-1">
                                                 <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${listing.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{listing.status}</span>
                                                 <span className="text-xs text-slate-500 flex items-center gap-1"><Eye size={12}/> {listing.stats.views} Views</span>
                                             </div>
                                         </div>
                                         <div className="font-bold text-slate-900">
                                             {listing.price > 0 ? `PKR ${listing.price}` : 'Free'}
                                         </div>
                                     </div>
                                 ))
                             ) : (
                                 <div className="p-8 text-center text-slate-400 text-sm">No active listings found.</div>
                             )}
                         </div>
                     </div>
                </div>
            )}

            {/* Create Listing Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white w-full max-w-xl rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 relative flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                             <h3 className="text-2xl font-black text-slate-800">List a Pet</h3>
                             <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><X size={20}/></button>
                        </div>
                        
                        <div className="space-y-5 overflow-y-auto flex-1 pr-2">
                             {/* Pet Selector */}
                             <div>
                                 <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Select Pet</label>
                                 <div className="grid grid-cols-2 gap-3">
                                     {myPets.length === 0 && (
                                         <p className="col-span-2 text-xs text-slate-400 text-center py-4">You have no pets yet. Add a pet to create a listing.</p>
                                     )}
                                     {myPets.map(pet => (
                                         <div 
                                            key={pet.id}
                                            onClick={() => setSelectedPetForListing(pet.id)}
                                            className={`p-3 rounded-xl border-2 cursor-pointer flex items-center gap-3 transition-all ${selectedPetForListing === pet.id ? 'border-teal-500 bg-teal-50' : 'border-slate-100 hover:border-slate-300'}`}
                                         >
                                             <img src={pet.image} className="w-10 h-10 rounded-full object-cover" />
                                             <div>
                                                 <p className="font-bold text-sm text-slate-800">{pet.name}</p>
                                                 <p className="text-xs text-slate-500">{pet.breed}</p>
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             </div>

                             {/* Listing Type */}
                             <div className="grid grid-cols-2 gap-4">
                                 <button 
                                    onClick={() => setNewListing({...newListing, type: 'ADOPTION'})}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${newListing.type === 'ADOPTION' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-100 text-slate-500'}`}
                                 >
                                     <HeartHandshake size={24} />
                                     <span className="font-bold text-sm">Adoption</span>
                                 </button>
                                 <button 
                                    onClick={() => setNewListing({...newListing, type: 'SALE'})}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${newListing.type === 'SALE' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-100 text-slate-500'}`}
                                 >
                                     <DollarSign size={24} />
                                     <span className="font-bold text-sm">Sale</span>
                                 </button>
                             </div>

                             {/* Price */}
                             <div>
                                 <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                                     {newListing.type === 'ADOPTION' ? 'Rehoming Fee (Optional)' : 'Selling Price (PKR)'}
                                 </label>
                                 <input 
                                    type="number" 
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-teal-500"
                                    placeholder="0"
                                    onChange={(e) => setNewListing({...newListing, price: parseInt(e.target.value) || 0})}
                                 />
                             </div>

                             {/* Details */}
                             <div>
                                 <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Listing Title</label>
                                 <input 
                                    type="text" 
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:ring-2 focus:ring-teal-500"
                                    placeholder="e.g. Loving Lab needs new home"
                                    onChange={(e) => setNewListing({...newListing, title: e.target.value})}
                                 />
                             </div>
                              <div>
                                 <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Reason for Rehoming</label>
                                 <select 
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:ring-2 focus:ring-teal-500"
                                    onChange={(e) => setNewListing({...newListing, reason: e.target.value})}
                                 >
                                     <option>Moving / Relocation</option>
                                     <option>New Baby / Allergy</option>
                                     <option>Cannot afford care</option>
                                     <option>Behavioral Issues</option>
                                     <option>Litter of Puppies/Kittens</option>
                                     <option>Other</option>
                                 </select>
                             </div>
                             <div>
                                 <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Description</label>
                                 <textarea 
                                    rows={3}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                                    placeholder="Tell us about their personality, habits, and what kind of home they need..."
                                    onChange={(e) => setNewListing({...newListing, description: e.target.value})}
                                 />
                             </div>
                             
                             {/* Alert */}
                             <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3">
                                 <Info className="text-amber-600 flex-shrink-0" size={20} />
                                 <p className="text-xs text-amber-800 leading-relaxed">
                                     <strong>Responsible Rehoming:</strong> Please vet potential adopters carefully. We recommend meeting in a public place and asking for references.
                                 </p>
                             </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 mt-2">
                            <button 
                                onClick={handleCreateListing}
                                disabled={!selectedPetForListing || !newListing.title}
                                className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Publish Listing
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl z-[60] animate-in slide-in-from-bottom-5 fade-in flex items-center gap-3">
                    <CheckCircle size={20} className="text-emerald-400" />
                    <p className="text-sm font-bold">{toast}</p>
                </div>
            )}
        </div>
    );
};

export default AdoptionCenter;
