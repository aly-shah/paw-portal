import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope, HeartPulse, Camera, ShieldAlert, Gift, CalendarCheck,
  ShoppingBag, Users, Dna, Sparkles, ArrowRight,
} from 'lucide-react';
import MarketingShell from './MarketingShell';

const FEATURES = [
  { icon: Stethoscope, color: 'teal', title: 'Vet-on-Demand', desc: 'Book home visits or telehealth consults instantly — no more waiting rooms.' },
  { icon: HeartPulse, color: 'rose', title: 'Health Hub', desc: 'A complete health timeline, smart vaccine & medication reminders, and AI care plans.' },
  { icon: Camera, color: 'purple', title: 'PawScan AI', desc: 'Snap a photo of a concern and get an instant AI visual triage with urgency level.' },
  { icon: ShieldAlert, color: 'amber', title: 'PawTag Lost & Found', desc: 'QR collar tags and a public scan-to-return page that rallies the local community.' },
  { icon: CalendarCheck, color: 'blue', title: 'Unified Booking', desc: 'Find and book vets, groomers, and sitters — in person or by video — in one place.' },
  { icon: ShoppingBag, color: 'emerald', title: 'Marketplace', desc: '1-hour delivery for food and essentials, with auto-reorder for refills.' },
  { icon: Gift, color: 'indigo', title: 'Paw Points', desc: 'Earn rewards for walks, checkups, and care — redeem for real perks.' },
  { icon: Users, color: 'rose', title: 'Community', desc: 'Breed meetups, local events, tips, and a thriving feed of fellow pet parents.' },
  { icon: Dna, color: 'teal', title: 'Genetics Engine', desc: 'Build lineage, explore breed traits, and understand your pet’s heritage.' },
];

const FeaturesPage: React.FC = () => {
  const nav = useNavigate();
  return (
    <MarketingShell>
      <header className="max-w-4xl mx-auto px-6 pt-20 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur border border-white/60 text-teal-700 text-xs font-bold uppercase tracking-widest shadow-sm mb-6">
          <Sparkles size={12} className="fill-current" /> Features
        </div>
        <h1 className="text-4xl md:text-6xl font-display font-semibold text-slate-900 tracking-tight mb-4">
          Everything your pet needs, connected.
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          We dismantled the fragmented pet-care industry and rebuilt it into one cohesive,
          intelligent ecosystem — from clinical care to community.
        </p>
      </header>

      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-${f.color}-50 text-${f.color}-600`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-500 font-medium">{f.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <button
            onClick={() => nav('/signup')}
            className="inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/20 transform hover:-translate-y-1"
          >
            Get Started Free <ArrowRight size={20} />
          </button>
        </div>
      </section>
    </MarketingShell>
  );
};

export default FeaturesPage;
