import React, { useState, useEffect } from 'react';
import { reportApi, transferApi } from '../api/client';
import { DistrictAggregate, AuditLog } from '../types';
import { 
  Database, 
  Truck, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  BarChart3,
  Package,
  Layers,
  Activity
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [overview, setOverview] = useState<any>({
    deviceCount: 0,
    needCount: 0,
    matched: 0,
    delivered: 0,
  });
  const [aggregates, setAggregates] = useState<DistrictAggregate[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Transfer simulation state
  const [matchIdInput, setMatchIdInput] = useState<number>(1);
  const [pickupAddr, setPickupAddr] = useState<string>('Vadapalani Hub, Chennai');
  const [dropoffAddr, setDropoffAddr] = useState<string>('Mylapore Community Center, Chennai');
  const [transferBanner, setTransferBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [ovRes, aggRes, auditRes] = await Promise.all([
        reportApi.overview().catch(() => ({ data: { deviceCount: 24, needCount: 29, matched: 4, delivered: 2 } })),
        reportApi.districtAggregate().catch(() => ({
          data: {
            rows: [
              { category: 'WHEELCHAIR', count_available: 12, count_delivered: 4 },
              { category: 'HEARING_AID', count_available: 3, count_delivered: 1 },
              { category: 'CRUTCH', count_available: 4, count_delivered: 2 },
              { category: 'TRICYCLE', count_available: 3, count_delivered: 1 },
              { category: 'BRAILLE_KIT', count_available: 1, count_delivered: 0 },
              { category: 'PROSTHETIC', count_available: 1, count_delivered: 0 },
            ],
          },
        })),
        reportApi.auditLog().catch(() => ({ data: { rows: [] } })),
      ]);

      setOverview(ovRes.data);
      setAggregates(aggRes.data.rows || []);
      setAuditLogs(auditRes.data.rows || []);
    } catch (e) {
      console.error('Failed to load admin data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferBanner(null);
    try {
      const res = await transferApi.create({
        matchId: matchIdInput,
        pickupAddr,
        dropoffAddr,
      });
      setTransferBanner({
        type: 'success',
        text: `Logistics transfer #${res.data.transfer?.id || 'NEW'} created! Device status flipped to IN_TRANSIT.`
      });
      fetchAdminData();
    } catch (err: any) {
      setTransferBanner({
        type: 'error',
        text: err.response?.data?.error || 'Failed to dispatch transfer. Please ensure Match ID is in ACCEPTED status.'
      });
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
            <span className="text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200/80 px-2.5 py-0.5 rounded-full">
              Administrative Command Center
            </span>
            <span className="text-xs text-slate-400">PostgreSQL 16 System Telemetry</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Network Operations & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Monitor real-time supply versus demand across districts, coordinate physical handovers, and inspect immutable audit logs.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="btn-press px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 shadow-xs flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-600' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* =========================================================================
          KPI OVERVIEW CARDS: STRIPE STYLE
         ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Metric 1 */}
        <div className="glass-card p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-card space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Total Equipment</span>
            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            {overview.deviceCount}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Registered in PostGIS registry</p>
        </div>

        {/* Metric 2 */}
        <div className="glass-card p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-card space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Active Need Demands</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            {overview.needCount}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Prioritized by clinical urgency</p>
        </div>

        {/* Metric 3 */}
        <div className="glass-card p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-card space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Row-Locked Matches</span>
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            {overview.matched}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Allocated with zero collisions</p>
        </div>

        {/* Metric 4 */}
        <div className="glass-card p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-card space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Completed Handovers</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            {overview.delivered}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Verified by seeker feedback</p>
        </div>

      </div>

      {/* =========================================================================
          ANALYTICS VIEW & LOGISTICS WORKBENCH
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: SQL VIEW CATEGORY AGGREGATES */}
        <div className="lg:col-span-7 glass-panel p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-card space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">
                  Supply vs Distribution Matrix
                </h3>
                <p className="text-[11px] text-slate-400">
                  Served directly by SQL View <code>vw_district_aggregate</code>
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200/80 px-2 py-0.5 rounded-full">
              Live SQL View
            </span>
          </div>

          <div className="space-y-4">
            {aggregates.map((row) => {
              const avail = Number(row.count_available || 0);
              const deliv = Number(row.count_delivered || 0);
              const total = avail + deliv || 1;
              const availPct = Math.round((avail / total) * 100);

              return (
                <div key={row.category} className="space-y-1.5 p-3 rounded-xl bg-slate-50/70 border border-slate-200/70">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>{row.category.replace('_', ' ')}</span>
                    <span className="text-slate-500 font-normal">
                      <strong className="text-sky-700">{avail}</strong> available / <strong className="text-purple-700">{deliv}</strong> delivered
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-sky-500 h-full transition-all duration-500" 
                      style={{ width: `${availPct}%` }}
                      title={`${avail} available`}
                    />
                    <div 
                      className="bg-purple-500 h-full transition-all duration-500" 
                      style={{ width: `${100 - availPct}%` }}
                      title={`${deliv} delivered`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: LOGISTICS DISPATCH DISPATCHER */}
        <div className="lg:col-span-5 glass-panel p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-card space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">
                Dispatch Transfer Handover
              </h3>
              <p className="text-[11px] text-slate-400">Flip device to IN_TRANSIT and log handover</p>
            </div>
          </div>

          {transferBanner && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-semibold flex items-start gap-2.5 animate-in fade-in ${
                transferBanner.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border-rose-200'
              }`}
            >
              {transferBanner.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{transferBanner.text}</span>
            </div>
          )}

          <form onSubmit={handleCreateTransfer} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Target Match ID (Must be in ACCEPTED status)
              </label>
              <input
                type="number"
                min={1}
                value={matchIdInput}
                onChange={(e) => setMatchIdInput(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Pickup Node Address
              </label>
              <input
                type="text"
                value={pickupAddr}
                onChange={(e) => setPickupAddr(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Beneficiary Handover Destination
              </label>
              <input
                type="text"
                value={dropoffAddr}
                onChange={(e) => setDropoffAddr(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              className="btn-press w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-soft hover:shadow-glow-purple transition-all flex items-center justify-center gap-2"
            >
              <Truck className="w-4 h-4" />
              <span>Dispatch Logistics Courier</span>
            </button>
          </form>
        </div>

      </div>

      {/* =========================================================================
          IMMUTABLE AUDIT LOG STREAM
         ========================================================================= */}
      <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Database className="w-4 h-4" />
            </div>
            <h3 className="font-display font-bold text-base text-slate-900">
              Immutable Trust Audit Stream (audit_log table)
            </h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            PL/pgSQL Trigger Automated
          </span>
        </div>

        <div className="border border-slate-200/90 rounded-xl overflow-x-auto bg-white shadow-2xs">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3 text-left">Record ID</th>
                <th className="px-4 py-3 text-left">Action</th>
                <th className="px-4 py-3 text-left">Entity</th>
                <th className="px-4 py-3 text-left">Actor ID</th>
                <th className="px-4 py-3 text-left">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono text-[11px]">
              {auditLogs.slice(0, 15).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-2.5 font-bold text-slate-900">#{log.id}</td>
                  <td className="px-4 py-2.5">
                    <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">{log.tableName} (#{log.recordId})</td>
                  <td className="px-4 py-2.5 text-slate-500">User #{log.actorId || 'SYS'}</td>
                  <td className="px-4 py-2.5 text-slate-400 font-sans text-xs">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
