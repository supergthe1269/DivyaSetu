import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { UserPlus, AlertCircle } from 'lucide-react';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('pass1234');
  const [role, setRole] = useState<Role>('DONOR');
  const [disabilityType, setDisabilityType] = useState('Orthopaedic handicap');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register({
        name,
        mobile,
        password,
        role,
        disabilityType: role === 'SEEKER' ? disabilityType : undefined,
      });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
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
              Create an Account
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Join the DivyaSetu assistive device redistribution network
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Full Legal Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              10-Digit Mobile Number
            </label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="e.g. 9876543210"
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Account Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['DONOR', 'SEEKER', 'VERIFIER'] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`btn-press p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    role === r
                      ? 'bg-sky-50 border-sky-500 text-sky-800 ring-2 ring-sky-500/20 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {role === 'SEEKER' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Disability Classification (Required for Seeker)
              </label>
              <select
                value={disabilityType}
                onChange={(e) => setDisabilityType(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all cursor-pointer"
              >
                <option value="Orthopaedic handicap">Orthopaedic handicap (Mobility)</option>
                <option value="Hearing impairment">Hearing impairment</option>
                <option value="Visual impairment">Visual impairment</option>
                <option value="Locomotor disability">Locomotor disability</option>
                <option value="Cerebral palsy">Cerebral palsy</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Account Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />
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
                <UserPlus className="w-4 h-4" />
                <span>Create Verified Account</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-sky-700 hover:underline">
            Sign in
          </Link>
        </div>

      </div>
    </div>
  );
};
