import React from 'react';
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
import { useAuth } from './contexts/AuthContext';

// --- Route wrappers (each gets access to navigate) ---

const AuthRoute: React.FC<{ mode: 'login' | 'signup' }> = ({ mode }) => {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next');
  return (
    <AuthPage
      initialView={mode}
      onLoginSuccess={(role: UserRole) => {
        nav(role === UserRole.SUPER_ADMIN ? '/dashboard' : `/dashboard/${next || ''}`);
      }}
      onBack={() => nav('/')}
    />
  );
};

const AdminRoute: React.FC = () => {
  const nav = useNavigate();
  return (
    <AdminLogin
      onLoginSuccess={() => nav('/dashboard')}
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
  const { user, loading, logout } = useAuth();
  const role = user ? user.role : null;

  // While we resolve an existing session token, avoid flashing the landing page.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={role ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/login" element={<AuthRoute mode="login" />} />
        <Route path="/signup" element={<AuthRoute mode="signup" />} />
        <Route path="/admin" element={<AdminRoute />} />
        <Route path="/tag/:petId" element={<TagRoute />} />
        <Route path="/dashboard/*" element={<ProtectedDashboard role={role} onLogout={logout} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
