import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Device, Need } from '../types';
import { Link } from 'react-router-dom';

// Fix Leaflet's default icon missing in React bundlers
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom icon for Seeker Needs (Amber pin)
const NeedIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapWidgetProps {
  devices?: Device[];
  needs?: Need[];
  center?: [number, number];
  zoom?: number;
  selectedRadiusKm?: number;
  userCoords?: [number, number] | null;
}

// Helper component to re-center the map dynamically
const ChangeView: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export const MapWidget: React.FC<MapWidgetProps> = ({
  devices = [],
  needs = [],
  center = [13.0827, 80.2707], // Default Chennai cluster
  zoom = 11,
  selectedRadiusKm = 50,
  userCoords,
}) => {
  const effectiveCenter = userCoords || center;

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-xl overflow-hidden border border-slate-200 shadow-xs">
      <MapContainer
        center={effectiveCenter}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <ChangeView center={effectiveCenter} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Selected PostGIS Radius Circle */}
        {userCoords && selectedRadiusKm && (
          <Circle
            center={userCoords}
            radius={selectedRadiusKm * 1000}
            pathOptions={{ color: '#0284c7', fillColor: '#38bdf8', fillOpacity: 0.1, weight: 1.5 }}
          />
        )}

        {/* Device Markers */}
        {devices.map((device) => {
          if (device.lat == null || device.lng == null) return null;
          return (
            <Marker key={`dev-${device.id}`} position={[device.lat, device.lng]}>
              <Popup>
                <div className="p-1 min-w-[180px]">
                  <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block">
                    {device.serial} • {device.type?.category || 'DEVICE'}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 mt-0.5 mb-1">
                    {device.type?.label || 'Assistive Device'}
                  </h4>
                  <p className="text-[11px] text-slate-600 mb-2 line-clamp-2">
                    {device.description}
                  </p>
                  <div className="flex items-center justify-between text-[11px] border-t border-slate-100 pt-1.5">
                    <span className="font-semibold text-emerald-700">{device.status}</span>
                    <Link
                      to={`/devices/${device.id}`}
                      className="font-semibold text-sky-600 hover:underline"
                    >
                      Ledger &rarr;
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Need Markers */}
        {needs.map((need) => {
          if (need.lat == null || need.lng == null) return null;
          return (
            <Marker key={`need-${need.id}`} position={[need.lat, need.lng]} icon={NeedIcon}>
              <Popup>
                <div className="p-1 min-w-[180px]">
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                    URGENT NEED • #{need.id}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 mt-0.5 mb-1">
                    {need.category} Needed
                  </h4>
                  <p className="text-[11px] text-slate-600 mb-1">
                    Urgency window: <strong>{need.urgencyHours}h</strong>
                  </p>
                  {need.seeker?.name && (
                    <p className="text-[11px] text-slate-500">
                      Seeker: {need.seeker.name}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 right-3 z-[400] bg-white/95 backdrop-blur-xs p-2.5 rounded-lg border border-slate-200 shadow-md text-[11px] space-y-1">
        <div className="font-bold text-slate-700 mb-1">Map Legend</div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-sky-500" />
          <span>Available Devices ({devices.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span>Pending Needs ({needs.length})</span>
        </div>
        {selectedRadiusKm && (
          <div className="flex items-center gap-2 text-slate-500">
            <div className="w-3 h-3 rounded-full border border-sky-400 bg-sky-100" />
            <span>PostGIS Radius ({selectedRadiusKm} km)</span>
          </div>
        )}
      </div>
    </div>
  );
};
