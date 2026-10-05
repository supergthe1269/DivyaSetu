import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { 
  HeartHandshake, 
  Search, 
  PlusCircle, 
  UserCheck, 
  ShieldAlert, 
  BarChart3, 
  LogOut, 
  Bot, 
  User as UserIcon,
  Layers
} from 'lucide-react';

interface NavbarProps {
  onOpenAI: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAI }) => {
  const { user, logout, switchDemoUser } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: 'Discover', path: '/', icon: Search, roles: ['DONOR', 'SEEKER', 'VERIFIER', 'ADMIN'] },
    { label: 'Donor Hub', path: '/donor', icon: PlusCircle, roles: ['DONOR', 'ADMIN'] },
    { label: 'Seeker Hub', path: '/seeker', icon: UserCheck, roles: ['SEEKER', 'ADMIN'] },
    { label: 'Verifier Portal', path: '/verifier', icon: ShieldAlert, roles: ['VERIFIER', 'ADMIN'] },
    { label: 'Admin Panel', path: '/admin', icon: BarChart3, roles: ['ADMIN'] },
  ];

  const filteredNav = navItems.filter(
    (item) => !user || item.roles.includes(user.role) || user.role === 'ADMIN'
  );

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-slate-900 tracking-tight">DivyaSetu</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 font-semibold">दिव्यसेतु</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-none">Assistive Device Access & Redistribution</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {filteredNav.map((item) => {
              const active = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-sky-50 text-sky-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-sky-600' : 'text-slate-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions & Role Switcher */}
          <div className="flex items-center gap-2.5">
            {/* AI Assistant Quick Button */}
            <button
              onClick={onOpenAI}
              aria-label="Open AI Assistant"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold shadow-sm hover:from-purple-700 hover:to-indigo-700 transition-all hover:shadow"
            >
              <Bot className="w-4 h-4" />
              <span className="hidden sm:inline">AI Query</span>
            </button>

            {/* Quick Persona Switcher for Project Evaluators */}
            <div className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 px-1 flex items-center gap-1">
                <Layers className="w-3 h-3" /> Role:
              </span>
              {(['DONOR', 'SEEKER', 'VERIFIER', 'ADMIN'] as Role[]).map((r) => (
                <button
                  key={r}
                  onClick={() => switchDemoUser(r)}
                  className={`text-[11px] px-2 py-1 rounded font-medium transition-colors ${
                    user?.role === r
                      ? 'bg-white text-sky-700 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* User Profile / Logout */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-800 leading-tight">{user.name}</span>
                  <span className="text-[10px] text-sky-600 font-bold uppercase">{user.role}</span>
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
