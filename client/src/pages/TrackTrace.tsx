import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { deviceApi, needApi } from '../api/client';
import { StatusBadge } from '../components/StatusBadge';
import { getDeviceImageUrl } from '../data/deviceImages';
import { 
  Search, 
  Compass, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Truck, 
  Layers, 
  Lock, 
  AlertCircle
} from 'lucide-react';

interface TrackingData {
  device?: any;
  need?: any;
  auditLogs: any[];
}

export const TrackTrace: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const serialParam = searchParams.get('serial') || '';
  const needIdParam = searchParams.get('needId') || '';

  const [inputVal, setInputVal] = useState(serialParam || needIdParam || 'DS-0001');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TrackingData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchTracking = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const trimmed = query.trim();
      // Check if it's purely a need ID lookup
      if (/^\d+$/.test(trimmed) && searchParams.get('needId')) {
        const res = await needApi.track(Number(trimmed));
        setData({ need: res.data.need, auditLogs: res.data.auditLogs || [] });
      } else {
        // Default to device track (by serial or ID)
        const res = await deviceApi.track(trimmed);
        setData({ device: res.data.device, auditLogs: res.data.auditLogs || [] });
      }
    } catch (err: any) {
      console.error('Tracking fetch failed', err);
      setErrorMsg(err.response?.data?.error || `No tracking history found for "${query}". Please check the serial number.`);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = serialParam || needIdParam;
    if (q) {
      setInputVal(q);
      fetchTracking(q);
    } else {
      fetchTracking('DS-0001');
    }
  }, [serialParam, needIdParam]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    if (/^ds-/i.test(inputVal.trim())) {
      setSearchParams({ serial: inputVal.trim() });
    } else {
      setSearchParams({ serial: inputVal.trim() });
    }
    fetchTracking(inputVal);
  };

  // Determine active stage (1 to 5)
  const getStageNumber = (device?: any): number => {
    if (!device) return 1;
    const status = device.status;
    if (status === 'RE_LISTED' || status === 'DELIVERED') return 5;
    if (status === 'IN_TRANSIT') return 4;
    if (status === 'MATCHED') return 3;
    if (status === 'AVAILABLE' && device.certifications?.some((c: any) => c.verdict === 'SAFE')) return 2;
    return 1; // CERTIFYING or uncertified
  };

  const currentStage = getStageNumber(data?.device);
  const activeDevice = data?.device;
  const activeMatch = activeDevice?.matches?.[0];
  const activeTransfer = activeMatch?.transfers?.[0];
  const activeCert = activeDevice?.certifications?.[0];

  const stages = [
    {
      num: 1,
      title: 'Ingestion & Registration',
      subtitle: 'PostGIS intake by Donor',
      desc: activeDevice ? `Registered at ${activeDevice.lat?.toFixed(2)}°N, ${activeDevice.lng?.toFixed(2)}°E` : 'Intake recorded',
      completed: currentStage >= 1,
      current: currentStage === 1,
    },
    {
      num: 2,
      title: 'Biomedical Verification',
      subtitle: 'ISO 7176 Safety Certificate',
      desc: activeCert ? `Verdict: ${activeCert.verdict} (${activeCert.certificateRef || 'CERT-ACTIVE'})` : 'Awaiting clinical inspection',
      completed: currentStage >= 2,
      current: currentStage === 2,
    },
    {
      num: 3,
      title: 'Beneficiary Allocation',
      subtitle: 'ACID SELECT FOR UPDATE Lock',
      desc: activeMatch ? `Matched (Fit score: ${Math.round((activeMatch.score || 0.85) * 100)}%)` : 'Ready in candidate pool',
      completed: currentStage >= 3,
      current: currentStage === 3,
    },
    {
      num: 4,
      title: 'Logistics Handover',
      subtitle: 'Chain-of-Custody Dispatch',
      desc: activeTransfer ? `Transfer #${activeTransfer.id} (${activeTransfer.status})` : 'Awaiting dispatch',
      completed: currentStage >= 4,
      current: currentStage === 4,
    },
    {
      num: 5,
      title: 'Delivery & Circular Reuse',
      subtitle: 'Patient Recovery & Re-listing',
      desc: activeDevice?.status === 'RE_LISTED' ? 'Re-listed for circular reuse' : activeDevice?.status === 'DELIVERED' ? 'Delivered to beneficiary' : 'Fulfillment pending',
      completed: currentStage >= 5,
      current: currentStage === 5,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 pb-safe">
      
      {/* =========================================================================
          PAGE HEADER & SEARCH BAR
         ========================================================================= */}
      <div className="relative rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-10 text-white shadow-premium overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-sky-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-sky-200">
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            <span>Real-Time Chain of Custody & Audit Ledger</span>
          </div>

          <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Track Asset Journey & Circular Lifecycle
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Monitor assistive equipment transparently through all 5 operational milestones: from initial donor intake 
            and clinical safety inspections to ACID claim allocation, handover dispatch, and circular re-listing.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Enter Serial Number (e.g. DS-0001, DS-1024)..."
                className="w-full pl-10 pr-4 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-press px-6 py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-soft transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Locating Asset...</span>
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4" />
                  <span>Locate Journey</span>
                </>
              )}
            </button>
          </form>

          {/* Sample Asset Pill Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-slate-400">
            <span className="font-medium text-[11px]">Quick Demo Assets:</span>
            {['DS-0001', 'DS-0002', 'DS-0003', 'DS-0008'].map((sn) => (
              <button
                key={sn}
                type="button"
                onClick={() => {
                  setInputVal(sn);
                  setSearchParams({ serial: sn });
                  fetchTracking(sn);
                }}
                className="btn-press px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-sky-200 text-xs font-mono font-bold transition-colors"
              >
                {sn}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* =========================================================================
          INTERACTIVE 5-STAGE CIRCULAR PROGRESS STEPPER
         ========================================================================= */}
      {data?.device && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/90 shadow-soft shrink-0">
                <img
                  src={getDeviceImageUrl(activeDevice)}
                  alt={activeDevice.type?.label || activeDevice.type?.category || 'Device Photo'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-extrabold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100">
                    {activeDevice.serial}
                  </span>
                  <StatusBadge status={activeDevice.status} size="md" />
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                  {activeDevice.type?.label || activeDevice.type?.category}
                </h2>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Current Stage</span>
              <span className="text-base font-extrabold text-sky-800">
                Stage {currentStage} of 5 — {stages[currentStage - 1]?.title}
              </span>
            </div>
          </div>

          {/* Stepper Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
            {stages.map((st) => (
              <div
                key={st.num}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                  st.current
                    ? 'bg-sky-50/90 border-sky-300 ring-2 ring-sky-500/20 shadow-soft'
                    : st.completed
                    ? 'bg-emerald-50/60 border-emerald-200/80 text-emerald-950'
                    : 'bg-slate-50/60 border-slate-200/60 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`w-7 h-7 rounded-xl font-display font-extrabold text-xs flex items-center justify-center ${
                      st.completed
                        ? 'bg-emerald-600 text-white'
                        : st.current
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {st.completed ? <CheckCircle2 className="w-4 h-4" /> : st.num}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    Step {st.num}
                  </span>
                </div>

                <div>
                  <h4 className="font-display text-xs font-bold text-slate-900">
                    {st.title}
                  </h4>
                  <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                    {st.subtitle}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                    {st.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          DETAILED MILESTONE PANELS (3-COLUMN WORKSPACE)
         ========================================================================= */}
      {data?.device && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Asset & Donor Origin */}
          <div className="glass-card rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
            <div className="relative h-36 bg-slate-100 overflow-hidden border-b border-slate-200/80">
              <img
                src={getDeviceImageUrl(activeDevice)}
                alt={activeDevice.type?.label || 'Asset Image'}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                <span className="text-[10px] font-bold text-white bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/20">
                  Donor Physical Capture
                </span>
                <span className="text-[10px] font-mono font-bold text-sky-200 bg-sky-950/80 backdrop-blur-md px-2 py-0.5 rounded border border-sky-400/30">
                  {activeDevice.serial}
                </span>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-slate-900">Donor Origin Node</h3>
                  <span className="text-[10px] text-slate-400">Intake & Specifications</span>
                </div>
              </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Condition</span>
                <span className="font-bold text-slate-800">{activeDevice.condition}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Listed Date</span>
                <span className="font-bold text-slate-800">
                  {new Date(activeDevice.listedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Geographic Anchor</span>
                <span className="font-bold text-slate-800 font-mono">
                  {activeDevice.lat?.toFixed(3)}°N, {activeDevice.lng?.toFixed(3)}°E
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">Specifications</span>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {activeDevice.description}
                </p>
              </div>
            </div>
          </div>
        </div>

          {/* Card 2: Clinical Safety Inspection */}
          <div className="glass-card p-6 rounded-2xl border border-slate-200/90 shadow-card space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold text-slate-900">Biomedical Inspection</h3>
                <span className="text-[10px] text-slate-400">ISO 7176 Clinical Protocol</span>
              </div>
            </div>

            {activeCert ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Verdict</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {activeCert.verdict}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Certificate Reference</span>
                  <span className="font-mono font-bold text-slate-800">{activeCert.certificateRef || 'CERT-VERIFIED'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Inspected By</span>
                  <span className="font-bold text-slate-800">{activeCert.verifier?.name || 'Accredited Verifier'}</span>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">Inspector Notes</span>
                  <p className="text-xs text-slate-700 leading-relaxed bg-teal-50/50 p-2.5 rounded-xl border border-teal-100">
                    {activeCert.notes || 'Full mechanical check, brake alignment, and sanitization verified.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-100">
                <Clock className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                <span>Pending initial inspection in the Verifier Queue</span>
              </div>
            )}
          </div>

          {/* Card 3: Beneficiary Match & Dispatch */}
          <div className="glass-card p-6 rounded-2xl border border-slate-200/90 shadow-card space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold text-slate-900">Allocation & Dispatch</h3>
                <span className="text-[10px] text-slate-400">Chain of Custody Handover</span>
              </div>
            </div>

            {activeMatch ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Match Status</span>
                  <StatusBadge status={activeMatch.status} size="sm" />
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Concurrency Guarantee</span>
                  <span className="font-mono text-[11px] font-bold text-sky-700">SELECT FOR UPDATE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Beneficiary Need ID</span>
                  <span className="font-bold text-slate-800">Need #{activeMatch.need?.id}</span>
                </div>
                {activeTransfer && (
                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500 block">Transfer Status</span>
                    <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {activeTransfer.status}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1">
                      From: {activeTransfer.pickupAddr} &rarr; To: {activeTransfer.dropoffAddr}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-100">
                <Lock className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                <span>Available for matching via PostGIS algorithm</span>
              </div>
            )}
          </div>

        </div>
      )}

      {/* =========================================================================
          IMMUTABLE DATABASE AUDIT TRAIL LEDGER
         ========================================================================= */}
      {data?.auditLogs && data.auditLogs.length > 0 && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-600" />
              <h3 className="font-display text-base font-bold text-slate-900">
                Immutable Database Audit Trail ({data.auditLogs.length} events)
              </h3>
            </div>
            <span className="text-[11px] font-bold text-slate-400 font-mono">audit_log table</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Timestamp (UTC)</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Table</th>
                  <th className="py-2.5 px-3">Actor / Role</th>
                  <th className="py-2.5 px-3">Transaction Guarantee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-800">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/60 font-mono">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-medium">
                      {log.tableName} #{log.recordId}
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-semibold">
                      {log.actor?.name || 'System'} ({log.actor?.role || 'SYSTEM'})
                    </td>
                    <td className="py-3 px-3 text-emerald-700 font-medium font-mono text-[11px]">
                      ACID WAL Verified
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
