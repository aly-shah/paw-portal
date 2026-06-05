
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Pause, Sparkles, AlertTriangle, Activity, ChevronRight, ArrowLeft, Map, Pill, Stethoscope, Thermometer, BrainCircuit, FileText, Send, CheckCircle, X } from 'lucide-react';
import { formatMedicalRecord, analyzeClinicalRisks, generateDifferentialDiagnosis, checkDrugInteractions } from '../../services/geminiService';

interface ActiveVisitProps {
  patient: any;
  onEndVisit: (visitData: any) => void;
  onBack: () => void;
}

const ActiveVisit: React.FC<ActiveVisitProps> = ({ patient, onEndVisit, onBack }) => {
  // States
  const [notes, setNotes] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiRisks, setAiRisks] = useState<string[]>([]);
  const [vitals, setVitals] = useState({ weight: patient.vitals.weight, temp: '', heartRate: '' });
  const [bodyMapMarkers, setBodyMapMarkers] = useState<{x: number, y: number, label: string}[]>([]);
  const [activeTab, setActiveTab] = useState<'soap' | 'map' | 'vitals'>('soap');
  const [treatment, setTreatment] = useState('');
  
  // Co-Pilot States
  const [diffDx, setDiffDx] = useState<string[]>([]);
  const [drugWarnings, setDrugWarnings] = useState<string[]>([]);
  const [isCheckingDrug, setIsCheckingDrug] = useState(false);
  const [handoutSent, setHandoutSent] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Setup Voice Recognition
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
                 setNotes(prev => prev + ' ' + transcript);
            }
        };
    }
  }, []);

  // Real-time AI Risk & Diff Diagnosis Analysis (Debounced)
  useEffect(() => {
      const timer = setTimeout(async () => {
          if (notes.length > 20) {
             // 1. Risk Analysis
             const risks = await analyzeClinicalRisks(notes, JSON.stringify(patient.history));
             setAiRisks(risks);

             // 2. Differential Diagnosis (Tier 4)
             if (diffDx.length === 0) { // Only fetch if empty to avoid thrashing
                const dx = await generateDifferentialDiagnosis(notes, patient.breed, patient.age);
                setDiffDx(dx);
             }
          }
      }, 2500);
      return () => clearTimeout(timer);
  }, [notes, patient.history, patient.breed, patient.age]);

  // Drug Interaction Checker (Tier 4)
  useEffect(() => {
      const timer = setTimeout(async () => {
          if (treatment.length > 4) {
              setIsCheckingDrug(true);
              const warnings = await checkDrugInteractions(treatment, JSON.stringify(patient.history));
              setDrugWarnings(warnings);
              setIsCheckingDrug(false);
          } else {
              setDrugWarnings([]);
          }
      }, 1500);
      return () => clearTimeout(timer);
  }, [treatment, patient.history]);

  const toggleRecording = () => {
    if (isRecording) {
        recognitionRef.current?.stop();
        setIsRecording(false);
    } else {
        recognitionRef.current?.start();
        setIsRecording(true);
    }
  };

  const handlePolish = async () => {
      setIsProcessingAI(true);
      const polished = await formatMedicalRecord(notes);
      setNotes(polished);
      setIsProcessingAI(false);
  };

  const handleSendHandout = () => {
      setHandoutSent(true);
      setTimeout(() => setHandoutSent(false), 3000);
  };

  const addBodyMarker = (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      // Calculate position relative to the container
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      // Use setTimeout to ensure UI updates (ripples, clicks) finish before alert blocks thread
      setTimeout(() => {
        const label = prompt("Label for this area (e.g. 'Laceration', 'Pain'):");
        if (label) {
            setBodyMapMarkers(prev => [...prev, { x, y, label }]);
        }
      }, 50);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 animate-fade-in">
        {/* Top Bar - Patient Context */}
        <div className="bg-slate-900 text-white p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-md sticky top-0 z-20 gap-3">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full"><ArrowLeft /></button>
                <img src={patient.image} className="w-10 h-10 rounded-full border-2 border-teal-500 shrink-0" />
                <div>
                    <h2 className="font-bold text-lg leading-none">{patient.name}</h2>
                    <p className="text-xs text-slate-400">{patient.breed} • {patient.age}yo</p>
                </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                {isRecording && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500 rounded-full animate-pulse text-xs font-bold text-red-400">
                        <div className="w-2 h-2 bg-red-500 rounded-full" /> Live
                    </div>
                )}
                <button 
                    onClick={() => onEndVisit({ notes, vitals, treatment, bodyMapMarkers })}
                    className="bg-teal-600 hover:bg-teal-500 text-white px-5 py-2 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-teal-900/50 flex items-center gap-2"
                >
                    Finish <ChevronRight size={16} />
                </button>
            </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
            
            {/* Tool Sidebar (Bottom on Mobile, Left on Desktop) */}
            <div className="bg-white border-t md:border-t-0 md:border-r border-slate-200 flex flex-row md:flex-col items-center justify-around md:justify-start py-2 md:py-6 gap-0 md:gap-6 shadow-sm z-10 order-last md:order-first w-full md:w-20 shrink-0">
                <button 
                    onClick={() => setActiveTab('soap')}
                    className={`p-3 rounded-xl transition-all ${activeTab === 'soap' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                    <Mic size={24} />
                </button>
                <button 
                    onClick={() => setActiveTab('map')}
                    className={`p-3 rounded-xl transition-all ${activeTab === 'map' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                    <Map size={24} />
                </button>
                <button 
                    onClick={() => setActiveTab('vitals')}
                    className={`p-3 rounded-xl transition-all ${activeTab === 'vitals' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                    <Activity size={24} />
                </button>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 relative order-first md:order-none">
                
                {/* TAB: SOAP / NOTES */}
                {activeTab === 'soap' && (
                    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
                            <h3 className="text-2xl font-black text-slate-800">Clinical Documentation</h3>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button onClick={toggleRecording} className={`flex-1 sm:flex-none justify-center px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${isRecording ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}>
                                    {isRecording ? <><Pause size={16}/> Stop Dictation</> : <><Mic size={16}/> Start Dictation</>}
                                </button>
                                <button onClick={handlePolish} disabled={isProcessingAI} className="flex-1 sm:flex-none justify-center px-4 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-purple-100">
                                    <Sparkles size={16} /> {isProcessingAI ? '...' : 'AI Polish'}
                                </button>
                            </div>
                        </div>

                        <textarea 
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full h-[300px] md:h-[350px] p-6 bg-white rounded-2xl border border-slate-200 shadow-sm text-base md:text-lg leading-relaxed focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none font-medium text-slate-700"
                            placeholder="Speak or type your findings..."
                        />

                        {/* Treatment Field with Drug Safety Check */}
                        <div className={`bg-white p-5 rounded-2xl border shadow-sm transition-colors ${drugWarnings.length > 0 ? 'border-amber-300 ring-4 ring-amber-50' : 'border-slate-200'}`}>
                             <div className="flex justify-between mb-2">
                                 <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Treatment Plan / Rx</label>
                                 {isCheckingDrug && <span className="text-xs text-slate-400 animate-pulse flex items-center gap-1"><BrainCircuit size={12}/> Checking Safety...</span>}
                             </div>
                             <div className="flex items-center gap-3">
                                 <Pill className="text-slate-400" />
                                 <input 
                                    type="text" 
                                    value={treatment}
                                    onChange={(e) => setTreatment(e.target.value)}
                                    placeholder="Prescribe medication or plan..."
                                    className="flex-1 outline-none font-medium text-slate-800"
                                 />
                             </div>
                             {/* Drug Warnings */}
                             {drugWarnings.length > 0 && (
                                 <div className="mt-3 bg-amber-50 p-3 rounded-lg border border-amber-200">
                                     <p className="text-xs font-bold text-amber-700 uppercase flex items-center gap-2 mb-1">
                                         <AlertTriangle size={14} /> Interaction Alert
                                     </p>
                                     {drugWarnings.map((w, i) => (
                                         <p key={i} className="text-sm text-amber-800">{w}</p>
                                     ))}
                                 </div>
                             )}
                        </div>
                    </div>
                )}

                {/* TAB: BODY MAP */}
                {activeTab === 'map' && (
                    <div className="h-full flex flex-col items-center justify-center animate-in fade-in zoom-in-95">
                         <h3 className="text-xl font-bold text-slate-800 mb-2">Interactive Body Map</h3>
                         <p className="text-slate-500 mb-6 text-sm">Click anywhere on the map to tag injuries.</p>
                         
                         <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-white rounded-full shadow-2xl border-4 border-slate-100 flex items-center justify-center overflow-hidden">
                             {/* Overlay to capture clicks reliably */}
                             <div 
                                className="absolute inset-0 z-10 cursor-crosshair"
                                onClick={addBodyMarker}
                             />

                             {/* Simple SVG Silhouette Placeholder */}
                             <svg viewBox="0 0 100 100" className="w-48 h-48 md:w-64 md:h-64 text-slate-200 fill-current pointer-events-none relative z-0">
                                 <path d="M20,60 Q30,40 50,40 T80,60 T90,80 M25,60 L25,90 M75,60 L75,90 M35,60 L35,85 M65,60 L65,85" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                             </svg>
                             <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300 font-bold text-xs pointer-events-none select-none z-0">DOG SILHOUETTE</span>
                             
                             {/* Markers */}
                             {bodyMapMarkers.map((m, i) => (
                                 <div key={i} className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-md group -translate-x-1/2 -translate-y-1/2 z-20" style={{ left: `${m.x}%`, top: `${m.y}%` }}>
                                     {/* Tooltip */}
                                     <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none">
                                         {m.label}
                                     </div>
                                     {/* Delete Button */}
                                     <button 
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent creating new marker
                                            setBodyMapMarkers(prev => prev.filter((_, idx) => idx !== i));
                                        }}
                                        className="absolute -top-3 -right-3 bg-slate-900 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center transition-opacity hover:bg-red-600 shadow-sm"
                                     >
                                          <X size={10} />
                                     </button>
                                 </div>
                             ))}
                         </div>
                         <p className="mt-4 text-xs text-slate-400 italic">Hover over a marker to delete it.</p>
                    </div>
                )}

                {/* TAB: VITALS */}
                {activeTab === 'vitals' && (
                    <div className="max-w-xl mx-auto mt-4 md:mt-10 animate-in fade-in slide-in-from-right">
                        <h3 className="text-2xl font-black text-slate-800 mb-8">Vitals Check</h3>
                        <div className="grid gap-6">
                             <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm">
                                 <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><Activity size={24}/></div>
                                 <div className="flex-1">
                                     <label className="text-xs font-bold text-slate-400 uppercase">Heart Rate (BPM)</label>
                                     <input type="number" value={vitals.heartRate} onChange={e => setVitals({...vitals, heartRate: e.target.value})} className="w-full text-2xl font-bold text-slate-800 outline-none placeholder:text-slate-200" placeholder="00" />
                                 </div>
                             </div>
                             <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm">
                                 <div className="p-3 bg-red-50 rounded-xl text-red-600"><Thermometer size={24}/></div>
                                 <div className="flex-1">
                                     <label className="text-xs font-bold text-slate-400 uppercase">Temperature (°C)</label>
                                     <input type="number" value={vitals.temp} onChange={e => setVitals({...vitals, temp: e.target.value})} className="w-full text-2xl font-bold text-slate-800 outline-none placeholder:text-slate-200" placeholder="00.0" />
                                 </div>
                             </div>
                             <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm">
                                 <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600"><Stethoscope size={24}/></div>
                                 <div className="flex-1">
                                     <label className="text-xs font-bold text-slate-400 uppercase">Weight (kg)</label>
                                     <input type="number" value={vitals.weight} onChange={e => setVitals({...vitals, weight: e.target.value})} className="w-full text-2xl font-bold text-slate-800 outline-none placeholder:text-slate-200" placeholder="00.0" />
                                 </div>
                             </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Sidebar - AI Copilot (Hidden on Mobile, or togglable?) */}
            {/* For Mobile simplicity, we hide it by default or stack it below. Here, we hide it on small screens to reduce clutter */}
            <div className="hidden lg:flex w-80 bg-white border-l border-slate-200 shadow-xl z-10 flex-col shrink-0">
                <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-white">
                    <div className="flex items-center gap-2 text-purple-700 font-bold">
                        <Sparkles size={18} /> Clinical Copilot
                    </div>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-6 bg-slate-50/50">
                    
                    {/* Risk Alerts */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Active Alerts</h4>
                        {aiRisks.length > 0 ? (
                            aiRisks.map((risk, i) => (
                                <div key={i} className="bg-white p-3 rounded-xl border border-amber-200 shadow-sm flex gap-3 mb-2 animate-in slide-in-from-right">
                                    <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={16} />
                                    <p className="text-xs text-slate-700 leading-relaxed">{risk}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-slate-400 italic text-center py-2">Listening for risks...</p>
                        )}
                    </div>

                    {/* Differential Diagnosis */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <BrainCircuit size={12} /> Differential Diagnosis
                        </h4>
                        {diffDx.length > 0 ? (
                            <ul className="space-y-1 bg-white p-3 rounded-xl border border-slate-200">
                                {diffDx.map((dx, i) => (
                                    <li key={i} className="text-xs font-bold text-slate-700 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span> {dx}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-xs text-slate-400 italic text-center py-2">Analyzing symptoms...</p>
                        )}
                    </div>

                    {/* Client Education */}
                    <div>
                         <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <FileText size={12} /> Client Education
                        </h4>
                        <button 
                            onClick={handleSendHandout}
                            disabled={handoutSent}
                            className={`w-full py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                                handoutSent 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-600'
                            }`}
                        >
                            {handoutSent ? <><CheckCircle size={14} /> Handout Sent</> : <><Send size={14} /> Email Care Guide</>}
                        </button>
                    </div>

                    {/* History Context Widget */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Relevant History</h4>
                        {patient.history.slice(0,2).map((h: any, i: number) => (
                            <div key={i} className="mb-3 p-3 bg-white border border-slate-200 rounded-lg text-xs">
                                <div className="font-bold text-slate-700 mb-1">{h.type} ({h.date})</div>
                                <div className="text-slate-500 line-clamp-2">{h.notes}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ActiveVisit;
