
import React, { useState, useEffect } from 'react';
import { MOCK_APPOINTMENTS, MOCK_PATIENTS_DETAILED } from '../../constants';
import { MapPin, Navigation, Clock, Phone, AlertCircle, ArrowRight, CheckCircle, Map, X, CloudSun, Car, Play, Pause, FileText, Stethoscope, ChevronDown, ChevronUp } from 'lucide-react';

interface DayStreamProps {
  onStartVisit: (patientId: string) => void;
}

// --- SUB-COMPONENT: GPS Navigation Modal ---
const RouteModal = ({ onClose, destination }: { onClose: () => void, destination: string }) => {
    return (
        <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col animate-in slide-in-from-bottom-10">
            {/* Map Layer (Simulated) */}
            <div className="flex-1 relative bg-slate-800 overflow-hidden">
                <div className="absolute inset-0 opacity-40 bg-[url('https://imgs.search.brave.com/J_l3a8-ZzE1v-I4fJ4yO5C6m4r3c8b7a9d0e1f2g3h4/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9tYXBz/Lm1hcHRpbGVyLmNv/bS92MS9zdHlsZXMv/c3RyZWV0cy81MTIv/MTcxLzgyLkB4LnBu/Zw')] bg-cover bg-center grayscale invert"></div>
                
                {/* Route Line */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 800" preserveAspectRatio="none">
                    <path d="M200,750 Q150,600 220,500 T180,300 T200,100" fill="none" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round" className="drop-shadow-lg" />
                    <path d="M200,750 Q150,600 220,500 T180,300 T200,100" fill="none" stroke="#60a5fa" strokeWidth="4" strokeLinecap="round" strokeDasharray="10 5" className="animate-pulse" />
                </svg>

                {/* Navigation HUD */}
                <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                    <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-700 shadow-2xl max-w-[250px]">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-blue-600 p-2 rounded-lg text-white"><ArrowRight size={24} className="rotate-[-45deg]" /></div>
                            <div>
                                <p className="text-slate-400 text-xs font-bold uppercase">Next Turn</p>
                                <p className="text-white font-bold text-lg leading-none">150m</p>
                            </div>
                        </div>
                        <p className="text-white text-sm font-medium truncate">{destination}</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-slate-900/50 rounded-full text-white hover:bg-slate-800 backdrop-blur-md border border-slate-700">
                        <X size={24} />
                    </button>
                </div>

                {/* Bottom Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-slate-900 p-6 rounded-t-3xl border-t border-slate-800">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <p className="text-3xl font-black text-white">12 <span className="text-base text-slate-400 font-medium">min</span></p>
                            <p className="text-emerald-400 text-xs font-bold flex items-center gap-1"><CheckCircle size={12}/> Fastest Route</p>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-slate-400">4.2 <span className="text-base text-slate-600 font-medium">km</span></p>
                            <p className="text-slate-500 text-xs font-bold">Distance</p>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-slate-400">10:42 <span className="text-base text-slate-600 font-medium">AM</span></p>
                            <p className="text-slate-500 text-xs font-bold">Arrival</p>
                        </div>
                    </div>
                    <button className="w-full py-4 bg-red-600 text-white font-bold rounded-xl shadow-lg hover:bg-red-700 transition-colors" onClick={onClose}>
                        Exit Navigation
                    </button>
                </div>
            </div>
        </div>
    )
}

const DayStream: React.FC<DayStreamProps> = ({ onStartVisit }) => {
  const [showMap, setShowMap] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<'EN_ROUTE' | 'ARRIVED' | 'IN_CONSULT'>('EN_ROUTE');
  const [isPatientPanelExpanded, setIsPatientPanelExpanded] = useState(true);

  // Initialize: Collapse Next Patient on Mobile/Tablet (<1024px), Expand on Desktop
  useEffect(() => {
      const checkScreen = () => {
          if (window.innerWidth < 1024) {
              setIsPatientPanelExpanded(false);
          } else {
              setIsPatientPanelExpanded(true);
          }
      };
      checkScreen();
  }, []);

  // Simulate "Next Appointment" logic
  const nextAppt = MOCK_APPOINTMENTS[0]; // Barnaby
  const nextPatient = MOCK_PATIENTS_DETAILED.find(p => p.id === nextAppt.patientId);

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in pb-10">
      {showMap && nextPatient && (
          <RouteModal onClose={() => setShowMap(false)} destination={nextPatient.owner.address} />
      )}

      {/* --- COMMAND CENTER HEADER --- */}
      <div className="bg-slate-900 text-white rounded-3xl p-4 md:p-6 shadow-xl relative overflow-hidden flex-shrink-0 transition-all duration-300">
          {/* Background Decor */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="relative z-10 space-y-6">
              {/* Status Bar (Always Visible) */}
              <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                  <div className="w-full xl:w-auto">
                      <div className="flex items-center justify-between xl:justify-start gap-4 mb-2">
                          <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full animate-pulse ${currentStatus === 'EN_ROUTE' ? 'bg-blue-400' : currentStatus === 'ARRIVED' ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
                              <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Current Status</p>
                          </div>
                          
                          {/* Environment Widgets (Small screens: inline with status label) */}
                          <div className="flex xl:hidden gap-2">
                              <div className="flex items-center gap-1 bg-slate-800/50 px-2 py-1 rounded-lg border border-slate-700">
                                  <CloudSun className="text-amber-400" size={12} />
                                  <span className="text-xs font-bold">28°</span>
                              </div>
                              <div className="flex items-center gap-1 bg-slate-800/50 px-2 py-1 rounded-lg border border-slate-700">
                                  <Car className="text-blue-400" size={12} />
                                  <span className="text-xs font-bold">Light</span>
                              </div>
                          </div>
                      </div>
                      
                      {/* Interactive Status Toggle */}
                      <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700 w-full xl:w-auto">
                          {[
                              { id: 'EN_ROUTE', label: 'Driving', icon: Car },
                              { id: 'ARRIVED', label: 'Arrived', icon: MapPin },
                              { id: 'IN_CONSULT', label: 'In Visit', icon: Stethoscope }
                          ].map((status) => {
                              const isActive = currentStatus === status.id;
                              const Icon = status.icon;
                              return (
                                  <button
                                    key={status.id}
                                    onClick={() => setCurrentStatus(status.id as any)}
                                    className={`flex-1 xl:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                        isActive 
                                        ? 'bg-white text-slate-900 shadow-sm' 
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                    }`}
                                  >
                                      <Icon size={14} /> {status.label}
                                  </button>
                              )
                          })}
                      </div>
                  </div>

                  {/* Environment Widgets (Desktop: Right side) */}
                  <div className="hidden xl:flex gap-3">
                      <div className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-2xl backdrop-blur-sm flex flex-col items-center min-w-[80px]">
                          <CloudSun className="text-amber-400 mb-1" size={20} />
                          <span className="text-sm font-bold">28°C</span>
                          <span className="text-[9px] text-slate-400 uppercase font-bold">Clear</span>
                      </div>
                      <div className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-2xl backdrop-blur-sm flex flex-col items-center min-w-[80px]">
                          <Car className="text-blue-400 mb-1" size={20} />
                          <span className="text-sm font-bold">Light</span>
                          <span className="text-[9px] text-slate-400 uppercase font-bold">Traffic</span>
                      </div>
                  </div>
              </div>

              <div className="h-px bg-slate-800 w-full"></div>

              {/* Next Patient Header (Collapsible Trigger on Mobile) */}
              <div 
                className="flex justify-between items-center cursor-pointer lg:cursor-default" 
                onClick={() => window.innerWidth < 1024 && setIsPatientPanelExpanded(!isPatientPanelExpanded)}
              >
                  <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                      Next Patient
                      {!isPatientPanelExpanded && <span className="text-white normal-case font-black text-base ml-2">• {nextPatient?.name}</span>}
                  </h3>
                  <button 
                    className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 lg:hidden text-slate-400 transition-colors"
                  >
                      {isPatientPanelExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  
                  {/* Desktop Only Map Button in Header */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowMap(true); }}
                    className="hidden lg:flex items-center gap-2 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                  >
                      <Map size={14} /> View Live Map
                  </button>
              </div>

              {/* Collapsible Patient Card */}
              {isPatientPanelExpanded && (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row items-center gap-6 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => nextPatient && onStartVisit(nextPatient.id)}>
                           <div className="relative shrink-0">
                               <img src={nextPatient?.image} className="w-20 h-20 rounded-2xl object-cover border-2 border-white/20" />
                               <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-lg shadow-md">
                                   <Navigation size={14} />
                               </div>
                           </div>
                           
                           <div className="flex-1 text-center md:text-left w-full">
                               <h2 className="text-2xl font-black text-white mb-1">{nextPatient?.name}</h2>
                               <p className="text-slate-300 text-sm mb-3 flex items-center justify-center md:justify-start gap-1">
                                   <MapPin size={12} /> {nextPatient?.owner.address}
                               </p>
                               <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                   <span className="px-2 py-1 bg-amber-500/20 text-amber-200 border border-amber-500/30 rounded text-[10px] font-bold flex items-center gap-1">
                                       <AlertCircle size={10} /> Checkup
                                   </span>
                                   <span className="px-2 py-1 bg-slate-700 text-slate-300 border border-slate-600 rounded text-[10px] font-bold">
                                       Due: $45.00
                                   </span>
                               </div>
                           </div>

                           <div className="flex w-full md:w-auto gap-2 mt-2 md:mt-0 md:flex-col">
                               <button 
                                    onClick={(e) => { e.stopPropagation(); setShowMap(true); }}
                                    className="flex-1 lg:hidden px-4 py-3 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                                >
                                   <Map size={16} /> Map
                               </button>
                               <button onClick={(e) => { e.stopPropagation(); window.alert('Calling owner...'); }} className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                                   <Phone size={16} /> Call
                               </button>
                               <button onClick={(e) => { e.stopPropagation(); }} className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                                   <FileText size={16} /> Notes
                               </button>
                           </div>
                      </div>
                  </div>
              )}
          </div>
      </div>

      {/* --- TIMELINE STREAM --- */}
      <div className="bg-white rounded-3xl border border-slate-200 flex-1 p-6 md:p-8 overflow-y-auto shadow-sm relative">
           <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-2 sticky top-0 bg-white z-10 py-2">
               <Clock className="text-slate-400" size={20} /> Today's Itinerary
           </h3>
           
           <div className="relative space-y-8">
               {/* Vertical Line */}
               <div className="absolute left-[27px] top-2 bottom-0 w-0.5 bg-slate-100"></div>

               {MOCK_APPOINTMENTS.map((appt, i) => {
                   const p = MOCK_PATIENTS_DETAILED.find(pat => pat.id === appt.patientId);
                   const isDone = i < 0; // Mock logic
                   const isNext = i === 0;

                   return (
                       <div key={i} className={`relative pl-16 transition-all duration-500 ${isNext ? 'opacity-100 translate-x-0' : 'opacity-60'}`}>
                           {/* Timeline Node */}
                           <div className={`absolute left-0 top-0 w-14 flex flex-col items-center z-10`}>
                               <div className={`w-14 py-1 rounded-lg text-center text-xs font-black border-2 ${isNext ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200'}`}>
                                   {appt.time}
                               </div>
                               {isNext && <div className="h-full w-0.5 bg-blue-500 mt-2 rounded-full"></div>}
                           </div>
                           
                           {/* Card */}
                           <div className={`p-5 rounded-2xl border-2 transition-all hover:shadow-md cursor-pointer ${
                               isNext 
                               ? 'bg-blue-50/50 border-blue-100 ring-1 ring-blue-200' 
                               : 'bg-white border-slate-100'
                           }`}>
                               <div className="flex justify-between items-start mb-3">
                                   <div>
                                       <h4 className="text-lg font-bold text-slate-800">{p?.name}</h4>
                                       <p className="text-sm text-slate-500 font-medium">{p?.breed} • {p?.age} yrs</p>
                                   </div>
                                   {isNext && (
                                       <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold uppercase">
                                           Next
                                       </span>
                                   )}
                               </div>

                               <div className="flex items-center gap-2 text-xs text-slate-500 bg-white/60 p-2 rounded-lg w-fit mb-3">
                                   <MapPin size={12} /> {p?.owner.address}
                               </div>

                               <div className="flex items-center gap-3 border-t border-slate-200/50 pt-3 mt-2">
                                   <img src={p?.image} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                                   <div className="text-xs text-slate-500">
                                       <span className="font-bold text-slate-700">{p?.owner.name}</span> is the owner
                                   </div>
                               </div>
                           </div>
                       </div>
                   )
               })}
           </div>
      </div>
    </div>
  );
};

export default DayStream;
