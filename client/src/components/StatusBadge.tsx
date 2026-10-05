import React from 'react';
import { DeviceStatus, Verdict, MatchStatus, TransferStatus } from '../types';
import { CheckCircle2, AlertCircle, Clock, Truck, ShieldCheck, ShieldAlert, RefreshCw } from 'lucide-react';

interface StatusBadgeProps {
  status: DeviceStatus | Verdict | MatchStatus | TransferStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  let bg = 'bg-slate-100 text-slate-700 border-slate-200';
  let Icon = Clock;

  switch (status) {
    case 'AVAILABLE':
      bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      Icon = CheckCircle2;
      break;
    case 'SAFE':
      bg = 'bg-teal-50 text-teal-700 border-teal-200';
      Icon = ShieldCheck;
      break;
    case 'CERTIFYING':
    case 'PENDING':
      bg = 'bg-amber-50 text-amber-700 border-amber-200';
      Icon = Clock;
      break;
    case 'NOT_SAFE':
      bg = 'bg-rose-50 text-rose-700 border-rose-200';
      Icon = ShieldAlert;
      break;
    case 'MATCHED':
    case 'ACCEPTED':
      bg = 'bg-sky-50 text-sky-700 border-sky-200';
      Icon = CheckCircle2;
      break;
    case 'IN_TRANSIT':
    case 'PICKED_UP':
      bg = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      Icon = Truck;
      break;
    case 'DELIVERED':
      bg = 'bg-purple-50 text-purple-700 border-purple-200';
      Icon = CheckCircle2;
      break;
    case 'RE_LISTED':
      bg = 'bg-cyan-50 text-cyan-700 border-cyan-200';
      Icon = RefreshCw;
      break;
    case 'REJECTED':
    case 'CANCELLED':
      bg = 'bg-rose-50 text-rose-700 border-rose-200';
      Icon = AlertCircle;
      break;
    default:
      break;
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${bg} ${padding}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {status.replace('_', ' ')}
    </span>
  );
};
