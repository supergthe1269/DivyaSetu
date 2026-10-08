import React, { useState, useEffect } from 'react';
import { needApi, matchApi } from '../api/client';
import { Need, Match, DeviceCategory } from '../types';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { Link } from 'react-router-dom';
import { getDeviceImageUrl, CATEGORY_DEFAULT_IMAGES } from '../data/deviceImages';
import { 
  Sparkles, 
  CheckCircle2, 
  Lock,
  PlusCircle,
  MapPin,
  Clock,
  Activity,
  AlertCircle,
  Zap,
  DollarSign,
  Compass
} from 'lucide-react';
import { 
  ALL_INDIA_LOCATIONS, 
  REGIONS, 
  LOCATIONS_BY_REGION 
} from '../data/locations';

const CATEGORIES: { label: string; value: DeviceCategory }[] = [
  { label: 'Standard Folding Wheelchair', value: 'WHEELCHAIR' },
  { label: 'Digital Hearing Aid', value: 'HEARING_AID' },
  { label: 'Adjustable Forearm Crutches', value: 'CRUTCH' },
  { label: 'Hand-Operated Mobility Tricycle', value: 'TRICYCLE' },
  { label: 'Braille Slate & Stylus Kit', value: 'BRAILLE_KIT' },
  { label: 'Below-Knee Prosthetic Leg', value: 'PROSTHETIC' },
];

