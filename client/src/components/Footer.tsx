import React from 'react';
import { Database, ShieldCheck, Heart, GitBranch, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-16 text-slate-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-bold text-base text-slate-900">DivyaSetu (दिव्यसेतु)</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                Track T7 — Inclusion & Accessibility
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-md leading-relaxed">
              A PostgreSQL 16 + PostGIS powered continuous redistribution platform connecting unused assistive devices
              with verified persons with disabilities across Indian districts through geospatial matching and cryptographic trust ledgers.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-sky-600" /> DBMS Concepts
            </h4>
            <ul className="text-xs space-y-1.5 text-slate-500">
              <li>• ACID Row-Level Locking (<code className="text-sky-700">SELECT FOR UPDATE</code>)</li>
              <li>• PostGIS GiST Index & <code className="text-sky-700">ST_DWithin</code></li>
              <li>• PL/pgSQL Triggers & Stored Procedure</li>
              <li>• SQL Views & Window Ranking (<code className="text-sky-700">DENSE_RANK</code>)</li>
              <li>• Full-Text Search (<code className="text-sky-700">tsvector</code>) & 3NF</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> Academic Context
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Developed for <strong>BCSE302P Database Systems Lab</strong> — Societal Digital Innovation Project (TRL 4–5 Prototype).
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="w-3.5 h-3.5" /> Tested across Chennai & 16 Indian Districts
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>© 2026 DivyaSetu Network. Built for educational and societal impact.</div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <GitBranch className="w-3.5 h-3.5" /> 11 Tables • 14 Concepts • Scoped AI
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Inclusion
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
