import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Heart, Menu, X } from 'lucide-react';

const links = [
  { to: '/features', label: 'Features' },
  { to: '/how-it-works', label: 'How it Works' },
  { to: '/community', label: 'Community' },
];

const MarketingNav: React.FC = () => {
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `transition-colors ${isActive ? 'text-teal-600' : 'hover:text-teal-600'}`;

  return (
    <nav className="sticky top-4 z-50 max-w-7xl mx-auto px-4 md:px-6">
      <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-full px-6 h-16 flex items-center justify-between shadow-sm">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-teal-200/50">
            <Heart className="text-white w-4 h-4 fill-current" />
          </div>
          <span className="text-xl font-black text-slate-800 tracking-tight">PawPortal</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 font-bold text-sm text-slate-500">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass}>{l.label}</NavLink>
          ))}
        </div>

        <div className="hidden md:flex gap-3">
          <button onClick={() => nav('/login')} className="text-slate-700 font-bold hover:text-teal-600 transition-colors px-3 text-sm">
            Log In
          </button>
          <button onClick={() => nav('/signup')} className="bg-slate-900 text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            Sign Up
          </button>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-slate-700 p-1" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden mt-2 bg-white/90 backdrop-blur-xl border border-white/60 rounded-3xl shadow-lg p-4 flex flex-col gap-1 animate-fade-in">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `px-4 py-3 rounded-xl font-bold text-sm ${isActive ? 'bg-teal-50 text-teal-600' : 'text-slate-600 hover:bg-slate-50'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <div className="flex gap-2 mt-2">
            <button onClick={() => { setOpen(false); nav('/login'); }} className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-sm text-slate-700">
              Log In
            </button>
            <button onClick={() => { setOpen(false); nav('/signup'); }} className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm">
              Sign Up
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default MarketingNav;
