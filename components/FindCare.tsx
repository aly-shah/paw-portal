
import React, { useState, useEffect, useMemo } from 'react';
import { 
    Calendar, Clock, MapPin, ArrowRight, Check, ArrowLeft, 
    Briefcase, Home, Dog, Cat, Scissors, ChevronRight, 
    Sun, Moon, Sunset, CheckCircle, Plus, Minus, AlertCircle,
    X, Users, DollarSign, Filter, Sparkles, Droplets, Wind, Heart, Stethoscope, Receipt,
    ChevronDown, MessageCircle, UserCheck, Edit3, Trash2, Utensils, Pill, Shovel, Eye, Camera, Ban, Car,
    Skull, Activity, Thermometer, Zap, Footprints, User
} from 'lucide-react';
import { MOCK_PETS, MOCK_MY_JOBS } from '../constants';
import { Pet, JobListing } from '../types';

// --- Helper Types & Data ---
type ServiceType = 'Dog Walking' | 'Pet Sitting' | 'Grooming' | 'Boarding' | 'Vet Visit' | '';

interface JobConfig {
    selectedPetId: string;
    serviceType: ServiceType;
    location: string; // New Field for User Location
    
    // Shared Scheduling
    selectedDates: string[]; // Stores ISO date strings "2023-10-27"
    timeSegment: 'Morning' | 'Afternoon' | 'Evening' | '';
    specificTime: string;
    
    // Dog Walking
    durationLabel: string; // "30 min", "60 min"
    walkingType: 'Solo' | 'Group' | '';
    walkingPace: 'Slow' | 'Normal' | 'Brisk' | 'Run' | '';
    walkingRequirements: string[];
    
    // Grooming
    groomingType: string; // "Bath & Brush", "Full Groom"
    groomingAddons: string[]; // "Teeth", "Facial"
    
    // Pet Sitting
    sittingType: 'Short Visit' | 'Day Care' | 'Overnight' | '';
    sittingLocation: 'MY_HOME' | 'SITTER_HOME';
    sittingDuties: string[];
    
    // Boarding
    boardingType: 'Home Boarding' | 'Kennel/Facility' | '';
    boardingAmenities: string[];
    dropOffDate: string;
    pickUpDate: string;

    // Vet Visit
    vetVisitType: 'Routine Checkup' | 'Vaccination' | 'Sick/Injury' | 'Transport Only' | 'Emergency' | '';
    emergencySymptoms: string[];
    vetTransport: boolean;
    vetClinicName: string;
    
    // Meta
    notes: string;
    estimatedPrice: number;
}

const INITIAL_CONFIG: JobConfig = {
    selectedPetId: '',
    serviceType: '',
    location: 'DHA Phase 6, Karachi', // Default User Profile Location
    selectedDates: [],
    timeSegment: '',
    specificTime: '',
    durationLabel: '30 min',
    walkingType: 'Solo',
    walkingPace: 'Normal',
    walkingRequirements: [],
    groomingType: '',
    groomingAddons: [],
    sittingType: '',
    sittingLocation: 'MY_HOME',
    sittingDuties: [],
    boardingType: '',
    boardingAmenities: [],
    dropOffDate: '',
    pickUpDate: '',
    vetVisitType: '',
    emergencySymptoms: [],
    vetTransport: false,
    vetClinicName: '',
    notes: '',
    estimatedPrice: 0
};

const GROOMING_SERVICES = [
    { id: 'Bath & Brush', price: 2000, icon: Droplets },
    { id: 'Hair Cut', price: 3000, icon: Scissors },
    { id: 'Full Groom', price: 4500, icon: Sparkles },
    { id: 'De-Shedding', price: 2500, icon: Wind },
    { id: 'Nails Only', price: 800, icon: Moon }, 
];

const GROOMING_ADDONS = [
    { id: 'Teeth Brushing', price: 500 },
    { id: 'Blueberry Facial', price: 800 },
    { id: 'Nail Grinding', price: 400 },
    { id: 'De-Shed Boost', price: 1000 },
    { id: 'Paw Balm', price: 300 },
];

const BOARDING_AMENITIES = [
    { id: 'Fenced Yard', icon: Home },
    { id: 'No Other Pets', icon: Ban },
    { id: 'Cageless', icon: Heart },
    { id: '24/7 Supervision', icon: Eye },
    { id: 'Updates w/ Photos', icon: Camera },
];

const EMERGENCY_TAGS = [
    { id: 'Accident/Trauma', icon: Car },
    { id: 'Not Eating', icon: Ban },
    { id: 'Vomiting', icon: AlertCircle },
    { id: 'Breathing Issues', icon: Wind },
    { id: 'Seizure', icon: Activity },
    { id: 'Bleeding', icon: Droplets },
    { id: 'Ingested Toxin', icon: Skull },
    { id: 'High Fever', icon: Thermometer },
];

const WALKING_REQS = [
    { id: 'Leash Reactive', icon: AlertCircle },
    { id: 'Friendly', icon: Heart },
    { id: 'Recall Training', icon: UserCheck },
    { id: 'No Off-Leash', icon: Ban },
    { id: 'Wipe Paws', icon: Droplets },
    { id: 'Avoid Dogs', icon: Ban }
];

