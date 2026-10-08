import React, { useState, useEffect } from 'react';
import { deviceApi, needApi } from '../api/client';
import { Device, Need, DeviceCategory } from '../types';
import { DeviceCard } from '../components/DeviceCard';
import { MapWidget } from '../components/MapWidget';
import { 
  Search, 
  MapPin, 
  SlidersHorizontal, 
  Map as MapIcon, 
  LayoutGrid, 
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Compass,
  Accessibility,
  Volume2,
  Milestone,
  Bike,
  BookOpen,
  Cpu
} from 'lucide-react';
import { 
  ALL_INDIA_LOCATIONS, 
  REGIONS, 
  LOCATIONS_BY_REGION, 
  LocationNode 
} from '../data/locations';

const CATEGORIES: { label: string; value: DeviceCategory | 'ALL'; icon: React.FC<{ className?: string }> }[] = [
  { label: 'All Equipment', value: 'ALL', icon: Compass },
  { label: 'Wheelchairs', value: 'WHEELCHAIR', icon: Accessibility },
  { label: 'Hearing Aids', value: 'HEARING_AID', icon: Volume2 },
  { label: 'Crutches', value: 'CRUTCH', icon: Milestone },
  { label: 'Tricycles', value: 'TRICYCLE', icon: Bike },
  { label: 'Braille Kits', value: 'BRAILLE_KIT', icon: BookOpen },
  { label: 'Prosthetics', value: 'PROSTHETIC', icon: Cpu },
];

