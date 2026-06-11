
import React, { useState, useMemo } from 'react';
import { 
    Search, Filter, Plus, MoreVertical, Download, Upload, Trash2, 
    Shield, CheckCircle, XCircle, Lock, Unlock, RefreshCw, Eye, 
    Edit3, Mail, Smartphone, MapPin, Calendar, Clock, Key,
    FileText, LogOut, ShieldAlert, ChevronDown, Check, UserPlus
} from 'lucide-react';
import { UserRole } from '../../types';

// --- Types ---

type UserStatus = 'ACTIVE' | 'INACTIVE' | 'LOCKED';
type UserType = 'INTERNAL' | 'VENDOR' | 'CLINIC' | 'VET' | 'CARE_GIVER';

interface AdminUser {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: UserRole | string;
    type: UserType;
    organization: string;
    status: UserStatus;
    lastLogin: string;
    createdAt: string;
    twoFactorEnabled: boolean;
    permissions: string[];
    avatar: string;
}

interface ActivityLog {
    id: string;
    action: string;
    timestamp: string;
    details: string;
    ip: string;
}

// --- Mock Data ---

const MOCK_USERS: AdminUser[] = [
    {
        id: 'U-1001', name: 'Dr. Sarah Jenkins', email: 'sarah@pawsclinic.com', phone: '+92 300 1234567',
        role: 'Clinic Admin', type: 'CLINIC', organization: 'Downtown Pet Clinic',
        status: 'ACTIVE', lastLogin: '2 mins ago', createdAt: '2023-01-15',
        twoFactorEnabled: true, permissions: ['manage_staff', 'view_financials'],
        avatar: 'https://picsum.photos/id/1011/100/100'
    },
    {
        id: 'U-1002', name: 'Ali Khan', email: 'ali@petmart.pk', phone: '+92 321 9876543',
        role: 'Vendor Owner', type: 'VENDOR', organization: 'PetMart Store',
        status: 'ACTIVE', lastLogin: '1 hour ago', createdAt: '2023-02-20',
        twoFactorEnabled: true, permissions: ['manage_inventory', 'manage_orders'],
        avatar: 'https://picsum.photos/id/1025/100/100'
    },
    {
        id: 'U-1003', name: 'System Auditor', email: 'audit@pawportal.sys', phone: '+92 333 5555555',
        role: 'Auditor', type: 'INTERNAL', organization: 'PawPortal HQ',
        status: 'ACTIVE', lastLogin: 'Yesterday', createdAt: '2022-11-05',
        twoFactorEnabled: true, permissions: ['view_logs', 'export_data'],
        avatar: 'https://picsum.photos/id/1005/100/100'
    },
    {
        id: 'U-1004', name: 'John Doe', email: 'john@vetcare.com', phone: '+92 345 6789012',
        role: 'Clinic Staff', type: 'CLINIC', organization: 'VetCare Plus',
        status: 'LOCKED', lastLogin: '3 days ago', createdAt: '2023-05-10',
        twoFactorEnabled: false, permissions: ['view_patients'],
        avatar: 'https://picsum.photos/id/1012/100/100'
    },
    {
        id: 'U-1005', name: 'Support Agent', email: 'support@pawportal.sys', phone: '+92 300 0000000',
        role: 'Support', type: 'INTERNAL', organization: 'PawPortal HQ',
        status: 'INACTIVE', lastLogin: '1 week ago', createdAt: '2023-06-01',
        twoFactorEnabled: true, permissions: ['impersonate_user', 'manage_tickets'],
        avatar: 'https://picsum.photos/id/1027/100/100'
    }
];

