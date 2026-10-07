import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { 
  Search, 
  PlusCircle, 
  UserCheck, 
  ShieldAlert, 
  BarChart3, 
  LogOut, 
  Sparkles, 
  User as UserIcon,
  Layers,
  Home,
  CheckCircle2,
  ChevronDown,
  X,
  Compass
} from 'lucide-react';

interface NavbarProps {
  onOpenAI: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAI }) => {
  const { user, logout, switchDemoUser } = useAuth();
  const location = useLocation();
  const [showRoleModal, setShowRoleModal] = useState(false);

  const navItems = [
    { label: 'Discover', path: '/', icon: Search, roles: ['DONOR', 'SEEKER', 'VERIFIER', 'ADMIN'] },
    { label: 'Track & Trace', path: '/track', icon: Compass, roles: ['DONOR', 'SEEKER', 'VERIFIER', 'ADMIN'] },
    { label: 'Donor Hub', path: '/donor', icon: PlusCircle, roles: ['DONOR', 'ADMIN'] },
    { label: 'Seeker Hub', path: '/seeker', icon: UserCheck, roles: ['SEEKER', 'ADMIN'] },
    { label: 'Verifier Portal', path: '/verifier', icon: ShieldAlert, roles: ['VERIFIER', 'ADMIN'] },
    { label: 'Admin Panel', path: '/admin', icon: BarChart3, roles: ['ADMIN'] },
  ];

  const filteredNav = navItems.filter(
    (item) => !user || item.roles.includes(user.role) || user.role === 'ADMIN'
  );

  const getRoleBadgeStyle = (r: Role) => {
    switch (r) {
      case 'DONOR': return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      case 'SEEKER': return 'bg-sky-50 text-sky-700 border-sky-200/60';
      case 'VERIFIER': return 'bg-purple-50 text-purple-700 border-purple-200/60';
      case 'ADMIN': return 'bg-rose-50 text-rose-700 border-rose-200/60';
    }
  };

  return (
    <>
      {/* =========================================================================
          DESKTOP & MOBILE TOP HEADER
         ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo & Name */}
            <Link to="/" className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center p-1.5 shadow-xs group-hover:scale-105 group-hover:border-sky-300 transition-all">
                <img 
                  src="/logo.png" 
                  alt="DivyaSetu Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-extrabold text-lg text-slate-900 tracking-tight">DivyaSetu</span>
                  <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200/60 font-semibold tracking-normal">दिव्यसेतु</span>
                </div>
                <p className="hidden sm:block text-[11px] text-slate-500 font-medium -mt-0.5">Assistive Device Access & Redistribution</p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1 rounded-xl border border-slate-200/60">
              {filteredNav.map((item) => {
                const active = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      active
                        ? 'bg-white text-sky-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${active ? 'text-sky-600' : 'text-slate-400'}`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Side: Role Selector, AI CTA & Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Quick Persona Switcher for Evaluators (Desktop) */}
              <div className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1.5 flex items-center gap-1">
                  <Layers className="w-3 h-3" /> Persona:
                </span>
                {(['DONOR', 'SEEKER', 'VERIFIER', 'ADMIN'] as Role[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => switchDemoUser(r)}
                    className={`text-[11px] px-2 py-1 rounded-md font-semibold transition-all ${
                      user?.role === r
                        ? 'bg-white text-sky-800 shadow-xs scale-100'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Mobile Role Switcher Trigger */}
              <button
                onClick={() => setShowRoleModal(true)}
                className="lg:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700"
                aria-label="Switch Role"
              >
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[11px] uppercase font-bold text-sky-700">{user?.role || 'Guest'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* AI Assistant Quick Trigger (Desktop & Mobile) */}
              <button
                onClick={onOpenAI}
                aria-label="Open AI Assistant"
                className="btn-press flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 text-white text-xs font-bold shadow-soft hover:shadow-glow-purple transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">AI Query</span>
              </button>

              {/* User Authentication Status */}
              {user ? (
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">{user.name}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border inline-block ml-auto mt-0.5 ${getRoleBadgeStyle(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    title="Sign Out"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="btn-press flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-sky-800 bg-sky-50 border border-sky-200/80 rounded-xl hover:bg-sky-100 transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  Sign In
                </Link>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* =========================================================================
          MOBILE DEDICATED BOTTOM NAVIGATION BAR
         ========================================================================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-bottom-nav">
        <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-2">
          
          {/* 1. Discover */}
          <Link
            to="/"
            className={`flex flex-col items-center justify-center gap-0.5 py-1 rounded-lg transition-colors ${
              location.pathname === '/' ? 'text-sky-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Explore</span>
          </Link>

          {/* 2. Primary Role Workspace (Donor or Seeker) */}
          {user?.role === 'DONOR' ? (
            <Link
              to="/donor"
              className={`flex flex-col items-center justify-center gap-0.5 py-1 rounded-lg transition-colors ${
                location.pathname === '/donor' ? 'text-sky-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <PlusCircle className="w-5 h-5" />
              <span className="text-[10px] tracking-tight">Donate</span>
            </Link>
          ) : user?.role === 'SEEKER' ? (
            <Link
              to="/seeker"
              className={`flex flex-col items-center justify-center gap-0.5 py-1 rounded-lg transition-colors ${
                location.pathname === '/seeker' ? 'text-sky-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserCheck className="w-5 h-5" />
              <span className="text-[10px] tracking-tight">Seek</span>
            </Link>
          ) : user?.role === 'VERIFIER' ? (
            <Link
              to="/verifier"
              className={`flex flex-col items-center justify-center gap-0.5 py-1 rounded-lg transition-colors ${
                location.pathname === '/verifier' ? 'text-sky-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldAlert className="w-5 h-5" />
              <span className="text-[10px] tracking-tight">Inspect</span>
            </Link>
          ) : (
            <Link
              to="/admin"
              className={`flex flex-col items-center justify-center gap-0.5 py-1 rounded-lg transition-colors ${
                location.pathname === '/admin' ? 'text-sky-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-[10px] tracking-tight">Admin</span>
            </Link>
          )}

          {/* 3. Center AI Action Trigger */}
          <div className="flex items-center justify-center -mt-4">
            <button
              onClick={onOpenAI}
              className="btn-press w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-sky-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 border-2 border-white focus:outline-none"
              aria-label="Ask AI Assistant"
            >
              <Sparkles className="w-5 h-5 animate-pulse" />
            </button>
          </div>

          {/* 4. Switch Persona */}
          <button
            onClick={() => setShowRoleModal(true)}
            className="flex flex-col items-center justify-center gap-0.5 py-1 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
          >
            <Layers className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Persona</span>
          </button>

          {/* 5. Account */}
          {user ? (
            <button
              onClick={logout}
              className="flex flex-col items-center justify-center gap-0.5 py-1 rounded-lg text-slate-500 hover:text-rose-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-[10px] tracking-tight">Sign Out</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="flex flex-col items-center justify-center gap-0.5 py-1 rounded-lg text-slate-500 hover:text-sky-700 transition-colors"
            >
              <UserIcon className="w-5 h-5" />
              <span className="text-[10px] tracking-tight">Sign In</span>
            </Link>
          )}

        </div>
      </nav>

      {/* =========================================================================
          MOBILE ROLE SWITCHER BOTTOM SHEET MODAL
         ========================================================================= */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900">Switch Evaluator Persona</h3>
                <p className="text-xs text-slate-500">Instantly experience role-based access control</p>
              </div>
              <button 
                onClick={() => setShowRoleModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {(['DONOR', 'SEEKER', 'VERIFIER', 'ADMIN'] as Role[]).map((r) => {
                const isCurrent = user?.role === r;
                return (
                  <button
                    key={r}
                    onClick={() => {
                      switchDemoUser(r);
                      setShowRoleModal(false);
                    }}
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                      isCurrent
                        ? 'border-sky-500 bg-sky-50/60 ring-2 ring-sky-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{r}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRoleBadgeStyle(r)}`}>
                          {r === 'DONOR' ? 'List & donate devices' : r === 'SEEKER' ? 'Post needs & claim' : r === 'VERIFIER' ? 'Quality inspections' : 'System analytics'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {r === 'DONOR' && 'Ravi Krishnan (9000000001)'}
                        {r === 'SEEKER' && 'Manoj Kumar (9100000001)'}
                        {r === 'VERIFIER' && 'Dr. Verifier 1 (9200000001)'}
                        {r === 'ADMIN' && 'System Administrator (9300000001)'}
                      </p>
                    </div>
                    {isCurrent && <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
