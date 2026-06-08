import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpRight, PlayCircle, PawPrint, Stethoscope, ShoppingBag, Users,
  HeartPulse, Camera, ShieldCheck, CalendarCheck, Gift, Bell, Quote,
  Plus, Minus, CheckCircle, Activity, Cross, Sparkles, Syringe, Dna, Scissors,
} from 'lucide-react';
import MarketingShell from './marketing/MarketingShell';
import { Reveal } from './marketing/Reveal';
import { Eyebrow } from './marketing/Eyebrow';

const H2 = 'font-display text-[clamp(2rem,1rem+3.5vw,3.6rem)] leading-[1.02] tracking-tight';

/* ----------------------------------- Hero ----------------------------------- */
const Hero: React.FC<{ nav: (p: string) => void }> = ({ nav }) => (
  <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 lg:pt-40 lg:pb-24">
    <div className="dotgrid absolute inset-x-0 top-0 -z-10 h-[560px] opacity-50" aria-hidden />
    <div className="mx-auto max-w-[1240px] px-6 lg:px-10">
      <div className="grid grid-cols-1 items-end gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Reveal className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--ed-line)] bg-white/70 px-3 py-1.5 text-[11.5px] text-[var(--ed-muted)]">
            <Sparkles className="size-3 text-[var(--ed-accent)]" /> The super-app for pets
          </Reveal>
          <Reveal as="h1" className="font-display text-[clamp(2.8rem,1.5rem+5.5vw,6rem)] leading-[0.95] tracking-tight">
            Less worry.{' '}
            <span className="text-[var(--ed-accent)]">More tail wags.</span>{' '}
            <span className="text-[var(--ed-muted)]">Healthier pets.</span>
          </Reveal>
          <Reveal delay={120} className="mt-8 max-w-xl text-[17px] leading-relaxed text-[var(--ed-ink-2)]">
            Vets, groomers, sitters, a marketplace, AI health checks, and a thriving community —
            every part of caring for your pet, organised in one calm place.
          </Reveal>
          <Reveal delay={200} className="mt-9 flex flex-wrap items-center gap-3">
            <button onClick={() => nav('/signup')} className="group inline-flex items-center gap-2 rounded-full bg-[var(--ed-ink)] px-5 py-3 text-[14px] text-[var(--ed-bg)] transition-all hover:bg-[var(--ed-accent)]" style={{ fontWeight: 500 }}>
              Get started free
              <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2} />
            </button>
            <button onClick={() => nav('/how-it-works')} className="group inline-flex items-center gap-2 rounded-full border border-[var(--ed-line-strong)] bg-white px-5 py-3 text-[14px] text-[var(--ed-ink)] transition-all hover:border-[var(--ed-ink)]" style={{ fontWeight: 500 }}>
              <PlayCircle className="size-4" strokeWidth={1.6} /> See how it works
            </button>
          </Reveal>
          <Reveal delay={280} className="mt-10 flex items-center gap-4">
            <div className="flex -space-x-3">
              {[101, 102, 103, 104].map((i) => (
                <img key={i} src={`https://picsum.photos/id/${i}/100/100`} alt="" className="size-9 rounded-full border-2 border-[var(--ed-bg)] object-cover" />
              ))}
            </div>
            <p className="text-[13px] text-[var(--ed-muted)]">Joined by <span className="text-[var(--ed-ink)]">10,000+</span> pet parents</p>
          </Reveal>
        </div>

        <div className="lg:col-span-5">
          <Reveal delay={160}>
            <HeroPreview />
          </Reveal>
        </div>
      </div>
    </div>
  </section>
);