export const SeekerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [needs, setNeeds] = useState<Need[]>([]);
  const [selectedNeed, setSelectedNeed] = useState<Need | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [claimingMatchId, setClaimingMatchId] = useState<number | null>(null);
  const [bannerMsg, setBannerMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showNeedModal, setShowNeedModal] = useState(false);

  // Need Form State
  const [category, setCategory] = useState<DeviceCategory>('WHEELCHAIR');
  const [urgencyHours, setUrgencyHours] = useState<number>(24);
  const [placeIndex, setPlaceIndex] = useState<number>(0);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(8500);

  const fetchNeeds = async (preferredNeedId?: number) => {
    setLoading(true);
    try {
      const res = await needApi.list();
      const allNeeds = res.data.needs || [];
      setNeeds(allNeeds);
      if (preferredNeedId) {
        const found = allNeeds.find((n: Need) => n.id === preferredNeedId);
        if (found) setSelectedNeed(found);
        else if (allNeeds.length > 0) setSelectedNeed(allNeeds[0]);
      } else if (!selectedNeed && allNeeds.length > 0) {
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
      const p = ALL_INDIA_LOCATIONS[placeIndex];
      const res = await needApi.create({
        category,
        urgencyHours,
        lat: p.lat,
        lng: p.lng,
        monthlyIncome,
      });
      const createdNeed = res.data.need;
      setBannerMsg({ 
        type: 'success', 
        text: `Accessibility request #${createdNeed?.id ?? ''} registered! Running PostGIS multi-criteria ranking...` 
      });
      setShowNeedModal(false);
      if (createdNeed) {
        setSelectedNeed(createdNeed);
        runMatching(createdNeed.id);
      }
      fetchNeeds(createdNeed?.id);
    } catch (err: any) {
      setBannerMsg({
        type: 'error',
        text: err.response?.data?.error || 'Failed to submit demand request'
      });
    }
  };

  const handleAcceptMatch = async (matchId: number) => {
    setClaimingMatchId(matchId);
    setBannerMsg(null);
    try {
      await matchApi.accept(matchId);
      setBannerMsg({
        type: 'success',
        text: 'Transaction committed! Device claimed successfully via ACID row-level lock (SELECT FOR UPDATE). Double-allocation prevented.'
      });
      if (selectedNeed) {
        runMatching(selectedNeed.id);
      }
      fetchNeeds();
    } catch (err: any) {
      setBannerMsg({
        type: 'error',
        text: err.response?.data?.error || 'Transaction rollback: Device was claimed concurrently or is no longer available.'
      });
    } finally {
      setClaimingMatchId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 pb-safe">
      
      {/* =========================================================================
          PAGE HEADER & ACTIONS
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold bg-sky-50 text-sky-800 border border-sky-200/80 px-2.5 py-0.5 rounded-full">
              Beneficiary Matching Engine
            </span>
            <span className="text-xs text-slate-400">PostgreSQL ACID Row Locks</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Assistive Device Allocation Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Submit emergency mobility requirements, inspect PostGIS candidate rankings computed via window functions, and claim units with zero race condition risk.
          </p>
        </div>

        <button
          onClick={() => setShowNeedModal(true)}
          className="btn-press flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-soft hover:shadow-glow-sky transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Need</span>
        </button>
      </div>

      {/* Global Notification Banner */}
      {bannerMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-start gap-3 shadow-2xs animate-in fade-in ${
            bannerMsg.type === 'success'
              ? 'bg-emerald-50/95 text-emerald-900 border-emerald-200/90'
              : 'bg-rose-50/95 text-rose-900 border-rose-200/90'
          }`}
        >
          {bannerMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="leading-relaxed">{bannerMsg.text}</div>
        </div>
      )}

      {/* =========================================================================
          WORKSPACE: MASTER-DETAIL INTERACTION
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: ACTIVE NEEDS LIST (DEDICATED INDEPENDENT SIDEBAR) */}
        <div className="lg:col-span-5 flex flex-col lg:sticky lg:top-20 max-h-[calc(100vh-6rem)]">
          <div className="pb-3 border-b border-slate-200 flex items-center justify-between shrink-0">
            <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-600" />
              <span>Active Demands ({needs.length})</span>
            </h2>
            <button
              onClick={() => setShowNeedModal(true)}
              className="btn-press text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Post Need</span>
            </button>
          </div>

          <div className="overflow-y-auto pr-1.5 pt-3 flex-1 space-y-3 custom-scrollbar">
            {loading ? (
              <div className="p-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
                Loading requests...
              </div>
            ) : needs.length > 0 ? (
              needs.map((n) => {
                const isSelected = selectedNeed?.id === n.id;
                return (
                  <button
                    key={n.id}
                    onClick={() => setSelectedNeed(n)}
                    className={`btn-press w-full text-left p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-sky-50/90 border-sky-400 ring-2 ring-sky-500/20 shadow-soft'
                        : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-card'
                    }`}
                  >
                    <div className="flex items-start justify-between w-full gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-400">
                            Need #{n.id}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {n.category}
                          </span>
                        </div>
                        <h3 className="font-display text-base font-bold text-slate-900 mt-1">
                          {n.category.replace('_', ' ')}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/track?needId=${n.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="btn-press text-[11px] font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-slate-200/80 shadow-2xs"
                        >
                          <Compass className="w-3 h-3 text-sky-600" />
                          <span>Track</span>
                        </Link>
                        <StatusBadge status={n.status} size="sm" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100/80 w-full">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>Urgency: <strong>{n.urgencyHours}h window</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium justify-end">
                        <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                        <span>Income: ₹{n.monthlyIncome}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/90 space-y-3 shadow-card">
                <Clock className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-display font-bold text-base text-slate-800">No active demand requests</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click "Post Need" above to submit an assistive device requirement.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: CANDIDATE MATCHES & CONCURRENCY ALLOCATION */}
        <div className="lg:col-span-7 flex flex-col lg:sticky lg:top-20 max-h-[calc(100vh-6rem)]">
          <div className="pb-3 border-b border-slate-200 flex items-center justify-between shrink-0">
            <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>PostGIS Top-Ranked Matches {selectedNeed ? `(Need #${selectedNeed.id})` : ''}</span>
            </h2>
            {selectedNeed && (
              <button
                onClick={() => runMatching(selectedNeed.id)}
                disabled={matchingLoading}
                className="text-xs font-bold text-sky-700 hover:text-sky-900 transition-colors disabled:opacity-50"
              >
                Re-evaluate Scores
              </button>
            )}
          </div>

          <div className="overflow-y-auto pr-2 pt-3 flex-1 space-y-4 custom-scrollbar">
            {matchingLoading ? (
              <div className="p-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200 space-y-2">
                <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Executing PostGIS ST_DWithin + CTE Multi-Criteria Scoring...</p>
              </div>
            ) : matches.length > 0 ? (
              matches.map((m, idx) => {
                const isAccepting = claimingMatchId === m.id;
                const scorePercent = Math.min(100, Math.round((m.score || 0) * 100));
                const devImg = getDeviceImageUrl(m.device);

                return (
                  <div
                    key={m.id}
                    className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-card hover:border-purple-300 transition-all space-y-4"
                  >
                    {/* Top Row: Device Thumbnail, Title & Fit Score */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-3 border-b border-slate-100">
                      <div className="flex items-start gap-3.5">
                        {/* Device Photo Thumbnail */}
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 shadow-2xs">
                          <img
                            src={devImg}
                            alt={m.device?.type?.label || 'Matched equipment'}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              const fallbackCat = (m.device?.type?.category || 'WHEELCHAIR') as DeviceCategory;
                              (e.currentTarget as HTMLImageElement).src = CATEGORY_DEFAULT_IMAGES[fallbackCat];
                            }}
                          />
                          <div className="absolute top-1 left-1 w-5 h-5 rounded-md bg-purple-700 text-white font-extrabold flex items-center justify-center text-[10px] shadow-xs">
                            #{idx + 1}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-600">
                              {m.device?.serial}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                              SAFE Certified
                            </span>
                          </div>
                          <h3 className="font-display text-base font-bold text-slate-900">
                            {m.device?.type?.label || m.device?.type?.category}
                          </h3>
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {m.device?.description}
                          </p>
                        </div>
                      </div>

                      {/* Match Score Badge */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Fit Score</span>
                          <span className="text-base font-extrabold text-purple-700">{scorePercent}%</span>
                        </div>
                        <StatusBadge status={m.status} size="sm" />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1 font-medium bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                        <Activity className="w-3.5 h-3.5 text-sky-600" />
                        <span>Condition: <strong>{m.device?.condition}</strong></span>
                      </span>
                      <span className="flex items-center gap-1 font-medium bg-teal-50 text-teal-800 px-2.5 py-1 rounded-lg border border-teal-200/60">
                        <MapPin className="w-3.5 h-3.5 text-teal-600" />
                        <span>PostGIS Proximity Active</span>
                      </span>
                    </div>

                    {/* Action Footer: Transactional Accept Button */}
                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                        <Lock className="w-3.5 h-3.5 text-sky-600" />
                        <span>Guaranteed by <code>SELECT FOR UPDATE</code></span>
                      </div>

                      {m.status === 'PROPOSED' ? (
                        <button
                          onClick={() => handleAcceptMatch(m.id)}
                          disabled={isAccepting}
                          className="btn-press px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 disabled:opacity-50 text-white text-xs font-bold shadow-soft flex items-center justify-center gap-2 transition-all"
                        >
                          {isAccepting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Executing ACID Transaction...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Claim Allocation (ACID Safe)</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Allocation Confirmed</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/90 space-y-3 shadow-card">
                <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-display font-bold text-base text-slate-800">No candidate matches generated yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Select a demand request from the left column to run the PostGIS spatial matching engine.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* =========================================================================
          POST NEW NEED MODAL DIALOG
         ========================================================================= */}
      {showNeedModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900">Post Accessibility Need</h3>
                <p className="text-xs text-slate-500">Provide requirement parameters for multi-criteria scoring</p>
              </div>
              <button
                onClick={() => setShowNeedModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNeed} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Device Category Required
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DeviceCategory)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Clinical Urgency Window
                </label>
                <select
                  value={urgencyHours}
                  onChange={(e) => setUrgencyHours(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer"
                >
                  <option value={12}>12 Hours (Critical Post-Operative / Acute)</option>
                  <option value={24}>24 Hours (High Priority Rehab)</option>
                  <option value={48}>48 Hours (Standard Outpatient Need)</option>
                  <option value={72}>72 Hours (Elective / Progressive Condition)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Beneficiary Location & Hub
                </label>
                <select
                  value={placeIndex}
                  onChange={(e) => setPlaceIndex(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer"
                >
                  {REGIONS.map(({ key, label }) => (
                    <optgroup key={key} label={label}>
                      {LOCATIONS_BY_REGION[key].map((p) => {
                        const idx = ALL_INDIA_LOCATIONS.findIndex((item) => item.name === p.name);
                        return (
                          <option key={idx} value={idx}>
                            {p.name} ({p.state})
                          </option>
                        );
                      })}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Monthly Household Income (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  step={500}
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Enforces check constraint: <code>monthly_income &gt;= 0</code>
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="btn-press w-full py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-soft hover:shadow-glow-sky transition-all"
                >
                  Submit & Generate Top-3 Allocations
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
