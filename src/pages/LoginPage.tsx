import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, User, Phone, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = (location.state as any)?.from?.pathname || '/account';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (!fullName.trim() || !phone.trim()) {
          setError('Please provide all registration details.');
          setLoading(false);
          return;
        }
        const res = await signup(email, password, fullName, phone);
        if (!res.success) {
          setError(res.error || 'Registration failed');
          setLoading(false);
          return;
        }
      } else {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.error || 'Login failed');
          setLoading(false);
          return;
        }
      }

      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Authentication error');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 animate-fade-in text-[#141414]">
      <div className="bg-white border border-[#EAE5DC] rounded-2xl p-6 sm:p-8 space-y-6 shadow-card">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block">
            <span className="font-serif text-2xl tracking-[0.22em] font-semibold text-[#141414] block">
              ALEEZ
            </span>
            <span className="text-[10px] tracking-[0.35em] text-[#B8860B] uppercase block -mt-1 font-medium">
              Perfumes
            </span>
          </Link>
          <h1 className="font-serif text-2xl text-[#141414] pt-2 font-medium">
            {isRegister ? 'Join The Fragrance Club' : 'Welcome Back'}
          </h1>
          <p className="text-xs text-[#666666] font-light">
            {isRegister
              ? 'Create an account to track your orders and wishlist'
              : 'Sign in to access your order history and details'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#444444] mb-1 font-medium">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Farhan Malik"
                    className="w-full bg-[#FAF9F6] border border-[#EAE5DC] focus:border-[#B8860B] rounded-lg pl-9 pr-3 py-2.5 text-xs text-[#141414] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#444444] mb-1 font-medium">
                  Phone / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full bg-[#FAF9F6] border border-[#EAE5DC] focus:border-[#B8860B] rounded-lg pl-9 pr-3 py-2.5 text-xs text-[#141414] focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#444444] mb-1 font-medium">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@example.com"
                className="w-full bg-[#FAF9F6] border border-[#EAE5DC] focus:border-[#B8860B] rounded-lg pl-9 pr-3 py-2.5 text-xs text-[#141414] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#444444] mb-1 font-medium">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#FAF9F6] border border-[#EAE5DC] focus:border-[#B8860B] rounded-lg pl-9 pr-3 py-2.5 text-xs text-[#141414] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#B8860B] hover:bg-[#9E7307] text-white text-xs uppercase tracking-[0.2em] font-bold rounded-lg shadow-gold-sm transition-all flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-[#EAE5DC] text-center space-y-3">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-xs text-[#B8860B] hover:underline font-medium"
          >
            {isRegister
              ? 'Already have an account? Sign in'
              : "Don't have an account yet? Create one"}
          </button>

          <p className="text-[11px] text-[#777777]">
            Store Owner?{' '}
            <Link to="/admin" className="text-[#B8860B] hover:underline font-medium">
              Admin Portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
