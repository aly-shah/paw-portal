import React, { createContext, useContext, useMemo, useState, useEffect, useCallback, useRef } from 'react';
import {
  Pet, HealthRecord, Reminder, CarePlan, PetSafetyStatus, FoundReport,
  AvailabilitySlot, Appointment, PawPointsEntry, PawBadge, Reward, PointReason,
} from '../types';
import { MOCK_PETS } from '../constants';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

// Helpers — relative ISO dates so seeded data always looks "current".
const dayMs = 86_400_000;
const inDays = (n: number) => new Date(Date.now() + n * dayMs).toISOString();
const ago = (n: number) => new Date(Date.now() - n * dayMs).toISOString();
// Local calendar day key (YYYY-MM-DD) for the daily login streak.
const dateKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
let seq = 1000;
const id = () => `gen-${++seq}-${Date.now().toString(36)}`;

// Default starter data, seeded once for brand-new accounts so the dashboard isn't empty.
const seedPets = (): Pet[] => MOCK_PETS.filter((p) => p.id === 'p1' || p.id === 'p2');

const seedRecords = (): HealthRecord[] => [
  { id: id(), petId: 'p1', type: 'VACCINE', title: 'Rabies booster', date: ago(120), vetName: 'Dr. Sarah Lee' },
  { id: id(), petId: 'p1', type: 'VISIT', title: 'Annual wellness exam', date: ago(120), notes: 'Healthy. Slight tartar buildup noted.', vetName: 'Dr. Sarah Lee' },
  { id: id(), petId: 'p1', type: 'WEIGHT', title: 'Weight recorded: 28 kg', date: ago(40) },
  { id: id(), petId: 'p2', type: 'VACCINE', title: 'FVRCP vaccine', date: ago(200), vetName: 'Dr. Omar' },
];

const seedReminders = (): Reminder[] => [
  { id: id(), petId: 'p1', title: 'Heartworm prevention', category: 'MEDICATION', dueDate: inDays(3), recurrence: 'MONTHLY', relatedProductId: 'prod-hw', done: false },
  { id: id(), petId: 'p1', title: 'Rabies booster due', category: 'VACCINE', dueDate: inDays(20), recurrence: 'YEARLY', done: false },
  { id: id(), petId: 'p2', title: 'Annual checkup', category: 'CHECKUP', dueDate: ago(2), recurrence: 'YEARLY', done: false },
  { id: id(), petId: 'p1', title: 'Grooming appointment', category: 'GROOMING', dueDate: inDays(8), recurrence: 'NONE', done: false },
];

const seedSlots = (): AvailabilitySlot[] => [
  { id: 's1', providerId: 'v1', providerName: 'Dr. Sarah Lee', providerImage: 'https://picsum.photos/id/64/100/100', serviceType: 'VET_HOME' as any, start: inDays(1), durationMin: 30, priceCents: 450000, mode: 'IN_PERSON', isBooked: false },
  { id: 's2', providerId: 'v1', providerName: 'Dr. Sarah Lee', providerImage: 'https://picsum.photos/id/64/100/100', serviceType: 'VET_HOME' as any, start: inDays(1), durationMin: 30, priceCents: 300000, mode: 'TELEHEALTH', isBooked: false },
  { id: 's3', providerId: 'c1', providerName: 'PawCare Clinic', providerImage: 'https://picsum.photos/id/1062/100/100', serviceType: 'CLINIC' as any, start: inDays(2), durationMin: 45, priceCents: 600000, mode: 'IN_PERSON', isBooked: false },
  { id: 's4', providerId: 'w1', providerName: 'Max (Dog Walker)', providerImage: 'https://picsum.photos/id/1025/100/100', serviceType: 'WALKER' as any, start: inDays(1), durationMin: 60, priceCents: 150000, mode: 'IN_PERSON', isBooked: false },
];

