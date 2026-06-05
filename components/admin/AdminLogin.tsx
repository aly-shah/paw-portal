
import React, { useState } from 'react';
import { ShieldAlert, Lock, User, ArrowRight, ShieldCheck, Server, Eye, EyeOff } from 'lucide-react';
import { UserRole } from '../../types';

interface AdminLoginProps {
    onLoginSuccess: (role: UserRole) => void;
    onBack: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBack }) => {
    const [step, setStep] = useState<'CREDENTIALS' | '2FA'>('CREDENTIALS');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleCredentialsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate check
        setTimeout(() => {
            setIsLoading(false);
            setStep('2FA');
        }, 1000);
    };

    const handle2FASubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            onLoginSuccess(UserRole.SUPER_ADMIN);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-950 to-slate-950"></div>
                <div className="grid grid-cols-12 gap-4 opacity-10 absolute inset-0 transform -skew-y-12 scale-150">
                    {Array.from({ length: 100 }).map((_, i) => (
                        <div key={i} className="h-32 bg-slate-700/20 rounded-lg"></div>
                    ))}
                </div>
            </div>

            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl relative z-10 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 animate-pulse"></div>
                
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-700 shadow-inner">
                            <ShieldAlert className="text-red-500" size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight">Super Admin Portal</h2>
                        <p className="text-slate-500 text-sm mt-2 font-mono">Restricted Access • Authorized Personnel Only</p>
                    </div>

                    {step === 'CREDENTIALS' && (
                        <form onSubmit={handleCredentialsSubmit} className="space-y-5 animate-in fade-in slide-in-from-right">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Admin ID</label>
                                <div className="relative group">
                                    <User className="absolute left-3 top-3 text-slate-500 group-focus-within:text-white transition-colors" size={18} />
                                    <input 
                                        type="email" 
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono text-sm"
                                        placeholder="admin@pawportal.sys"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Master Key</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-3 text-slate-500 group-focus-within:text-white transition-colors" size={18} />
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl py-3 pl-10 pr-12 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono text-sm"
                                        placeholder="••••••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-3 text-slate-500 hover:text-white focus:outline-none"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        title={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full py-3 bg-white text-slate-950 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2 mt-4"
                            >
                                {isLoading ? <Server className="animate-spin" size={18} /> : 'Authenticate'}
                            </button>
                        </form>
                    )}

                    {step === '2FA' && (
                        <form onSubmit={handle2FASubmit} className="space-y-6 animate-in fade-in slide-in-from-right">
                            <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
                                <ShieldCheck className="text-emerald-500" size={24} />
                                <div>
                                    <p className="text-white text-sm font-bold">Two-Factor Authentication</p>
                                    <p className="text-slate-500 text-xs">Enter the code sent to your device.</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Security Code</label>
                                <input 
                                    type="text" 
                                    autoFocus
                                    maxLength={6}
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl py-3 px-4 text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                                    placeholder="000000"
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isLoading || code.length < 6}
                                className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Server className="animate-spin" size={18} /> : 'Verify Access'}
                            </button>
                        </form>
                    )}
                </div>
                
                <div className="bg-slate-950 p-4 text-center border-t border-slate-800">
                    <button onClick={onBack} className="text-slate-500 text-xs hover:text-white transition-colors flex items-center justify-center gap-1 w-full">
                        <ArrowRight size={12} className="rotate-180" /> Return to Standard Portal
                    </button>
                </div>
            </div>
            
            <div className="mt-8 flex gap-2 text-[10px] text-slate-600 font-mono uppercase tracking-widest">
                <span>System v4.2.0</span>
                <span>•</span>
                <span>Secure Connection</span>
                <span>•</span>
                <span>Audit Logged</span>
            </div>
        </div>
    );
};

export default AdminLogin;
