import React, { useState, useRef, useEffect } from 'react';
import { Pet, PetListing } from '../types';
import { PET_TAXONOMY, PET_PERSONALITY_TRAITS, PET_FAVORITES_SUGGESTIONS } from '../constants';
import { Search, Edit2, Save, Camera, Eye, Sparkles, Trash2, Activity, Smile, Dna, HeartHandshake, Tag, Shield, Calendar, Utensils, AlertCircle, Check, Plus, X, Heart, Palette, DollarSign, Home, Users, CheckCircle, ArrowRight, BarChart2 } from 'lucide-react';
import HeritageDashboard from './genetics/HeritageDashboard';
import AdoptionCenter from './AdoptionCenter';
import { usePawData } from '../contexts/PawDataContext';
import { fileToDataUrl } from '../services/image';

const PetProfileManager: React.FC = () => {
  const { myPets: pets, addPet, updatePet, deletePet } = usePawData();
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'HERITAGE' | 'ADOPTION'>('PROFILE');
  const [isMicrochipped, setIsMicrochipped] = useState(false);
  
  // Rehome Modal State
  const [showRehomeModal, setShowRehomeModal] = useState(false);
  const [activeListing, setActiveListing] = useState<any>(null); // Simulating a fetched listing
  const [rehomeStep, setRehomeStep] = useState(1);
  const [rehomeData, setRehomeData] = useState({
      type: 'ADOPTION',
      price: 0,
      reason: 'Relocation',
      description: '',
      preferences: [] as string[]
  });

  // When true, the form represents a brand-new pet not yet persisted. Saving
  // calls addPet(...); cancelling discards it without touching the API.
  const [isCreating, setIsCreating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Pet>>({});
  const [customTagInput, setCustomTagInput] = useState('');
  const [customFavInput, setCustomFavInput] = useState('');

  const selectedPet = isCreating
    ? (formData as Pet)
    : pets.find(p => p.id === selectedPetId);
  const hasHeritage = selectedPet && (selectedPet.type === 'Dog' || selectedPet.type === 'Cat');

  // Home Preference Options
  const HOME_PREFERENCES = [
      "Fenced Yard Required", 
      "No Small Children", 
      "No Other Pets", 
      "Active Lifestyle", 
      "Experience with Breed", 
      "Apartment Friendly",
      "Work from Home Preferred"
  ];

  // Auto-select the first pet once pets load from the API (or after a deletion
  // leaves the current selection invalid).
  useEffect(() => {
      // Don't interfere while the user is drafting a brand-new (unsaved) pet.
      if (isCreating) return;
      if (pets.length === 0) {
          if (selectedPetId !== null) setSelectedPetId(null);
          return;
      }
      if (!selectedPetId || !pets.some(p => p.id === selectedPetId)) {
          setSelectedPetId(pets[0].id);
      }
  }, [pets, selectedPetId, isCreating]);

  useEffect(() => {
      // Skip while drafting a new pet — its formData is managed by the create flow.
      if (isCreating) return;
      const pet = pets.find(p => p.id === selectedPetId);
      if (pet) {
          setFormData({ ...pet });
          setIsMicrochipped(!!pet.microchip);
          setIsEditing(false);
          // Reset listing state when switching pets (mock)
          setActiveListing(null);
          setRehomeStep(1);
          setRehomeData({ type: 'ADOPTION', price: 0, reason: 'Relocation', description: '', preferences: [] });
      }
  }, [selectedPetId]);

  const handleSelectPet = (pet: Pet) => {
    setIsCreating(false);
    setSelectedPetId(pet.id);
    setActiveTab('PROFILE');
  };

  const handleCancelEdit = () => {
    if (isCreating) {
      // Discard the unsaved new pet and fall back to the existing pack.
      setIsCreating(false);
      setSelectedPetId(pets[0]?.id || null);
    }
    setIsEditing(false);
  };

  const handleSave = () => {
    if (isCreating) {
      const newPet = { ...formData } as Pet;
      addPet(newPet);
      setIsCreating(false);
      setSelectedPetId(newPet.id);
    } else {
      if (!selectedPetId) return;
      updatePet({ ...selectedPet, ...formData } as Pet);
    }
    setIsEditing(false);
  };

  const handleDeletePet = () => {
    if (isCreating) {
      // Nothing persisted yet — just drop the draft.
      handleCancelEdit();
      return;
    }
    if (!selectedPetId) return;
    if (!confirm('Delete pet? This cannot be undone.')) return;
    const remaining = pets.filter(p => p.id !== selectedPetId);
    deletePet(selectedPetId);
    setSelectedPetId(remaining[0]?.id || null);
    setIsEditing(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        try {
            const dataUrl = await fileToDataUrl(e.target.files[0]);
            setFormData(prev => ({ ...prev, image: dataUrl }));
        } catch {
            // ignore unreadable files
        }
    }
  };

  const handleCreateNewPet = () => {
      const newId = `pet-${Date.now()}`;
      const newPet: Pet = {
          id: newId,
          name: 'New Pet',
          type: 'Dog',
          breed: 'Unknown',
          age: 0,
          weight: 0,
          image: 'https://via.placeholder.com/150',
          gender: 'Male',
          history: [],
          color: 'Amber',
          personality: { energyLevel: 'Medium', trainability: 'Moderate', tags: [] },
          dynamicDetails: { favorites: [] }
      };
      // Hold the new pet as a local draft; it is persisted via addPet on Save.
      setIsCreating(true);
      setSelectedPetId(null);
      setActiveTab('PROFILE');
      setIsEditing(true);
      setIsMicrochipped(false);
      setFormData(newPet);
  };

  // --- LOGIC: Trait Management ---
  const toggleTrait = (trait: string) => {
      setFormData(prev => {
          const currentTags = prev.personality?.tags || [];
          const newTags = currentTags.includes(trait) 
              ? currentTags.filter(t => t !== trait) 
              : [...currentTags, trait];
          return { ...prev, personality: { ...prev.personality, tags: newTags } as any };
      });
  };

  const addCustomTag = () => {
      if (customTagInput.trim() && !formData.personality?.tags?.includes(customTagInput.trim())) {
          setFormData(prev => ({
              ...prev,
              personality: { ...prev.personality, tags: [...(prev.personality?.tags || []), customTagInput.trim()] } as any
          }));
          setCustomTagInput('');
      }
  };

  const toggleFavorite = (fav: string) => {
      setFormData(prev => {
          const currentFavs = prev.dynamicDetails?.favorites || [];
          const newFavs = currentFavs.includes(fav)
              ? currentFavs.filter((f: string) => f !== fav)
              : [...currentFavs, fav];
          return { ...prev, dynamicDetails: { ...prev.dynamicDetails, favorites: newFavs } };
      });
  };

  const addCustomFavorite = () => {
      if (customFavInput.trim()) {
          toggleFavorite(customFavInput.trim());
          setCustomFavInput('');
      }
  };

  // --- LOGIC: Rehome Wizard ---
  const toggleRehomePreference = (pref: string) => {
      setRehomeData(prev => {
          const current = prev.preferences;
          return current.includes(pref) 
            ? { ...prev, preferences: current.filter(p => p !== pref) }
            : { ...prev, preferences: [...current, pref] };
      });
  };

  const handlePublishListing = () => {
      setActiveListing({
          id: `L-${Date.now()}`,
          ...rehomeData,
          status: 'Active',
          views: 0,
          inquiries: 0
      });
      setShowRehomeModal(false);
  };

  // --- LOGIC: Wellness Score Calculation ---
  const calculateWellness = (pet: Pet) => {
      let score = 0;
      let missing: string[] = [];

      if (pet.image && !pet.image.includes('placeholder')) score += 20; else missing.push("Profile Photo");
      if (pet.microchip) score += 20; else missing.push("Microchip ID");
      if (pet.weight > 0) score += 20; else missing.push("Weight Record");
      if (pet.personality?.tags && pet.personality.tags.length > 0) score += 20; else missing.push("Personality Tags");
      if (pet.dietaryNotes) score += 10;
      if (pet.neutered !== undefined) score += 10;

      return { score, missing };
  };

  const filteredPets = pets.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // --- SUB-COMPONENT: Read-Only Profile View ---
  const ReadOnlyProfile = () => {
      if (!selectedPet) return null;

      const { score, missing } = calculateWellness(selectedPet);
      
      // Theme Colors
      const themeColors: Record<string, string> = {
          'Amber': 'from-amber-50 to-orange-50 border-amber-100 text-amber-900',
          'Blue': 'from-blue-50 to-indigo-50 border-blue-100 text-blue-900',
          'Teal': 'from-teal-50 to-emerald-50 border-teal-100 text-teal-900',
          'Rose': 'from-rose-50 to-pink-50 border-rose-100 text-rose-900',
          'Indigo': 'from-indigo-50 to-violet-50 border-indigo-100 text-indigo-900'
      };
      
      const theme = themeColors[selectedPet.color || 'Amber'] || themeColors['Amber'];
      const accentColor = theme.split(' ')[3]; // text-color-900

      return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              
              {/* Top Row: Core Vitals & Wellness */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Vitals Card */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                              <Activity size={14} className="text-rose-500" /> Vitals
                          </h4>
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                              Last: {selectedPet.lastVisit || 'N/A'}
                          </span>
                      </div>
                      <div className="space-y-4">
                          <div className="flex items-end justify-between">
                              <div>
                                  <p className="text-slate-500 text-xs mb-0.5">Weight</p>
                                  <p className="text-xl font-black text-slate-800">{selectedPet.weight} <span className="text-sm font-medium text-slate-400">kg</span></p>
                              </div>
                              <div className="h-8 w-20">
                                  <svg viewBox="0 0 100 40" className="w-full h-full text-emerald-500 stroke-current fill-none" strokeWidth="3">
                                      <path d="M0,35 Q25,30 50,20 T100,5" />
                                  </svg>
                              </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50">
                              <div>
                                  <p className="text-slate-500 text-xs">Microchip</p>
                                  <p className="font-mono text-sm font-bold text-slate-700">{selectedPet.microchip || '—'}</p>
                              </div>
                              <div>
                                  <p className="text-slate-500 text-xs">Status</p>
                                  <p className="text-sm font-bold text-slate-700">{selectedPet.neutered ? 'Neutered' : 'Intact'}</p>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Personality Card (Themed) */}
                  <div className={`bg-gradient-to-br ${theme.split(' ').slice(0,2).join(' ')} p-5 rounded-2xl border ${theme.split(' ')[2]}`}>
                      <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 mb-4 ${accentColor} opacity-70`}>
                          <Smile size={14} /> Temperament
                      </h4>
                      
                      <div className="space-y-3">
                          <div className="flex flex-wrap gap-1.5">
                              {selectedPet.personality?.tags?.map(tag => (
                                  <span key={tag} className="px-2.5 py-1 bg-white/60 backdrop-blur-sm rounded-lg text-[11px] font-bold border border-white/50 shadow-sm text-slate-700">
                                      {tag}
                                  </span>
                              ))}
                              {(!selectedPet.personality?.tags || selectedPet.personality.tags.length === 0) && (
                                  <span className="text-xs opacity-60 italic">No traits selected.</span>
                              )}
                          </div>

                          {selectedPet.dynamicDetails?.favorites && selectedPet.dynamicDetails.favorites.length > 0 && (
                              <div className="pt-2 border-t border-black/5">
                                  <p className={`text-[10px] font-bold uppercase mb-1.5 ${accentColor} opacity-70`}>Loves</p>
                                  <div className="flex flex-wrap gap-1">
                                      {selectedPet.dynamicDetails.favorites.map((fav: string) => (
                                          <span key={fav} className="flex items-center gap-1 px-2 py-0.5 bg-white/40 rounded text-[10px] font-medium">
                                              <Heart size={8} className="text-rose-500 fill-rose-500"/> {fav}
                                          </span>
                                      ))}
                                  </div>
                              </div>
                          )}
                      </div>
                  </div>

                  {/* Wellness / Upcoming */}
                  <div className="p-5 rounded-2xl border border-slate-100 flex flex-col justify-between bg-white">
                      <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                              <Shield size={14} /> Wellness Score
                          </h4>
                          <div className="flex items-center gap-3 mb-4">
                              <div className={`text-4xl font-black ${score >= 80 ? 'text-emerald-500' : 'text-amber-500'}`}>{score}<span className="text-lg opacity-60">%</span></div>
                              <p className="text-xs text-slate-500 leading-tight">
                                  {score === 100 ? "Perfect profile!" : `Add ${missing[0] || 'details'} to improve score.`}
                              </p>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full ${score >= 80 ? 'bg-emerald-500' : 'bg-amber-500'} transition-all duration-500`} style={{ width: `${score}%` }}></div>
                          </div>
                      </div>
                      
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mt-3">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Up Next</p>
                          <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-white rounded-lg text-slate-500 shadow-sm"><Calendar size={12} /></div>
                              <div>
                                  <p className="text-xs font-bold text-slate-700">Annual Vaccination</p>
                                  <p className="text--[10px] text-slate-500">Due in 3 weeks</p>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Care & Diet Section */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                      <Utensils size={16} className="text-orange-500" /> Care & Nutrition
                  </h4>
                  <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1 p-4 bg-orange-50/50 rounded-xl border border-orange-100">
                          <p className="text-xs font-bold text-orange-800 uppercase mb-2">Dietary Notes</p>
                          <p className="text-sm text-slate-700 leading-relaxed">
                              {selectedPet.dietaryNotes || "No specific dietary restrictions listed."}
                          </p>
                      </div>
                      <div className="flex-1 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                          <p className="text-xs font-bold text-blue-800 uppercase mb-2">Medical Alerts</p>
                          {selectedPet.history && selectedPet.history.length > 0 ? (
                              <ul className="space-y-2">
                                  {selectedPet.history.slice(0,2).map((h: any, i: number) => (
                                      <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                                          <AlertCircle size={12} className="text-blue-500" />
                                          <span>{h.type}: {h.notes}</span>
                                      </li>
                                  ))}
                              </ul>
                          ) : (
                              <p className="text-sm text-slate-500 italic">No major medical history.</p>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-140px)] h-auto relative animate-fade-in">
        {/* Compact Sidebar (Vertical on Desktop, Horizontal on Tablet/Mobile) */}
        <div className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-4">
             <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm sticky top-0 z-20 lg:static">
                 <div className="flex justify-between items-center mb-3 px-1">
                    <h3 className="font-black text-slate-800 text-sm">My Pack</h3>
                    <button onClick={handleCreateNewPet} className="text-teal-600 hover:bg-teal-50 p-1 rounded-full transition-colors">
                        <Plus size={16} />
                    </button>
                 </div>
                 
                 <div className="relative mb-3 hidden lg:block">
                    <Search className="absolute left-2.5 top-2 text-slate-400" size={14} />
                    <input 
                        type="text" 
                        placeholder="Filter..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                    />
                 </div>

                 {/* Pet List: Vertical on Desktop, Horizontal Scroll on Mobile */}
                 <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
                     {filteredPets.length > 0 ? filteredPets.map(pet => {
                         const isActive = selectedPetId === pet.id;
                         return (
                         <button
                            key={pet.id}
                            onClick={() => handleSelectPet(pet)}
                            className={`
                                flex items-center gap-3 p-2 rounded-xl transition-all duration-200 group text-left border flex-shrink-0
                                lg:w-full min-w-[160px] lg:min-w-0
                                ${isActive 
                                ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                                : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50 hover:border-slate-200'}
                            `}
                         >
                             <img src={pet.image} alt={pet.name} className={`w-8 h-8 rounded-full object-cover border ${isActive ? 'border-slate-700' : 'border-slate-200'}`} />
                             <div className="flex-1 min-w-0">
                                 <h4 className={`font-bold text-xs truncate ${isActive ? 'text-white' : 'text-slate-700'}`}>{pet.name}</h4>
                                 <p className={`text-[10px] truncate ${isActive ? 'text-slate-400' : 'text-slate-400'}`}>{pet.breed}</p>
                             </div>
                         </button>
                     )}) : (
                        <div className="p-4 text-center text-slate-400 text-xs w-full">No pets found.</div>
                     )}
                 </div>
             </div>
        </div>

        {/* Main Content Area (Scrollable on Mobile via Page Scroll, Internal Scroll on Desktop) */}
        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col lg:overflow-hidden relative min-h-[500px]">
             {selectedPet ? (
                 <>
                     {/* Header */}
                     <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white z-10 sticky top-0">
                         <div className="flex items-center gap-5">
                             <div className="relative group">
                                 <img src={isEditing && formData.image ? formData.image : selectedPet.image} alt={selectedPet.name} className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md" />
                                 {isEditing && (
                                     <>
                                         <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute bottom-0 right-0 p-1.5 bg-slate-900 text-white rounded-full shadow-md hover:bg-slate-700 transition-colors z-10 transform translate-x-2 translate-y-2"
                                         >
                                             <Camera size={12} />
                                         </button>
                                         <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                                     </>
                                 )}
                             </div>
                             <div>
                                 <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                                     {isEditing ? (
                                         <input 
                                            value={formData.name} 
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="bg-transparent border-b border-slate-300 focus:border-teal-500 outline-none w-40"
                                         />
                                     ) : selectedPet.name}
                                     {selectedPet.isPublic && !isEditing && (
                                         <div className="bg-teal-50 text-teal-600 p-1 rounded-full" title="Public Profile"><Eye size={14}/></div>
                                     )}
                                 </h2>
                                 <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                     <span>{selectedPet.breed}</span>
                                     <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                     <span>{selectedPet.age} Years</span>
                                 </div>
                             </div>
                         </div>
                         
                         <div className="flex gap-2">
                             {isEditing ? (
                                 <>
                                    <button onClick={handleCancelEdit} className="px-4 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-100 text-sm">Cancel</button>
                                    <button onClick={handleSave} className="px-5 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-lg text-sm flex items-center gap-2"><Save size={16} /> Save</button>
                                 </>
                             ) : (
                                <button onClick={() => { setIsEditing(true); setFormData({...selectedPet}); setActiveTab('PROFILE'); }} className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 text-sm flex items-center gap-2">
                                    <Edit2 size={16} /> Edit Details
                                </button>
                             )}
                         </div>
                     </div>

                     {/* Tabs */}
                     <div className="flex border-b border-slate-100 px-6 pt-2 gap-6 overflow-x-auto scrollbar-hide">
                         <button 
                            onClick={() => setActiveTab('PROFILE')}
                            className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'PROFILE' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                         >
                             <Tag size={16} /> Profile
                         </button>
                         {hasHeritage && (
                             <button 
                                onClick={() => setActiveTab('HERITAGE')}
                                className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'HERITAGE' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                             >
                                 <Dna size={16} /> Genetics
                             </button>
                         )}
                         <button 
                            onClick={() => setActiveTab('ADOPTION')}
                            className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'ADOPTION' ? 'border-rose-600 text-rose-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                         >
                             <HeartHandshake size={16} /> Rehome
                         </button>
                     </div>

                     {/* Scrollable Content Area */}
                     <div className="flex-1 lg:overflow-y-auto p-8 scroll-smooth bg-slate-50/30 h-full">
                         {activeTab === 'PROFILE' && (
                             isEditing ? (
                                 // EDIT MODE (The Form)
                                 <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
                                     <div className="bg-white p-6 rounded-2xl border border-slate-200">
                                         <h4 className="font-bold text-slate-800 mb-4">Core Details</h4>
                                         <div className="grid grid-cols-2 gap-4">
                                             <div className="space-y-1">
                                                 <label className="text-xs font-bold text-slate-400">Type</label>
                                                 <select 
                                                    value={formData.type} 
                                                    onChange={e => setFormData({...formData, type: e.target.value})} 
                                                    className="w-full p-3 bg-slate-50 border rounded-xl text-sm"
                                                 >
                                                     {PET_TAXONOMY.map(t => <option key={t.id} value={t.label}>{t.label}</option>)}
                                                 </select>
                                             </div>
                                             <div className="space-y-1">
                                                 <label className="text-xs font-bold text-slate-400">Gender</label>
                                                 <div className="flex bg-slate-50 p-1 rounded-xl">
                                                     {['Male', 'Female'].map(g => (
                                                         <button key={g} onClick={() => setFormData({...formData, gender: g as any})} className={`flex-1 py-2 text-xs font-bold rounded-lg ${formData.gender === g ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}>{g}</button>
                                                     ))}
                                                 </div>
                                             </div>
                                             <div className="space-y-1">
                                                 <label className="text-xs font-bold text-slate-400">Age (Years)</label>
                                                 <input type="number" value={formData.age} onChange={e => setFormData({...formData, age: parseInt(e.target.value)})} className="w-full p-3 bg-slate-50 border rounded-xl text-sm" />
                                             </div>
                                             <div className="space-y-1">
                                                 <label className="text-xs font-bold text-slate-400">Weight (kg)</label>
                                                 <input type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: parseFloat(e.target.value)})} className="w-full p-3 bg-slate-50 border rounded-xl text-sm" />
                                             </div>
                                         </div>

                                         {/* Microchip Toggle Section */}
                                         <div className="mt-4 pt-4 border-t border-slate-100">
                                             <label className="text-xs font-bold text-slate-400 block mb-2">Microchip Identification</label>
                                             <div className="flex items-center gap-4">
                                                 <div className="flex bg-slate-50 p-1 rounded-lg w-36 flex-shrink-0">
                                                     <button 
                                                         onClick={() => setIsMicrochipped(true)} 
                                                         className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${isMicrochipped ? 'bg-white shadow-sm text-teal-700' : 'text-slate-500'}`}
                                                     >
                                                         Yes
                                                     </button>
                                                     <button 
                                                         onClick={() => { setIsMicrochipped(false); setFormData(prev => ({...prev, microchip: ''})); }} 
                                                         className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${!isMicrochipped ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}
                                                     >
                                                         No
                                                     </button>
                                                 </div>
                                                 {isMicrochipped && (
                                                     <div className="flex-1 animate-in fade-in slide-in-from-left-2">
                                                         <input 
                                                             type="text" 
                                                             placeholder="Enter Microchip ID"
                                                             value={formData.microchip || ''}
                                                             onChange={(e) => setFormData({...formData, microchip: e.target.value})}
                                                             className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
                                                         />
                                                     </div>
                                                 )}
                                             </div>
                                         </div>
                                     </div>
                                     
                                     <div className="bg-white p-6 rounded-2xl border border-slate-200">
                                         <h4 className="font-bold text-slate-800 mb-4">Personality & Traits</h4>
                                         
                                         <div className="space-y-6">
                                             {/* Energy Level */}
                                             <div>
                                                 <label className="text-xs font-bold text-slate-400 block mb-2">Energy Level</label>
                                                 <div className="flex bg-slate-50 p-1 rounded-lg">
                                                     {['Low', 'Medium', 'High'].map(l => (
                                                         <button key={l} onClick={() => setFormData(prev => ({...prev, personality: {...prev.personality, energyLevel: l as any}}))} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.personality?.energyLevel === l ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{l}</button>
                                                     ))}
                                                 </div>
                                             </div>

                                             {/* Dynamic Traits Cloud */}
                                             <div>
                                                 <label className="text-xs font-bold text-slate-400 block mb-2">Traits</label>
                                                 <div className="flex flex-wrap gap-2 mb-3">
                                                     {/* Predefined based on type */}
                                                     {(PET_PERSONALITY_TRAITS[formData.type || 'Dog'] || PET_PERSONALITY_TRAITS['default']).map(trait => {
                                                         const isSelected = formData.personality?.tags?.includes(trait);
                                                         return (
                                                             <button 
                                                                key={trait} 
                                                                onClick={() => toggleTrait(trait)}
                                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                                                    isSelected 
                                                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                                                                    : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
                                                                }`}
                                                             >
                                                                 {trait}
                                                             </button>
                                                         )
                                                     })}
                                                     
                                                     {/* Existing Custom Tags */}
                                                     {formData.personality?.tags?.filter(t => !(PET_PERSONALITY_TRAITS[formData.type || 'Dog'] || []).includes(t)).map(tag => (
                                                         <button key={tag} onClick={() => toggleTrait(tag)} className="px-3 py-1.5 rounded-lg text-xs font-bold border bg-indigo-50 border-indigo-200 text-indigo-700">
                                                             {tag} <X size={10} className="inline ml-1" />
                                                         </button>
                                                     ))}
                                                 </div>
                                                 
                                                 {/* Add Custom Tag */}
                                                 <div className="flex gap-2">
                                                     <input 
                                                        type="text" 
                                                        placeholder="Add custom trait..." 
                                                        value={customTagInput}
                                                        onChange={e => setCustomTagInput(e.target.value)}
                                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                                                        className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-400 w-40"
                                                     />
                                                     <button onClick={addCustomTag} className="p-1.5 bg-slate-100 rounded-lg hover:bg-slate-200 text-slate-600"><Plus size={14}/></button>
                                                 </div>
                                             </div>

                                             {/* Favorites */}
                                             <div>
                                                 <label className="text-xs font-bold text-slate-400 block mb-2 flex items-center gap-1"><Heart size={12} className="text-rose-400"/> Favorites & Loves</label>
                                                 <div className="flex flex-wrap gap-2 mb-3">
                                                     {(PET_FAVORITES_SUGGESTIONS[formData.type || 'Dog'] || PET_FAVORITES_SUGGESTIONS['default']).map(fav => {
                                                         const isSelected = formData.dynamicDetails?.favorites?.includes(fav);
                                                         return (
                                                             <button 
                                                                key={fav} 
                                                                onClick={() => toggleFavorite(fav)}
                                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                                                    isSelected 
                                                                    ? 'bg-rose-50 border-rose-200 text-rose-600' 
                                                                    : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
                                                                }`}
                                                             >
                                                                 {fav}
                                                             </button>
                                                         )
                                                     })}
                                                     {/* Custom Favs */}
                                                     {formData.dynamicDetails?.favorites?.filter((f:string) => !(PET_FAVORITES_SUGGESTIONS[formData.type || 'Dog'] || []).includes(f)).map((fav: string) => (
                                                         <button key={fav} onClick={() => toggleFavorite(fav)} className="px-3 py-1.5 rounded-lg text-xs font-bold border bg-rose-50 border-rose-200 text-rose-600">
                                                             {fav} <X size={10} className="inline ml-1" />
                                                         </button>
                                                     ))}
                                                 </div>
                                                 <div className="flex gap-2">
                                                     <input 
                                                        type="text" 
                                                        placeholder="Add favorite item/activity..." 
                                                        value={customFavInput}
                                                        onChange={e => setCustomFavInput(e.target.value)}
                                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomFavorite())}
                                                        className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-rose-400 w-48"
                                                     />
                                                     <button onClick={addCustomFavorite} className="p-1.5 bg-slate-100 rounded-lg hover:bg-slate-200 text-slate-600"><Plus size={14}/></button>
                                                 </div>
                                             </div>
                                         </div>
                                     </div>

                                     <div className="bg-white p-6 rounded-2xl border border-slate-200">
                                         <h4 className="font-bold text-slate-800 mb-4">Profile Appearance</h4>
                                         <div className="flex items-center gap-4">
                                             <label className="text-xs font-bold text-slate-400"><Palette size={16} className="inline mr-1"/> Theme Color</label>
                                             <div className="flex gap-2">
                                                 {['Amber', 'Blue', 'Teal', 'Rose', 'Indigo'].map(c => (
                                                     <button 
                                                        key={c}
                                                        onClick={() => setFormData({...formData, color: c})}
                                                        className={`w-6 h-6 rounded-full border-2 ${
                                                            c === 'Amber' ? 'bg-amber-400 border-amber-200' : 
                                                            c === 'Blue' ? 'bg-blue-400 border-blue-200' : 
                                                            c === 'Teal' ? 'bg-teal-400 border-teal-200' : 
                                                            c === 'Rose' ? 'bg-rose-400 border-rose-200' : 
                                                            'bg-indigo-400 border-indigo-200'
                                                        } ${formData.color === c ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`}
                                                     />
                                                 ))}
                                             </div>
                                         </div>
                                     </div>

                                     <div className="bg-white p-6 rounded-2xl border border-slate-200">
                                         <h4 className="font-bold text-slate-800 mb-4">Notes</h4>
                                         <textarea value={formData.dietaryNotes} onChange={e => setFormData({...formData, dietaryNotes: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl text-sm h-24" placeholder="Dietary notes, allergies, etc." />
                                     </div>
                                     
                                     <div className="flex justify-between items-center pt-4">
                                         <button onClick={handleDeletePet} className="text-red-500 text-xs font-bold flex items-center gap-1"><Trash2 size={14}/> Delete Pet</button>
                                         <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                             <input type="checkbox" checked={formData.isPublic} onChange={e => setFormData({...formData, isPublic: e.target.checked})} className="rounded text-teal-600 focus:ring-teal-500" /> Public Profile
                                         </label>
                                     </div>
                                 </div>
                             ) : (
                                 <ReadOnlyProfile />
                             )
                         )}
                         
                         {activeTab === 'HERITAGE' && (
                            <div className="h-full animate-in fade-in slide-in-from-bottom-2">
                                <HeritageDashboard pets={pets} preSelectedPetId={selectedPet.id} />
                            </div>
                         )}

                         {activeTab === 'ADOPTION' && (
                             <div className="w-full animate-in fade-in slide-in-from-bottom-2">
                                 {activeListing ? (
                                     // Active Listing Dashboard State
                                     <div className="bg-white rounded-2xl border border-emerald-200 overflow-hidden shadow-sm">
                                         <div className="bg-emerald-50 p-4 border-b border-emerald-100 flex justify-between items-center">
                                             <div className="flex items-center gap-2 text-emerald-700 font-bold">
                                                 <CheckCircle size={18} /> Active Listing
                                             </div>
                                             <div className="flex gap-2">
                                                 <button 
                                                    onClick={() => {
                                                        if(confirm('Are you sure you want to cancel this listing?')) {
                                                            setActiveListing(null);
                                                        }
                                                    }} 
                                                    className="px-4 py-2 bg-white border border-emerald-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
                                                 >
                                                     Cancel Listing
                                                 </button>
                                             </div>
                                         </div>
                                         <div className="p-6">
                                             <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
                                                 <div>
                                                     <div className="flex items-center gap-3 mb-2">
                                                         <h3 className="text-2xl font-black text-slate-800">{selectedPet.name}</h3>
                                                         <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 uppercase border border-emerald-200">{activeListing.type}</span>
                                                     </div>
                                                     <p className="text-slate-500 font-medium">Listed for {activeListing.price > 0 ? `PKR ${activeListing.price.toLocaleString()}` : 'Adoption'}</p>
                                                 </div>
                                                 <div className="flex gap-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                     <div className="text-center">
                                                         <p className="text-2xl font-black text-slate-800">12</p>
                                                         <p className="text-[10px] font-bold text-slate-400 uppercase">Views</p>
                                                     </div>
                                                     <div className="w-px bg-slate-200"></div>
                                                     <div className="text-center">
                                                         <p className="text-2xl font-black text-slate-800">3</p>
                                                         <p className="text-[10px] font-bold text-slate-400 uppercase">Saves</p>
                                                     </div>
                                                     <div className="w-px bg-slate-200"></div>
                                                     <div className="text-center">
                                                         <p className="text-2xl font-black text-slate-800">0</p>
                                                         <p className="text-[10px] font-bold text-slate-400 uppercase">Inquiries</p>
                                                     </div>
                                                 </div>
                                             </div>
                                             
                                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                 <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                                                     <p className="text-xs font-bold text-slate-400 uppercase mb-3">Preferences</p>
                                                     <div className="flex flex-wrap gap-2">
                                                         {activeListing.preferences.map((p: string) => (
                                                             <span key={p} className="text-xs font-bold bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 shadow-sm">{p}</span>
                                                         ))}
                                                     </div>
                                                 </div>
                                                 <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                                                     <p className="text-xs font-bold text-slate-400 uppercase mb-3">Listing Details</p>
                                                     <div className="space-y-2 text-sm">
                                                         <div className="flex justify-between">
                                                             <span className="text-slate-500">Reason</span>
                                                             <span className="font-bold text-slate-700">{activeListing.reason}</span>
                                                         </div>
                                                         <div className="flex justify-between">
                                                             <span className="text-slate-500">Listed On</span>
                                                             <span className="font-bold text-slate-700">{new Date().toLocaleDateString()}</span>
                                                         </div>
                                                         <div className="flex justify-between">
                                                             <span className="text-slate-500">Status</span>
                                                             <span className="font-bold text-emerald-600">Live</span>
                                                         </div>
                                                     </div>
                                                 </div>
                                             </div>
                                         </div>
                                     </div>
                                 ) : (
                                     // Empty State
                                     <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center max-w-3xl mx-auto">
                                         <HeartHandshake className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                         <h3 className="text-xl font-bold text-slate-700 mb-2">Rehome {selectedPet.name}</h3>
                                         <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
                                             Create a listing to find a loving new home. You can choose between adoption or sale, and set specific preferences for the new owner.
                                         </p>
                                         <button 
                                            onClick={() => { setShowRehomeModal(true); setRehomeStep(1); }} 
                                            className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg"
                                         >
                                             Start Listing
                                         </button>
                                     </div>
                                 )}
                             </div>
                         )}
                     </div>
                 </>
             ) : (
                 <div className="flex flex-col items-center justify-center h-full text-slate-400">
                     <Search size={48} className="text-slate-200 mb-4" />
                     <p className="font-medium">Select a pet to view their profile.</p>
                 </div>
             )}
        </div>

        {/* Rehome Wizard Modal */}
        {showRehomeModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
                    {/* Modal Header */}
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <div>
                            <h3 className="text-xl font-black text-slate-800">Rehome {selectedPet?.name}</h3>
                            <p className="text-xs text-slate-500 font-medium">Step {rehomeStep} of 3</p>
                        </div>
                        <button onClick={() => setShowRehomeModal(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400"><X size={20}/></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8">
                        {rehomeStep === 1 && (
                            <div className="space-y-6 animate-in slide-in-from-right">
                                {/* Type Selection */}
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-3 block">Listing Type</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button 
                                            onClick={() => setRehomeData({...rehomeData, type: 'ADOPTION'})}
                                            className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                                                rehomeData.type === 'ADOPTION' 
                                                ? 'bg-teal-50 border-teal-500 text-teal-700' 
                                                : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
                                            }`}
                                        >
                                            <div className={`p-3 rounded-full ${rehomeData.type === 'ADOPTION' ? 'bg-teal-200 text-teal-800' : 'bg-slate-100'}`}><Heart size={24} fill="currentColor"/></div>
                                            <span className="font-bold">Adoption</span>
                                        </button>
                                        <button 
                                            onClick={() => setRehomeData({...rehomeData, type: 'SALE'})}
                                            className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                                                rehomeData.type === 'SALE' 
                                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                                                : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
                                            }`}
                                        >
                                            <div className={`p-3 rounded-full ${rehomeData.type === 'SALE' ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-100'}`}><Home size={24}/></div>
                                            <span className="font-bold">Sale</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Price Input */}
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
                                        {rehomeData.type === 'ADOPTION' ? 'Adoption Fee (Min PKR 2000)' : 'Selling Price (PKR)'}
                                    </label>
                                    <input 
                                        type="number" 
                                        min={rehomeData.type === 'ADOPTION' ? "2000" : "0"}
                                        value={rehomeData.price || ''}
                                        onChange={(e) => setRehomeData({...rehomeData, price: parseInt(e.target.value)})}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                                        placeholder={rehomeData.type === 'ADOPTION' ? "2000" : "0"}
                                    />
                                </div>

                                {/* Reason */}
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Reason for Rehoming</label>
                                    <select 
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-slate-900"
                                        value={rehomeData.reason}
                                        onChange={(e) => setRehomeData({...rehomeData, reason: e.target.value})}
                                    >
                                        <option>Relocation / Moving</option>
                                        <option>Allergies</option>
                                        <option>Financial Constraints</option>
                                        <option>No Time / Busy Schedule</option>
                                        <option>Behavioral Issues</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {rehomeStep === 2 && (
                            <div className="space-y-6 animate-in slide-in-from-right">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-3 block flex items-center gap-2">
                                        <Home size={14} /> Future Home Preferences
                                    </label>
                                    <p className="text-xs text-slate-500 mb-3">Select what kind of environment is best for {selectedPet?.name}.</p>
                                    <div className="flex flex-wrap gap-2">
                                        {HOME_PREFERENCES.map(pref => {
                                            const isSelected = rehomeData.preferences.includes(pref);
                                            return (
                                                <button
                                                    key={pref}
                                                    onClick={() => toggleRehomePreference(pref)}
                                                    className={`px-4 py-2 rounded-full text-xs font-bold border transition-all flex items-center gap-2 ${
                                                        isSelected 
                                                        ? 'bg-teal-50 border-teal-500 text-teal-700 shadow-sm' 
                                                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                                    }`}
                                                >
                                                    {isSelected && <CheckCircle size={12} />}
                                                    {pref}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Listing Story</label>
                                    <textarea 
                                        rows={5}
                                        placeholder={`Tell potential owners about ${selectedPet?.name}. What are they like? Why are they special?`}
                                        value={rehomeData.description}
                                        onChange={(e) => setRehomeData({...rehomeData, description: e.target.value})}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm leading-relaxed text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                                    />
                                </div>
                            </div>
                        )}

                        {rehomeStep === 3 && (
                            <div className="space-y-6 animate-in slide-in-from-right text-center">
                                <div className="w-24 h-24 mx-auto rounded-full p-1 bg-gradient-to-br from-teal-400 to-blue-500 shadow-xl mb-4">
                                    <img src={selectedPet?.image} className="w-full h-full rounded-full object-cover border-4 border-white" />
                                </div>
                                
                                <h3 className="text-2xl font-black text-slate-800">Ready to Publish?</h3>
                                <p className="text-slate-500 max-w-xs mx-auto mb-6">Your listing will be visible to thousands of verified adopters in your area.</p>

                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left max-w-sm mx-auto space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-xs text-slate-500 font-bold uppercase">Type</span>
                                        <span className="text-sm font-bold text-slate-800">{rehomeData.type}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-xs text-slate-500 font-bold uppercase">Price</span>
                                        <span className="text-sm font-bold text-slate-800">{rehomeData.price > 0 ? `PKR ${rehomeData.price}` : 'Free'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-xs text-slate-500 font-bold uppercase">Preferences</span>
                                        <span className="text-sm font-bold text-slate-800">{rehomeData.preferences.length} Selected</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Buttons */}
                    <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between gap-4">
                        {rehomeStep > 1 ? (
                            <button onClick={() => setRehomeStep(s => s - 1)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-100">Back</button>
                        ) : (
                            <div /> 
                        )}
                        
                        {rehomeStep < 3 ? (
                            <button 
                                onClick={() => setRehomeStep(s => s + 1)} 
                                className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 flex items-center gap-2 shadow-lg"
                            >
                                Next Step <ArrowRight size={16} />
                            </button>
                        ) : (
                            <button 
                                onClick={handlePublishListing}
                                className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 shadow-lg flex items-center justify-center gap-2"
                            >
                                <Check size={18} /> Publish Listing
                            </button>
                        )}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default PetProfileManager;