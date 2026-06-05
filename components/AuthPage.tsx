
import React, { useState, useEffect } from 'react';
import { Dog, Mail, Lock, User, ArrowRight, ArrowLeft, Stethoscope, Building2, Store, HeartHandshake, Briefcase, Check, Sparkles, Eye, EyeOff } from 'lucide-react';
import { UserRole } from '../types';

interface AuthPageProps {
  initialView?: 'login' | 'signup';
  onLoginSuccess: (role: UserRole) => void;
  onBack: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ initialView = 'login', onLoginSuccess, onBack }) => {
  const [isLogin, setIsLogin] = useState(initialView === 'login');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.OWNER);
  const [showPassword, setShowPassword] = useState(false);
  
  // State for Care Giver Tags
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const CARE_SERVICES = ['Walking', 'Grooming', 'Trainer', 'Pet Sitting', 'Boarding'];

  const roleConfig: Record<string, any> = {
    [UserRole.OWNER]: {
      label: 'Pet Owner',
      icon: User,
      color: 'teal',
      welcome: 'Welcome, Pet Parent!',
      desc: 'Manage your pets, find services, and join the community.',
      nameField: { label: 'Full Name', placeholder: 'John Doe', icon: User },
      extraField: null
    },
    [UserRole.VET]: {
      label: 'Veterinarian',
      icon: Stethoscope,
      color: 'blue',
      welcome: 'Welcome, Doctor!',
      desc: 'Manage appointments, patient records, and consultations.',
      nameField: { label: 'Full Name', placeholder: 'Dr. Jane Smith', icon: User },
      extraField: { label: 'Medical License #', placeholder: 'LIC-123456', icon: Stethoscope }
    },
    [UserRole.CLINIC]: {
      label: 'Clinic',
      icon: Building2,
      color: 'indigo',
      welcome: 'Clinic Portal',
      desc: 'Manage facility resources, staff scheduling, and emergency queue.',
      nameField: { label: 'Clinic Name', placeholder: 'Downtown Pet Hospital', icon: Building2 },
      extraField: { label: 'Representative Name', placeholder: 'Manager Name', icon: User }
    },
    [UserRole.VENDOR]: {
      label: 'Vendor',
      icon: Store,
      color: 'emerald',
      welcome: 'Seller Dashboard',
      desc: 'Manage your inventory, orders, and store analytics.',
      nameField: { label: 'Business Name', placeholder: 'Healthy Paws Inc.', icon: Store },
      extraField: { label: 'Representative Name', placeholder: 'Owner Name', icon: User }
    },
    [UserRole.CARE_GIVER]: {
      label: 'Care Giver',
      icon: HeartHandshake,
      color: 'rose',
      welcome: 'Care Specialist',
      desc: 'Find walking jobs, sitting gigs, and build your reputation.',
      nameField: { label: 'Full Name', placeholder: 'Emily Blunt', icon: User },
      extraField: { label: 'Services Offered', placeholder: 'Select Services', icon: Briefcase }
    }
  };

  const currentConfig = roleConfig[selectedRole] || roleConfig[UserRole.OWNER];
  const ColorIcon = currentConfig.icon;

  const toggleService = (service: string) => {
      if (selectedServices.includes(service)) {
          setSelectedServices(prev => prev.filter(s => s !== service));
      } else {
          setSelectedServices(prev => [...prev, service]);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(selectedRole);
    }, 1500);
  };

  const RoleButton: React.FC<{ role: UserRole; config: any }> = ({ role, config }) => {
    // Guard against missing config (e.g. SUPER_ADMIN)
    if (!config) return null;
    
    const Icon = config.icon;
    const isSelected = selectedRole === role;
    
    return (
      <button
        type="button"
        onClick={() => setSelectedRole(role)}
        className={`relative flex flex-col items-center justify-center gap-2 p-2 rounded-xl border transition-all duration-300 w-full h-24 group overflow-hidden ${
          isSelected 
          ? `bg-${config.color}-50 border-${config.color}-500 text-${config.color}-700 shadow-md ring-1 ring-${config.color}-500/20` 
          : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-600 hover:shadow-sm'
        }`}
      >
        {isSelected && (
            <div className={`absolute top-0 right-0 w-0 h-0 border-t-[12px] border-r-[12px] border-t-transparent border-r-${config.color}-500 rounded-tr-lg`} />
        )}
        <Icon size={24} strokeWidth={isSelected ? 2.5 : 2} className={`transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`} />
        <span className="text-[10px] font-bold uppercase tracking-wider text-center leading-tight">{config.label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* Left Side - Dynamic Visual */}
      <div className={`hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center transition-colors duration-700 bg-${currentConfig.color}-900`}>
         <div className={`absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1450778869180-41d0601e046e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80')] bg-cover bg-center mix-blend-overlay`} />
         <div className={`absolute inset-0 bg-gradient-to-t from-${currentConfig.color}-950 via-${currentConfig.color}-900/80 to-transparent`} />
         
         <div className="relative z-10 p-12 text-center max-w-lg animate-fade-in">
            <div className={`w-24 h-24 bg-${currentConfig.color}-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-${currentConfig.color}-900/50 transform -rotate-6 transition-colors duration-500`}>
                <ColorIcon className="text-white w-12 h-12" />
            </div>
            <h2 className="text-5xl font-black text-white mb-6 leading-tight tracking-tight animate-in slide-in-from-bottom-4 duration-700">{currentConfig.welcome}</h2>
            <p className={`text-${currentConfig.color}-100 text-xl leading-relaxed font-medium animate-in slide-in-from-bottom-4 duration-700 delay-100`}>
                "{currentConfig.desc}"
            </p>
            
            {/* Feature List based on Role */}
            <div className="mt-12 flex flex-wrap justify-center gap-3 animate-in slide-in-from-bottom-4 duration-700 delay-200">
                {['Fast Setup', 'Secure Data', '24/7 Support'].map((tag, i) => (
                  <span key={i} className={`px-4 py-2 rounded-full bg-${currentConfig.color}-800/50 text-${currentConfig.color}-200 text-sm font-bold border border-${currentConfig.color}-700 backdrop-blur-sm`}>
                    {tag}
                  </span>
                ))}
            </div>
         </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 relative bg-white">
        <button 
            onClick={onBack}
            className="absolute top-8 left-8 p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all flex items-center gap-2 font-bold text-sm"
        >
            <ArrowLeft size={18} /> Back
        </button>

        <div className="max-w-[480px] w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">
                    {isLogin ? 'Sign in to your account' : 'Create your account'}
                </h1>
                <p className="text-slate-500">
                    {isLogin ? 'Select your portal and enter your details.' : 'Join the network tailored to your needs.'}
                </p>
            </div>

            {/* Role Selector - Grid Layout */}
            <div className="mb-8">
              <div className="flex justify-between items-end mb-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Account Type</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded bg-${currentConfig.color}-50 text-${currentConfig.color}-600 border border-${currentConfig.color}-100`}>
                      {currentConfig.label}
                  </span>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {Object.values(UserRole)
                    .filter(role => role !== UserRole.SUPER_ADMIN)
                    .map((role) => (
                        <RoleButton key={role} role={role} config={roleConfig[role]} />
                    ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {!isLogin && (
                    <>
                        {/* Primary Name Field - Mandatory for All */}
                        <div className="relative group">
                          <div className={`absolute left-4 top-3.5 text-slate-400 group-focus-within:text-${currentConfig.color}-600 transition-colors`}>
                             {React.createElement(currentConfig.nameField.icon, { size: 20 })}
                          </div>
                          <input 
                              type="text" 
                              placeholder={currentConfig.nameField.placeholder}
                              className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-${currentConfig.color}-500/20 focus:border-${currentConfig.color}-500 transition-all placeholder:text-slate-400`}
                              required
                          />
                          <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-bold text-slate-500">{currentConfig.nameField.label}</label>
                        </div>

                        {/* Extra Field - Role Specific */}
                        {currentConfig.extraField && (
                            <div className="relative group animate-in fade-in slide-in-from-top-2">
                                {selectedRole === UserRole.CARE_GIVER ? (
                                    // Special UI for Care Giver Service Tags
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                        <label className="text-xs font-bold text-slate-500 uppercase block mb-3">Select Services Provided</label>
                                        <div className="flex flex-wrap gap-2">
                                            {CARE_SERVICES.map(service => (
                                                <button
                                                    key={service}
                                                    type="button"
                                                    onClick={() => toggleService(service)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                                                        selectedServices.includes(service)
                                                        ? `bg-${currentConfig.color}-500 text-white border-${currentConfig.color}-500 shadow-md`
                                                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                                    }`}
                                                >
                                                    {selectedServices.includes(service) && <Check size={12} strokeWidth={3} />}
                                                    {service}
                                                </button>
                                            ))}
                                        </div>
                                        {selectedServices.length === 0 && (
                                            <p className="text-[10px] text-red-400 mt-2 font-medium">Please select at least one service.</p>
                                        )}
                                    </div>
                                ) : (
                                    // Standard Text Input for other roles
                                    <>
                                        <div className={`absolute left-4 top-3.5 text-slate-400 group-focus-within:text-${currentConfig.color}-600 transition-colors`}>
                                            {React.createElement(currentConfig.extraField.icon, { size: 20 })}
                                        </div>
                                        <input 
                                            type="text" 
                                            placeholder={currentConfig.extraField.placeholder}
                                            className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-${currentConfig.color}-500/20 focus:border-${currentConfig.color}-500 transition-all placeholder:text-slate-400`}
                                            required
                                        />
                                        <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-bold text-slate-500">{currentConfig.extraField.label}</label>
                                    </>
                                )}
                            </div>
                        )}
                    </>
                )}

                <div className="relative group">
                    <Mail className={`absolute left-4 top-3.5 text-slate-400 group-focus-within:text-${currentConfig.color}-600 transition-colors`} size={20} />
                    <input 
                        type="email" 
                        placeholder="Email Address"
                        className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-${currentConfig.color}-500/20 focus:border-${currentConfig.color}-500 transition-all placeholder:text-slate-400`}
                        required
                        defaultValue={isLogin ? "user@example.com" : ""}
                    />
                </div>

                <div className="relative group">
                    <Lock className={`absolute left-4 top-3.5 text-slate-400 group-focus-within:text-${currentConfig.color}-600 transition-colors`} size={20} />
                    <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Password"
                        className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-12 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-${currentConfig.color}-500/20 focus:border-${currentConfig.color}-500 transition-all placeholder:text-slate-400`}
                        required
                        defaultValue={isLogin ? "password123" : ""}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        title={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>

                {isLogin && (
                    <div className="flex justify-end">
                        <button type="button" className={`text-sm font-bold text-${currentConfig.color}-600 hover:text-${currentConfig.color}-700 transition-colors`}>
                            Forgot Password?
                        </button>
                    </div>
                )}

                <button 
                    type="submit"
                    disabled={loading || (!isLogin && selectedRole === UserRole.CARE_GIVER && selectedServices.length === 0)}
                    className={`w-full bg-${currentConfig.color}-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-${currentConfig.color}-200 hover:shadow-${currentConfig.color}-300 hover:bg-${currentConfig.color}-700 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-lg mt-6`}
                >
                    {loading ? (
                        <span className="animate-pulse flex items-center gap-2"><Sparkles size={18} className="animate-spin" /> Authenticating...</span>
                    ) : (
                        <>
                            {isLogin ? 'Sign In' : 'Get Started'} <ArrowRight size={20} />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-8 relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                </div>
                <span className="relative bg-white px-4 text-sm text-slate-400 font-medium">
                    Or continue with
                </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors hover:border-slate-300">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
                </button>
                <button className="flex items-center justify-center py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors hover:border-slate-300">
                    <img src="https://www.svgrepo.com/show/511330/apple-173.svg" className="w-6 h-6" alt="Apple" />
                </button>
            </div>

            <p className="mt-8 text-center text-slate-500">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button 
                    onClick={() => setIsLogin(!isLogin)}
                    className={`ml-2 font-bold text-${currentConfig.color}-600 hover:text-${currentConfig.color}-700 transition-colors`}
                >
                    {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
