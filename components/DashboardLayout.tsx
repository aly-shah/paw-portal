
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  MoreHorizontal,
  Search, 
  ShoppingBag, 
  Users, 
  MessageSquare, 
  LogOut, 
  Menu, 
  X, 
  Settings, 
  Dna, 
  PawPrint, 
  HeartHandshake, 
  Calendar, 
  ClipboardList, 
  Activity, 
  Box, 
  Briefcase,
  Star,
  Globe,
  HeartPulse,
  CalendarCheck,
  Camera,
  ShieldAlert,
  Gift
} from 'lucide-react';
import { UserRole } from '../types';
import { MOCK_PATIENTS_DETAILED } from '../constants';
import { usePawData } from '../contexts/PawDataContext';
import { useAuth } from '../contexts/AuthContext';

// Components
import Dashboard from './Dashboard';
import ServiceFinder from './ServiceFinder';
import Marketplace from './Marketplace';
import Community from './Community';
import Messages from './Messages';
import PetProfileManager from './PetProfileManager';
import PatientManager from './vet/PatientManager';
import ScheduleManager from './vet/ScheduleManager';
import VetAnalytics from './vet/VetAnalytics';
import ChatWidget from './ChatWidget';
import ProfileSettings from './ProfileSettings';
import JobFinder from './JobFinder';
import PetDirectory from './PetDirectory';
import HealthHub from './health/HealthHub';
import BookingCenter from './booking/BookingCenter';
import SafetyCenter from './safety/SafetyCenter';
import RewardsCenter from './rewards/RewardsCenter';
import PawScan from './ai/PawScan';

// Define Tabs
export enum Tab {
  DASHBOARD = 'Dashboard',
  SERVICES = 'Services',
  MARKET = 'Marketplace',
  COMMUNITY = 'Community',
  MESSAGES = 'Messages',
  DIRECTORY = 'Directory',
  PETS = 'My Pets',
  PATIENTS = 'Patients',
  SCHEDULE = 'Schedule',
  ANALYTICS = 'Analytics',
  ORDERS = 'Orders',
  INVENTORY = 'Inventory',
  JOBS = 'Find Jobs',
  REVIEWS = 'My Reviews',
  HEALTH = 'Health',
  APPOINTMENTS = 'Appointments',
  PAWSCAN = 'PawScan',
  SAFETY = 'Safety',
  REWARDS = 'Paw Points'
}

interface DashboardLayoutProps {
  onLogout: () => void;
  userRole: UserRole;
}

