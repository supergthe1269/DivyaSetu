import React, { useState, useEffect, useRef } from 'react';
import { deviceApi } from '../api/client';
import { Device, DeviceCategory } from '../types';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { Link } from 'react-router-dom';
import { getDeviceImageUrl, CATEGORY_DEFAULT_IMAGES } from '../data/deviceImages';
import { 
  PlusCircle, 
  Package, 
  CheckCircle2, 
  ArrowRight, 
  Info,
  Calendar,
  Activity,
  Accessibility,
  Volume2,
  Milestone,
  Bike,
  BookOpen,
  Cpu,
  Compass,
  Camera,
  X,
  Sparkles,
  Search
} from 'lucide-react';
import { 
  ALL_INDIA_LOCATIONS, 
  REGIONS, 
  LOCATIONS_BY_REGION 
} from '../data/locations';

const CATEGORIES: { label: string; category: DeviceCategory; typeId: number; icon: React.FC<{ className?: string }> }[] = [
  { label: 'Standard Folding Wheelchair', category: 'WHEELCHAIR', typeId: 1, icon: Accessibility },
  { label: 'Digital Hearing Aid', category: 'HEARING_AID', typeId: 2, icon: Volume2 },
  { label: 'Adjustable Forearm Crutches', category: 'CRUTCH', typeId: 3, icon: Milestone },
  { label: 'Hand-Operated Mobility Tricycle', category: 'TRICYCLE', typeId: 4, icon: Bike },
  { label: 'Braille Slate & Stylus Kit', category: 'BRAILLE_KIT', typeId: 5, icon: BookOpen },
  { label: 'Below-Knee Prosthetic Leg', category: 'PROSTHETIC', typeId: 6, icon: Cpu },
];

