import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, User, Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
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
        if (!agreeTerms) {
          setError('You must agree to the Terms of Service and acknowledge the Privacy Policy to create an account.');
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
    <div className="max-w-md mx-auto px-4 py-16 animate-fade-in text-black">
      <div className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block" aria-label="Aleez Perfumes Home">
            <span className="font-serif text-2xl tracking-[0.22em] font-semibold text-black block">
              ALEEZ
            </span>
            <span className="text-[10px] tracking-[0.35em] text-neutral-500 uppercase block -mt-1 font-semibold">
              Perfumes
            </span>
          </Link>
          <h1 className="font-serif text-2xl text-black pt-2 font-medium">
            {isRegister ? 'Join The Fragrance Club' : 'Welcome Back'}
          </h1>
          <p className="text-xs text-neutral-600 font-light">
            {isRegister
              ? 'Create an account to track your orders, manage data, and access your wishlist'
              : 'Sign in to access your order history and details'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label htmlFor="reg-fullname" className="block text-xs uppercase tracking-wider text-neutral-700 mb-1 font-medium">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" aria-hidden="true" />
                  <input
                    id="reg-fullname"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full bg-neutral-50 border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black rounded pl-9 pr-3 py-2.5 text-xs text-black focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-phone" className="block text-xs uppercase tracking-wider text-neutral-700 mb-1 font-medium">
                  Phone / WhatsApp *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-3" aria-hidden="true" />
                  <input
                    id="reg-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full bg-neutral-50 border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black rounded pl-9 pr-3 py-2.5 text-xs text-black focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label htmlFor="auth-email" className="block text-xs uppercase tracking-wider text-neutral-700 mb-1 font-medium">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" aria-hidden="true" />
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full bg-neutral-50 border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black rounded pl-9 pr-3 py-2.5 text-xs text-black focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-xs uppercase tracking-wider text-neutral-700 mb-1 font-medium">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" aria-hidden="true" />
              <input
                id="auth-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-neutral-50 border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black rounded pl-9 pr-3 py-2.5 text-xs text-black focus:outline-none"
              />
            </div>
          </div>

          {/* Registration Consents */}
          {isRegister && (
            <div className="pt-1 space-y-2.5">
              <label className="flex items-start space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-black focus:ring-black"
                />
                <span className="text-xs text-neutral-700 leading-relaxed">
                  I agree to the{' '}
                  <Link to="/terms" target="_blank" className="text-black font-medium underline hover:text-neutral-600">
                    Terms of Service
                  </Link>{' '}
                  and acknowledge the{' '}
                  <Link to="/privacy" target="_blank" className="text-black font-medium underline hover:text-neutral-600">
                    Privacy Policy
                  </Link>
                  . *
                </span>
              </label>

              <label className="flex items-start space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-black focus:ring-black"
                />
                <span className="text-[11px] text-neutral-500 font-light leading-relaxed">
                  Send me exclusive fragrance drops and private harvest releases (Unsubscribe anytime via email or account portal).
                </span>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white text-xs uppercase tracking-[0.2em] font-bold rounded shadow-sm transition-all flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-black"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-neutral-200 text-center space-y-3">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-xs text-neutral-700 hover:text-black underline font-medium block w-full"
          >
            {isRegister
              ? 'Already have an account? Sign in'
              : "Don't have an account yet? Create one"}
          </button>

          <div className="pt-2">
            <Link
              to="/admin/login"
              className="text-[11px] text-neutral-400 hover:text-black transition-colors tracking-wider uppercase font-medium inline-flex items-center gap-1"
            >
              <span>Store Administrator Portal</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
