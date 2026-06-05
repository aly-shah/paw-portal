
import React, { useState, useEffect } from 'react';
import { Lineage, Pet } from '../../types';
import { analyzeLineage, calculateConfidence } from '../../services/geneticsEngine';
import LineageBuilder from './LineageBuilder';
import { AlertTriangle, Brain, ShoppingBag, Activity, RefreshCw, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

interface HeritageDashboardProps {
    pets: Pet[];
    preSelectedPetId?: string | null;
}

const HeritageDashboard: React.FC<HeritageDashboardProps> = ({ pets, preSelectedPetId }) => {
    const [selectedPetId, setSelectedPetId] = useState<string>(preSelectedPetId || (pets.length > 0 ? pets[0].id : ''));
    // Local state to store lineage if not saved in main app state yet
    const [localLineageData, setLocalLineageData] = useState<Record<string, Lineage>>({});
    const [isEditing, setIsEditing] = useState(false);

    const selectedPet = pets.find(p => p.id === selectedPetId);
    
    // Use local state if available, otherwise fall back to pet prop
    const lineage = localLineageData[selectedPetId] || selectedPet?.lineage;
    
    // Determine if we need to show the builder
    const showBuilder = !lineage || isEditing;

    const handleLineageUpdate = (newLineage: Lineage) => {
        const score = calculateConfidence(newLineage.sire, newLineage.dam);
        const updatedLineage = { ...newLineage, confidenceScore: score };
        setLocalLineageData(prev => ({ ...prev, [selectedPetId]: updatedLineage }));
        setIsEditing(false);
    };

    const analysis = lineage ? analyzeLineage(lineage) : null;

    if (!selectedPet) return <div className="p-10 text-center text-slate-400">Please select a pet to view heritage.</div>;

    return (
        <div className="h-full overflow-y-auto pb-10 animate-fade-in">
            {/* Pet Selector (Only if multiple) */}
            {pets.length > 1 && !preSelectedPetId && (
                <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
                    {pets.map(pet => (
                        <button
                            key={pet.id}
                            onClick={() => { setSelectedPetId(pet.id); setIsEditing(false); }}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${selectedPetId === pet.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                        >
                            {pet.name}
                        </button>
                    ))}
                </div>
            )}

            {/* Main Content Area */}
            {showBuilder ? (
                <div className="max-w-2xl mx-auto">
                    <LineageBuilder 
                        petType={selectedPet.type} 
                        onComplete={handleLineageUpdate} 
                        initialLineage={lineage}
                    />
                    {isEditing && (
                        <button onClick={() => setIsEditing(false)} className="w-full mt-4 py-3 text-slate-500 font-bold text-sm hover:bg-slate-100 rounded-xl transition-colors">
                            Cancel Editing
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-8 max-w-4xl mx-auto">
                    
                    {/* Ancestry Visualization */}
                    <div className="bg-white rounded-3xl border border-slate-200 p-8 relative overflow-hidden shadow-sm">
                        <button 
                            onClick={() => setIsEditing(true)} 
                            className="absolute top-4 right-4 p-2 bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
                            title="Edit Lineage"
                        >
                            <RefreshCw size={16} />
                        </button>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12 relative z-0">
                            {/* Sire */}
                            <div className="text-center opacity-80">
                                <div className="w-16 h-16 bg-blue-50 border-2 border-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs mb-2 mx-auto">
                                    Sire
                                </div>
                                <p className="font-bold text-slate-700 text-sm">{lineage.sire.breedName || lineage.sire.visualGuess || 'Unknown'}</p>
                                <p className="text-[10px] text-slate-400 uppercase font-bold">{lineage.sire.type === 'PUREBRED' ? 'Purebred' : 'Mix'}</p>
                            </div>

                            {/* Connection Lines */}
                            <div className="hidden md:flex flex-1 h-px bg-slate-200 max-w-[100px] relative items-center justify-center">
                                <div className="w-2 h-2 bg-slate-300 rounded-full absolute left-0"></div>
                                <div className="w-2 h-2 bg-slate-300 rounded-full absolute right-0"></div>
                            </div>

                            {/* Pet (Center) */}
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-blue-400 to-pink-400 shadow-lg">
                                    <img src={selectedPet.image} className="w-full h-full rounded-full object-cover border-4 border-white" />
                                </div>
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md whitespace-nowrap">
                                    {lineage.confidenceScore}% Confidence
                                </div>
                            </div>

                            {/* Connection Lines */}
                            <div className="hidden md:flex flex-1 h-px bg-slate-200 max-w-[100px] relative items-center justify-center">
                                <div className="w-2 h-2 bg-slate-300 rounded-full absolute left-0"></div>
                                <div className="w-2 h-2 bg-slate-300 rounded-full absolute right-0"></div>
                            </div>

                            {/* Dam */}
                            <div className="text-center opacity-80">
                                <div className="w-16 h-16 bg-pink-50 border-2 border-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold text-xs mb-2 mx-auto">
                                    Dam
                                </div>
                                <p className="font-bold text-slate-700 text-sm">{lineage.dam.breedName || lineage.dam.visualGuess || 'Unknown'}</p>
                                <p className="text-[10px] text-slate-400 uppercase font-bold">{lineage.dam.type === 'PUREBRED' ? 'Purebred' : 'Mix'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Insights Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Health Risks */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Activity size={14} /> Health Predispositions
                            </h4>
                            {analysis?.predictedHealth.length ? (
                                analysis.predictedHealth.map((h, i) => (
                                    <div key={i} className="bg-red-50 border border-red-100 p-4 rounded-2xl">
                                        <div className="flex items-center gap-2 text-red-700 font-bold text-sm mb-1">
                                            <AlertTriangle size={14} /> {h.risk}
                                        </div>
                                        <p className="text-xs text-red-600/80 leading-relaxed">{h.advice}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 border border-slate-100 rounded-2xl text-center text-slate-400 text-xs">No specific risks found.</div>
                            )}
                        </div>

                        {/* Behavioral Traits */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Brain size={14} /> Behavioral Traits
                            </h4>
                            {analysis?.predictedBehavior.length ? (
                                analysis.predictedBehavior.map((b, i) => (
                                    <div key={i} className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
                                        <div className="flex items-center gap-2 text-blue-700 font-bold text-sm mb-1">
                                            <Sparkles size={14} /> {b.trait}
                                        </div>
                                        <p className="text-xs text-blue-600/80 leading-relaxed">{b.advice}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 border border-slate-100 rounded-2xl text-center text-slate-400 text-xs">No specific traits found.</div>
                            )}
                        </div>

                        {/* Care & Products */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <ShieldCheck size={14} /> Care & Essentials
                            </h4>
                            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl space-y-3">
                                {analysis?.carePlan.slice(0, 3).map((tip, i) => (
                                    <div key={i} className="flex items-start gap-2 text-xs text-emerald-800">
                                        <div className="min-w-[4px] h-[4px] rounded-full bg-emerald-500 mt-1.5"></div>
                                        {tip}
                                    </div>
                                ))}
                            </div>
                            
                            {analysis?.productMatches.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {analysis.productMatches.map((p, i) => (
                                        <span key={i} className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 flex items-center gap-1">
                                            <ShoppingBag size={10} /> {p}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HeritageDashboard;
