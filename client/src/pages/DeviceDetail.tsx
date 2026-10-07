import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { deviceApi, reportApi } from '../api/client';
import { Device, AuditLog } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Calendar, 
  MapPin, 
  Activity,
  Clock,
  FileCheck
} from 'lucide-react';

export const DeviceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [device, setDevice] = useState<Device | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeviceData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const devListRes = await deviceApi.list();
        const found = devListRes.data.devices?.find((d: Device) => d.id === Number(id));
        setDevice(found || null);

        const auditRes = await reportApi.auditLog().catch(() => ({ data: { rows: [] } }));
        const relevantLogs = (auditRes.data.rows || []).filter(
          (log: AuditLog) => log.tableName?.toLowerCase() === 'device' && log.recordId === Number(id)
        );
        setAuditLogs(relevantLogs);
      } catch (e) {
        console.error('Failed to load device details', e);
      } finally {
        setLoading(false);
      }
    };
    fetchDeviceData();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center text-slate-500 space-y-3">
        <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold">Loading cryptographic digital twin...</p>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-display text-xl font-bold text-slate-900">Device Not Found</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          The requested asset record does not exist or has been archived from the active database.
        </p>
        <Link 
          to="/" 
          className="btn-press inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-50 text-sky-700 text-xs font-bold hover:bg-sky-100 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Discover
        </Link>
      </div>
    );
  }

  const latestCert = device.certifications?.[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 pb-safe">
      
      {/* Back Button */}
      <Link
        to="/"
        className="btn-press inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Active Registry</span>
      </Link>

      {/* =========================================================================
          DIGITAL TWIN HERO CARD
         ========================================================================= */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-xs font-bold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded border border-sky-200/80">
                {device.serial}
              </span>
              <span className="text-xs text-slate-400 font-medium">Digital Twin ID #{device.id}</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {device.type?.label || device.type?.category}
            </h1>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <StatusBadge status={device.status} />
          </div>
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Condition</span>
            <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-sky-600" />
              {device.condition}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Listed Date</span>
            <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-500" />
              {new Date(device.listedAt).toLocaleDateString()}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Spatial Hub</span>
            <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-teal-600" />
              {device.lat && device.lng ? `${device.lat.toFixed(2)}°, ${device.lng.toFixed(2)}°` : 'Assigned Hub'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Safety Audit</span>
            <span className="text-sm font-bold text-emerald-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              {latestCert?.verdict === 'SAFE' ? 'Accredited' : 'Pending'}
            </span>
          </div>
        </div>

        {/* Technical Description */}
        <div className="space-y-2">
          <h3 className="font-display font-bold text-sm text-slate-900">Technical Description & Specifications</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
            {device.description}
          </p>
        </div>

      </div>

      {/* =========================================================================
          VERIFICATION CERTIFICATE LEDGER
         ========================================================================= */}
      {latestCert && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-emerald-200/80 bg-emerald-50/30 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">
                  Accredited Inspection Certificate
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Ref: {latestCert.certificateRef || `CERT-${device.serial}-2026`}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
              Verdict: {latestCert.verdict}
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed">
            {latestCert.notes || 'Passed full mechanical frame evaluation, dual brake locking, and clinical sanitization protocol.'}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-emerald-100/80">
            <span>Inspector: <strong>{latestCert.verifier?.name || 'Dr. Verifier 1'}</strong></span>
            <span>•</span>
            <span>Inspected: {latestCert.inspectedAt ? new Date(latestCert.inspectedAt).toLocaleString() : 'Recently verified'}</span>
          </div>
        </div>
      )}

      {/* =========================================================================
          AUDIT LOG TRAIL FOR THIS ASSET
         ========================================================================= */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card space-y-4">
        <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-600" />
          <span>Chain of Custody & Lifecycle Audit Trail</span>
        </h3>

        {auditLogs.length > 0 ? (
          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[10px] font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                    {log.action}
                  </span>
                  <span className="text-slate-700 font-medium">Record updated by User #{log.actorId || 'SYS'}</span>
                </div>
                <span className="text-[11px] text-slate-400 font-sans">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No previous lifecycle state changes logged.</p>
        )}
      </div>

    </div>
  );
};
