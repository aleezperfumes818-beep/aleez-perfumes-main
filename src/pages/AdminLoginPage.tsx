import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, ArrowLeft, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';

export const AdminLoginPage: React.FC = () => {
  const { adminLogin, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already logged in as admin, redirect to dashboard
  React.useEffect(() => {
    if (isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await adminLogin(email, password);
      if (res.success) {
        navigate('/admin');
      } else {
        setError(res.error || 'Invalid administrator credentials');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error occurred');
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
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-sm animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-700 mb-1.5 font-medium">
              Administrator Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full bg-neutral-50 border border-neutral-300 focus:border-black rounded-sm pl-9 pr-3 py-2.5 text-xs text-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-700 mb-1.5 font-medium">
              Admin Password / Master Key
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
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
            className="w-full py-3 bg-black hover:bg-neutral-800 text-white text-xs uppercase tracking-[0.2em] font-semibold rounded-sm shadow-sm transition-all flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-black"
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
