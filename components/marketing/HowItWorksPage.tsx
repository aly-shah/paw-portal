import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, PawPrint, CalendarCheck, Sparkles, ArrowUpRight } from 'lucide-react';
import MarketingShell from './MarketingShell';
import { Reveal } from './Reveal';
import { Eyebrow } from './Eyebrow';

const STEPS = [
  { n: '01', icon: UserPlus, title: 'Create your account.', aside: 'Minutes', desc: 'Sign up in seconds and tell us who you are — owner, vet, clinic, vendor, or caregiver.' },
  { n: '02', icon: PawPrint, title: 'Add your pets & PawTag.', aside: 'Day one', desc: 'Build rich profiles with breed, health history, and a scan-to-return PawTag for safety.' },
  { n: '03', icon: CalendarCheck, title: 'Book care & run AI checks.', aside: 'Anytime', desc: 'Find providers, book appointments, run a PawScan, and track everything in one timeline.' },
  { n: '04', icon: Sparkles, title: 'Earn rewards & connect.', aside: 'Always', desc: 'Collect Paw Points for healthy habits and join a thriving community of pet parents.' },
];

const HowItWorksPage: React.FC = () => {
  const nav = useNavigate();
  return (
    <MarketingShell>
      <section className="relative pt-32 pb-16 lg:pt-40">
        <div className="dotgrid absolute inset-x-0 top-0 -z-10 h-[420px] opacity-50" aria-hidden />
        <div className="mx-auto max-w-[1240px] px-6 lg:px-10">
          <Eyebrow number="02">How it works</Eyebrow>
          <Reveal as="h1" className="mt-5 max-w-3xl font-display text-[clamp(2.6rem,1.4rem+4.5vw,5rem)] leading-[0.98] tracking-tight">
            From sign-up to <span className="text-[var(--ed-accent)]">total peace of mind.</span>
          </Reveal>
          <Reveal delay={120} className="mt-7 max-w-xl text-[17px] leading-relaxed text-[var(--ed-ink-2)]">
            Getting started takes minutes. Here’s the whole journey.
          </Reveal>
        </div>
      </section>

      <section className="pb-24 lg:pb-32">
        <div className="mx-auto max-w-[1240px] px-6 lg:px-10">
          <ol className="border-t border-[var(--ed-line)]">
            {STEPS.map((s, i) => (
              <Reveal as="li" key={s.n} delay={i * 80} className="grid grid-cols-1 items-start gap-4 border-b border-[var(--ed-line)] py-9 md:grid-cols-12 md:gap-8">
                <div className="flex items-center gap-4 md:col-span-5">
                  <span className="ed-mono text-[11px] uppercase tracking-widest text-[var(--ed-accent)]">{s.n}</span>
                  <span className="inline-flex size-10 items-center justify-center rounded-full bg-[var(--ed-bg-alt)] text-[var(--ed-accent)]"><s.icon className="size-[18px]" strokeWidth={1.5} /></span>
                  <h3 className="font-display text-[clamp(1.5rem,1rem+1.2vw,2.1rem)] leading-tight tracking-tight">{s.title}</h3>
                </div>
                <p className="text-[15px] leading-relaxed text-[var(--ed-muted)] md:col-span-6">{s.desc}</p>
                <span className="hidden text-[11px] uppercase tracking-[0.16em] text-[var(--ed-muted)] md:col-span-1 md:inline md:text-right">{s.aside}</span>
              </Reveal>
            ))}
          </ol>
          <div className="mt-14">
            <button onClick={() => nav('/signup')} className="group inline-flex items-center gap-2 rounded-full bg-[var(--ed-ink)] px-6 py-3.5 text-[14px] text-[var(--ed-bg)] transition-all hover:bg-[var(--ed-accent)]" style={{ fontWeight: 500 }}>
              Start now
              <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2} />
            </button>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
};

export default HowItWorksPage;
