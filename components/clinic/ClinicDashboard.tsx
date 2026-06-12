
import React, { useState, useEffect, useRef } from 'react';
import { 
    Activity, Users, Clock, AlertCircle, Plus, X, 
    MoreVertical, CheckCircle, Stethoscope, Trash2, 
    User, LogIn, LogOut, Sparkles, Settings, Search,
    Package, Syringe, FileText, ChevronDown, UserPlus, Pill, ClipboardList,
    Filter, Barcode, DollarSign, UploadCloud, Loader2, Bold, Italic, List as ListIcon, Link as LinkIcon, Percent, TrendingUp, Tag,
    Phone, Mail, MapPin, Calendar, Printer, Edit3, ShieldAlert, History, UserCheck, ArrowRight, LogIn as LogInIcon, Ban, Upload
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, Tooltip, CartesianGrid, XAxis, YAxis } from 'recharts';
import TransactionEngine from '../vet/TransactionEngine';
import { generateProductListing } from '../../services/geminiService';
import { MOCK_PATIENTS_DETAILED } from '../../constants';
import InventoryImportModal from '../inventory/InventoryImportModal';

// --- Types ---
type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE';
type RoomType = 'EXAM' | 'SURGERY' | 'KENNEL' | 'XRAY';
type StaffRole = 'Vet' | 'Tech' | 'Admin';
type StaffStatus = 'Available' | 'Busy' | 'Surgery' | 'Off Duty';

interface ClinicRoom {
    id: string;
    name: string;
    type: RoomType;
    status: RoomStatus;
    currentPatient?: {
        name: string;
        owner: string;
        reason: string;
        admittedAt: Date;
    };
    assignedVet?: string;
}

interface QueueItem {
    id: string;
    patientName: string;
    ownerName: string;
    reason: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    arrivalTime: string;
    assignedVetPreference?: string;
}

interface StaffMember {
    id: string;
    name: string;
    role: StaffRole;
    status: StaffStatus;
    color: string; // For UI badges
}

export interface InventoryItem {
    id: string;
    name: string;
    category: 'Medicine' | 'Supply' | 'Equipment' | 'Retail' | 'Food';
    stock: number;
    minLevel: number;
    unit: string;
    price: number; // Selling Price
    costPrice: number; // Purchase Price
    sku: string;
    image?: string;
    status: 'In Stock' | 'Low Stock' | 'Out of Stock';
    description?: string;
    tags?: string[];
}

interface ClinicDashboardProps {
    initialTab?: string;
}

// --- Mock Data ---
const INITIAL_ROOMS: ClinicRoom[] = [
    { id: 'r1', name: 'Exam Room 1', type: 'EXAM', status: 'OCCUPIED', currentPatient: { name: 'Barnaby', owner: 'Jane Doe', reason: 'Vaccination', admittedAt: new Date(Date.now() - 1000 * 60 * 15) }, assignedVet: 'Dr. Sarah' },
    { id: 'r2', name: 'Exam Room 2', type: 'EXAM', status: 'AVAILABLE' },
    { id: 'r3', name: 'Surgery A', type: 'SURGERY', status: 'CLEANING' },
    { id: 'r4', name: 'Isolation', type: 'KENNEL', status: 'AVAILABLE' },
];

const INITIAL_QUEUE: QueueItem[] = [
    { id: 'q1', patientName: 'Luna', ownerName: 'Ali Khan', reason: 'Limping', priority: 'MEDIUM', arrivalTime: '10:30 AM' },
    { id: 'q2', patientName: 'Coco', ownerName: 'Zara M.', reason: 'Vomiting', priority: 'HIGH', arrivalTime: '10:45 AM' },
    { id: 'q3', patientName: 'Oreo', ownerName: 'Bilal R.', reason: 'Checkup', priority: 'LOW', arrivalTime: '11:00 AM' },
];

const INITIAL_STAFF: StaffMember[] = [
    { id: 's1', name: 'Dr. Sarah', role: 'Vet', status: 'Busy', color: 'blue' },
    { id: 's2', name: 'Dr. Khan', role: 'Vet', status: 'Available', color: 'emerald' },
    { id: 's3', name: 'Nurse Joy', role: 'Tech', status: 'Busy', color: 'amber' },
    { id: 's4', name: 'Ali Admin', role: 'Admin', status: 'Available', color: 'slate' },
];

const INITIAL_INVENTORY: InventoryItem[] = [
    { 
        id: 'i1', name: 'Rabies Vaccine', category: 'Medicine', stock: 4, minLevel: 10, unit: 'vials', 
        price: 2500, costPrice: 1800, sku: 'MED-VAC-RB', status: 'Low Stock', 
        image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=100',
        description: 'Standard annual rabies vaccination vial.', tags: ['Vaccine', 'Core']
    },
    { 
        id: 'i2', name: 'Gauze Rolls', category: 'Supply', stock: 3, minLevel: 5, unit: 'rolls', 
        price: 200, costPrice: 80, sku: 'SUP-GAU-02', status: 'Low Stock', 
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=100',
        description: 'Sterile cotton gauze rolls for wound dressing.', tags: ['First Aid']
    },
    { 
        id: 'i3', name: 'Syringes (3ml)', category: 'Supply', stock: 150, minLevel: 50, unit: 'box', 
        price: 500, costPrice: 200, sku: 'SUP-SYR-03', status: 'In Stock', 
        image: 'https://images.unsplash.com/photo-1583324113626-70df0f4deaab?auto=format&fit=crop&w=100',
        description: 'Disposable 3ml syringes with needles.', tags: ['Injection']
    },
    { 
        id: 'i4', name: 'Amoxicillin 250mg', category: 'Medicine', stock: 45, minLevel: 20, unit: 'tabs', 
        price: 50, costPrice: 15, sku: 'MED-AMX-250', status: 'In Stock', 
        image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=100',
        description: 'Broad spectrum antibiotic tablets.', tags: ['Antibiotic', 'Oral']
    },
];

interface PatientContext {
    name: string;
    owner: string;
    status: 'QUEUE' | 'ADMITTED' | 'ARCHIVED';
    id?: string; // Queue ID or Room ID depending on context
    location?: string; // "Waiting Room" or Room Name
    arrivalTime?: string;
}

interface WorkflowActions {
    onAdmit: (targetRoomId: string) => void;
    onDischarge: () => void;
    onQuickDischarge?: () => void;
    onRemoveFromQueue: () => void;
}

