import React, { useState, useEffect } from 'react';
import { MOCK_SERVICES, MOCK_PETS } from '../constants';
import { ServiceType, ServiceProvider, Pet, MatchInsight } from '../types';
import { MapPin, Star, CheckCircle, Phone, Clock, Search, Filter, X, Calendar, ChevronRight, Map, List, Stethoscope, Building2, Scissors, User, Siren, AlertTriangle, Plus, Minus, Navigation, Share2, MessageCircle, Shield, Tag, Briefcase, Check, Sparkles, BrainCircuit, Copy, Coins, Lock, Unlock } from 'lucide-react';
import { FindCareSection } from './FindCare'; 
import { generateProviderQuestions } from '../services/geminiService';

interface ServiceFinderProps {
    initialFilter?: ServiceType;
    onNavigate?: (tab: string, context?: any) => void;
}

// --- SUB-COMPONENT: Deals Carousel ---
const DealsCarousel = () => {
    const deals = [
        { title: "Free Dental Checkup", subtitle: "With any annual vaccination", color: "bg-blue-500", icon: Stethoscope },
        { title: "50% Off First Groom", subtitle: "New clients only", color: "bg-purple-500", icon: Scissors },
        { title: "Free Meet & Greet", subtitle: "For dog walking services", color: "bg-emerald-500", icon: User },
    ];

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide mb-2">
            {deals.map((deal, i) => (
                <div key={i} className={`flex-shrink-0 w-72 p-4 rounded-2xl ${deal.color} text-white relative overflow-hidden shadow-md group cursor-pointer hover:shadow-lg transition-all`}>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 opacity-90">
                            <Tag size={14} /> <span className="text-xs font-bold uppercase tracking-wider">Limited Offer</span>
                        </div>
                        <h3 className="font-black text-lg leading-tight mb-1">{deal.title}</h3>
                        <p className="text-sm opacity-90">{deal.subtitle}</p>
                    </div>
                    <deal.icon className="absolute -bottom-4 -right-4 w-24 h-24 opacity-20 group-hover:scale-110 transition-transform rotate-12" />
                </div>
            ))}
        </div>
    );
};

