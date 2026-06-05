import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import {
  Pet, HealthRecord, Reminder, CarePlan, PetSafetyStatus, FoundReport,
  AvailabilitySlot, Appointment, PawPointsEntry, PawBadge, Reward, PointReason,
} from '../types';
import { MOCK_PETS } from '../constants';

// Helpers — relative ISO dates so seeded data always looks "current".
const dayMs = 86_400_000;
const inDays = (n: number) => new Date(Date.now() + n * dayMs).toISOString();
const ago = (n: number) => new Date(Date.now() - n * dayMs).toISOString();
let seq = 1000;
const id = () => `gen-${++seq}`;

// "My" pets for the owner experience.
const MY_PETS: Pet[] = MOCK_PETS.filter((p) => p.id === 'p1' || p.id === 'p2');

const SEED_RECORDS: HealthRecord[] = [
  { id: id(), petId: 'p1', type: 'VACCINE', title: 'Rabies booster', date: ago(120), vetName: 'Dr. Sarah Lee' },
  { id: id(), petId: 'p1', type: 'VISIT', title: 'Annual wellness exam', date: ago(120), notes: 'Healthy. Slight tartar buildup noted.', vetName: 'Dr. Sarah Lee' },
  { id: id(), petId: 'p1', type: 'WEIGHT', title: 'Weight recorded: 28 kg', date: ago(40) },
  { id: id(), petId: 'p2', type: 'VACCINE', title: 'FVRCP vaccine', date: ago(200), vetName: 'Dr. Omar' },
];

const SEED_REMINDERS: Reminder[] = [
  { id: id(), petId: 'p1', title: 'Heartworm prevention', category: 'MEDICATION', dueDate: inDays(3), recurrence: 'MONTHLY', relatedProductId: 'prod-hw', done: false },
  { id: id(), petId: 'p1', title: 'Rabies booster due', category: 'VACCINE', dueDate: inDays(20), recurrence: 'YEARLY', done: false },
  { id: id(), petId: 'p2', title: 'Annual checkup', category: 'CHECKUP', dueDate: ago(2), recurrence: 'YEARLY', done: false },
  { id: id(), petId: 'p1', title: 'Grooming appointment', category: 'GROOMING', dueDate: inDays(8), recurrence: 'NONE', done: false },
];

const SEED_SLOTS: AvailabilitySlot[] = [
  { id: 's1', providerId: 'v1', providerName: 'Dr. Sarah Lee', providerImage: 'https://picsum.photos/id/64/100/100', serviceType: 'VET_HOME' as any, start: inDays(1), durationMin: 30, priceCents: 450000, mode: 'IN_PERSON', isBooked: false },
  { id: 's2', providerId: 'v1', providerName: 'Dr. Sarah Lee', providerImage: 'https://picsum.photos/id/64/100/100', serviceType: 'VET_HOME' as any, start: inDays(1), durationMin: 30, priceCents: 300000, mode: 'TELEHEALTH', isBooked: false },
  { id: 's3', providerId: 'c1', providerName: 'PawCare Clinic', providerImage: 'https://picsum.photos/id/1062/100/100', serviceType: 'CLINIC' as any, start: inDays(2), durationMin: 45, priceCents: 600000, mode: 'IN_PERSON', isBooked: false },
  { id: 's4', providerId: 'w1', providerName: 'Max (Dog Walker)', providerImage: 'https://picsum.photos/id/1025/100/100', serviceType: 'WALKER' as any, start: inDays(1), durationMin: 60, priceCents: 150000, mode: 'IN_PERSON', isBooked: false },
];

const SEED_BADGES: PawBadge[] = [
  { id: 'b1', name: 'First Steps', icon: '🐾', description: 'Logged your first walk', earned: true },
  { id: 'b2', name: 'Streak Starter', icon: '🔥', description: '3-day care streak', earned: true },
  { id: 'b3', name: 'Health Hero', icon: '🩺', description: 'Completed a full care plan', earned: false },
  { id: 'b4', name: 'Marathon Pup', icon: '🏅', description: 'Walked 50 km total', earned: false },
  { id: 'b5', name: 'Good Neighbour', icon: '🤝', description: 'Helped reunite a lost pet', earned: false },
];

const SEED_LEDGER: PawPointsEntry[] = [
  { id: id(), delta: 50, reason: 'WALK', label: 'Morning walk with Barnaby', timestamp: ago(1) },
  { id: id(), delta: 25, reason: 'REMINDER', label: 'Completed: flea treatment', timestamp: ago(2) },
  { id: id(), delta: 100, reason: 'APPOINTMENT', label: 'Attended vet checkup', timestamp: ago(5) },
];

