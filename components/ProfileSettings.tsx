
import React, { useState } from 'react';
import { X, User, CreditCard, Shield, CheckCircle, Smartphone, Building2, Lock, Bell, Globe, Camera, Save, AlertCircle, Briefcase, Award, Eye, EyeOff } from 'lucide-react';
import { UserRole } from '../types';

interface ProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
}

type Tab = 'GENERAL' | 'FINANCIAL' | 'PREFERENCES' | 'SECURITY' | 'VERIFICATION';

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ isOpen, onClose, userRole }) => {
  const [activeTab, setActiveTab] = useState<Tab>('GENERAL');
  const [isEditing, setIsEditing] = useState(false);
  
  // Mock User Data
  const [userData, setUserData] = useState({
    name: userRole === UserRole.VET ? 'Dr. Jane Smith' : 'Jane Doe',
    email: 'jane@example.com',
    phone: '+92 300 1234567',
    address: 'DHA Phase 6, Karachi',
    bio: userRole === UserRole.VET ? 'Experienced veterinarian specializing in small animal internal medicine.' : 'Dog lover and proud owner of Barnaby.',
    language: 'English',
    notifications: { email: true, sms: true, push: true },
    availability: true, // For providers
  });

  // Mock Financial Data
  const [financials, setFinancials] = useState({
    jazzcash: '0300 1234567',
    easypaisa: '',
    bankName: 'Meezan Bank',
    iban: 'PK36 MEZN 0000 0000 1234 5678',
    accountTitle: 'Jane Smith'
  });

  // Password Visibility States
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  if (!isOpen) return null;

  const isProvider = userRole === UserRole.VET || userRole === UserRole.CLINIC || userRole === UserRole.VENDOR || userRole === UserRole.CARE_GIVER;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl flex overflow-hidden animate-in zoom-in-95">
        
        {/* Sidebar Navigation */}
        <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col p-6">
           <h2 className="text-xl font-black text-slate-800 mb-8">Settings</h2>
           
           <nav className="space-y-2 flex-1">
               {[
                   { id: 'GENERAL', label: 'General Profile', icon: User },
                   { id: 'FINANCIAL', label: isProvider ? 'Payout Methods' : 'Payment Methods', icon: CreditCard },
                   { id: 'VERIFICATION', label: 'Verification', icon: Shield },
                   { id: 'PREFERENCES', label: 'Preferences', icon: Globe },
                   { id: 'SECURITY', label: 'Security', icon: Lock },
               ].map((item) => {
                   const Icon = item.icon;
                   return (
                       <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as Tab)}
                            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                                activeTab === item.id 
                                ? 'bg-white text-teal-700 shadow-sm border border-slate-100' 
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
                            }`}
                       >
                           <Icon size={18} /> {item.label}
                       </button>
                   )
               })}
           </nav>

           <div className="pt-6 border-t border-slate-200">
               <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                   <p className="text-xs font-bold text-slate-400 uppercase mb-2">Profile Completion</p>
                   <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                       <div className="h-full w-[85%] bg-gradient-to-r from-teal-400 to-emerald-500"></div>
                   </div>
                   <p className="text-right text-xs font-bold text-emerald-600">85%</p>
               </div>
           </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full">
            {/* Header */}
            <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">
                        {activeTab === 'GENERAL' && 'Profile Information'}
                        {activeTab === 'FINANCIAL' && (isProvider ? 'Payout Configuration' : 'Payment Methods')}
                        {activeTab === 'VERIFICATION' && 'Account Verification'}
                        {activeTab === 'PREFERENCES' && 'App Preferences'}
                        {activeTab === 'SECURITY' && 'Login & Security'}
                    </h3>
                    <p className="text-xs text-slate-400">Manage your personal information and settings.</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-8 bg-white">
                
                {/* --- GENERAL TAB --- */}
                {activeTab === 'GENERAL' && (
                    <div className="space-y-8 max-w-2xl">
                        <div className="flex items-center gap-6">
                            <div className="relative group">
                                <img src="https://picsum.photos/id/64/150/150" alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-slate-50 shadow-md" />
                                <button className="absolute bottom-0 right-0 p-2 bg-slate-900 text-white rounded-full shadow-lg hover:bg-slate-700 transition-colors">
                                    <Camera size={16} />
                                </button>
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-slate-800">{userData.name}</h4>
                                <p className="text-slate-500 text-sm mb-2 capitalize">{userRole.toLowerCase().replace('_', ' ')}</p>
                                {isProvider && (
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 cursor-pointer transition-colors ${userData.availability ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`} onClick={() => setUserData({...userData, availability: !userData.availability})}>
                                            <div className={`w-2 h-2 rounded-full ${userData.availability ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                                            {userData.availability ? 'Available for Booking' : 'Currently Offline'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                                <input type="text" value={userData.name} onChange={(e) => setUserData({...userData, name: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                                <input type="text" value={userData.phone} onChange={(e) => setUserData({...userData, phone: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                                <input type="email" value={userData.email} disabled className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-500 cursor-not-allowed" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Location / Area</label>
                                <input type="text" value={userData.address} onChange={(e) => setUserData({...userData, address: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none" />
                            </div>
                            <div className="col-span-full space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Bio / About</label>
                                <textarea value={userData.bio} onChange={(e) => setUserData({...userData, bio: e.target.value})} className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none resize-none" />
                            </div>
                        </div>
                    </div>
                )}

                {/* --- FINANCIAL TAB --- */}
                {activeTab === 'FINANCIAL' && (
                    <div className="max-w-2xl space-y-8 animate-in slide-in-from-right-4 fade-in">
                        {isProvider ? (
                            <>
                                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-4">
                                    <div className="p-2 bg-white rounded-lg text-blue-600 h-fit"><AlertCircle size={20} /></div>
                                    <div>
                                        <h4 className="font-bold text-blue-800">Payout Configuration</h4>
                                        <p className="text-sm text-blue-600 mt-1">
                                            Payments from clients will be transferred to your selected default method every Monday.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 transition-all hover:border-slate-300 hover:shadow-sm">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-red-600 text-white rounded-lg flex items-center justify-center font-black text-[10px]">JC</div>
                                                <h4 className="font-bold text-slate-800">JazzCash</h4>
                                            </div>
                                            <div className="h-5 w-5 rounded-full border-2 border-teal-500 flex items-center justify-center">
                                                <div className="h-2.5 w-2.5 rounded-full bg-teal-500" />
                                            </div>
                                        </div>
                                        <input 
                                            type="text" 
                                            placeholder="03XX XXXXXXX"
                                            value={financials.jazzcash}
                                            onChange={(e) => setFinancials({...financials, jazzcash: e.target.value})}
                                            className="w-full p-3 bg-white border border-slate-200 rounded-xl font-mono font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
                                        />
                                    </div>

                                    <div className="p-5 rounded-2xl border border-slate-200 bg-white opacity-70 hover:opacity-100 transition-all hover:border-slate-300">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-emerald-500 text-white rounded-lg flex items-center justify-center font-black text-[10px] italic">ep</div>
                                                <h4 className="font-bold text-slate-800">EasyPaisa</h4>
                                            </div>
                                            <div className="h-5 w-5 rounded-full border-2 border-slate-300"></div>
                                        </div>
                                        <input 
                                            type="text" 
                                            placeholder="03XX XXXXXXX"
                                            value={financials.easypaisa}
                                            onChange={(e) => setFinancials({...financials, easypaisa: e.target.value})}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
                                        />
                                    </div>

                                    <div className="p-5 rounded-2xl border border-slate-200 bg-white opacity-70 hover:opacity-100 transition-all hover:border-slate-300">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center"><Building2 size={20} /></div>
                                                <h4 className="font-bold text-slate-800">Bank Transfer</h4>
                                            </div>
                                            <div className="h-5 w-5 rounded-full border-2 border-slate-300"></div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <input 
                                                type="text" 
                                                placeholder="Bank Name"
                                                value={financials.bankName}
                                                onChange={(e) => setFinancials({...financials, bankName: e.target.value})}
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
                                            />
                                            <input 
                                                type="text" 
                                                placeholder="Account Title"
                                                value={financials.accountTitle}
                                                onChange={(e) => setFinancials({...financials, accountTitle: e.target.value})}
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
                                            />
                                            <input 
                                                type="text" 
                                                placeholder="IBAN (PK...)"
                                                value={financials.iban}
                                                onChange={(e) => setFinancials({...financials, iban: e.target.value})}
                                                className="col-span-2 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-6">
                                <div className="p-6 bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl text-white shadow-lg relative overflow-hidden">
                                    <div className="relative z-10">
                                        <p className="text-slate-400 uppercase tracking-widest text-xs font-bold mb-6">Primary Card</p>
                                        <p className="text-2xl font-mono mb-8 tracking-wider">**** **** **** 4242</p>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[10px] text-slate-400 uppercase">Card Holder</p>
                                                <p className="font-bold tracking-wide">JANE DOE</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-slate-400 uppercase">Expires</p>
                                                <p className="font-bold tracking-wide">12/25</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-500 opacity-10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                                </div>
                                
                                <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold hover:bg-slate-50 hover:border-slate-300 hover:text-slate-600 transition-all flex items-center justify-center gap-2">
                                    <CreditCard size={20} /> Add New Payment Method
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* --- VERIFICATION TAB --- */}
                {activeTab === 'VERIFICATION' && (
                    <div className="max-w-2xl space-y-6 animate-in slide-in-from-right-4 fade-in">
                        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl flex items-start gap-4">
                            <div className="p-3 bg-white rounded-full text-emerald-600 shadow-sm"><Award size={24} /></div>
                            <div>
                                <h4 className="text-lg font-bold text-emerald-800 mb-1">Verified Profile</h4>
                                <p className="text-sm text-emerald-700 leading-relaxed">
                                    Your identity has been confirmed. This badge helps build trust within the PawPortal community.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-5 border border-slate-200 rounded-xl flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-slate-100 rounded-lg"><Smartphone size={20} className="text-slate-500" /></div>
                                    <div>
                                        <p className="font-bold text-slate-800">Phone Verification</p>
                                        <p className="text-xs text-slate-400">+92 300 ****567</p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1"><CheckCircle size={12} /> Verified</span>
                            </div>

                            <div className="p-5 border border-slate-200 rounded-xl flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-slate-100 rounded-lg"><User size={20} className="text-slate-500" /></div>
                                    <div>
                                        <p className="font-bold text-slate-800">CNIC / Government ID</p>
                                        <p className="text-xs text-slate-400">42201-*******-1</p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1"><CheckCircle size={12} /> Verified</span>
                            </div>

                            {isProvider && (
                                <div className="p-5 border border-slate-200 rounded-xl flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-slate-100 rounded-lg"><Briefcase size={20} className="text-slate-500" /></div>
                                        <div>
                                            <p className="font-bold text-slate-800">Professional License</p>
                                            <p className="text-xs text-slate-400">PVMC-12345</p>
                                        </div>
                                    </div>
                                    <button className="text-xs font-bold text-blue-600 hover:underline">Update Document</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- PREFERENCES TAB --- */}
                {activeTab === 'PREFERENCES' && (
                     <div className="max-w-2xl space-y-6 animate-in slide-in-from-right-4 fade-in">
                         <div className="p-5 border border-slate-200 rounded-xl">
                             <div className="flex items-center justify-between mb-4">
                                 <div className="flex items-center gap-3">
                                     <Globe className="text-slate-400" size={20} />
                                     <p className="font-bold text-slate-800">Language</p>
                                 </div>
                                 <select 
                                    value={userData.language}
                                    onChange={(e) => setUserData({...userData, language: e.target.value})}
                                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500"
                                 >
                                     <option value="English">English</option>
                                     <option value="Urdu">Urdu (اردو)</option>
                                 </select>
                             </div>
                             <p className="text-xs text-slate-500">Choose your preferred interface language.</p>
                         </div>

                         <div className="p-5 border border-slate-200 rounded-xl">
                             <div className="flex items-center gap-3 mb-6">
                                 <Bell className="text-slate-400" size={20} />
                                 <p className="font-bold text-slate-800">Notifications</p>
                             </div>
                             
                             <div className="space-y-4">
                                 {[
                                     { id: 'email', label: 'Email Notifications', desc: 'Get invoices and summaries via email.' },
                                     { id: 'sms', label: 'SMS Alerts', desc: 'Get texts for appointment reminders.' },
                                     { id: 'push', label: 'Push Notifications', desc: 'Receive real-time updates on your device.' },
                                 ].map((item) => (
                                     <div key={item.id} className="flex items-center justify-between">
                                         <div>
                                             <p className="text-sm font-bold text-slate-700">{item.label}</p>
                                             <p className="text-xs text-slate-500">{item.desc}</p>
                                         </div>
                                         <div 
                                            onClick={() => setUserData(prev => ({...prev, notifications: {...prev.notifications, [item.id]: !(prev.notifications as any)[item.id]}}))}
                                            className={`w-12 h-6 rounded-full cursor-pointer transition-colors relative ${ (userData.notifications as any)[item.id] ? 'bg-teal-500' : 'bg-slate-200'}`}
                                         >
                                             <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${ (userData.notifications as any)[item.id] ? 'left-7' : 'left-1'}`} />
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         </div>
                     </div>
                )}

                {/* --- SECURITY TAB --- */}
                {activeTab === 'SECURITY' && (
                    <div className="max-w-2xl space-y-6 animate-in slide-in-from-right-4 fade-in">
                         <div className="p-5 border border-slate-200 rounded-xl bg-white">
                            <h4 className="font-bold text-slate-800 mb-4">Change Password</h4>
                            <div className="space-y-4">
                                {/* Current Password */}
                                <div className="relative">
                                    <input 
                                        type={showCurrentPass ? "text" : "password"} 
                                        placeholder="Current Password" 
                                        className="w-full p-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:ring-2 focus:ring-teal-500" 
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                                        className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                                        aria-label={showCurrentPass ? "Hide password" : "Show password"}
                                        title={showCurrentPass ? "Hide password" : "Show password"}
                                    >
                                        {showCurrentPass ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    {/* New Password */}
                                    <div className="relative">
                                        <input 
                                            type={showNewPass ? "text" : "password"} 
                                            placeholder="New Password" 
                                            className="w-full p-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:ring-2 focus:ring-teal-500" 
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPass(!showNewPass)}
                                            className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                                            aria-label={showNewPass ? "Hide password" : "Show password"}
                                            title={showNewPass ? "Hide password" : "Show password"}
                                        >
                                            {showNewPass ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="relative">
                                        <input 
                                            type={showConfirmPass ? "text" : "password"} 
                                            placeholder="Confirm New Password" 
                                            className="w-full p-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:ring-2 focus:ring-teal-500" 
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPass(!showConfirmPass)}
                                            className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                                            aria-label={showConfirmPass ? "Hide password" : "Show password"}
                                            title={showConfirmPass ? "Hide password" : "Show password"}
                                        >
                                            {showConfirmPass ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                                <button className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm">Update Password</button>
                            </div>
                         </div>

                         <div className="p-5 border border-slate-200 rounded-xl bg-white flex justify-between items-center">
                             <div>
                                 <h4 className="font-bold text-slate-800 mb-1">Two-Factor Authentication</h4>
                                 <p className="text-xs text-slate-500">Add an extra layer of security to your account.</p>
                             </div>
                             <button className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-lg text-sm hover:bg-slate-50">Enable 2FA</button>
                         </div>
                    </div>
                )}

            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors">
                    Close
                </button>
                <button 
                    className="px-6 py-2.5 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-200 transition-all flex items-center gap-2"
                    onClick={() => {
                        // Simulate save
                        setTimeout(onClose, 500);
                    }}
                >
                    <Save size={18} /> Save Changes
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
