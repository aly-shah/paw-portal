import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Menu, X, PawPrint } from 'lucide-react';

const links = [
  { to: '/features', label: 'Features' },
  { to: '/how-it-works', label: 'How it works' },
  { to: '/community', label: 'Community' },
];

const Wordmark: React.FC = () => (
  <Link to="/" aria-label="PawPortal home" className="inline-flex items-center gap-2">
    <span className="inline-flex size-8 items-center justify-center rounded-lg bg-[var(--ed-accent)] text-[var(--ed-bg)]">
      <PawPrint className="size-4" strokeWidth={2} />
    </span>
    <span className="text-[19px] tracking-tight text-[var(--ed-ink)]" style={{ fontWeight: 600 }}>PawPortal</span>
  </Link>
);

const MarketingNav: React.FC = () => {
  const nav = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'border-b border-[var(--ed-line)] bg-[var(--ed-bg)]/85 backdrop-blur' : 'border-b border-transparent'}`}>
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-6 lg:px-10">
        <Wordmark />

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => `text-[13px] transition-colors ${isActive ? 'text-[var(--ed-accent)]' : 'text-[var(--ed-ink-2)] hover:text-[var(--ed-accent)]'}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <button onClick={() => nav('/login')} className="text-[13px] text-[var(--ed-ink-2)] hover:text-[var(--ed-accent)] px-2">
            Log in
          </button>
          <button onClick={() => nav('/signup')} className="group inline-flex items-center gap-1.5 rounded-full bg-[var(--ed-ink)] px-4 py-2 text-[13px] text-[var(--ed-bg)] transition-all hover:bg-[var(--ed-accent)]" style={{ fontWeight: 500 }}>
            Get started
            <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" strokeWidth={2} />
          </button>
        </div>

        <button className="md:hidden text-[var(--ed-ink)] p-1" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden mx-4 mt-2 rounded-2xl border border-[var(--ed-line)] bg-[var(--ed-surface)] p-3 shadow-xl">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `block rounded-xl px-4 py-3 text-[14px] ${isActive ? 'bg-[var(--ed-bg-alt)] text-[var(--ed-accent)]' : 'text-[var(--ed-ink-2)]'}`}
            >
              {l.label}
            </NavLink>
          ))}
          <div className="mt-2 flex gap-2">
            <button onClick={() => { setOpen(false); nav('/login'); }} className="flex-1 rounded-full border border-[var(--ed-line-strong)] py-3 text-[13px] text-[var(--ed-ink)]">Log in</button>
            <button onClick={() => { setOpen(false); nav('/signup'); }} className="flex-1 rounded-full bg-[var(--ed-ink)] py-3 text-[13px] text-[var(--ed-bg)]">Get started</button>
          </div>
        </div>
      )}
    </header>
  );
};

export default MarketingNav;