interface PawDataValue {
  myPets: Pet[];
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

export const PawDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>(SEED_RECORDS);
  const [reminders, setReminders] = useState<Reminder[]>(SEED_REMINDERS);
  const [safety, setSafety] = useState<Record<string, PetSafetyStatus>>({});
  const [foundReports, setFoundReports] = useState<FoundReport[]>([]);
  const [slots, setSlots] = useState<AvailabilitySlot[]>(SEED_SLOTS);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pawPoints, setPawPoints] = useState(2450);
  const [streak] = useState(5);
  const [ledger, setLedger] = useState<PawPointsEntry[]>(SEED_LEDGER);
  const [badges, setBadges] = useState<PawBadge[]>(SEED_BADGES);

  const getPetById = useCallback(
    (petId: string) => MOCK_PETS.find((p) => p.id === petId),
    [],
  );

  const earnPoints = useCallback((reason: PointReason, label: string, delta: number) => {
    setPawPoints((p) => Math.max(0, p + delta));
    setLedger((l) => [{ id: id(), delta, reason, label, timestamp: new Date().toISOString() }, ...l]);
  }, []);

  const addHealthRecord = useCallback((r: Omit<HealthRecord, 'id'>) => {
    setHealthRecords((rs) => [{ ...r, id: id() }, ...rs]);
  }, []);

  const addReminder = useCallback((r: Omit<Reminder, 'id' | 'done'>) => {
    setReminders((rs) => [...rs, { ...r, id: id(), done: false }]);
  }, []);

  const completeReminder = useCallback((rid: string) => {
    setReminders((rs) => rs.map((r) => (r.id === rid ? { ...r, done: true } : r)));
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
  }, []);

  const markLost = useCallback((petId: string, info: Partial<PetSafetyStatus>) => {
    setSafety((s) => ({
      ...s,
      [petId]: { petId, state: 'LOST', updatedAt: new Date().toISOString(), ...info },
    }));
  }, []);

  const markSafe = useCallback((petId: string) => {
    setSafety((s) => ({ ...s, [petId]: { petId, state: 'SAFE', updatedAt: new Date().toISOString() } }));
    earnPoints('REFERRAL', 'Pet marked safe — reunited!', 0);
  }, [earnPoints]);

  const addFoundReport = useCallback((r: Omit<FoundReport, 'id' | 'timestamp'>) => {
    setFoundReports((fr) => [{ ...r, id: id(), timestamp: new Date().toISOString() }, ...fr]);
    if (r.petId) {
      setSafety((s) => ({ ...s, [r.petId!]: { petId: r.petId!, state: 'FOUND_PENDING', updatedAt: new Date().toISOString() } }));
    }
  }, []);

  const book = useCallback((slot: AvailabilitySlot, petId: string, reason: string) => {
    const pet = MOCK_PETS.find((p) => p.id === petId);
    setSlots((ss) => ss.map((s) => (s.id === slot.id ? { ...s, isBooked: true } : s)));
    setAppointments((a) => [
      {
        id: id(),
        petId,
        petName: pet?.name || 'Pet',
        providerId: slot.providerId,
        providerName: slot.providerName,
        slotId: slot.id,
        start: slot.start,
        durationMin: slot.durationMin,
        mode: slot.mode,
        status: 'CONFIRMED',
        priceCents: slot.priceCents,
        reason,
      },
      ...a,
    ]);
    earnPoints('APPOINTMENT', `Booked ${slot.providerName}`, 100);
  }, [earnPoints]);

  const cancelAppointment = useCallback((aid: string) => {
    setAppointments((a) => a.map((appt) => (appt.id === aid ? { ...appt, status: 'CANCELLED' } : appt)));
  }, []);

  const redeemReward = useCallback((reward: Reward): boolean => {
    let ok = false;
    setPawPoints((p) => {
      if (p >= reward.costPoints) {
        ok = true;
        return p - reward.costPoints;
      }
      return p;
    });
    if (ok) {
      setLedger((l) => [{ id: id(), delta: -reward.costPoints, reason: 'REDEEM', label: `Redeemed: ${reward.title}`, timestamp: new Date().toISOString() }, ...l]);
    }
    return ok;
  }, []);

  const value = useMemo<PawDataValue>(() => ({
    myPets: MY_PETS,
    healthRecords, reminders, addHealthRecord, addReminder, completeReminder, applyCarePlan,
    safety, foundReports, markLost, markSafe, addFoundReport, getPetById,
    slots, appointments, book, cancelAppointment,
    pawPoints, streak, ledger, badges, earnPoints, redeemReward,
  }), [
    healthRecords, reminders, addHealthRecord, addReminder, completeReminder, applyCarePlan,
    safety, foundReports, markLost, markSafe, addFoundReport, getPetById,
    slots, appointments, book, cancelAppointment,
    pawPoints, streak, ledger, badges, earnPoints, redeemReward,
  ]);

  return <PawDataContext.Provider value={value}>{children}</PawDataContext.Provider>;
};

export default PawDataProvider;