const MOCK_LOGS: ActivityLog[] = [
    { id: 'l1', action: 'Login Successful', timestamp: 'Oct 24, 10:30 AM', details: 'Via Chrome / Windows', ip: '192.168.1.1' },
    { id: 'l2', action: 'Updated Profile', timestamp: 'Oct 23, 04:15 PM', details: 'Changed phone number', ip: '192.168.1.1' },
    { id: 'l3', action: 'Password Reset', timestamp: 'Oct 20, 09:00 AM', details: 'Requested via email', ip: '203.128.5.12' },
    { id: 'l4', action: 'Failed Login', timestamp: 'Oct 20, 08:55 AM', details: 'Incorrect password (3 attempts)', ip: '203.128.5.12' },
];

// --- Sub-Components ---

const UserDetailDrawer = ({ user, onClose, onUpdate }: { user: AdminUser, onClose: () => void, onUpdate: (u: AdminUser) => void }) => {
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PERMISSIONS' | 'SECURITY' | 'ACTIVITY'>('OVERVIEW');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(user);
    const [toast, setToast] = useState<string | null>(null);
    const [mobileSessionRevoked, setMobileSessionRevoked] = useState(false);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2500);
    };

    const handleSave = () => {
        onUpdate(formData);
        setIsEditing(false);
        showToast('User details updated');
    };

    const handleSendReset = () => showToast(`Password reset email sent to ${user.email}`);
    const handleTempPass = () => {
        const temp = Math.random().toString(36).slice(-8) + '!A1';
        navigator.clipboard?.writeText(temp).catch(() => {});
        showToast(`Temp password generated & copied: ${temp}`);
    };
    const handleForceLogout = () => {
        setMobileSessionRevoked(true);
        showToast('All sessions signed out');
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
            {toast && (
                <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl z-[60] flex items-center gap-2 animate-in slide-in-from-top-4 fade-in">
                    <CheckCircle size={16} className="text-emerald-400" />
                    <span className="text-sm font-bold">{toast}</span>
                </div>
            )}
            <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                    <div className="flex gap-4">
                        <img src={user.avatar} className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-sm" />
                        <div>
                            <h2 className="text-2xl font-black text-slate-800">{user.name}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded uppercase">{user.role}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                                    user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                    user.status === 'LOCKED' ? 'bg-red-50 text-red-700 border-red-200' :
                                    'bg-slate-100 text-slate-500 border-slate-200'
                                }`}>
                                    {user.status === 'ACTIVE' ? <CheckCircle size={10} /> : user.status === 'LOCKED' ? <Lock size={10} /> : <XCircle size={10} />}
                                    {user.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                        <XCircle size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100 px-6 gap-6">
                    {['OVERVIEW', 'PERMISSIONS', 'SECURITY', 'ACTIVITY'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                                activeTab === tab ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    {activeTab === 'OVERVIEW' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-lg text-slate-800">User Details</h3>
                                {!isEditing ? (
                                    <button onClick={() => setIsEditing(true)} className="text-blue-600 text-xs font-bold hover:underline">Edit Information</button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button onClick={() => setIsEditing(false)} className="text-slate-500 text-xs font-bold hover:underline">Cancel</button>
                                        <button onClick={handleSave} className="text-emerald-600 text-xs font-bold hover:underline">Save Changes</button>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Full Name</label>
                                    {isEditing ? (
                                        <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded-lg text-sm" />
                                    ) : (
                                        <p className="font-medium text-slate-700">{user.name}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Email</label>
                                    {isEditing ? (
                                        <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2 border rounded-lg text-sm" />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Mail size={14} className="text-slate-400" />
                                            <p className="font-medium text-slate-700">{user.email}</p>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Phone</label>
                                    {isEditing ? (
                                        <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2 border rounded-lg text-sm" />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Smartphone size={14} className="text-slate-400" />
                                            <p className="font-medium text-slate-700">{user.phone}</p>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Organization</label>
                                    <div className="flex items-center gap-2">
                                        <MapPin size={14} className="text-slate-400" />
                                        <p className="font-medium text-slate-700">{user.organization}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">User Type</label>
                                    <span className="inline-block bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-600">{user.type.replace('_', ' ')}</span>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Joined</label>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-slate-400" />
                                        <p className="font-medium text-slate-700">{user.createdAt}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-6">
                                <h3 className="font-bold text-lg text-slate-800 mb-4">Account Status</h3>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => onUpdate({...user, status: user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'})}
                                        className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                                            user.status === 'ACTIVE' 
                                            ? 'border-red-100 bg-red-50 text-red-600 hover:bg-red-100' 
                                            : 'border-emerald-100 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                        }`}
                                    >
                                        {user.status === 'ACTIVE' ? 'Deactivate User' : 'Activate User'}
                                    </button>
                                    <button 
                                        onClick={() => onUpdate({...user, status: user.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED'})}
                                        className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                                            user.status === 'LOCKED'
                                            ? 'border-emerald-100 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                            : 'border-amber-100 bg-amber-50 text-amber-600 hover:bg-amber-100'
                                        }`}
                                    >
                                        {user.status === 'LOCKED' ? 'Unlock Account' : 'Lock Account'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'SECURITY' && (
                        <div className="space-y-6">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <h4 className="font-bold text-slate-800 mb-2">Password Management</h4>
                                <p className="text-xs text-slate-500 mb-4">Send a reset link or manually override the password.</p>
                                <div className="flex gap-3">
                                    <button onClick={handleSendReset} className="flex-1 bg-white border border-slate-200 text-slate-700 py-2 rounded-lg text-xs font-bold hover:bg-slate-50 flex items-center justify-center gap-2">
                                        <Mail size={14} /> Send Reset Email
                                    </button>
                                    <button onClick={handleTempPass} className="flex-1 bg-white border border-slate-200 text-slate-700 py-2 rounded-lg text-xs font-bold hover:bg-slate-50 flex items-center justify-center gap-2">
                                        <Key size={14} /> Generate Temp Pass
                                    </button>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h4 className="font-bold text-slate-800">Two-Factor Authentication</h4>
                                        <p className="text-xs text-slate-500">{user.twoFactorEnabled ? 'Enabled' : 'Disabled'}</p>
                                    </div>
                                    <button 
                                        onClick={() => onUpdate({...user, twoFactorEnabled: !user.twoFactorEnabled})}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${user.twoFactorEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${user.twoFactorEnabled ? 'left-7' : 'left-1'}`}></div>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-slate-800 mb-4">Active Sessions</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 border border-emerald-200 bg-emerald-50/50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-700">Chrome on Windows (Current)</p>
                                                <p className="text-[10px] text-slate-500">IP: 192.168.1.1 • Karachi, PK</p>
                                            </div>
                                        </div>
                                        <button className="text-xs font-bold text-slate-400">Current</button>
                                    </div>
                                    {!mobileSessionRevoked && (
                                        <div className="flex justify-between items-center p-3 border border-slate-200 bg-white rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-700">Mobile App (iOS)</p>
                                                    <p className="text-[10px] text-slate-500">Last active: 2 hours ago</p>
                                                </div>
                                            </div>
                                            <button onClick={() => { setMobileSessionRevoked(true); showToast('Session revoked'); }} className="text-xs font-bold text-red-500 hover:underline">Revoke</button>
                                        </div>
                                    )}
                                </div>
                                <button onClick={handleForceLogout} className="w-full mt-4 py-3 border border-red-200 text-red-600 font-bold text-xs rounded-xl hover:bg-red-50 flex items-center justify-center gap-2">
                                    <LogOut size={14} /> Force Logout All Devices
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'ACTIVITY' && (
                        <div className="space-y-4">
                            {MOCK_LOGS.map(log => (
                                <div key={log.id} className="flex gap-4 items-start">
                                    <div className="flex flex-col items-center">
                                        <div className="w-2 h-2 bg-slate-300 rounded-full mt-2"></div>
                                        <div className="w-px h-full bg-slate-100 my-1"></div>
                                    </div>
                                    <div className="pb-4">
                                        <p className="text-sm font-bold text-slate-800">{log.action}</p>
                                        <p className="text-xs text-slate-500">{log.details}</p>
                                        <div className="flex gap-2 mt-1">
                                            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500">{log.timestamp}</span>
                                            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-mono">{log.ip}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'PERMISSIONS' && (
                        <div className="space-y-4">
                            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3">
                                <ShieldAlert className="text-amber-600 shrink-0" size={20} />
                                <p className="text-xs text-amber-800">
                                    Modifying permissions overrides the default role settings. Proceed with caution.
                                </p>
                            </div>
                            
                            {['Access Financials', 'Manage Users', 'Approve Inventory', 'System Settings', 'API Access'].map(perm => (
                                <div key={perm} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50">
                                    <span className="text-sm font-medium text-slate-700">{perm}</span>
                                    <input type="checkbox" className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500" defaultChecked={Math.random() > 0.5} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Add User Modal ---
const AddUserModal = ({ onClose, onAdd }: { onClose: () => void, onAdd: (user: AdminUser) => void }) => {
    const [step, setStep] = useState(1);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [userType, setUserType] = useState<UserType>('VENDOR');
    const [role, setRole] = useState('');
    const [organization, setOrganization] = useState('');
    const [password, setPassword] = useState('');
    const [requireReset, setRequireReset] = useState(true);

    const availableRoles: Record<UserType, string[]> = {
        'INTERNAL': ['Super Admin', 'Admin', 'Support', 'Auditor'],
        'VENDOR': ['Vendor Owner', 'Vendor Staff'],
        'CLINIC': ['Clinic Admin', 'Clinic Staff'],
        'VET': ['Veterinarian', 'Vet Technician'],
        'CARE_GIVER': ['Pet Sitter', 'Dog Walker', 'Trainer', 'Groomer']
    };

    const handleGeneratePassword = () => {
        const randomPass = Math.random().toString(36).slice(-8) + "!A1";
        setPassword(randomPass);
    };

    const handleSubmit = () => {
        if (!firstName || !lastName || !email) return;
        
        const newUser: AdminUser = {
            id: `U-${Date.now()}`,
            name: `${firstName} ${lastName}`,
            email,
            phone,
            role,
            type: userType,
            organization,
            status: 'ACTIVE',
            lastLogin: 'Never',
            createdAt: new Date().toLocaleDateString(),
            twoFactorEnabled: false,
            permissions: [],
            avatar: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`
        };
        onAdd(newUser);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-black text-xl text-slate-800">Add New User</h3>
                    <button onClick={onClose}><XCircle className="text-slate-400 hover:text-slate-600" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">First Name</label>
                            <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900" placeholder="Jane" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Last Name</label>
                            <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900" placeholder="Doe" />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Email Address</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900" placeholder="jane@example.com" />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Phone Number</label>
                        <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900" placeholder="+92 300 1234567" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">User Type</label>
                            <select 
                                value={userType} 
                                onChange={e => { setUserType(e.target.value as UserType); setRole(''); }}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900"
                            >
                                <option value="VENDOR">Vendor</option>
                                <option value="CLINIC">Clinic</option>
                                <option value="INTERNAL">Internal</option>
                                <option value="VET">Veterinary</option>
                                <option value="CARE_GIVER">Care Giver</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Role</label>
                            <select 
                                value={role} 
                                onChange={e => setRole(e.target.value)}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900"
                            >
                                <option value="">Select Role</option>
                                {availableRoles[userType].map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Organization</label>
                        <input type="text" value={organization} onChange={e => setOrganization(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900" placeholder="Company or Clinic Name" />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Password</label>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 font-mono" 
                                placeholder="Secure Password" 
                            />
                            <button onClick={handleGeneratePassword} className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200">Auto</button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input 
                            type="checkbox" 
                            id="reset" 
                            checked={requireReset} 
                            onChange={e => setRequireReset(e.target.checked)} 
                            className="w-4 h-4 text-slate-900 rounded focus:ring-slate-900"
                        />
                        <label htmlFor="reset" className="text-sm font-medium text-slate-700">Require password reset on first login</label>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100">Cancel</button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={!firstName || !lastName || !email || !role}
                        className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <UserPlus size={18} /> Create User
                    </button>
                </div>
            </div>
        </div>
    );
};

const BulkImportModal = ({ onClose }: { onClose: () => void }) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    const handleDownloadTemplate = () => {
        const csv = 'First Name,Last Name,Email,Phone,User Type,Role,Organization\nJane,Doe,jane@example.com,+92 300 1234567,VENDOR,Vendor Owner,Example Co';
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'user_import_template.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleProcess = () => {
        // No backend in this demo; acknowledge and close.
        onClose();
    };

    return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-xl text-slate-800">Bulk User Import</h3>
                <button onClick={onClose}><XCircle className="text-slate-400 hover:text-slate-600" /></button>
            </div>

            <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)} />
            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-colors group">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload size={32} />
                </div>
                <p className="font-bold text-slate-700">{fileName ?? 'Click to upload or drag CSV'}</p>
                <p className="text-xs text-slate-400 mt-1">Max 5MB. 1000 rows limit.</p>
            </div>

            <div className="mt-6 flex justify-between items-center">
                <button onClick={handleDownloadTemplate} className="text-xs font-bold text-blue-600 flex items-center gap-2 hover:underline">
                    <Download size={14} /> Download Template
                </button>
                <button onClick={handleProcess} className="bg-slate-900 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-slate-800">
                    Process Import
                </button>
            </div>
        </div>
    </div>
    );
};

// --- Main Component ---

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<AdminUser[]>(MOCK_USERS);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [showAddUser, setShowAddUser] = useState(false);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  user.organization.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesRole = filterRole === 'All' || user.type === filterRole; // Simplified filter
            const matchesStatus = filterStatus === 'All' || user.status === filterStatus;
            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, searchQuery, filterRole, filterStatus]);

    const handleUpdateUser = (updatedUser: AdminUser) => {
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    };

    const handleCreateUser = (newUser: AdminUser) => {
        setUsers([newUser, ...users]);
        setShowAddUser(false);
    };

    const toggleRow = (id: string) => {
        setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
    };

    const handleBulkStatus = (status: UserStatus) => {
        setUsers(prev => prev.map(u => selectedRows.includes(u.id) ? { ...u, status } : u));
        setSelectedRows([]);
    };

    const handleBulkDelete = () => {
        setUsers(prev => prev.filter(u => !selectedRows.includes(u.id)));
        setSelectedRows([]);
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Users</p>
                    <h3 className="text-3xl font-black text-slate-800">{users.length}</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Active</p>
                    <h3 className="text-3xl font-black text-emerald-600">{users.filter(u => u.status === 'ACTIVE').length}</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Pending / Locked</p>
                    <h3 className="text-3xl font-black text-amber-500">{users.filter(u => u.status !== 'ACTIVE').length}</h3>
                </div>
                <div className="bg-slate-900 p-5 rounded-2xl shadow-lg text-white">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">New This Week</p>
                    <h3 className="text-3xl font-black">12</h3>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center">
                <div className="flex gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-80">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search users..." 
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-slate-900"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <select 
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-600 outline-none"
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                        >
                            <option value="All">All Types</option>
                            <option value="INTERNAL">Internal</option>
                            <option value="VENDOR">Vendors</option>
                            <option value="CLINIC">Clinics</option>
                            <option value="VET">Veterinary</option>
                            <option value="CARE_GIVER">Care Giver</option>
                        </select>
                        <select 
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-600 outline-none"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="All">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="LOCKED">Locked</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-3 w-full lg:w-auto">
                    <button 
                        onClick={() => setIsImportOpen(true)}
                        className="flex-1 lg:flex-none px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2"
                    >
                        <Upload size={16} /> Import
                    </button>
                    <button 
                        onClick={() => setShowAddUser(true)}
                        className="flex-1 lg:flex-none px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 flex items-center justify-center gap-2 shadow-lg"
                    >
                        <Plus size={16} /> Add User
                    </button>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedRows.length > 0 && (
                <div className="bg-slate-900 text-white px-6 py-3 rounded-xl flex items-center justify-between animate-in slide-in-from-bottom-2 shadow-xl">
                    <span className="font-bold text-sm">{selectedRows.length} Users Selected</span>
                    <div className="flex gap-3">
                        <button onClick={() => handleBulkStatus('ACTIVE')} className="text-xs font-bold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors">Activate</button>
                        <button onClick={() => handleBulkStatus('INACTIVE')} className="text-xs font-bold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors">Deactivate</button>
                        <button onClick={handleBulkDelete} className="text-xs font-bold bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors">Delete</button>
                    </div>
                </div>
            )}

            {/* Data Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs border-b border-slate-100">
                            <tr>
                                <th className="p-4 w-10">
                                    <input 
                                        type="checkbox" 
                                        className="rounded border-slate-300"
                                        onChange={(e) => setSelectedRows(e.target.checked ? filteredUsers.map(u => u.id) : [])}
                                        checked={selectedRows.length === filteredUsers.length && filteredUsers.length > 0}
                                    />
                                </th>
                                <th className="p-4">User</th>
                                <th className="p-4">Role & Type</th>
                                <th className="p-4">Organization</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Last Login</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="p-4">
                                        <input 
                                            type="checkbox" 
                                            className="rounded border-slate-300"
                                            checked={selectedRows.includes(user.id)}
                                            onChange={() => toggleRow(user.id)}
                                        />
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <img src={user.avatar} className="w-10 h-10 rounded-full object-cover bg-slate-200" />
                                            <div>
                                                <p className="font-bold text-slate-800">{user.name}</p>
                                                <p className="text-xs text-slate-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <p className="font-bold text-slate-700">{user.role}</p>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                            user.type === 'INTERNAL' ? 'bg-purple-50 text-purple-600' :
                                            user.type === 'VENDOR' ? 'bg-blue-50 text-blue-600' :
                                            user.type === 'CLINIC' ? 'bg-orange-50 text-orange-600' :
                                            user.type === 'VET' ? 'bg-teal-50 text-teal-600' :
                                            'bg-rose-50 text-rose-600'
                                        }`}>
                                            {user.type.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="p-4 font-medium text-slate-600">{user.organization}</td>
                                    <td className="p-4">
                                        <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full w-fit border ${
                                            user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                            user.status === 'LOCKED' ? 'bg-red-50 text-red-600 border-red-200' :
                                            'bg-slate-50 text-slate-500 border-slate-200'
                                        }`}>
                                            {user.status === 'ACTIVE' && <CheckCircle size={12}/>}
                                            {user.status === 'LOCKED' && <Lock size={12}/>}
                                            {user.status === 'INACTIVE' && <XCircle size={12}/>}
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-500 text-xs">{user.lastLogin}</td>
                                    <td className="p-4 text-right">
                                        <button 
                                            onClick={() => setSelectedUserId(user.id)}
                                            className="p-2 hover:bg-white hover:shadow-md rounded-lg text-slate-400 hover:text-slate-700 transition-all border border-transparent hover:border-slate-100"
                                        >
                                            <MoreVertical size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredUsers.length === 0 && (
                    <div className="p-12 text-center text-slate-400">
                        <Search size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No users found matching your criteria.</p>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showAddUser && <AddUserModal onClose={() => setShowAddUser(false)} onAdd={handleCreateUser} />}

            {selectedUserId && (
                <UserDetailDrawer 
                    user={users.find(u => u.id === selectedUserId)!} 
                    onClose={() => setSelectedUserId(null)}
                    onUpdate={handleUpdateUser}
                />
            )}

            {isImportOpen && <BulkImportModal onClose={() => setIsImportOpen(false)} />}
        </div>
    );
};

export default UserManagement;
