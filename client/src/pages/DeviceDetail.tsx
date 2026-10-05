import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { deviceApi, reportApi } from '../api/client';
import { Device, AuditLog } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { AuditTimeline } from '../components/AuditTimeline';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Calendar, 
  MapPin, 
  Activity
} from 'lucide-react';

export const DeviceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [device, setDevice] = useState<Device | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [candidateNeeds, setCandidateNeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeviceData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // Find in device list
        const devListRes = await deviceApi.list();
        const found = devListRes.data.devices?.find((d: Device) => d.id === Number(id));
        setDevice(found || null);

        // Fetch candidate matches
        const matchRes = await deviceApi.getMatches(Number(id)).catch(() => ({ data: { matches: [] } }));
        setCandidateNeeds(matchRes.data.matches || []);

        // Fetch audit logs
        const auditRes = await reportApi.auditLog().catch(() => ({ data: { rows: [] } }));
        const relevantLogs = (auditRes.data.rows || []).filter(
          (log: AuditLog) => log.tableName === 'devices' && log.recordId === Number(id)
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
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-500">
        <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        Loading digital twin ledger...
      </div>
    );
  }

  if (!device) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-slate-600">Device not found or has been archived.</p>
        <Link to="/" className="text-xs font-semibold text-sky-600 hover:underline inline-flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Discover
        </Link>
      </div>
    );
  }

  const latestCert = device.certifications?.[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </Link>

      {/* Main Asset Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                {device.serial}
              </span>
              <span className="text-xs text-slate-400">Digital Twin ID #{device.id}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {device.type?.label || device.type?.category}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={device.status} />
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">Condition</span>
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
              <Activity className="w-4 h-4 text-sky-600" />
              {device.condition}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">Listed On</span>
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
              <Calendar className="w-4 h-4 text-sky-600" />
              {new Date(device.listedAt).toLocaleDateString()}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">Coordinates</span>
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
              <MapPin className="w-4 h-4 text-sky-600" />
              {device.lat && device.lng
                ? `${device.lat.toFixed(3)}, ${device.lng.toFixed(3)}`
                : 'Central Node'}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">Safety Ledger</span>
            <div className="flex items-center gap-1.5 font-bold text-teal-700 text-sm">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              {latestCert?.verdict || 'PENDING'}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Device Details</h3>
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100">
            {device.description}
          </p>
        </div>

        {/* Verifier Certificate Details */}
        {latestCert && (
          <div className="bg-teal-50/60 border border-teal-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <h4 className="text-sm font-bold text-teal-900">
                  Verification Certificate: {latestCert.certificateRef || `CERT-${latestCert.id}`}
                </h4>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                VERDICT: {latestCert.verdict}
              </span>
            </div>
            <p className="text-xs text-teal-800 leading-relaxed">
              <strong>Inspector Notes:</strong> {latestCert.notes || 'Passed mechanical & physical safety inspection.'}
            </p>
            <div className="text-[11px] text-teal-700/80 flex items-center gap-4">
              <span>Inspected: {latestCert.inspectedAt ? new Date(latestCert.inspectedAt).toLocaleDateString() : 'Active'}</span>
              <span>Expires: {latestCert.expiresAt ? new Date(latestCert.expiresAt).toLocaleDateString() : '1 Year'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Candidate Needs (PostGIS Matching Demonstration) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              PostGIS Geospatial Match Candidates
            </h3>
            <p className="text-xs text-slate-500">
              Evaluated with <code className="text-sky-700 font-mono">ST_Distance(need.geom, device.geometry)</code> and urgency window weighting.
            </p>
          </div>
          <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100">
            {candidateNeeds.length} Potential Needs
          </span>
        </div>

        {candidateNeeds.length > 0 ? (
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
            {candidateNeeds.map((cand, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-800">
                    Need #{cand.need_id} • Urgency: {cand.urgency_hours ?? 48} hours
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-sky-600" />
                      {cand.dist_km} km away
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                    High Fit
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic p-4 bg-slate-50 rounded-xl text-center">
            No open needs within the immediate matching radius for this category.
          </p>
        )}
      </div>

      {/* Trust Ledger Audit Trail */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Immutable Digital Trust Ledger
          </h3>
          <p className="text-xs text-slate-500">
            Every state transition, certification event, and handover is cryptographically logged in <code className="text-sky-700 font-mono">audit_log</code>.
          </p>
        </div>
        <AuditTimeline entries={auditLogs} />
      </div>
    </div>
  );
};
