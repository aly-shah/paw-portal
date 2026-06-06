import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, PawPrint, CalendarCheck, Sparkles, ArrowRight } from 'lucide-react';
import MarketingShell from './MarketingShell';

const STEPS = [
  { icon: UserPlus, title: 'Create your account', desc: 'Sign up in seconds and tell us about yourself — owner, vet, clinic, vendor, or caregiver.' },
  { icon: PawPrint, title: 'Add your pets', desc: 'Build rich profiles with breed, health history, personality, and a PawTag for safety.' },
  { icon: CalendarCheck, title: 'Book & manage care', desc: 'Find providers, book appointments, run AI health checks, and track everything in one timeline.' },
  { icon: Sparkles, title: 'Earn & connect', desc: 'Collect Paw Points for healthy habits and join a thriving community of pet parents.' },
];

const HowItWorksPage: React.FC = () => {
  const nav = useNavigate();
  return (
    <MarketingShell>
      <header className="max-w-4xl mx-auto px-6 pt-20 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur border border-white/60 text-teal-700 text-xs font-bold uppercase tracking-widest shadow-sm mb-6">
          How it Works
        </div>
        <h1 className="text-4xl md:text-6xl font-display font-semibold text-slate-900 tracking-tight mb-4">
          From sign-up to total peace of mind.
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Getting started takes minutes. Here’s the whole journey.
        </p>
      </header>

      <section className="max-w-4xl mx-auto px-6 pb-24">
        <ol className="relative border-l-2 border-slate-200 ml-4 space-y-10">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <li key={s.title} className="ml-8">
                <span className="absolute -left-[22px] flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg ring-4 ring-slate-50">
                  <Icon size={20} />
                </span>
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-widest text-teal-600 mb-1">Step {i + 1}</p>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">{s.title}</h3>
                  <p className="text-slate-500 font-medium">{s.desc}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-16 text-center">
          <button
            onClick={() => nav('/signup')}
            className="inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/20 transform hover:-translate-y-1"
          >
            Start Now <ArrowRight size={20} />
          </button>
        </div>
      </section>
    </MarketingShell>
  );
};

export default HowItWorksPage;
