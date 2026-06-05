import React, { useState, useMemo } from 'react';
import {
  Syringe, Pill, Stethoscope, Scale, FileText, Sparkles, Bell, Check,
  Calendar, Scissors, ShoppingBag, Loader2, ClipboardPlus,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, Button, Badge, Avatar, Skeleton, useToast } from '../ui';
import { usePawData } from '../../contexts/PawDataContext';
import { generateCarePlan } from '../../services/geminiService';
import { HealthRecord, Reminder, CarePlan } from '../../types';

const eventIcon: Record<string, React.ElementType> = {
  VACCINE: Syringe, MEDICATION: Pill, VISIT: Stethoscope, WEIGHT: Scale, NOTE: FileText, SCAN: Sparkles,
};
const catIcon: Record<string, React.ElementType> = {
  VACCINE: Syringe, MEDICATION: Pill, CHECKUP: Stethoscope, GROOMING: Scissors, OTHER: Bell,
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

const daysUntil = (iso: string) => Math.round((new Date(iso).getTime() - Date.now()) / 86_400_000);

const HealthHub: React.FC = () => {
  const { myPets, healthRecords, reminders, completeReminder, applyCarePlan, addReminder } = usePawData();
  const { toast } = useToast();
  const [petId, setPetId] = useState(myPets[0]?.id || '');
  const [planLoading, setPlanLoading] = useState(false);
  const [plan, setPlan] = useState<CarePlan | null>(null);

  const pet = myPets.find((p) => p.id === petId) || myPets[0];

  const petRecords = useMemo(
    () => healthRecords.filter((r) => r.petId === petId).sort((a, b) => +new Date(b.date) - +new Date(a.date)),
    [healthRecords, petId],
  );
  const petReminders = useMemo(
    () => reminders.filter((r) => r.petId === petId && !r.done).sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate)),
    [reminders, petId],
  );

  const makePlan = async () => {
    setPlanLoading(true);
    setPlan(null);
    try {
      const result = await generateCarePlan(pet, petRecords);
      setPlan(result);
    } finally {
      setPlanLoading(false);
    }
  };

  const acceptPlan = () => {
    if (!plan) return;
    applyCarePlan(petId, plan);
    toast(`${plan.tasks.length} care tasks added to ${pet.name}'s reminders`, 'success');
    setPlan(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-semibold text-slate-800">Health Hub</h1>
          <p className="text-slate-500 mt-1">Timeline, reminders, and AI care plans for your pets.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {myPets.map((p) => (
            <button
              key={p.id}
              onClick={() => { setPetId(p.id); setPlan(null); }}
              className={`flex items-center gap-2 rounded-full pr-3 pl-1 py-1 border transition-colors ${
                petId === p.id ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <Avatar src={p.image} alt={p.name} size="xs" />
              <span className="text-sm font-bold text-slate-700">{p.name}</span>
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileText size={18} className="text-primary-500" /> Health timeline
          </h2>
          {petRecords.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No records yet.</p>
          ) : (
            <ol className="relative border-l-2 border-slate-100 ml-3 space-y-5">
              {petRecords.map((r) => {
                const Icon = eventIcon[r.type] || FileText;
                return (
                  <li key={r.id} className="ml-6">
                    <span className="absolute -left-[13px] flex h-6 w-6 items-center justify-center rounded-full bg-primary-50 ring-4 ring-white">
                      <Icon size={13} className="text-primary-600" />
                    </span>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-800 text-sm">{r.title}</p>
                      <time className="text-xs text-slate-400">{fmtDate(r.date)}</time>
                    </div>
                    {r.notes && <p className="text-sm text-slate-500 mt-0.5">{r.notes}</p>}
                    {r.vetName && <p className="text-xs text-slate-400 mt-0.5">— {r.vetName}</p>}
                  </li>
                );
              })}
            </ol>
          )}
        </Card>

        {/* Reminders + Care plan */}
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Bell size={18} className="text-accent-500" /> Next up
            </h2>
            <div className="space-y-2">
              {petReminders.length === 0 && <p className="text-sm text-slate-400">All caught up! 🎉</p>}
              {petReminders.map((r) => {
                const Icon = catIcon[r.category] || Bell;
                const d = daysUntil(r.dueDate);
                const overdue = d < 0;
                return (
                  <div key={r.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                    <div className={`p-2 rounded-lg ${overdue ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-700 truncate">{r.title}</p>
                      <p className={`text-xs font-semibold ${overdue ? 'text-red-500' : 'text-slate-400'}`}>
                        {overdue ? `${Math.abs(d)}d overdue` : d === 0 ? 'Due today' : `Due in ${d}d`}
                      </p>
                    </div>
                    {r.relatedProductId && (
                      <button title="Reorder" className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg">
                        <ShoppingBag size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => completeReminder(r.id)}
                      title="Mark done (+25 pts)"
                      className="p-1.5 text-slate-400 hover:bg-green-50 hover:text-green-600 rounded-lg"
                    >
                      <Check size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-primary-50 to-white border-primary-100">
            <div className="flex items-center gap-2 text-secondary-600 font-bold text-xs uppercase tracking-wider mb-2">
              <Sparkles size={14} /> AI Care Plan
            </div>
            {!plan && (
              <>
                <p className="text-sm text-slate-600 mb-3">
                  Generate a personalised 12-month preventive plan for {pet.name}.
                </p>
                <Button fullWidth onClick={makePlan} loading={planLoading}>
                  <ClipboardPlus size={18} /> {planLoading ? 'Building plan…' : 'Generate care plan'}
                </Button>
              </>
            )}
            {planLoading && (
              <div className="mt-3 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            )}
            {plan && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                <p className="text-sm text-slate-700">{plan.summary}</p>
                <ul className="space-y-1.5">
                  {plan.tasks.map((t, i) => (
                    <li key={i} className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">{t.title}</span>
                      <Badge tone="primary">{t.dueInDays}d</Badge>
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <Button fullWidth onClick={acceptPlan}><Calendar size={16} /> Add all to reminders</Button>
                  <Button variant="ghost" onClick={() => setPlan(null)}>Dismiss</Button>
                </div>
              </motion.div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HealthHub;