const HeroPreview: React.FC = () => {
  const bars = [40, 58, 50, 72, 64, 88, 80];
  return (
    <div className="relative">
      <div className="overflow-hidden rounded-3xl border border-[var(--ed-line)] bg-[var(--ed-surface)] shadow-[0_30px_70px_-30px_rgba(20,17,14,0.3)]">
        <img src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=900&q=80" alt="A happy dog" className="h-44 w-full object-cover" />
        <div className="p-5">
          <div className="flex items-center gap-3">
            <img src="https://picsum.photos/id/237/100/100" alt="Barnaby" className="size-11 rounded-xl object-cover" />
            <div className="flex-1">
              <p className="text-[15px]" style={{ fontWeight: 600 }}>Barnaby</p>
              <p className="text-[12px] text-[var(--ed-muted)]">Golden Retriever · 3 yrs</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--ed-accent-soft)] px-2.5 py-1 text-[11px] text-[var(--ed-accent-ink)]">
              <CheckCircle className="size-3" /> Healthy
            </span>
          </div>
          <div className="mt-5 flex items-end gap-1.5">
            {bars.map((b, i) => (
              <span key={i} className="w-3.5 rounded-sm" style={{ height: `${b * 0.5}px`, background: i === bars.length - 1 ? 'var(--ed-accent)' : 'var(--ed-line-strong)' }} />
            ))}
            <div className="ml-3">
              <p className="font-display text-lg leading-none">86%</p>
              <p className="text-[10.5px] text-[var(--ed-muted)]">wellness</p>
            </div>
          </div>
        </div>
      </div>
      {/* Floating reminder card */}
      <div className="absolute -bottom-7 -right-4 hidden w-[210px] rounded-2xl border border-[var(--ed-line)] bg-white/95 p-4 shadow-xl backdrop-blur lg:block">
        <div className="mb-2 flex items-center gap-2">
          <span className="inline-flex size-7 items-center justify-center rounded-lg bg-[var(--ed-accent-soft)] text-[var(--ed-accent)]"><Bell className="size-3.5" /></span>
          <p className="ed-mono text-[10px] uppercase tracking-widest text-[var(--ed-muted)]">Next up</p>
        </div>
        <p className="text-[13px] leading-tight text-[var(--ed-ink)]">Vaccination with Dr. Sarah — 2:00 PM</p>
      </div>
    </div>
  );
};