// --- PATIENT PROFILE MODAL ---
const PatientProfileModal = ({
    patientName,
    ownerName,
    onClose,
    context,
    actions,
    availableRooms,
    onNotify
}: {
    patientName: string,
    ownerName: string,
    onClose: () => void,
    context?: PatientContext,
    actions?: WorkflowActions,
    availableRooms?: ClinicRoom[],
    onNotify?: (message: string) => void
}) => {
    const notify = onNotify || (() => {});
    const [selectedRoomId, setSelectedRoomId] = useState(availableRooms && availableRooms.length > 0 ? availableRooms[0].id : '');

    // Lookup mock details or generate placeholder
    const existingDetails = MOCK_PATIENTS_DETAILED.find(p => p.name.toLowerCase() === patientName.toLowerCase());
    
    const patient = existingDetails || {
        name: patientName,
        breed: 'Mixed Breed',
        age: 2,
        gender: 'Male',
        image: `https://picsum.photos/seed/${patientName}/200/200`,
        owner: { name: ownerName, phone: '+92 300 1234567', email: 'client@example.com', address: 'Local Area, Karachi' },
        lastVisit: 'First Visit',
        vitals: { weight: '15 kg', temp: '38.5 C', heartRate: '80 bpm' },
        history: [],
        color: 'Cream',
        microchip: 'Not Registered',
        neutered: false,
        dietaryNotes: 'None known',
        personality: { tags: ['Friendly'] }
    };

    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
                
                {/* Header */}
                <div className="relative h-40 bg-slate-900 overflow-hidden shrink-0">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <div className="absolute top-4 right-4">
                        <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="absolute -bottom-12 left-8 flex items-end">
                        <div className="relative group">
                            <img src={patient.image} className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white" />
                            <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 border-2 border-white rounded-full" title="Active Status"></div>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto pt-16 px-8 pb-8 bg-slate-50/50">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                                {patient.name}
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${patient.gender === 'Male' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-pink-50 text-pink-600 border-pink-200'}`}>
                                    {patient.gender}
                                </span>
                            </h2>
                            <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
                                {patient.breed} • {patient.age} Years Old • {patient.color}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => { window.print(); notify('Preparing patient label for printing...'); }}
                                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50 flex items-center gap-2"
                            >
                                <Printer size={16} /> Label
                            </button>
                            <button
                                onClick={() => notify('Profile editing is not available in this demo.')}
                                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-slate-800 flex items-center gap-2 shadow-lg"
                            >
                                <Edit3 size={16} /> Edit Profile
                            </button>
                        </div>
                    </div>

                    {/* Workflow Banner (New) */}
                    {context && (
                        <div className="mb-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden">
                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${context.status === 'ADMITTED' ? 'bg-blue-500' : 'bg-amber-500'}`}></div>
                            
                            <div className="flex items-center gap-4 pl-2">
                                <div className={`p-3 rounded-xl ${context.status === 'ADMITTED' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                                    {context.status === 'ADMITTED' ? <Activity size={24} /> : <Clock size={24} />}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Status</p>
                                    <h4 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                        {context.status === 'ADMITTED' ? 'Admitted' : 'In Queue'} 
                                        <span className="text-slate-400 font-medium text-sm">— {context.location}</span>
                                    </h4>
                                    {context.arrivalTime && <p className="text-xs text-slate-500">Since {context.arrivalTime}</p>}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto">
                                {context.status === 'QUEUE' && actions && (
                                    <>
                                        <div className="flex-1 md:w-48">
                                            <select 
                                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                                                value={selectedRoomId}
                                                onChange={(e) => setSelectedRoomId(e.target.value)}
                                            >
                                                {availableRooms && availableRooms.length > 0 ? (
                                                    availableRooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)
                                                ) : (
                                                    <option disabled>No Rooms Available</option>
                                                )}
                                            </select>
                                        </div>
                                        <button 
                                            onClick={() => actions.onAdmit(selectedRoomId)}
                                            disabled={!availableRooms || availableRooms.length === 0}
                                            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                                        >
                                            <LogInIcon size={18} /> Admit
                                        </button>
                                        {/* New Quick Discharge for Queue */}
                                        <button 
                                            onClick={actions.onQuickDischarge}
                                            className="px-4 py-2.5 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl font-bold hover:bg-emerald-200 transition-colors flex items-center gap-2 whitespace-nowrap" 
                                            title="Bill & Discharge"
                                        >
                                            <LogOut size={18} /> Quick Discharge
                                        </button>
                                        <button 
                                            onClick={actions.onRemoveFromQueue}
                                            className="p-2.5 border border-slate-200 text-red-500 hover:bg-red-50 rounded-xl transition-colors" 
                                            title="Cancel Visit"
                                        >
                                            <Ban size={18} />
                                        </button>
                                    </>
                                )}

                                {context.status === 'ADMITTED' && actions && (
                                    <>
                                        <button
                                            onClick={() => notify('Visit note saved to patient record.')}
                                            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50"
                                        >
                                            Add Note
                                        </button>
                                        <button 
                                            onClick={actions.onDischarge}
                                            className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-700 flex items-center gap-2 whitespace-nowrap"
                                        >
                                            <LogOut size={18} /> Discharge
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: Stats & Owner */}
                        <div className="space-y-6">
                            {/* Owner Card */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <User size={14}/> Owner Details
                                </h4>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-sm">
                                        {getInitials(patient.owner.name)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800">{patient.owner.name}</p>
                                        <p className="text-xs text-slate-500">Primary Caretaker</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <a href={`tel:${patient.owner.phone}`} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg text-sm text-slate-600 transition-colors">
                                        <Phone size={16} className="text-slate-400" /> {patient.owner.phone}
                                    </a>
                                    <a href={`mailto:${patient.owner.email}`} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg text-sm text-slate-600 transition-colors">
                                        <Mail size={16} className="text-slate-400" /> {patient.owner.email}
                                    </a>
                                    <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg text-sm text-slate-600 transition-colors">
                                        <MapPin size={16} className="text-slate-400" /> {patient.owner.address}
                                    </div>
                                </div>
                            </div>

                            {/* Vitals Snapshot */}
                            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                                <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Activity size={14}/> Latest Vitals
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white/60 p-3 rounded-xl">
                                        <p className="text-[10px] font-bold text-blue-400 uppercase">Weight</p>
                                        <p className="text-lg font-black text-slate-800">{patient.vitals.weight}</p>
                                    </div>
                                    <div className="bg-white/60 p-3 rounded-xl">
                                        <p className="text-[10px] font-bold text-blue-400 uppercase">Temp</p>
                                        <p className="text-lg font-black text-slate-800">{patient.vitals.temp}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Middle Column: Alerts & Info */}
                        <div className="space-y-6">
                            {/* Medical Alerts */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <ShieldAlert size={14}/> Medical Alerts
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-xl">
                                        <AlertCircle className="text-red-500 mt-0.5" size={16} />
                                        <div>
                                            <p className="text-xs font-bold text-red-700 uppercase">Allergies</p>
                                            <p className="text-sm text-red-600">{patient.dietaryNotes || 'No known allergies'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <Syringe size={16} className="text-slate-400" />
                                            <span className="text-sm font-bold text-slate-700">Vaccinations</span>
                                        </div>
                                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">Up to Date</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <Tag size={16} className="text-slate-400" />
                                            <span className="text-sm font-bold text-slate-700">Microchip</span>
                                        </div>
                                        <span className="text-xs font-mono text-slate-500">{patient.microchip}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Personality Tags */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Sparkles size={14}/> Personality
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {patient.personality.tags.map((tag: string) => (
                                        <span key={tag} className="px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg text-xs font-bold">
                                            {tag}
                                        </span>
                                    ))}
                                    {patient.neutered && (
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-bold">
                                            Neutered
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: History */}
                        <div className="lg:col-span-1 bg-slate-100 rounded-2xl p-1 border border-slate-200 flex flex-col max-h-[400px] lg:max-h-none">
                            <div className="p-4 pb-2">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                    <History size={14}/> Visit History
                                </h4>
                            </div>
                            <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2 custom-scrollbar">
                                {patient.history.length > 0 ? (
                                    patient.history.map((record: any, i: number) => (
                                        <div key={i} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors cursor-pointer group">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600">{record.type}</span>
                                                <span className="text-[10px] text-slate-400">{record.date}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{record.notes}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 text-slate-400 text-xs">
                                        <FileText className="mx-auto mb-2 opacity-20" size={24} />
                                        No previous history available.
                                    </div>
                                )}
                            </div>
                            <div className="p-2">
                                <button
                                    onClick={() => notify('Full medical records are not available in this demo.')}
                                    className="w-full py-2 bg-white border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm"
                                >
                                    View Full Records
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- ADD INVENTORY MODAL (Based on Vendor Product Studio) ---
const AddInventoryModal = ({ onClose, onSave }: { onClose: () => void, onSave: (item: InventoryItem) => void }) => {
    const [formData, setFormData] = useState<Partial<InventoryItem>>({
        name: '',
        description: '',
        price: 0,
        costPrice: 0,
        stock: 0,
        minLevel: 5,
        sku: '',
        category: 'Medicine',
        tags: [],
        status: 'In Stock',
        image: ''
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [tagInput, setTagInput] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Stats Calculation
    const margin = formData.price && formData.costPrice 
        ? ((formData.price - formData.costPrice) / formData.price) * 100 
        : 0;
    const profit = formData.price && formData.costPrice 
        ? formData.price - formData.costPrice 
        : 0;

    // Listing Score (Quality Check)
    const calculateScore = () => {
        let score = 0;
        if (formData.name && formData.name.length > 5) score += 20;
        if (formData.description && formData.description.length > 20) score += 20;
        if (formData.image) score += 30;
        if (formData.tags && formData.tags.length >= 1) score += 10;
        if (formData.sku) score += 10;
        if (formData.stock && formData.stock > 0) score += 10;
        return score;
    };
    const listingScore = calculateScore();

    const handleGenerateDetails = async () => {
        if (!formData.name) return;
        setIsGenerating(true);
        // Reusing the vendor service for description generation
        const details = await generateProductListing(formData.name);
        
        // Map vendor categories to clinic categories roughly
        let mappedCategory: any = 'Supply';
        if (['Food', 'Health'].includes(details.category)) mappedCategory = 'Retail';
        if (details.category === 'Health') mappedCategory = 'Medicine';

        setFormData(prev => ({
            ...prev,
            description: details.description,
            price: details.suggestedPrice,
            tags: details.tags,
            // Heuristic for cost if AI generates price
            costPrice: Math.floor(details.suggestedPrice * 0.5), 
        }));
        setIsGenerating(false);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
        let files: File[] = [];
        if (e.type === 'drop') {
             e.preventDefault();
             setIsDragging(false);
             files = Array.from((e as React.DragEvent).dataTransfer.files);
        } else {
             files = Array.from((e as React.ChangeEvent<HTMLInputElement>).target.files || []);
        }

        if (files.length > 0) {
            const imageUrl = URL.createObjectURL(files[0]);
            setFormData(prev => ({ ...prev, image: imageUrl }));
        }
    };

    const generateSKU = () => {
        const prefix = formData.category?.substring(0,3).toUpperCase() || 'GEN';
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        setFormData(prev => ({ ...prev, sku: `${prefix}-${random}` }));
    };

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!formData.tags?.includes(tagInput.trim())) {
                setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), tagInput.trim()] }));
            }
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        setFormData(prev => ({ ...prev, tags: prev.tags?.filter(t => t !== tag) }));
    };

    // Simple markdown-style formatting applied to the description field
    const applyFormat = (format: 'bold' | 'italic' | 'list') => {
        setFormData(prev => {
            const current = prev.description || '';
            let next = current;
            if (format === 'bold') next = `${current}**bold text**`;
            else if (format === 'italic') next = `${current}*italic text*`;
            else if (format === 'list') next = current ? `${current}\n- ` : '- ';
            return { ...prev, description: next };
        });
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-5xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-6">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800">Inventory Studio</h2>
                            <p className="text-slate-500 text-sm">Register items, supplies, or retail products.</p>
                        </div>
                        {/* Quality Meter */}
                        <div className="hidden md:block bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Data Completeness</p>
                            <div className="flex items-center gap-3">
                                <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-500 ${listingScore > 80 ? 'bg-emerald-500' : listingScore > 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                                        style={{ width: `${listingScore}%` }}
                                    />
                                </div>
                                <span className={`text-xs font-bold ${listingScore > 80 ? 'text-emerald-600' : listingScore > 40 ? 'text-amber-600' : 'text-red-600'}`}>
                                    {listingScore}%
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                         <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors">Discard</button>
                         <button 
                            onClick={() => onSave(formData as InventoryItem)}
                            disabled={!formData.name || !formData.price}
                            className="px-8 py-2.5 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                         >
                             <CheckCircle size={18} /> Save Item
                         </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-slate-50/50 p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* LEFT COLUMN: Content & Media */}
                        <div className="lg:col-span-2 space-y-8">
                            
                            {/* Basic Info */}
                            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-slate-800 text-lg">Item Details</h3>
                                    <button 
                                        onClick={handleGenerateDetails}
                                        disabled={isGenerating || !formData.name}
                                        className="text-purple-600 bg-purple-50 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-purple-100 disabled:opacity-50 transition-all"
                                    >
                                        {isGenerating ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />} 
                                        Auto-Fill with AI
                                    </button>
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Item Name <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Amoxicillin 500mg" 
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-lg text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none transition-all placeholder:font-normal"
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase">Description / Dosage Info</label>
                                        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                                            <button type="button" onClick={() => applyFormat('bold')} className="p-1.5 hover:bg-white rounded text-slate-500 hover:text-slate-800 transition-colors"><Bold size={14} /></button>
                                            <button type="button" onClick={() => applyFormat('italic')} className="p-1.5 hover:bg-white rounded text-slate-500 hover:text-slate-800 transition-colors"><Italic size={14} /></button>
                                            <button type="button" onClick={() => applyFormat('list')} className="p-1.5 hover:bg-white rounded text-slate-500 hover:text-slate-800 transition-colors"><ListIcon size={14} /></button>
                                        </div>
                                    </div>
                                    <textarea 
                                        rows={4}
                                        placeholder="Detailed description, dosage instructions, or supplier notes..."
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 focus:ring-2 focus:ring-teal-500 outline-none resize-none leading-relaxed"
                                        value={formData.description}
                                        onChange={e => setFormData({...formData, description: e.target.value})}
                                    />
                                </div>
                            </div>

                            {/* Media */}
                            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                                <h3 className="font-bold text-slate-800 text-lg mb-1">Item Image</h3>
                                <p className="text-xs text-slate-400 mb-6">Visuals help staff identify products quickly.</p>
                                
                                <div className="grid grid-cols-3 gap-4">
                                    {/* Upload Button / Drag Zone */}
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                        onDragLeave={() => setIsDragging(false)}
                                        onDrop={handleImageUpload}
                                        className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer group text-center p-4 ${
                                            isDragging 
                                            ? 'border-teal-500 bg-teal-50' 
                                            : 'border-slate-300 bg-slate-50 hover:border-teal-400 hover:bg-white'
                                        }`}
                                    >
                                        {formData.image ? (
                                            <div className="relative w-full h-full">
                                                <img src={formData.image} className="w-full h-full object-cover rounded-xl" />
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setFormData({...formData, image: ''}); }}
                                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-sm hover:bg-red-600"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <UploadCloud size={32} className={`mb-2 transition-transform ${isDragging ? 'text-teal-600 scale-110' : 'text-slate-400 group-hover:scale-110'}`} />
                                                <span className={`text-xs font-bold ${isDragging ? 'text-teal-700' : 'text-slate-500'}`}>
                                                    {isDragging ? 'Drop Here' : 'Click or Drag'}
                                                </span>
                                            </>
                                        )}
                                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Settings */}
                        <div className="space-y-8">
                            
                            {/* Pricing Card */}
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                                <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
                                    <DollarSign size={20} className="text-emerald-600" /> Financials
                                </h3>
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Selling Price (Patient)</label>
                                        <input 
                                            type="number" 
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
                                            value={formData.price || ''}
                                            onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cost Price (Supplier)</label>
                                        <input 
                                            type="number" 
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-600 focus:ring-2 focus:ring-teal-500 outline-none"
                                            value={formData.costPrice || ''}
                                            onChange={e => setFormData({...formData, costPrice: parseFloat(e.target.value)})}
                                        />
                                    </div>
                                    
                                    {/* Smart Margin Visual */}
                                    {formData.price && formData.costPrice ? (
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mt-2">
                                            <div className="flex h-3 w-full rounded-full overflow-hidden mb-2">
                                                <div style={{ flex: formData.costPrice }} className="bg-slate-300" title="Cost"></div>
                                                <div style={{ flex: profit }} className="bg-emerald-500" title="Profit"></div>
                                            </div>

                                            <div className="flex justify-between text-sm">
                                                <div>
                                                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Profit</span>
                                                    <span className="font-bold text-emerald-600">PKR {profit.toLocaleString()}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Margin</span>
                                                    <span className={`font-bold ${margin < 20 ? 'text-red-500' : 'text-emerald-600'}`}>
                                                        {margin.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            </div>

                            {/* Inventory Card */}
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
                                    <Package size={20} className="text-blue-600" /> Stock Control
                                </h3>
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">SKU / Barcode</label>
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none uppercase"
                                                value={formData.sku}
                                                onChange={e => setFormData({...formData, sku: e.target.value})}
                                            />
                                            <button 
                                                onClick={generateSKU}
                                                className="p-3 bg-slate-100 rounded-xl text-slate-500 hover:bg-slate-200 transition-colors"
                                                title="Generate SKU"
                                            >
                                                <Barcode size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Stock</label>
                                            <input 
                                                type="number" 
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
                                                value={formData.stock || ''}
                                                onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Alert Limit</label>
                                            <input 
                                                type="number" 
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
                                                value={formData.minLevel || ''}
                                                onChange={e => setFormData({...formData, minLevel: parseInt(e.target.value)})}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Classification Card */}
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                                <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
                                    <Tag size={20} className="text-amber-500" /> Classification
                                </h3>
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Category</label>
                                        <select 
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none cursor-pointer"
                                            value={formData.category}
                                            onChange={e => setFormData({...formData, category: e.target.value as any})}
                                        >
                                            {['Medicine', 'Supply', 'Equipment', 'Retail', 'Food'].map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tags</label>
                                        <input 
                                            type="text" 
                                            placeholder="Type and press Enter..."
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
                                            value={tagInput}
                                            onChange={e => setTagInput(e.target.value)}
                                            onKeyDown={handleAddTag}
                                        />
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {formData.tags?.map(tag => (
                                                <span key={tag} className="bg-slate-100 text-slate-600 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                                                    {tag} 
                                                    <button onClick={() => removeTag(tag)} className="hover:text-red-500"><X size={12} /></button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- CHECK-IN MODAL ---
const CheckInModal = ({ onClose, onCheckIn, staff }: { onClose: () => void, onCheckIn: (data: any) => void, staff: StaffMember[] }) => {
    const [step, setStep] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isNewPatient, setIsNewPatient] = useState(false);
    
    // Form Data
    const [patientName, setPatientName] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [reason, setReason] = useState('');
    const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
    const [assignedVet, setAssignedVet] = useState('');

    // Filter existing patients for suggestions
    const patientSuggestions = MOCK_PATIENTS_DETAILED.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.owner.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectPatient = (p: any) => {
        setPatientName(p.name);
        setOwnerName(p.owner.name);
        setIsNewPatient(false);
        setStep(2);
    };

    const handleManualContinue = () => {
        if (patientName && ownerName) {
            setIsNewPatient(true);
            setStep(2);
        }
    };

    const handleSubmit = () => {
        if (!reason) return;
        onCheckIn({
            patientName,
            ownerName,
            reason,
            priority,
            assignedVetPreference: assignedVet
        });
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h3 className="text-xl font-black text-slate-800">Check-in Patient</h3>
                        <p className="text-xs text-slate-500 font-medium">Step {step} of 2</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400"><X size={20}/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {step === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right">
                            {/* Search / Select */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Search Patient</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="Patient name or owner..." 
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                {/* Suggestions */}
                                {searchTerm && (
                                    <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                                        {patientSuggestions.map(p => (
                                            <button 
                                                key={p.id} 
                                                onClick={() => handleSelectPatient(p)}
                                                className="w-full flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all text-left group"
                                            >
                                                <img src={p.image} className="w-8 h-8 rounded-full object-cover" />
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm group-hover:text-teal-700">{p.name}</p>
                                                    <p className="text-[10px] text-slate-500">{p.owner.name}</p>
                                                </div>
                                                <ChevronDown className="ml-auto text-slate-300 group-hover:text-teal-500 -rotate-90" size={16} />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="relative flex items-center justify-center">
                                <div className="absolute inset-0 border-t border-slate-200"></div>
                                <span className="relative bg-white px-4 text-xs font-bold text-slate-400 uppercase">Or New Patient</span>
                            </div>

                            {/* Manual Entry */}
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Patient Name</label>
                                    <input 
                                        type="text" 
                                        value={patientName} 
                                        onChange={e => setPatientName(e.target.value)} 
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Owner Name</label>
                                    <input 
                                        type="text" 
                                        value={ownerName} 
                                        onChange={e => setOwnerName(e.target.value)} 
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button 
                                    onClick={handleManualContinue} 
                                    disabled={!patientName || !ownerName}
                                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    Continue <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-3">
                                <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center font-bold">
                                    {patientName.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800">{patientName}</p>
                                    <p className="text-xs text-slate-500">{ownerName}</p>
                                </div>
                                <button onClick={() => setStep(1)} className="ml-auto text-xs font-bold text-teal-600 hover:underline">Change</button>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Reason for Visit</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Vaccination, Injury..." 
                                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-teal-500"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Triage Priority</label>
                                <div className="flex bg-slate-50 p-1 rounded-xl">
                                    {[
                                        { id: 'LOW', label: 'Low', color: 'emerald' },
                                        { id: 'MEDIUM', label: 'Medium', color: 'amber' },
                                        { id: 'HIGH', label: 'High', color: 'red' }
                                    ].map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => setPriority(p.id as any)}
                                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                                                priority === p.id 
                                                ? `bg-white text-${p.color}-600 shadow-sm ring-1 ring-${p.color}-200` 
                                                : 'text-slate-500 hover:bg-slate-200'
                                            }`}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Assign Vet (Optional)</label>
                                <select 
                                    value={assignedVet}
                                    onChange={(e) => setAssignedVet(e.target.value)}
                                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                                >
                                    <option value="">No Preference</option>
                                    {staff.filter(s => s.role === 'Vet').map(s => (
                                        <option key={s.id} value={s.name}>{s.name} ({s.status})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button onClick={() => setStep(1)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50">Back</button>
                                <button 
                                    onClick={handleSubmit}
                                    disabled={!reason}
                                    className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-200 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                                >
                                    <UserCheck size={18} /> Check In
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ClinicDashboard: React.FC<ClinicDashboardProps> = ({ initialTab }) => {
    const [view, setView] = useState<'OPERATIONS' | 'INVENTORY'>('OPERATIONS');
    
    const [rooms, setRooms] = useState<ClinicRoom[]>(INITIAL_ROOMS);
    const [queue, setQueue] = useState<QueueItem[]>(INITIAL_QUEUE);
    const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
    const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
    
    const [selectedRoom, setSelectedRoom] = useState<ClinicRoom | null>(null);
    const [viewingPatient, setViewingPatient] = useState<{
        name: string; 
        owner: string; 
        context?: PatientContext
    } | null>(null);
    
    // Modal States
    const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false); 
    const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
    
    // Bulk Import & Menu State
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [showAddMenu, setShowAddMenu] = useState(false);
    const addMenuRef = useRef<HTMLDivElement>(null);

    // Per-row action menu for the inventory table. Held at the parent so that
    // InventoryManagementContent can be invoked as a plain function (avoiding the
    // input-focus-loss caused by remounting a nested component on every render).
    const [openRowMenu, setOpenRowMenu] = useState<string | null>(null);

    // Billing State
    interface BillingSessionData {
        patient: { name: string; owner: string; reason?: string };
        type: 'ROOM_DISCHARGE' | 'QUEUE_DISCHARGE';
        roomId?: string;
        queueId?: string;
        nextRoomStatus?: RoomStatus;
    }
    const [billingSession, setBillingSession] = useState<BillingSessionData | null>(null);

    // Form States
    const [newRoomName, setNewRoomName] = useState('');
    const [newRoomType, setNewRoomType] = useState<RoomType>('EXAM');
    const [newStaffName, setNewStaffName] = useState('');
    const [newStaffRole, setNewStaffRole] = useState<StaffRole>('Vet');

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [queueSearch, setQueueSearch] = useState('');

    // Transient toast feedback (no backend)
    const [toast, setToast] = useState<string | null>(null);
    const showToast = (message: string) => {
        setToast(message);
        setTimeout(() => setToast(null), 2500);
    };

    useEffect(() => {
        if (initialTab === 'Inventory') {
            setView('INVENTORY');
        } else {
            setView('OPERATIONS');
        }
    }, [initialTab]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
                setShowAddMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // --- Handlers ---
    const handleAddRoom = () => {
        if (!newRoomName) return;
        const newRoom: ClinicRoom = {
            id: `r-${Date.now()}`,
            name: newRoomName,
            type: newRoomType,
            status: 'AVAILABLE'
        };
        setRooms([...rooms, newRoom]);
        setIsAddRoomModalOpen(false);
        setNewRoomName('');
    };

    const updateRoomStatus = (roomId: string, status: RoomStatus) => {
        setRooms(prev => prev.map(r => {
            if (r.id === roomId) {
                if (status === 'AVAILABLE' || status === 'CLEANING') {
                    return { ...r, status, currentPatient: undefined, assignedVet: undefined };
                }
                return { ...r, status };
            }
            return r;
        }));
        setSelectedRoom(null);
    };

    const admitPatient = (patientId: string, roomId: string) => {
        const patient = queue.find(q => q.id === patientId);
        if (!patient) return;
        const availableVet = staff.find(s => s.role === 'Vet' && s.status === 'Available')?.name || 'Dr. OnDuty';
        setRooms(prev => prev.map(r => {
            if (r.id === roomId) {
                return {
                    ...r,
                    status: 'OCCUPIED',
                    currentPatient: {
                        name: patient.patientName,
                        owner: patient.ownerName,
                        reason: patient.reason,
                        admittedAt: new Date()
                    },
                    assignedVet: availableVet
                };
            }
            return r;
        }));
        setStaff(prev => prev.map(s => s.name === availableVet ? { ...s, status: 'Busy' } : s));
        setQueue(prev => prev.filter(q => q.id !== patientId));
        setSelectedRoom(null);
    };

    const handleRemoveFromQueue = (queueId: string) => {
        setQueue(prev => prev.filter(q => q.id !== queueId));
        setViewingPatient(null);
    };

    const handleAddToQueue = (data: any) => {
        const newItem: QueueItem = {
            id: `q-${Date.now()}`,
            patientName: data.patientName,
            ownerName: data.ownerName,
            reason: data.reason,
            priority: data.priority,
            arrivalTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            assignedVetPreference: data.assignedVetPreference
        };
        setQueue([...queue, newItem]);
        setIsCheckInModalOpen(false);
    };

    const initiateRoomDischarge = (room: ClinicRoom, nextStatus: RoomStatus) => {
        if (!room.currentPatient) return;
        setBillingSession({
            patient: { 
                name: room.currentPatient.name, 
                owner: room.currentPatient.owner, 
                reason: room.currentPatient.reason 
            },
            type: 'ROOM_DISCHARGE',
            roomId: room.id,
            nextRoomStatus: nextStatus
        });
        setSelectedRoom(null); 
        setViewingPatient(null);
    };

    const initiateQueueDischarge = (queueId: string) => {
        const item = queue.find(q => q.id === queueId);
        if (!item) return;
        setBillingSession({
            patient: {
                name: item.patientName,
                owner: item.ownerName,
                reason: item.reason
            },
            type: 'QUEUE_DISCHARGE',
            queueId: item.id
        });
        setViewingPatient(null);
    };

    const handleTransactionComplete = () => {
        if (billingSession) {
            if (billingSession.type === 'ROOM_DISCHARGE' && billingSession.roomId && billingSession.nextRoomStatus) {
                updateRoomStatus(billingSession.roomId, billingSession.nextRoomStatus);
            } else if (billingSession.type === 'QUEUE_DISCHARGE' && billingSession.queueId) {
                setQueue(prev => prev.filter(q => q.id !== billingSession.queueId));
            }
            setBillingSession(null);
        }
    };

    const handleAddStaff = () => {
        if(!newStaffName) return;
        const colors: Record<StaffRole, string> = { 'Vet': 'blue', 'Tech': 'amber', 'Admin': 'slate' };
        const newMember: StaffMember = {
            id: `s-${Date.now()}`,
            name: newStaffName,
            role: newStaffRole,
            status: 'Available',
            color: colors[newStaffRole]
        };
        setStaff([...staff, newMember]);
        setNewStaffName('');
    };

    const updateStaffStatus = (id: string, status: StaffStatus) => {
        setStaff(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    };

    const handleAddItem = (newItem: InventoryItem) => {
        const item: InventoryItem = {
            ...newItem,
            id: `i-${Date.now()}`,
            status: newItem.stock <= newItem.minLevel ? 'Low Stock' : 'In Stock'
        };
        setInventory([...inventory, item]);
        setIsInventoryModalOpen(false);
    };

    const handleImportComplete = (summary: any) => {
        setIsImportModalOpen(false);
        // Mock import logic - adding dummy items if count > 0
        if (summary.created > 0) {
             const newItems: InventoryItem[] = Array.from({length: summary.created}).map((_, i) => ({
                 id: `imp-${Date.now()}-${i}`,
                 name: `Imported Item ${i+1}`,
                 category: 'Supply',
                 stock: 10,
                 minLevel: 5,
                 unit: 'unit',
                 price: 100,
                 costPrice: 50,
                 sku: `IMP-${i+1}`,
                 status: 'In Stock'
             }));
             setInventory([...inventory, ...newItems]);
        }
        alert(`Import Successful! ${summary.created} items added, ${summary.updated} updated.`);
    };

    const updateStock = (id: string, delta: number) => {
        setInventory(prev => prev.map(i => {
            if (i.id === id) {
                const newStock = Math.max(0, i.stock + delta);
                return { 
                    ...i, 
                    stock: newStock,
                    status: newStock <= i.minLevel ? 'Low Stock' : 'In Stock'
                };
            }
            return i;
        }));
    };

    const getStatusColor = (status: RoomStatus) => {
        switch (status) {
            case 'AVAILABLE': return 'bg-emerald-50 border-emerald-200 text-emerald-700';
            case 'OCCUPIED': return 'bg-blue-50 border-blue-200 text-blue-700';
            case 'CLEANING': return 'bg-amber-50 border-amber-200 text-amber-700';
            case 'MAINTENANCE': return 'bg-slate-100 border-slate-200 text-slate-500';
        }
    };

    const getTypeIcon = (type: RoomType) => {
        switch (type) {
            case 'EXAM': return Stethoscope;
            case 'SURGERY': return Activity;
            case 'KENNEL': return User;
            case 'XRAY': return AlertCircle;
        }
    };

    // --- Sub-Components ---
    const InventoryManagementContent = () => {
        const filteredInventory = inventory.filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
            <div className="flex-1 flex flex-col min-h-0"> 
                {/* Toolbar */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search inventory (Name, SKU)..." 
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <div className="relative w-full md:w-auto" ref={addMenuRef}>
                        <button 
                            onClick={() => setShowAddMenu(!showAddMenu)}
                            className="w-full md:w-auto px-6 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 flex items-center justify-center gap-2 transition-all"
                        >
                            <Plus size={18} /> Add Item <ChevronDown size={14} className={`transition-transform duration-200 ${showAddMenu ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {showAddMenu && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-20 animate-in fade-in zoom-in-95 origin-top-right">
                                <button 
                                    onClick={() => { setShowAddMenu(false); setIsInventoryModalOpen(true); }}
                                    className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                                >
                                    <Plus size={16} className="text-emerald-500" /> Add Single Item
                                </button>
                                <div className="h-px bg-slate-100"></div>
                                <button 
                                    onClick={() => { setShowAddMenu(false); setIsImportModalOpen(true); }}
                                    className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                                >
                                    <Upload size={16} className="text-blue-500" /> Bulk Import Items
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Table Container */}
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-100 sticky top-0 z-10">
                                <tr>
                                    <th className="p-4 w-16 bg-slate-50"></th>
                                    <th className="p-4 bg-slate-50">Item Name</th>
                                    <th className="p-4 bg-slate-50">SKU</th>
                                    <th className="p-4 bg-slate-50">Category</th>
                                    <th className="p-4 bg-slate-50">Price / Cost</th>
                                    <th className="p-4 w-40 bg-slate-50">Stock Level</th>
                                    <th className="p-4 bg-slate-50">Status</th>
                                    <th className="p-4 text-right bg-slate-50">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredInventory.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-4">
                                            <img src={item.image || 'https://via.placeholder.com/50'} className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200" />
                                        </td>
                                        <td className="p-4">
                                            <p className="font-bold text-slate-800">{item.name}</p>
                                            <p className="text-xs text-slate-400 truncate max-w-[200px]">{item.description}</p>
                                        </td>
                                        <td className="p-4 text-slate-500 font-mono text-xs">{item.sku}</td>
                                        <td className="p-4">
                                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                                                item.category === 'Medicine' ? 'bg-red-50 text-red-600' :
                                                item.category === 'Retail' ? 'bg-purple-50 text-purple-600' :
                                                'bg-slate-100 text-slate-600'
                                            }`}>{item.category}</span>
                                        </td>
                                        <td className="p-4">
                                            <p className="font-bold text-slate-700">PKR {item.price}</p>
                                            <p className="text-[10px] text-slate-400">Cost: {item.costPrice}</p>
                                        </td>
                                        <td className="p-4">
                                            <div className="w-full">
                                                <div className="flex justify-between text-xs mb-1 items-center">
                                                    <button onClick={() => updateStock(item.id, -1)} className="p-0.5 hover:bg-slate-200 rounded"><X size={10}/></button>
                                                    <span className={`font-bold ${item.stock <= item.minLevel ? 'text-red-600' : 'text-slate-700'}`}>{item.stock}</span>
                                                    <button onClick={() => updateStock(item.id, 1)} className="p-0.5 hover:bg-emerald-100 text-emerald-600 rounded"><Plus size={10}/></button>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full ${item.stock <= item.minLevel ? 'bg-red-500' : 'bg-emerald-500'}`} 
                                                        style={{ width: `${Math.min(100, (item.stock / (item.minLevel * 3)) * 100)}%` }} 
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${
                                                item.stock <= item.minLevel ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                            }`}>
                                                {item.stock <= item.minLevel ? 'Low Stock' : 'In Stock'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right relative">
                                            <button
                                                onClick={() => setOpenRowMenu(openRowMenu === item.id ? null : item.id)}
                                                className="p-2 hover:bg-white hover:shadow-md rounded-lg text-slate-400 hover:text-slate-600 transition-all"
                                            >
                                                <MoreVertical size={16} />
                                            </button>
                                            {openRowMenu === item.id && (
                                                <div className="absolute right-4 top-12 w-44 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-30 animate-in fade-in zoom-in-95 origin-top-right text-left">
                                                    <button
                                                        onClick={() => { updateStock(item.id, 10); setOpenRowMenu(null); showToast(`Restocked ${item.name} (+10 ${item.unit}).`); }}
                                                        className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                                    >
                                                        <Plus size={14} className="text-emerald-500" /> Restock (+10)
                                                    </button>
                                                    <button
                                                        onClick={() => { navigator.clipboard?.writeText(item.sku); setOpenRowMenu(null); showToast(`Copied SKU ${item.sku}.`); }}
                                                        className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                                    >
                                                        <Barcode size={14} className="text-blue-500" /> Copy SKU
                                                    </button>
                                                    <div className="h-px bg-slate-100"></div>
                                                    <button
                                                        onClick={() => { setInventory(prev => prev.filter(i => i.id !== item.id)); setOpenRowMenu(null); showToast(`Removed ${item.name}.`); }}
                                                        className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                    >
                                                        <Trash2 size={14} /> Delete Item
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const RoomActionModal = () => {
        if (!selectedRoom) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-xl text-slate-800">{selectedRoom.name}</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase">{selectedRoom.status}</p>
                        </div>
                        <button onClick={() => setSelectedRoom(null)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20}/></button>
                    </div>
                    <div className="p-6 space-y-4">
                        {selectedRoom.status === 'AVAILABLE' && (
                            <div>
                                <p className="text-sm font-bold text-slate-500 mb-3 uppercase">Select Patient from Queue</p>
                                {queue.length > 0 ? (
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {queue.map(q => (
                                            <button 
                                                key={q.id}
                                                onClick={() => admitPatient(q.id, selectedRoom.id)}
                                                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all group text-left"
                                            >
                                                <div>
                                                    <p className="font-bold text-slate-800">{q.patientName}</p>
                                                    <p className="text-xs text-slate-500">{q.reason}</p>
                                                </div>
                                                <LogIn size={16} className="text-slate-300 group-hover:text-blue-500" />
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-400 text-sm italic">Queue is empty.</p>
                                )}
                                <div className="mt-4 border-t border-slate-100 pt-4">
                                    <button onClick={() => updateRoomStatus(selectedRoom.id, 'MAINTENANCE')} className="w-full py-2 text-slate-500 text-xs font-bold hover:bg-slate-50 rounded-lg">
                                        Mark for Maintenance
                                    </button>
                                </div>
                            </div>
                        )}
                        {selectedRoom.status === 'OCCUPIED' && (
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <User size={32} />
                                </div>
                                <h4 className="text-xl font-black text-slate-800">{selectedRoom.currentPatient?.name}</h4>
                                <p className="text-slate-500 text-sm mb-6">{selectedRoom.currentPatient?.reason}</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => initiateRoomDischarge(selectedRoom, 'CLEANING')}
                                        className="py-3 bg-amber-100 text-amber-700 font-bold rounded-xl hover:bg-amber-200 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Sparkles size={18} /> Discharge & Clean
                                    </button>
                                    <button 
                                        onClick={() => initiateRoomDischarge(selectedRoom, 'AVAILABLE')}
                                        className="py-3 bg-emerald-100 text-emerald-700 font-bold rounded-xl hover:bg-emerald-200 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <LogOut size={18} /> Quick Discharge
                                    </button>
                                </div>
                            </div>
                        )}
                        {selectedRoom.status === 'CLEANING' && (
                            <div className="text-center">
                                <Sparkles className="mx-auto text-amber-500 mb-4" size={48} />
                                <p className="text-slate-600 font-medium mb-6">Room is being sanitized.</p>
                                <button onClick={() => updateRoomStatus(selectedRoom.id, 'AVAILABLE')} className="w-full py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 shadow-lg">
                                    Mark Ready
                                </button>
                            </div>
                        )}
                        {selectedRoom.status === 'MAINTENANCE' && (
                            <div className="text-center">
                                <Settings className="mx-auto text-slate-400 mb-4" size={48} />
                                <p className="text-slate-600 font-medium mb-6">Room under maintenance.</p>
                                <button onClick={() => updateRoomStatus(selectedRoom.id, 'AVAILABLE')} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800">
                                    Re-open Room
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const BillingModal = () => {
        if (!billingSession) return null;
        
        const patientForBilling = {
            name: billingSession.patient.name || 'Unknown',
            owner: { 
                name: billingSession.patient.owner || 'Walk-in',
                email: '', 
                phone: '', 
                address: '' 
            },
        };

        const visitData = {
            notes: 'Clinic Visit',
            treatment: billingSession.patient.reason || 'Consultation'
        };

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden h-[85vh] flex flex-col">
                    <div className="flex justify-between items-center p-4 bg-slate-50 border-b border-slate-200">
                        <h3 className="font-black text-lg text-slate-700">Checkout: {billingSession.patient.name}</h3>
                        <button onClick={() => setBillingSession(null)} className="p-2 hover:bg-slate-200 rounded-full"><X size={20}/></button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <TransactionEngine 
                            patient={patientForBilling} 
                            visitData={visitData} 
                            onComplete={handleTransactionComplete} 
                            inventory={inventory}
                        />
                    </div>
                </div>
            </div>
        )
    }

    const StaffManagementModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-xl text-slate-800">Staff Roster</h3>
                        <p className="text-xs text-slate-500">Manage availability and roles.</p>
                    </div>
                    <button onClick={() => setIsStaffModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20}/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2"><UserPlus size={14}/> Add New Staff</h4>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                placeholder="Name" 
                                value={newStaffName}
                                onChange={(e) => setNewStaffName(e.target.value)}
                                className="flex-1 p-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <select 
                                value={newStaffRole}
                                onChange={(e) => setNewStaffRole(e.target.value as StaffRole)}
                                className="p-2 text-sm border border-slate-200 rounded-lg outline-none bg-white"
                            >
                                <option value="Vet">Veterinarian</option>
                                <option value="Tech">Technician</option>
                                <option value="Admin">Admin</option>
                            </select>
                            <button onClick={handleAddStaff} className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800">Add</button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {staff.map(member => (
                            <div key={member.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:shadow-sm transition-all">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full bg-${member.color}-100 text-${member.color}-600 flex items-center justify-center font-bold`}>
                                        {member.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800">{member.name}</p>
                                        <p className="text-xs text-slate-500">{member.role}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <select 
                                        value={member.status}
                                        onChange={(e) => updateStaffStatus(member.id, e.target.value as StaffStatus)}
                                        className={`text-xs font-bold py-1 px-2 rounded-lg border outline-none cursor-pointer ${
                                            member.status === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            member.status === 'Busy' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                            member.status === 'Surgery' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            'bg-slate-50 text-slate-500 border-slate-200'
                                        }`}
                                    >
                                        <option value="Available">Available</option>
                                        <option value="Busy">Busy</option>
                                        <option value="Surgery">Surgery</option>
                                        <option value="Off Duty">Off Duty</option>
                                    </select>
                                    <button onClick={() => setStaff(prev => prev.filter(s => s.id !== member.id))} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const lowStockItems = inventory.filter(i => i.stock <= i.minLevel);
    const activeStaff = staff.filter(s => s.status !== 'Off Duty');

    const ToastNotice = () => toast ? (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-400" /> {toast}
        </div>
    ) : null;

    // --- MAIN RENDER ---
    if (view === 'INVENTORY') {
        return (
            <div className="flex flex-col h-full gap-6 animate-fade-in">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800">Clinic Inventory</h2>
                        <p className="text-slate-500">Manage pharmaceuticals, supplies, and retail items.</p>
                    </div>
                    <button 
                        onClick={() => setView('OPERATIONS')} 
                        className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        Back to Operations
                    </button>
                </div>
                {InventoryManagementContent()}
                {isInventoryModalOpen && <AddInventoryModal onClose={() => setIsInventoryModalOpen(false)} onSave={handleAddItem} />}
                {isImportModalOpen && <InventoryImportModal onClose={() => setIsImportModalOpen(false)} onImportComplete={handleImportComplete} />}
                {ToastNotice()}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] gap-6 animate-fade-in">
            {ToastNotice()}
            {RoomActionModal()}
            {isStaffModalOpen && StaffManagementModal()}
            {billingSession && BillingModal()}
            
            {viewingPatient && (
                <PatientProfileModal 
                    patientName={viewingPatient.name} 
                    ownerName={viewingPatient.owner} 
                    onClose={() => setViewingPatient(null)}
                    context={viewingPatient.context}
                    onNotify={showToast}
                    availableRooms={rooms.filter(r => r.status === 'AVAILABLE')}
                    actions={{
                        onAdmit: (roomId) => {
                            if (viewingPatient.context?.id) {
                                admitPatient(viewingPatient.context.id, roomId);
                                setViewingPatient(null);
                            }
                        },
                        onDischarge: () => {
                            if (viewingPatient.context?.id) {
                                const room = rooms.find(r => r.id === viewingPatient.context?.id);
                                if (room) initiateRoomDischarge(room, 'CLEANING');
                            }
                        },
                        onQuickDischarge: () => {
                            if (viewingPatient.context?.id) {
                                initiateQueueDischarge(viewingPatient.context.id);
                            }
                        },
                        onRemoveFromQueue: () => {
                            if (viewingPatient.context?.id) {
                                handleRemoveFromQueue(viewingPatient.context.id);
                            }
                        }
                    }}
                />
            )}

            {isAddRoomModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
                        <h3 className="text-xl font-black text-slate-800 mb-4">Add New Room</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Room Name</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Exam Room 3"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newRoomName}
                                    onChange={(e) => setNewRoomName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Room Type</label>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    {(['EXAM', 'SURGERY', 'KENNEL', 'XRAY'] as RoomType[]).map(type => (
                                        <button 
                                            key={type}
                                            onClick={() => setNewRoomType(type)}
                                            className={`py-2 text-xs font-bold rounded-lg border ${newRoomType === type ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-200 text-slate-500'}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setIsAddRoomModalOpen(false)} className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl">Cancel</button>
                            <button onClick={handleAddRoom} className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800">Add Room</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Check-in Modal */}
            {isCheckInModalOpen && (
                <CheckInModal 
                    onClose={() => setIsCheckInModalOpen(false)} 
                    onCheckIn={handleAddToQueue}
                    staff={activeStaff}
                />
            )}

            {/* Header */}
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">Clinic Operations</h2>
                    <p className="text-slate-500">Manage patient flow and facility resources.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setIsStaffModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50"
                    >
                        <Users size={18} /> Manage Staff
                    </button>
                    <button 
                        onClick={() => setView('INVENTORY')}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50"
                    >
                        <Package size={18} /> Inventory
                    </button>
                    <button 
                        onClick={() => setIsAddRoomModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-lg"
                    >
                        <Plus size={18} /> Add Room
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
                
                {/* LEFT: WAITING QUEUE */}
                <div className="w-full lg:w-80 bg-white rounded-2xl border border-slate-200 flex flex-col shadow-sm overflow-hidden shrink-0">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Clock size={18} /> Waiting Room
                        </h3>
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">{queue.length}</span>
                    </div>
                    <div className="p-2">
                        <div className="relative mb-2">
                            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Find patient..."
                                value={queueSearch}
                                onChange={(e) => setQueueSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {queue.filter(item =>
                            item.patientName.toLowerCase().includes(queueSearch.toLowerCase()) ||
                            item.ownerName.toLowerCase().includes(queueSearch.toLowerCase())
                        ).map(item => (
                            <div key={item.id} className="p-3 bg-white border border-slate-100 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all cursor-grab active:cursor-grabbing group relative">
                                <div 
                                    className="absolute inset-0 z-0" 
                                    onClick={() => setSelectedRoom(null)} // Prevents room modal if user drags
                                ></div>
                                <div className="relative z-10 pointer-events-none"> {/* Content wrapper */}
                                    <div className="flex justify-between items-start mb-1 pointer-events-auto">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setViewingPatient({ 
                                                    name: item.patientName, 
                                                    owner: item.ownerName,
                                                    context: {
                                                        name: item.patientName,
                                                        owner: item.ownerName,
                                                        status: 'QUEUE',
                                                        location: 'Waiting Room',
                                                        arrivalTime: item.arrivalTime,
                                                        id: item.id
                                                    }
                                                });
                                            }}
                                            className="font-bold text-slate-800 hover:text-blue-600 hover:underline text-left"
                                        >
                                            {item.patientName}
                                        </button>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                            item.priority === 'HIGH' ? 'bg-red-50 text-red-600 border-red-100' :
                                            item.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                            'bg-slate-50 text-slate-500 border-slate-100'
                                        }`}>
                                            {item.priority}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 pointer-events-none">{item.ownerName}</p>
                                    <div className="flex justify-between items-end mt-2 pointer-events-none">
                                        <span className="text-[10px] text-slate-400 font-medium bg-slate-50 px-1.5 py-0.5 rounded">{item.reason}</span>
                                        <span className="text-[10px] text-slate-400">{item.arrivalTime}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {queue.length === 0 && (
                            <div className="text-center py-10 text-slate-400 text-sm">Queue is empty</div>
                        )}
                    </div>
                    <div className="p-3 border-t border-slate-100">
                        <button 
                            onClick={() => setIsCheckInModalOpen(true)}
                            className="w-full py-2 border-2 border-dashed border-slate-200 text-slate-400 font-bold text-xs rounded-xl hover:border-blue-300 hover:text-blue-500 transition-colors"
                        >
                            + Check-in Patient
                        </button>
                    </div>
                </div>

                {/* CENTER: ROOM GRID */}
                <div className="flex-1 overflow-y-auto min-w-0">
                    {/* Auto-fill grid: columns wrap based on the actual available width of this
                        center column (which is squeezed by the side panels), not the viewport —
                        so cards stay readable instead of cramming 2-3 into a narrow space. */}
                    <div className="grid [grid-template-columns:repeat(auto-fill,minmax(min(200px,100%),1fr))] gap-4">
                        {rooms.map(room => {
                            const StatusIcon = getTypeIcon(room.type);
                            const colorClass = getStatusColor(room.status);
                            
                            const duration = room.currentPatient 
                                ? Math.floor((new Date().getTime() - room.currentPatient.admittedAt.getTime()) / 60000)
                                : 0;

                            return (
                                <div 
                                    key={room.id}
                                    onClick={() => setSelectedRoom(room)}
                                    className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-md hover:scale-[1.01] flex flex-col justify-between min-h-[180px] ${colorClass}`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-2 rounded-lg bg-white/50 backdrop-blur-sm`}>
                                                <StatusIcon size={18} />
                                            </div>
                                            <span className="font-black text-sm uppercase tracking-wide opacity-80">{room.type}</span>
                                        </div>
                                        <div className={`w-3 h-3 rounded-full ${
                                            room.status === 'AVAILABLE' ? 'bg-emerald-500 animate-pulse' :
                                            room.status === 'OCCUPIED' ? 'bg-blue-500' :
                                            room.status === 'CLEANING' ? 'bg-amber-500 animate-pulse' : 'bg-slate-400'
                                        }`}></div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-black mb-1">{room.name}</h3>
                                        <p className="text-xs font-bold opacity-70 uppercase mb-4">{room.status}</p>
                                        
                                        {room.status === 'OCCUPIED' && room.currentPatient ? (
                                            <div className="bg-white/60 p-3 rounded-xl backdrop-blur-sm">
                                                <div className="flex justify-between items-center mb-1">
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setViewingPatient({ 
                                                                name: room.currentPatient!.name, 
                                                                owner: room.currentPatient!.owner,
                                                                context: {
                                                                    name: room.currentPatient!.name,
                                                                    owner: room.currentPatient!.owner,
                                                                    status: 'ADMITTED',
                                                                    location: room.name,
                                                                    id: room.id
                                                                }
                                                            });
                                                        }}
                                                        className="font-bold hover:text-blue-700 hover:underline"
                                                    >
                                                        {room.currentPatient.name}
                                                    </button>
                                                    <span className="text-[10px] font-mono">{duration}m</span>
                                                </div>
                                                <p className="text-xs opacity-80 truncate">{room.currentPatient.reason}</p>
                                                {room.assignedVet && <p className="text-[10px] mt-1 font-medium opacity-70 flex items-center gap-1"><Stethoscope size={10}/> {room.assignedVet}</p>}
                                            </div>
                                        ) : room.status === 'AVAILABLE' ? (
                                            <div className="border-2 border-dashed border-current/30 rounded-xl h-12 flex items-center justify-center text-xs font-bold opacity-60">
                                                Empty
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* RIGHT: STATS & ALERTS */}
                <div className="w-full lg:w-64 space-y-4 shrink-0">
                    {/* Staff Widget */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Active Staff</h4>
                        <div className="space-y-3">
                            {activeStaff.map((member, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full bg-${member.color}-500`}></div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-700">{member.name}</p>
                                            <p className="text-[10px] text-slate-400">{member.role}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-medium ${
                                        member.status === 'Available' ? 'text-emerald-600' : 
                                        member.status === 'Busy' ? 'text-amber-600' : 'text-blue-600'
                                    }`}>{member.status}</span>
                                </div>
                            ))}
                            {activeStaff.length === 0 && <p className="text-xs text-slate-400 italic">No staff clocked in.</p>}
                        </div>
                    </div>

                    {/* Alerts */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Inventory Alerts</h4>
                        <div className="space-y-2">
                            {lowStockItems.length > 0 ? (
                                lowStockItems.map(item => (
                                    <div key={item.id} className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
                                        <AlertCircle size={14} />
                                        <span className="font-bold">{item.name} Low ({item.stock})</span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-xs text-emerald-600 bg-emerald-50 p-2 rounded-lg border border-emerald-100 flex items-center gap-2">
                                    <CheckCircle size={14} /> Stock Levels Good
                                </div>
                            )}
                        </div>
                        <button onClick={() => setView('INVENTORY')} className="w-full mt-3 text-xs font-bold text-blue-600 hover:underline">
                            Order Supplies
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClinicDashboard;
