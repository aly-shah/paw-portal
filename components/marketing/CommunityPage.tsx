import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, MessageCircle, Heart, MapPin, ArrowUpRight } from 'lucide-react';
import MarketingShell from './MarketingShell';
import { Reveal } from './Reveal';
import { Eyebrow } from './Eyebrow';

const STATS = [
  { icon: Users, value: '10,000+', label: 'Pet parents' },
  { icon: Calendar, value: '120+', label: 'Monthly events' },
  { icon: MessageCircle, value: '50k+', label: 'Tips shared' },
  { icon: Heart, value: '2,400', label: 'Pets reunited' },
];

const EVENTS = [
  { title: 'Golden Retriever Meetup', when: 'Sat, 10:00 AM', where: 'Central Park', img: 'https://picsum.photos/id/237/600/360' },
  { title: 'Puppy Training Workshop', when: 'Sun, 2:00 PM', where: 'PawPortal HQ', img: 'https://picsum.photos/id/1025/600/360' },
  { title: 'Adoption Drive', when: 'Next Sat, 11:00 AM', where: 'Riverside Shelter', img: 'https://picsum.photos/id/1062/600/360' },
];

const CommunityPage: React.FC = () => {
  const nav = useNavigate();
  return (
    <MarketingShell>
      <section className="relative pt-32 pb-16 lg:pt-40">
        <div className="dotgrid absolute inset-x-0 top-0 -z-10 h-[420px] opacity-50" aria-hidden />
        <div className="mx-auto max-w-[1240px] px-6 lg:px-10">
          <Eyebrow number="03">Community</Eyebrow>
          <Reveal as="h1" className="mt-5 max-w-3xl font-display text-[clamp(2.6rem,1.4rem+4.5vw,5rem)] leading-[0.98] tracking-tight">
            A whole pack behind <span className="text-[var(--ed-accent)]">every pet.</span>
          </Reveal>
          <Reveal delay={120} className="mt-7 max-w-xl text-[17px] leading-relaxed text-[var(--ed-ink-2)]">
            Join breed meetups and local events, swap tips with vets and fellow owners, and help
            reunite lost pets in your neighbourhood.
          </Reveal>
        </div>
      </section>

      <section className="pb-8">
        <div className="mx-auto max-w-[1240px] px-6 lg:px-10">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 70} className="rounded-2xl border border-[var(--ed-line)] bg-white p-6">
                <s.icon className="text-[var(--ed-accent)]" size={22} strokeWidth={1.6} />
                <p className="mt-4 font-display text-[clamp(1.6rem,1rem+1.6vw,2.4rem)] leading-none">{s.value}</p>
                <p className="ed-mono mt-2 text-[10px] uppercase tracking-[0.16em] text-[var(--ed-muted)]">{s.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-[1240px] px-6 lg:px-10">
          <Reveal as="h2" className="font-display text-[clamp(1.8rem,1rem+2.5vw,3rem)] leading-tight tracking-tight">Upcoming events</Reveal>
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            {EVENTS.map((e, i) => (
              <Reveal key={e.title} delay={i * 80} className="group overflow-hidden rounded-2xl border border-[var(--ed-line)] bg-white transition-all hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgba(20,17,14,0.18)]">
                <img src={e.img} alt={e.title} className="h-44 w-full object-cover" />
                <div className="p-6">
                  <h3 className="font-display text-[20px] leading-tight tracking-tight">{e.title}</h3>
                  <p className="mt-3 flex items-center gap-1.5 text-[13px] text-[var(--ed-muted)]"><Calendar size={14} /> {e.when}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-[13px] text-[var(--ed-muted)]"><MapPin size={14} /> {e.where}</p>
                  <button onClick={() => nav('/signup')} className="mt-5 inline-flex items-center gap-1 text-[13px] text-[var(--ed-accent)] link-under">Join event <ArrowUpRight size={14} /></button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </MarketingShell>
  );
};

export default CommunityPage;
