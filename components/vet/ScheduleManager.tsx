
import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, User, Calendar as CalendarIcon, AlertCircle, X, CheckCircle, Lock, Plus, Search, Filter, MoreHorizontal, MapPin, Phone, Video, Calendar, ChevronDown, UserCheck, List, Activity, DollarSign, Users, ArrowRight } from 'lucide-react';
import { MOCK_APPOINTMENTS, MOCK_PATIENTS_DETAILED } from '../../constants';

// --- Types ---
interface Appointment {
    id: string;
    date: string;
    time: string;
    duration: number; // minutes
    patientId: string;
    type: string;
    status: 'Confirmed' | 'Pending' | 'Checked-in' | 'Completed' | 'Cancelled';
    vetName?: string;
    notes?: string;
}

// --- Mock Helpers ---
const APPOINTMENT_TYPES = [
    { id: 'Checkup', color: 'blue', label: 'General Checkup', price: 1500 },
    { id: 'Vaccination', color: 'emerald', label: 'Vaccination', price: 2500 },
    { id: 'Surgery', color: 'red', label: 'Surgery', price: 15000 },
    { id: 'Follow-up', color: 'amber', label: 'Follow-up', price: 1000 },
    { id: 'Grooming', color: 'purple', label: 'Grooming', price: 3000 }
];

const STAFF_FILTERS = ['All Vets', 'Dr. Sarah', 'Dr. Khan', 'Nurse Joy'];