/* --------------------------------- Marquee --------------------------------- */
const TRUST = [
  { name: 'Cedar Vet Clinic', icon: Stethoscope },
  { name: 'Northside Animal Hospital', icon: Cross },
  { name: 'PawSpa Grooming', icon: Scissors },
  { name: 'Pulse Pet Care', icon: HeartPulse },
  { name: 'Greenleaf Veterinary', icon: Activity },
  { name: 'NutriPet', icon: ShoppingBag },
  { name: 'Lumière Pet Derma', icon: Syringe },
];
const Marquee: React.FC = () => {
  const loop = [...TRUST, ...TRUST];
  return (
    <section aria-label="Trusted by" className="border-y border-[var(--ed-line)] bg-[var(--ed-bg-alt)] py-6">
      <div className="mx-auto mb-4 flex max-w-[1240px] items-center justify-between px-6 lg:px-10">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--ed-muted)]">Quietly caring for 10,000+ pets</p>
        <p className="ed-mono hidden text-[10.5px] uppercase tracking-widest text-[var(--ed-muted)] sm:block">A · B · C · D</p>
      </div>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-[linear-gradient(to_right,var(--ed-bg-alt),transparent)]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-[linear-gradient(to_left,var(--ed-bg-alt),transparent)]" />
        <div className="marquee-track flex w-max items-center gap-12 pr-12">
          {loop.map((it, i) => (
            <div key={i} className="flex items-center gap-2 text-[var(--ed-ink-2)]">
              <it.icon className="size-4 text-[var(--ed-muted)]" strokeWidth={1.5} />
              <span className="whitespace-nowrap font-display text-[20px] tracking-tight">{it.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ------------------------------- Who it's for ------------------------------- */
const AUDIENCES = [
  { tag: 'Owners', icon: PawPrint, title: 'For pet parents.', points: ['Health records & reminders', 'Book vets, groomers, sitters', 'Shop, scan & earn rewards'] },
  { tag: 'Clinics', icon: Stethoscope, title: 'For vets & clinics.', points: ['Patient files & schedule', 'AI clinical toolkit', 'Billing & analytics'] },
  { tag: 'Partners', icon: ShoppingBag, title: 'For vendors & carers.', points: ['Inventory & orders', 'Find jobs & walks', 'Reviews & payouts'] },
];
const WhoItsFor: React.FC = () => (
  <section className="relative py-24 lg:py-32">
    <div className="mx-auto max-w-[1240px] px-6 lg:px-10">
      <Eyebrow number="01">Who it’s for</Eyebrow>
      <Reveal as="h2" className={`mt-5 ${H2}`}>Built for everyone who loves a pet.</Reveal>
      <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
        {AUDIENCES.map((a, i) => (
          <Reveal key={a.title} delay={i * 80} className="group flex h-full flex-col rounded-2xl border border-[var(--ed-line)] bg-white p-6 transition-all hover:-translate-y-1 hover:border-[var(--ed-line-strong)] hover:shadow-[0_24px_50px_-24px_rgba(20,17,14,0.18)]">
            <div className="flex items-center justify-between">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-[var(--ed-bg-alt)] text-[var(--ed-accent)]"><a.icon className="size-[18px]" strokeWidth={1.5} /></span>
              <span className="ed-mono text-[10px] uppercase tracking-widest text-[var(--ed-muted)]">0{i + 1}</span>
            </div>
            <h3 className="mt-6 font-display text-[28px] leading-tight tracking-tight">{a.title}</h3>
            <ul className="mt-5 space-y-1.5">
              {a.points.map((p) => (
                <li key={p} className="flex items-center gap-2 text-[13px] text-[var(--ed-ink-2)]"><span className="size-1.5 rounded-full bg-[var(--ed-accent)]" />{p}</li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

/* --------------------------------- Features --------------------------------- */
const Tile: React.FC<{ icon: React.ElementType; title: string; desc?: string; dark?: boolean; titleClass?: string; children?: React.ReactNode }> = ({ icon: Icon, title, desc, dark, titleClass = 'text-[22px]', children }) => (
  <div className={`relative flex h-full flex-col overflow-hidden rounded-2xl p-7 lg:p-8 ${dark ? 'bg-[var(--ed-ink)] text-[var(--ed-bg)]' : 'border border-[var(--ed-line)] bg-white'}`}>
    <span className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full ${dark ? 'bg-white/10 text-[var(--ed-bg)]' : 'bg-[var(--ed-bg-alt)] text-[var(--ed-accent)]'}`}><Icon className="size-[18px]" strokeWidth={1.5} /></span>
    {children}
    <h4 className={`mt-auto pt-10 font-display leading-tight tracking-tight ${titleClass}`}>{title}</h4>
    {desc && <p className={`mt-2 text-[13.5px] leading-snug ${dark ? 'text-[var(--ed-bg)]/65' : 'text-[var(--ed-muted)]'}`}>{desc}</p>}
  </div>
);
const Features: React.FC = () => (
  <section id="features" className="relative bg-[var(--ed-bg-alt)] py-24 lg:py-32">
    <div className="grain pointer-events-none absolute inset-0" aria-hidden />
    <div className="relative mx-auto max-w-[1240px] px-6 lg:px-10">
      <Eyebrow number="02">What you get</Eyebrow>
      <Reveal as="h2" className={`mt-5 ${H2}`}>One app. Your pet’s whole world.</Reveal>
      <div className="mt-14 grid grid-cols-12 gap-3">
        <Reveal className="col-span-12 md:col-span-8"><Tile icon={HeartPulse} title="One timeline. Every record." desc="Vaccines, meds, weight, visits — plus smart reminders and AI care plans." titleClass="text-[clamp(1.8rem,1rem+1.8vw,2.6rem)]" /></Reveal>
        <Reveal delay={80} className="col-span-12 md:col-span-4">
          <Tile icon={Camera} title="PawScan AI." desc="Photo-based health triage in seconds." dark>
            <div className="mt-5 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-[10.5px] text-[var(--ed-accent-soft)]"><Sparkles className="size-3" /> Gemini</span>
            </div>
          </Tile>
        </Reveal>
        <Reveal delay={120} className="col-span-12 md:col-span-4"><Tile icon={CalendarCheck} title="Booking & telehealth." desc="Vets, groomers, sitters — in person or video." /></Reveal>
        <Reveal delay={180} className="col-span-12 md:col-span-4"><Tile icon={ShieldCheck} title="PawTag lost & found." desc="Scan-to-return tags that rally the community." /></Reveal>
        <Reveal delay={240} className="col-span-12 md:col-span-4"><Tile icon={ShoppingBag} title="Marketplace." desc="Food & essentials, with auto-reorder." /></Reveal>
        <Reveal delay={300} className="col-span-12 md:col-span-6"><Tile icon={Gift} title="Paw Points rewards." desc="Earn for walks, checkups & care. Redeem for real perks." /></Reveal>
        <Reveal delay={340} className="col-span-12 md:col-span-6"><Tile icon={Dna} title="Genetics & heritage." desc="Build lineage and understand your pet’s breed traits." /></Reveal>
      </div>
    </div>
  </section>
);

/* ------------------------------- How it works ------------------------------- */
const STEPS = [
  { n: '01', title: 'Create your account.', aside: 'Minutes' },
  { n: '02', title: 'Add your pets & PawTag.', aside: 'Day one' },
  { n: '03', title: 'Book care & run AI checks.', aside: 'Anytime' },
  { n: '04', title: 'Earn rewards & connect.', aside: 'Always' },
];
const HowItWorks: React.FC = () => (
  <section className="relative py-24 lg:py-32">
    <div className="mx-auto max-w-[1240px] px-6 lg:px-10">
      <Eyebrow number="03">How it works</Eyebrow>
      <Reveal as="h2" className={`mt-5 ${H2}`}>Set up in minutes.</Reveal>
      <ol className="mt-14 grid grid-cols-1 md:grid-cols-2">
        {STEPS.map((s, i) => (
          <Reveal as="li" key={s.n} delay={i * 80} className={`flex items-center justify-between gap-6 border-[var(--ed-line)] py-7 md:py-9 ${i % 2 === 0 ? 'md:border-r md:pr-10' : 'md:pl-10'} ${i < 2 ? 'border-b' : ''}`}>
            <div className="flex items-baseline gap-5">
              <span className="ed-mono text-[11px] uppercase tracking-widest text-[var(--ed-accent)]">{s.n}</span>
              <h3 className="font-display text-[clamp(1.5rem,1rem+1.2vw,2rem)] leading-tight tracking-tight">{s.title}</h3>
            </div>
            <span className="hidden text-[11px] uppercase tracking-[0.16em] text-[var(--ed-muted)] md:inline">{s.aside}</span>
          </Reveal>
        ))}
      </ol>
    </div>
  </section>
);

/* ----------------------------------- Why ----------------------------------- */
const Why: React.FC = () => (
  <section className="relative bg-[var(--ed-ink)] py-24 text-[var(--ed-bg)] lg:py-32">
    <div className="grain pointer-events-none absolute inset-0 opacity-50" aria-hidden />
    <div className="relative mx-auto max-w-[1240px] px-6 lg:px-10">
      <div className="grid grid-cols-1 gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Eyebrow number="04" tone="light">Why PawPortal</Eyebrow>
          <Reveal as="h2" className={`mt-5 ${H2}`}>Built by people who love their pets too.</Reveal>
          <Reveal delay={200} className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-white/15 pt-8">
            {[['10k+', 'Pet parents'], ['500+', 'Vet specialists'], ['2,400', 'Pets reunited'], ['24/7', 'AI + human help']].map(([v, l]) => (
              <div key={l}>
                <p className="font-display text-[clamp(1.8rem,1rem+2vw,2.6rem)] leading-none">{v}</p>
                <p className="mt-2 text-[12.5px] leading-snug text-[var(--ed-bg)]/70">{l}</p>
              </div>
            ))}
          </Reveal>
        </div>
        <Reveal delay={160} className="lg:col-span-7">
          <figure className="relative flex h-full flex-col justify-center rounded-2xl border border-white/10 bg-white/[0.04] p-8 lg:p-12">
            <Quote className="absolute -top-3 left-8 size-7 rotate-180 text-[var(--ed-accent-soft)]" strokeWidth={1.4} />
            <blockquote className="font-display text-[clamp(1.6rem,1rem+1.8vw,2.6rem)] leading-tight tracking-tight">
              “PawScan flagged Barnaby’s ear before it got bad. We booked a vet that afternoon — all from one app.”
            </blockquote>
            <figcaption className="mt-8 flex items-center gap-4 border-t border-white/15 pt-6">
              <div className="flex size-11 items-center justify-center rounded-full bg-[var(--ed-accent-soft)] text-[var(--ed-accent-ink)] text-sm">JD</div>
              <div>
                <p className="text-[14px]">Jane D.</p>
                <p className="text-[12px] text-[var(--ed-bg)]/60">Golden Retriever mum</p>
              </div>
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </div>
  </section>
);

/* ----------------------------------- FAQ ----------------------------------- */
const FAQS = [
  { q: 'Is PawPortal free to start?', a: 'Yes. Create an account, add your pets, and use the core tools free. Pay only for bookings and marketplace orders.' },
  { q: 'How does PawScan work?', a: 'Snap a photo of a concern — a rash, a limp, an eye — and our AI returns an instant visual triage with an urgency level and a one-tap path to book a vet.' },
  { q: 'What is a PawTag?', a: 'A QR tag for your pet’s collar. Anyone who finds your pet scans it to reach you privately — your personal details are never exposed.' },
  { q: 'Can my vet or clinic use it too?', a: 'Absolutely. Vets, clinics, vendors, and caregivers each get their own dashboard with the tools they need.' },
  { q: 'Is my pet’s data safe?', a: 'Encrypted everywhere, and you control what’s public. Your contact details stay private by default.' },
];
const Faq: React.FC = () => {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-[1240px] px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Eyebrow number="05">Questions</Eyebrow>
            <Reveal as="h2" className="mt-5 font-display text-[clamp(2rem,1rem+3vw,3.2rem)] leading-[1.02] tracking-tight">Asked often.</Reveal>
          </div>
          <div className="lg:col-span-8">
            <ul className="border-t border-[var(--ed-line)]">
              {FAQS.map((it, i) => {
                const isOpen = open === i;
                return (
                  <li key={i} className="border-b border-[var(--ed-line)]">
                    <button type="button" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} className="flex w-full items-start justify-between gap-6 py-6 text-left">
                      <span className="flex items-center gap-5">
                        <span className="ed-mono text-[10.5px] uppercase tracking-widest text-[var(--ed-muted)]">0{i + 1}</span>
                        <span className="font-display text-[clamp(1.25rem,0.8rem+0.8vw,1.6rem)] leading-tight tracking-tight">{it.q}</span>
                      </span>
                      <span className="mt-1 inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-[var(--ed-line-strong)] text-[var(--ed-ink)]">
                        {isOpen ? <Minus className="size-3.5" strokeWidth={1.5} /> : <Plus className="size-3.5" strokeWidth={1.5} />}
                      </span>
                    </button>
                    <div className="grid transition-all duration-500 ease-out" style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}>
                      <div className="overflow-hidden">
                        <p className="pb-7 pl-11 pr-12 text-[15px] leading-relaxed text-[var(--ed-ink-2)]">{it.a}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ----------------------------------- CTA ----------------------------------- */
const Cta: React.FC<{ nav: (p: string) => void }> = ({ nav }) => (
  <section className="relative bg-[var(--ed-bg-alt)]">
    <div className="grain pointer-events-none absolute inset-0" aria-hidden />
    <div className="relative mx-auto max-w-[1240px] px-6 py-24 lg:px-10 lg:py-32">
      <Reveal as="h2" className="font-display text-[clamp(2.6rem,1.2rem+5.5vw,5.8rem)] leading-[0.98] tracking-tight">
        Give your pet{' '}
        <span className="italic text-[var(--ed-accent)]">the care they deserve</span>.
      </Reveal>
      <Reveal delay={180} className="mt-12 flex flex-wrap items-center gap-3">
        <button onClick={() => nav('/signup')} className="group inline-flex items-center gap-2 rounded-full bg-[var(--ed-ink)] px-6 py-3.5 text-[14px] text-[var(--ed-bg)] transition-all hover:bg-[var(--ed-accent)]" style={{ fontWeight: 500 }}>
          Get started free
          <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2} />
        </button>
        <button onClick={() => nav('/features')} className="text-[14px] text-[var(--ed-ink-2)] link-under">Explore features</button>
      </Reveal>
    </div>
  </section>
);

/* --------------------------------- Landing --------------------------------- */
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const nav = (p: string) => navigate(p);
  return (
    <MarketingShell>
      <Hero nav={nav} />
      <Marquee />
      <WhoItsFor />
      <Features />
      <HowItWorks />
      <Why />
      <Faq />
      <Cta nav={nav} />
    </MarketingShell>
  );
};

export default LandingPage;
