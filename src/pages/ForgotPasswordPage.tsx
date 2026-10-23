import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const { forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setError(null);
    setLoading(true);

    try {
      const res = await forgotPassword(email.trim());
      if (res.success) {
        setSubmitted(true);
        setCooldown(60);
        const timer = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(res.error || 'Unable to request password recovery. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
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
            Reset Password
          </h1>
          <p className="text-xs text-neutral-600 font-light leading-relaxed">
            Enter your account email address. If an account exists, we will dispatch secure password recovery instructions.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800 font-medium flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {submitted ? (
          <div className="space-y-4">
            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-black mx-auto" />
              <h2 className="text-sm font-semibold text-black">Recovery Instructions Dispatched</h2>
              <p className="text-xs text-neutral-600 font-light leading-relaxed">
                If an account exists for <strong className="text-black">{email}</strong>, you will receive an email containing a secure link to reset your password.
              </p>
              <p className="text-[11px] text-neutral-500 font-light pt-1">
                Be sure to check your spam or junk folder if the email does not appear in your inbox within a few minutes.
              </p>
            </div>

            <button
              type="button"
              disabled={loading || cooldown > 0}
              onClick={handleSubmit}
              className={`w-full py-2.5 text-xs uppercase tracking-wider font-semibold rounded border transition-colors ${
                cooldown > 0
                  ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed'
                  : 'bg-white hover:bg-neutral-50 text-black border-neutral-300'
              }`}
            >
              {cooldown > 0 ? `Resend Recovery Email (${cooldown}s)` : 'Resend Recovery Email'}
            </button>

            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="text-xs text-neutral-600 hover:text-black font-medium inline-flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="forgot-email"
                className="block text-xs uppercase tracking-wider text-neutral-700 mb-1 font-medium"
              >
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" aria-hidden="true" />
                <input
                  id="forgot-email"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white text-xs uppercase tracking-[0.2em] font-bold rounded shadow-sm transition-all flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-60"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Send Recovery Link</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </>
              )}
            </button>

            <div className="pt-3 border-t border-neutral-200 text-center">
              <Link
                to="/login"
                className="text-xs text-neutral-600 hover:text-black font-medium inline-flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
