
import React, { useState, useEffect } from 'react';
import DashboardLayout from './components/DashboardLayout';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import AdminLogin from './components/admin/AdminLogin';
import SuperAdminDashboard from './components/admin/SuperAdminDashboard';
import PawTagPage from './components/safety/PawTagPage';
import { UserRole } from './types';

type ViewState = 'landing' | 'login' | 'signup' | 'dashboard' | 'admin-login';

// Public PawTag deep-link, e.g. #/tag/p1 (reached by scanning a pet's QR code).
const readTagId = () => {
  const m = window.location.hash.match(/^#\/tag\/([\w-]+)/);
  return m ? m[1] : null;
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.OWNER);

  // Public, unauthenticated PawTag route — independent of auth state.
  const [tagId, setTagId] = useState<string | null>(readTagId());
  useEffect(() => {
    const onHash = () => setTagId(readTagId());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // State to handle deep linking to specific dashboard tabs
  const [initialDashboardTab, setInitialDashboardTab] = useState<string | undefined>(undefined);

  const handleLoginSuccess = (role: UserRole) => {
    setUserRole(role);
    setIsAuthenticated(true);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView('landing');
    setInitialDashboardTab(undefined);
    setUserRole(UserRole.OWNER); // Reset to default
  };

  // Quick Nav Handler (e.g., clicking "Find a Vet" on landing page)
  const handleQuickNav = (destination: 'Services' | 'Marketplace' | 'Community') => {
    setInitialDashboardTab(destination);
    // Assume we need to signup/login first to access these features
    setCurrentView('signup');
  };

  // Public PawTag page (scan-to-return) — takes precedence over everything.
  if (tagId) {
    return <PawTagPage petId={tagId} />;
  }

  // Super Admin Direct Render
  if (isAuthenticated && userRole === UserRole.SUPER_ADMIN) {
      return <SuperAdminDashboard onLogout={handleLogout} />;
  }

  // Main Router Logic
  if (isAuthenticated && currentView === 'dashboard') {
    return (
      <DashboardLayout 
        onLogout={handleLogout} 
        initialTab={initialDashboardTab}
        userRole={userRole}
      />
    );
  }

  if (currentView === 'admin-login') {
      return (
          <AdminLogin 
            onLoginSuccess={handleLoginSuccess}
            onBack={() => setCurrentView('landing')}
          />
      );
  }

  if (currentView === 'login') {
    return (
      <AuthPage 
        initialView="login" 
        onLoginSuccess={handleLoginSuccess} 
        onBack={() => setCurrentView('landing')} 
      />
    );
  }

  if (currentView === 'signup') {
    return (
      <AuthPage 
        initialView="signup" 
        onLoginSuccess={handleLoginSuccess} 
        onBack={() => setCurrentView('landing')} 
      />
    );
  }

  // Default to Landing Page
  return (
    <LandingPage 
      onLogin={() => setCurrentView('login')} 
      onSignup={() => setCurrentView('signup')}
      onQuickNav={handleQuickNav}
      onAdminLogin={() => setCurrentView('admin-login')}
    />
  );
};

export default App;