const seedBadges = (): PawBadge[] => [
  { id: 'b1', name: 'First Steps', icon: '🐾', description: 'Logged your first walk', earned: true },
  { id: 'b2', name: 'Streak Starter', icon: '🔥', description: '3-day care streak', earned: true },
  { id: 'b3', name: 'Health Hero', icon: '🩺', description: 'Completed a full care plan', earned: false },
  { id: 'b4', name: 'Marathon Pup', icon: '🏅', description: 'Walked 50 km total', earned: false },
  { id: 'b5', name: 'Good Neighbour', icon: '🤝', description: 'Helped reunite a lost pet', earned: false },
];

const seedLedger = (): PawPointsEntry[] => [
  { id: id(), delta: 50, reason: 'WALK', label: 'Morning walk with Barnaby', timestamp: ago(1) },
  { id: id(), delta: 25, reason: 'REMINDER', label: 'Completed: flea treatment', timestamp: ago(2) },
  { id: id(), delta: 100, reason: 'APPOINTMENT', label: 'Attended vet checkup', timestamp: ago(5) },
];

interface ProfileMeta { id: 'me'; pawPoints: number; streak: number; seeded: boolean; lastActiveDate?: string }

interface PawDataValue {
  myPets: Pet[];
  addPet: (pet: Pet) => void;
  updatePet: (pet: Pet) => void;
  deletePet: (petId: string) => void;
  // Health
  healthRecords: HealthRecord[];
  reminders: Reminder[];
  addHealthRecord: (r: Omit<HealthRecord, 'id'>) => void;
  addReminder: (r: Omit<Reminder, 'id' | 'done'>) => void;
  completeReminder: (id: string) => void;
  applyCarePlan: (petId: string, plan: CarePlan) => void;
  // Safety
  safety: Record<string, PetSafetyStatus>;
  foundReports: FoundReport[];
  markLost: (petId: string, info: Partial<PetSafetyStatus>) => void;
  markSafe: (petId: string) => void;
  addFoundReport: (r: Omit<FoundReport, 'id' | 'timestamp'>) => void;
  getPetById: (petId: string) => Pet | undefined;
  // Booking
  slots: AvailabilitySlot[];
  appointments: Appointment[];
  book: (slot: AvailabilitySlot, petId: string, reason: string) => void;
  cancelAppointment: (id: string) => void;
  // Rewards
  pawPoints: number;
  streak: number;
  ledger: PawPointsEntry[];
  badges: PawBadge[];
  earnPoints: (reason: PointReason, label: string, delta: number) => void;
  redeemReward: (reward: Reward) => boolean;
}

const PawDataContext = createContext<PawDataValue | null>(null);

export const usePawData = (): PawDataValue => {
  const ctx = useContext(PawDataContext);
  if (!ctx) throw new Error('usePawData must be used within PawDataProvider');
  return ctx;
};

// Collection names in the API (all user-scoped).
const C = {
  pets: 'pets', records: 'healthRecords', reminders: 'reminders', safety: 'safety',
  found: 'foundReports', slots: 'slots', appts: 'appointments', ledger: 'ledger',
  badges: 'badges', profile: 'profile',
} as const;

// Fire-and-forget persistence helpers (optimistic UI; writes happen in the background).
const pCreate = (c: string, item: any) => { api.create('user', c, item).catch(() => {}); };
const pUpdate = (c: string, itemId: string, item: any) => { api.update('user', c, itemId, item).catch(() => {}); };
const pRemove = (c: string, itemId: string) => { api.remove('user', c, itemId).catch(() => {}); };

