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
  RefreshCw
} from 'lucide-react';

const CATEGORIES: { label: string; value: DeviceCategory | 'ALL' }[] = [
  { label: 'All Devices', value: 'ALL' },
  { label: 'Wheelchairs', value: 'WHEELCHAIR' },
  { label: 'Hearing Aids', value: 'HEARING_AID' },
  { label: 'Crutches', value: 'CRUTCH' },
  { label: 'Tricycles', value: 'TRICYCLE' },
  { label: 'Braille Kits', value: 'BRAILLE_KIT' },
  { label: 'Prosthetics', value: 'PROSTHETIC' },
];

const PRESET_LOCATIONS = [
  { name: 'Chennai Central', lat: 13.0827, lng: 80.2707 },
  { name: 'Vadapalani', lat: 13.0589, lng: 80.1839 },
  { name: 'Mylapore', lat: 13.0029, lng: 80.2404 },
  { name: 'Ambattur', lat: 13.0981, lng: 80.1476 },
  { name: 'Madurai', lat: 9.9256, lng: 78.1198 },
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
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
      dev.type?.label.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-teal-600 rounded-2xl p-6 sm:p-10 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-sky-200" />
            <span>PostGIS Geospatial Matching Active (SRID 4326)</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Connect Unused Assistive Devices to Verified Need
          </h1>
          <p className="text-sm sm:text-base text-sky-100 leading-relaxed">
            A digital trust network with certified inspections, digital ledgers, and
            location-aware matching for wheelchairs, hearing aids, and crutches.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-10 translate-y-10 text-[180px] select-none pointer-events-none">
          ♿
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by device type, serial number, or features..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
          </div>

          {/* Location Picker */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
            <select
              value={selectedLoc.name}
              onChange={(e) => {
                const loc = PRESET_LOCATIONS.find((l) => l.name === e.target.value);
                if (loc) setSelectedLoc(loc);
              }}
              className="w-full md:w-48 px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium"
            >
              {PRESET_LOCATIONS.map((loc) => (
                <option key={loc.name} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Radius Slider */}
          <div className="flex items-center gap-3 w-full md:w-64 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="flex-1">
              <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                <span>Radius</span>
                <span className="font-bold text-sky-700">{radiusKm} km</span>
              </div>
              <input
                type="range"
                min={10}
                max={200}
                step={10}
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0 self-end md:self-center">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'map'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <MapIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Map</span>
            </button>
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCat(cat.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCat === cat.value
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span>Found <strong>{filteredDevices.length}</strong> certified devices available</span>
          <span className="text-slate-300">•</span>
          <span className="text-emerald-700 font-medium flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" /> Safe & Inspected
          </span>
        </div>
        <button
          onClick={fetchData}
          title="Refresh"
          className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-600' : ''}`} />
        </button>
      </div>

      {/* Content View */}
      {viewMode === 'grid' ? (
        filteredDevices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDevices.map((dev) => (
              <DeviceCard key={dev.id} device={dev} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 space-y-3">
            <p className="text-slate-500 text-sm">
              No available certified devices found matching your criteria within {radiusKm} km of {selectedLoc.name}.
            </p>
            <button
              onClick={() => {
                setSelectedCat('ALL');
                setSearch('');
                setRadiusKm(100);
              }}
              className="text-xs font-semibold text-sky-600 hover:underline"
            >
              Expand radius to 100 km & clear filters
            </button>
          </div>
        )
      ) : (
        <div className="h-[550px] w-full">
          <MapWidget
            devices={filteredDevices}
            needs={needs}
            center={[selectedLoc.lat, selectedLoc.lng]}
            userCoords={[selectedLoc.lat, selectedLoc.lng]}
            selectedRadiusKm={radiusKm}
          />
        </div>
      )}
    </div>
  );
};