export const DonorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [activeMobileTab, setActiveMobileTab] = useState<'form' | 'list'>('form');
  const [searchFilter, setSearchFilter] = useState('');

  // Form State
  const [typeId, setTypeId] = useState<number>(1);
  const [condition, setCondition] = useState<string>('GOOD');
  const [description, setDescription] = useState<string>('');
  const [placeIndex, setPlaceIndex] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMyDevices = async () => {
    setLoading(true);
    try {
      const res = await deviceApi.myDevices();
      setDevices(res.data.devices || []);
    } catch (e) {
      console.error('Failed to load donor devices', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyDevices();
  }, [user]);

  // Handle image upload from camera / local file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Please choose an image under 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImageUrl(result);
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Quick preset sample photo for demo
  const handleUseSamplePhoto = () => {
    const cat = CATEGORIES.find(c => c.typeId === typeId)?.category || 'WHEELCHAIR';
    const sample = CATEGORY_DEFAULT_IMAGES[cat];
    setImageUrl(sample);
    setImagePreview(sample);
  };

  const handleClearPhoto = () => {
    setImageUrl('');
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleListDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setSubmitting(true);
    setSuccessMsg('');

    try {
      const p = ALL_INDIA_LOCATIONS[placeIndex];
      const serial = `DS-${Math.floor(1000 + Math.random() * 9000)}`;

      await deviceApi.create({
        serial,
        typeId,
        condition,
        description,
        lat: p.lat,
        lng: p.lng,
        imageUrl: imageUrl.trim() || undefined,
      });

      setSuccessMsg(`Device ${serial} registered successfully and routed to Verifier Queue!`);
      setDescription('');
      handleClearPhoto();
      fetchMyDevices();
      if (window.innerWidth < 1024) {
        setActiveMobileTab('list');
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to list device');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDevices = devices.filter((d) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      d.serial.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q) ||
      d.type?.label?.toLowerCase().includes(q) ||
      d.type?.category?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 pb-safe">
      
      {/* =========================================================================
          PAGE HEADER
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
              Donor Redistribution Hub
            </span>
            <span className="text-xs text-slate-400">PostGIS Ingestion &amp; Device Twin</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            List Equipment &amp; Track Circular Reuse
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Register idle assistive devices with actual photos, assign GPS coordinates for location-aware matching, and track units through inspection and delivery.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-bold flex items-center gap-2 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Donor Account Active</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MOBILE SEGMENTED TABS
         ========================================================================= */}
      <div className="lg:hidden flex items-center p-1 bg-slate-100/80 rounded-xl border border-slate-200/80">
        <button
          onClick={() => setActiveMobileTab('form')}
          className={`btn-press flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeMobileTab === 'form'
              ? 'bg-white text-sky-800 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          List New Device
        </button>
        <button
          onClick={() => setActiveMobileTab('list')}
          className={`btn-press flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeMobileTab === 'list'
              ? 'bg-white text-sky-800 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          My Listed Units ({devices.length})
        </button>
      </div>

      {/* =========================================================================
          TWO-COLUMN WORKSPACE WITH DEDICATED INDEPENDENT SIDEBAR
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: LISTING FORM (STICKY ON DESKTOP) */}
        <div className={`lg:col-span-5 ${activeMobileTab === 'form' ? 'block' : 'hidden lg:block'} lg:sticky lg:top-20`}>
          <div className="glass-panel p-6 sm:p-7 rounded-2xl shadow-card space-y-4 border border-slate-200/90 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 custom-scrollbar">
            
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shadow-2xs">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-slate-900">List an Assistive Device</h2>
                <p className="text-[11px] text-slate-500">PostGIS point &amp; photo ledger auto-created</p>
              </div>
            </div>

            {successMsg && (
              <div className="p-3.5 bg-emerald-50/90 border border-emerald-200/80 rounded-xl text-xs text-emerald-800 font-semibold flex items-start gap-2.5 shadow-2xs animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleListDevice} className="space-y-4">
              
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Device Classification
                </label>
                <select
                  value={typeId}
                  onChange={(e) => setTypeId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all cursor-pointer"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.typeId} value={c.typeId}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Photo Upload Section */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Device Photo (Taken by User)
                  </label>
                  <button
                    type="button"
                    onClick={handleUseSamplePhoto}
                    className="text-[11px] font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Use Sample Photo</span>
                  </button>
                </div>

                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group">
                    <img
                      src={imagePreview}
                      alt="Device preview"
                      className="w-full h-36 object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-white/90 text-slate-800 text-xs font-bold rounded-lg shadow-sm hover:bg-white flex items-center gap-1"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Change</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleClearPhoto}
                        className="p-1.5 bg-rose-600 text-white rounded-lg shadow-sm hover:bg-rose-700"
                        title="Remove photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-sky-400 bg-slate-50/60 hover:bg-sky-50/40 rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 group"
                  >
                    <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-sky-600 group-hover:border-sky-300 transition-colors shadow-2xs">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-semibold text-slate-700">
                      Upload photo or take picture
                    </div>
                    <div className="text-[10px] text-slate-400">
                      PNG, JPG, WebP up to 5MB
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Condition */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Current Physical Condition
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all cursor-pointer"
                >
                  <option value="EXCELLENT">Excellent (Minimal previous use, pristine)</option>
                  <option value="VERY GOOD">Very Good (Clean, minor cosmetic wear)</option>
                  <option value="GOOD">Good (Fully functional, verified brakes/frame)</option>
                  <option value="FAIR">Fair (Functional, may require minor maintenance)</option>
                </select>
              </div>

              {/* Location Node */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Pickup Location &amp; Regional Node
                </label>
                <select
                  value={placeIndex}
                  onChange={(e) => setPlaceIndex(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all cursor-pointer"
                >
                  {REGIONS.map(({ key, label }) => (
                    <optgroup key={key} label={label}>
                      {LOCATIONS_BY_REGION[key].map((p) => {
                        const idx = ALL_INDIA_LOCATIONS.findIndex((item) => item.name === p.name);
                        return (
                          <option key={idx} value={idx}>
                            {p.name} ({p.state})
                          </option>
                        );
                      })}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Technical Specifications &amp; Notes
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Adult folding wheelchair with dual hand-brakes, solid rubber tires, and detachable footrests. Gently used for 6 months."
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all leading-relaxed"
                />
              </div>

              {/* Info Note */}
              <div className="p-3 bg-sky-50/80 rounded-xl border border-sky-100 flex items-start gap-2 text-xs text-sky-900 leading-relaxed">
                <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>
                  Submitted units enter <strong className="text-sky-950 font-semibold">CERTIFYING</strong> status. An accredited verifier inspects structural integrity before dispatch.
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || !description.trim()}
                className="btn-press w-full py-3 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-soft hover:shadow-glow-sky transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Registering PostGIS Asset...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Submit Device for Inspection</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: DEDICATED INDEPENDENT SCROLLABLE SIDEBAR */}
        <div className={`lg:col-span-7 flex flex-col ${activeMobileTab === 'list' ? 'block' : 'hidden lg:flex'} lg:sticky lg:top-20 max-h-[calc(100vh-6rem)]`}>
          
          {/* Fixed Header in the Sidebar */}
          <div className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-sky-600" />
                <span>Registered Assets Ledger ({devices.length})</span>
              </h2>
              <p className="text-[11px] text-slate-500">Live units registered under this donor profile</p>
            </div>

            {/* Quick search inside sidebar */}
            {devices.length > 3 && (
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter serial or type..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            )}
          </div>

          {/* Scrollable Device List Container */}
          <div className="overflow-y-auto pr-1.5 pt-3 flex-1 space-y-3 custom-scrollbar">
            {loading ? (
              <div className="p-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
                Loading listings...
              </div>
            ) : filteredDevices.length > 0 ? (
              filteredDevices.map((dev) => {
                const devImg = getDeviceImageUrl(dev);
                return (
                  <div
                    key={dev.id}
                    className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-card hover:border-sky-300 transition-all flex flex-col sm:flex-row sm:items-center gap-4 group"
                  >
                    {/* Actual Device Photo Thumbnail */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 shadow-2xs group-hover:scale-102 transition-transform">
                      <img
                        src={devImg}
                        alt={dev.type?.label || 'Equipment'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          const fallbackCat = (dev.type?.category || 'WHEELCHAIR') as DeviceCategory;
                          (e.currentTarget as HTMLImageElement).src = CATEGORY_DEFAULT_IMAGES[fallbackCat];
                        }}
                      />
                      <div className="absolute top-1 left-1">
                        <span className="font-mono text-[9px] font-bold text-white bg-slate-900/80 backdrop-blur-xs px-1.5 py-0.5 rounded shadow-xs">
                          {dev.serial}
                        </span>
                      </div>
                    </div>

                    {/* Metadata & Description */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={dev.status} size="sm" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          {dev.type?.category}
                        </span>
                      </div>
                      <h3 className="font-display text-sm sm:text-base font-bold text-slate-900 truncate">
                        {dev.type?.label || dev.type?.category}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-1 leading-relaxed">
                        {dev.description}
                      </p>
                      <div className="text-[11px] font-medium text-slate-400 flex flex-wrap items-center gap-2 pt-0.5">
                        <span className="flex items-center gap-1">
                          <Activity className="w-3 h-3 text-slate-400" />
                          Condition: <strong className="text-slate-700">{dev.condition}</strong>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          Listed: {new Date(dev.listedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Action Links */}
                    <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 self-end sm:self-center">
                      <Link
                        to={`/track?serial=${dev.serial}`}
                        className="btn-press px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow-2xs"
                      >
                        <Compass className="w-3.5 h-3.5 text-sky-600" />
                        <span>Track</span>
                      </Link>
                      <Link
                        to={`/devices/${dev.id}`}
                        className="btn-press px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow-2xs"
                      >
                        <span>Ledger</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/90 space-y-3 shadow-card">
                <Package className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-display font-bold text-base text-slate-800">
                  {searchFilter ? 'No devices matching filter' : 'No devices registered under this account'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  {searchFilter ? 'Try searching by a different term.' : 'Use the intake form on the left to register your first pre-owned assistive device.'}
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