const JobPostingWizard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [step, setStep] = useState(1);
    const [config, setConfig] = useState<JobConfig>(INITIAL_CONFIG);
    const [isShaking, setIsShaking] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    
    // Dynamic Calendar Generation (Next 14 days)
    const dynamicDays = useMemo(() => {
        return Array.from({ length: 14 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() + i);
            
            const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum = d.getDate();
            const dateStr = d.toISOString().split('T')[0];
            
            let topLabel = weekday;
            if (i === 0) topLabel = 'Today';
            if (i === 1) topLabel = 'Tomorrow';
            
            return { 
                id: dateStr, 
                topLabel, 
                dayNum,
                fullDate: d 
            };
        });
    }, []);

    const selectedPet = MOCK_PETS.find(p => p.id === config.selectedPetId);

    // Live Price Calculation Effect
    useEffect(() => {
        let price = 0;
        if (config.serviceType === 'Grooming') {
            const base = GROOMING_SERVICES.find(s => s.id === config.groomingType)?.price || 0;
            const addons = config.groomingAddons.reduce((sum, addonId) => {
                return sum + (GROOMING_ADDONS.find(a => a.id === addonId)?.price || 0);
            }, 0);
            price = base + addons;
        } else if (config.serviceType === 'Dog Walking') {
            price = config.durationLabel === '60 min' ? 1500 : 800;
            if (config.walkingType === 'Solo') price += 300; // Premium for solo
            if (config.walkingPace === 'Run') price += 400; // Premium for running
            if (config.selectedDates.length > 1) price *= config.selectedDates.length;
        } else if (config.serviceType === 'Pet Sitting') {
            if (config.sittingType === 'Short Visit') price = 1000;
            if (config.sittingType === 'Day Care') price = 2500;
            if (config.sittingType === 'Overnight') price = 4000;
            
            // Multiplier for days
            if (config.selectedDates.length > 1) price *= config.selectedDates.length;

            // Sitter home surcharge
            if (config.sittingLocation === 'SITTER_HOME') price += 500 * Math.max(1, config.selectedDates.length);
        } else if (config.serviceType === 'Boarding') {
            let nights = 1;
            if (config.dropOffDate && config.pickUpDate) {
                const start = new Date(config.dropOffDate);
                const end = new Date(config.pickUpDate);
                const diffTime = Math.abs(end.getTime() - start.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                nights = diffDays > 0 ? diffDays : 1;
            }
            
            let baseRate = config.boardingType === 'Home Boarding' ? 3000 : 2000;
            price = baseRate * nights;
            
            // Addons
            if (config.boardingAmenities.includes('24/7 Supervision')) price += (500 * nights);
        } else if (config.serviceType === 'Vet Visit') {
            let base = 1500; // Base service fee
            if (config.vetVisitType === 'Transport Only') base = 1000;
            if (config.vetVisitType === 'Sick/Injury') base = 2000; // Higher responsibility
            if (config.vetVisitType === 'Emergency') base = 5000; // Emergency Surcharge
            if (config.vetTransport) base += 800; // Surcharge for transport
            price = base;
        }
        setConfig(prev => ({ ...prev, estimatedPrice: price }));
    }, [config.serviceType, config.groomingType, config.groomingAddons, config.durationLabel, config.selectedDates, config.sittingType, config.sittingLocation, config.boardingType, config.dropOffDate, config.pickUpDate, config.boardingAmenities, config.vetVisitType, config.vetTransport, config.walkingType, config.walkingPace]);

    const triggerShake = () => {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
    };

    // Validation & Navigation Logic
    const canProceedFromStep3 = () => {
        if (config.serviceType === 'Grooming') {
            return !!config.groomingType && config.selectedDates.length > 0;
        }
        if (config.serviceType === 'Dog Walking') return config.selectedDates.length > 0 && !!config.timeSegment;
        if (config.serviceType === 'Pet Sitting') return !!config.sittingType && config.selectedDates.length > 0;
        if (config.serviceType === 'Boarding') return !!config.boardingType && !!config.dropOffDate && !!config.pickUpDate;
        if (config.serviceType === 'Vet Visit') {
            // Only need visit type to proceed to Step 4 (Logistics)
            return !!config.vetVisitType;
        }
        return true;
    };

    const canProceedFromStep4 = () => {
        if (config.serviceType === 'Grooming') {
            return !!config.timeSegment;
        }
        if (config.serviceType === 'Vet Visit') {
            // Must have date. Time depends on emergency status.
            if (config.vetVisitType === 'Emergency') return config.selectedDates.length > 0;
            return config.selectedDates.length > 0 && !!config.timeSegment;
        }
        if (config.serviceType === 'Dog Walking') return true; // Pace/Reqs are optional/have defaults
        return true;
    };

    const handleNext = () => {
        if (step === 1 && !config.selectedPetId) { triggerShake(); return; }
        if (step === 2 && !config.serviceType) { triggerShake(); return; }
        
        if (step === 3) {
            if (!canProceedFromStep3()) { triggerShake(); return; }
            if (['Grooming', 'Vet Visit', 'Dog Walking'].includes(config.serviceType)) {
                setStep(4); // Go to Time/Logistics/Details Selection
            } else {
                setStep(5); // Go to Review
            }
            return;
        }

        if (step === 4) {
            if (!canProceedFromStep4()) { triggerShake(); return; }
            setStep(5); // Go to Review
            return;
        }
    };

    const handleBack = () => {
        if (step === 5) {
            if (['Grooming', 'Vet Visit', 'Dog Walking'].includes(config.serviceType)) setStep(4);
            else setStep(3);
        } else {
            setStep(prev => Math.max(1, prev - 1));
        }
    };

    const handlePostJob = () => {
        setIsSuccess(true);
        setTimeout(() => {
            onClose();
        }, 2000);
    };

    // --- RENDERERS ---

    const Header = () => (
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                {selectedPet && step > 1 && (
                    <div className="flex items-center gap-2 bg-slate-100 pl-1 pr-3 py-1 rounded-full animate-in fade-in slide-in-from-left-2">
                        <img src={selectedPet.image} className="w-5 h-5 rounded-full object-cover" />
                        <span className="text-[10px] font-bold text-slate-700">{selectedPet.name}</span>
                    </div>
                )}
                {config.serviceType && step > 2 && (
                    <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded-md animate-in fade-in">
                        {config.serviceType}
                    </span>
                )}
            </div>
            <div className="flex gap-1">
                {step > 1 && (
                    <button onClick={handleBack} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                        <ArrowLeft size={16} />
                    </button>
                )}
                <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                    <X size={16} />
                </button>
            </div>
        </div>
    );

    // --- SHARED UI COMPONENTS ---
    
    const LocationInput = () => (
        <div className="mb-5 animate-in fade-in slide-in-from-top-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Job Location</label>
            <div className="relative">
                <MapPin className="absolute left-3 top-3 text-slate-400" size={16} />
                <input
                    type="text"
                    value={config.location}
                    onChange={(e) => setConfig({...config, location: e.target.value})}
                    className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                />
            </div>
            <div className="flex items-center gap-1 mt-1.5 text-[9px] text-slate-400 ml-1">
                <User size={10} />
                <span>Pre-filled from your profile</span>
            </div>
        </div>
    );

    const DatePicker = () => (
        <div className="mb-5">
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">When?</label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
                {dynamicDays.slice(0, 10).map(d => {
                    const isSelected = config.selectedDates.includes(d.id);
                    return (
                        <button
                            key={d.id}
                            onClick={() => {
                                if (config.serviceType === 'Dog Walking' || config.serviceType === 'Pet Sitting') {
                                    const newDates = isSelected 
                                        ? config.selectedDates.filter(date => date !== d.id)
                                        : [...config.selectedDates, d.id];
                                    setConfig({...config, selectedDates: newDates});
                                } else {
                                    setConfig({...config, selectedDates: [d.id]});
                                }
                            }}
                            className={`flex-shrink-0 min-w-[4.5rem] p-2 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-0.5 ${
                                isSelected 
                                ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                                : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
                            }`}
                        >
                            <span className="text-[9px] font-bold uppercase">{d.topLabel}</span>
                            <span className="text-xl font-black">{d.dayNum}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    );

    const TimeSegments = () => (
        <div className="mb-5">
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Time of Day</label>
            <div className="grid grid-cols-3 gap-2">
                {[
                    { id: 'Morning', icon: Sun },
                    { id: 'Afternoon', icon: Sun },
                    { id: 'Evening', icon: Moon }
                ].map(seg => (
                    <button
                        key={seg.id}
                        onClick={() => setConfig({...config, timeSegment: seg.id as any})}
                        className={`py-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                            config.timeSegment === seg.id
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                        }`}
                    >
                        <seg.icon size={16} />
                        <span className="text-[10px] font-bold">{seg.id}</span>
                    </button>
                ))}
            </div>
        </div>
    );

    const SpecificTimePicker = () => {
        if (!config.timeSegment) return null;
        const slots = config.timeSegment === 'Morning' ? ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM'] :
                      config.timeSegment === 'Afternoon' ? ['12:00 PM', '1:00 PM', '2:00 PM', '4:00 PM'] :
                      ['5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'];
        
        return (
            <div className="mb-5 animate-in slide-in-from-top-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Exact Time</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {slots.map(slot => (
                        <button
                            key={slot}
                            onClick={() => setConfig({...config, specificTime: slot})}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all whitespace-nowrap ${
                                config.specificTime === slot
                                ? 'bg-slate-800 text-white border-slate-800'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            {slot}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    // Step 1: Who needs care?
    const Step1 = () => (
        <div className="animate-in fade-in slide-in-from-right-8 duration-300">
            <h2 className="text-lg font-black text-slate-800 mb-4 px-1">Who needs care?</h2>
            <div className="flex gap-3 overflow-x-auto pb-4 px-1 scrollbar-hide snap-x">
                {MOCK_PETS.map(pet => (
                    <button
                        key={pet.id}
                        onClick={() => { setConfig({ ...config, selectedPetId: pet.id }); setStep(2); }}
                        className="flex-shrink-0 w-24 h-32 rounded-2xl bg-white border-2 border-slate-100 hover:border-teal-500 hover:shadow-md transition-all flex flex-col items-center justify-center gap-2 snap-center group"
                    >
                        <img src={pet.image} className="w-14 h-14 rounded-full object-cover border-2 border-slate-100 group-hover:scale-110 transition-transform" />
                        <div className="text-center">
                            <p className="font-bold text-slate-800 text-xs leading-tight">{pet.name}</p>
                            <p className="text-[10px] text-slate-400">{pet.type}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );

    // Step 2: Service Selection
    const Step2 = () => {
        const isDog = selectedPet?.type === 'Dog';
        const services = isDog 
            ? ['Grooming', 'Dog Walking', 'Pet Sitting', 'Boarding', 'Vet Visit']
            : ['Grooming', 'Pet Sitting', 'Vet Visit', 'Boarding'];

        // Vivid Color Configuration
        const serviceConfig: Record<string, { icon: any, color: string, bg: string, border: string, hoverBorder: string }> = {
            'Grooming': { icon: Scissors, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-100', hoverBorder: 'hover:border-pink-300' },
            'Dog Walking': { icon: Dog, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', hoverBorder: 'hover:border-orange-300' },
            'Pet Sitting': { icon: Home, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', hoverBorder: 'hover:border-indigo-300' },
            'Boarding': { icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', hoverBorder: 'hover:border-amber-300' },
            'Vet Visit': { icon: Stethoscope, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', hoverBorder: 'hover:border-emerald-300' }
        };

        return (
            <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                <h2 className="text-lg font-black text-slate-800 mb-4 px-1">What does {selectedPet?.name} need?</h2>
                <div className="grid grid-cols-2 gap-3 px-1">
                    {services.map(svc => {
                        const conf = serviceConfig[svc] || { icon: Check, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', hoverBorder: 'hover:border-slate-300' };
                        const Icon = conf.icon;
                        return (
                            <button
                                key={svc}
                                onClick={() => { setConfig({ ...config, serviceType: svc as ServiceType }); setStep(3); }}
                                className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${conf.bg} ${conf.border} ${conf.hoverBorder} hover:shadow-md hover:scale-[1.02]`}
                            >
                                <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm ${conf.color}`}>
                                    <Icon size={24} />
                                </div>
                                <span className={`font-bold text-sm ${conf.color}`}>{svc}</span>
                            </button>
                        )
                    })}
                </div>
            </div>
        );
    };

    // Step 3: Configuration (Primary)
    const Step3 = () => {
        if (config.serviceType === 'Grooming') {
            return (
                <div className="animate-in fade-in slide-in-from-right-8 duration-300 pb-4">
                    {/* Grooming Type Grid */}
                    <div className="mb-6">
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">What kind of groom?</label>
                        <div className="grid grid-cols-3 gap-2">
                            {GROOMING_SERVICES.map(svc => {
                                const Icon = svc.icon;
                                const isSelected = config.groomingType === svc.id;
                                return (
                                    <button
                                        key={svc.id}
                                        onClick={() => setConfig({...config, groomingType: svc.id})}
                                        className={`p-2 rounded-xl border-2 flex flex-col items-center gap-2 transition-all h-full ${
                                            isSelected 
                                            ? 'bg-pink-50 border-pink-500 text-pink-700 shadow-sm' 
                                            : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
                                        }`}
                                    >
                                        <Icon size={18} />
                                        <div className="text-center w-full">
                                            <span className="block font-bold text-[10px] mb-0.5 leading-tight">{svc.id}</span>
                                            <span className="text-[9px] opacity-70">PKR {svc.price}</span>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                    <DatePicker />
                </div>
            );
        }

        if (config.serviceType === 'Pet Sitting') {
            return (
                <div className="animate-in fade-in slide-in-from-right-8 duration-300 pb-4">
                    {/* Type Selection */}
                    <div className="mb-5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Type of Care</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: 'Short Visit', label: 'Quick Visit', sub: '30-60m' },
                                { id: 'Day Care', label: 'Day Care', sub: '8-10 hrs' },
                                { id: 'Overnight', label: 'Overnight', sub: '24 hrs' }
                            ].map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setConfig({...config, sittingType: opt.id as any})}
                                    className={`p-2 rounded-xl border-2 flex flex-col items-center justify-center text-center transition-all ${
                                        config.sittingType === opt.id
                                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                        : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
                                    }`}
                                >
                                    <span className="font-bold text-[10px]">{opt.label}</span>
                                    <span className="text-[9px] opacity-70">{opt.sub}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Location Toggle */}
                    <div className="mb-5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Location</label>
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button
                                onClick={() => setConfig({...config, sittingLocation: 'MY_HOME'})}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                                    config.sittingLocation === 'MY_HOME'
                                    ? 'bg-white text-slate-800 shadow-sm'
                                    : 'text-slate-500'
                                }`}
                            >
                                <Home size={14} /> My Home
                            </button>
                            <button
                                onClick={() => setConfig({...config, sittingLocation: 'SITTER_HOME'})}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                                    config.sittingLocation === 'SITTER_HOME'
                                    ? 'bg-white text-slate-800 shadow-sm'
                                    : 'text-slate-500'
                                }`}
                            >
                                <Briefcase size={14} /> Sitter's
                            </button>
                        </div>
                    </div>

                    <LocationInput />

                    <DatePicker />

                    {/* Duties */}
                    <div className="mb-4">
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Care Requirements</label>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { id: 'Feeding', icon: Utensils },
                                { id: 'Walk', icon: Dog },
                                { id: 'Meds', icon: Pill },
                                { id: 'Cleaning', icon: Trash2 }
                            ].map(duty => {
                                const isSelected = config.sittingDuties.includes(duty.id);
                                const Icon = duty.icon;
                                return (
                                    <button
                                        key={duty.id}
                                        onClick={() => {
                                            const newDuties = isSelected 
                                                ? config.sittingDuties.filter(d => d !== duty.id)
                                                : [...config.sittingDuties, duty.id];
                                            setConfig({...config, sittingDuties: newDuties});
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1.5 ${
                                            isSelected
                                            ? 'bg-indigo-500 text-white border-indigo-500 shadow-sm'
                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <Icon size={12} /> {duty.id}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            );
        }

        if (config.serviceType === 'Boarding') {
            return (
                <div className="animate-in fade-in slide-in-from-right-8 duration-300 pb-4">
                    {/* Type Selection */}
                    <div className="mb-5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Setting</label>
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button
                                onClick={() => setConfig({...config, boardingType: 'Home Boarding'})}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                                    config.boardingType === 'Home Boarding'
                                    ? 'bg-white text-slate-800 shadow-sm'
                                    : 'text-slate-500'
                                }`}
                            >
                                <Home size={14} /> Home Boarding
                            </button>
                            <button
                                onClick={() => setConfig({...config, boardingType: 'Kennel/Facility'})}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                                    config.boardingType === 'Kennel/Facility'
                                    ? 'bg-white text-slate-800 shadow-sm'
                                    : 'text-slate-500'
                                }`}
                            >
                                <Briefcase size={14} /> Kennel / Facility
                            </button>
                        </div>
                    </div>

                    <LocationInput />

                    {/* Drop Off Date */}
                    <div className="mb-4">
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Drop-Off Date</label>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
                            {dynamicDays.slice(0, 12).map(d => {
                                const isSelected = config.dropOffDate === d.id;
                                return (
                                    <button
                                        key={d.id}
                                        onClick={() => {
                                            setConfig(prev => ({ ...prev, dropOffDate: d.id, pickUpDate: '' }));
                                        }}
                                        className={`flex-shrink-0 min-w-[4.5rem] p-2 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-0.5 ${
                                            isSelected 
                                            ? 'bg-amber-500 border-amber-500 text-white shadow-md' 
                                            : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
                                        }`}
                                    >
                                        <span className="text-[9px] font-bold uppercase">{d.topLabel}</span>
                                        <span className="text-xl font-black">{d.dayNum}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Pick Up Date */}
                    <div className="mb-5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Pick-Up Date</label>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
                            {dynamicDays.slice(0, 14).map(d => {
                                const isSelected = config.pickUpDate === d.id;
                                const isDisabled = config.dropOffDate && new Date(d.id) <= new Date(config.dropOffDate);
                                
                                return (
                                    <button
                                        key={d.id}
                                        disabled={!!isDisabled}
                                        onClick={() => setConfig({...config, pickUpDate: d.id})}
                                        className={`flex-shrink-0 min-w-[4.5rem] p-2 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-0.5 ${
                                            isSelected 
                                            ? 'bg-amber-500 border-amber-500 text-white shadow-md' 
                                            : isDisabled 
                                                ? 'bg-slate-50 border-slate-50 text-slate-300 cursor-not-allowed'
                                                : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
                                        }`}
                                    >
                                        <span className="text-[9px] font-bold uppercase">{d.topLabel}</span>
                                        <span className="text-xl font-black">{d.dayNum}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Amenities */}
                    <div className="mb-4">
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Requirements & Amenities</label>
                        <div className="flex flex-wrap gap-2">
                            {BOARDING_AMENITIES.map(amenity => {
                                const isSelected = config.boardingAmenities.includes(amenity.id);
                                const Icon = amenity.icon;
                                return (
                                    <button
                                        key={amenity.id}
                                        onClick={() => {
                                            const newAmenities = isSelected 
                                                ? config.boardingAmenities.filter(a => a !== amenity.id)
                                                : [...config.boardingAmenities, amenity.id];
                                            setConfig({...config, boardingAmenities: newAmenities});
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1.5 ${
                                            isSelected
                                            ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <Icon size={12} /> {amenity.id}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            );
        }

        if (config.serviceType === 'Vet Visit') {
            return (
                <div className="animate-in fade-in slide-in-from-right-8 duration-300 pb-4">
                    {/* Visit Type */}
                    <div className="mb-5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Reason for Visit</label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { id: 'Routine Checkup', color: 'emerald' },
                                { id: 'Vaccination', color: 'blue' },
                                { id: 'Sick/Injury', color: 'amber' },
                                { id: 'Transport Only', color: 'slate' },
                                { id: 'Emergency', color: 'red', icon: AlertCircle, fullWidth: true }
                            ].map(type => {
                                const isSelected = config.vetVisitType === type.id;
                                let activeClass = '';
                                if(type.color === 'emerald') activeClass = 'bg-emerald-50 border-emerald-500 text-emerald-700';
                                if(type.color === 'blue') activeClass = 'bg-blue-50 border-blue-500 text-blue-700';
                                if(type.color === 'amber') activeClass = 'bg-amber-50 border-amber-500 text-amber-700';
                                if(type.color === 'slate') activeClass = 'bg-slate-100 border-slate-400 text-slate-700';
                                if(type.color === 'red') activeClass = 'bg-red-50 border-red-500 text-red-700';

                                return (
                                    <button
                                        key={type.id}
                                        onClick={() => {
                                            const newType = type.id as any;
                                            
                                            // Auto select dates for Emergency (Today and Tomorrow)
                                            let newDates = config.selectedDates;
                                            if (newType === 'Emergency') {
                                                const today = new Date();
                                                const tomorrow = new Date(today);
                                                tomorrow.setDate(tomorrow.getDate() + 1);
                                                newDates = [
                                                    today.toISOString().split('T')[0],
                                                    tomorrow.toISOString().split('T')[0]
                                                ];
                                            }

                                            setConfig(prev => ({
                                                ...prev, 
                                                vetVisitType: newType,
                                                selectedDates: newType === 'Emergency' ? newDates : prev.selectedDates,
                                                // Reset specific symptoms if unselecting emergency
                                                emergencySymptoms: newType !== 'Emergency' ? [] : prev.emergencySymptoms,
                                                // Auto-check transport if Transport Only
                                                vetTransport: newType === 'Transport Only' ? true : prev.vetTransport
                                            }));
                                        }}
                                        className={`p-3 rounded-xl border-2 text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                                            isSelected
                                            ? `${activeClass} shadow-sm`
                                            : `bg-white border-slate-100 text-slate-500 hover:border-slate-300 ${type.color === 'red' ? 'hover:border-red-200 hover:text-red-500' : ''}`
                                        } ${type.fullWidth ? 'col-span-2' : ''}`}
                                    >
                                        {type.icon && <type.icon size={14} />}
                                        {type.id}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Emergency Symptoms Expansion */}
                    {config.vetVisitType === 'Emergency' && (
                        <div className="mb-6 bg-red-50 rounded-2xl p-4 border border-red-100 animate-in slide-in-from-top-4 fade-in duration-300">
                            <h4 className="text-xs font-bold text-red-700 uppercase mb-3 flex items-center gap-2">
                                <AlertCircle size={14} /> Emergency Symptoms
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                                {EMERGENCY_TAGS.map(tag => {
                                    const isActive = config.emergencySymptoms.includes(tag.id);
                                    const Icon = tag.icon;
                                    return (
                                        <button
                                            key={tag.id}
                                            onClick={() => {
                                                const newSymptoms = isActive 
                                                    ? config.emergencySymptoms.filter(s => s !== tag.id)
                                                    : [...config.emergencySymptoms, tag.id];
                                                setConfig({...config, emergencySymptoms: newSymptoms});
                                            }}
                                            className={`p-2 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-2 text-left ${
                                                isActive 
                                                ? 'bg-white border-red-400 text-red-600 shadow-sm ring-1 ring-red-200' 
                                                : 'bg-white/50 border-red-100 text-red-400 hover:bg-white hover:text-red-500'
                                            }`}
                                        >
                                            <Icon size={12} /> {tag.id}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        if (config.serviceType === 'Dog Walking') {
            return (
                <div className="animate-in fade-in slide-in-from-right-8 duration-300 pb-4">
                    
                    {/* Walk Type / Style */}
                    <div className="mb-5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Walk Style</label>
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button
                                onClick={() => setConfig({...config, walkingType: 'Solo'})}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                                    config.walkingType === 'Solo'
                                    ? 'bg-white text-slate-800 shadow-sm'
                                    : 'text-slate-500'
                                }`}
                            >
                                <User size={14} /> Solo Walk
                            </button>
                            <button
                                onClick={() => setConfig({...config, walkingType: 'Group'})}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                                    config.walkingType === 'Group'
                                    ? 'bg-white text-slate-800 shadow-sm'
                                    : 'text-slate-500'
                                }`}
                            >
                                <Users size={14} /> Group Walk
                            </button>
                        </div>
                    </div>

                    <DatePicker />
                    <TimeSegments />
                    
                    <div className="mb-5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Duration</label>
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            {['30 min', '60 min'].map(d => (
                                <button
                                    key={d}
                                    onClick={() => setConfig({...config, durationLabel: d})}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                                        config.durationLabel === d
                                        ? 'bg-white text-slate-800 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        // Fallback for other types (simplified for brevity in this specific update)
        return (
            <div className="animate-in fade-in slide-in-from-right-8 duration-300 pb-4">
                <h3 className="text-base font-black text-slate-800 mb-4 text-center">{config.serviceType} Details</h3>
                <DatePicker />
                <TimeSegments />
            </div>
        );
    };

    // Step 4: Configuration (Secondary - Logistics/Details)
    const Step4 = () => {
        if (config.serviceType === 'Grooming') {
            return (
                <div className="animate-in fade-in slide-in-from-right-8 duration-300 pb-4">
                    <LocationInput />
                    <TimeSegments />
                    <SpecificTimePicker />

                    {/* Add-ons */}
                    <div className="mb-4">
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Add-ons</label>
                        <div className="flex flex-wrap gap-2">
                            {GROOMING_ADDONS.map(addon => {
                                const isSelected = config.groomingAddons.includes(addon.id);
                                return (
                                    <button
                                        key={addon.id}
                                        onClick={() => {
                                            const newAddons = isSelected 
                                                ? config.groomingAddons.filter(id => id !== addon.id)
                                                : [...config.groomingAddons, addon.id];
                                            setConfig({...config, groomingAddons: newAddons});
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1.5 ${
                                            isSelected
                                            ? 'bg-pink-500 text-white border-pink-500 shadow-sm'
                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        {isSelected && <Check size={10} strokeWidth={3} />}
                                        {addon.id} <span className="opacity-70">(+{addon.price})</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            );
        }

        if (config.serviceType === 'Vet Visit') {
            return (
                <div className="animate-in fade-in slide-in-from-right-8 duration-300 pb-4">
                    <div className="mb-4 text-center">
                        <h3 className="text-base font-black text-slate-800">Logistics</h3>
                    </div>

                    <LocationInput />
                    <DatePicker />
                    
                    {/* Simplified Time for Emergency */}
                    {config.vetVisitType !== 'Emergency' ? (
                        <>
                            <TimeSegments />
                            <SpecificTimePicker />
                        </>
                    ) : (
                        <div className="mb-5 bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-3">
                            <div className="p-2 bg-white rounded-full text-red-600 shadow-sm">
                                <Clock size={16} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-red-700 uppercase">Time Preference</p>
                                <p className="text-sm font-medium text-red-600">Immediately / ASAP</p>
                            </div>
                        </div>
                    )}

                    {/* Transport Toggle */}
                    <div className="mb-5">
                        <button
                            onClick={() => setConfig(prev => ({...prev, vetTransport: !prev.vetTransport}))}
                            className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
                                config.vetTransport
                                ? 'bg-blue-50 border-blue-500'
                                : 'bg-white border-slate-200'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${config.vetTransport ? 'bg-blue-200 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>
                                    <Car size={18} />
                                </div>
                                <div className="text-left">
                                    <p className={`text-xs font-bold ${config.vetTransport ? 'text-blue-800' : 'text-slate-700'}`}>Transport Needed</p>
                                    <p className="text-[10px] text-slate-500">Caregiver needs to drive pet</p>
                                </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${config.vetTransport ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`}>
                                {config.vetTransport && <Check size={12} className="text-white" />}
                            </div>
                        </button>
                    </div>

                    {/* Clinic Name */}
                    <div className="mb-4">
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Preferred Clinic (Optional)</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 text-slate-400" size={16} />
                            <input 
                                type="text" 
                                placeholder="e.g. Downtown Vet Clinic"
                                value={config.vetClinicName}
                                onChange={(e) => setConfig({...config, vetClinicName: e.target.value})}
                                className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                    </div>
                </div>
            );
        }

        if (config.serviceType === 'Dog Walking') {
            return (
                <div className="animate-in fade-in slide-in-from-right-8 duration-300 pb-4">
                    <div className="mb-4 text-center">
                        <h3 className="text-base font-black text-slate-800">Walk Details</h3>
                    </div>

                    {/* Pace & Energy */}
                    <div className="mb-5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Pace & Intensity</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: 'Slow', icon: Footprints, label: 'Sniff' },
                                { id: 'Normal', icon: Dog, label: 'Standard' },
                                { id: 'Run', icon: Zap, label: 'Run' }
                            ].map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setConfig({...config, walkingPace: opt.id as any})}
                                    className={`py-2 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                                        config.walkingPace === opt.id
                                        ? 'bg-orange-50 border-orange-500 text-orange-700'
                                        : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                                    }`}
                                >
                                    <opt.icon size={16} />
                                    <span className="text-[10px] font-bold">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <LocationInput />

                    {/* Requirements */}
                    <div className="mb-5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Requirements</label>
                        <div className="flex flex-wrap gap-2">
                            {WALKING_REQS.map(req => {
                                const isActive = config.walkingRequirements.includes(req.id);
                                const Icon = req.icon;
                                return (
                                    <button
                                        key={req.id}
                                        onClick={() => {
                                            const newReqs = isActive
                                                ? config.walkingRequirements.filter(r => r !== req.id)
                                                : [...config.walkingRequirements, req.id];
                                            setConfig({...config, walkingRequirements: newReqs});
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1.5 ${
                                            isActive
                                            ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <Icon size={12} /> {req.id}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Note (Optional)</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Park preferred..."
                            value={config.notes}
                            onChange={(e) => setConfig({...config, notes: e.target.value})}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                        />
                    </div>
                </div>
            );
        }

        return null;
    };

    // Step 5: Review
    const Step5_Review = () => {
        const displayDate = config.selectedDates.length > 0 
            ? dynamicDays.find(d => d.id === config.selectedDates[0])?.topLabel === 'Today' 
                ? 'Today' 
                : new Date(config.selectedDates[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : 'Date not selected';

        return (
            <div className="animate-in fade-in slide-in-from-right-8 duration-300 pb-4">
                <div className="text-center mb-6">
                    <h3 className="text-xl font-black text-slate-800">Review Job</h3>
                    <p className="text-xs text-slate-500">Check details before posting.</p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                    <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
                        <img src={selectedPet?.image} className="w-12 h-12 rounded-xl object-cover" />
                        <div>
                            <h4 className="font-bold text-slate-800 text-sm">{config.serviceType} for {selectedPet?.name}</h4>
                            <p className="text-xs text-slate-500">{config.groomingType || config.sittingType || config.boardingType || config.vetVisitType || config.serviceType}</p>
                            {config.vetVisitType === 'Emergency' && (
                                <div className="mt-1">
                                    <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 w-fit border border-red-200">
                                        <AlertCircle size={10} /> High Priority
                                    </span>
                                    {/* Emergency Tags Display */}
                                    {config.emergencySymptoms.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                            {config.emergencySymptoms.map(sym => (
                                                <span key={sym} className="text-[9px] bg-white border border-red-200 text-red-600 px-1.5 py-0.5 rounded font-medium">{sym}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Location</p>
                            <p className="text-sm font-bold text-slate-700 flex items-center gap-1">
                                <MapPin size={12} className="text-slate-400" /> {config.location}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Date</p>
                            {config.serviceType === 'Boarding' ? (
                                <p className="text-sm font-bold text-slate-700">
                                    {new Date(config.dropOffDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(config.pickUpDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </p>
                            ) : (
                                <p className="text-sm font-bold text-slate-700">{displayDate}</p>
                            )}
                        </div>
                        {config.serviceType !== 'Boarding' && (
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase font-bold">Time</p>
                                <p className="text-sm font-bold text-slate-700">{config.specificTime || config.timeSegment || (config.vetVisitType === 'Emergency' ? 'ASAP' : 'All Day')}</p>
                            </div>
                        )}
                        {config.sittingLocation && (
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase font-bold">Setting</p>
                                <p className="text-sm font-bold text-slate-700">{config.sittingLocation === 'MY_HOME' ? 'My Home' : "Sitter's"}</p>
                            </div>
                        )}
                        {config.vetTransport && (
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase font-bold">Transport</p>
                                <p className="text-sm font-bold text-blue-600 flex items-center gap-1"><Car size={12}/> Requested</p>
                            </div>
                        )}
                        {config.vetClinicName && (
                            <div className="col-span-2">
                                <p className="text-[10px] text-slate-400 uppercase font-bold">Clinic</p>
                                <p className="text-sm font-bold text-slate-700">{config.vetClinicName}</p>
                            </div>
                        )}
                        {config.serviceType === 'Dog Walking' && (
                            <>
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold">Style</p>
                                    <p className="text-sm font-bold text-slate-700">{config.walkingType} Walk</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold">Pace</p>
                                    <p className="text-sm font-bold text-slate-700">{config.walkingPace}</p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Grooming Addons */}
                    {config.groomingAddons.length > 0 && (
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Add-ons</p>
                            <div className="flex flex-wrap gap-1">
                                {config.groomingAddons.map(a => (
                                    <span key={a} className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600">{a}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Pet Sitting Duties */}
                    {config.sittingDuties.length > 0 && (
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Duties</p>
                            <div className="flex flex-wrap gap-1">
                                {config.sittingDuties.map(d => (
                                    <span key={d} className="text-[10px] bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded text-indigo-700 font-bold">{d}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Walking Requirements */}
                    {config.walkingRequirements.length > 0 && (
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Requirements</p>
                            <div className="flex flex-wrap gap-1">
                                {config.walkingRequirements.map(d => (
                                    <span key={d} className="text-[10px] bg-orange-50 border border-orange-100 px-2 py-0.5 rounded text-orange-700 font-bold">{d}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Boarding Amenities */}
                    {config.boardingAmenities.length > 0 && (
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Requirements</p>
                            <div className="flex flex-wrap gap-1">
                                {config.boardingAmenities.map(a => (
                                    <span key={a} className="text-[10px] bg-amber-50 border border-amber-100 px-2 py-0.5 rounded text-amber-700 font-bold">{a}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-6 bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Receipt size={16}/></div>
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Est. Budget (Private)</p>
                            <p className="text-lg font-black text-slate-900">PKR {config.estimatedPrice}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // --- MAIN COMPONENT RETURN ---
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            {isSuccess ? (
                <div className="bg-white w-[300px] h-[300px] rounded-full shadow-2xl flex flex-col items-center justify-center animate-in zoom-in duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-emerald-50 animate-pulse"></div>
                    <div className="relative z-10 text-center p-6">
                        <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200 animate-bounce-slow">
                            <Check size={32} strokeWidth={4} />
                        </div>
                        <h3 className="text-xl font-black text-slate-800">Job Posted!</h3>
                        <p className="text-xs text-slate-500 mt-2">Caregivers nearby have been notified.</p>
                    </div>
                </div>
            ) : (
                <div 
                    className={`bg-white w-full max-w-[400px] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${isShaking ? 'translate-x-[-5px]' : ''}`}
                    style={{ maxHeight: '85vh' }}
                >
                    <div className="px-6 pt-6 pb-2 shrink-0 bg-white z-10">
                        <Header />
                    </div>

                    <div className="px-6 pb-2 flex-1 overflow-y-auto scrollbar-hide">
                        <div className="min-h-[200px]">
                            {step === 1 && <Step1 />}
                            {step === 2 && <Step2 />}
                            {step === 3 && <Step3 />}
                            {step === 4 && <Step4 />}
                            {step === 5 && <Step5_Review />}
                        </div>
                    </div>

                    {/* Dynamic Footer Buttons */}
                    <div className="p-4 border-t border-slate-100 bg-white shrink-0 animate-in slide-in-from-bottom-2">
                        {step < 5 ? (
                            <div className="flex items-center justify-between">
                                <div>
                                    {step >= 3 && (
                                        <>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Est. Total</p>
                                            <p className="text-xl font-black text-slate-800">PKR {config.estimatedPrice}</p>
                                        </>
                                    )}
                                </div>
                                <button 
                                    onClick={handleNext}
                                    className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold shadow-xl hover:bg-slate-800 transition-transform active:scale-95 flex items-center gap-2 text-sm"
                                >
                                    {(step === 3 && (['Grooming', 'Vet Visit', 'Dog Walking'].includes(config.serviceType))) ? 'Next' : 'Review'} <ArrowRight size={16} />
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={handlePostJob}
                                className="w-full bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold shadow-xl hover:bg-emerald-600 transition-transform active:scale-95 flex items-center justify-center gap-2 text-sm"
                            >
                                Post Job <Check size={18} />
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Responsive Job Card Sub-Component ---
const JobCard: React.FC<{ job: JobListing; onCloseJob: (id: string) => void }> = ({ job, onCloseJob }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [acceptedApplicantId, setAcceptedApplicantId] = useState<string | null>(null);
    const [actionNote, setActionNote] = useState<string | null>(null);

    const flashNote = (msg: string) => {
        setActionNote(msg);
        setTimeout(() => setActionNote(null), 2500);
    };

    return (
        <div 
            onClick={() => setIsExpanded(!isExpanded)}
            className={`bg-white rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden relative ${
                isExpanded 
                ? 'border-slate-400 shadow-xl ring-1 ring-slate-200 z-10 scale-[1.02]' 
                : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
            }`}
        >
            {/* Status Line */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${job.status === 'OPEN' ? 'bg-emerald-500' : 'bg-slate-300'}`} />

            {/* Header / Summary Row */}
            <div className="p-4 flex flex-col md:flex-row md:items-center gap-4 pl-6">
                {/* Left: Avatar & Basic Info */}
                <div className="flex items-center gap-4 md:w-1/3">
                    <img src={job.petImage} className="w-12 h-12 rounded-full object-cover border border-slate-100" />
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-800 text-sm">{job.type}</h4>
                            {job.status === 'OPEN' && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase">Open</span>
                            )}
                        </div>
                        <p className="text-xs text-slate-500">for {job.petName} • {job.petBreed}</p>
                    </div>
                </div>

                {/* Middle: Schedule & Pay */}
                <div className="flex justify-between md:justify-center md:flex-1 gap-6 border-t md:border-t-0 border-slate-50 pt-3 md:pt-0">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><Calendar size={10}/> Date & Time</p>
                        <p className="text-xs font-bold text-slate-700 mt-0.5">{job.date}, {job.time}</p>
                    </div>
                    <div className="text-right md:text-left">
                        <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 justify-end md:justify-start"><DollarSign size={10}/> Budget</p>
                        <p className="text-sm font-black text-slate-800 mt-0.5">PKR {job.pay}</p>
                    </div>
                </div>

                {/* Right: Quick Stats or Expand Icon */}
                <div className="flex items-center justify-between md:justify-end gap-4 md:w-1/4 border-t md:border-t-0 border-slate-50 pt-3 md:pt-0">
                    <div className="flex -space-x-2">
                        {job.applicants.length > 0 ? (
                            <>
                                {job.applicants.slice(0,3).map((app, i) => (
                                    <img key={i} src={app.avatar} className="w-8 h-8 rounded-full border-2 border-white" title={app.name} />
                                ))}
                                {job.applicants.length > 3 && (
                                    <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">
                                        +{job.applicants.length - 3}
                                    </div>
                                )}
                            </>
                        ) : (
                            <span className="text-[10px] text-slate-400 font-medium italic px-2">No applicants</span>
                        )}
                    </div>
                    
                    <div className={`w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-slate-200 text-slate-600' : ''}`}>
                        <ChevronDown size={16} />
                    </div>
                </div>
            </div>

            {/* Expanded Content */}
            <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                        
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Job Details Column */}
                            <div className="flex-1 space-y-4">
                                <div>
                                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Requirements</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {job.requirements?.map((req, i) => (
                                            <span key={i} className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-600">{req}</span>
                                        )) || <span className="text-xs text-slate-400 italic">None listed</span>}
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); flashNote('Editing is not available in this demo.'); }}
                                        className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 flex items-center gap-2 transition-colors">
                                        <Edit3 size={14} /> Edit Job
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onCloseJob(job.id); }}
                                        disabled={job.status === 'CANCELLED'}
                                        className="px-4 py-2 bg-white border border-slate-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50 hover:border-red-100 flex items-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                                        <Trash2 size={14} /> {job.status === 'CANCELLED' ? 'Closed' : 'Close Job'}
                                    </button>
                                </div>
                                {actionNote && (
                                    <p className="text-[11px] font-bold text-slate-500 animate-in fade-in">{actionNote}</p>
                                )}
                            </div>

                            {/* Applicants Column */}
                            <div className="flex-1">
                                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Applicants ({job.applicants.length})</h5>
                                {job.applicants.length > 0 ? (
                                    <div className="space-y-3">
                                        {job.applicants.map(applicant => (
                                            <div key={applicant.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-slate-300 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <img src={applicant.avatar} className="w-10 h-10 rounded-full object-cover" />
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-800">{applicant.name}</p>
                                                        <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold">
                                                            <span className="text-slate-400">{applicant.rating}</span> ★
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); flashNote(`Messaging ${applicant.name} is not available in this demo.`); }}
                                                        className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Message">
                                                        <MessageCircle size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setAcceptedApplicantId(applicant.id); flashNote(`${applicant.name} accepted!`); }}
                                                        disabled={acceptedApplicantId === applicant.id}
                                                        className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-1 disabled:bg-emerald-600">
                                                        <UserCheck size={14} /> {acceptedApplicantId === applicant.id ? 'Accepted' : 'Accept'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 bg-white border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                                        No applicants yet.
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
};

// --- Main Section Export ---
export const FindCareSection: React.FC = () => {
    const [showWizard, setShowWizard] = useState(false);
    const [myJobs, setMyJobs] = useState<JobListing[]>(MOCK_MY_JOBS);
    const [activeFilter, setActiveFilter] = useState('All Jobs');

    const filterStatusMap: Record<string, JobListing['status'] | undefined> = {
        'All Jobs': undefined,
        'Active': 'OPEN',
        'Filled': 'FILLED',
        'Drafts': 'CANCELLED',
    };

    const visibleJobs = myJobs.filter(job => {
        const status = filterStatusMap[activeFilter];
        return status ? job.status === status : true;
    });

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-800">My Posted Jobs</h2>
                    <p className="text-slate-500 font-medium">Manage your active care requests and view applicants.</p>
                </div>
                <button 
                    onClick={() => setShowWizard(true)}
                    className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2"
                >
                    <Plus size={18} /> Create a Job Listing
                </button>
            </div>

            {/* Filters Row */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['All Jobs', 'Active', 'Filled', 'Drafts'].map(filter => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-4 py-2 rounded-full text-xs font-bold border transition-all whitespace-nowrap ${filter === activeFilter ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Interactive List View */}
            <div className="space-y-3">
                {visibleJobs.map(job => (
                    <JobCard key={job.id} job={job} onCloseJob={(id) => setMyJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'CANCELLED' } : j))} />
                ))}

                {/* Empty State */}
                {visibleJobs.length === 0 && (
                    <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                        <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">{myJobs.length === 0 ? 'No jobs posted yet.' : 'No jobs match this filter.'}</p>
                        {myJobs.length === 0 && (
                            <button onClick={() => setShowWizard(true)} className="mt-4 text-teal-600 font-bold text-sm hover:underline">Post your first job</button>
                        )}
                    </div>
                )}
            </div>

            {showWizard && <JobPostingWizard onClose={() => setShowWizard(false)} />}
        </div>
    );
};
