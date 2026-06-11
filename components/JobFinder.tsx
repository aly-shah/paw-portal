
import React, { useState } from 'react';
import { MapPin, Clock, DollarSign, Star, Calendar, Filter, Search, Briefcase, CheckCircle, User, Heart, Shield, Navigation, Play, Camera, Pause, StopCircle, AlertCircle, ChevronRight, Map, X, Tag, Check, ArrowUpRight, SlidersHorizontal, List, LayoutGrid, Share2, Stethoscope } from 'lucide-react';
import { AVAILABLE_JOBS } from '../constants';
import { UserRole } from '../types';

interface JobFinderProps {
    userRole: UserRole;
}

// --- SUB-COMPONENT: Job Details Modal ---
const JobDetailsModal = ({ job, onClose, onApply, applied, userRole }: { job: any, onClose: () => void, onApply: () => void, applied: boolean, userRole: UserRole }) => {
    const [bid, setBid] = useState('');
    const [note, setNote] = useState<string | null>(null);

    const isMedical = userRole === UserRole.VET || userRole === UserRole.CLINIC;

    const flash = (msg: string) => {
        setNote(msg);
        setTimeout(() => setNote(null), 2500);
    };

    const handleShare = async () => {
        const shareData = {
            title: `${job.type} — ${job.pet}`,
            text: `Check out this ${job.type} job for ${job.pet} (${job.breed}) on PawPortal.`,
            url: window.location.href,
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
                flash('Link copied to clipboard!');
            }
        } catch {
            /* user cancelled share — no-op */
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 relative">
                {note && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-5 py-2.5 rounded-xl shadow-2xl z-30 animate-in slide-in-from-top-2 fade-in flex items-center gap-2">
                        <CheckCircle size={16} className="text-emerald-400" />
                        <p className="text-xs font-bold">{note}</p>
                    </div>
                )}
                {/* Header Image */}
                <div className="h-48 bg-slate-100 relative">
                    <img src={job.image} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                    
                    {/* Header Controls */}
                    <div className="absolute top-4 right-4 flex gap-2">
                        <button onClick={handleShare} className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors">
                            <Share2 size={20} />
                        </button>
                        <button onClick={onClose} className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <div className="flex justify-between items-end">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-white/30">
                                        {job.type}
                                    </span>
                                    {job.urgent && (
                                        <span className="bg-red-500 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider animate-pulse">
                                            Urgent
                                        </span>
                                    )}
                                </div>
                                <h2 className="text-3xl font-black mb-1">{job.pet}</h2>
                                <p className="text-sm text-slate-300 font-medium">{job.breed} • {job.distance} away</p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-black text-emerald-400">Open</p>
                                <p className="text-xs text-slate-300 font-bold uppercase">{job.duration}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto space-y-8">
                    {/* Owner Info */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-4">
                            <img src={job.owner.avatar} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                            <div>
                                <h4 className="font-bold text-slate-800 flex items-center gap-1">
                                    {job.owner.name}
                                    {job.owner.verified && <CheckCircle size={14} className="text-blue-500" />}
                                </h4>
                                <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                                    <Star size={12} fill="currentColor" /> {job.owner.rating} Owner Rating
                                </div>
                            </div>
                        </div>
                        <button onClick={() => flash(`${job.owner.name}'s full profile is coming soon.`)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100">
                            View Profile
                        </button>
                    </div>

                    {/* Logistics */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 border border-slate-100 rounded-xl">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-2">
                                <Clock size={14} /> Time & Date
                            </p>
                            <p className="font-bold text-slate-800">{job.time}</p>
                        </div>
                         <div className="p-4 border border-slate-100 rounded-xl">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-2">
                                <MapPin size={14} /> Location
                            </p>
                            <p className="font-bold text-slate-800">{job.location}</p>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg mb-3">About the Job</h3>
                        <p className="text-slate-600 leading-relaxed text-sm">{job.description}</p>
                    </div>

                    {/* Requirements */}
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg mb-3">Requirements</h3>
                        <div className="flex flex-wrap gap-2">
                            {job.requirements.map((req: string, i: number) => (
                                <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg border border-slate-200">
                                    {req}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Proposal Input */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                        <label className="text-sm font-bold text-slate-700 mb-2 block">{isMedical ? 'Consultation Estimate' : 'Suggest Your Rate'}</label>
                        <div className="relative">
                            <span className="absolute left-4 top-3.5 text-slate-400 text-sm font-bold">PKR</span>
                            <input 
                                type="number" 
                                value={bid}
                                onChange={(e) => setBid(e.target.value)}
                                placeholder="Enter amount"
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-slate-900 outline-none font-bold text-slate-800"
                            />
                        </div>
                        <p className="text-xs text-slate-400 mt-2">{isMedical ? 'You can adjust this after examination.' : 'The owner has not set a fixed price. Make your best offer.'}</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
                    <button onClick={onClose} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-colors">
                        Cancel
                    </button>
                    <button 
                        onClick={onApply}
                        disabled={applied || !bid}
                        className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                            applied 
                            ? 'bg-emerald-500 cursor-default' 
                            : 'bg-slate-900 hover:bg-slate-800 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
                        }`}
                    >
                        {applied ? <><CheckCircle size={20}/> Offer Sent</> : 'Submit Offer'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const JobFinder: React.FC<JobFinderProps> = ({ userRole }) => {
    const [viewMode, setViewMode] = useState<'LIST' | 'MAP'>('LIST');
    const [jobFilter, setJobFilter] = useState('All');
    const [jobSort, setJobSort] = useState('Recommended');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filterMinPay, setFilterMinPay] = useState(0);
    const [filterMaxDistance, setFilterMaxDistance] = useState(50);
    const [onlySaved, setOnlySaved] = useState(false);

    const [selectedJob, setSelectedJob] = useState<any>(null);
    const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
    const [savedJobs, setSavedJobs] = useState<string[]>([]);

    const isMedical = userRole === UserRole.VET || userRole === UserRole.CLINIC;

    // Categories based on Role
    const categories = isMedical 
        ? ['All', 'Vet Visit', 'Medical Boarding'] 
        : ['All', 'Dog Walking', 'Pet Sitting', 'House Visit', 'Boarding'];

    const handleApply = (id: string) => {
        setAppliedJobs(prev => [...prev, id]);
        setTimeout(() => setSelectedJob(null), 1500);
    };

    const toggleSaveJob = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSavedJobs(prev => prev.includes(id) ? prev.filter(j => j !== id) : [...prev, id]);
    };

    const filteredJobs = AVAILABLE_JOBS.filter(job => {
        // Role based filtering
        if (isMedical && job.type !== 'Vet Visit' && jobFilter === 'All') return false;
        if (!isMedical && job.type === 'Vet Visit' && jobFilter === 'All') return false;

        const matchesType = jobFilter === 'All' || job.type === jobFilter;
        const matchesSearch = job.location.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              job.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              job.type.toLowerCase().includes(searchQuery.toLowerCase());
        const dist = parseFloat(job.distance.replace(' km', ''));
        const matchesFilters = job.pay >= filterMinPay && dist <= filterMaxDistance;
        const matchesSaved = onlySaved ? savedJobs.includes(job.id) : true;

        return matchesType && matchesSearch && matchesFilters && matchesSaved;
    }).sort((a, b) => {
        if (jobSort === 'Highest Pay') return b.pay - a.pay;
        if (jobSort === 'Closest') return parseFloat(a.distance) - parseFloat(b.distance); 
        return 0; // Recommended
    });

    // Mock Map View Component
    const SimulatedJobsMap = () => (
        <div className="relative w-full h-[600px] bg-slate-200 rounded-2xl overflow-hidden border border-slate-300 animate-in fade-in">
            {/* Placeholder Map Tiles */}
            <div className="absolute inset-0 opacity-60 bg-[url('https://imgs.search.brave.com/J_l3a8-ZzE1v-I4fJ4yO5C6m4r3c8b7a9d0e1f2g3h4/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9tYXBz/Lm1hcHRpbGVyLmNv/bS92MS9zdHlsZXMv/c3RyZWV0cy81MTIv/MTcxLzgyLkB4LnBu/Zw')] bg-cover bg-center grayscale hover:grayscale-0 transition-all duration-700"></div>
            
            {/* User Location Pin */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="w-4 h-4 bg-rose-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                <div className="w-12 h-12 bg-rose-500/20 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ping"></div>
            </div>

            {/* Job Pins */}
            {filteredJobs.map(job => (
                <div 
                    key={job.id}
                    className="absolute cursor-pointer group z-10 transition-all duration-300 hover:z-30 hover:scale-110"
                    style={{ left: `${job.coordinates?.x || 50}%`, top: `${job.coordinates?.y || 50}%` }}
                    onClick={() => setSelectedJob(job)}
                >
                    <div className={`p-2 rounded-xl shadow-lg border-2 border-white flex items-center justify-center transition-colors ${job.urgent ? 'bg-red-500 text-white' : 'bg-white text-slate-700'}`}>
                        {job.type === 'Vet Visit' ? <Stethoscope size={16} /> : <Briefcase size={16} />}
                    </div>
                    {/* Tooltip on Map */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white rounded-lg p-2 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity w-40 text-center pointer-events-none">
                        <p className="font-bold text-xs text-slate-800 truncate">{job.type}</p>
                        <p className="text-[10px] text-slate-500">Price: Open</p>
                    </div>
                </div>
            ))}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-xs font-bold text-slate-600 shadow-sm">
                {filteredJobs.length} jobs in this area
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                    {categories.map(f => (
                        <button 
                            key={f}
                            onClick={() => setJobFilter(f)}
                            className={`px-4 py-2 rounded-full border text-sm font-bold whitespace-nowrap transition-all ${
                                jobFilter === f 
                                ? 'bg-slate-900 text-white border-slate-900' 
                                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by area..." 
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        </div>
                        <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2 rounded-xl border transition-all ${showFilters ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                        title="Advanced Filters"
                    >
                        <SlidersHorizontal size={20} />
                    </button>
                    <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                        <button 
                            onClick={() => setViewMode('LIST')} 
                            className={`p-2 rounded-lg transition-all ${viewMode === 'LIST' ? 'bg-slate-100 text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <List size={18} />
                        </button>
                        <button 
                            onClick={() => setViewMode('MAP')} 
                            className={`p-2 rounded-lg transition-all ${viewMode === 'MAP' ? 'bg-slate-100 text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Map size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Collapsible Filters */}
            {showFilters && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm animate-in slide-in-from-top-2">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Sort By</label>
                            <select 
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-rose-500"
                                value={jobSort}
                                onChange={(e) => setJobSort(e.target.value)}
                            >
                                <option>Recommended</option>
                                <option>Highest Pay</option>
                                <option>Closest</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Min Pay (PKR)</label>
                            <input 
                                type="range" min="0" max="5000" step="500" 
                                value={filterMinPay} onChange={(e) => setFilterMinPay(Number(e.target.value))}
                                className="w-full accent-rose-500"
                            />
                            <div className="text-right text-xs font-bold text-slate-700">{filterMinPay}+</div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Max Distance (KM)</label>
                            <input 
                                type="range" min="1" max="50" step="1" 
                                value={filterMaxDistance} onChange={(e) => setFilterMaxDistance(Number(e.target.value))}
                                className="w-full accent-rose-500"
                            />
                            <div className="text-right text-xs font-bold text-slate-700">{filterMaxDistance} km</div>
                        </div>
                        <div className="flex items-end">
                            <button 
                                onClick={() => setOnlySaved(!onlySaved)}
                                className={`w-full py-2 rounded-lg border text-sm font-bold transition-all flex items-center justify-center gap-2 ${onlySaved ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white border-slate-200 text-slate-500'}`}
                            >
                                <Heart size={16} fill={onlySaved ? "currentColor" : "none"} /> {onlySaved ? 'Saved Only' : 'Show Saved'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {viewMode === 'MAP' ? (
                <SimulatedJobsMap />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredJobs.map((job) => {
                        const isSaved = savedJobs.includes(job.id);
                        const isApplied = appliedJobs.includes(job.id);

                        return (
                            <div 
                                key={job.id} 
                                onClick={() => setSelectedJob(job)}
                                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden cursor-pointer"
                            >
                                {/* Badges */}
                                <div className="absolute top-0 right-0 flex flex-col items-end z-10">
                                    {job.urgent && <span className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl mb-1 shadow-sm">URGENT</span>}
                                    {job.pay >= 2000 && <span className="bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-l-xl shadow-sm">HIGH PAY</span>}
                                </div>
                                
                                <div className="flex items-start gap-5 mb-4">
                                    <div className="relative">
                                        <img src={job.image} className="w-20 h-20 rounded-2xl object-cover shadow-md" />
                                        <button 
                                            onClick={(e) => toggleSaveJob(job.id, e)}
                                            className={`absolute -bottom-2 -right-2 p-1.5 rounded-full shadow-sm border transition-colors ${isSaved ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-slate-400 border-slate-100 hover:text-rose-500'}`}
                                        >
                                            <Heart size={14} fill={isSaved ? "currentColor" : "none"} />
                                        </button>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-black text-lg text-slate-800 group-hover:text-rose-600 transition-colors">{job.type}</h3>
                                        </div>
                                        <p className="text-slate-500 text-sm font-medium mb-2">{job.pet} ({job.breed})</p>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg flex items-center gap-1"><MapPin size={10}/> {job.distance}</span>
                                            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg flex items-center gap-1"><Clock size={10}/> {job.duration}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase">Budget</p>
                                        <p className="text-xl font-black text-slate-900">Negotiable</p>
                                    </div>
                                    {isApplied ? (
                                        <span className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-sm flex items-center gap-1 border border-emerald-100">
                                            <CheckCircle size={14} /> Applied
                                        </span>
                                    ) : (
                                        <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-transform active:scale-95 shadow-lg flex items-center gap-2 group-hover:translate-x-1">
                                            View Details <ArrowUpRight size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
            
            {filteredJobs.length === 0 && (
                <div className="text-center py-20 text-slate-400">
                    <Search size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-medium">No jobs found matching your criteria.</p>
                    <button onClick={() => {setJobFilter('All'); setSearchQuery(''); setFilterMinPay(0); setFilterMaxDistance(50)}} className="mt-2 text-rose-500 font-bold text-sm hover:underline">Clear Filters</button>
                </div>
            )}

            {/* Job Details Modal */}
            {selectedJob && (
                <JobDetailsModal 
                    job={selectedJob} 
                    onClose={() => setSelectedJob(null)} 
                    onApply={() => handleApply(selectedJob.id)}
                    applied={appliedJobs.includes(selectedJob.id)}
                    userRole={userRole}
                />
            )}
        </div>
    );
};

export default JobFinder;
