
import React, { useState, useMemo } from 'react';
import { MOCK_PATIENTS_DETAILED, PET_TAXONOMY } from '../constants';
import { UserRole, Pet } from '../types';
import { Stethoscope, ChevronRight, X, Plus, Pill, Cat, Dog, Bird, Rabbit, Sparkles, Fish, Rat, Camera, LayoutGrid, Navigation, ShoppingBag, Users, Syringe, Scissors, Bell, Calendar, HeartPulse, Flame, Gift, ArrowRight, Clock } from 'lucide-react';
import DayStream from './vet/DayStream';
import ActiveVisit from './vet/ActiveVisit';
import TransactionEngine from './vet/TransactionEngine';
import VendorDashboard from './vendor/VendorDashboard';
import CareGiverDashboard from './care/CareGiverDashboard';
import ClinicDashboard from './clinic/ClinicDashboard';
import { usePawData } from '../contexts/PawDataContext';
import { useAuth } from '../contexts/AuthContext';
import { fileToDataUrl } from '../services/image';

interface DashboardProps {
    role: UserRole;
    onNavigate?: (tab: string, context?: any) => void;
    currentTab?: string;
}

// Updated Vet Dashboard Orchestrator
const VetDashboard = () => {
    const [viewMode, setViewMode] = useState<'STREAM' | 'VISIT' | 'TRANSACTION'>('STREAM');
    const [activePatientId, setActivePatientId] = useState<string | null>(null);
    const [visitData, setVisitData] = useState<any>(null);

    const activePatient = MOCK_PATIENTS_DETAILED.find(p => p.id === activePatientId);

    const startVisit = (patientId: string) => {
        setActivePatientId(patientId);
        setViewMode('VISIT');
    };

    const endVisit = (data: any) => {
        setVisitData(data);
        setViewMode('TRANSACTION');
    };

    const completeTransaction = () => {
        setViewMode('STREAM');
        setActivePatientId(null);
        setVisitData(null);
    };

    if (viewMode === 'VISIT' && activePatient) {
        return <ActiveVisit patient={activePatient} onEndVisit={endVisit} onBack={() => setViewMode('STREAM')} />;
    }

    if (viewMode === 'TRANSACTION' && activePatient) {
        return <TransactionEngine patient={activePatient} visitData={visitData} onComplete={completeTransaction} />;
    }

    // Default: Day Stream
    return <DayStream onStartVisit={startVisit} />;
};

// --- ADD PET WIZARD COMPONENT ---
interface AddPetWizardProps {
    onClose: () => void;
    onSave: (pet: Pet) => void;
}

