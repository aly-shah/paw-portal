
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Camera, Pause, Play, StopCircle, Navigation, Droplets, CheckCircle, X } from 'lucide-react';
import { WalkSession, WalkEvent, GeoPoint } from '../../types';

interface ActiveWalkSessionProps {
    petName: string;
    onEndSession: (session: WalkSession) => void;
}

const ActiveWalkSession: React.FC<ActiveWalkSessionProps> = ({ petName, onEndSession }) => {
    const [isPaused, setIsPaused] = useState(false);
    const [duration, setDuration] = useState(0);
    const [distance, setDistance] = useState(0);
    const [route, setRoute] = useState<GeoPoint[]>([{ x: 50, y: 80 }]); // Start point
    const [events, setEvents] = useState<WalkEvent[]>([]);
    const [showCamera, setShowCamera] = useState(false);
    const mapRef = useRef<HTMLDivElement>(null);

    // Simulation: Timer & "GPS" Movement
    useEffect(() => {
        let interval: any;
        if (!isPaused) {
            interval = setInterval(() => {
                setDuration(prev => prev + 1);
                
                // Simulate movement: Random walk
                setRoute(prev => {
                    const last = prev[prev.length - 1];
                    // Random small step
                    const dx = (Math.random() - 0.5) * 2; 
                    const dy = (Math.random() - 0.6) * 2; // Bias upwards
                    
                    // Keep in bounds (10-90)
                    const newX = Math.max(10, Math.min(90, last.x + dx));
                    const newY = Math.max(10, Math.min(90, last.y + dy));
                    
                    // Add distance approx
                    const stepDist = Math.sqrt(dx*dx + dy*dy) * 0.05; // scale factor
                    setDistance(d => d + stepDist);

                    return [...prev, { x: newX, y: newY }];
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPaused]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const addEvent = (type: 'PEE' | 'POOP' | 'WATER') => {
        const currentLocation = route[route.length - 1];
        const newEvent: WalkEvent = {
            id: Date.now().toString(),
            type,
            timestamp: new Date().toLocaleTimeString(),
            location: currentLocation
        };
        setEvents(prev => [...prev, newEvent]);
    };

    const handleTakePhoto = () => {
        // Simulate capture
        const currentLocation = route[route.length - 1];
        const newEvent: WalkEvent = {
            id: Date.now().toString(),
            type: 'PHOTO',
            timestamp: new Date().toLocaleTimeString(),
            location: currentLocation,
            photoUrl: `https://picsum.photos/seed/${Date.now()}/300/300`
        };
        setEvents(prev => [...prev, newEvent]);
        setShowCamera(false);
    };

    const handleEndWalk = () => {
        if (confirm("Are you sure you want to end the walk?")) {
            onEndSession({
                id: Date.now().toString(),
                petName,
                startTime: Date.now() - duration * 1000,
                endTime: Date.now(),
                durationSeconds: duration,
                distanceKm: parseFloat(distance.toFixed(2)),
                route,
                events,
                notes: `Great walk with ${petName}! We explored the park.`
            });
        }
    };

    // Generate SVG Path from route points
    const getPathString = () => {
        if (route.length === 0) return "";
        // Map 0-100 coordinates to SVG 100x100 viewBox
        return `M ${route.map(p => `${p.x},${p.y}`).join(" L ")}`;
    };

    if (showCamera) {
        return (
            <div className="absolute inset-0 z-50 bg-black flex flex-col">
                <div className="flex-1 relative">
                    <img src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-64 h-64 border-2 border-white/50 rounded-lg"></div>
                    </div>
                    <button onClick={() => setShowCamera(false)} className="absolute top-6 right-6 text-white bg-black/50 p-2 rounded-full"><X /></button>
                </div>
                <div className="h-32 bg-black flex items-center justify-center gap-8">
                    <button onClick={handleTakePhoto} className="w-16 h-16 bg-white rounded-full border-4 border-slate-300 flex items-center justify-center">
                        <div className="w-14 h-14 bg-white border-2 border-black rounded-full"></div>
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col bg-slate-50 animate-fade-in relative overflow-hidden">
            {/* Top Stats Overlay */}
            <div className="absolute top-0 left-0 right-0 p-6 z-20 bg-gradient-to-b from-slate-900/80 to-transparent text-white">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h2 className="text-2xl font-black">{formatTime(duration)}</h2>
                        <p className="text-slate-300 text-xs font-bold uppercase tracking-wider">Duration</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-black">{distance.toFixed(2)} <span className="text-sm font-medium">km</span></h2>
                        <p className="text-slate-300 text-xs font-bold uppercase tracking-wider">Distance</p>
                    </div>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/90 rounded-full text-xs font-bold animate-pulse shadow-lg">
                    <span className="w-2 h-2 bg-white rounded-full"></span> LIVE TRACKING
                </div>
            </div>

            {/* Map Visualizer */}
            <div className="flex-1 relative bg-slate-200 overflow-hidden" ref={mapRef}>
                {/* Fake Map Background */}
                <div className="absolute inset-0 bg-[url('https://imgs.search.brave.com/J_l3a8-ZzE1v-I4fJ4yO5C6m4r3c8b7a9d0e1f2g3h4/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9tYXBz/Lm1hcHRpbGVyLmNv/bS92MS9zdHlsZXMv/c3RyZWV0cy81MTIv/MTcxLzgyLkB4LnBu/Zw')] bg-cover opacity-40 grayscale"></div>
                
                {/* Dynamic SVG Route */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {/* Shadow Path */}
                    <path d={getPathString()} fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    {/* Route Path */}
                    <path d={getPathString()} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-md" />
                    
                    {/* Current Position */}
                    {route.length > 0 && (
                         <circle cx={route[route.length-1].x} cy={route[route.length-1].y} r="2" fill="#10b981" stroke="white" strokeWidth="0.5" className="animate-pulse" />
                    )}
                    
                    {/* Markers */}
                    {events.map(ev => (
                        <g key={ev.id} transform={`translate(${ev.location.x}, ${ev.location.y})`}>
                            <circle r="2.5" fill="white" stroke="#64748b" strokeWidth="0.5" />
                            <text y="1" fontSize="3" textAnchor="middle" dominantBaseline="middle">
                                {ev.type === 'PEE' ? '💧' : ev.type === 'POOP' ? '💩' : '📸'}
                            </text>
                        </g>
                    ))}
                </svg>
            </div>

            {/* Action Controls */}
            <div className="bg-white p-6 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-20 relative">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                     <button 
                        onClick={() => setIsPaused(!isPaused)}
                        className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xl hover:scale-105 transition-transform border-4 border-white"
                    >
                         {isPaused ? <Play size={32} className="ml-1" /> : <Pause size={32} />}
                     </button>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-4">
                     <button onClick={() => addEvent('PEE')} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                         <Droplets size={24} />
                         <span className="text-xs font-bold uppercase">Pee</span>
                     </button>
                     <button onClick={() => addEvent('POOP')} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors">
                         <div className="text-2xl">💩</div>
                         <span className="text-xs font-bold uppercase">Poop</span>
                     </button>
                     <button onClick={() => setShowCamera(true)} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors">
                         <Camera size={24} />
                         <span className="text-xs font-bold uppercase">Photo</span>
                     </button>
                </div>

                <button 
                    onClick={handleEndWalk}
                    className="w-full mt-6 bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-red-200 flex items-center justify-center gap-2 transition-all"
                >
                    <StopCircle size={20} /> End Walk Session
                </button>
            </div>
        </div>
    );
};

export default ActiveWalkSession;
