import React from 'react';
import { Link } from 'react-router-dom';
import { Device, DeviceCategory } from '../types';
import { StatusBadge } from './StatusBadge';
import { getDeviceImageUrl, CATEGORY_DEFAULT_IMAGES } from '../data/deviceImages';
import { 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
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
  const cat = (device.type?.category || 'WHEELCHAIR') as DeviceCategory;
  const { Icon } = getCategoryMeta(cat);
  const imageUrl = getDeviceImageUrl(device);

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-slate-200/90 shadow-card hover:shadow-hover hover:border-sky-300/80 transition-all flex flex-col justify-between group">
      <div>
        {/* Device Photo Header */}
        <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
          <img
            src={imageUrl}
            alt={device.type?.label || cat}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = CATEGORY_DEFAULT_IMAGES[cat] || CATEGORY_DEFAULT_IMAGES.WHEELCHAIR;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent" />
          
          {/* Floating Serial & Status */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span className="font-mono text-[11px] font-bold text-white bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 shadow-xs">
              {device.serial}
            </span>
            <StatusBadge status={device.status} size="sm" />
          </div>

          {/* Category Pill at bottom of image */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-800 shadow-xs">
                <Icon className="w-4 h-4 text-sky-700" />
              </div>
              <span className="text-xs font-bold text-white drop-shadow-sm truncate">
                {device.type?.label || cat}
              </span>
            </div>
            {device.condition && (
              <span className="text-[10px] font-bold bg-white/90 backdrop-blur-md text-slate-800 px-2 py-0.5 rounded-md shadow-2xs">
                {device.condition}
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3">
          <p className="text-sm text-slate-700 font-medium line-clamp-2 leading-relaxed">
            {device.description}
          </p>

          {/* Technical Ledger Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            {isSafe && (
              <span className="inline-flex items-center gap-1 font-bold bg-teal-50 text-teal-800 px-2.5 py-1 rounded-lg border border-teal-200/70">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Certified SAFE</span>
              </span>
            )}

            {distKm != null && (
              <span className="inline-flex items-center gap-1 font-bold bg-sky-50 text-sky-800 px-2.5 py-1 rounded-lg border border-sky-200/70 ml-auto">
                <MapPin className="w-3.5 h-3.5 text-sky-600" />
                <span>{distKm} km</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          {new Date(device.listedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        <div className="flex items-center gap-2">
          <Link
            to={`/track?serial=${device.serial}`}
            className="btn-press text-xs font-bold text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg transition-colors border border-sky-200/80"
          >
            Track
          </Link>
          <Link
            to={`/devices/${device.id}`}
            className="btn-press inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-slate-800 hover:text-slate-950 group-hover:translate-x-0.5 transition-all"
          >
            <span>Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
