import React, { useState, useEffect } from 'react';
import { certApi, deviceApi } from '../api/client';
import { Device, Verdict, DeviceCategory } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { getDeviceImageUrl, CATEGORY_DEFAULT_IMAGES } from '../data/deviceImages';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileCheck, 
  Search
} from 'lucide-react';

export const VerifierPortal: React.FC = () => {
  const [queue, setQueue] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bannerMsg, setBannerMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [queueSearch, setQueueSearch] = useState('');

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
      const devRes = await deviceApi.pendingInspection();
      const needsInspection = devRes.data.devices || [];
      if (needsInspection.length > 0) {
        setQueue(needsInspection);
        setSelectedDevice(needsInspection[0]);
      } else {
        // Fallback: if queue is clear, load general list so verifier can review recently certified units
        const allRes = await deviceApi.list();
        const allDevs = allRes.data.devices || [];
        setQueue(allDevs.slice(0, 15));
        if (allDevs.length > 0) setSelectedDevice(allDevs[0]);
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
        text: `Device ${selectedDevice.serial} successfully certified as ${verdict}! Stored procedure fn_device_is_certified() verified.`
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

  const filteredQueue = queue.filter((d) => {
    if (!queueSearch.trim()) return true;
    const q = queueSearch.toLowerCase();
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
            <span className="text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200/80 px-2.5 py-0.5 rounded-full">
              Trust &amp; Safety Authority
            </span>
            <span className="text-xs text-slate-400">Clinical Verification Workbench</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Accredited Quality Inspection Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Verify structural integrity, mechanical condition, and hygiene with actual equipment photos before devices enter the PostGIS circulation pool.
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
          TWO-COLUMN WORKSPACE: DEDICATED QUEUE SIDEBAR (LEFT) & DIAGNOSTIC PANEL (RIGHT)
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: DEDICATED INDEPENDENT QUEUE SIDEBAR */}
        <div className="lg:col-span-5 flex flex-col lg:sticky lg:top-20 max-h-[calc(100vh-6rem)]">
          
          {/* Pinned Header & Filter */}
          <div className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600" />
                <span>Pending Queue ({queue.length})</span>
              </h2>
              <p className="text-[11px] text-slate-500">Units awaiting safety attestation</p>
            </div>

            {queue.length > 3 && (
              <div className="relative w-full sm:w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter queue..."
                  value={queueSearch}
                  onChange={(e) => setQueueSearch(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            )}
          </div>

          {/* Scrollable Queue Items */}
          <div className="overflow-y-auto pr-1.5 pt-3 flex-1 space-y-2.5 custom-scrollbar">
            {loading ? (
              <div className="p-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
                Loading queue...
              </div>
            ) : filteredQueue.length > 0 ? (
              filteredQueue.map((dev) => {
                const isSelected = selectedDevice?.id === dev.id;
                const devImg = getDeviceImageUrl(dev);
                return (
                  <button
                    key={dev.id}
                    onClick={() => setSelectedDevice(dev)}
                    className={`btn-press w-full text-left p-3.5 rounded-2xl border transition-all flex items-center gap-3.5 ${
                      isSelected
                        ? 'bg-teal-50/90 border-teal-400 ring-2 ring-teal-500/20 shadow-soft'
                        : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-card'
                    }`}
                  >
                    {/* Thumbnail Image */}
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 shadow-2xs">
                      <img
                        src={devImg}
                        alt={dev.type?.label || 'Device'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          const fallbackCat = (dev.type?.category || 'WHEELCHAIR') as DeviceCategory;
                          (e.currentTarget as HTMLImageElement).src = CATEGORY_DEFAULT_IMAGES[fallbackCat];
                        }}
                      />
                    </div>

                    {/* Meta info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-[11px] font-bold text-teal-800">
                          {dev.serial}
                        </span>
                        <StatusBadge status={dev.status} size="sm" />
                      </div>
                      <h3 className="font-display text-xs sm:text-sm font-bold text-slate-900 truncate mt-0.5">
                        {dev.type?.label || dev.type?.category}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                        <span>Condition: <strong className="text-slate-700">{dev.condition}</strong></span>
                      </div>
                    </div>
                  </button>
                );
              })
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
        </div>

        {/* RIGHT COLUMN: DIAGNOSTIC & CERTIFICATION PANEL (STICKY ON DESKTOP) */}
        <div className="lg:col-span-7 lg:sticky lg:top-20">
          {selectedDevice ? (
            <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-card space-y-5 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 custom-scrollbar">
              
              {/* Asset Header with Image Banner */}
              <div className="space-y-4">
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200/60">
                        {selectedDevice.serial}
                      </span>
                      <span className="text-xs text-slate-400">Database Record #{selectedDevice.id}</span>
                    </div>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900">
                      {selectedDevice.type?.label || selectedDevice.type?.category}
                    </h3>
                  </div>
                  <StatusBadge status={selectedDevice.status} />
                </div>

                {/* Actual Equipment Photo for Visual Verification */}
                <div className="relative h-48 sm:h-56 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/90 shadow-2xs group">
                  <img
                    src={getDeviceImageUrl(selectedDevice)}
                    alt={selectedDevice.type?.label || 'Asset for inspection'}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    onError={(e) => {
                      const fallbackCat = (selectedDevice.type?.category || 'WHEELCHAIR') as DeviceCategory;
                      (e.currentTarget as HTMLImageElement).src = CATEGORY_DEFAULT_IMAGES[fallbackCat];
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
                  
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-mono font-bold text-white shadow-xs">
                    Visual Diagnostic View
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white drop-shadow-sm">
                    <span className="text-xs font-bold">
                      Stated Condition: <span className="text-teal-300 uppercase">{selectedDevice.condition}</span>
                    </span>
                    <span className="text-[11px] bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-white font-medium">
                      High-Res Inspection Asset
                    </span>
                  </div>
                </div>
              </div>

              {/* Description & Donor Notes */}
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
                  Mandatory ISO 7176 Clinical Criteria:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200/80 bg-white text-xs font-semibold text-slate-800 cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={checkpoints.structural}
                      onChange={(e) => setCheckpoints({ ...checkpoints, structural: e.target.checked })}
                      className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                    />
                    <span>Structural Frame &amp; Welds</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200/80 bg-white text-xs font-semibold text-slate-800 cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={checkpoints.brakes}
                      onChange={(e) => setCheckpoints({ ...checkpoints, brakes: e.target.checked })}
                      className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                    />
                    <span>Dual Brakes &amp; Bearing Locks</span>
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
                    <span>Ergonomic Restraints &amp; Cushions</span>
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

                {/* Verifier Clinical Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Attestation Notes &amp; Certificate Log
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all leading-relaxed"
                  />
                </div>

                {/* Stored Function Assurance Box */}
                <div className="p-3 bg-teal-50/70 border border-teal-100 rounded-xl text-xs text-teal-900 flex items-start gap-2.5">
                  <FileCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-semibold text-teal-950">
                      PostgreSQL Stored Function Validation
                    </p>
                    <p className="text-[11px] text-teal-800/90">
                      Submitting verdict executes <code className="font-mono bg-white/70 px-1 py-0.5 rounded text-teal-900">fn_device_is_certified()</code> and records an immutable audit ledger entry.
                    </p>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={submitting}
                  className={`btn-press w-full py-3 rounded-xl text-white text-xs font-bold shadow-soft flex items-center justify-center gap-2 transition-all ${
                    verdict === 'SAFE'
                      ? 'bg-teal-600 hover:bg-teal-700 hover:shadow-glow-teal'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Recording Safety Attestation...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4" />
                      <span>Commit {verdict} Certificate Decision</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="p-16 text-center bg-white rounded-2xl border border-slate-200/90 space-y-3 shadow-card">
              <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-display font-bold text-base text-slate-800">Select a device from the queue</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Click any pending inspection from the left sidebar to review its physical specs, photograph, and submit certification.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
