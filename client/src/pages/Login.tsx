import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { LogIn, Sparkles, User, ShieldCheck, UserCheck, PlusCircle, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, switchDemoUser } = useAuth();
  const navigate = useNavigate();

  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('pass1234');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(mobile, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials. Please verify phone number and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: Role) => {
    setLoading(true);
    setError('');
    try {
      await switchDemoUser(role);
      navigate(role === 'DONOR' ? '/donor' : role === 'SEEKER' ? '/seeker' : role === 'VERIFIER' ? '/verifier' : '/admin');
    } catch (err: any) {
      setError('Demo authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10 pb-safe">
      <div className="w-full max-w-md space-y-6 glass-panel p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-premium">
        
        {/* Header with Logo */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto shadow-2xs p-2">
            <img src="/logo.png" alt="DivyaSetu Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Sign In to DivyaSetu
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Access your assistive device redistribution account
            </p>
          </div>
        </div>

        {/* 1-Click Fast Persona Switcher for Evaluators */}
        <div className="p-4 bg-sky-50/80 border border-sky-200/80 rounded-2xl space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-950">
            <Sparkles className="w-4 h-4 text-sky-600" />
            <span>Instant Evaluator Logins:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickDemo('DONOR')}
              className="btn-press p-2.5 bg-white hover:bg-sky-50 border border-sky-200/90 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-2 transition-all text-left shadow-2xs"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Donor</span>
            </button>
            <button
              onClick={() => handleQuickDemo('SEEKER')}
              className="btn-press p-2.5 bg-white hover:bg-sky-50 border border-sky-200/90 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-2 transition-all text-left shadow-2xs"
            >
              <UserCheck className="w-4 h-4 text-sky-600 shrink-0" />
              <span>Seeker</span>
            </button>
            <button
              onClick={() => handleQuickDemo('VERIFIER')}
              className="btn-press p-2.5 bg-white hover:bg-sky-50 border border-sky-200/90 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-2 transition-all text-left shadow-2xs"
            >
              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Verifier</span>
            </button>
            <button
              onClick={() => handleQuickDemo('ADMIN')}
              className="btn-press p-2.5 bg-white hover:bg-sky-50 border border-sky-200/90 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-2 transition-all text-left shadow-2xs"
            >
              <User className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              10-Digit Mobile Number
            </label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="e.g. 9000000001 (Donor)"
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Default demo password: <code>pass1234</code></span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-press w-full py-3 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-soft hover:shadow-glow-sky transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to Network</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          New to DivyaSetu?{' '}
          <Link to="/register" className="font-bold text-sky-700 hover:underline">
            Register new account
          </Link>
        </div>

      </div>
    </div>
  );
};
