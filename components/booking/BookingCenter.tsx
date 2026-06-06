import React, { useState } from 'react';
import { Calendar, Video, MapPin, Clock, Stethoscope, Check, X } from 'lucide-react';
import { Card, Button, Badge, Avatar, Modal, Tabs, useToast } from '../ui';
import { usePawData } from '../../contexts/PawDataContext';
import { AvailabilitySlot } from '../../types';

const fmt = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
const price = (cents: number) => `Rs ${(cents / 100).toLocaleString()}`;

const BookingCenter: React.FC = () => {
  const { myPets, slots, appointments, book, cancelAppointment } = usePawData();
  const { toast } = useToast();
  const [tab, setTab] = useState('book');
  const [slot, setSlot] = useState<AvailabilitySlot | null>(null);
  const [petId, setPetId] = useState(myPets[0]?.id || '');
  const [reason, setReason] = useState('');

  const confirm = () => {
    if (!slot) return;
    book(slot, petId, reason);
    toast(`Appointment confirmed with ${slot.providerName} (+100 pts)`, 'success');
    setSlot(null); setReason('');
  };

  const open = slots.filter((s) => !s.isBooked);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-display font-semibold text-slate-800">Appointments</h1>
        <p className="text-slate-500 mt-1">Book vets, groomers, sitters — in person or via telehealth.</p>
      </header>

      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: 'book', label: 'Available', icon: Calendar },
          { id: 'mine', label: `My appointments (${appointments.filter((a) => a.status !== 'CANCELLED').length})`, icon: Stethoscope },
        ]}
      />

      {tab === 'book' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {open.map((s) => (
            <Card key={s.id} interactive>
              <div className="flex items-center gap-3">
                <Avatar src={s.providerImage} alt={s.providerName} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800">{s.providerName}</p>
                  <p className="text-xs text-slate-400">
                    {s.mode === 'TELEHEALTH' ? 'Video consult' : 'In person'} · {s.durationMin} min
                  </p>
                </div>
                <Badge tone={s.mode === 'TELEHEALTH' ? 'info' : 'neutral'}>
                  {s.mode === 'TELEHEALTH' ? <Video size={12} /> : <MapPin size={12} />}
                  {s.mode === 'TELEHEALTH' ? 'Online' : 'Visit'}
                </Badge>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600 flex items-center gap-1">
                  <Clock size={14} /> {fmt(s.start)}
                </span>
                <span className="font-bold text-slate-800">{price(s.priceCents)}</span>
              </div>
              <Button fullWidth className="mt-3" onClick={() => setSlot(s)}>Book</Button>
            </Card>
          ))}
        </div>
      )}

      {tab === 'mine' && (
        <div className="space-y-3">
          {appointments.length === 0 && <Card><p className="text-sm text-slate-400 text-center py-4">No appointments yet.</p></Card>}
          {appointments.map((a) => (
            <Card key={a.id} className={a.status === 'CANCELLED' ? 'opacity-60' : ''}>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${a.mode === 'TELEHEALTH' ? 'bg-blue-50 text-blue-600' : 'bg-primary-50 text-primary-600'}`}>
                  {a.mode === 'TELEHEALTH' ? <Video size={20} /> : <Stethoscope size={20} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800">{a.providerName} · {a.petName}</p>
                  <p className="text-xs text-slate-400">{fmt(a.start)} · {price(a.priceCents)}</p>
                  {a.reason && <p className="text-sm text-slate-500 mt-0.5">{a.reason}</p>}
                </div>
                {a.status === 'CONFIRMED' ? (
                  <div className="flex items-center gap-2">
                    {a.mode === 'TELEHEALTH' && <Button size="sm" variant="secondary"><Video size={14} /> Join</Button>}
                    <Badge tone="success"><Check size={12} /> Confirmed</Badge>
                    <button onClick={() => cancelAppointment(a.id)} title="Cancel" className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <Badge tone="error">Cancelled</Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!slot} onClose={() => setSlot(null)} title="Confirm booking" size="sm">
        {slot && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <Avatar src={slot.providerImage} alt={slot.providerName} size="md" />
              <div>
                <p className="font-bold text-slate-800">{slot.providerName}</p>
                <p className="text-xs text-slate-400">{fmt(slot.start)} · {price(slot.priceCents)}</p>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">For which pet?</label>
              <div className="flex gap-2 flex-wrap">
                {myPets.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPetId(p.id)}
                    className={`flex items-center gap-2 rounded-full pr-3 pl-1 py-1 border transition-colors ${
                      petId === p.id ? 'border-primary-500 bg-primary-50' : 'border-slate-200'
                    }`}
                  >
                    <Avatar src={p.image} alt={p.name} size="xs" />
                    <span className="text-sm font-bold text-slate-700">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Reason (optional)</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                placeholder="Annual checkup, limping, vaccination…"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
              />
            </div>
            <Button fullWidth size="lg" onClick={confirm}>Confirm · {price(slot.priceCents)}</Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BookingCenter;
