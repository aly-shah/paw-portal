
import React, { useState, useRef, useEffect } from 'react';
import { Search, FileText, Activity, Phone, Mail, MapPin, Clock, ChevronRight, Plus, Printer, Mic, Image as ImageIcon, X, Save, Sparkles, Play, Pause, FileAudio, Syringe, Pill, Stethoscope, AlertTriangle, Share2, Calendar, CheckCircle, Video, TestTube } from 'lucide-react';
import { MOCK_PATIENTS_DETAILED } from '../../constants';
import { formatMedicalRecord } from '../../services/geminiService';

// Define extended types for state
interface RecordAttachment {
  type: 'image' | 'audio';
  url: string;
  label: string;
}

interface PatientRecord {
  date: string;
  type: string;
  notes: string;
  treatment: string;
  attachments?: RecordAttachment[];
  followUp?: boolean;
}

interface ExtendedPatient {
  id: string;
  name: string;
  breed: string;
  age: number;
  gender: string;
  owner: { name: string; phone: string; email: string; address: string };
  image: string;
  lastVisit: string;
  vitals: { weight: string; temp: string; heartRate: string };
  history: PatientRecord[];
}

const PatientManager: React.FC = () => {
  // Initialize state with mock data
  const [patients, setPatients] = useState<ExtendedPatient[]>(MOCK_PATIENTS_DETAILED as unknown as ExtendedPatient[]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>(MOCK_PATIENTS_DETAILED[0].id);
  
  // View States
  const [viewingRecord, setViewingRecord] = useState<PatientRecord | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [historyQuery, setHistoryQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'history' | 'labs' | 'telehealth'>('history');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Transient toast feedback
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };
  
  // New Record Form State
  const [newRecord, setNewRecord] = useState({
    type: 'Consultation',
    notes: '',
    treatment: '',
    weight: '',
    temp: '',
    heartRate: '',
    attachments: [] as RecordAttachment[],
    followUp: false
  });

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  // Filter History
  const filteredHistory = selectedPatient.history.filter(h => 
    h.notes.toLowerCase().includes(historyQuery.toLowerCase()) ||
    h.type.toLowerCase().includes(historyQuery.toLowerCase()) ||
    h.treatment.toLowerCase().includes(historyQuery.toLowerCase())
  );

  // Helper to check if visited today
  const isVisitedToday = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  // Voice Recognition Setup
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: any) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                transcript += event.results[i][0].transcript;
            }
            if (event.results[event.resultIndex].isFinal) {
                 setNewRecord(prev => ({ ...prev, notes: prev.notes + ' ' + transcript }));
            }
        };
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
        recognitionRef.current?.stop();
        setIsRecording(false);
        setNewRecord(prev => ({
            ...prev,
            attachments: [...prev.attachments, { type: 'audio', url: '#', label: `Voice Note ${new Date().toLocaleTimeString()}.mp3` }]
        }));
    } else {
        recognitionRef.current?.start();
        setIsRecording(true);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const imageUrl = URL.createObjectURL(file);
          setNewRecord(prev => ({
              ...prev,
              attachments: [...prev.attachments, { type: 'image', url: imageUrl, label: file.name }]
          }));
      }
  };

  const handleAIPolish = async () => {
      if (!newRecord.notes.trim()) return;
      setIsPolishing(true);
      const polished = await formatMedicalRecord(newRecord.notes);
      setNewRecord(prev => ({ ...prev, notes: polished }));
      setIsPolishing(false);
  };

  const saveRecord = () => {
      const updatedPatient = { ...selectedPatient };
      
      const entry: PatientRecord = {
          date: new Date().toISOString().split('T')[0],
          type: newRecord.type,
          notes: newRecord.notes,
          treatment: newRecord.treatment || 'Observation',
          attachments: newRecord.attachments,
          followUp: newRecord.followUp
      };

      updatedPatient.history = [entry, ...updatedPatient.history];
      updatedPatient.vitals = {
          weight: newRecord.weight || updatedPatient.vitals.weight,
          temp: newRecord.temp || updatedPatient.vitals.temp,
          heartRate: newRecord.heartRate || updatedPatient.vitals.heartRate,
      };
      updatedPatient.lastVisit = entry.date;

      setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
      
      setIsModalOpen(false);
      setNewRecord({
          type: 'Consultation', notes: '', treatment: '', weight: '', temp: '', heartRate: '', attachments: [], followUp: false
      });
  };

  const openNewRecordModal = () => {
      setNewRecord({
          type: 'Consultation',
          notes: '',
          treatment: '',
          weight: selectedPatient.vitals.weight,
          temp: selectedPatient.vitals.temp,
          heartRate: selectedPatient.vitals.heartRate,
          attachments: [],
          followUp: false
      });
      setIsModalOpen(true);
  };

  // Helpers
  const getRecordIcon = (type: string) => {
    const lower = type.toLowerCase();
    if (lower.includes('vaccin')) return <Syringe size={16} className="text-purple-500" />;
    if (lower.includes('surger') || lower.includes('injury')) return <Activity size={16} className="text-red-500" />;
    if (lower.includes('med') || lower.includes('rx')) return <Pill size={16} className="text-blue-500" />;
    return <Stethoscope size={16} className="text-teal-500" />;
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.owner.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-auto min-h-[calc(100vh-100px)] lg:h-[calc(100vh-140px)] relative animate-fade-in">
      {/* Patient List Sidebar - Full width on mobile, 1/3 on desktop */}
      <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden max-h-[400px] lg:max-h-full">
        <div className="p-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h3 className="font-bold text-slate-800 mb-3 text-lg">Patient Directory</h3>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search patient or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredPatients.map(patient => {
            const isSelected = selectedPatientId === patient.id;
            return (
              <div key={patient.id} className={`border-b border-slate-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}>
                <div 
                  onClick={() => setSelectedPatientId(patient.id)}
                  className={`p-4 cursor-pointer flex items-center gap-4 ${isSelected ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent hover:bg-slate-50'}`}
                >
                  <div className="relative shrink-0">
                     <img src={patient.image} alt={patient.name} className="w-12 h-12 rounded-full object-cover" />
                     {isVisitedToday(patient.lastVisit) && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
                     )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                        <h4 className="font-bold text-slate-800 truncate">{patient.name}</h4>
                        {isVisitedToday(patient.lastVisit) ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full whitespace-nowrap">Today</span>
                        ) : (
                            <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase whitespace-nowrap">{patient.breed}</span>
                        )}
                    </div>
                    <div className="flex justify-between items-end mt-1">
                        <p className="text-xs text-slate-500 truncate">{patient.owner.name}</p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 whitespace-nowrap"><Calendar size={10}/> {patient.lastVisit}</p>
                    </div>
                  </div>
                  <div className={`p-1 rounded-full transition-all duration-300 ${isSelected ? 'bg-blue-100 text-blue-600 rotate-90' : 'text-slate-300'}`}>
                      <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Patient Profile */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden min-h-[600px] lg:h-full">
        {/* Header Profile */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-5">
            <div className="relative group shrink-0">
                 <img src={selectedPatient.image} alt={selectedPatient.name} className="w-20 h-20 rounded-2xl object-cover shadow-sm border-2 border-white group-hover:scale-105 transition-transform" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">{selectedPatient.name}</h2>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase border ${selectedPatient.gender === 'Male' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-pink-50 text-pink-600 border-pink-100'}`}>
                    {selectedPatient.gender}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                 <span>{selectedPatient.breed}</span>
                 <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                 <span>{selectedPatient.age} Years Old</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button 
                onClick={() => setShowReport(true)}
                className="flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
            >
                <Printer size={16} /> Report
            </button>
            <button 
                onClick={openNewRecordModal}
                className="flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
            >
                <Plus size={18} /> Add Record
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
            {/* Active Treatment Banner */}
            {selectedPatient.history.length > 0 && selectedPatient.history[0].treatment && selectedPatient.history[0].treatment !== 'Observation' && (
                <div className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 text-white shadow-lg shadow-indigo-200 mb-6 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shrink-0">
                            <Pill size={24} className="text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-indigo-100 uppercase tracking-wider mb-1">Active Treatment Plan</p>
                            <p className="font-bold text-lg leading-tight">{selectedPatient.history[0].treatment}</p>
                        </div>
                    </div>
                    <div className="text-right hidden sm:block">
                        <p className="text-xs text-indigo-100 mb-1">Prescribed On</p>
                        <div className="flex items-center justify-end gap-1 font-bold">
                            <Calendar size={14} /> {selectedPatient.history[0].date}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
                {/* Left Column: Owner & Vitals */}
                <div className="space-y-6">
                    {/* Owner Card */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Owner Details</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-white shadow-sm">
                                    {selectedPatient.owner.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800">{selectedPatient.owner.name}</p>
                                    <p className="text-xs text-slate-400">Primary Contact</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 text-sm text-slate-600 p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer group">
                                    <Phone size={16} className="text-slate-400 group-hover:text-blue-500" /> {selectedPatient.owner.phone}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600 p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer group">
                                    <Mail size={16} className="text-slate-400 group-hover:text-blue-500" /> {selectedPatient.owner.email}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600 p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer group">
                                    <MapPin size={16} className="text-slate-400 group-hover:text-blue-500" /> {selectedPatient.owner.address}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Latest Vitals */}
                    <div className="bg-blue-50/50 rounded-2xl border border-blue-100 p-5">
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-2">
                                <Activity size={14} /> Latest Vitals
                            </h3>
                            <span className="text-[10px] text-blue-400 font-medium">{selectedPatient.lastVisit}</span>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-3">
                             <div className="bg-white p-3 rounded-xl shadow-sm border border-blue-50">
                                 <p className="text-xs text-slate-400 font-bold uppercase mb-1">Weight</p>
                                 <p className="text-xl font-black text-slate-800">{selectedPatient.vitals.weight}</p>
                             </div>
                             <div className="bg-white p-3 rounded-xl shadow-sm border border-blue-50">
                                 <p className="text-xs text-slate-400 font-bold uppercase mb-1">Temp</p>
                                 <p className="text-xl font-black text-slate-800">{selectedPatient.vitals.temp}</p>
                             </div>
                             <div className="bg-white p-3 rounded-xl shadow-sm border border-blue-50 col-span-2 flex justify-between items-center">
                                 <div>
                                     <p className="text-xs text-slate-400 font-bold uppercase mb-1">Heart Rate</p>
                                     <p className="text-xl font-black text-slate-800">{selectedPatient.vitals.heartRate}</p>
                                 </div>
                                 <div className="h-8 w-16 bg-red-50 rounded flex items-center justify-center">
                                     <Activity size={16} className="text-red-500" />
                                 </div>
                             </div>
                         </div>
                    </div>
                </div>

                {/* Right Column: Tabbed View */}
                <div className="xl:col-span-2 flex flex-col h-full">
                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 border-b border-slate-100 pb-1 overflow-x-auto">
                        {[
                            { id: 'history', label: 'Medical History', icon: FileText },
                            { id: 'labs', label: 'Lab Results', icon: TestTube },
                            { id: 'telehealth', label: 'Telehealth', icon: Video }
                        ].map(tab => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-bold text-sm transition-all whitespace-nowrap ${activeTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                            >
                                <tab.icon size={16} /> {tab.label}
                            </button>
                        ))}
                    </div>
                    
                    {/* History Content */}
                    {activeTab === 'history' && (
                        <>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold text-slate-500 uppercase">Recent Records</h3>
                                <div className="relative w-48">
                                    <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Filter..."
                                        value={historyQuery}
                                        onChange={(e) => setHistoryQuery(e.target.value)}
                                        className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="relative pl-6 border-l-2 border-slate-100 space-y-6 pb-10 animate-in fade-in">
                                {filteredHistory.length > 0 ? filteredHistory.map((record, idx) => (
                                    <div key={idx} className="relative group">
                                        <div className={`absolute -left-[33px] top-0 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${idx === 0 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                            {getRecordIcon(record.type)}
                                        </div>
                                        
                                        <div 
                                            onClick={() => setViewingRecord(record)}
                                            className="bg-white rounded-xl p-5 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                                        >
                                            {record.followUp && (
                                                <div className="absolute top-0 right-0 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-bl-lg border-b border-l border-amber-200 flex items-center gap-1">
                                                    <AlertTriangle size={10} /> Follow Up
                                                </div>
                                            )}

                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-bold text-slate-800">{record.type}</span>
                                                    </div>
                                                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                                        <Clock size={12} /> {record.date}
                                                    </span>
                                                </div>
                                                {record.attachments && record.attachments.length > 0 && (
                                                    <div className="flex gap-1 pr-16">
                                                        {record.attachments.some(a => a.type === 'audio') && <div className="p-1.5 bg-purple-50 rounded text-purple-500"><Mic size={12} /></div>}
                                                        {record.attachments.some(a => a.type === 'image') && <div className="p-1.5 bg-blue-50 rounded text-blue-500"><ImageIcon size={12} /></div>}
                                                    </div>
                                                )}
                                            </div>

                                            <p className="text-slate-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                                                {record.notes}
                                            </p>
                                            
                                            {record.treatment && (
                                                <div className="bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg flex items-center gap-2">
                                                    <Pill size={14} className="text-blue-500" />
                                                    <p className="text-xs font-medium text-slate-700 truncate">{record.treatment}</p>
                                                </div>
                                            )}
                                            
                                            <div className="mt-3 flex items-center gap-2 text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                View Details <ChevronRight size={12} />
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-10 text-slate-400 text-sm italic">
                                        No records found.
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Labs Content */}
                    {activeTab === 'labs' && (
                        <div className="space-y-4 animate-in fade-in">
                            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center shrink-0"><TestTube size={20} /></div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">Comprehensive Metabolic Panel</h4>
                                        <p className="text-xs text-slate-500">IDEXX Laboratories • Oct 15, 2023</p>
                                    </div>
                                </div>
                                <button onClick={() => showToast('Opening Comprehensive Metabolic Panel PDF...')} className="w-full sm:w-auto px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50">View PDF</button>
                            </div>
                             <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center shrink-0"><TestTube size={20} /></div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">Urinalysis</h4>
                                        <p className="text-xs text-slate-500">In-House • Sep 01, 2023</p>
                                    </div>
                                </div>
                                <button onClick={() => showToast('Opening Urinalysis PDF...')} className="w-full sm:w-auto px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50">View PDF</button>
                            </div>
                            <button onClick={() => showToast(`Lab work requested for ${selectedPatient.name}`)} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold text-sm hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-all">
                                + Request New Lab Work
                            </button>
                        </div>
                    )}

                    {/* Telehealth Content */}
                    {activeTab === 'telehealth' && (
                        <div className="flex flex-col items-center justify-center h-64 bg-slate-50 rounded-2xl border border-slate-100 animate-in fade-in p-6">
                            <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-4">
                                <Video size={32} />
                            </div>
                            <h3 className="font-bold text-slate-800 text-lg mb-2 text-center">Start Video Visit</h3>
                            <p className="text-slate-500 text-sm text-center max-w-xs mb-6">
                                Connect with the owner for a remote follow-up. Secure and HIPAA compliant.
                            </p>
                            <button onClick={() => showToast(`Connecting video room with ${selectedPatient.owner.name}...`)} className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold shadow-lg hover:bg-teal-700 flex items-center gap-2">
                                <Video size={18} /> Launch Meeting Room
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* New Record Modal (unchanged logic, just rendered if open) */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                  <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <div>
                          <h3 className="font-bold text-lg text-slate-800">New Clinical Record</h3>
                          <p className="text-xs text-slate-500">Adding entry for <span className="font-bold">{selectedPatient.name}</span></p>
                      </div>
                      <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full p-2 transition-colors">
                          <X size={20} />
                      </button>
                  </div>

                  <div className="p-6 overflow-y-auto flex-1 space-y-6">
                      {/* Vitals Section */}
                      <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                          <p className="text-xs font-bold text-blue-600 uppercase mb-3 flex items-center gap-2"><Activity size={14}/> Vitals Check</p>
                          <div className="grid grid-cols-3 gap-4">
                              <div>
                                  <label className="text-xs text-slate-500 font-medium block mb-1">Weight</label>
                                  <input 
                                    type="text" 
                                    value={newRecord.weight} 
                                    onChange={e => setNewRecord({...newRecord, weight: e.target.value})}
                                    className="w-full p-2 rounded-lg border border-blue-200 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                  />
                              </div>
                              <div>
                                  <label className="text-xs text-slate-500 font-medium block mb-1">Temp</label>
                                  <input 
                                    type="text" 
                                    value={newRecord.temp} 
                                    onChange={e => setNewRecord({...newRecord, temp: e.target.value})}
                                    className="w-full p-2 rounded-lg border border-blue-200 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                  />
                              </div>
                              <div>
                                  <label className="text-xs text-slate-500 font-medium block mb-1">HR (bpm)</label>
                                  <input 
                                    type="text" 
                                    value={newRecord.heartRate} 
                                    onChange={e => setNewRecord({...newRecord, heartRate: e.target.value})}
                                    className="w-full p-2 rounded-lg border border-blue-200 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                  />
                              </div>
                          </div>
                      </div>

                      {/* Notes Editor with Voice & AI */}
                      <div>
                          <div className="flex justify-between items-center mb-2">
                              <label className="text-sm font-bold text-slate-700">Clinical Observations</label>
                              <div className="flex gap-2">
                                  <button 
                                    onClick={toggleRecording}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${isRecording ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                  >
                                      {isRecording ? <><Pause size={12} /> Recording...</> : <><Mic size={12} /> Dictate</>}
                                  </button>
                                  <button 
                                    onClick={handleAIPolish}
                                    disabled={isPolishing}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-purple-50 border border-purple-200 text-purple-600 hover:bg-purple-100 transition-colors disabled:opacity-50"
                                  >
                                      <Sparkles size={12} /> {isPolishing ? 'Polishing...' : 'AI Polish'}
                                  </button>
                              </div>
                          </div>
                          <textarea 
                            value={newRecord.notes}
                            onChange={e => setNewRecord({...newRecord, notes: e.target.value})}
                            placeholder="Enter findings, symptoms, and diagnosis here..."
                            className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          />
                      </div>

                      {/* Treatment */}
                      <div>
                          <label className="text-sm font-bold text-slate-700 block mb-2">Plan / Prescription</label>
                          <input 
                            type="text" 
                            value={newRecord.treatment}
                            onChange={e => setNewRecord({...newRecord, treatment: e.target.value})}
                            placeholder="e.g. Amoxicillin 250mg BID x 7 days"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                      </div>

                      {/* Options */}
                      <div className="flex items-center gap-2">
                           <input 
                             type="checkbox" 
                             id="followUp"
                             checked={newRecord.followUp}
                             onChange={e => setNewRecord({...newRecord, followUp: e.target.checked})}
                             className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                           />
                           <label htmlFor="followUp" className="text-sm font-medium text-slate-700">Flag for Follow-up</label>
                      </div>

                      {/* Attachments */}
                      <div>
                          <label className="text-sm font-bold text-slate-700 block mb-2">Media & Attachments</label>
                          <div className="flex gap-3">
                              <div className="relative overflow-hidden">
                                  <button className="w-20 h-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-300 hover:bg-blue-50 transition-all">
                                      <ImageIcon size={20} />
                                      <span className="text-[10px] mt-1 font-bold">Add Img</span>
                                  </button>
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleImageUpload}
                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                  />
                              </div>
                              
                              {/* Previews */}
                              {newRecord.attachments.map((att, i) => (
                                  <div key={i} className="relative w-20 h-20 bg-white rounded-xl border border-slate-200 p-1 group">
                                      {att.type === 'image' ? (
                                        <img src={att.url} className="w-full h-full object-cover rounded-lg" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-lg"><FileAudio className="text-slate-400" /></div>
                                      )}
                                      <button 
                                        onClick={() => setNewRecord(prev => ({...prev, attachments: prev.attachments.filter((_, idx) => idx !== i)}))}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                          <X size={12} />
                                      </button>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>

                  <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                      <button 
                        onClick={() => setIsModalOpen(false)}
                        className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                        onClick={saveRecord}
                        className="px-6 py-2.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
                      >
                          <Save size={18} /> Save Record
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Transient Toast */}
      {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-bold animate-in fade-in slide-in-from-bottom-4">
              <CheckCircle size={16} className="text-emerald-400" /> {toast}
          </div>
      )}
    </div>
  );
};

export default PatientManager;