export const PawDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [myPets, setMyPets] = useState<Pet[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [safety, setSafety] = useState<Record<string, PetSafetyStatus>>({});
  const [foundReports, setFoundReports] = useState<FoundReport[]>([]);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pawPoints, setPawPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [ledger, setLedger] = useState<PawPointsEntry[]>([]);
  const [badges, setBadges] = useState<PawBadge[]>([]);
  // Last calendar day the user was active — drives the consecutive-day streak.
  const lastActiveRef = useRef<string>('');

  // Load everything for the signed-in user; seed defaults once for new accounts.
  useEffect(() => {
    if (!user) {
      // Signed out — clear in-memory data.
      setMyPets([]); setHealthRecords([]); setReminders([]); setSafety({});
      setFoundReports([]); setSlots([]); setAppointments([]); setPawPoints(0);
      setStreak(0); setLedger([]); setBadges([]);
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        const [pets, records, rems, saf, found, slts, appts, ldgr, bdgs, profiles] = await Promise.all([
          api.list<Pet>('user', C.pets),
          api.list<HealthRecord>('user', C.records),
          api.list<Reminder>('user', C.reminders),
          api.list<PetSafetyStatus & { id: string }>('user', C.safety),
          api.list<FoundReport>('user', C.found),
          api.list<AvailabilitySlot>('user', C.slots),
          api.list<Appointment>('user', C.appts),
          api.list<PawPointsEntry>('user', C.ledger),
          api.list<PawBadge>('user', C.badges),
          api.list<ProfileMeta>('user', C.profile),
        ]);
        if (cancelled) return;

        const today = dateKey(new Date());
        const yesterday = dateKey(new Date(Date.now() - dayMs));
        lastActiveRef.current = today;

        const profile = profiles[0];
        // Seed ONLY for a genuinely empty account. We must NOT rely solely on the
        // profile flag: if that one write was ever lost, re-seeding would clobber the
        // user's real data (e.g. a just-added pet) with the defaults. As long as ANY
        // user data exists, treat it as an existing account and load from the API.
        const isEmptyAccount =
          profiles.length === 0 && pets.length === 0 && records.length === 0 &&
          rems.length === 0 && appts.length === 0 && ldgr.length === 0 && bdgs.length === 0;

        if (isEmptyAccount) {
          // First login for this account — seed starter data into the DB.
          const sPets = seedPets(), sRecords = seedRecords(), sReminders = seedReminders();
          const sSlots = seedSlots(), sBadges = seedBadges(), sLedger = seedLedger();
          const meta: ProfileMeta = { id: 'me', pawPoints: 2450, streak: 1, seeded: true, lastActiveDate: today };

          sPets.forEach((p) => pCreate(C.pets, p));
          sRecords.forEach((r) => pCreate(C.records, r));
          sReminders.forEach((r) => pCreate(C.reminders, r));
          sSlots.forEach((s) => pCreate(C.slots, s));
          sBadges.forEach((b) => pCreate(C.badges, b));
          sLedger.forEach((l) => pCreate(C.ledger, l));
          pCreate(C.profile, meta);

          setMyPets(sPets); setHealthRecords(sRecords); setReminders(sReminders);
          setSlots(sSlots); setBadges(sBadges); setLedger(sLedger);
          setPawPoints(meta.pawPoints); setStreak(meta.streak);
          setAppointments([]); setFoundReports([]); setSafety({});
        } else {
          // Existing account — always load real data from the API.
          setMyPets(pets); setHealthRecords(records); setReminders(rems);
          setFoundReports(found); setSlots(slts); setAppointments(appts);
          setLedger(ldgr); setBadges(bdgs);
          setPawPoints(profile?.pawPoints ?? 0);

          // Daily streak: same day -> unchanged; consecutive day -> +1; gap -> reset to 1.
          const prevStreak = profile?.streak ?? 0;
          const last = profile?.lastActiveDate;
          let newStreak: number;
          if (last === today) newStreak = Math.max(1, prevStreak);
          else if (last === yesterday) newStreak = prevStreak + 1;
          else newStreak = 1;
          setStreak(newStreak);

          // Persist the streak; also self-heals a missing profile so future loads are stable.
          // pCreate upserts (POST), so it works whether or not the profile row exists.
          if (!profile || last !== today) {
            pCreate(C.profile, {
              id: 'me', seeded: true,
              pawPoints: profile?.pawPoints ?? 0,
              streak: newStreak, lastActiveDate: today,
            });
          }

          const safetyMap: Record<string, PetSafetyStatus> = {};
          saf.forEach((s) => { safetyMap[s.petId] = s; });
          setSafety(safetyMap);
        }
      } catch {
        // Network/API error — leave whatever we have; UI still renders.
      }
    })();

    return () => { cancelled = true; };
  }, [user]);

  const persistProfile = useCallback((points: number, strk: number) => {
    const meta: ProfileMeta = {
      id: 'me', pawPoints: points, streak: strk, seeded: true,
      lastActiveDate: lastActiveRef.current || undefined,
    };
    pCreate(C.profile, meta); // upsert, so it works even if the profile row is missing
  }, []);

  const getPetById = useCallback(
    (petId: string) => myPets.find((p) => p.id === petId) || MOCK_PETS.find((p) => p.id === petId),
    [myPets],
  );

  // --- Pets ---
  const addPet = useCallback((pet: Pet) => {
    setMyPets((ps) => [pet, ...ps.filter((p) => p.id !== pet.id)]);
    pCreate(C.pets, pet);
  }, []);

  const updatePet = useCallback((pet: Pet) => {
    setMyPets((ps) => ps.map((p) => (p.id === pet.id ? pet : p)));
    pUpdate(C.pets, pet.id, pet);
  }, []);

  const deletePet = useCallback((petId: string) => {
    setMyPets((ps) => ps.filter((p) => p.id !== petId));
    pRemove(C.pets, petId);
  }, []);

  // --- Rewards ---
  const earnPoints = useCallback((reason: PointReason, label: string, delta: number) => {
    setPawPoints((p) => {
      const next = Math.max(0, p + delta);
      persistProfile(next, streak);
      return next;
    });
    const entry: PawPointsEntry = { id: id(), delta, reason, label, timestamp: new Date().toISOString() };
    setLedger((l) => [entry, ...l]);
    pCreate(C.ledger, entry);
  }, [streak, persistProfile]);

  // --- Health ---
  const addHealthRecord = useCallback((r: Omit<HealthRecord, 'id'>) => {
    const rec = { ...r, id: id() } as HealthRecord;
    setHealthRecords((rs) => [rec, ...rs]);
    pCreate(C.records, rec);
  }, []);

  const addReminder = useCallback((r: Omit<Reminder, 'id' | 'done'>) => {
    const rem = { ...r, id: id(), done: false } as Reminder;
    setReminders((rs) => [...rs, rem]);
    pCreate(C.reminders, rem);
  }, []);

  const completeReminder = useCallback((rid: string) => {
    setReminders((rs) => rs.map((r) => {
      if (r.id !== rid) return r;
      const updated = { ...r, done: true };
      pUpdate(C.reminders, rid, updated);
      return updated;
    }));
    earnPoints('REMINDER', 'Completed a care reminder', 25);
  }, [earnPoints]);

  const applyCarePlan = useCallback((petId: string, plan: CarePlan) => {
    const newReminders: Reminder[] = plan.tasks.map((t) => ({
      id: id(),
      petId,
      title: t.title,
      category: (['VACCINE', 'MEDICATION', 'CHECKUP', 'GROOMING'].includes(t.category) ? t.category : 'OTHER') as Reminder['category'],
      dueDate: inDays(t.dueInDays),
      recurrence: 'NONE',
      done: false,
    }));
    setReminders((rs) => [...rs, ...newReminders]);
    newReminders.forEach((r) => pCreate(C.reminders, r));
  }, []);

  // --- Safety ---
  const markLost = useCallback((petId: string, info: Partial<PetSafetyStatus>) => {
    const status: PetSafetyStatus = { petId, state: 'LOST', updatedAt: new Date().toISOString(), ...info };
    setSafety((s) => ({ ...s, [petId]: status }));
    pCreate(C.safety, { ...status, id: petId });
  }, []);

  const markSafe = useCallback((petId: string) => {
    const status: PetSafetyStatus = { petId, state: 'SAFE', updatedAt: new Date().toISOString() };
    setSafety((s) => ({ ...s, [petId]: status }));
    pCreate(C.safety, { ...status, id: petId });
    earnPoints('REFERRAL', 'Pet marked safe — reunited!', 0);
  }, [earnPoints]);

  const addFoundReport = useCallback((r: Omit<FoundReport, 'id' | 'timestamp'>) => {
    const report = { ...r, id: id(), timestamp: new Date().toISOString() } as FoundReport;
    setFoundReports((fr) => [report, ...fr]);
    pCreate(C.found, report);
    if (r.petId) {
      const status: PetSafetyStatus = { petId: r.petId, state: 'FOUND_PENDING', updatedAt: new Date().toISOString() };
      setSafety((s) => ({ ...s, [r.petId!]: status }));
      pCreate(C.safety, { ...status, id: r.petId });
    }
  }, []);

  // --- Booking ---
  const book = useCallback((slot: AvailabilitySlot, petId: string, reason: string) => {
    const pet = getPetById(petId);
    setSlots((ss) => ss.map((s) => {
      if (s.id !== slot.id) return s;
      const updated = { ...s, isBooked: true };
      pUpdate(C.slots, s.id, updated);
      return updated;
    }));
    const appt: Appointment = {
      id: id(), petId, petName: pet?.name || 'Pet',
      providerId: slot.providerId, providerName: slot.providerName, slotId: slot.id,
      start: slot.start, durationMin: slot.durationMin, mode: slot.mode,
      status: 'CONFIRMED', priceCents: slot.priceCents, reason,
    };
    setAppointments((a) => [appt, ...a]);
    pCreate(C.appts, appt);
    earnPoints('APPOINTMENT', `Booked ${slot.providerName}`, 100);
  }, [getPetById, earnPoints]);

  const cancelAppointment = useCallback((aid: string) => {
    setAppointments((a) => a.map((appt) => {
      if (appt.id !== aid) return appt;
      const updated = { ...appt, status: 'CANCELLED' as const };
      pUpdate(C.appts, aid, updated);
      return updated;
    }));
  }, []);

  const redeemReward = useCallback((reward: Reward): boolean => {
    let ok = false;
    setPawPoints((p) => {
      if (p >= reward.costPoints) {
        ok = true;
        const next = p - reward.costPoints;
        persistProfile(next, streak);
        return next;
      }
      return p;
    });
    if (ok) {
      const entry: PawPointsEntry = { id: id(), delta: -reward.costPoints, reason: 'REDEEM', label: `Redeemed: ${reward.title}`, timestamp: new Date().toISOString() };
      setLedger((l) => [entry, ...l]);
      pCreate(C.ledger, entry);
    }
    return ok;
  }, [streak, persistProfile]);

  const value = useMemo<PawDataValue>(() => ({
    myPets, addPet, updatePet, deletePet,
    healthRecords, reminders, addHealthRecord, addReminder, completeReminder, applyCarePlan,
    safety, foundReports, markLost, markSafe, addFoundReport, getPetById,
    slots, appointments, book, cancelAppointment,
    pawPoints, streak, ledger, badges, earnPoints, redeemReward,
  }), [
    myPets, addPet, updatePet, deletePet,
    healthRecords, reminders, addHealthRecord, addReminder, completeReminder, applyCarePlan,
    safety, foundReports, markLost, markSafe, addFoundReport, getPetById,
    slots, appointments, book, cancelAppointment,
    pawPoints, streak, ledger, badges, earnPoints, redeemReward,
  ]);

  return <PawDataContext.Provider value={value}>{children}</PawDataContext.Provider>;
};

export default PawDataProvider;
