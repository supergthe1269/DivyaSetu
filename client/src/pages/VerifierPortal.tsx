import React, { useState, useEffect } from 'react';
import { certApi, deviceApi } from '../api/client';
import { Device, Verdict } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  Sparkles
} from 'lucide-react';

export const VerifierPortal: React.FC = () => {
  const [queue, setQueue] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Certification Form State
  const [verdict, setVerdict] = useState<Verdict>('SAFE');
  const [notes, setNotes] = useState<string>('Passed mechanical, structural, and hygiene inspection.');

  const fetchQueue = async () => {
    setLoading(true);
    try {
      // Get uncertified or certifying devices
      const devRes = await deviceApi.list();
      const allDevs = devRes.data.devices || [];
      // Any device without a SAFE certification or in CERTIFYING status
      const needsInspection = allDevs.filter(
        (d: Device) => d.status === 'CERTIFYING' || !d.certifications?.some((c) => c.verdict === 'SAFE')
      );
      setQueue(needsInspection.length > 0 ? needsInspection : allDevs.slice(0, 6));
      if (needsInspection.length > 0) {
        setSelectedDevice(needsInspection[0]);
      } else if (allDevs.length > 0) {
        setSelectedDevice(allDevs[0]);
      }
    } catch (e) {
      console.error('Failed to load certification queue', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleCertify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDevice) return;

    setSubmitting(true);
    try {
      await certApi.certify({
        deviceId: selectedDevice.id,
        verdict,
        notes,
        certificateRef: `CERT-${selectedDevice.serial}-${Date.now().toString().slice(-4)}`,
      });

      alert(`✅ Device ${selectedDevice.serial} certified as ${verdict}! Digital ledger updated.`);
      fetchQueue();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Certification failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
              Trust & Safety Authority
            </span>
            <span className="text-xs text-slate-400">Accredited Inspection Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Verifier Certification Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Inspect used assistive equipment, issue cryptographic safety certificates, and uphold device integrity.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 text-teal-800 rounded-lg border border-teal-200 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>PostgreSQL Stored Function: fn_device_is_certified()</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Device Inspection Queue (Left Column) */}
        <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              Pending Inspection ({queue.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Loading inspection queue...
            </div>
          ) : queue.length > 0 ? (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {queue.map((dev) => (
                <button
                  key={dev.id}
                  onClick={() => setSelectedDevice(dev)}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all ${
                    selectedDevice?.id === dev.id
                      ? 'border-teal-500 bg-teal-50/50 shadow-xs'
                      : 'border-slate-200 bg-slate-50 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1">
                    <span className="font-mono">{dev.serial}</span>
                    <StatusBadge status={dev.status} size="sm" />
                  </div>
                  <div className="text-xs font-semibold text-slate-700">
                    {dev.type?.label || dev.type?.category}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>Condition: {dev.condition}</span>
                    <span>{new Date(dev.listedAt).toLocaleDateString()}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              No devices awaiting inspection.
            </div>
          )}
        </div>

        {/* Inspection & Verdict Form (Right Column) */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          {selectedDevice ? (
            <>
              <div className="flex items-start justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                    {selectedDevice.serial}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-1">
                    {selectedDevice.type?.label || selectedDevice.type?.category}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Self-reported condition by donor: <strong>{selectedDevice.condition}</strong>
                  </p>
                </div>
                <StatusBadge status={selectedDevice.status} />
              </div>

              {/* Donor Description */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Equipment Description:
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {selectedDevice.description}
                </p>
              </div>

              {/* Inspection Form */}
              <form onSubmit={handleCertify} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Inspection Verdict
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setVerdict('SAFE')}
                      className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                        verdict === 'SAFE'
                          ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      SAFE FOR USE (Certified)
                    </button>

                    <button
                      type="button"
                      onClick={() => setVerdict('NOT_SAFE')}
                      className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                        verdict === 'NOT_SAFE'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <ShieldAlert className="w-4 h-4" />
                      NOT SAFE (Requires Repair)
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Inspection Audit Notes & Observations
                  </label>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    required
                    placeholder="Document brake performance, structural integrity, sanitization, and tire conditions..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                <div className="p-3 bg-teal-50 rounded-xl border border-teal-100 flex items-start gap-2 text-[11px] text-teal-800">
                  <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    Submitting this certification executes an atomic status transition and appends an immutable entry to <code className="font-mono bg-teal-100 px-1 rounded">audit_log</code>. The device becomes eligible for PostGIS matching queries.
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all"
                >
                  {submitting ? 'Submitting Certificate...' : 'Issue Safety Certificate'}
                </button>
              </form>
            </>
          ) : (
            <div className="p-16 text-center text-slate-400 text-xs">
              Select a device from the queue to start inspection.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