export const Discover: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<DeviceCategory | 'ALL'>('ALL');
  const [radiusKm, setRadiusKm] = useState<number>(50);
  const [selectedLoc, setSelectedLoc] = useState<LocationNode>(ALL_INDIA_LOCATIONS[0]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [devRes, needRes] = await Promise.all([
        deviceApi.list({ lat: selectedLoc.lat, lng: selectedLoc.lng, radius: radiusKm }),
        needApi.list().catch(() => ({ data: { needs: [] } })),
      ]);
      setDevices(devRes.data.devices || []);
      setNeeds(needRes.data.needs || []);
    } catch (e) {
      console.error('Failed to load devices', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedLoc, radiusKm]);

  const filteredDevices = devices.filter((dev) => {
    const matchCat =
      selectedCat === 'ALL' || dev.type?.category === selectedCat;
    const matchSearch =
      !search.trim() ||
      dev.description.toLowerCase().includes(search.toLowerCase()) ||
      dev.serial.toLowerCase().includes(search.toLowerCase()) ||
      dev.type?.label?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 pb-safe">
      
      {/* =========================================================================
          HERO BANNER: COMPACT & HIGH-READABILITY WITH TELEMETRY STATS
         ========================================================================= */}
      <div className="relative rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-7 text-white shadow-premium overflow-hidden">
        {/* Ambient Subtle Glow Orbs */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-sky-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/15 backdrop-blur-md border border-sky-400/25 text-xs font-semibold text-sky-200">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>PostGIS Spatial Redistribution Engine (SRID 4326)</span>
            </div>
            
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Connect Unused Assistive Devices to Verified Need
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-200 max-w-xl leading-relaxed font-normal">
              Redistributing wheelchairs, hearing aids, and mobility equipment across India through clinical safety inspections and geospatial proximity matching.
            </p>
          </div>

          {/* Compact Telemetry Metrics Snapshot */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 shrink-0 lg:w-80 shadow-inner">
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/15 text-xs">
              <span className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">Live Telemetry</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> PostGIS Active
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5 text-left">
              <div className="bg-black/20 p-2.5 rounded-xl border border-white/5">
                <span className="text-xl sm:text-2xl font-black text-white block">{devices.length}</span>
                <span className="text-xs text-slate-300 font-semibold">Available Units</span>
              </div>
              <div className="bg-black/20 p-2.5 rounded-xl border border-white/5">
                <span className="text-xl sm:text-2xl font-black text-white block">{needs.length}</span>
                <span className="text-xs text-slate-300 font-semibold">Active Needs</span>
              </div>
              <div className="bg-black/20 p-2.5 rounded-xl border border-white/5">
                <span className="text-xl sm:text-2xl font-black text-sky-300 block">{radiusKm} km</span>
                <span className="text-xs text-slate-300 font-semibold">Search Radius</span>
              </div>
              <div className="bg-black/20 p-2.5 rounded-xl border border-white/5">
                <span className="text-xl sm:text-2xl font-black text-teal-300 block">{ALL_INDIA_LOCATIONS.length}</span>
                <span className="text-xs text-slate-300 font-semibold">Pan-India Hubs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          CONTROL & FILTER BAR: DESKTOP & MOBILE OPTIMIZED
         ========================================================================= */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl shadow-card space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          
          {/* 1. Global Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by device type, serial number (e.g. DS-0001), or description..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-500"
            />
          </div>

          {/* 2. Anchor Location Selector */}
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <MapPin className="w-4 h-4 text-sky-600 absolute left-3 top-3.5 pointer-events-none" />
              <select
                value={selectedLoc.name}
                onChange={(e) => {
                  const loc = ALL_INDIA_LOCATIONS.find((l) => l.name === e.target.value);
                  if (loc) setSelectedLoc(loc);
                }}
                className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all cursor-pointer"
              >
                {REGIONS.map(({ key, label }) => (
                  <optgroup key={key} label={label}>
                    {LOCATIONS_BY_REGION[key].map((loc) => (
                      <option key={loc.name} value={loc.name}>
                        {loc.name} ({loc.state})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          {/* 3. PostGIS Radius Slider */}
          <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/90 min-w-[200px]">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="flex-1">
              <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
                <span>Radius (PostGIS)</span>
                <span className="font-bold text-sky-700">{radiusKm} km</span>
              </div>
              <input
                type="range"
                min={10}
                max={500}
                step={10}
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
            </div>
          </div>

          {/* 4. Desktop View Mode Toggle (Grid vs Map) */}
          <div className="hidden sm:flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-sky-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'map'
                  ? 'bg-white text-sky-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map</span>
            </button>
          </div>

        </div>

        {/* 5. Horizontal Category Filtering Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCat === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCat(cat.value)}
                className={`btn-press flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-soft shadow-sky-500/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-600'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          RESULTS HEADER: COUNTER & REFRESH
         ========================================================================= */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm sm:text-base text-slate-700 font-medium">
          <span>Found <strong className="text-slate-950 font-black">{filteredDevices.length}</strong> certified units within {radiusKm} km</span>
          <span className="text-slate-300">•</span>
          <span className="text-emerald-700 font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> All Inspected
          </span>
        </div>
        <button
          onClick={fetchData}
          title="Refresh Feed"
          className="btn-press flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-sky-800 bg-white hover:bg-sky-50 rounded-xl border border-slate-200/90 shadow-xs transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-600' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* =========================================================================
          VIEW CONTENT: GRID OR MAP
         ========================================================================= */}
      {viewMode === 'grid' ? (
        filteredDevices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDevices.map((dev) => (
              <DeviceCard key={dev.id} device={dev} distKm={dev.distKm} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/90 space-y-4 shadow-card">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-slate-900">No matching certified devices in this radius</h3>
              <p className="text-slate-600 text-sm mt-1 max-w-md mx-auto font-medium">
                No active devices found matching your criteria within {radiusKm} km of {selectedLoc.name}.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedCat('ALL');
                setSearch('');
                setRadiusKm(150);
              }}
              className="btn-press inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-50 text-sky-800 border border-sky-200 text-xs sm:text-sm font-bold hover:bg-sky-100 transition-colors"
            >
              Expand radius to 150 km & Reset filters
            </button>
          </div>
        )
      ) : (
        <div className="h-[460px] sm:h-[580px] w-full rounded-2xl overflow-hidden border border-slate-200/90 shadow-card">
          <MapWidget
            devices={filteredDevices}
            needs={needs}
            center={[selectedLoc.lat, selectedLoc.lng]}
            userCoords={[selectedLoc.lat, selectedLoc.lng]}
            selectedRadiusKm={radiusKm}
          />
        </div>
      )}

      {/* =========================================================================
          MOBILE FLOATING VIEW SWITCHER (THUMB-FRIENDLY PILL)
         ========================================================================= */}
      <div className="sm:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-30">
        <button
          onClick={() => setViewMode(viewMode === 'grid' ? 'map' : 'grid')}
          className="btn-press flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold shadow-float border border-slate-700/80 backdrop-blur-md"
        >
          {viewMode === 'grid' ? (
            <>
              <MapIcon className="w-4 h-4 text-sky-400" />
              <span>Show Interactive Map</span>
            </>
          ) : (
            <>
              <LayoutGrid className="w-4 h-4 text-sky-400" />
              <span>Show Device Cards</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
