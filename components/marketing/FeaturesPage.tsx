import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope, HeartPulse, Camera, ShieldCheck, Gift, CalendarCheck,
  ShoppingBag, Users, Dna, ArrowUpRight,
} from 'lucide-react';
import MarketingShell from './MarketingShell';
import { Reveal } from './Reveal';
import { Eyebrow } from './Eyebrow';

const FEATURES = [
  { icon: HeartPulse, title: 'Health Hub.', desc: 'A complete health timeline, smart vaccine & medication reminders, and AI-generated care plans.' },
  { icon: Camera, title: 'PawScan AI.', desc: 'Snap a photo of a concern and get an instant AI visual triage with an urgency level.' },
  { icon: CalendarCheck, title: 'Booking & telehealth.', desc: 'Find and book vets, groomers, and sitters — in person or by video — in one place.' },
  { icon: ShieldCheck, title: 'PawTag lost & found.', desc: 'QR collar tags and a public scan-to-return page that rallies the local community.' },
  { icon: ShoppingBag, title: 'Marketplace.', desc: 'Food and essentials with fast delivery and auto-reorder for refills.' },
  { icon: Gift, title: 'Paw Points.', desc: 'Earn rewards for walks, checkups, and care — redeem for real perks.' },
  { icon: Users, title: 'Community.', desc: 'Breed meetups, local events, tips, and a feed of fellow pet parents.' },
  { icon: Dna, title: 'Genetics engine.', desc: 'Build lineage, explore breed traits, and understand your pet’s heritage.' },
  { icon: Stethoscope, title: 'Vet-on-demand.', desc: 'Home visits or telehealth consults — no more waiting rooms.' },
];

const FeaturesPage: React.FC = () => {
  const nav = useNavigate();
  return (
    <MarketingShell>
      <section className="relative pt-32 pb-16 lg:pt-40">
        <div className="dotgrid absolute inset-x-0 top-0 -z-10 h-[420px] opacity-50" aria-hidden />
        <div className="mx-auto max-w-[1240px] px-6 lg:px-10">
          <Eyebrow number="01">Features</Eyebrow>
          <Reveal as="h1" className="mt-5 max-w-3xl font-display text-[clamp(2.6rem,1.4rem+4.5vw,5rem)] leading-[0.98] tracking-tight">
            Everything your pet needs, <span className="text-[var(--ed-accent)]">connected.</span>
          </Reveal>
          <Reveal delay={120} className="mt-7 max-w-xl text-[17px] leading-relaxed text-[var(--ed-ink-2)]">
            We dismantled the fragmented pet-care industry and rebuilt it into one cohesive,
            intelligent ecosystem — from clinical care to community.
          </Reveal>
        </div>
      </section>

      <section className="pb-24 lg:pb-32">
        <div className="mx-auto max-w-[1240px] px-6 lg:px-10">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 80} className="group flex h-full flex-col rounded-2xl border border-[var(--ed-line)] bg-white p-7 transition-all hover:-translate-y-1 hover:border-[var(--ed-line-strong)] hover:shadow-[0_24px_50px_-24px_rgba(20,17,14,0.18)]">
                <span className="inline-flex size-10 items-center justify-center rounded-full bg-[var(--ed-bg-alt)] text-[var(--ed-accent)]"><f.icon className="size-[18px]" strokeWidth={1.5} /></span>
                <h3 className="mt-8 font-display text-[24px] leading-tight tracking-tight">{f.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[var(--ed-muted)]">{f.desc}</p>
              </Reveal>
            ))}
          </div>
          <div className="mt-14">
            <button onClick={() => nav('/signup')} className="group inline-flex items-center gap-2 rounded-full bg-[var(--ed-ink)] px-6 py-3.5 text-[14px] text-[var(--ed-bg)] transition-all hover:bg-[var(--ed-accent)]" style={{ fontWeight: 500 }}>
              Get started free
              <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2} />
            </button>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
};

export default FeaturesPage;
