import React, { useState, useRef, useEffect } from 'react';
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
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [adminPortalsOpen, setAdminPortalsOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const adminPortalsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setRoleDropdownOpen(false);
      }
      if (adminPortalsRef.current && !adminPortalsRef.current.contains(event.target as Node)) {
        setAdminPortalsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { label: 'Discover', path: '/', icon: Search, roles: ['DONOR', 'SEEKER', 'VERIFIER', 'ADMIN'] },
    { label: 'Admin Panel', path: '/admin', icon: BarChart3, roles: ['ADMIN'] },
    { label: 'Track & Trace', path: '/track', icon: Compass, roles: ['DONOR', 'SEEKER', 'VERIFIER', 'ADMIN'] },
    { label: 'Donor Hub', path: '/donor', icon: PlusCircle, roles: ['DONOR'] },
    { label: 'Seeker Hub', path: '/seeker', icon: UserCheck, roles: ['SEEKER'] },
    { label: 'Verifier Portal', path: '/verifier', icon: ShieldAlert, roles: ['VERIFIER'] },
  ];

  const adminPortals = [
    { label: 'Donor Hub', path: '/donor', icon: PlusCircle, desc: 'List & donate devices' },
    { label: 'Seeker Hub', path: '/seeker', icon: UserCheck, desc: 'Post needs & claim' },
    { label: 'Verifier Portal', path: '/verifier', icon: ShieldAlert, desc: 'Inspect & certify' },
  ];

  const filteredNav = navItems.filter((item) => {
    if (!user) {
      // Guests only see public portals: Discover and Track & Trace
      return item.path === '/' || item.path === '/track';
    }
    return item.roles.includes(user.role);
  });

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
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo & Name (Enlarged & Cleanly Scaled) */}
            <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-2xl shrink-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white border border-slate-200/90 flex items-center justify-center p-0.5 shadow-2xs group-hover:scale-105 group-hover:border-sky-400 transition-all shrink-0 overflow-hidden">
                <img 
                  src="/logo.png" 
                  alt="DivyaSetu Logo" 
                  className="w-full h-full object-contain scale-120 transition-transform"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-lg sm:text-xl text-slate-900 tracking-tight">DivyaSetu</span>
                  <span className="hidden sm:inline-flex text-[11px] px-2 py-0.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200/80 font-bold tracking-normal">दिव्यसेतु</span>
                </div>
                <p className="hidden 2xl:block text-[11px] text-slate-500 font-medium -mt-0.5">Assistive Device Access & Redistribution</p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/70 shrink-0">
              {filteredNav.map((item) => {
                const active = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                      active
                        ? 'bg-white text-sky-700 shadow-xs'
                        : 'text-slate-700 hover:text-slate-950 hover:bg-white/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-sky-600' : 'text-slate-500'}`} />
                    {item.label}
                  </Link>
                );
              })}

              {/* Admin Additional Portals Dropdown */}
              {user?.role === 'ADMIN' && (
                <div className="relative" ref={adminPortalsRef}>
                  <button
                    onClick={() => setAdminPortalsOpen((prev) => !prev)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                      ['/donor', '/seeker', '/verifier'].includes(location.pathname)
                        ? 'bg-white text-sky-700 shadow-xs'
                        : 'text-slate-700 hover:text-slate-950 hover:bg-white/60'
                    }`}
                  >
                    <Layers className="w-4 h-4 text-slate-500" />
                    <span>Portals</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${adminPortalsOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {adminPortalsOpen && (
                    <div className="absolute left-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                      <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role Workspaces</span>
                      </div>
                      {adminPortals.map((portal) => {
                        const Icon = portal.icon;
                        const active = location.pathname === portal.path;
                        return (
                          <Link
                            key={portal.path}
                            to={portal.path}
                            onClick={() => setAdminPortalsOpen(false)}
                            className={`flex items-start gap-2.5 px-3 py-2 rounded-xl text-left transition-colors ${
                              active ? 'bg-sky-50 text-sky-800 font-bold' : 'text-slate-700 hover:bg-slate-50 font-medium'
                            }`}
                          >
                            <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${active ? 'text-sky-600' : 'text-slate-500'}`} />
                            <div>
                              <p className="text-xs font-bold leading-tight">{portal.label}</p>
                              <p className="text-[10px] text-slate-400">{portal.desc}</p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </nav>

            {/* Right Side: Role Selector Dropdown, AI CTA & Profile */}
            <div className="flex items-center gap-2 shrink-0">
              
              {/* Role Selector Dropdown */}
              <div className="relative" ref={roleDropdownRef}>
                <button
                  onClick={() => setRoleDropdownOpen((prev) => !prev)}
                  className="btn-press flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors shrink-0"
                  aria-label="Switch Role"
                  title="Switch Demo Persona"
                >
                  <Layers className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="hidden sm:inline text-[11px] font-bold text-slate-500 uppercase">Role:</span>
                  <span className={`text-xs font-bold ${
                    user?.role === 'DONOR' ? 'text-emerald-700' :
                    user?.role === 'SEEKER' ? 'text-sky-700' :
                    user?.role === 'VERIFIER' ? 'text-purple-700' :
                    user?.role === 'ADMIN' ? 'text-rose-700' : 'text-slate-700'
                  }`}>
                    {user?.role || 'Guest'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${roleDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {roleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900">Switch Demo Persona</p>
                        <p className="text-[11px] text-slate-500">Test role-based access control</p>
                      </div>
                      <button
                        onClick={() => setRoleDropdownOpen(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-1">
                      {(['DONOR', 'SEEKER', 'VERIFIER', 'ADMIN'] as Role[]).map((r) => {
                        const isCurrent = user?.role === r;
                        return (
                          <button
                            key={r}
                            onClick={() => {
                              switchDemoUser(r);
                              setRoleDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                              isCurrent
                                ? 'border-sky-500 bg-sky-50/70 ring-1 ring-sky-500/20'
                                : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-slate-900">{r}</span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${getRoleBadgeStyle(r)}`}>
                                  {r === 'DONOR' ? 'Donate' : r === 'SEEKER' ? 'Seek' : r === 'VERIFIER' ? 'Verify' : 'Admin'}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {r === 'DONOR' && 'Ravi Krishnan (9000000001)'}
                                {r === 'SEEKER' && 'Manoj Kumar (9100000001)'}
                                {r === 'VERIFIER' && 'Dr. Verifier 1 (9200000001)'}
                                {r === 'ADMIN' && 'System Administrator (9300000001)'}
                              </p>
                            </div>
                            {isCurrent && <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* AI Assistant Quick Trigger */}
              <button
                onClick={onOpenAI}
                aria-label="Open AI Assistant"
                className="btn-press flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 text-white text-xs font-bold shadow-soft hover:shadow-glow-purple transition-all shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">AI Query</span>
              </button>

              {/* User Authentication Status */}
              {user ? (
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200 shrink-0">
                  <div className="hidden md:flex flex-col text-right">
                    <span className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[100px] xl:max-w-[130px]">{user.name}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border inline-block ml-auto mt-0.5 ${getRoleBadgeStyle(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    title="Sign Out"
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="btn-press flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-sky-800 bg-sky-50 border border-sky-200/80 rounded-xl hover:bg-sky-100 transition-colors shrink-0 whitespace-nowrap"
                >
                  <UserIcon className="w-3.5 h-3.5 shrink-0" />
                  <span>Sign In</span>
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

          {/* 2. Primary Role Workspace (or Track for Guest) */}
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
          ) : user?.role === 'ADMIN' ? (
            <Link
              to="/admin"
              className={`flex flex-col items-center justify-center gap-0.5 py-1 rounded-lg transition-colors ${
                location.pathname === '/admin' ? 'text-sky-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-[10px] tracking-tight">Admin</span>
            </Link>
          ) : (
            <Link
              to="/track"
              className={`flex flex-col items-center justify-center gap-0.5 py-1 rounded-lg transition-colors ${
                location.pathname === '/track' ? 'text-sky-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Compass className="w-5 h-5" />
              <span className="text-[10px] tracking-tight">Track</span>
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
