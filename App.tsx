import React, { useState } from 'react';
import {
  BrowserRouter, Routes, Route, Navigate,
  useNavigate, useParams, useSearchParams,
} from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import AdminLogin from './components/admin/AdminLogin';
import SuperAdminDashboard from './components/admin/SuperAdminDashboard';
import PawTagPage from './components/safety/PawTagPage';
import FeaturesPage from './components/marketing/FeaturesPage';
import HowItWorksPage from './components/marketing/HowItWorksPage';
import CommunityPage from './components/marketing/CommunityPage';
import { UserRole } from './types';

const AUTH_KEY = 'pawportal-auth';

const loadRole = (): UserRole | null => {
  try {
    const r = localStorage.getItem(AUTH_KEY);
    return r ? (r as UserRole) : null;
  } catch {
    return null;
  }
};

// --- Route wrappers (each gets access to navigate) ---

const AuthRoute: React.FC<{ mode: 'login' | 'signup'; onLogin: (r: UserRole) => void }> = ({ mode, onLogin }) => {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next');
  return (
    <AuthPage
      initialView={mode}
      onLoginSuccess={(role: UserRole) => {
        onLogin(role);
        nav(role === UserRole.SUPER_ADMIN ? '/dashboard' : `/dashboard/${next || ''}`);
      }}
      onBack={() => nav('/')}
    />
  );
};

const AdminRoute: React.FC<{ onLogin: (r: UserRole) => void }> = ({ onLogin }) => {
  const nav = useNavigate();
  return (
    <AdminLogin
      onLoginSuccess={(role: UserRole) => {
        onLogin(role);
        nav('/dashboard');
      }}
      onBack={() => nav('/')}
    />
  );
};

const TagRoute: React.FC = () => {
  const { petId } = useParams();
  return <PawTagPage petId={petId || ''} />;
};

const ProtectedDashboard: React.FC<{ role: UserRole | null; onLogout: () => void }> = ({ role, onLogout }) => {
  const nav = useNavigate();
  const handleLogout = () => {
    onLogout();
    nav('/');
  };
  if (!role) return <Navigate to="/login" replace />;
  if (role === UserRole.SUPER_ADMIN) return <SuperAdminDashboard onLogout={handleLogout} />;
  return <DashboardLayout userRole={role} onLogout={handleLogout} />;
};

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole | null>(() => loadRole());

  const login = (r: UserRole) => {
    setRole(r);
    try { localStorage.setItem(AUTH_KEY, r); } catch { /* ignore */ }
  };
  const logout = () => {
    setRole(null);
    try { localStorage.removeItem(AUTH_KEY); } catch { /* ignore */ }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={role ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/login" element={<AuthRoute mode="login" onLogin={login} />} />
        <Route path="/signup" element={<AuthRoute mode="signup" onLogin={login} />} />
        <Route path="/admin" element={<AdminRoute onLogin={login} />} />
        <Route path="/tag/:petId" element={<TagRoute />} />
        <Route path="/dashboard/*" element={<ProtectedDashboard role={role} onLogout={logout} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
