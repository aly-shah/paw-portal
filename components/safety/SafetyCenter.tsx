import React, { useState } from 'react';
import { QrCode, MapPin, ShieldAlert, ShieldCheck, Megaphone, ExternalLink, Bell } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { Card, Button, Badge, Avatar, Modal, Input, useToast } from '../ui';
import { usePawData } from '../../contexts/PawDataContext';
import { Pet } from '../../types';

const tagUrl = (petId: string) => `${window.location.origin}/#/tag/${petId}`;

const SafetyCenter: React.FC = () => {
  const { myPets, safety, foundReports, markLost, markSafe } = usePawData();
  const { toast } = useToast();
  const [qrPet, setQrPet] = useState<Pet | null>(null);
  const [lostPet, setLostPet] = useState<Pet | null>(null);
  const [lostNote, setLostNote] = useState('');
  const [lostAddress, setLostAddress] = useState('');
  const [reward, setReward] = useState('');

  const confirmLost = () => {
    if (!lostPet) return;
    markLost(lostPet.id, {
      note: lostNote,
      lastSeenAddress: lostAddress,
      reward: reward ? Number(reward) : undefined,
      radiusKm: 5,
    });
    toast(`Alert broadcast — the community near ${lostAddress || 'you'} has been notified`, 'warning');
    setLostPet(null);
    setLostNote(''); setLostAddress(''); setReward('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-display font-semibold text-slate-800">Safety & PawTag</h1>
        <p className="text-slate-500 mt-1">Scan-to-return tags and lost-pet alerts that rally the community.</p>
      </header>

      {/* My pets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {myPets.map((pet) => {
          const status = safety[pet.id]?.state || 'SAFE';
          const isLost = status === 'LOST';
          return (
            <Card key={pet.id} className={isLost ? 'border-red-300 ring-1 ring-red-200' : ''}>
              <div className="flex items-center gap-4">
                <Avatar src={pet.image} alt={pet.name} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-800">{pet.name}</h2>
                    {isLost ? (
                      <Badge tone="error"><ShieldAlert size={12} /> Lost</Badge>
                    ) : status === 'FOUND_PENDING' ? (
                      <Badge tone="warning">Found — pending</Badge>
                    ) : (
                      <Badge tone="success"><ShieldCheck size={12} /> Safe</Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{pet.breed}</p>
                  {pet.microchip && <p className="text-xs text-slate-400 font-mono mt-0.5">chip {pet.microchip}</p>}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setQrPet(pet)}>
                  <QrCode size={16} /> PawTag
                </Button>
                {isLost ? (
                  <Button variant="primary" size="sm" onClick={() => { markSafe(pet.id); toast(`${pet.name} marked safe 🎉`, 'success'); }}>
                    <ShieldCheck size={16} /> Mark found
                  </Button>
                ) : (
                  <Button variant="danger" size="sm" onClick={() => setLostPet(pet)}>
                    <Megaphone size={16} /> Report lost
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Found reports feed */}
      <Card>
        <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Bell size={18} className="text-accent-500" /> Found-pet reports
        </h2>
        {foundReports.length === 0 ? (
          <p className="text-sm text-slate-400">No reports yet. When someone scans a PawTag, it shows up here.</p>
        ) : (
          <div className="space-y-2">
            {foundReports.map((r) => (
              <div key={r.id} className="flex items-start gap-3 rounded-xl border border-slate-100 p-3">
                <MapPin size={18} className="text-secondary-500 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-slate-700">{r.finderName} reported a found pet</p>
                  {r.message && <p className="text-sm text-slate-500">{r.message}</p>}
                  {r.locationNote && <p className="text-xs text-slate-400">Near {r.locationNote}</p>}
                  <p className="text-xs text-slate-400">Contact: {r.finderContact}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* QR modal */}
      <Modal open={!!qrPet} onClose={() => setQrPet(null)} title={`${qrPet?.name}'s PawTag`} size="sm">
        {qrPet && (
          <div className="flex flex-col items-center text-center gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-elevation-1">
              <QRCodeCanvas value={tagUrl(qrPet.id)} size={180} fgColor="#0f172a" />
            </div>
            <p className="text-sm text-slate-500">
              Print this for {qrPet.name}'s collar. Anyone who scans it sees a safe contact page — no personal details exposed.
            </p>
            <a
              href={tagUrl(qrPet.id)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-primary-600 font-bold text-sm hover:underline"
            >
              Preview public page <ExternalLink size={14} />
            </a>
          </div>
        )}
      </Modal>

      {/* Report lost modal */}
      <Modal open={!!lostPet} onClose={() => setLostPet(null)} title={`Report ${lostPet?.name} lost`} size="sm">
        <div className="space-y-4">
          <Input label="Last seen near" placeholder="e.g. Central Park, 5th Ave" value={lostAddress} icon={MapPin} onChange={(e) => setLostAddress(e.target.value)} />
          <Input label="Reward (optional)" type="number" placeholder="e.g. 5000" value={reward} onChange={(e) => setReward(e.target.value)} />
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Note for finders</label>
            <textarea
              value={lostNote}
              onChange={(e) => setLostNote(e.target.value)}
              rows={3}
              placeholder="Distinguishing features, temperament, medication needs…"
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
            />
          </div>
          <Button fullWidth variant="danger" onClick={confirmLost}>
            <Megaphone size={18} /> Broadcast alert
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default SafetyCenter;
