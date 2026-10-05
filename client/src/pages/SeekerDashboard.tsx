import React, { useState, useEffect } from 'react';
import { needApi, matchApi } from '../api/client';
import { Need, Match, DeviceCategory } from '../types';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { 
  HeartHandshake, 
  Sparkles, 
  CheckCircle2, 
  Lock
} from 'lucide-react';

const CATEGORIES: { label: string; value: DeviceCategory }[] = [
  { label: 'Standard Folding Wheelchair', value: 'WHEELCHAIR' },
  { label: 'Digital Hearing Aid', value: 'HEARING_AID' },
  { label: 'Adjustable Forearm Crutches', value: 'CRUTCH' },
  { label: 'Hand-Operated Mobility Tricycle', value: 'TRICYCLE' },
  { label: 'Braille Slate & Stylus Kit', value: 'BRAILLE_KIT' },
  { label: 'Below-Knee Prosthetic Leg', value: 'PROSTHETIC' },
];

const PRESET_PLACES = [
  { name: 'Chennai — Mylapore', lat: 13.0029, lng: 80.2404 },
  { name: 'Chennai — Vadapalani', lat: 13.0589, lng: 80.1839 },
  { name: 'Chennai — Ambattur', lat: 13.0981, lng: 80.1476 },
  { name: 'Chengalpattu — Pallavaram', lat: 12.985, lng: 80.169 },
  { name: 'Madurai', lat: 9.9256, lng: 78.1198 },
];

