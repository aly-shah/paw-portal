
import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { MOCK_PETS, MOCK_PATIENTS_DETAILED, MOCK_CARE_TEAM, MOCK_OWNER_ALERTS, PET_TAXONOMY } from '../constants';
import { UserRole, Pet, ServiceType, WalkSession, WalkEvent } from '../types';
import { Calendar, Activity, ShoppingBag, Star, Users, DollarSign, Clock, AlertCircle, CheckCircle, TrendingUp, Package, MapPin, HeartHandshake, Briefcase, ArrowLeft, Siren, Truck, FileText, Phone, Stethoscope, ChevronRight, Zap, BrainCircuit, Heart, X, Plus, Pill, Cat, Dog, Bird, Rabbit, Sparkles, Printer, Download, History, Fish, Rat, MessageCircle, Map, Calendar as CalendarIcon, Share2, Trash2, Edit3, ExternalLink, ChevronLeft, Camera, Bell, Pause, LayoutGrid, Navigation, User, ShieldCheck } from 'lucide-react';
import DayStream from './vet/DayStream';
import ActiveVisit from './vet/ActiveVisit';
import TransactionEngine from './vet/TransactionEngine';
import ActiveWalkSession from './care/ActiveWalkSession';
import VendorDashboard from './vendor/VendorDashboard'; 
import CareGiverDashboard from './care/CareGiverDashboard'; 
import ClinicDashboard from './clinic/ClinicDashboard';
import { analyzeSymptom } from '../services/geminiService';

// ... (Keep existing Mock Data: activityData, weightData, salesData, UPCOMING_EVENTS) ...
const activityData = [
  { day: 'Mon', steps: 4000, play: 30 },
  { day: 'Tue', steps: 3000, play: 45 },
  { day: 'Wed', steps: 5500, play: 60 },
  { day: 'Thu', steps: 4500, play: 20 },
  { day: 'Fri', steps: 7000, play: 90 },
  { day: 'Sat', steps: 8500, play: 120 },
  { day: 'Sun', steps: 6000, play: 60 },
];

const weightData = [
  { month: 'May', weight: 30.5 },
  { month: 'Jun', weight: 31.0 },
  { month: 'Jul', weight: 31.2 },
  { month: 'Aug', weight: 31.5 },
  { month: 'Sep', weight: 31.8 },
  { month: 'Oct', weight: 32.0 },
];

const salesData = [
    { name: 'Mon', value: 400 },
    { name: 'Tue', value: 300 },
    { name: 'Wed', value: 600 },
    { name: 'Thu', value: 800 },
    { name: 'Fri', value: 1200 },
];

// --- Enriched Mock Data for Owner Dashboard Events ---
const UPCOMING_EVENTS = [
    { 
        id: 'e1',
        title: 'Annual Wellness Exam', 
        time: '2:00 PM', 
        date: 'Tomorrow, Oct 26',
        datetime: '2024-10-26T14:00:00',
        type: 'vet', 
        icon: Stethoscope, 
        color: 'blue',
        provider: { name: 'Dr. Sarah Jenkins', image: 'https://picsum.photos/id/1011/100/100', role: 'Veterinarian', phone: '(555) 123-4567' },
        location: 'Home Visit',
        status: 'Confirmed',
        notes: 'Please ensure Barnaby has not eaten for 2 hours prior to the visit. Have vaccination records ready.'
    },
    { 
        id: 'e2',
        title: 'Walk with Paws & Strides', 
        time: '10:00 AM', 
        date: 'Wed, Oct 28',
        datetime: '2024-10-28T10:00:00',
        type: 'walk', 
        icon: MapPin, 
        color: 'emerald',
        provider: { name: 'Alex (Walker)', image: 'https://picsum.photos/id/1025/100/100', role: 'Dog Walker', phone: '(555) 987-6543' },
        location: 'Central Park Entrance',
        status: 'Confirmed',
        notes: 'Alex will pick up Barnaby from the back gate.'
    },
    { 
        id: 'e3',
        title: 'Heartworm Pill Due', 
        time: '9:00 AM', 
        date: 'Fri, Oct 30',
        datetime: '2024-10-30T09:00:00',
        type: 'med', 
        icon: Pill, 
        color: 'red',
        provider: null,
        location: 'Home',
        status: 'Reminder',
        notes: 'Give with food to prevent upset stomach.'
    },
    {
        id: 'e4',
        title: 'Grooming Session',
        time: '11:00 AM', 
        date: 'Sat, Nov 02',
        datetime: '2024-11-02T11:00:00',
        type: 'groom',
        icon: Sparkles,
        color: 'purple',
        provider: { name: 'Furry Styles', image: 'https://picsum.photos/id/237/100/100', role: 'Groomer', phone: '(555) 555-5555' },
        location: '45 Pet Lane, Downtown',
        status: 'Pending',
        notes: 'Full groom + nail trim requested.'
    }
];

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

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const imageUrl = URL.createObjectURL(file);
            setFormData(prev => ({ ...prev, image: imageUrl }));
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

