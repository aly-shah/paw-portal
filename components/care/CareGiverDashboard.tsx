
import React, { useState, useEffect } from 'react';
import { MapPin, Clock, DollarSign, Star, Calendar, Filter, Search, Briefcase, CheckCircle, User, Heart, Shield, Navigation, Play, Camera, Pause, StopCircle, AlertCircle, ChevronRight, Map, X, Tag, Check, ArrowUpRight, SlidersHorizontal, List, LayoutGrid, Share2 } from 'lucide-react';
import ActiveWalkSession from './ActiveWalkSession';
import { WalkSession, UserRole } from '../../types';
import JobFinder from '../JobFinder';

// --- MOCK DATA ---
// AVAILABLE_JOBS moved to constants.ts and imported via JobFinder

const MY_SCHEDULE = [
    { id: 's1', type: 'Dog Walking', pet: 'Rex', owner: 'Sarah J.', time: '12:00 PM', duration: '30 min', location: 'Central Park', pay: 1500, status: 'Upcoming', petImg: 'https://picsum.photos/id/237/100/100' },
    { id: 's2', type: 'Check-in', pet: 'Milo', owner: 'Ali K.', time: '02:30 PM', duration: '15 min', location: '45 Elm St', pay: 800, status: 'Upcoming', petImg: 'https://picsum.photos/id/1025/100/100' },
    { id: 's3', type: 'Pet Sitting', pet: 'Bella', owner: 'Zara M.', time: '06:00 PM', duration: '3 hrs', location: '12 Oak Ave', pay: 3500, status: 'Upcoming', petImg: 'https://picsum.photos/id/1074/100/100' },
];

const REVIEWS = [
    { id: 'r1', user: 'Sarah Jenkins', rating: 5, date: '2 days ago', text: "Emily was fantastic with Rex! He came back so happy and tired. The GPS map report was a great touch.", tags: ['Punctual', 'Friendly'] },
    { id: 'r2', user: 'Ahmed Khan', rating: 5, date: '1 week ago', text: "Very reliable. She managed to handle my energetic husky with no issues.", tags: ['Professional'] },
    { id: 'r3', user: 'Maria G.', rating: 4, date: '3 weeks ago', text: "Good service, but arrived 5 mins late due to traffic. Otherwise great.", tags: ['Good Communication'] },
];

interface CareGiverDashboardProps {
    initialTab?: string;
}

