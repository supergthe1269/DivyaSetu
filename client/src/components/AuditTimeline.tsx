import React from 'react';
import { AuditLog } from '../types';
import { ShieldCheck, Truck, RefreshCw, FileText, UserPlus, CheckCircle2 } from 'lucide-react';

interface AuditTimelineProps {
  entries: AuditLog[];
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({ entries }) => {
  if (!entries || entries.length === 0) {
    return (
      <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
        No trust ledger entries recorded yet.
      </div>
    );
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'SAFE':
      case 'CERTIFY':
        return <ShieldCheck className="w-4 h-4 text-teal-600" />;
      case 'STATUS_CHANGE':
        return <CheckCircle2 className="w-4 h-4 text-sky-600" />;
      case 'ACCEPT':
        return <FileText className="w-4 h-4 text-indigo-600" />;
      case 'TRANSFER':
      case 'DELIVER':
        return <Truck className="w-4 h-4 text-purple-600" />;
      case 'RE_LIST':
        return <RefreshCw className="w-4 h-4 text-cyan-600" />;
      case 'REGISTER':
      case 'LIST':
        return <UserPlus className="w-4 h-4 text-emerald-600" />;
      default:
        return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {entries.map((entry) => (
        <div key={entry.id} className="relative group">
          {/* Node marker */}
          <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-slate-300 group-hover:border-sky-500 flex items-center justify-center shadow-xs transition-colors">
            {getActionIcon(entry.action)}
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-bold text-slate-800 tracking-tight">
                {entry.action.replace('_', ' ')}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {new Date(entry.createdAt).toLocaleString()}
              </span>
            </div>

            <p className="text-xs text-slate-600">
              Target: <span className="font-semibold text-slate-700">{entry.tableName}</span> #{entry.recordId}
              {entry.actorId && (
                <span className="text-slate-400 ml-2">by User #{entry.actorId}</span>
              )}
            </p>

            {entry.payload && (
              <div className="mt-2 p-2 bg-slate-50 rounded border border-slate-100 text-[11px] font-mono text-slate-600 overflow-x-auto">
                {typeof entry.payload === 'object'
                  ? JSON.stringify(entry.payload, null, 2)
                  : String(entry.payload)}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
