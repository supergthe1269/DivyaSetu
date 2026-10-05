import React, { useState, useEffect } from 'react';
import { deviceApi } from '../api/client';
import { Device, DeviceCategory } from '../types';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, 
  Package, 
  CheckCircle2, 
  ArrowRight, 
  Info
} from 'lucide-react';

const CATEGORIES: { label: string; category: DeviceCategory; typeId: number }[] = [
  { label: 'Standard Folding Wheelchair', category: 'WHEELCHAIR', typeId: 1 },
  { label: 'Digital Hearing Aid', category: 'HEARING_AID', typeId: 2 },
  { label: 'Adjustable Forearm Crutches', category: 'CRUTCH', typeId: 3 },
  { label: 'Hand-Operated Mobility Tricycle', category: 'TRICYCLE', typeId: 4 },
  { label: 'Braille Slate & Stylus Kit', category: 'BRAILLE_KIT', typeId: 5 },
  { label: 'Below-Knee Prosthetic Leg', category: 'PROSTHETIC', typeId: 6 },
];

const PRESET_PLACES = [
  { name: 'Chennai — Vadapalani', lat: 13.0589, lng: 80.1839 },
  { name: 'Chennai — Mylapore', lat: 13.0029, lng: 80.2404 },
  { name: 'Chennai — Ambattur', lat: 13.0981, lng: 80.1476 },
  { name: 'Chengalpattu — Pallavaram', lat: 12.985, lng: 80.169 },
  { name: 'Madurai', lat: 9.9256, lng: 78.1198 },
  { name: 'Coimbatore', lat: 11.0168, lng: 76.9558 },
];

export const DonorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [typeId, setTypeId] = useState<number>(1);
  const [condition, setCondition] = useState<string>('GOOD');
  const [description, setDescription] = useState<string>('');
  const [placeIndex, setPlaceIndex] = useState<number>(0);

  const fetchMyDevices = async () => {
    setLoading(true);
    try {
      const res = await deviceApi.list();
      // Filter for current user's donations if logged in, or show all demo donor items
      const myDevs = (res.data.devices || []).filter(
        (d: Device) => !user || d.donorId === user.id || user.role === 'ADMIN'
      );
      setDevices(myDevs);
    } catch (e) {
      console.error('Failed to load donor devices', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyDevices();
  }, [user]);

  const handleListDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setSubmitting(true);
    setSuccessMsg('');

    try {
      const p = PRESET_PLACES[placeIndex];
      const serial = `DS-${Math.floor(1000 + Math.random() * 9000)}`;

      await deviceApi.create({
        serial,
        typeId,
        condition,
        description,
        lat: p.lat,
        lng: p.lng,
      });

      setSuccessMsg(`Device ${serial} registered successfully and routed to Verifier Queue!`);
      setDescription('');
      fetchMyDevices();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to list device');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Donor Redistribution Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            List unused assistive equipment, monitor verification, and enable continuous reuse.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Donor Account Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Listing Form (Left Column) */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">List an Assistive Device</h2>
              <p className="text-[11px] text-slate-400">PostGIS coordinates will be auto-calculated</p>
            </div>
          </div>

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleListDevice} className="space-y-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Device Category
              </label>
              <select
                value={typeId}
                onChange={(e) => setTypeId(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.typeId} value={c.typeId}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Current Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              >
                <option value="EXCELLENT">Excellent (Like new, minimal use)</option>
                <option value="VERY GOOD">Very Good (Clean, minor cosmetic wear)</option>
                <option value="GOOD">Good (Fully functional, visible wear)</option>
                <option value="FAIR">Fair (Functional, may need minor tuning)</option>
              </select>
            </div>

            {/* Location Node */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pickup District / Hub
              </label>
              <select
                value={placeIndex}
                onChange={(e) => setPlaceIndex(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              >
                {PRESET_PLACES.map((p, idx) => (
                  <option key={idx} value={idx}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description & Specifications
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Adult folding wheelchair with pneumatic tires, dual brakes, and removable footrests. Gently used for 6 months."
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>

            {/* Info note */}
            <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 flex items-start gap-2 text-[11px] text-sky-800">
              <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <span>
                Your device enters the <strong>CERTIFYING</strong> queue until an accredited inspector verifies safety.
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all"
            >
              {submitting ? 'Registering...' : 'Submit Device for Certification'}
            </button>
          </form>
        </div>

        {/* My Donations List (Right Column) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-sky-600" />
              My Listed Devices ({devices.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
              Loading listings...
            </div>
          ) : devices.length > 0 ? (
            <div className="space-y-3">
              {devices.map((dev) => (
                <div
                  key={dev.id}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-sky-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-sky-700 font-mono">
                        {dev.serial}
                      </span>
                      <StatusBadge status={dev.status} size="sm" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {dev.type?.label || dev.type?.category}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {dev.description}
                    </p>
                    <div className="text-[11px] text-slate-400 flex items-center gap-3 pt-1">
                      <span>Condition: <strong>{dev.condition}</strong></span>
                      <span>•</span>
                      <span>Listed: {new Date(dev.listedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link
                      to={`/devices/${dev.id}`}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      Digital Ledger <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
              <Package className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No devices listed yet</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Use the form on the left to list your first wheelchair, crutches, or hearing aid.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
