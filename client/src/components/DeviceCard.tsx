import React from 'react';
import { Link } from 'react-router-dom';
import { Device } from '../types';
import { StatusBadge } from './StatusBadge';
import { 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  Activity, 
  Calendar,
  Accessibility,
  Volume2,
  Milestone,
  Bike,
  BookOpen,
  Cpu
} from 'lucide-react';

interface DeviceCardProps {
  device: Device;
  distKm?: number;
}

const getCategoryMeta = (cat: string) => {
  switch (cat) {
    case 'WHEELCHAIR':
      return { Icon: Accessibility, bg: 'bg-sky-50 text-sky-700 border-sky-100' };
    case 'HEARING_AID':
      return { Icon: Volume2, bg: 'bg-purple-50 text-purple-700 border-purple-100' };
    case 'CRUTCH':
      return { Icon: Milestone, bg: 'bg-teal-50 text-teal-700 border-teal-100' };
    case 'TRICYCLE':
      return { Icon: Bike, bg: 'bg-amber-50 text-amber-700 border-amber-100' };
    case 'BRAILLE_KIT':
      return { Icon: BookOpen, bg: 'bg-indigo-50 text-indigo-700 border-indigo-100' };
    case 'PROSTHETIC':
      return { Icon: Cpu, bg: 'bg-rose-50 text-rose-700 border-rose-100' };
    default:
      return { Icon: Accessibility, bg: 'bg-slate-50 text-slate-700 border-slate-100' };
  }
};

export const DeviceCard: React.FC<DeviceCardProps> = ({ device, distKm }) => {
  const isSafe = device.certifications?.some((c) => c.verdict === 'SAFE');
  const cat = device.type?.category || 'WHEELCHAIR';
  const { Icon, bg } = getCategoryMeta(cat);

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-slate-200/90 shadow-card hover:shadow-hover hover:border-sky-300/80 transition-all flex flex-col justify-between group">
      <div className="p-5 sm:p-6 space-y-4">
        
        {/* Top Header: Category Icon, Serial & Status Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${bg} shadow-2xs group-hover:scale-105 transition-transform`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span className="font-mono text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                {device.serial}
              </span>
              <h3 className="font-display text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors line-clamp-1">
                {device.type?.label || cat}
              </h3>
            </div>
          </div>
          <StatusBadge status={device.status} size="sm" />
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {device.description}
        </p>

        {/* Technical Ledger Tags */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100/80 text-xs">
          <span className="inline-flex items-center gap-1 font-semibold bg-slate-50 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/60">
            <Activity className="w-3.5 h-3.5 text-sky-600" />
            <span>{device.condition}</span>
          </span>

          {isSafe && (
            <span className="inline-flex items-center gap-1 font-semibold bg-teal-50/80 text-teal-800 px-2.5 py-1 rounded-lg border border-teal-200/60">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Certified SAFE</span>
            </span>
          )}

          {distKm != null && (
            <span className="inline-flex items-center gap-1 font-semibold bg-sky-50/80 text-sky-800 px-2.5 py-1 rounded-lg border border-sky-200/60 ml-auto">
              <MapPin className="w-3.5 h-3.5 text-sky-600" />
              <span>{distKm} km</span>
            </span>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-5 sm:px-6 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          {new Date(device.listedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        <Link
          to={`/devices/${device.id}`}
          className="btn-press inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 hover:text-sky-900 group-hover:translate-x-0.5 transition-all"
        >
          <span>Inspect Ledger</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
