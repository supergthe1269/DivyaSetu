import React from 'react';
import { Database, ShieldCheck, GitBranch, MapPin, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200/90 mt-20 text-slate-600 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Brand & Abstract */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white border-2 border-slate-200/90 flex items-center justify-center p-0.5 shadow-2xs overflow-hidden shrink-0">
                <img src="/logo.png" alt="DivyaSetu" className="w-full h-full object-contain scale-115" />
              </div>
              <span className="font-display font-extrabold text-base sm:text-lg text-slate-900">DivyaSetu (दिव्यसेतु)</span>
              <span className="text-[10px] bg-sky-50 text-sky-800 border border-sky-200/80 font-bold px-2 py-0.5 rounded-full">
                Track T7
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md leading-relaxed font-medium">
              A high-reliability assistive technology redistribution platform engineered with PostgreSQL 16 + PostGIS, 
              verifiable safety ledgers, and multi-criteria spatial matching.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Pan-India spatial telemetry active across 52 regional hubs in 6 zones</span>
            </div>
          </div>

          {/* Load-bearing DBMS Concepts */}
          <div className="md:col-span-4 space-y-2.5">
            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-sky-600" /> Database Architecture
            </h4>
            <ul className="text-xs space-y-1 text-slate-500 font-medium">
              <li>• ACID Row-Level Locking (<code className="text-sky-700 bg-sky-50 px-1 py-0.5 rounded">SELECT FOR UPDATE</code>)</li>
              <li>• PostGIS GiST Spatial Indexing & <code className="text-sky-700 bg-sky-50 px-1 py-0.5 rounded">ST_DWithin</code></li>
              <li>• PL/pgSQL Triggers & Verification Stored Procedures</li>
              <li>• District Aggregation Views & Window Functions</li>
              <li>• Full-Text Search (<code className="text-sky-700 bg-sky-50 px-1 py-0.5 rounded">tsvector</code>) & 3NF Normalization</li>
            </ul>
          </div>

          {/* Academic Specifications */}
          <div className="md:col-span-3 space-y-2.5">
            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> Verification Standards
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every unit certified under standardized clinical safety guidelines before entering the active matching queue.
            </p>
            <div className="pt-1">
              <a 
                href="https://github.com/supergthe1269/DivyaSetu" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-900 transition-colors"
              >
                <span>GitHub Repository</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>© 2026 DivyaSetu. Assistive Device Access & Redistribution Network.</div>
          <div className="flex items-center gap-4 text-[11px] font-medium">
            <span className="flex items-center gap-1 text-slate-500">
              <GitBranch className="w-3.5 h-3.5 text-sky-600" /> 11 Relational Tables • 14 Load-Bearing Concepts
            </span>
            <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