// --- MODAL: Book Appointment ---
const BookAppointmentModal = ({ 
    onClose, 
    onBook, 
    initialTime, 
    initialDate, 
    initialPatient,
    initialNotes = ''
}: { 
    onClose: () => void, 
    onBook: (appt: any) => void, 
    initialTime?: string, 
    initialDate: Date, 
    initialPatient?: any,
    initialNotes?: string
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<any>(initialPatient || null);
    const [type, setType] = useState(APPOINTMENT_TYPES[0].id);
    const [time, setTime] = useState(initialTime || '09:00');
    const [duration, setDuration] = useState(30);
    const [notes, setNotes] = useState(initialNotes);

    const filteredPatients = MOCK_PATIENTS_DETAILED.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.owner.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = () => {
        if (!selectedPatient) return;
        onBook({
            id: `new-${Date.now()}`,
            date: initialDate.toISOString().split('T')[0],
            time,
            duration,
            patientId: selectedPatient.id,
            type,
            status: 'Confirmed',
            notes,
            vetName: 'Dr. Sarah' // Default for mock
        });
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="text-xl font-black text-slate-800">New Appointment</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400"><X size={20}/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Patient Search */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Select Patient</label>
                        {!selectedPatient ? (
                            <div className="relative">
                                <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Search name or owner..." 
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    autoFocus
                                />
                                {searchTerm && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-20 max-h-40 overflow-y-auto">
                                        {filteredPatients.map(p => (
                                            <button 
                                                key={p.id}
                                                onClick={() => setSelectedPatient(p)}
                                                className="w-full text-left p-3 hover:bg-slate-50 flex items-center gap-3 border-b border-slate-50 last:border-0"
                                            >
                                                <img src={p.image} className="w-8 h-8 rounded-full object-cover" />
                                                <div>
                                                    <p className="font-bold text-sm text-slate-800">{p.name}</p>
                                                    <p className="text-xs text-slate-500">{p.owner.name}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center gap-3">
                                    <img src={selectedPatient.image} className="w-10 h-10 rounded-full object-cover border-2 border-white" />
                                    <div>
                                        <p className="font-bold text-slate-800">{selectedPatient.name}</p>
                                        <p className="text-xs text-slate-500">{selectedPatient.breed}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedPatient(null)} className="text-xs font-bold text-blue-600 hover:underline">Change</button>
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Time</label>
                            <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Duration</label>
                            <select value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500">
                                <option value={15}>15 min</option>
                                <option value={30}>30 min</option>
                                <option value={60}>1 Hour</option>
                                <option value={120}>2 Hours</option>
                            </select>
                        </div>
                    </div>

                    {/* Appointment Type */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Visit Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            {APPOINTMENT_TYPES.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setType(t.id)}
                                    className={`p-2 rounded-lg text-xs font-bold border transition-all ${
                                        type === t.id 
                                        ? `bg-${t.color}-50 border-${t.color}-500 text-${t.color}-700` 
                                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                    }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Notes</label>
                        <textarea 
                            rows={2}
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Reason for visit..."
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                    <button onClick={handleSubmit} disabled={!selectedPatient} className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed">Confirm Booking</button>
                </div>
            </div>
        </div>
    );
};

// --- MODAL: Appointment Details ---
const AppointmentDetailsModal = ({ appt, onClose, onUpdateStatus, onDelete, onReschedule }: { appt: Appointment, onClose: () => void, onUpdateStatus: (status: any) => void, onDelete: () => void, onReschedule: () => void }) => {
    const patient = MOCK_PATIENTS_DETAILED.find(p => p.id === appt.patientId);
    const typeConfig = APPOINTMENT_TYPES.find(t => t.id === appt.type) || APPOINTMENT_TYPES[0];

    if (!patient) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col">
                <div className={`h-32 bg-${typeConfig.color}-500 relative p-6 flex justify-between items-start`}>
                    <div className="text-white">
                        <div className="flex items-center gap-2 mb-1 opacity-90">
                            <CalendarIcon size={14} /> <span className="text-xs font-bold uppercase tracking-wider">{new Date(appt.date).toDateString()}</span>
                        </div>
                        <h2 className="text-3xl font-black">{appt.time}</h2>
                        <span className="inline-block mt-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold border border-white/30">
                            {appt.duration} minutes
                        </span>
                    </div>
                    <button onClick={onClose} className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 -mt-6 bg-white rounded-t-3xl flex-1">
                    <div className="flex items-start justify-between mb-8">
                        <div className="flex gap-4">
                            <img src={patient.image} className="w-16 h-16 rounded-2xl object-cover shadow-md border-4 border-white" />
                            <div className="mt-2">
                                <h3 className="text-xl font-black text-slate-800 leading-tight">{patient.name}</h3>
                                <p className="text-sm text-slate-500">{patient.breed}, {patient.age}y</p>
                            </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                            appt.status === 'Confirmed' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                            appt.status === 'Checked-in' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                            'bg-slate-50 text-slate-500 border-slate-200'
                        }`}>
                            {appt.status}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-xs font-bold text-slate-400 uppercase">Owner Information</h4>
                                <a href={`tel:${patient.owner.phone}`} className="p-1.5 bg-white rounded-lg shadow-sm text-slate-400 hover:text-blue-500 inline-flex"><Phone size={14}/></a>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-slate-500 border border-slate-200">
                                    {patient.owner.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800">{patient.owner.name}</p>
                                    <p className="text-xs text-slate-500">{patient.owner.phone}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Visit Reason</h4>
                            <p className="text-slate-700 font-medium leading-relaxed">
                                {appt.notes || `Scheduled for ${typeConfig.label}.`}
                            </p>
                        </div>
                        
                        {appt.vetName && (
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Assigned Vet</h4>
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                    <UserCheck size={16} className="text-blue-500" /> {appt.vetName}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
                    {appt.status !== 'Checked-in' && appt.status !== 'Completed' && (
                        <button 
                            onClick={() => { onUpdateStatus('Checked-in'); onClose(); }}
                            className="w-full py-3.5 bg-emerald-500 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-600 flex items-center justify-center gap-2 transition-all"
                        >
                            <CheckCircle size={18} /> Check In Patient
                        </button>
                    )}
                    
                    <div className="flex gap-3">
                        <button onClick={onReschedule} className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100">Reschedule</button>
                        <button onClick={onDelete} className="flex-1 py-3 bg-white border border-slate-200 text-red-500 font-bold rounded-xl hover:bg-red-50">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ScheduleManager: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>(
        MOCK_APPOINTMENTS.map(a => ({
            ...a,
            duration: 30, 
            status: 'Confirmed'
        })) as Appointment[]
    );
    const [blockedSlots, setBlockedSlots] = useState<string[]>(['13:00']);
    
    // Waitlist State
    const [waitlist, setWaitlist] = useState([
        { id: 'w1', name: 'Buddy', reason: 'Checkup', priority: 'Low', patient: MOCK_PATIENTS_DETAILED[0] },
        { id: 'w2', name: 'Luna', reason: 'Vaccine', priority: 'Medium', patient: MOCK_PATIENTS_DETAILED[1] },
        { id: 'w3', name: 'Max', reason: 'Limping', priority: 'High', patient: MOCK_PATIENTS_DETAILED[0] }
    ]);

    // Modal States
    const [isBookModalOpen, setIsBookModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{time: string, date: Date} | null>(null);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [activeFilter, setActiveFilter] = useState('All Vets');
    const [draggedWaitlistId, setDraggedWaitlistId] = useState<string | null>(null);
    
    // Pre-selection state for Waitlist booking
    const [preSelectedPatient, setPreSelectedPatient] = useState<any>(null);
    const [preFilledNotes, setPreFilledNotes] = useState('');

    // Derived Daily Stats
    const formatDateKey = (date: Date) => date.toISOString().split('T')[0];
    
    const dailyStats = useMemo(() => {
        const dateKey = formatDateKey(currentDate);
        const todays = appointments.filter(a => a.date === dateKey);
        const total = todays.length;
        const pending = todays.filter(a => a.status === 'Pending').length;
        const revenue = todays.reduce((sum, appt) => {
            const type = APPOINTMENT_TYPES.find(t => t.id === appt.type);
            return sum + (type ? type.price : 0);
        }, 0);
        return { total, pending, revenue };
    }, [appointments, currentDate]);

    // Generate Time Slots (8 AM to 6 PM)
    const timeSlots = useMemo(() => {
        const slots = [];
        for (let i = 8; i <= 18; i++) {
            slots.push(`${i.toString().padStart(2, '0')}:00`);
            slots.push(`${i.toString().padStart(2, '0')}:30`);
        }
        return slots;
    }, []);

    // Generate Calendar Grid
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
        return days;
    };

    const getAppointmentsForSlot = (time: string) => {
        const dateKey = formatDateKey(currentDate);
        return appointments.filter(a => a.date === dateKey && a.time === time);
    };

    const handleAddAppointment = (newAppt: any) => {
        setAppointments([...appointments, newAppt]);
        // If this came from waitlist (we have a preSelectedPatient), we could optionally remove it from waitlist here
        if (preSelectedPatient) {
            // Mock remove from waitlist logic
            setWaitlist(prev => prev.filter(item => item.patient.id !== preSelectedPatient.id));
        }
        setIsBookModalOpen(false);
        setPreSelectedPatient(null);
        setPreFilledNotes('');
    };

    const handleUpdateStatus = (id: string, status: any) => {
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    };

    const handleDeleteAppointment = (id: string) => {
        if (confirm("Are you sure you want to cancel this appointment?")) {
            setAppointments(prev => prev.filter(a => a.id !== id));
            setSelectedAppointment(null);
        }
    };

    const handleWaitlistBooking = (item: any) => {
        setSelectedSlot({ time: '09:00', date: currentDate });
        setPreSelectedPatient(item.patient);
        setPreFilledNotes(item.reason);
        setIsBookModalOpen(true);
    };

    const handleReschedule = (appt: Appointment) => {
        // Remove the existing appointment and reopen the booking flow pre-filled
        const patient = MOCK_PATIENTS_DETAILED.find(p => p.id === appt.patientId);
        setAppointments(prev => prev.filter(a => a.id !== appt.id));
        setSelectedAppointment(null);
        setSelectedSlot({ time: appt.time, date: new Date(appt.date) });
        setPreSelectedPatient(patient || null);
        setPreFilledNotes(appt.notes || '');
        setIsBookModalOpen(true);
    };

    // --- RENDER ---
    return (
        <div className="h-full flex flex-col lg:flex-row gap-6 bg-slate-50/50 animate-fade-in">
            {isBookModalOpen && (
                <BookAppointmentModal 
                    onClose={() => { 
                        setIsBookModalOpen(false); 
                        setPreSelectedPatient(null); 
                        setPreFilledNotes(''); 
                    }} 
                    onBook={handleAddAppointment}
                    initialTime={selectedSlot?.time}
                    initialDate={selectedSlot?.date || currentDate}
                    initialPatient={preSelectedPatient} 
                    initialNotes={preFilledNotes}
                />
            )}

            {selectedAppointment && (
                <AppointmentDetailsModal 
                    appt={selectedAppointment}
                    onClose={() => setSelectedAppointment(null)}
                    onUpdateStatus={(status) => handleUpdateStatus(selectedAppointment.id, status)}
                    onDelete={() => handleDeleteAppointment(selectedAppointment.id)}
                    onReschedule={() => handleReschedule(selectedAppointment)}
                />
            )}

            {/* LEFT: Sidebar Controls (Responsive: Stack on mobile, Fixed width on desktop) */}
            <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0 overflow-y-auto lg:overflow-visible">
                {/* Mini Calendar */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-slate-800">{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                        <div className="flex gap-1">
                            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"><ChevronLeft size={18}/></button>
                            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"><ChevronRight size={18}/></button>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                            <div key={d} className="text-center text-[10px] font-bold text-slate-400 py-1">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {getDaysInMonth(currentDate).map((date, i) => {
                            if (!date) return <div key={i} />;
                            const isSelected = formatDateKey(date) === formatDateKey(currentDate);
                            const isToday = formatDateKey(date) === formatDateKey(new Date());
                            const hasAppts = appointments.some(a => a.date === formatDateKey(date));

                            return (
                                <button 
                                    key={i}
                                    onClick={() => setCurrentDate(date)}
                                    className={`
                                        relative h-9 w-9 rounded-xl flex items-center justify-center text-xs font-medium transition-all mx-auto
                                        ${isSelected ? 'bg-slate-900 text-white shadow-md' : 'hover:bg-slate-100 text-slate-600'}
                                        ${isToday && !isSelected ? 'bg-blue-50 text-blue-600 font-bold' : ''}
                                    `}
                                >
                                    {date.getDate()}
                                    {hasAppts && !isSelected && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Dynamic Daily Summary */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-sm opacity-80 flex items-center gap-2"><Calendar size={16}/> {currentDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short'})} Summary</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                                <p className="text-2xl font-black">{dailyStats.total}</p>
                                <p className="text-[10px] uppercase font-bold opacity-60">Appts</p>
                            </div>
                            <div className="bg-emerald-500/20 rounded-xl p-3 backdrop-blur-sm border border-emerald-500/30">
                                <p className="text-2xl font-black text-emerald-400 flex items-baseline gap-0.5">
                                    <span className="text-sm">PKR</span>
                                    {(dailyStats.revenue / 1000).toFixed(1)}k
                                </p>
                                <p className="text-[10px] uppercase font-bold text-emerald-200">Est. Revenue</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => { setSelectedSlot({time: '09:00', date: currentDate}); setIsBookModalOpen(true); }}
                            className="w-full mt-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus size={16} /> Quick Book
                        </button>
                    </div>
                    {/* Decor */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-[60px] opacity-20"></div>
                </div>
            </div>

            {/* RIGHT: Timeline */}
            <div className="flex-1 bg-white rounded-[2rem] shadow-sm border border-slate-200 flex flex-col overflow-hidden min-h-[500px]">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10 sticky top-0">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800">{currentDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</h2>
                        <p className="text-slate-500 text-sm font-medium">Timeline View</p>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setCurrentDate(new Date())}
                            className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-200 transition-colors"
                        >
                            Today
                        </button>
                    </div>
                </div>

                {/* NEW: Waitlist Section at Top */}
                <div className="bg-slate-50 border-b border-slate-100 p-4">
                     <div className="flex justify-between items-center mb-3 px-1">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <List size={14} /> Waitlist ({waitlist.length})
                        </h4>
                        <button 
                            onClick={() => alert("Add patient to waitlist")}
                            className="text-blue-600 text-xs font-bold hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                        >
                            + Add Patient
                        </button>
                     </div>
                     
                     {/* Horizontal Scrollable Strip */}
                     <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {waitlist.length > 0 ? (
                            waitlist.map(item => (
                                <div 
                                    key={item.id} 
                                    onClick={() => handleWaitlistBooking(item)} // Making the whole card clickable
                                    className="min-w-[220px] bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-all group shrink-0 cursor-pointer hover:border-blue-300"
                                >
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-sm font-bold text-slate-800">{item.name}</p>
                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                                item.priority === 'High' ? 'bg-red-50 text-red-600' :
                                                item.priority === 'Medium' ? 'bg-amber-50 text-amber-600' :
                                                'bg-emerald-50 text-emerald-600'
                                            }`}>
                                                {item.priority}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-500">{item.reason}</p>
                                    </div>
                                    <button 
                                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors group-hover:bg-blue-600 group-hover:text-white"
                                        title="Book Appointment"
                                    >
                                        <ArrowRight size={14} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="w-full p-6 border-2 border-dashed border-slate-200 rounded-xl text-center">
                                <p className="text-xs text-slate-400 italic">No patients currently on waitlist.</p>
                            </div>
                        )}
                     </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="space-y-4 relative">
                        {/* Vertical Time Line */}
                        <div className="absolute left-[60px] top-4 bottom-0 w-px bg-slate-100"></div>

                        {timeSlots.map((time, i) => {
                            const slotAppts = getAppointmentsForSlot(time);
                            const isBlocked = blockedSlots.includes(time);
                            const isHour = time.endsWith(':00');

                            return (
                                <div key={time} className="flex gap-6 group min-h-[80px]">
                                    {/* Time Label */}
                                    <div className="w-16 pt-2 text-right">
                                        <span className={`text-xs font-bold ${isHour ? 'text-slate-800' : 'text-slate-300'}`}>{time}</span>
                                    </div>

                                    {/* Slot Container */}
                                    <div className="flex-1 relative pt-2">
                                        {/* Grid Line */}
                                        <div className="absolute top-4 left-0 right-0 h-px bg-slate-50 group-hover:bg-slate-100 transition-colors"></div>

                                        {slotAppts.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
                                                {slotAppts.map(appt => {
                                                    const patient = MOCK_PATIENTS_DETAILED.find(p => p.id === appt.patientId);
                                                    const typeStyle = APPOINTMENT_TYPES.find(t => t.id === appt.type);
                                                    
                                                    return (
                                                        <div 
                                                            key={appt.id}
                                                            onClick={() => setSelectedAppointment(appt)}
                                                            className={`p-3 rounded-2xl border-l-4 shadow-sm hover:shadow-md cursor-pointer transition-all bg-white border border-slate-200 hover:border-${typeStyle?.color}-300`}
                                                            style={{ borderLeftColor: typeStyle?.color === 'blue' ? '#3b82f6' : typeStyle?.color === 'red' ? '#ef4444' : typeStyle?.color === 'emerald' ? '#10b981' : '#f59e0b' }}
                                                        >
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div className="flex items-center gap-3">
                                                                    <img src={patient?.image} className="w-8 h-8 rounded-full object-cover bg-slate-100" />
                                                                    <div>
                                                                        <h4 className="font-bold text-sm text-slate-800">{patient?.name}</h4>
                                                                        <p className="text-[10px] text-slate-500">{typeStyle?.label}</p>
                                                                    </div>
                                                                </div>
                                                                {appt.status === 'Checked-in' && <CheckCircle size={14} className="text-emerald-500" />}
                                                            </div>
                                                            <div className="flex justify-between items-end">
                                                                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">{appt.duration} min</span>
                                                                <span className="text-[10px] text-slate-400">{appt.vetName}</span>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        ) : isBlocked ? (
                                            <div className="h-16 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center opacity-60 relative z-10">
                                                <span className="text-xs font-bold text-slate-400 flex items-center gap-2"><Lock size={12}/> Unavailable</span>
                                            </div>
                                        ) : (
                                            <div 
                                                onClick={() => { setSelectedSlot({time, date: currentDate}); setIsBookModalOpen(true); }}
                                                className="h-16 rounded-xl border-2 border-dashed border-transparent hover:border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer relative z-10 group/slot"
                                            >
                                                <span className="text-xs font-bold text-slate-400 opacity-0 group-hover/slot:opacity-100 flex items-center gap-2 transition-opacity">
                                                    <Plus size={14} /> Book Slot
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                        
                        {/* End Padding */}
                        <div className="h-20"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScheduleManager;
