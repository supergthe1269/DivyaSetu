import React, { useState, useEffect } from 'react';
import { certApi, deviceApi } from '../api/client';
import { Device, Verdict } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FileCheck,
  Activity
} from 'lucide-react';

export const VerifierPortal: React.FC = () => {
  const [queue, setQueue] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bannerMsg, setBannerMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Certification Form State
  const [verdict, setVerdict] = useState<Verdict>('SAFE');
  const [notes, setNotes] = useState<string>('Passed structural, mechanical, braking, and hygiene sanitization protocol.');
  const [checkpoints, setCheckpoints] = useState({
    structural: true,
    brakes: true,
    hygiene: true,
    ergonomics: true,
  });

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const devRes = await deviceApi.list();
      const allDevs = devRes.data.devices || [];
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
    setBannerMsg(null);

    try {
      const certRef = `CERT-${selectedDevice.serial}-${Date.now().toString().slice(-4)}`;
      await certApi.certify({
        deviceId: selectedDevice.id,
        verdict,
        notes,
        certificateRef: certRef,
      });

      setBannerMsg({
        type: 'success',
        text: `Device ${selectedDevice.serial} successfully certified as ${verdict}! Stored procedure safe_to_transfer executed.`
      });
      fetchQueue();
    } catch (err: any) {
      setBannerMsg({
        type: 'error',
        text: err.response?.data?.error || 'Certification transaction failed'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 pb-safe">
      
      {/* =========================================================================
          PAGE HEADER
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200/80 px-2.5 py-0.5 rounded-full">
              Trust & Safety Authority
            </span>
            <span className="text-xs text-slate-400">Clinical Verification Workbench</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Accredited Quality Inspection Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Verify structural integrity and hygiene of pre-owned mobility aids before they enter the PostGIS circulation pool.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-teal-50 text-teal-800 px-3.5 py-1.5 rounded-xl border border-teal-200/80 text-xs font-bold shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>Accredited Verifier Session</span>
        </div>
      </div>

      {/* Global Notification Banner */}
      {bannerMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-start gap-3 shadow-2xs animate-in fade-in ${
            bannerMsg.type === 'success'
              ? 'bg-emerald-50/95 text-emerald-900 border-emerald-200/90'
              : 'bg-rose-50/95 text-rose-900 border-rose-200/90'
          }`}
        >
          {bannerMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="leading-relaxed">{bannerMsg.text}</div>
        </div>
      )}

      {/* =========================================================================
          TWO-COLUMN WORKSPACE: QUEUE (LEFT) & VERDICT PANEL (RIGHT)
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: INSPECTION QUEUE */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              <span>Pending Inspections ({queue.length})</span>
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
              Loading queue...
            </div>
          ) : queue.length > 0 ? (
            <div className="space-y-3">
              {queue.map((dev) => {
                const isSelected = selectedDevice?.id === dev.id;
                return (
                  <button
                    key={dev.id}
                    onClick={() => setSelectedDevice(dev)}
                    className={`btn-press w-full text-left p-5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-teal-50/80 border-teal-400 ring-2 ring-teal-500/20 shadow-soft'
                        : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-card'
                    }`}
                  >
                    <div className="flex items-start justify-between w-full gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-500">
                            {dev.serial}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {dev.type?.category || 'ASSET'}
                          </span>
                        </div>
                        <h3 className="font-display text-base font-bold text-slate-900 mt-1">
                          {dev.type?.label || dev.type?.category}
                        </h3>
                      </div>
                      <StatusBadge status={dev.status} size="sm" />
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-1 leading-relaxed">
                      {dev.description}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-100/80 w-full">
                      <span className="flex items-center gap-1 font-medium">
                        <Activity className="w-3.5 h-3.5 text-slate-400" />
                        Donor Stated Condition: <strong>{dev.condition}</strong>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/90 space-y-3 shadow-card">
              <ShieldCheck className="w-10 h-10 text-teal-400 mx-auto" />
              <h3 className="font-display font-bold text-base text-slate-800">Inspection queue clear</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                All listed units have been certified. New submissions from donors will appear here automatically.
              </p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: DIAGNOSTIC & CERTIFICATION PANEL */}
        <div className="lg:col-span-7">
          {selectedDevice ? (
            <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-card space-y-6">
              
              {/* Asset Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60">
                      {selectedDevice.serial}
                    </span>
                    <span className="text-xs text-slate-400">Unit ID #{selectedDevice.id}</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-900">
                    {selectedDevice.type?.label || selectedDevice.type?.category}
                  </h3>
                </div>
                <StatusBadge status={selectedDevice.status} />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Donor Technical Notes:
                </span>
                <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 leading-relaxed">
                  {selectedDevice.description}
                </p>
              </div>

              {/* Verifier Clinical Checklist */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider text-[10px] block">
                  Mandatory Inspection Criteria:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200/80 bg-white text-xs font-semibold text-slate-800 cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={checkpoints.structural}
                      onChange={(e) => setCheckpoints({ ...checkpoints, structural: e.target.checked })}
                      className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                    />
                    <span>Structural Frame & Weld Integrity</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200/80 bg-white text-xs font-semibold text-slate-800 cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={checkpoints.brakes}
                      onChange={(e) => setCheckpoints({ ...checkpoints, brakes: e.target.checked })}
                      className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                    />
                    <span>Dual Brakes & Bearing Locks</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200/80 bg-white text-xs font-semibold text-slate-800 cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={checkpoints.hygiene}
                      onChange={(e) => setCheckpoints({ ...checkpoints, hygiene: e.target.checked })}
                      className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                    />
                    <span>Hospital-Grade Sanitization</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200/80 bg-white text-xs font-semibold text-slate-800 cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={checkpoints.ergonomics}
                      onChange={(e) => setCheckpoints({ ...checkpoints, ergonomics: e.target.checked })}
                      className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                    />
                    <span>Ergonomic Restraints & Cushions</span>
                  </label>
                </div>
              </div>

              {/* Form: Verdict Selection & Submission */}
              <form onSubmit={handleCertify} className="space-y-4 pt-2 border-t border-slate-100">
                <div>
                  <span className="block text-xs font-bold text-slate-700 mb-2">
                    Safety Certification Verdict
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setVerdict('SAFE')}
                      className={`btn-press p-3.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                        verdict === 'SAFE'
                          ? 'bg-teal-50 border-teal-500 text-teal-800 ring-2 ring-teal-500/20 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 text-teal-600" />
                      <span>Certified SAFE (Eligible)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVerdict('NOT_SAFE')}
                      className={`btn-press p-3.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                        verdict === 'NOT_SAFE'
                          ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500/20 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      <span>Defective NOT_SAFE (Quarantine)</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Certification Ledger Notes
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-press w-full py-3 bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-soft hover:shadow-glow-teal transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Executing Database Certification...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4" />
                      <span>Sign & Append to Trust Ledger</span>
                    </>
                  )}
                </button>
              </form>

            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/90 space-y-3 shadow-card">
              <p className="text-xs text-slate-500">Select a device from the left queue to conduct diagnostic inspection.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
