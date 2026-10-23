import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { sanitizeRedirectPath } from '../lib/authRedirect';

export const AuthCallbackPage: React.FC = () => {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    let isMounted = true;

    const handleCallback = async () => {
      if (!supabase) {
        if (isMounted) {
          setStatus('error');
          setErrorMessage('Authentication service is not configured.');
        }
        return;
      }

      try {
        // 1. Check if PKCE code is present in query parameters
        const code = searchParams.get('code');
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            throw exchangeError;
          }
        }

        // 2. Check established session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          throw sessionError;
        }

        if (session) {
          if (isMounted) {
            setStatus('success');
            // Brief pause to allow user to see confirmation before redirecting
            setTimeout(() => {
              const rawRedirect = searchParams.get('redirect');
              const defaultTarget = isAdmin || session.user.user_metadata?.role === 'admin' ? '/admin' : '/account';
              const safeDestination = sanitizeRedirectPath(rawRedirect, defaultTarget);
              navigate(safeDestination, { replace: true });
            }, 1200);
          }
          return;
        }

        // If no session established from callback
        if (isMounted) {
          setStatus('error');
          setErrorMessage('Unable to verify authentication link. The token may be expired or already consumed.');
        }
      } catch (err: any) {
        console.warn('Auth callback verification failed:', err);
        if (isMounted) {
          setStatus('error');
          setErrorMessage(err.message || 'Verification link failed or expired.');
        }
      }
    };

    handleCallback();

    return () => {
      isMounted = false;
    };
  }, [searchParams, navigate, isAdmin]);

  return (
    <div className="max-w-md mx-auto px-4 py-20 animate-fade-in text-black">
      <div className="bg-white border border-neutral-200 rounded-xl p-8 space-y-6 shadow-sm text-center">
        {status === 'verifying' && (
          <div className="space-y-4 py-4">
            <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
            <h1 className="font-serif text-xl font-medium text-black">
              Verifying Your Account
            </h1>
            <p className="text-xs text-neutral-500 font-light leading-relaxed">
              Establishing your secure session with Aleez Perfumes...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 py-4">
            <CheckCircle2 className="w-12 h-12 text-black mx-auto" />
            <h1 className="font-serif text-2xl font-medium text-black">
              Email Verified Successfully
            </h1>
            <p className="text-xs text-neutral-600 font-light leading-relaxed">
              Your account has been confirmed. Redirecting you to your personal portal...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 py-4">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
            <h1 className="font-serif text-xl font-medium text-black">
              Verification Notice
            </h1>
            <p className="text-xs text-red-700 font-light leading-relaxed">
              {errorMessage || 'This authentication link is invalid or has expired.'}
            </p>
            <button
              onClick={() => navigate('/login')}
              className="mt-2 w-full py-3 bg-black hover:bg-neutral-800 text-white text-xs uppercase tracking-wider font-semibold rounded flex items-center justify-center space-x-2 transition-colors"
            >
              <span>Go to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
