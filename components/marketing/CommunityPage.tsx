import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, MessageCircle, Heart, MapPin, ArrowRight } from 'lucide-react';
import MarketingShell from './MarketingShell';

const EVENTS = [
  { title: 'Golden Retriever Meetup', when: 'Sat, 10:00 AM', where: 'Central Park', img: 'https://picsum.photos/id/237/400/250' },
  { title: 'Puppy Training Workshop', when: 'Sun, 2:00 PM', where: 'PawPortal HQ', img: 'https://picsum.photos/id/1025/400/250' },
  { title: 'Adoption Drive', when: 'Next Sat, 11:00 AM', where: 'Riverside Shelter', img: 'https://picsum.photos/id/1062/400/250' },
];

const STATS = [
  { icon: Users, value: '10,000+', label: 'Pet parents' },
  { icon: Calendar, value: '120+', label: 'Monthly events' },
  { icon: MessageCircle, value: '50k+', label: 'Tips shared' },
  { icon: Heart, value: '2,400', label: 'Pets reunited' },
];

const CommunityPage: React.FC = () => {
  const nav = useNavigate();
  return (
    <MarketingShell>
      <header className="max-w-4xl mx-auto px-6 pt-20 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur border border-white/60 text-rose-600 text-xs font-bold uppercase tracking-widest shadow-sm mb-6">
          <Users size={12} /> Community
        </div>
        <h1 className="text-4xl md:text-6xl font-display font-semibold text-slate-900 tracking-tight mb-4">
          A whole pack behind every pet.
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Join breed meetups and local events, swap tips with vets and fellow owners, and
          help reunite lost pets in your neighbourhood.
        </p>
      </header>

      <section className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {STATS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm text-center">
                <Icon className="mx-auto text-rose-500 mb-2" size={28} />
                <div className="text-3xl font-black text-slate-900 font-display">{s.value}</div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">{s.label}</div>
              </div>
            );
          })}
        </div>

        <h2 className="text-2xl md:text-3xl font-display font-semibold text-slate-900 mb-6">Upcoming events</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-24">
          {EVENTS.map((e) => (
            <div key={e.title} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
              <img src={e.img} alt={e.title} className="h-44 w-full object-cover" />
              <div className="p-6">
                <h3 className="text-lg font-black text-slate-900 mb-2">{e.title}</h3>
                <p className="text-sm text-slate-500 flex items-center gap-1"><Calendar size={14} /> {e.when}</p>
                <p className="text-sm text-slate-500 flex items-center gap-1 mt-1"><MapPin size={14} /> {e.where}</p>
                <button onClick={() => nav('/signup')} className="mt-4 text-sm font-bold text-teal-600 inline-flex items-center gap-1 hover:gap-2 transition-all">
                  Join event <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
};

export default CommunityPage;