// --- Reminder Details Modal ---
const ReminderModal: React.FC<{ alert: any; onClose: () => void, onNavigate: (tab: string, context?: any) => void }> = ({ alert, onClose, onNavigate }) => {
    const [deliveryStatus, setDeliveryStatus] = useState<'TRANSIT' | 'DELIVERED' | 'CONFIRMED'>(
        alert.type === 'logistics' ? 'TRANSIT' : 'CONFIRMED' // Medical doesn't use this state logic
    );

    // Simulate delivery process for 'logistics' alerts
    useEffect(() => {
        if (alert.type === 'logistics' && deliveryStatus === 'TRANSIT') {
            // Simulate finding driver/arriving
            const timer = setTimeout(() => {
                setDeliveryStatus('DELIVERED');
            }, 3000); // 3 seconds to delivery
            return () => clearTimeout(timer);
        }
    }, [alert.type, deliveryStatus]);

    const handleContactVendor = () => {
        onClose();
        onNavigate('Messages', { 
            contact: { 
                id: 'u2', // Mock vendor ID
                name: 'PetMart Store', 
                role: 'Vendor', 
                avatar: 'https://picsum.photos/id/1062/100/100', 
                status: 'online' 
            } 
        });
    };

    const handleConfirmDelivery = () => {
        setDeliveryStatus('CONFIRMED');
        // Close after short delay
        setTimeout(onClose, 1500);
    };

    if (!alert) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 relative">
                {/* Dynamic Header */}
                <div className={`p-6 ${alert.type === 'medical' ? 'bg-red-50 border-b border-red-100' : 'bg-blue-50 border-b border-blue-100'} flex justify-between items-start`}>
                    <div className="flex gap-4 items-center">
                        <div className={`p-3 rounded-xl ${alert.type === 'medical' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                            {alert.type === 'medical' ? <ShieldCheck size={24} /> : <Truck size={24} />}
                        </div>
                        <div>
                            <p className={`text-xs font-bold uppercase tracking-wider ${alert.type === 'medical' ? 'text-red-500' : 'text-blue-500'}`}>
                                {alert.type === 'medical' ? 'Health Alert' : deliveryStatus === 'DELIVERED' ? 'Package Arrived' : 'Order En Route'}
                            </p>
                            <h3 className="text-lg font-black text-slate-800 leading-tight">
                                {deliveryStatus === 'DELIVERED' ? 'Delivery Completed' : alert.text}
                            </h3>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 bg-white/50 hover:bg-white rounded-full text-slate-400 transition-colors"><X size={16} /></button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Logic for LOGISTICS type */}
                    {alert.type === 'logistics' && (
                        <div className="text-center">
                            {deliveryStatus === 'TRANSIT' ? (
                                <div className="mb-4">
                                    <div className="text-4xl font-black text-slate-800 mb-1">2:15 PM</div>
                                    <p className="text-sm font-bold text-blue-500 uppercase tracking-wide">Estimated Arrival</p>
                                    <div className="mt-4 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full w-3/4 animate-pulse"></div>
                                    </div>
                                </div>
                            ) : deliveryStatus === 'DELIVERED' ? (
                                <div className="mb-4 flex flex-col items-center animate-in zoom-in">
                                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3">
                                        <CheckCircle size={32} />
                                    </div>
                                    <p className="text-lg font-bold text-slate-700">Package delivered at door.</p>
                                </div>
                            ) : (
                                <div className="mb-4 flex flex-col items-center animate-in zoom-in">
                                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                                        <CheckCircle size={32} />
                                    </div>
                                    <p className="text-lg font-bold text-slate-700">Order Confirmed!</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Contextual Content */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm text-slate-600 leading-relaxed">
                        {alert.type === 'medical' 
                            ? "This is a friendly reminder for an upcoming vaccination or checkup. Keeping up with schedule ensures optimal health."
                            : deliveryStatus === 'DELIVERED' 
                                ? "Your order has arrived. Please confirm you have received the items in good condition."
                                : "Your order is currently with the rider. Please be available at the address provided."}
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col gap-3">
                    {alert.type === 'medical' ? (
                        <>
                            <button 
                                onClick={() => { onClose(); onNavigate('Services', { filter: 'VET_HOME' }); }}
                                className="w-full py-3 bg-red-500 text-white rounded-xl font-bold shadow-lg hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                            >
                                <Stethoscope size={18} /> Book Appointment
                            </button>
                            <button onClick={onClose} className="w-full py-3 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold hover:bg-slate-100">
                                Mark as Done
                            </button>
                        </>
                    ) : (
                        // Logistics Actions
                        <>
                            {deliveryStatus === 'TRANSIT' ? (
                                <button 
                                    onClick={handleContactVendor}
                                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                >
                                    <MessageCircle size={18} /> Contact Vendor
                                </button>
                            ) : deliveryStatus === 'DELIVERED' ? (
                                <button 
                                    onClick={handleConfirmDelivery}
                                    className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                                >
                                    <CheckCircle size={18} /> Confirm Delivery
                                </button>
                            ) : (
                                <button onClick={onClose} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800">
                                    Close
                                </button>
                            )}
                            
                            {deliveryStatus !== 'CONFIRMED' && (
                                <button onClick={onClose} className="w-full py-3 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold hover:bg-slate-100">
                                    Close
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- Event Details Modal ---
const EventDetailsModal: React.FC<{ event: any; onClose: () => void }> = ({ event, onClose }) => {
    if (!event) return null;
    const TypeIcon = event.icon;
    
    const [isSharing, setIsSharing] = useState(false);
    const [locationSent, setLocationSent] = useState(false);
    const [isRescheduling, setIsRescheduling] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [isCancelled, setIsCancelled] = useState(false);

    const handleCancelEvent = () => {
        setIsCancelled(true);
        setTimeout(() => {
            onClose();
        }, 1500);
    };

    if (isCancelled) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div className="bg-white rounded-3xl p-8 text-center shadow-2xl animate-in zoom-in-95">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trash2 size={32} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-2">Appointment Cancelled</h3>
                    <p className="text-slate-500">We've notified {event.provider?.name || 'the provider'}.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                <div className={`p-6 bg-gradient-to-r from-${event.color}-50 to-white border-b border-${event.color}-100 flex justify-between items-start`}>
                    <div className="flex gap-4">
                        <div className={`w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-${event.color}-500 shadow-sm border border-${event.color}-100`}>
                             <TypeIcon size={32} />
                        </div>
                        <div>
                            <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1 ${
                                event.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                                {event.status}
                            </div>
                            <h3 className="text-xl font-black text-slate-800 leading-tight">{event.title}</h3>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full text-slate-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 space-y-6 overflow-y-auto">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-slate-700">
                            <div className="w-8 flex justify-center"><Calendar size={18} className="text-slate-400"/></div>
                            <span className="font-bold">{event.date} at {event.time}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-700">
                            <div className="w-8 flex justify-center"><MapPin size={18} className="text-slate-400"/></div>
                            <span className="font-medium">{event.location}</span>
                        </div>
                        {event.provider && (
                            <div className="flex items-center gap-3 text-slate-700">
                                <div className="w-8 flex justify-center"><User size={18} className="text-slate-400"/></div>
                                <span className="font-medium">{event.provider.name} ({event.provider.role})</span>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Notes</h4>
                        <p className="text-sm text-slate-600">{event.notes}</p>
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={() => setShowCancelConfirm(true)}
                            className="flex-1 py-3 bg-white border border-slate-200 text-red-500 font-bold rounded-xl hover:bg-red-50 hover:border-red-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-lg transition-colors">
                            Reschedule
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Owner Dashboard ---
const OwnerDashboard = ({ onNavigate }: { onNavigate: (tab: string, context?: any) => void }) => {
    const [pets, setPets] = useState(MOCK_PETS);
    const [selectedPetId, setSelectedPetId] = useState<string>('all'); // 'all' or specific pet ID
    const [showAddPet, setShowAddPet] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [selectedAlert, setSelectedAlert] = useState<any>(null);

    const selectedPet = pets.find(p => p.id === selectedPetId);
    
    // Calculate Activity Totals (Mock aggregation)
    const activitySummary = selectedPetId === 'all' 
        ? activityData 
        : activityData.map(d => ({ ...d, steps: Math.floor(d.steps * 0.8), play: Math.floor(d.play * 0.7) }));

    return (
        <div className="space-y-8 animate-fade-in pb-12 relative">
             
             {/* Header & Pet Selector */}
             <div className="flex flex-col gap-6">
                 <div className="flex justify-between items-center">
                     <div>
                         <h1 className="text-3xl font-black text-slate-800">Good morning!</h1>
                         <p className="text-slate-500 font-medium">Here's what's happening with your pack today.</p>
                     </div>
                     <button onClick={() => setShowAddPet(true)} className="hidden md:flex bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-slate-800 transition-colors items-center gap-2">
                         <Plus size={16} /> Add Pet
                     </button>
                 </div>

                 {/* Pet Selector Bar */}
                 <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                     <button 
                        onClick={() => setSelectedPetId('all')}
                        className={`flex flex-col items-center gap-2 min-w-[4.5rem] transition-all ${selectedPetId === 'all' ? 'opacity-100 scale-105' : 'opacity-60 hover:opacity-80'}`}
                     >
                         <div className={`w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-white shadow-md border-2 ${selectedPetId === 'all' ? 'border-teal-500 ring-2 ring-teal-500/30' : 'border-transparent'}`}>
                             <LayoutGrid size={24} />
                         </div>
                         <span className="text-xs font-bold text-slate-700">All Pets</span>
                     </button>
                     
                     {pets.map(pet => (
                         <button 
                            key={pet.id}
                            onClick={() => setSelectedPetId(pet.id)}
                            className={`flex flex-col items-center gap-2 min-w-[4.5rem] transition-all group ${selectedPetId === pet.id ? 'opacity-100 scale-105' : 'opacity-60 hover:opacity-80'}`}
                         >
                             <div className={`relative w-16 h-16 rounded-full p-0.5 bg-white shadow-sm border-2 ${selectedPetId === pet.id ? 'border-teal-500 ring-2 ring-teal-500/30' : 'border-slate-200 group-hover:border-slate-300'}`}>
                                 <img src={pet.image} alt={pet.name} className="w-full h-full rounded-full object-cover" />
                                 {selectedPetId === pet.id && (
                                     <div className="absolute bottom-0 right-0 w-4 h-4 bg-teal-500 border-2 border-white rounded-full flex items-center justify-center">
                                         <CheckCircle size={10} className="text-white" />
                                     </div>
                                 )}
                             </div>
                             <span className="text-xs font-bold text-slate-700">{pet.name}</span>
                         </button>
                     ))}

                     <button onClick={() => setShowAddPet(true)} className="md:hidden flex flex-col items-center gap-2 min-w-[4.5rem] opacity-60 hover:opacity-80">
                         <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-300">
                             <Plus size={24} />
                         </div>
                         <span className="text-xs font-bold text-slate-500">Add</span>
                     </button>
                 </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 
                 {/* LEFT COLUMN (2/3) */}
                 <div className="lg:col-span-2 space-y-8">
                     
                     {/* Wellness Hero Card */}
                     <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                         {/* Decor */}
                         <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                         
                         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                             <div>
                                 <div className="flex items-center gap-2 mb-2">
                                     <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur text-xs font-bold uppercase tracking-wider border border-white/20">
                                         {selectedPet ? selectedPet.name : 'Overall Pack'} Status
                                     </span>
                                 </div>
                                 <h2 className="text-3xl md:text-4xl font-black mb-2">Great Health! 🐾</h2>
                                 <p className="text-slate-300 max-w-md text-sm leading-relaxed">
                                     {selectedPet ? `${selectedPet.name} is meeting all activity goals.` : "Your pets are doing great this week."} Don't forget the upcoming vaccination.
                                 </p>
                             </div>
                             
                             {/* Score Circle */}
                             <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                                 <div className="relative w-16 h-16">
                                     <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                         <path className="text-slate-600" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                                         <path className="text-emerald-400" strokeDasharray="85, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                                     </svg>
                                     <div className="absolute inset-0 flex items-center justify-center font-black text-lg">85%</div>
                                 </div>
                                 <div>
                                     <p className="text-xs font-bold uppercase text-slate-400">Wellness Score</p>
                                     <p className="text-emerald-400 font-bold text-sm flex items-center gap-1"><TrendingUp size={14}/> Improving</p>
                                 </div>
                             </div>
                         </div>
                     </div>

                     {/* Activity Chart */}
                     <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                         <div className="flex justify-between items-center mb-6">
                             <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><Activity className="text-rose-500"/> Activity Trends</h3>
                             <select className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 rounded-lg px-3 py-2 outline-none">
                                 <option>This Week</option>
                                 <option>Last Week</option>
                             </select>
                         </div>
                         <div className="h-[250px] w-full">
                             <ResponsiveContainer width="100%" height="100%">
                                 <AreaChart data={activitySummary}>
                                     <defs>
                                         <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                                             <stop offset="5%" stopColor="#0f172a" stopOpacity={0.3}/>
                                             <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                                         </linearGradient>
                                     </defs>
                                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                     <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                     <Tooltip 
                                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                        cursor={{fill: '#f8fafc'}}
                                     />
                                     <Area type="monotone" dataKey="steps" stroke="#0f172a" strokeWidth={3} fillOpacity={1} fill="url(#colorSteps)" />
                                 </AreaChart>
                             </ResponsiveContainer>
                         </div>
                     </div>

                     {/* Upcoming Schedule */}
                     <div>
                         <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2"><Calendar className="text-blue-500"/> Upcoming Schedule</h3>
                         <div className="space-y-3">
                             {UPCOMING_EVENTS.slice(0, 3).map((event, i) => {
                                 const Icon = event.icon;
                                 return (
                                     <div 
                                        key={event.id} 
                                        onClick={() => setSelectedEvent(event)}
                                        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex items-center gap-4"
                                     >
                                         <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${event.color}-50 text-${event.color}-600 group-hover:scale-110 transition-transform`}>
                                             <Icon size={20} />
                                         </div>
                                         <div className="flex-1">
                                             <div className="flex justify-between items-start">
                                                 <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{event.title}</h4>
                                                 <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">{event.time}</span>
                                             </div>
                                             <p className="text-xs text-slate-500 mt-0.5">{event.date} • {event.location}</p>
                                         </div>
                                         <div className="bg-slate-50 p-2 rounded-full text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600 transition-colors">
                                             <ChevronRight size={16} />
                                         </div>
                                     </div>
                                 )
                             })}
                         </div>
                     </div>
                 </div>

                 {/* RIGHT COLUMN (1/3) */}
                 <div className="space-y-8">
                     
                     {/* Quick Actions */}
                     <div className="grid grid-cols-2 gap-4">
                         <button 
                            onClick={() => onNavigate('Services', { filter: 'VET_HOME' })}
                            className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex flex-col items-center text-center hover:bg-blue-100 transition-colors group"
                         >
                             <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm mb-2 group-hover:scale-110 transition-transform"><Stethoscope size={20} /></div>
                             <span className="text-xs font-bold text-blue-800">Find Vet</span>
                         </button>
                         <button 
                            onClick={() => onNavigate('Services', { filter: 'WALKER' })}
                            className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col items-center text-center hover:bg-emerald-100 transition-colors group"
                         >
                             <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-sm mb-2 group-hover:scale-110 transition-transform"><Navigation size={20} /></div>
                             <span className="text-xs font-bold text-emerald-800">Book Walk</span>
                         </button>
                         <button 
                            onClick={() => onNavigate('Marketplace', { category: 'Food' })}
                            className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex flex-col items-center text-center hover:bg-amber-100 transition-colors group"
                         >
                             <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-amber-600 shadow-sm mb-2 group-hover:scale-110 transition-transform"><ShoppingBag size={20} /></div>
                             <span className="text-xs font-bold text-amber-800">Buy Food</span>
                         </button>
                         <button 
                            onClick={() => onNavigate('Community')}
                            className="p-4 bg-purple-50 rounded-2xl border border-purple-100 flex flex-col items-center text-center hover:bg-purple-100 transition-colors group"
                         >
                             <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-purple-600 shadow-sm mb-2 group-hover:scale-110 transition-transform"><Users size={20} /></div>
                             <span className="text-xs font-bold text-purple-800">Community</span>
                         </button>
                     </div>

                     {/* Alerts */}
                     <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                         <h3 className="font-bold text-sm text-slate-800 mb-4 flex items-center gap-2"><Bell size={16}/> Reminders</h3>
                         <div className="space-y-3">
                             {MOCK_OWNER_ALERTS.map(alert => (
                                 <div key={alert.id} className="flex items-start gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                                     <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${alert.type === 'medical' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                     <div>
                                         <p className="text-xs font-bold text-slate-700">{alert.text}</p>
                                         <p className="text-[10px] text-slate-400 mt-0.5">{alert.time}</p>
                                     </div>
                                     <button 
                                        onClick={() => setSelectedAlert(alert)}
                                        className="ml-auto text-[10px] font-bold text-blue-600 hover:underline"
                                     >
                                         {alert.action}
                                     </button>
                                 </div>
                             ))}
                         </div>
                     </div>

                     {/* Weight Tracker */}
                     <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                         <h3 className="font-bold text-sm text-slate-800 mb-4">Weight History</h3>
                         <div className="h-[150px] w-full">
                             <ResponsiveContainer width="100%" height="100%">
                                 <LineChart data={weightData}>
                                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                     <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                                     <Tooltip contentStyle={{borderRadius: '8px', fontSize: '12px'}} />
                                     <Line type="monotone" dataKey="weight" stroke="#6366f1" strokeWidth={3} dot={{r: 3}} activeDot={{r: 5}} />
                                 </LineChart>
                             </ResponsiveContainer>
                         </div>
                     </div>

                 </div>
             </div>

             {/* Modals */}
             {showAddPet && <AddPetWizard onClose={() => setShowAddPet(false)} onSave={(pet) => { setPets([...pets, pet]); setShowAddPet(false); }} />}
             {selectedEvent && <EventDetailsModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
             {selectedAlert && <ReminderModal alert={selectedAlert} onClose={() => setSelectedAlert(null)} onNavigate={onNavigate} />}
        </div>
    )
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