const AddPetWizard: React.FC<AddPetWizardProps> = ({ onClose, onSave }) => {
    const [step, setStep] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [isOtherBreed, setIsOtherBreed] = useState(false);
    const [formData, setFormData] = useState<Partial<Pet>>({
        name: '',
        age: 0,
        gender: 'Male',
        dynamicDetails: {},
        image: ''
    });
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const iconMap: Record<string, any> = {
        'Cat': Cat,
        'Dog': Dog,
        'Bird': Bird,
        'Rabbit': Rabbit,
        'Fish': Fish,
        'Rat': Rat
    };

    const handleCategorySelect = (category: any) => {
        setSelectedCategory(category);
        setFormData(prev => ({ ...prev, type: category.id }));
        setStep(2);
        setIsOtherBreed(false);
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

    const handleSubmit = () => {
        const newPet: Pet = {
            id: `p${Date.now()}`,
            name: formData.name || 'New Pet',
            type: selectedCategory.label,
            breed: formData.breed || 'Unknown',
            age: formData.age || 0,
            weight: 0,
            image: formData.image || `https://picsum.photos/seed/${Date.now()}/200/200`,
            gender: formData.gender as 'Male' | 'Female',
            dynamicDetails: formData.dynamicDetails,
            isPublic: false
        };
        onSave(newPet);
    };

    const handleBreedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val === 'Other') {
            setIsOtherBreed(true);
            setFormData(prev => ({ ...prev, breed: '' }));
        } else {
            setIsOtherBreed(false);
            setFormData(prev => ({ ...prev, breed: val }));
        }
    };

    const handleDynamicFieldChange = (key: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            dynamicDetails: {
                ...prev.dynamicDetails,
                [key]: value
            }
        }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h3 className="text-xl font-black text-slate-800">
                            {step === 1 ? "Add a New Pet" : `Tell us about your ${selectedCategory?.label}`}
                        </h3>
                        <p className="text-sm text-slate-500">
                            {step === 1 ? "Select the type of animal to get started." : "Customize your pet's profile."}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-8">
                    {step === 1 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {PET_TAXONOMY.map((cat) => {
                                const Icon = iconMap[cat.icon] || Rabbit;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => handleCategorySelect(cat)}
                                        className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-slate-100 hover:border-teal-500 hover:bg-teal-50 transition-all group"
                                    >
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-400 group-hover:text-teal-600 shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                            <Icon size={32} />
                                        </div>
                                        <h4 className="font-bold text-lg text-slate-800">{cat.label}</h4>
                                        <p className="text-sm text-slate-400 italic">{cat.localLabel}</p>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="space-y-6 max-w-lg mx-auto">
                            {/* Image Upload Section */}
                            <div className="flex flex-col items-center">
                                <div className="relative group">
                                    <div className="w-28 h-28 rounded-full bg-slate-100 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                                        {formData.image ? (
                                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <Cat size={40} className="text-slate-300" />
                                        )}
                                    </div>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute bottom-0 right-0 p-2.5 bg-teal-600 text-white rounded-full shadow-lg hover:bg-teal-700 transition-colors transform hover:scale-110"
                                    >
                                        <Camera size={16} />
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                </div>
                                <p className="text-xs font-bold text-slate-400 mt-3 uppercase tracking-wider">Profile Photo</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pet Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
                                        placeholder="e.g. Motu"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Age (Years)</label>
                                        <input
                                            type="number"
                                            value={formData.age}
                                            onChange={(e) => setFormData({...formData, age: parseInt(e.target.value)})}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gender</label>
                                        <select
                                            value={formData.gender}
                                            onChange={(e) => setFormData({...formData, gender: e.target.value as 'Male' | 'Female'})}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Breed / Type</label>
                                    <select
                                        value={isOtherBreed ? 'Other' : formData.breed}
                                        onChange={handleBreedChange}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
                                    >
                                        <option value="">Select Breed</option>
                                        {selectedCategory.breeds.map((b: string) => (
                                            <option key={b} value={b}>{b}</option>
                                        ))}
                                        <option value="Other">Other</option>
                                    </select>

                                    {isOtherBreed && (
                                        <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                                             <input
                                                type="text"
                                                value={formData.breed}
                                                onChange={(e) => setFormData({...formData, breed: e.target.value})}
                                                className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
                                                placeholder="Enter specific breed..."
                                                autoFocus
                                            />
                                        </div>
                                    )}
                                </div>

                                {selectedCategory.dynamicFields.length > 0 && (
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                                        <h5 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                            <Sparkles size={14} className="text-teal-500" /> Species Specifics
                                        </h5>
                                        {selectedCategory.dynamicFields.map((field: any) => (
                                            <div key={field.key}>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{field.label}</label>
                                                {field.type === 'select' ? (
                                                    <select
                                                        onChange={(e) => handleDynamicFieldChange(field.key, e.target.value)}
                                                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                                    >
                                                        <option value="">Select...</option>
                                                        {field.options.map((opt: string) => (
                                                            <option key={opt} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                ) : field.type === 'boolean' ? (
                                                    <div className="flex gap-4">
                                                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                                                            <input type="radio" name={field.key} value="true" onChange={() => handleDynamicFieldChange(field.key, true)} className="text-teal-600 focus:ring-teal-500" /> Yes
                                                        </label>
                                                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                                                            <input type="radio" name={field.key} value="false" onChange={() => handleDynamicFieldChange(field.key, false)} className="text-teal-600 focus:ring-teal-500" /> No
                                                        </label>
                                                    </div>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        onChange={(e) => handleDynamicFieldChange(field.key, e.target.value)}
                                                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                    {step === 2 && (
                        <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors">
                            Back
                        </button>
                    )}
                    {step === 2 ? (
                         <button onClick={handleSubmit} className="px-8 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-200 transition-colors">
                            Complete Profile
                        </button>
                    ) : (
                        <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors">
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Helpers (Owner Dashboard) ---
const dayMs = 86_400_000;
const daysUntil = (iso: string) => Math.round((new Date(iso).getTime() - Date.now()) / dayMs);
const fmtWhen = (iso: string) => {
    const d = daysUntil(iso);
    if (d < 0) return `${Math.abs(d)}d overdue`;
    if (d === 0) return 'Today';
    if (d === 1) return 'Tomorrow';
    return `in ${d}d`;
};
const fmtDateTime = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) +
    ' · ' + new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

const reminderIcon: Record<string, React.ElementType> = {
    VACCINE: Syringe, MEDICATION: Pill, CHECKUP: Stethoscope, GROOMING: Scissors, OTHER: Bell,
};
const reminderAccent: Record<string, string> = {
    VACCINE: 'bg-rose-50 text-rose-600',
    MEDICATION: 'bg-blue-50 text-blue-600',
    CHECKUP: 'bg-teal-50 text-teal-600',
    GROOMING: 'bg-purple-50 text-purple-600',
    OTHER: 'bg-slate-100 text-slate-600',
};

// --- Owner Dashboard ---
const OwnerDashboard = ({ onNavigate }: { onNavigate: (tab: string, context?: any) => void }) => {
    const { user } = useAuth();
    const {
        myPets, addPet, reminders, completeReminder,
        appointments, healthRecords, pawPoints, streak,
    } = usePawData();

    const [selectedPetId, setSelectedPetId] = useState<string>('all'); // 'all' or a specific pet ID
    const [showAddPet, setShowAddPet] = useState(false);

    const firstName = (user?.name || 'there').split(' ')[0];
    const greeting = (() => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 18) return 'Good afternoon';
        return 'Good evening';
    })();

    const matchesPet = (petId: string) => selectedPetId === 'all' || petId === selectedPetId;

    // Upcoming reminders (not done), soonest first.
    const upcomingReminders = useMemo(
        () => reminders
            .filter((r) => !r.done && matchesPet(r.petId))
            .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate))
            .slice(0, 4),
        [reminders, selectedPetId],
    );

    // Upcoming, non-cancelled appointments (from ~now onward), soonest first.
    const upcomingAppointments = useMemo(
        () => appointments
            .filter((a) => a.status !== 'CANCELLED' && matchesPet(a.petId) && new Date(a.start).getTime() > Date.now() - dayMs)
            .sort((a, b) => +new Date(a.start) - +new Date(b.start))
            .slice(0, 3),
        [appointments, selectedPetId],
    );

    // Health snapshot — most recent records + overdue reminder count.
    const recentRecords = useMemo(
        () => healthRecords
            .filter((r) => matchesPet(r.petId))
            .sort((a, b) => +new Date(b.date) - +new Date(a.date))
            .slice(0, 3),
        [healthRecords, selectedPetId],
    );
    const overdueCount = useMemo(
        () => reminders.filter((r) => !r.done && matchesPet(r.petId) && daysUntil(r.dueDate) < 0).length,
        [reminders, selectedPetId],
    );

    const quickActions = [
        { label: 'Find a vet', icon: Stethoscope, accent: 'bg-blue-50 hover:bg-blue-100', onClick: () => onNavigate('Services', { filter: 'VET_HOME' }) },
        { label: 'Book a walk', icon: Navigation, accent: 'bg-emerald-50 hover:bg-emerald-100', onClick: () => onNavigate('Services', { filter: 'WALKER' }) },
        { label: 'Shop food', icon: ShoppingBag, accent: 'bg-amber-50 hover:bg-amber-100', onClick: () => onNavigate('Marketplace', { category: 'Food' }) },
        { label: 'Community', icon: Users, accent: 'bg-purple-50 hover:bg-purple-100', onClick: () => onNavigate('Community') },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">

            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    {user?.avatar && (
                        <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm hidden sm:block" />
                    )}
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{greeting}</p>
                        <h1 className="text-2xl sm:text-3xl font-display font-semibold text-slate-800">
                            Welcome back, {firstName} 🐾
                        </h1>
                    </div>
                </div>
                <button
                    onClick={() => setShowAddPet(true)}
                    className="self-start sm:self-auto inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-elevation-1 hover:bg-slate-800 transition-colors"
                >
                    <Plus size={16} /> Add a pet
                </button>
            </header>

            {/* Pet selector */}
            {myPets.length > 0 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
                    <button
                        onClick={() => setSelectedPetId('all')}
                        className={`flex items-center gap-2 rounded-full pl-1 pr-3 py-1 border shrink-0 transition-colors ${
                            selectedPetId === 'all' ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-slate-300'
                        }`}
                    >
                        <span className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white">
                            <LayoutGrid size={16} />
                        </span>
                        <span className="text-sm font-bold text-slate-700">All pets</span>
                    </button>
                    {myPets.map((pet) => (
                        <button
                            key={pet.id}
                            onClick={() => setSelectedPetId(pet.id)}
                            className={`flex items-center gap-2 rounded-full pl-1 pr-3 py-1 border shrink-0 transition-colors ${
                                selectedPetId === pet.id ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            <img src={pet.image} alt={pet.name} className="w-8 h-8 rounded-full object-cover" />
                            <span className="text-sm font-bold text-slate-700">{pet.name}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Stat strip: pets / streak / paw points */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-elevation-1 p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-1">
                        <HeartPulse size={16} className="text-rose-500" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pets</span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-display font-semibold text-slate-800">{myPets.length}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl shadow-elevation-1 p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-1">
                        <Flame size={16} className="text-amber-500" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Streak</span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-display font-semibold text-slate-800">
                        {streak} <span className="text-base font-bold text-slate-400">days</span>
                    </p>
                </div>
                <button
                    onClick={() => onNavigate('Paw Points')}
                    className="text-left bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-elevation-1 p-4 sm:p-5 text-white relative overflow-hidden group"
                >
                    <div className="flex items-center gap-2 mb-1 opacity-90">
                        <Gift size={16} />
                        <span className="text-[11px] font-bold uppercase tracking-wider">Paw Points</span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-display font-semibold">{pawPoints.toLocaleString()}</p>
                    <ArrowRight size={16} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT: Reminders + Appointments */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Next up — reminders */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-elevation-1 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Bell size={18} className="text-amber-500" /> Next up
                            </h2>
                            <button onClick={() => onNavigate('Health')} className="text-xs font-bold text-teal-600 hover:underline flex items-center gap-1">
                                Health Hub <ChevronRight size={14} />
                            </button>
                        </div>
                        {overdueCount > 0 && (
                            <div className="mb-4 flex items-center gap-2 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                                <Clock size={14} /> {overdueCount} task{overdueCount > 1 ? 's' : ''} overdue
                            </div>
                        )}
                        {upcomingReminders.length === 0 ? (
                            <p className="text-sm text-slate-400 py-6 text-center">All caught up! 🎉</p>
                        ) : (
                            <ul className="space-y-2">
                                {upcomingReminders.map((r) => {
                                    const Icon = reminderIcon[r.category] || Bell;
                                    const pet = myPets.find((p) => p.id === r.petId);
                                    const overdue = daysUntil(r.dueDate) < 0;
                                    return (
                                        <li key={r.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                                            <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${reminderAccent[r.category] || reminderAccent.OTHER}`}>
                                                <Icon size={18} />
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm text-slate-800 truncate">{r.title}</p>
                                                <p className="text-xs text-slate-400">{pet?.name ? `${pet.name} · ` : ''}{fmtWhen(r.dueDate)}</p>
                                            </div>
                                            <button
                                                onClick={() => completeReminder(r.id)}
                                                className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                                                    overdue ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-700'
                                                }`}
                                            >
                                                Done
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    {/* Upcoming appointments */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-elevation-1 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Calendar size={18} className="text-blue-500" /> Upcoming appointments
                            </h2>
                            <button onClick={() => onNavigate('Appointments')} className="text-xs font-bold text-teal-600 hover:underline flex items-center gap-1">
                                View all <ChevronRight size={14} />
                            </button>
                        </div>
                        {upcomingAppointments.length === 0 ? (
                            <div className="text-center py-6">
                                <p className="text-sm text-slate-400 mb-3">No appointments booked.</p>
                                <button
                                    onClick={() => onNavigate('Services', { filter: 'VET_HOME' })}
                                    className="inline-flex items-center gap-2 text-sm font-bold text-teal-600 hover:underline"
                                >
                                    <Plus size={14} /> Book a visit
                                </button>
                            </div>
                        ) : (
                            <ul className="space-y-2">
                                {upcomingAppointments.map((a) => (
                                    <li
                                        key={a.id}
                                        onClick={() => onNavigate('Appointments')}
                                        className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex flex-col items-center justify-center shrink-0 leading-none">
                                            <span className="text-[10px] font-bold uppercase">{new Date(a.start).toLocaleDateString(undefined, { month: 'short' })}</span>
                                            <span className="text-lg font-black">{new Date(a.start).getDate()}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-slate-800 truncate group-hover:text-blue-600 transition-colors">{a.providerName}</p>
                                            <p className="text-xs text-slate-400">{a.petName} · {fmtDateTime(a.start)}</p>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase shrink-0 ${
                                            a.mode === 'TELEHEALTH' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                                        }`}>
                                            {a.mode === 'TELEHEALTH' ? 'Video' : 'In person'}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* RIGHT: Quick actions + Health snapshot */}
                <div className="space-y-6">

                    {/* Quick actions */}
                    <div className="grid grid-cols-2 gap-3">
                        {quickActions.map((qa) => {
                            const Icon = qa.icon;
                            return (
                                <button
                                    key={qa.label}
                                    onClick={qa.onClick}
                                    className={`p-4 rounded-2xl flex flex-col items-center text-center gap-2 transition-colors ${qa.accent}`}
                                >
                                    <span className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-700">
                                        <Icon size={20} />
                                    </span>
                                    <span className="text-xs font-bold text-slate-700">{qa.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Health snapshot */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-elevation-1 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <HeartPulse size={16} className="text-rose-500" /> Health snapshot
                            </h2>
                            <button onClick={() => onNavigate('Health')} className="text-xs font-bold text-teal-600 hover:underline">View</button>
                        </div>
                        {recentRecords.length === 0 ? (
                            <p className="text-sm text-slate-400 py-4 text-center">No health records yet.</p>
                        ) : (
                            <ol className="relative border-l-2 border-slate-100 ml-2 space-y-4">
                                {recentRecords.map((r) => {
                                    const pet = myPets.find((p) => p.id === r.petId);
                                    return (
                                        <li key={r.id} className="ml-4">
                                            <span className="absolute -left-[7px] w-3 h-3 rounded-full bg-teal-400 ring-4 ring-white" />
                                            <p className="font-bold text-sm text-slate-800 leading-tight">{r.title}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                {pet?.name ? `${pet.name} · ` : ''}
                                                {new Date(r.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </li>
                                    );
                                })}
                            </ol>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showAddPet && <AddPetWizard onClose={() => setShowAddPet(false)} onSave={(pet) => { addPet(pet); setShowAddPet(false); }} />}
        </div>
    );
};

// --- MAIN DASHBOARD COMPONENT ---
const Dashboard: React.FC<DashboardProps> = ({ role, onNavigate, currentTab }) => {
  // Render based on role
  switch (role) {
    case UserRole.VET:
        return <VetDashboard />;
    case UserRole.CLINIC:
        return <ClinicDashboard initialTab={currentTab} />;
    case UserRole.VENDOR:
        return <VendorDashboard initialTab={currentTab} />;
    case UserRole.CARE_GIVER:
        return <CareGiverDashboard initialTab={currentTab} />;
    case UserRole.OWNER:
    default:
        return <OwnerDashboard onNavigate={onNavigate!} />;
  }
};

export default Dashboard;
