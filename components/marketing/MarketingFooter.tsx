import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PawPrint, ArrowUpRight } from 'lucide-react';

const cols = [
  {
    title: 'Product',
    links: [
      { label: 'Features', to: '/features' },
      { label: 'How it works', to: '/how-it-works' },
      { label: 'Community', to: '/community' },
      { label: 'Get started', to: '/signup' },
    ],
  },
  {
    title: 'For',
    links: [
      { label: 'Pet owners', to: '/signup' },
      { label: 'Vets & clinics', to: '/signup' },
      { label: 'Vendors', to: '/signup' },
      { label: 'Caregivers', to: '/signup' },
    ],
  },
];

const MarketingFooter: React.FC = () => {
  const nav = useNavigate();
  return (
    <footer className="relative border-t border-[var(--ed-line)] bg-[var(--ed-bg-alt)]">
      <div className="grain pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-[1240px] px-6 py-16 lg:px-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex size-8 items-center justify-center rounded-lg bg-[var(--ed-accent)] text-[var(--ed-bg)]">
                <PawPrint className="size-4" strokeWidth={2} />
              </span>
              <span className="text-[19px] tracking-tight" style={{ fontWeight: 600 }}>PawPortal</span>
            </div>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-[var(--ed-muted)]">
              The super-app for pets. Vets, groomers, sitters, a marketplace, and a thriving
              community — everything your pet needs, in one calm place.
            </p>
            <button
              onClick={() => nav('/signup')}
              className="group mt-7 inline-flex items-center gap-2 rounded-full bg-[var(--ed-ink)] px-5 py-3 text-[14px] text-[var(--ed-bg)] transition-all hover:bg-[var(--ed-accent)]"
              style={{ fontWeight: 500 }}
            >
              Get started free
              <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2} />
            </button>
          </div>

          {cols.map((c) => (
            <div key={c.title} className="md:col-span-3 md:col-start-auto">
              <p className="ed-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ed-muted)]">{c.title}</p>
              <ul className="mt-5 space-y-3">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-[14px] text-[var(--ed-ink-2)] link-under">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-[var(--ed-line)] pt-8 sm:flex-row sm:items-center">
          <p className="text-[12px] text-[var(--ed-muted)]">© {new Date().getFullYear()} PawPortal Inc.</p>
          <div className="flex items-center gap-6 text-[12px] text-[var(--ed-ink-2)]">
            <a href="#" className="link-under">Privacy</a>
            <a href="#" className="link-under">Terms</a>
            <button onClick={() => nav('/admin')} className="link-under">Admin</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default MarketingFooter;
