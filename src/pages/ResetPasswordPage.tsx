import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validatingSession, setValidatingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  // Validate that the user arrived via a valid recovery link or has an active recovery session
  useEffect(() => {
    let isMounted = true;

    const checkRecoverySession = async () => {
      if (!supabase) {
        if (isMounted) {
          setError('Authentication service is not configured.');
          setValidatingSession(false);
        }
        return;
      }

      try {
        // Inspect current session
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          if (isMounted) {
            setHasValidSession(true);
            setValidatingSession(false);
          }
          return;
        }

        // If no active session yet, check if there's a token hash in URL
        const hash = window.location.hash;
        if (hash && (hash.includes('access_token') || hash.includes('type=recovery'))) {
          // Allow Supabase client brief window to parse and establish session from hash
          setTimeout(async () => {
            if (!supabase) return;
            const { data: { session: postHashSession } } = await supabase.auth.getSession();
            if (isMounted) {
              setHasValidSession(!!postHashSession);
              setValidatingSession(false);
            }
          }, 800);
          return;
        }

        if (isMounted) {
          setHasValidSession(false);
          setValidatingSession(false);
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('Recovery session check failed:', err);
          setHasValidSession(false);
          setValidatingSession(false);
        }
      }
    };

    checkRecoverySession();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your new password.');
      return;
    }

    setLoading(true);

    try {
      const res = await resetPassword(password);
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || 'Failed to update password. Your recovery link may have expired.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during password update.');
    } finally {
      setLoading(false);
    }
  };

  if (validatingSession) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center text-black">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs uppercase tracking-widest text-neutral-500 font-medium">
          Verifying security recovery link...
        </p>
      </div>
    );
  }

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
            Create New Password
          </h1>
          <p className="text-xs text-neutral-600 font-light">
            Set a new, secure password for your Aleez Perfumes account.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800 font-medium flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-4">
            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-black mx-auto" />
              <h2 className="text-sm font-semibold text-black">Password Updated Successfully</h2>
              <p className="text-xs text-neutral-600 font-light leading-relaxed">
                Your account password has been securely updated. You can now log in with your new credentials.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white text-xs uppercase tracking-[0.2em] font-bold rounded shadow-sm transition-all flex items-center justify-center space-x-2"
            >
              <span>Sign In With New Password</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : !hasValidSession ? (
          <div className="space-y-4">
            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-neutral-400 mx-auto" />
              <h2 className="text-sm font-semibold text-black">Recovery Link Expired or Invalid</h2>
              <p className="text-xs text-neutral-600 font-light leading-relaxed">
                This password recovery link is either invalid, has expired, or has already been used. Please request a new recovery link.
              </p>
            </div>

            <Link
              to="/forgot-password"
              className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white text-xs uppercase tracking-[0.2em] font-bold rounded shadow-sm transition-all flex items-center justify-center space-x-2"
            >
              <span>Request New Recovery Link</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="reset-password"
                className="block text-xs uppercase tracking-wider text-neutral-700 mb-1 font-medium"
              >
                New Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" aria-hidden="true" />
                <input
                  id="reset-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
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

            <div>
              <label
                htmlFor="reset-confirm-password"
                className="block text-xs uppercase tracking-wider text-neutral-700 mb-1 font-medium"
              >
                Confirm New Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" aria-hidden="true" />
                <input
                  id="reset-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white text-xs uppercase tracking-[0.2em] font-bold rounded shadow-sm transition-all flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-60"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Save New Password</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
