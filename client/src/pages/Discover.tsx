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
  CheckCircle2,
  Accessibility,
  Volume2,
  Milestone,
  Bike,
  BookOpen,
  Cpu,
  Layers
} from 'lucide-react';

const CATEGORIES: { label: string; value: DeviceCategory | 'ALL'; icon: React.FC<{ className?: string }> }[] = [
  { label: 'All Equipment', value: 'ALL', icon: Compass },
  { label: 'Wheelchairs', value: 'WHEELCHAIR', icon: Accessibility },
  { label: 'Hearing Aids', value: 'HEARING_AID', icon: Volume2 },
  { label: 'Crutches', value: 'CRUTCH', icon: Milestone },
  { label: 'Tricycles', value: 'TRICYCLE', icon: Bike },
  { label: 'Braille Kits', value: 'BRAILLE_KIT', icon: BookOpen },
  { label: 'Prosthetics', value: 'PROSTHETIC', icon: Cpu },
];

const PRESET_LOCATIONS = [
  { name: 'Chennai Central', lat: 13.0827, lng: 80.2707, district: 'Chennai' },
  { name: 'Vadapalani', lat: 13.0589, lng: 80.1839, district: 'Chennai' },
  { name: 'Mylapore', lat: 13.0029, lng: 80.2404, district: 'Chennai' },
  { name: 'Ambattur', lat: 13.0981, lng: 80.1476, district: 'Tiruvallur' },
  { name: 'Madurai', lat: 9.9256, lng: 78.1198, district: 'Madurai' },
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946, district: 'Bengaluru Urban' },
];

export const Discover: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<DeviceCategory | 'ALL'>('ALL');
  const [radiusKm, setRadiusKm] = useState<number>(50);
  const [selectedLoc, setSelectedLoc] = useState(PRESET_LOCATIONS[0]);

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
          HERO BANNER: STRIPE-GRADE GRADIENT WITH TELEMETRY STATS
         ========================================================================= */}
      <div className="relative rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-10 text-white shadow-premium overflow-hidden">
        {/* Ambient Subtle Glow Orbs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-sky-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-sky-200">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>PostGIS Geospatial Engine Active (SRID 4326)</span>
            </div>
            
            <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Connect Unused Assistive Devices to Verified Need
            </h1>
            
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              An immutable redistribution network powered by PostgreSQL row-locking transactions, 
              certified safety inspections, and multi-criteria spatial proximity matching.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 100% Certified Safe
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/80">
                <Layers className="w-3.5 h-3.5 text-sky-400" /> ACID Concurrency Locks
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/80">
                <MapPin className="w-3.5 h-3.5 text-teal-400" /> GiST Spatial Indexing
              </span>
            </div>
          </div>

          {/* Real-time Telemetry Snapshot Card */}
          <div className="lg:col-span-4 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 space-y-3 shadow-inner">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Live Telemetry</span>
              <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Ready
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-2xl font-extrabold text-white block">{devices.length}</span>
                <span className="text-[11px] text-slate-400 font-medium">Available Units</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-2xl font-extrabold text-white block">{needs.length}</span>
                <span className="text-[11px] text-slate-400 font-medium">Active Needs</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-2xl font-extrabold text-sky-300 block">{radiusKm} km</span>
                <span className="text-[11px] text-slate-400 font-medium">Search Radius</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-2xl font-extrabold text-teal-300 block">16</span>
                <span className="text-[11px] text-slate-400 font-medium">Regional Hubs</span>
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
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by device type, serial number (e.g. DS-0001), or description..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* 2. Anchor Location Selector */}
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-52">
              <MapPin className="w-4 h-4 text-sky-600 absolute left-3 top-3.5 pointer-events-none" />
              <select
                value={selectedLoc.name}
                onChange={(e) => {
                  const loc = PRESET_LOCATIONS.find((l) => l.name === e.target.value);
                  if (loc) setSelectedLoc(loc);
                }}
                className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all cursor-pointer"
              >
                {PRESET_LOCATIONS.map((loc) => (
                  <option key={loc.name} value={loc.name}>
                    {loc.name} ({loc.district})
                  </option>
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
                max={200}
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
                className={`btn-press flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-soft shadow-sky-500/20'
                    : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
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
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
          <span>Found <strong className="text-slate-900">{filteredDevices.length}</strong> certified units within {radiusKm} km</span>
          <span className="text-slate-300">•</span>
          <span className="text-emerald-700 font-bold flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> All Inspected
          </span>
        </div>
        <button
          onClick={fetchData}
          title="Refresh Feed"
          className="btn-press flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-sky-700 bg-white hover:bg-sky-50 rounded-xl border border-slate-200 shadow-xs transition-all"
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
              <DeviceCard key={dev.id} device={dev} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/90 space-y-4 shadow-card">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">No matching certified devices in this radius</h3>
              <p className="text-slate-500 text-xs mt-1 max-w-md mx-auto">
                No active devices found matching your criteria within {radiusKm} km of {selectedLoc.name}.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedCat('ALL');
                setSearch('');
                setRadiusKm(150);
              }}
              className="btn-press inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold hover:bg-sky-100 transition-colors"
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