// Slug helpers — the active tab lives in the URL (/dashboard/:slug).
const tabToSlug = (tab: string) => (tab === Tab.DASHBOARD ? '' : tab.toLowerCase().replace(/\s+/g, '-'));

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ onLogout, userRole }) => {
  const { pawPoints } = usePawData();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Real signed-in user for the chrome (sidebar, top bar, mobile header).
  const displayName = user?.name || 'PawPortal User';
  const displayAvatar = user?.avatar || 'https://picsum.photos/id/64/100/100';
  const roleLabel = userRole.toLowerCase().replace(/_/g, ' ');

  // Map URL slug -> Tab (e.g. /dashboard/health -> Tab.HEALTH, /dashboard -> overview).
  const slugToTab = useMemo(
    () => Object.fromEntries(Object.values(Tab).map((t) => [tabToSlug(t), t])) as Record<string, Tab>,
    [],
  );
  const currentSlug = location.pathname.replace(/^\/dashboard\/?/, '');
  const activeTab: string = slugToTab[currentSlug] || Tab.DASHBOARD;

  const goTab = (tab: string) => navigate(`/dashboard/${tabToSlug(tab)}`);

  // Responsive Sidebar States
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [navigationContext, setNavigationContext] = useState<any>(null);

  // Close the mobile drawer whenever the route (tab) changes.
  useEffect(() => {
      setIsMobileOpen(false);
  }, [location.pathname]);

  const handleInternalNavigate = (tab: string, context?: any) => {
      if (context) setNavigationContext(context);
      goTab(tab);
  };

  // Define Sidebar Items based on Role
  const getNavItems = () => {
    const common = [
        { id: Tab.DASHBOARD, icon: LayoutDashboard, label: 'Overview' },
        { id: Tab.COMMUNITY, icon: Users, label: 'Community' },
        { id: Tab.MESSAGES, icon: MessageSquare, label: 'Messages' },
    ];

    if (userRole === UserRole.VET || userRole === UserRole.CLINIC) {
        const items = [
            ...common,
            { id: Tab.JOBS, icon: Briefcase, label: 'Find Jobs' }, 
            { id: Tab.PATIENTS, icon: ClipboardList, label: 'Patient Directory' },
            { id: Tab.SCHEDULE, icon: Calendar, label: 'Schedule' },
            { id: Tab.ANALYTICS, icon: Activity, label: 'Analytics' },
        ];
        
        if (userRole === UserRole.CLINIC) {
            items.splice(4, 0, { id: Tab.INVENTORY, icon: Box, label: 'Inventory' });
        }
        return items;
    }

    if (userRole === UserRole.VENDOR) {
        return [
            ...common,
            { id: Tab.INVENTORY, icon: Box, label: 'Inventory' },
            { id: Tab.ORDERS, icon: ClipboardList, label: 'Orders' },
            { id: Tab.ANALYTICS, icon: Activity, label: 'Analytics' },
        ];
    }

    if (userRole === UserRole.CARE_GIVER) {
        return [
            ...common,
            { id: Tab.JOBS, icon: Briefcase, label: 'Find Jobs' },
            { id: Tab.SCHEDULE, icon: Calendar, label: 'My Schedule' },
            { id: Tab.REVIEWS, icon: Star, label: 'My Reviews' },
        ];
    }

    return [
        ...common,
        { id: Tab.PETS, icon: PawPrint, label: 'My Pets' },
        { id: Tab.HEALTH, icon: HeartPulse, label: 'Health Hub' },
        { id: Tab.PAWSCAN, icon: Camera, label: 'PawScan' },
        { id: Tab.APPOINTMENTS, icon: CalendarCheck, label: 'Appointments' },
        { id: Tab.SERVICES, icon: Search, label: 'Find Services' },
        { id: Tab.MARKET, icon: ShoppingBag, label: 'Marketplace' },
        { id: Tab.SAFETY, icon: ShieldAlert, label: 'Safety & PawTag' },
        { id: Tab.REWARDS, icon: Gift, label: 'Paw Points' },
        { id: Tab.DIRECTORY, icon: Globe, label: 'Pet Directory' },
    ];
  };

  const navItems = getNavItems();

  const renderContent = () => {
    if (activeTab === Tab.DASHBOARD) return <Dashboard role={userRole} onNavigate={handleInternalNavigate} />;
    if (activeTab === Tab.SERVICES) return <ServiceFinder initialFilter={navigationContext?.filter} onNavigate={handleInternalNavigate} />;
    if (activeTab === Tab.MARKET) return <Marketplace initialCategory={navigationContext?.category} />;
    if (activeTab === Tab.COMMUNITY) return <Community />;
    if (activeTab === Tab.DIRECTORY) return <PetDirectory />;
    if (activeTab === Tab.MESSAGES) return <Messages initialContext={navigationContext} />;
    if (activeTab === Tab.PETS) return <PetProfileManager />;
    if (activeTab === Tab.HEALTH) return <HealthHub />;
    if (activeTab === Tab.PAWSCAN) return <PawScan onBookVet={() => goTab(Tab.APPOINTMENTS)} />;
    if (activeTab === Tab.APPOINTMENTS) return <BookingCenter />;
    if (activeTab === Tab.SAFETY) return <SafetyCenter />;
    if (activeTab === Tab.REWARDS) return <RewardsCenter />;
    if (activeTab === Tab.PATIENTS) return <PatientManager />;
    
    if (activeTab === Tab.INVENTORY && userRole === UserRole.CLINIC) {
        return <Dashboard role={userRole} currentTab={Tab.INVENTORY} />;
    }
    
    if (activeTab === Tab.JOBS) {
        if (userRole === UserRole.CARE_GIVER) return <Dashboard role={userRole} currentTab={Tab.JOBS} />;
        if (userRole === UserRole.VET || userRole === UserRole.CLINIC) return <JobFinder userRole={userRole} />;
    }
    
    if (activeTab === Tab.SCHEDULE) {
        if (userRole === UserRole.VET || userRole === UserRole.CLINIC) return <ScheduleManager />;
        if (userRole === UserRole.CARE_GIVER) return <Dashboard role={userRole} currentTab={Tab.SCHEDULE} />;
    }

    if (activeTab === Tab.ANALYTICS) {
         if (userRole === UserRole.VET || userRole === UserRole.CLINIC) return <VetAnalytics />;
         if (userRole === UserRole.VENDOR) return <Dashboard role={userRole} currentTab={Tab.ANALYTICS} />;
    }

    if (userRole === UserRole.VENDOR && (activeTab === Tab.ORDERS || activeTab === Tab.INVENTORY)) {
        return <Dashboard role={userRole} currentTab={activeTab} />;
    }
    
    if (userRole === UserRole.CARE_GIVER && (activeTab === Tab.REVIEWS)) {
        return <Dashboard role={userRole} currentTab={activeTab} />;
    }

    return <Dashboard role={userRole} onNavigate={handleInternalNavigate} />;
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* Mobile/Tablet Backdrop */}
      {isMobileOpen && (
        <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Hidden on Mobile/Tablet (lg breakpoint) unless toggled */}
      <aside 
        className={`
            fixed lg:static inset-y-0 left-0 z-40 bg-white border-r border-slate-200 
            transition-all duration-300 ease-in-out flex flex-col
            ${isMobileOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full w-64'} 
            lg:translate-x-0 lg:shadow-none
            ${isDesktopExpanded ? 'lg:w-64' : 'lg:w-20'}
        `}
      >
        {/* Logo Area */}
        <div className="p-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-teal-200 shrink-0">
                <PawPrint className="text-white w-5 h-5" />
              </div>
              <span className={`font-black text-xl text-slate-800 tracking-tight transition-opacity duration-200 ${!isDesktopExpanded ? 'lg:opacity-0 lg:hidden' : 'opacity-100'}`}>
                PawPortal
              </span>
          </div>
          {/* Close button for Mobile/Tablet */}
          <button 
            onClick={() => setIsMobileOpen(false)} 
            className="lg:hidden text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-hide">
          <p className={`px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-300 ${!isDesktopExpanded ? 'lg:hidden' : ''}`}>Menu</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => goTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {/* Active accent bar */}
                {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-teal-600" />}

                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={`shrink-0 ${isActive ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-600'}`} />

                <span className={`text-sm font-semibold whitespace-nowrap transition-opacity duration-200 ${!isDesktopExpanded ? 'lg:opacity-0 lg:hidden' : 'opacity-100'}`}>
                    {item.label}
                </span>

                {!isDesktopExpanded && (
                    <div className="hidden lg:block absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                        {item.label}
                    </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* User & Logout */}
        <div className="p-3 border-t border-slate-100">
           {userRole === UserRole.OWNER && (
               <button
                   onClick={() => goTab(Tab.REWARDS)}
                   className={`w-full text-left mb-4 p-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl text-white shadow-lg relative overflow-hidden group cursor-pointer transition-all ${!isDesktopExpanded ? 'lg:hidden' : ''}`}
               >
                   <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-1">PawPoints Balance</p>
                   <p className="text-2xl font-black">{pawPoints.toLocaleString()}</p>
                   <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/20 rounded-full blur-xl"></div>
               </button>
           )}

           <button
            onClick={() => setShowProfileSettings(true)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-all ${!isDesktopExpanded ? 'justify-center' : ''}`}
          >
            <img
                src={displayAvatar}
                alt={displayName}
                className="w-8 h-8 rounded-full border-2 border-slate-100 shrink-0 object-cover"
            />
            <div className={`text-left flex-1 min-w-0 transition-opacity duration-200 ${!isDesktopExpanded ? 'lg:opacity-0 lg:hidden' : 'opacity-100'}`}>
                <p className="text-sm font-bold text-slate-700 truncate">{displayName}</p>
                <p className="text-xs text-slate-400 truncate capitalize">{roleLabel}</p>
            </div>
            {isDesktopExpanded && <Settings size={16} className="text-slate-400 shrink-0" />}
          </button>

          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all mt-1 ${!isDesktopExpanded ? 'justify-center' : ''}`}
          >
            <LogOut size={20} className="shrink-0" />
            <span className={`text-sm font-bold whitespace-nowrap transition-opacity duration-200 ${!isDesktopExpanded ? 'lg:opacity-0 lg:hidden' : 'opacity-100'}`}>
                Log Out
            </span>
          </button>
        </div>

        {/* Desktop Collapse Toggle */}
        <button 
            onClick={() => setIsDesktopExpanded(!isDesktopExpanded)}
            className="hidden lg:flex absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white border border-slate-200 rounded-full items-center justify-center shadow-sm text-slate-400 hover:text-teal-600 transition-colors z-30"
        >
            {isDesktopExpanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50 relative transition-all duration-300">
        
        {/* Mobile/Tablet Header (Visible up to lg breakpoint) */}
        <div className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 z-20 sticky top-0">
             <div className="flex items-center gap-3">
                <button onClick={() => setIsMobileOpen(true)} className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg">
                    <Menu size={24} />
                </button>
                <div className="flex items-center gap-2">
                    <PawPrint className="text-teal-600" size={24} />
                    <span className="font-black text-lg text-slate-800">PawPortal</span>
                </div>
             </div>
             <img src={displayAvatar} className="w-8 h-8 rounded-full border border-slate-200 object-cover" onClick={() => setShowProfileSettings(true)} />
        </div>

        {/* Desktop top bar */}
        <div className="hidden lg:flex h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 items-center justify-between px-8 shrink-0 sticky top-0 z-20">
            <div>
                <h1 className="text-lg font-black text-slate-800 tracking-tight">{activeTab}</h1>
                <p className="text-xs text-slate-400 -mt-0.5 capitalize">{roleLabel} workspace</p>
            </div>
            <div className="flex items-center gap-3">
                {userRole === UserRole.OWNER && (
                    <button
                        onClick={() => goTab(Tab.REWARDS)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-sm font-bold hover:bg-amber-100 transition-colors"
                        title="Your Paw Points"
                    >
                        <Gift size={15} /> {pawPoints.toLocaleString()}
                    </button>
                )}
                <button
                    onClick={() => setShowProfileSettings(true)}
                    className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-slate-100 transition-colors"
                >
                    <img src={displayAvatar} alt={displayName} className="w-8 h-8 rounded-full border border-slate-200 object-cover" />
                    <span className="text-sm font-bold text-slate-700 max-w-[140px] truncate">{displayName}</span>
                </button>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 lg:pb-8 relative scroll-smooth w-full">
             <AnimatePresence mode="wait">
               <motion.div
                 key={activeTab}
                 initial={{ opacity: 0, y: 8 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -8 }}
                 transition={{ duration: 0.18, ease: 'easeOut' }}
               >
                 {renderContent()}
               </motion.div>
             </AnimatePresence>
        </div>

        {/* Mobile bottom navigation (consumer roles) */}
        {(userRole === UserRole.OWNER || userRole === UserRole.CARE_GIVER) && (
          <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200 flex items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
            {navItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => goTab(item.id)}
                  className={`flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors ${isActive ? 'text-teal-600' : 'text-slate-400'}`}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] font-bold truncate max-w-[64px]">{item.label}</span>
                </button>
              );
            })}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="flex flex-1 flex-col items-center gap-0.5 py-2 text-slate-400"
            >
              <MoreHorizontal size={22} />
              <span className="text-[10px] font-bold">More</span>
            </button>
          </nav>
        )}

        {/* Global Components */}
        <ChatWidget />
        <ProfileSettings 
            isOpen={showProfileSettings} 
            onClose={() => setShowProfileSettings(false)} 
            userRole={userRole}
        />

      </main>
    </div>
  );
};

// Icons for toggle
const ChevronLeftIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const ChevronRightIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;

export default DashboardLayout;
