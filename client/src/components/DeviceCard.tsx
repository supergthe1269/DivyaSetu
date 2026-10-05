import React from 'react';
import { Link } from 'react-router-dom';
import { Device } from '../types';
import { StatusBadge } from './StatusBadge';
import { MapPin, ShieldCheck, ArrowRight, Activity, Calendar } from 'lucide-react';

interface DeviceCardProps {
  device: Device;
  distKm?: number;
}

const CATEGORY_ICONS: Record<string, string> = {
  WHEELCHAIR: '🦽',
  HEARING_AID: '🦻',
  CRUTCH: '🦯',
  TRICYCLE: '🚴',
  BRAILLE_KIT: '⠃⠗',
  PROSTHETIC: '🦾',
};

export const DeviceCard: React.FC<DeviceCardProps> = ({ device, distKm }) => {
  const isSafe = device.certifications?.some((c) => c.verdict === 'SAFE');
  const cat = device.type?.category || 'WHEELCHAIR';
  const icon = CATEGORY_ICONS[cat] || '♿';

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all hover:border-sky-300 flex flex-col justify-between group">
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl p-2 bg-slate-50 border border-slate-100 rounded-xl group-hover:scale-110 transition-transform">
              {icon}
            </span>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {device.serial}
              </span>
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {device.type?.label || cat}
              </h3>
            </div>
          </div>
          <StatusBadge status={device.status} size="sm" />
        </div>

        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {device.description}
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1 font-medium bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
            <Activity className="w-3 h-3 text-sky-600" />
            Condition: <strong className="text-slate-700">{device.condition}</strong>
          </span>

          {isSafe && (
            <span className="inline-flex items-center gap-1 font-medium bg-teal-50 text-teal-700 px-2 py-0.5 rounded border border-teal-100">
              <ShieldCheck className="w-3 h-3 text-teal-600" />
              Certified SAFE
            </span>
          )}

          {distKm != null && (
            <span className="inline-flex items-center gap-1 font-medium bg-sky-50 text-sky-700 px-2 py-0.5 rounded border border-sky-100 ml-auto">
              <MapPin className="w-3 h-3 text-sky-600" />
              {distKm} km away
            </span>
          )}
        </div>
      </div>

      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(device.listedAt).toLocaleDateString()}
        </span>
        <Link
          to={`/devices/${device.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-900 group-hover:translate-x-0.5 transition-all"
        >
          View Ledger <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