export const SeekerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [needs, setNeeds] = useState<Need[]>([]);
  const [selectedNeed, setSelectedNeed] = useState<Need | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [claimingMatchId, setClaimingMatchId] = useState<number | null>(null);

  // Need Form State
  const [category, setCategory] = useState<DeviceCategory>('WHEELCHAIR');
  const [urgencyHours, setUrgencyHours] = useState<number>(24);
  const [placeIndex, setPlaceIndex] = useState<number>(0);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(8500);

  const fetchNeeds = async () => {
    setLoading(true);
    try {
      const res = await needApi.list();
      const allNeeds = res.data.needs || [];
      setNeeds(allNeeds);
      if (allNeeds.length > 0 && !selectedNeed) {
        setSelectedNeed(allNeeds[0]);
      }
    } catch (e) {
      console.error('Failed to load needs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNeeds();
  }, [user]);

  // When selectedNeed changes, run or fetch candidate matches
  useEffect(() => {
    if (selectedNeed) {
      runMatching(selectedNeed.id);
    }
  }, [selectedNeed]);

  const runMatching = async (needId: number) => {
    setMatchingLoading(true);
    try {
      const res = await matchApi.generate(needId, 5);
      setMatches(res.data.matches || []);
    } catch (e) {
      console.error('Match generation failed', e);
    } finally {
      setMatchingLoading(false);
    }
  };

  const handleCreateNeed = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const p = PRESET_PLACES[placeIndex];
      const res = await needApi.create({
        category,
        urgencyHours,
        lat: p.lat,
        lng: p.lng,
        monthlyIncome,
      });
      alert('Demand request created successfully! Running geospatial matching...');
      fetchNeeds();
      if (res.data.need) {
        setSelectedNeed(res.data.need);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit request');
    }
  };

  const handleAcceptMatch = async (matchId: number) => {
    setClaimingMatchId(matchId);
    try {
      await matchApi.accept(matchId);
      alert('✅ Match Accepted! Device has been locked with ACID Row-Level Locking (SELECT FOR UPDATE) and transferred to IN_TRANSIT.');
      if (selectedNeed) runMatching(selectedNeed.id);
      fetchNeeds();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Claim failed';
      alert(`⚠️ ACID Concurrency Guard: ${msg}`);
    } finally {
      setClaimingMatchId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Seeker Demand & Geo-Matching Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Post urgent assistive needs and receive PostGIS-ranked device matches with guaranteed ACID allocation.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-sky-50 text-sky-800 rounded-lg border border-sky-200 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-sky-600" />
          <span>PostGIS Radius + Window Ranking Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Post Need Form (Left Column) */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Request Assistive Device</h2>
              <p className="text-[11px] text-slate-400">Specify required category and urgency</p>
            </div>
          </div>

          <form onSubmit={handleCreateNeed} className="space-y-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Required Equipment
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DeviceCategory)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Urgency */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Urgency Window (Hours to Critical Need)
              </label>
              <select
                value={urgencyHours}
                onChange={(e) => setUrgencyHours(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              >
                <option value={12}>Critical — Post-injury / Surgery (12 hrs)</option>
                <option value={24}>High Urgency (24 hrs)</option>
                <option value={48}>Moderate Urgency (48 hrs)</option>
                <option value={168}>Standard Demand (7 days)</option>
              </select>
            </div>

            {/* Location Node */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Beneficiary Location
              </label>
              <select
                value={placeIndex}
                onChange={(e) => setPlaceIndex(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              >
                {PRESET_PLACES.map((p, idx) => (
                  <option key={idx} value={idx}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Monthly Income */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Household Monthly Income (₹)
              </label>
              <input
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                min={0}
                step={500}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all"
            >
              Post Urgent Need Request
            </button>
          </form>
        </div>

        {/* Matching Proposals & Active Needs (Right Column) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Needs Selector */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900">
              Select Need to View PostGIS Match Proposals:
            </h2>
            {loading ? (
              <div className="text-xs text-slate-400 p-2">Loading active needs...</div>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {needs.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setSelectedNeed(n)}
                  className={`p-3 rounded-xl border text-left min-w-[200px] transition-all ${
                    selectedNeed?.id === n.id
                      ? 'border-sky-500 bg-sky-50/50 shadow-xs'
                      : 'border-slate-200 bg-slate-50 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1">
                    <span>{n.category}</span>
                    <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded font-mono">
                      {n.urgencyHours}h
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Need #{n.id} • {n.seeker?.name || 'Verified Beneficiary'}
                  </div>
                </button>
              ))}
              </div>
            )}
          </div>

          {/* Top-3 Candidates Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  Top Match Proposals (PostGIS Radius + DENSE_RANK Scoring)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Algorithm weights: <strong>60% Distance</strong> + <strong>30% Urgency</strong> + <strong>10% Device Condition</strong>.
                </p>
              </div>

              {selectedNeed && (
                <button
                  onClick={() => runMatching(selectedNeed.id)}
                  disabled={matchingLoading}
                  className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  {matchingLoading ? 'Calculating...' : 'Re-rank Matches'}
                </button>
              )}
            </div>

            {matchingLoading ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Executing PostGIS ST_DWithin and CTE ranking...
              </div>
            ) : matches.length > 0 ? (
              <div className="space-y-3">
                {matches.map((m, idx) => (
                  <div
                    key={m.id}
                    className="p-4 bg-slate-50 hover:bg-white border border-slate-200 hover:border-sky-300 rounded-xl transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold bg-sky-600 text-white w-5 h-5 rounded-full flex items-center justify-center font-mono">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-900 font-mono">
                          Device #{m.deviceId}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Score: {(m.score * 100).toFixed(1)}%
                        </span>
                        <StatusBadge status={m.status} size="sm" />
                      </div>

                      <p className="text-xs text-slate-600">
                        Candidate wheelchair matched within configured 50 km radius.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      {m.status === 'PROPOSED' ? (
                        <button
                          onClick={() => handleAcceptMatch(m.id)}
                          disabled={claimingMatchId === m.id}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow flex items-center gap-1.5 transition-all"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          {claimingMatchId === m.id ? 'Locking Row...' : 'Claim Device (ACID)'}
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-100 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                          Claim Accepted
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No matching available devices found within 50 km for this category.
              </div>
            )}

            {/* ACID Demo Note */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2 text-[11px] text-amber-800">
              <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Flagship DBMS Concurrency Demo:</strong> When claiming a device, a transaction runs with <code className="bg-amber-100 px-1 rounded font-mono">SELECT FOR UPDATE</code> on both the match and device rows. If two seekers attempt to claim the same wheelchair simultaneously, one acquires the lock and commits while the other is rejected with a 409 Conflict.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
