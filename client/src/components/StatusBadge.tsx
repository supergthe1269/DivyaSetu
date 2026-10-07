import React from 'react';
import { DeviceStatus, Verdict, MatchStatus, TransferStatus } from '../types';
import { CheckCircle2, AlertCircle, Clock, Truck, ShieldCheck, ShieldAlert, RefreshCw } from 'lucide-react';

interface StatusBadgeProps {
  status: DeviceStatus | Verdict | MatchStatus | TransferStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  let bg = 'bg-slate-50 text-slate-700 border-slate-200/80';
  let dotColor = 'bg-slate-400';
  let Icon = Clock;

  switch (status) {
    case 'AVAILABLE':
      bg = 'bg-emerald-50/80 text-emerald-800 border-emerald-200/80';
      dotColor = 'bg-emerald-500';
      Icon = CheckCircle2;
      break;
    case 'SAFE':
      bg = 'bg-teal-50/80 text-teal-800 border-teal-200/80';
      dotColor = 'bg-teal-500';
      Icon = ShieldCheck;
      break;
    case 'CERTIFYING':
    case 'PENDING':
      bg = 'bg-amber-50/80 text-amber-800 border-amber-200/80';
      dotColor = 'bg-amber-500 animate-pulse';
      Icon = Clock;
      break;
    case 'NOT_SAFE':
      bg = 'bg-rose-50/80 text-rose-800 border-rose-200/80';
      dotColor = 'bg-rose-500';
      Icon = ShieldAlert;
      break;
    case 'MATCHED':
    case 'ACCEPTED':
      bg = 'bg-sky-50/80 text-sky-800 border-sky-200/80';
      dotColor = 'bg-sky-500';
      Icon = CheckCircle2;
      break;
    case 'IN_TRANSIT':
    case 'PICKED_UP':
      bg = 'bg-indigo-50/80 text-indigo-800 border-indigo-200/80';
      dotColor = 'bg-indigo-500 animate-pulse';
      Icon = Truck;
      break;
    case 'DELIVERED':
      bg = 'bg-purple-50/80 text-purple-800 border-purple-200/80';
      dotColor = 'bg-purple-500';
      Icon = CheckCircle2;
      break;
    case 'RE_LISTED':
      bg = 'bg-cyan-50/80 text-cyan-800 border-cyan-200/80';
      dotColor = 'bg-cyan-500';
      Icon = RefreshCw;
      break;
    case 'REJECTED':
    case 'CANCELLED':
      bg = 'bg-rose-50/80 text-rose-800 border-rose-200/80';
      dotColor = 'bg-rose-500';
      Icon = AlertCircle;
      break;
    default:
      break;
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${bg} ${padding} tracking-wide shadow-2xs backdrop-blur-xs`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{status.replace('_', ' ')}</span>
    </span>
  );
};
