import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { Lock, Mail, User, Phone, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sanitizeRedirectPath } from '../lib/authRedirect';

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register';

  const [isRegister, setIsRegister] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Email verification pending state
  const [verificationPending, setVerificationPending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const { login, signup, resendVerificationEmail, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Open redirect protection: sanitize redirect query param
  const rawRedirect = searchParams.get('redirect') || (location.state as any)?.from?.pathname;
  const targetRedirect = sanitizeRedirectPath(
    rawRedirect,
    isAdmin ? '/admin' : '/account'
  );

  // If already logged in, redirect to destination
  useEffect(() => {
    if (user) {
      const dest = isAdmin ? (targetRedirect.startsWith('/admin') ? targetRedirect : '/admin') : targetRedirect;
      navigate(dest, { replace: true });
    }
  }, [user, isAdmin, navigate, targetRedirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResendMessage(null);

    const cleanEmail = email.trim().toLowerCase();

    if (isRegister) {
      if (!fullName.trim() || !phone.trim() || !cleanEmail || !password) {
        setError('Please complete all required fields.');
        return;
      }
      if (password.length < 8) {
        setError('Password must contain at least 8 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please re-enter your password.');
        return;
      }
      if (!agreeTerms) {
        setError('You must agree to the Terms of Service and Privacy Policy to create an account.');
        return;
      }

      setLoading(true);

      try {
        const res = await signup(cleanEmail, password, fullName.trim(), phone.trim());

        if (!res.success) {
          setError(res.error || 'Registration failed. Please check your details.');
          setLoading(false);
          return;
        }

        if (res.emailConfirmationRequired) {
          // Email confirmation is required by Supabase Auth
          setVerificationPending(true);
          setLoading(false);
          return;
        }

        // Direct session established
        navigate(targetRedirect, { replace: true });
      } catch (err: any) {
        setError(err.message || 'Registration error occurred.');
        setLoading(false);
      }
    } else {
      // Login flow
      if (!cleanEmail || !password) {
        setError('Please enter your email and password.');
        return;
      }

      setLoading(true);

      try {
        const res = await login(cleanEmail, password);

        if (!res.success) {
          setError(res.error || 'Invalid email or password.');
          setLoading(false);
          return;
        }

        // Route based on verified role
        if (res.role === 'admin') {
          // If admin, route to /admin or requested admin subroute
          const adminDest = targetRedirect.startsWith('/admin') ? targetRedirect : '/admin';
          navigate(adminDest, { replace: true });
        } else {
          // If customer, route to /account or intended permitted checkout/shopping destination
          navigate(targetRedirect.startsWith('/admin') ? '/account' : targetRedirect, { replace: true });
        }
      } catch (err: any) {
        setError(err.message || 'Authentication error.');
        setLoading(false);
      }
    }
  };

  const handleResendVerification = async () => {
    if (!email.trim() || resendCooldown > 0) return;
    setLoading(true);
    setResendMessage(null);
    setError(null);

    try {
      const res = await resendVerificationEmail(email.trim().toLowerCase());
      if (res.success) {
        setResendMessage('Verification email has been resent. Please check your inbox.');
        setResendCooldown(60);
        const timer = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(res.error || 'Failed to resend verification email.');
      }
    } catch (err: any) {
      setError(err.message || 'Error resending email.');
    } finally {
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
            {verificationPending
              ? 'Verify Your Email'
              : isRegister
              ? 'Join The Fragrance Club'
              : 'Welcome Back'}
          </h1>
          <p className="text-xs text-neutral-600 font-light">
            {verificationPending
              ? 'We have sent an activation link to your inbox'
              : isRegister
              ? 'Create an account to track your orders, access bespoke drops, and save preferences'
              : 'Sign in to access your orders and personal fragrance portal'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800 font-medium flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {resendMessage && (
          <div className="p-3 bg-neutral-100 border border-neutral-300 rounded text-xs text-black font-medium flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
            <span>{resendMessage}</span>
          </div>
        )}

        {verificationPending ? (
          <div className="space-y-4">
            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-black mx-auto" />
              <h2 className="text-sm font-semibold text-black">Confirmation Link Dispatched</h2>
              <p className="text-xs text-neutral-600 font-light leading-relaxed">
                An activation link has been sent to <strong className="text-black">{email}</strong>. Please check your inbox and click the link to activate your account.
              </p>
              <p className="text-[11px] text-neutral-500 font-light pt-1">
                Once confirmed, you will be automatically signed in.
              </p>
            </div>

            <button
              type="button"
              disabled={loading || resendCooldown > 0}
              onClick={handleResendVerification}
              className={`w-full py-2.5 text-xs uppercase tracking-wider font-semibold rounded border transition-colors ${
                resendCooldown > 0
                  ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed'
                  : 'bg-white hover:bg-neutral-50 text-black border-neutral-300'
              }`}
            >
              {resendCooldown > 0
                ? `Resend Verification Email (${resendCooldown}s)`
                : 'Resend Verification Email'}
            </button>

            <button
              type="button"
              onClick={() => {
                setVerificationPending(false);
                setIsRegister(false);
                setError(null);
              }}
              className="w-full text-xs text-neutral-600 hover:text-black font-medium text-center block pt-2 underline"
            >
              Already confirmed? Click here to Sign In
            </button>
          </div>
        ) : (
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
                      placeholder="Your Full Name"
                      autoComplete="name"
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
                      autoComplete="tel"
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
                  placeholder="name@example.com"
                  autoComplete="email"
                  className="w-full bg-neutral-50 border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black rounded pl-9 pr-3 py-2.5 text-xs text-black focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="auth-password" className="block text-xs uppercase tracking-wider text-neutral-700 font-medium">
                  Password *
                </label>
                {!isRegister && (
                  <Link
                    to="/forgot-password"
                    className="text-[11px] text-neutral-500 hover:text-black transition-colors"
                  >
                    Forgot Password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" aria-hidden="true" />
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isRegister ? 'Minimum 8 characters' : '••••••••'}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  className="w-full bg-neutral-50 border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black rounded pl-9 pr-9 py-2.5 text-xs text-black focus:outline-none"
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

            {isRegister && (
              <div>
                <label htmlFor="auth-confirm-password" className="block text-xs uppercase tracking-wider text-neutral-700 mb-1 font-medium">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" aria-hidden="true" />
                  <input
                    id="auth-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    className="w-full bg-neutral-50 border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black rounded pl-9 pr-9 py-2.5 text-xs text-black focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-neutral-400 hover:text-black p-0.5"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

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
                    Send me exclusive private reserve launches and member announcements (Opt-out anytime).
                  </span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white text-xs uppercase tracking-[0.2em] font-bold rounded shadow-sm transition-all flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-60"
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
        )}

        <div className="pt-4 border-t border-neutral-200 text-center space-y-3">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
              setVerificationPending(false);
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