const CareGiverDashboard: React.FC<CareGiverDashboardProps> = ({ initialTab }) => {
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'JOBS' | 'SCHEDULE' | 'REVIEWS'>('OVERVIEW');
    const [isWalking, setIsWalking] = useState(false);
    const [activeJob, setActiveJob] = useState<any>(null);
    const [completedWalk, setCompletedWalk] = useState<WalkSession | null>(null);
    
    useEffect(() => {
        if (initialTab === 'Find Jobs') setActiveTab('JOBS');
        if (initialTab === 'My Schedule') setActiveTab('SCHEDULE');
        if (initialTab === 'My Reviews') setActiveTab('REVIEWS');
    }, [initialTab]);

    const handleStartWalk = (job: any) => {
        setActiveJob(job);
        setIsWalking(true);
    };

    const handleEndSession = (session: WalkSession) => {
        setCompletedWalk(session);
        setIsWalking(false);
        setActiveJob(null);
        setActiveTab('OVERVIEW');
    };

    // Render Live Mode
    if (isWalking && activeJob) {
        return <ActiveWalkSession petName={activeJob.pet} onEndSession={handleEndSession} />;
    }

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-800">Care Dashboard</h2>
                    <p className="text-slate-500 font-medium">Manage your gigs, schedule, and reputation.</p>
                </div>
                <div className="flex items-center gap-4 bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 overflow-x-auto max-w-full">
                    {['OVERVIEW', 'JOBS', 'SCHEDULE', 'REVIEWS'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                                activeTab === tab ? 'bg-rose-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                            }`}
                        >
                            {tab.charAt(0) + tab.slice(1).toLowerCase().replace('jobs', 'Find Jobs')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Success Banner */}
            {completedWalk && (
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex justify-between items-center animate-in slide-in-from-top-4 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full"><CheckCircle size={24}/></div>
                        <div>
                            <h4 className="font-bold text-emerald-800">Great Job! Walk Completed.</h4>
                            <p className="text-sm text-emerald-600">You earned <span className="font-bold">PKR 1,500</span>. Report sent to owner.</p>
                        </div>
                    </div>
                    <button onClick={() => setCompletedWalk(null)} className="px-4 py-2 bg-white text-emerald-600 font-bold text-sm rounded-lg border border-emerald-200 hover:bg-emerald-50">Dismiss</button>
                </div>
            )}

            {/* --- OVERVIEW TAB --- */}
            {activeTab === 'OVERVIEW' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-rose-100 text-rose-600 rounded-xl"><Calendar size={24} /></div>
                                    <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-lg">Today</span>
                                </div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Upcoming Jobs</p>
                                <p className="text-3xl font-black text-slate-800">3</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
                             <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl"><DollarSign size={24} /></div>
                                    <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-lg">This Week</span>
                                </div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Earnings</p>
                                <p className="text-3xl font-black text-slate-800">PKR 24k</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
                             <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-amber-100 text-amber-600 rounded-xl"><Star size={24} /></div>
                                    <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-lg">Total</span>
                                </div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Rating</p>
                                <p className="text-3xl font-black text-slate-800">4.9 <span className="text-sm text-slate-400 font-medium">/ 5.0</span></p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Today's Schedule Preview */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-lg text-slate-800">Today's Schedule</h3>
                                <button onClick={() => setActiveTab('SCHEDULE')} className="text-rose-500 font-bold text-sm hover:underline">View All</button>
                            </div>
                            <div className="space-y-4">
                                {MY_SCHEDULE.map((job, i) => (
                                    <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:bg-rose-50 hover:border-rose-100 transition-all">
                                        <div className="w-14 h-14 rounded-xl overflow-hidden relative">
                                            <img src={job.petImg} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-800">{job.type} <span className="text-slate-400 font-normal">with {job.pet}</span></h4>
                                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                                <span className="flex items-center gap-1 font-medium bg-white px-2 py-0.5 rounded border border-slate-200"><Clock size={12}/> {job.time}</span>
                                                <span className="flex items-center gap-1"><MapPin size={12}/> {job.location}</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleStartWalk(job)}
                                            className="p-3 bg-slate-200 text-slate-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                        >
                                            <Play size={18} fill="currentColor" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Job Finder Promo */}
                        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden flex flex-col justify-center">
                            <div className="relative z-10">
                                <h3 className="font-bold text-xl mb-2">Ready for more?</h3>
                                <p className="text-slate-400 text-sm mb-6">Check out open listings in your area.</p>
                                <button onClick={() => setActiveTab('JOBS')} className="w-full py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-colors">
                                    Find New Jobs
                                </button>
                            </div>
                            {/* Decor */}
                            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-rose-500 rounded-full blur-[80px] opacity-30"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- FIND JOBS TAB (Replaced with Generic Component) --- */}
            {activeTab === 'JOBS' && (
                <JobFinder userRole={UserRole.CARE_GIVER} />
            )}

            {/* --- SCHEDULE TAB --- */}
            {activeTab === 'SCHEDULE' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-lg text-slate-800 mb-6">Upcoming Schedule</h3>
                        <div className="space-y-6 relative pl-8 border-l-2 border-slate-100">
                             {MY_SCHEDULE.map((job, i) => (
                                 <div key={i} className="relative">
                                     <div className="absolute -left-[39px] top-0 w-5 h-5 rounded-full border-4 border-white bg-rose-500 shadow-sm"></div>
                                     <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 hover:bg-white hover:shadow-md transition-all">
                                         <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                             <div className="flex items-center gap-4">
                                                 <img src={job.petImg} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                                                 <div>
                                                     <h4 className="font-bold text-slate-800 text-lg">{job.type} for {job.pet}</h4>
                                                     <p className="text-sm text-slate-500 flex items-center gap-2">
                                                         <User size={14}/> {job.owner} • <MapPin size={14}/> {job.location}
                                                     </p>
                                                 </div>
                                             </div>
                                             <div className="flex items-center gap-4">
                                                 <div className="text-right hidden md:block">
                                                     <p className="font-bold text-slate-800">{job.time}</p>
                                                     <p className="text-xs text-slate-500">{job.duration}</p>
                                                 </div>
                                                 {job.type === 'Dog Walking' && (
                                                     <button 
                                                        onClick={() => handleStartWalk(job)}
                                                        className="px-5 py-2.5 bg-rose-600 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-rose-700 flex items-center gap-2"
                                                     >
                                                         <Navigation size={16} /> Start Walk
                                                     </button>
                                                 )}
                                             </div>
                                         </div>
                                     </div>
                                 </div>
                             ))}
                        </div>
                    </div>
                </div>
            )}

            {/* --- REVIEWS TAB --- */}
            {activeTab === 'REVIEWS' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                            <div className="text-5xl font-black text-slate-800 mb-2">4.9</div>
                            <div className="flex gap-1 text-amber-400 mb-2">
                                <Star fill="currentColor" size={20}/><Star fill="currentColor" size={20}/><Star fill="currentColor" size={20}/><Star fill="currentColor" size={20}/><Star fill="currentColor" size={20}/>
                            </div>
                            <p className="text-sm text-slate-500 font-bold">Average Rating</p>
                        </div>
                         <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                             <h3 className="font-bold text-lg text-slate-800 mb-4">Rating Breakdown</h3>
                             <div className="space-y-3">
                                 {[
                                     { label: 'Communication', score: '98%' },
                                     { label: 'Punctuality', score: '95%' },
                                     { label: 'Care Quality', score: '100%' },
                                 ].map((stat) => (
                                     <div key={stat.label}>
                                         <div className="flex justify-between text-sm font-bold text-slate-600 mb-1">
                                             <span>{stat.label}</span>
                                             <span>{stat.score}</span>
                                         </div>
                                         <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                             <div className="h-full bg-rose-500 rounded-full" style={{ width: stat.score }}></div>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="font-bold text-lg text-slate-800">Recent Reviews</h3>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {REVIEWS.map((review) => (
                                <div key={review.id} className="p-6 hover:bg-slate-50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500">
                                                {review.user.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800">{review.user}</h4>
                                                <p className="text-xs text-slate-400">{review.date}</p>
                                            </div>
                                        </div>
                                        <div className="flex text-amber-400">
                                            {[...Array(review.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                                        </div>
                                    </div>
                                    <p className="text-slate-600 text-sm leading-relaxed mb-3">"{review.text}"</p>
                                    <div className="flex gap-2">
                                        {review.tags.map(tag => (
                                            <span key={tag} className="px-2 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-md uppercase">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CareGiverDashboard;
