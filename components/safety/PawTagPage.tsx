import React, { useState } from 'react';
import { PawPrint, MapPin, ShieldAlert, Phone, Heart, CheckCircle } from 'lucide-react';
import { Button, Input, Badge } from '../ui';
import { usePawData } from '../../contexts/PawDataContext';

interface PawTagPageProps {
  petId: string;
}

/**
 * Public, unauthenticated page reached by scanning a pet's PawTag QR code
 * (URL `#/tag/:petId`). Shows safe info + a relayed "I found this pet" form.
 */
const PawTagPage: React.FC<PawTagPageProps> = ({ petId }) => {
  const { getPetById, safety, addFoundReport } = usePawData();
  const pet = getPetById(petId);
  const status = safety[petId]?.state || 'SAFE';
  const lost = status === 'LOST';

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [where, setWhere] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    addFoundReport({ petId, finderName: name, finderContact: contact, locationNote: where, message });
    setSent(true);
  };

  if (!pet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center">
          <PawPrint className="mx-auto text-slate-300 mb-3" size={48} />
          <p className="text-slate-500 font-semibold">This PawTag isn't registered.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-slate-50 flex flex-col items-center px-4 py-10">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
          <PawPrint className="text-white w-5 h-5" />
        </div>
        <span className="font-black text-xl text-slate-800">PawPortal</span>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-elevation-3 overflow-hidden">
        <div className="relative">
          <img src={pet.image} alt={pet.name} className="w-full h-56 object-cover" />
          <div className="absolute top-3 left-3">
            {lost
              ? <Badge tone="error"><ShieldAlert size={12} /> Reported lost</Badge>
              : <Badge tone="success">Registered pet</Badge>}
          </div>
        </div>

        <div className="p-6">
          <h1 className="text-2xl font-display font-semibold text-slate-800">Hi, I'm {pet.name}!</h1>
          <p className="text-slate-500">{pet.breed} · {pet.age} yrs · {pet.color}</p>

          {lost && safety[petId]?.note && (
            <div className="mt-3 rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-700">
              <p className="font-bold flex items-center gap-1"><Heart size={14} /> My family misses me</p>
              <p>{safety[petId]?.note}</p>
              {safety[petId]?.lastSeenAddress && (
                <p className="flex items-center gap-1 mt-1 text-red-500"><MapPin size={12} /> Last seen near {safety[petId]?.lastSeenAddress}</p>
              )}
              {!!safety[petId]?.reward && (
                <p className="font-bold mt-1">Reward offered: {safety[petId]?.reward}</p>
              )}
            </div>
          )}

          {sent ? (
            <div className="mt-6 text-center py-6">
              <CheckCircle className="mx-auto text-success mb-3" size={40} />
              <p className="font-bold text-slate-800">Thank you! 🐾</p>
              <p className="text-sm text-slate-500">{pet.name}'s family has been notified right away.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-3">
              <p className="font-bold text-slate-700 flex items-center gap-2"><Phone size={16} /> Found this pet? Let the owner know.</p>
              <Input label="Your name" value={name} required onChange={(e) => setName(e.target.value)} />
              <Input label="Your phone / email" value={contact} required onChange={(e) => setContact(e.target.value)} />
              <Input label="Where did you find them?" value={where} icon={MapPin} onChange={(e) => setWhere(e.target.value)} />
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={2}
                  placeholder="They're safe with me near the…"
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
                />
              </div>
              <Button type="submit" fullWidth size="lg">Notify {pet.name}'s family</Button>
              <p className="text-[11px] text-slate-400 text-center">Your message is relayed privately. The owner's contact details are never shown here.</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PawTagPage;
