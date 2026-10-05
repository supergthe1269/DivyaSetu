import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { HeartHandshake, LogIn, Sparkles, User, ShieldCheck, UserCheck, PlusCircle } from 'lucide-react';

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
      setError(err.response?.data?.error || 'Invalid credentials');
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
      setError('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white mx-auto shadow-md shadow-sky-500/20">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Sign In to DivyaSetu
          </h1>
          <p className="text-xs text-slate-500">
            Access your assistive device redistribution account
          </p>
        </div>

        {/* 1-Click Demo Logins for Evaluators */}
        <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-xl space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-900">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Fast Demo Logins (For BCSE302P Review):</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickDemo('DONOR')}
              className="p-2 bg-white hover:bg-sky-100/50 border border-sky-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors text-left"
            >
              <PlusCircle className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span>Donor</span>
            </button>
            <button
              onClick={() => handleQuickDemo('SEEKER')}
              className="p-2 bg-white hover:bg-sky-100/50 border border-sky-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors text-left"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Seeker</span>
            </button>
            <button
              onClick={() => handleQuickDemo('VERIFIER')}
              className="p-2 bg-white hover:bg-sky-100/50 border border-sky-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors text-left"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>Verifier</span>
            </button>
            <button
              onClick={() => handleQuickDemo('ADMIN')}
              className="p-2 bg-white hover:bg-sky-100/50 border border-sky-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors text-left"
            >
              <User className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        {/* Manual Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Registered Mobile Number
            </label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="e.g. 9000000001"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all flex items-center justify-center gap-1.5"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Need an account?{' '}
          <Link to="/register" className="font-semibold text-sky-600 hover:underline">
            Register as a new user
          </Link>
        </div>
      </div>
    </div>
  );
};
