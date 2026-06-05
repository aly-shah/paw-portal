import React, { useState, useRef } from 'react';
import { Camera, Upload, Sparkles, AlertTriangle, ShieldCheck, Stethoscope, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, Button, Badge, Avatar, useToast } from '../ui';
import { usePawData } from '../../contexts/PawDataContext';
import { scanPetPhoto } from '../../services/geminiService';
import { PawScanResult } from '../../types';

const urgencyTone: Record<string, { tone: any; label: string; icon: React.ElementType }> = {
  LOW: { tone: 'success', label: 'Low urgency', icon: ShieldCheck },
  MEDIUM: { tone: 'warning', label: 'See a vet soon', icon: AlertTriangle },
  HIGH: { tone: 'error', label: 'Urgent — act now', icon: AlertTriangle },
};

interface PawScanProps {
  onBookVet?: () => void;
}

const PawScan: React.FC<PawScanProps> = ({ onBookVet }) => {
  const { myPets, earnPoints, addHealthRecord } = usePawData();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [petId, setPetId] = useState(myPets[0]?.id || '');
  const [concern, setConcern] = useState('');
  const [preview, setPreview] = useState<string>('');
  const [imageData, setImageData] = useState<{ base64: string; mime: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PawScanResult | null>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      const base64 = dataUrl.split(',')[1] || '';
      setImageData({ base64, mime: file.type });
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const runScan = async () => {
    if (!imageData) return;
    const pet = myPets.find((p) => p.id === petId) || myPets[0];
    setLoading(true);
    setResult(null);
    try {
      const res = await scanPetPhoto(imageData.base64, imageData.mime, pet, concern);
      setResult(res);
      earnPoints('SCAN', 'Ran a PawScan', 15);
      addHealthRecord({
        petId: pet.id,
        type: 'SCAN',
        title: `PawScan: ${concern || 'visual check'} (${res.urgency.toLowerCase()})`,
        date: new Date().toISOString(),
        notes: res.observations.join(' '),
        attachmentUrl: preview,
      });
      toast('Scan complete — saved to health timeline', 'success');
    } catch {
      toast('Scan failed, please try again', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header>
        <div className="flex items-center gap-2 text-secondary-600 font-bold text-xs uppercase tracking-wider mb-1">
          <Sparkles size={14} /> AI-Powered
        </div>
        <h1 className="text-3xl font-display font-semibold text-slate-800">PawScan</h1>
        <p className="text-slate-500 mt-1">
          Snap a photo of a concern — a rash, a limp, an eye — and get an instant AI visual triage.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Capture panel */}
        <Card>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          {preview ? (
            <div className="relative rounded-xl overflow-hidden">
              <img src={preview} alt="Uploaded pet" className="w-full h-64 object-cover" />
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-3 right-3 bg-white/90 backdrop-blur text-slate-700 text-sm font-bold rounded-lg px-3 py-1.5 shadow-elevation-2 hover:bg-white"
              >
                Change photo
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full h-64 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-primary-400 hover:text-primary-500 transition-colors"
            >
              <div className="flex gap-3">
                <Camera size={32} />
                <Upload size={32} />
              </div>
              <span className="font-bold">Tap to upload a photo</span>
              <span className="text-xs">JPG or PNG</span>
            </button>
          )}

          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Which pet?</label>
              <div className="flex gap-2 flex-wrap">
                {myPets.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPetId(p.id)}
                    className={`flex items-center gap-2 rounded-full pr-3 pl-1 py-1 border transition-colors ${
                      petId === p.id ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Avatar src={p.image} alt={p.name} size="xs" />
                    <span className="text-sm font-bold text-slate-700">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">What's the concern?</label>
              <textarea
                value={concern}
                onChange={(e) => setConcern(e.target.value)}
                rows={2}
                placeholder="e.g. red patch on left ear, limping since this morning…"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
              />
            </div>
            <Button fullWidth size="lg" onClick={runScan} loading={loading} disabled={!imageData}>
              <Sparkles size={18} /> {loading ? 'Analysing…' : 'Run PawScan'}
            </Button>
          </div>
        </Card>

        {/* Result panel */}
        <Card>
          {!result && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
              <Stethoscope size={40} className="mb-3" />
              <p className="font-semibold">Your AI triage will appear here.</p>
              <p className="text-xs mt-1">Not a diagnosis — always confirm with a vet.</p>
            </div>
          )}
          {loading && (
            <div className="h-full flex flex-col items-center justify-center text-center text-primary-500 py-12">
              <Loader2 size={40} className="mb-3 animate-spin" />
              <p className="font-semibold">Examining the photo…</p>
            </div>
          )}
          {result && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {(() => {
                const u = urgencyTone[result.urgency] || urgencyTone.LOW;
                const Icon = u.icon;
                return (
                  <div className="flex items-center gap-2">
                    <Badge tone={u.tone}><Icon size={14} /> {u.label}</Badge>
                  </div>
                );
              })()}
              <div>
                <h3 className="font-bold text-slate-800 mb-1">What we see</h3>
                <ul className="list-disc list-inside text-sm text-slate-600 space-y-0.5">
                  {result.observations.map((o, i) => <li key={i}>{o}</li>)}
                </ul>
              </div>
              {result.possibleCauses.length > 0 && (
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">Possible causes</h3>
                  <ul className="list-disc list-inside text-sm text-slate-600 space-y-0.5">
                    {result.possibleCauses.map((o, i) => <li key={i}>{o}</li>)}
                  </ul>
                </div>
              )}
              <div className="rounded-xl bg-primary-50 border border-primary-100 p-4">
                <p className="text-sm font-bold text-primary-700 mb-1">Recommendation</p>
                <p className="text-sm text-slate-700">{result.recommendation}</p>
              </div>
              {result.urgency !== 'LOW' && onBookVet && (
                <Button fullWidth variant="secondary" size="lg" onClick={onBookVet}>
                  <Stethoscope size={18} /> Book a vet now
                </Button>
              )}
              <p className="text-[11px] text-slate-400 italic">{result.disclaimer}</p>
            </motion.div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PawScan;
