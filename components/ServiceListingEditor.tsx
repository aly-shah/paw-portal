import React, { useState, useEffect, useRef } from 'react';
import { Store, MapPin, DollarSign, Plus, Trash2, Save, Camera, Tag, Zap, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { ServiceProvider, ServiceItem, ServiceType, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { fileToDataUrl } from '../services/image';

// Which service type a provider role defaults to.
const defaultTypeForRole = (role?: UserRole): ServiceType => {
  if (role === UserRole.CLINIC) return ServiceType.CLINIC;
  if (role === UserRole.CARE_GIVER) return ServiceType.WALKER;
  return ServiceType.VET_HOME; // VET and anything else
};

const TYPE_LABELS: Record<ServiceType, string> = {
  [ServiceType.VET_HOME]: 'Home Vet Visit',
  [ServiceType.CLINIC]: 'Clinic',
  [ServiceType.WALKER]: 'Walker / Care',
};

const newServiceRow = (): ServiceItem => ({ id: `svc-${Date.now()}-${Math.floor(performance.now())}`, name: '', price: 0, duration: '30 min' });

const ServiceListingEditor: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [listing, setListing] = useState<ServiceProvider>({
    id: user?.id || 'me',
    name: user?.name || '',
    type: defaultTypeForRole(user?.role),
    rating: 5.0,
    reviews: 0,
    image: user?.avatar || 'https://picsum.photos/id/1011/300/300',
    location: '',
    priceRange: '',
    description: '',
    available: true,
    specialties: [],
    isEmergency: false,
    services: [newServiceRow()],
  });
  const [specialtiesText, setSpecialtiesText] = useState('');

  // Load this provider's existing published listing (id === user id).
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const all = await api.list<ServiceProvider>('global', 'providers');
        if (cancelled) return;
        const mine = all.find(p => p.id === user.id);
        if (mine) {
          setListing({ ...mine, services: mine.services?.length ? mine.services : [newServiceRow()] });
          setSpecialtiesText((mine.specialties || []).join(', '));
        } else {
          // Pre-fill from the account for a first-time listing.
          setListing(prev => ({ ...prev, id: user.id, name: user.name, image: user.avatar || prev.image, type: defaultTypeForRole(user.role) }));
        }
      } catch { /* keep defaults */ } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const notify = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2500); };

  const set = <K extends keyof ServiceProvider>(key: K, value: ServiceProvider[K]) =>
    setListing(prev => ({ ...prev, [key]: value }));

  const updateService = (id: string, patch: Partial<ServiceItem>) =>
    setListing(prev => ({ ...prev, services: prev.services.map(s => s.id === id ? { ...s, ...patch } : s) }));
  const addService = () => setListing(prev => ({ ...prev, services: [...prev.services, newServiceRow()] }));
  const removeService = (id: string) =>
    setListing(prev => ({ ...prev, services: prev.services.filter(s => s.id !== id) }));

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try { set('image', await fileToDataUrl(e.target.files[0])); } catch { notify('Could not read that image.'); }
    }
  };

  const handleSave = async () => {
    if (!user) return;
    if (!listing.name.trim()) { notify('Please add a name.'); return; }
    if (!listing.location.trim()) { notify('Please add a location.'); return; }
    const cleanServices = listing.services
      .filter(s => s.name.trim())
      .map(s => ({ ...s, price: Number(s.price) || 0 }));
    if (cleanServices.length === 0) { notify('Add at least one service.'); return; }

    setSaving(true);
    try {
      const payload: ServiceProvider = {
        ...listing,
        id: user.id, // listing is keyed to the provider account
        name: listing.name.trim(),
        location: listing.location.trim(),
        specialties: specialtiesText.split(',').map(s => s.trim()).filter(Boolean),
        services: cleanServices,
      };
      // POST upserts, so this creates the listing the first time and updates it after.
      await api.create('global', 'providers', payload);
      notify(listing.available ? 'Listing published — clients can now find you!' : 'Listing saved (hidden).');
    } catch (err: any) {
      notify(err?.message || 'Could not save your listing.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto py-20 text-center text-slate-400">Loading your listing…</div>;
  }

  return (
    <div className="max-w-3xl mx-auto pb-16 animate-fade-in">
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] bg-slate-900 text-white text-sm font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" /> {toast}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-800">My Service Listing</h2>
        <p className="text-slate-500 text-sm">This is your public profile on the <strong>Find Services</strong> page. Keep it up to date so pet owners can find and book you.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        {/* Header: image + visibility */}
        <div className="flex items-center gap-5">
          <div className="relative">
            <img src={listing.image} alt="" className="w-20 h-20 rounded-2xl object-cover border border-slate-100" />
            <button onClick={() => imageInputRef.current?.click()} className="absolute -bottom-2 -right-2 p-1.5 bg-slate-900 text-white rounded-full shadow-md hover:bg-slate-700"><Camera size={14} /></button>
            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
          </div>
          <div className="flex-1">
            <button
              onClick={() => set('available', !listing.available)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${listing.available ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
            >
              {listing.available ? <Eye size={14} /> : <EyeOff size={14} />}
              {listing.available ? 'Visible to clients' : 'Hidden'}
            </button>
            <p className="text-[11px] text-slate-400 mt-1">Toggle off to temporarily remove yourself from search.</p>
          </div>
        </div>

        {/* Basic fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Display name">
            <input value={listing.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Dr. Sarah Jenkins" className={inputCls} />
          </Field>
          <Field label="Service type">
            <select value={listing.type} onChange={e => set('type', e.target.value as ServiceType)} className={inputCls}>
              {Object.values(ServiceType).map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
            </select>
          </Field>
          <Field label="Location / Area">
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-3.5 text-slate-400" />
              <input value={listing.location} onChange={e => set('location', e.target.value)} placeholder="e.g. DHA Phase 6, Karachi" className={`${inputCls} pl-9`} />
            </div>
          </Field>
          <Field label="Price range (display)">
            <div className="relative">
              <DollarSign size={16} className="absolute left-3 top-3.5 text-slate-400" />
              <input value={listing.priceRange || ''} onChange={e => set('priceRange', e.target.value)} placeholder="e.g. PKR 1500-3000" className={`${inputCls} pl-9`} />
            </div>
          </Field>
        </div>

        <Field label="About / Description">
          <textarea value={listing.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Describe your experience and what you offer…" className={`${inputCls} resize-none`} />
        </Field>

        <Field label="Specialties (comma separated)">
          <div className="relative">
            <Tag size={16} className="absolute left-3 top-3.5 text-slate-400" />
            <input value={specialtiesText} onChange={e => setSpecialtiesText(e.target.value)} placeholder="e.g. General Practice, Dermatology" className={`${inputCls} pl-9`} />
          </div>
        </Field>

        <button
          onClick={() => set('isEmergency', !listing.isEmergency)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${listing.isEmergency ? 'bg-red-50 border-red-200 text-red-600' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
        >
          <Zap size={14} /> {listing.isEmergency ? 'Offers 24/7 emergency' : 'Not an emergency provider'}
        </button>

        {/* Services */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Services & pricing</label>
            <button onClick={addService} className="text-xs font-bold text-teal-600 hover:underline flex items-center gap-1"><Plus size={14} /> Add service</button>
          </div>
          <div className="space-y-2">
            {listing.services.map(svc => (
              <div key={svc.id} className="flex gap-2 items-center">
                <input value={svc.name} onChange={e => updateService(svc.id, { name: e.target.value })} placeholder="Service name" className={`${inputCls} flex-1`} />
                <input value={svc.duration} onChange={e => updateService(svc.id, { duration: e.target.value })} placeholder="30 min" className={`${inputCls} w-24`} />
                <div className="relative w-32">
                  <span className="absolute left-2 top-3 text-[10px] font-bold text-slate-400">PKR</span>
                  <input type="number" value={svc.price || ''} onChange={e => updateService(svc.id, { price: Number(e.target.value) })} placeholder="0" className={`${inputCls} pl-9`} />
                </div>
                <button onClick={() => removeService(svc.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button onClick={handleSave} disabled={saving} className="px-8 py-3 bg-teal-600 text-white rounded-xl font-bold shadow-lg shadow-teal-200 hover:bg-teal-700 transition-all flex items-center gap-2 disabled:opacity-60">
          <Save size={18} /> {saving ? 'Saving…' : 'Save & Publish'}
        </button>
      </div>
    </div>
  );
};

const inputCls = 'w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-teal-500';
const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-slate-500 uppercase">{label}</label>
    {children}
  </div>
);

export default ServiceListingEditor;
