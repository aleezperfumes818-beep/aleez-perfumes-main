import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, ArrowLeft, KeyRound, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { sanitizeRedirectPath } from '../lib/authRedirect';

export const AdminLoginPage: React.FC = () => {
  const { adminLogin, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const rawRedirect = searchParams.get('redirect');
  const targetRedirect = sanitizeRedirectPath(rawRedirect, '/admin');

  // If already logged in as admin, redirect to admin destination
  useEffect(() => {
    if (isAdmin) {
      navigate(targetRedirect.startsWith('/admin') ? targetRedirect : '/admin', { replace: true });
    }
  }, [isAdmin, navigate, targetRedirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setError('Please provide your administrator email and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await adminLogin(cleanEmail, password);
      if (res.success && res.role === 'admin') {
        navigate(targetRedirect.startsWith('/admin') ? targetRedirect : '/admin', { replace: true });
      } else {
        setError(res.error || 'Access denied: Invalid credentials or insufficient privileges.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col justify-center items-center p-4 sm:p-6 text-black select-none">
      {/* Top Brand Link */}
      <div className="mb-6 text-center">
        <Link to="/" className="inline-block" aria-label="Return to Store">
          <Logo variant="dark" size="lg" />
        </Link>
      </div>

      <div className="max-w-md w-full bg-white border border-neutral-300 rounded-sm p-8 space-y-6 shadow-xl">
        <div className="text-center space-y-2 border-b border-neutral-200 pb-5">
          <div className="w-12 h-12 bg-black text-white rounded-sm flex items-center justify-center mx-auto shadow-sm">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl text-black font-normal tracking-wide pt-1">
            Admin Portal Login
          </h1>
          <p className="text-xs text-neutral-500 font-light">
            Authorized management &amp; boutique inventory access
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-sm animate-fade-in flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="admin-email"
              className="block text-xs uppercase tracking-wider text-neutral-700 mb-1.5 font-medium"
            >
              Administrator Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@aleezperfumes.com"
                autoComplete="email"
                className="w-full bg-neutral-50 border border-neutral-300 focus:border-black rounded-sm pl-9 pr-3 py-2.5 text-xs text-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label
                htmlFor="admin-password"
                className="block text-xs uppercase tracking-wider text-neutral-700 font-medium"
              >
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] text-neutral-500 hover:text-black transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
                className="w-full bg-neutral-50 border border-neutral-300 focus:border-black rounded-sm pl-9 pr-9 py-2.5 text-xs text-black focus:outline-none focus:ring-1 focus:ring-black font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-neutral-400 hover:text-black p-0.5"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-black hover:bg-neutral-800 text-white text-xs uppercase tracking-[0.2em] font-semibold rounded-sm shadow-sm transition-all flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-60"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Enter Admin Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500 font-light">
          <Link to="/" className="hover:text-black flex items-center space-x-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Boutique</span>
          </Link>
          <span>AZ Luxury Parfums</span>
        </div>
      </div>
    </div>
  );
};
