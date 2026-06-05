
import React, { useState } from 'react';
import { Dna, Sparkles, HelpCircle, Check, Search } from 'lucide-react';
import { PET_TAXONOMY } from '../../constants';
import { ParentDetails, Lineage } from '../../types';

interface LineageBuilderProps {
    onComplete: (lineage: Lineage) => void;
    petType: string;
    initialLineage?: Lineage;
}

const LineageBuilder: React.FC<LineageBuilderProps> = ({ onComplete, petType, initialLineage }) => {
    const [sire, setSire] = useState<ParentDetails>(initialLineage?.sire || { type: 'UNKNOWN' });
    const [dam, setDam] = useState<ParentDetails>(initialLineage?.dam || { type: 'UNKNOWN' });

    const taxonomy = PET_TAXONOMY.find(t => t.label === petType) || PET_TAXONOMY.find(t => t.id === 'DOG');
    const breeds = taxonomy?.breeds || [];

    const ParentCard = ({ label, value, onChange, color }: { label: string, value: ParentDetails, onChange: (v: ParentDetails) => void, color: string }) => {
        const isKnown = value.type === 'PUREBRED';

        return (
            <div className={`relative overflow-hidden rounded-2xl border-2 transition-all ${isKnown ? `border-${color}-500 bg-${color}-50` : 'border-slate-200 bg-white'}`}>
                {isKnown && <div className={`absolute top-0 right-0 p-1 bg-${color}-500 rounded-bl-xl text-white`}><Check size={12} /></div>}
                
                <div className="p-5">
                    <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${isKnown ? `text-${color}-700` : 'text-slate-400'}`}>
                        {label}
                    </p>

                    <div className="flex gap-2 mb-4 bg-slate-100 p-1 rounded-lg">
                        <button 
                            onClick={() => onChange({ ...value, type: 'PUREBRED' })}
                            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${value.type === 'PUREBRED' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Known Breed
                        </button>
                        <button 
                            onClick={() => onChange({ type: 'UNKNOWN' })}
                            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${value.type !== 'PUREBRED' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Mixed / Unknown
                        </button>
                    </div>

                    {value.type === 'PUREBRED' ? (
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Select Breed</label>
                            <select 
                                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-offset-1"
                                value={value.breedName || ''}
                                onChange={(e) => onChange({ ...value, breedName: e.target.value })}
                            >
                                <option value="">Choose...</option>
                                {breeds.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                    ) : (
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block flex items-center gap-1">
                                Visual Guess <HelpCircle size={10} />
                            </label>
                            <select 
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-slate-300"
                                value={value.visualGuess || ''}
                                onChange={(e) => onChange({ ...value, type: 'MIXED', visualGuess: e.target.value })}
                            >
                                <option value="">Looks most like...</option>
                                {breeds.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 bg-slate-50/50 border-b border-slate-100 text-center">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Dna size={24} />
                </div>
                <h3 className="font-black text-slate-800 text-lg">Setup Genetic Profile</h3>
                <p className="text-sm text-slate-500 max-w-xs mx-auto">Identify parents to predict health risks and behavioral traits.</p>
            </div>

            <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ParentCard label="Sire (Father)" value={sire} onChange={setSire} color="blue" />
                    <ParentCard label="Dam (Mother)" value={dam} onChange={setDam} color="pink" />
                </div>

                <button 
                    onClick={() => onComplete({ sire, dam, confidenceScore: 0 })}
                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98]"
                >
                    <Sparkles size={18} className="text-purple-400" /> Analyze Heritage
                </button>
            </div>
        </div>
    );
};

export default LineageBuilder;