// --- SUB-COMPONENT: Provider Profile Modal ---
const ProviderProfileModal = ({ provider, onClose, onBook, userCredits, onDeductCredit, onNavigate }: { provider: ServiceProvider, onClose: () => void, onBook: () => void, userCredits: number, onDeductCredit: () => void, onNavigate?: (tab: string, context?: any) => void }) => {
    const [activeTab, setActiveTab] = useState<'ABOUT' | 'MATCH' | 'REVIEWS'>('ABOUT');
    
    // Local state to manage pets with their cached insights for this session
    // In a real app, MOCK_PETS would be from a global context/store
    const [localPets, setLocalPets] = useState<Pet[]>(MOCK_PETS); 
    const [selectedPetId, setSelectedPetId] = useState(localPets[0]?.id);
    
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const selectedPet = localPets.find(p => p.id === selectedPetId);
    
    // Check if we have a saved match for this specific provider
    const existingMatch = selectedPet?.savedMatches?.find(m => m.providerId === provider.id);

    const handleAnalyze = async () => {
        if (!selectedPet) return;
        if (userCredits < 1 && !existingMatch) {
            alert("Insufficient credits!");
            return;
        }
        
        setIsAnalyzing(true);
        
        // Simulate API call with delay
        const result = await generateProviderQuestions(provider, selectedPet);
        
        const newMatch: MatchInsight = {
            providerId: provider.id,
            timestamp: Date.now(),
            insight: result.insight,
            questions: result.questions,
            compatibilityScore: result.compatibilityScore
        };

        // Update Local Pet State (Simulating DB Save)
        const updatedPets = localPets.map(p => {
            if (p.id === selectedPetId) {
                const oldMatches = p.savedMatches || [];
                // Remove old match for this provider if exists, add new one
                const newMatches = [...oldMatches.filter(m => m.providerId !== provider.id), newMatch];
                return { ...p, savedMatches: newMatches };
            }
            return p;
        });

        setLocalPets(updatedPets);
        onDeductCredit(); // Deduct credit via parent callback
        setIsAnalyzing(false);
    };

    const handleMessage = () => {
        onClose();
        if (onNavigate) {
            onNavigate('Messages', { contact: { 
                id: provider.id, 
                name: provider.name, 
                role: provider.type === 'VET_HOME' ? 'Veterinarian' : provider.type === 'WALKER' ? 'Dog Walker' : 'Clinic',
                avatar: provider.image,
                status: 'online' 
            }});
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 relative">
                {/* Cover Image & Header */}
                <div className="relative h-48 bg-slate-200">
                    <img src={provider.image} className="w-full h-full object-cover opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors">
                        <X size={20} />
                    </button>
                    <div className="absolute bottom-4 left-6 text-white">
                        <h2 className="text-3xl font-black mb-1 flex items-center gap-2">
                            {provider.name}
                            {provider.rating >= 4.8 && <CheckCircle className="text-blue-400 fill-blue-400/20" size={24} />}
                        </h2>
                        <p className="opacity-90 font-medium flex items-center gap-2 text-sm">
                            <MapPin size={14} /> {provider.location} • {provider.distance} away
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100 px-6 pt-2">
                    {[
                        { id: 'ABOUT', label: 'About' },
                        { id: 'MATCH', label: 'Smart Match', icon: Sparkles },
                        { id: 'REVIEWS', label: 'Reviews' }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === tab.id ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            {tab.icon && <tab.icon size={14} className={activeTab === tab.id ? "text-teal-500" : "text-slate-400"} />}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                    {activeTab === 'ABOUT' && (
                        <div className="space-y-6 animate-in slide-in-from-right-2">
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                <h3 className="font-bold text-slate-800 mb-2">About</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">{provider.description}</p>
                                <div className="mt-4 flex gap-2 flex-wrap">
                                    {provider.specialties?.map(tag => (
                                        <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-md border border-slate-200">#{tag}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    <Clock size={16} className="text-teal-600" /> Operating Hours
                                </h3>
                                <div className="space-y-2 text-sm text-slate-600">
                                    <div className="flex justify-between"><span>Monday - Friday</span> <span className="font-bold">9:00 AM - 7:00 PM</span></div>
                                    <div className="flex justify-between"><span>Saturday</span> <span className="font-bold">10:00 AM - 4:00 PM</span></div>
                                    <div className="flex justify-between text-red-500"><span>Sunday</span> <span className="font-bold">Closed</span></div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button 
                                    onClick={handleMessage}
                                    className="flex-1 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold text-sm hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors"
                                >
                                    <MessageCircle size={16} /> Message
                                </button>
                                <button className="flex-1 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold text-sm hover:bg-slate-50 flex items-center justify-center gap-2">
                                    <Share2 size={16} /> Share
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'MATCH' && (
                        <div className="space-y-6 animate-in slide-in-from-right-2">
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="block text-xs font-bold text-slate-400 uppercase">Check Compatibility With</label>
                                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-full">
                                        <Coins size={12} /> {userCredits} Credits Available
                                    </div>
                                </div>
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    {localPets.map(pet => (
                                        <button 
                                            key={pet.id}
                                            onClick={() => setSelectedPetId(pet.id)}
                                            className={`flex items-center gap-3 p-2 pr-4 rounded-xl border-2 transition-all min-w-[140px] ${selectedPetId === pet.id ? 'border-purple-500 bg-purple-50' : 'border-slate-100 hover:border-slate-200'}`}
                                        >
                                            <img src={pet.image} className="w-8 h-8 rounded-full object-cover" />
                                            <span className="font-bold text-sm text-slate-700">{pet.name}</span>
                                        </button>
                                    ))}
                                </div>
                                
                                {!existingMatch && (
                                    <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                                        <p className="text-sm text-slate-500 mb-4">
                                            Unlock deep AI insights based on {selectedPet?.name}'s specific breed, medical history ({selectedPet?.history?.length || 0} records), and environmental needs.
                                        </p>
                                        <button 
                                            onClick={handleAnalyze}
                                            disabled={isAnalyzing || userCredits < 1}
                                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold shadow-md hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                                        >
                                            {isAnalyzing ? (
                                                <><BrainCircuit className="animate-pulse" /> Analyzing Data...</>
                                            ) : (
                                                <><Unlock size={18} /> Generate Smart Match (1 Credit)</>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {existingMatch && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                    <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-5 rounded-2xl text-white shadow-lg relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-20"><Sparkles size={48} /></div>
                                        <div className="flex items-center gap-2 mb-2 opacity-90">
                                            <Sparkles size={16} /> <span className="text-xs font-bold uppercase tracking-wider">PawPal Insight</span>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="flex-1">
                                                <p className="font-medium leading-relaxed text-purple-50">{existingMatch.insight}</p>
                                            </div>
                                            <div className="flex flex-col items-center bg-white/10 backdrop-blur-md rounded-lg p-2 min-w-[60px]">
                                                <span className="text-2xl font-black">{existingMatch.compatibilityScore}%</span>
                                                <span className="text-[10px] uppercase font-bold opacity-80">Match</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                        <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Recommended Questions</h4>
                                        <div className="space-y-3">
                                            {existingMatch.questions.map((q, i) => (
                                                <div key={i} className="p-3 bg-slate-50 rounded-xl text-sm text-slate-700 border border-slate-100 flex items-start gap-3 group cursor-pointer hover:bg-blue-50 transition-colors" onClick={() => navigator.clipboard.writeText(q)}>
                                                    <span className="font-bold text-blue-500">{i+1}</span>
                                                    <span className="flex-1">{q}</span>
                                                    <Copy size={14} className="text-slate-300 group-hover:text-blue-400" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="text-center">
                                        <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                                            <CheckCircle size={10} /> Data saved to pet profile
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'REVIEWS' && (
                        <div className="space-y-4 animate-in slide-in-from-right-2">
                            <div className="flex items-center gap-4 bg-amber-50 p-4 rounded-xl border border-amber-100">
                                <div className="text-center">
                                    <p className="text-3xl font-black text-amber-500">{provider.rating}</p>
                                    <div className="flex text-amber-400 text-xs"><Star fill="currentColor" size={10} /><Star fill="currentColor" size={10} /><Star fill="currentColor" size={10} /><Star fill="currentColor" size={10} /><Star fill="currentColor" size={10} /></div>
                                </div>
                                <div className="h-10 w-px bg-amber-200"></div>
                                <div>
                                    <p className="font-bold text-amber-900">{provider.reviews} Verified Reviews</p>
                                    <p className="text-xs text-amber-700">98% would recommend</p>
                                </div>
                            </div>

                            {/* Mock Reviews */}
                            {[
                                { user: 'Sarah K.', rating: 5, text: "Amazing experience! Dr. Jane was so gentle with my cat.", date: "2 days ago" },
                                { user: 'Ahmed R.', rating: 4, text: "Great service but slightly delayed appointment.", date: "1 week ago" },
                                { user: 'Fatima L.', rating: 5, text: "Best grooming service in DHA. Highly recommended!", date: "3 weeks ago" },
                            ].map((review, i) => (
                                <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                    <div className="flex justify-between mb-2">
                                        <span className="font-bold text-slate-800">{review.user}</span>
                                        <span className="text-xs text-slate-400">{review.date}</span>
                                    </div>
                                    <div className="flex text-amber-400 mb-2">
                                        {[...Array(review.rating)].map((_, j) => <Star key={j} size={12} fill="currentColor" />)}
                                    </div>
                                    <p className="text-sm text-slate-600">{review.text}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-5 bg-white border-t border-slate-100 flex justify-between items-center">
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold">Starting From</p>
                        <p className="text-2xl font-black text-slate-900">{provider.priceRange}</p>
                    </div>
                    <button 
                        onClick={onBook}
                        className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-xl hover:bg-slate-800 transition-all transform hover:-translate-y-0.5"
                    >
                        Book Appointment
                    </button>
                </div>
            </div>
        </div>
    );
};

const ServiceFinder: React.FC<ServiceFinderProps> = ({ initialFilter, onNavigate }) => {
  // --- TAB STATE (Main Switch) ---
  const [activeTab, setActiveTab] = useState<'SEARCH' | 'CARE'>('SEARCH');

  // --- Search State ---
  const [viewMode, setViewMode] = useState<'LIST' | 'MAP'>('LIST');
  const [activeCategory, setActiveCategory] = useState<ServiceType | 'ALL' | 'GROOMER'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [viewingProvider, setViewingProvider] = useState<ServiceProvider | null>(null); 
  const [bookingProvider, setBookingProvider] = useState<ServiceProvider | null>(null); 
  const [bookingSuccess, setBookingSuccess] = useState(false);
  
  // Mock User Credits State (In a real app, this comes from user profile context)
  const [userCredits, setUserCredits] = useState(5);

  useEffect(() => {
      if (initialFilter) {
          setActiveCategory(initialFilter);
      }
  }, [initialFilter]);

  const filteredServices = MOCK_SERVICES.filter(s => {
    const matchesCategory = activeCategory === 'ALL' || s.type === activeCategory;
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.specialties?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesEmergency = emergencyMode ? s.isEmergency : true;
    
    return matchesCategory && matchesSearch && matchesEmergency;
  });

  // Mock Map View Component (Simulated)
  const SimulatedMap = () => (
      <div className="relative w-full h-[600px] bg-slate-200 rounded-2xl overflow-hidden border border-slate-300 animate-in fade-in">
          <div className="absolute inset-0 opacity-60 bg-[url('https://imgs.search.brave.com/J_l3a8-ZzE1v-I4fJ4yO5C6m4r3c8b7a9d0e1f2g3h4/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9tYXBz/Lm1hcHRpbGVyLmNv/bS92MS9zdHlsZXMv/c3RyZWV0cy81MTIv/MTcxLzgyLkB4LnBu/Zw')] bg-cover bg-center grayscale hover:grayscale-0 transition-all duration-700"></div>
          {filteredServices.map(s => {
             if (!s.coordinates) return null;
             return (
                 <div 
                    key={s.id}
                    className="absolute cursor-pointer group z-10 transition-all duration-300 hover:z-30 hover:scale-110"
                    style={{ left: `${s.coordinates.x}%`, top: `${s.coordinates.y}%` }}
                    onClick={() => setViewingProvider(s)}
                 >
                     <div className={`p-2 rounded-xl shadow-lg border-2 border-white flex items-center justify-center transition-colors ${s.isEmergency ? 'bg-red-500 text-white' : 'bg-white text-slate-700'}`}>
                         {s.type === 'VET_HOME' ? <Stethoscope size={16} /> : <MapPin size={16} />}
                     </div>
                 </div>
             );
          })}
      </div>
  );

  const categories = [
      { id: 'ALL', label: 'All', icon: Search },
      { id: ServiceType.VET_HOME, label: 'Home Vet', icon: Stethoscope },
      { id: ServiceType.CLINIC, label: 'Clinic', icon: Building2 },
      { id: ServiceType.WALKER, label: 'Walkers', icon: User },
      { id: 'GROOMER', label: 'Grooming', icon: Scissors },
  ];

  // --- SUB-COMPONENT: Enhanced Booking Modal ---
  const BookingModal = ({ provider, onClose, onConfirm }: { provider: ServiceProvider, onClose: () => void, onConfirm: () => void }) => {
      const [selectedDate, setSelectedDate] = useState<number | null>(null);
      const [selectedTime, setSelectedTime] = useState<string | null>(null);
      
      // Initialize services. If only 1 available, select it by default.
      const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

      useEffect(() => {
          if (provider.services && provider.services.length === 1) {
              setSelectedServiceIds([provider.services[0].id]);
          }
      }, [provider]);

      const toggleService = (id: string) => {
          if (selectedServiceIds.includes(id)) {
              setSelectedServiceIds(prev => prev.filter(s => s !== id));
          } else {
              setSelectedServiceIds(prev => [...prev, id]);
          }
      };

      const totalEstimate = selectedServiceIds.reduce((sum, id) => {
          const svc = provider.services?.find(s => s.id === id);
          return sum + (svc ? svc.price : 0);
      }, 0);

      const timeSlots = ['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM'];

      return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <div className="flex items-center gap-4">
                          <img src={provider.image} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                          <div>
                              <h3 className="font-bold text-slate-800 leading-tight">Book Appointment</h3>
                              <p className="text-xs text-slate-500 font-medium">with {provider.name}</p>
                          </div>
                      </div>
                      <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"><X size={20}/></button>
                  </div>

                  <div className="p-6 overflow-y-auto space-y-6">
                      
                      {/* Service Selection - Tags */}
                      <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Select Services</label>
                          <div className="flex flex-wrap gap-2">
                              {provider.services && provider.services.length > 0 ? (
                                  provider.services.map(service => {
                                      const isSelected = selectedServiceIds.includes(service.id);
                                      return (
                                          <button
                                              key={service.id}
                                              onClick={() => toggleService(service.id)}
                                              className={`px-4 py-2.5 rounded-full text-sm font-bold border transition-all flex items-center gap-2 ${
                                                  isSelected 
                                                  ? 'bg-teal-600 border-teal-600 text-white shadow-md transform scale-105' 
                                                  : 'bg-white border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-600'
                                              }`}
                                          >
                                              {isSelected && <Check size={14} strokeWidth={3} />}
                                              {service.name}
                                              <span className={`text-xs font-normal opacity-80 ml-1 ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                                                  (PKR {service.price})
                                              </span>
                                          </button>
                                      )
                                  })
                              ) : (
                                  <p className="text-sm text-slate-400 italic">No specific services listed. General consultation applies.</p>
                              )}
                          </div>
                      </div>

                      {/* Date Selection */}
                      <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Select Date</label>
                          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                              {[0, 1, 2, 3, 4, 5].map((day) => {
                                  const date = new Date();
                                  date.setDate(date.getDate() + day);
                                  const isSelected = selectedDate === day;
                                  return (
                                      <button 
                                          key={day}
                                          onClick={() => setSelectedDate(day)}
                                          className={`flex-shrink-0 w-16 h-20 rounded-xl flex flex-col items-center justify-center border-2 transition-all ${
                                              isSelected 
                                              ? 'border-teal-500 bg-teal-600 text-white shadow-md' 
                                              : 'border-slate-100 hover:border-slate-300 text-slate-600 bg-slate-50'
                                          }`}
                                      >
                                          <span className="text-xs font-medium opacity-80">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                          <span className="text-xl font-black">{date.getDate()}</span>
                                      </button>
                                  )
                              })}
                          </div>
                      </div>

                      {/* Time Selection */}
                      {selectedDate !== null && (
                          <div className="animate-in fade-in slide-in-from-top-2">
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Select Time</label>
                              <div className="grid grid-cols-3 gap-3">
                                  {timeSlots.map((time) => (
                                      <button
                                          key={time}
                                          onClick={() => setSelectedTime(time)}
                                          className={`py-2 rounded-lg text-sm font-bold border transition-all ${
                                              selectedTime === time 
                                              ? 'bg-slate-800 text-white border-slate-800' 
                                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                          }`}
                                      >
                                          {time}
                                      </button>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>

                  <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                      <div>
                          <p className="text-xs font-bold text-slate-400 uppercase">Total Estimate</p>
                          <p className="text-xl font-black text-slate-900">
                              {totalEstimate > 0 ? `PKR ${totalEstimate.toLocaleString()}` : provider.priceRange}
                          </p>
                      </div>
                      <button 
                          disabled={selectedDate === null || selectedTime === null || (provider.services && provider.services.length > 0 && selectedServiceIds.length === 0)}
                          onClick={onConfirm}
                          className="px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 flex items-center gap-2"
                      >
                          Confirm Booking <ChevronRight size={16} />
                      </button>
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="space-y-6 relative pb-20 animate-fade-in">
      {/* Top Level Tab Switcher */}
      <div className="flex justify-center pb-4">
          <div className="bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 flex gap-2">
              <button 
                onClick={() => setActiveTab('SEARCH')}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'SEARCH' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
              >
                  Browse Professionals
              </button>
              <button 
                onClick={() => setActiveTab('CARE')}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'CARE' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
              >
                  <Briefcase size={16} /> Post a Job
              </button>
          </div>
      </div>

      {/* Booking Success Toast */}
      {bookingSuccess && (
          <div className="fixed top-24 right-6 bg-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-in slide-in-from-right fade-in duration-300">
              <div className="bg-white/20 p-2 rounded-full"><CheckCircle size={20} /></div>
              <div>
                  <p className="font-bold">Booking Confirmed!</p>
                  <p className="text-xs text-emerald-100">Provider notified. Check email for details.</p>
              </div>
          </div>
      )}

      {/* --- MAIN CONTENT SWITCH --- */}
      {activeTab === 'CARE' ? (
          // Render New "Find Care" Section
          <FindCareSection />
      ) : (
          // Render Existing "Search Services" UI
          <>
              {/* Deals Carousel */}
              {!emergencyMode && viewMode === 'LIST' && <DealsCarousel />}

              {/* Controls Header */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="flex gap-3 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-hide">
                        {categories.map(cat => {
                            const Icon = cat.icon;
                            const isActive = activeCategory === cat.id;
                            return (
                                <button 
                                        key={cat.id}
                                        onClick={() => setActiveCategory(cat.id as any)}
                                        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                                            isActive 
                                            ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                        }`}
                                >
                                    <Icon size={16} /> {cat.label}
                                </button>
                            )
                        })}
                    </div>

                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <button 
                                onClick={() => setEmergencyMode(!emergencyMode)}
                                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all border ${
                                    emergencyMode 
                                    ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' 
                                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                }`}
                        >
                            <Siren size={18} /> Emergency 24/7
                        </button>
                        
                        <div className="h-10 w-px bg-slate-200 hidden lg:block"></div>

                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button 
                                    onClick={() => setViewMode('LIST')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'LIST' ? 'bg-white shadow text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                <List size={20} />
                            </button>
                            <button 
                                    onClick={() => setViewMode('MAP')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'MAP' ? 'bg-white shadow text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                <Map size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-6 relative">
                        <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name, specialty (e.g. 'Orthopedic'), or location..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-slate-700"
                        />
                </div>
              </div>

              {/* Content Area */}
              {viewMode === 'MAP' ? (
                  <SimulatedMap />
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredServices.length > 0 ? filteredServices.map(service => (
                          <div 
                            key={service.id} 
                            onClick={() => setViewingProvider(service)}
                            className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-teal-200 transition-all duration-300 group flex flex-col h-full cursor-pointer"
                          >
                              <div className="relative h-48 overflow-hidden">
                                  <img src={service.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                  
                                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                                      {service.isEmergency && (
                                          <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm uppercase tracking-wider flex items-center gap-1">
                                              <AlertTriangle size={10} /> Emergency
                                          </span>
                                      )}
                                      {service.available && (
                                          <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm uppercase tracking-wider flex items-center gap-1">
                                              <Clock size={10} /> Available Today
                                          </span>
                                      )}
                                  </div>
                                  
                                  <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-slate-800 shadow-sm">
                                      {service.distance || '2.5 km'}
                                  </div>
                              </div>

                              <div className="p-5 flex-1 flex flex-col">
                                  <div className="flex justify-between items-start mb-2">
                                      <div>
                                          <h3 className="font-bold text-lg text-slate-800 leading-tight mb-1 group-hover:text-teal-700 transition-colors flex items-center gap-2">
                                              {service.name}
                                              {service.rating >= 4.8 && <Shield size={14} className="text-blue-500 fill-blue-100" />}
                                          </h3>
                                          <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                                              <Star size={12} fill="currentColor" /> {service.rating} <span className="text-slate-400 font-medium">({service.reviews} reviews)</span>
                                          </div>
                                      </div>
                                      {service.type === 'VET_HOME' && <div className="bg-blue-50 p-1.5 rounded-lg text-blue-600"><Stethoscope size={18} /></div>}
                                  </div>

                                  <div className="flex flex-wrap gap-2 my-3">
                                      {service.specialties?.map(tag => (
                                          <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-md uppercase">{tag}</span>
                                      ))}
                                  </div>

                                  <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">{service.description}</p>

                                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium bg-slate-50 p-2 rounded-lg mb-4">
                                      <MapPin size={14} className="text-slate-400" /> {service.location}
                                  </div>

                                  <div className="flex items-center gap-3 mt-auto pt-3 border-t border-slate-100">
                                      <div className="flex-1">
                                          <p className="text-[10px] text-slate-400 font-bold uppercase">Starting from</p>
                                          <p className="font-black text-slate-800 text-lg">{service.priceRange}</p>
                                      </div>
                                      <button 
                                            onClick={(e) => {
                                                e.stopPropagation(); // Don't open profile
                                                setBookingProvider(service);
                                            }}
                                            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-teal-600 transition-colors shadow-lg flex items-center gap-2"
                                        >
                                          Book <ChevronRight size={16} />
                                      </button>
                                  </div>
                              </div>
                          </div>
                      )) : (
                          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-slate-200 border-dashed">
                              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                  <Search size={24} />
                              </div>
                              <h3 className="font-bold text-slate-800">No services found</h3>
                              <p className="text-slate-500 text-sm mt-1">Try adjusting your filters or search area.</p>
                              <button onClick={() => {setSearchTerm(''); setActiveCategory('ALL'); setEmergencyMode(false)}} className="mt-4 text-teal-600 font-bold text-sm hover:underline">Clear All Filters</button>
                          </div>
                      )}
                  </div>
              )}
          </>
      )}

      {/* Provider Profile Modal */}
      {viewingProvider && (
          <ProviderProfileModal 
            provider={viewingProvider}
            onClose={() => setViewingProvider(null)}
            onBook={() => {
                setViewingProvider(null);
                setBookingProvider(viewingProvider);
            }}
            userCredits={userCredits}
            onDeductCredit={() => setUserCredits(prev => Math.max(0, prev - 1))}
            onNavigate={onNavigate}
          />
      )}

      {/* Enhanced Booking Modal */}
      {bookingProvider && (
          <BookingModal 
            provider={bookingProvider} 
            onClose={() => setBookingProvider(null)}
            onConfirm={() => {
                setBookingProvider(null);
                setBookingSuccess(true);
                setTimeout(() => setBookingSuccess(false), 4000);
            }}
          />
      )}
    </div>
  );
};

export default ServiceFinder;