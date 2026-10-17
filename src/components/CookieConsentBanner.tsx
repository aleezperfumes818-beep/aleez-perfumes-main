import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, ShieldCheck, X, Check, Settings2, Lock } from 'lucide-react';

export interface CookiePreferences {
  essential: boolean; // Always true
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

const COOKIE_STORAGE_KEY = 'aleez_cookie_consent_v1';

export const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
    timestamp: '',
  });

  useEffect(() => {
    // Check if user already gave consent
    const stored = localStorage.getItem(COOKIE_STORAGE_KEY);
    if (!stored) {
      // Delay slightly for smooth entrance
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    } else {
      try {
        const parsed = JSON.parse(stored);
        setPreferences(parsed);
      } catch {
        // Fallback
      }
    }

    // Listener for reopening cookie settings from Footer
    const handleOpenSettings = () => {
      setIsVisible(true);
      setShowPreferencesModal(true);
    };

    window.addEventListener('openCookieSettings', handleOpenSettings);
    return () => window.removeEventListener('openCookieSettings', handleOpenSettings);
  }, []);

  // Keyboard navigation: Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showPreferencesModal) {
          setShowPreferencesModal(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPreferencesModal]);

  const savePreferences = (prefs: CookiePreferences) => {
    const updated = {
      ...prefs,
      essential: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(updated));
    setPreferences(updated);
    setShowPreferencesModal(false);
    setIsVisible(false);
  };

  const handleAcceptAll = () => {
    savePreferences({
      essential: true,
      analytics: true,
      marketing: true,
      timestamp: '',
    });
  };

  const handleRejectNonEssential = () => {
    savePreferences({
      essential: true,
      analytics: false,
      marketing: false,
      timestamp: '',
    });
  };

  const handleSaveCustom = () => {
    savePreferences(preferences);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* 1. Main Bottom Non-Intrusive Banner */}
      {!showPreferencesModal && (
        <aside
          role="region"
          aria-label="Cookie and Privacy Consent"
          className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 bg-white/95 backdrop-blur-md border-t border-[#EAE5DC] shadow-2xl transition-all duration-300 animate-slide-up"
        >
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Banner Description */}
            <div className="flex items-start space-x-3.5 text-xs text-[#383838] font-light leading-relaxed max-w-4xl">
              <div className="w-9 h-9 rounded-full bg-[#FAF4E6] border border-[#DFC38A] text-[#855F06] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Cookie className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-[#141414] text-sm">
                  Your Privacy & Fragrance Experience
                </p>
                <p>
                  Aleez Perfumes uses strictly essential cookies to manage your fragrance shopping cart, login session, and secure Razorpay payment transactions. With your consent, we also deploy anonymous analytics to improve our scent formulations. We never sell your personal data. Read our{' '}
                  <Link to="/privacy" className="text-[#855F06] font-medium underline hover:text-[#141414]">
                    Privacy Policy
                  </Link>{' '}
                  and{' '}
                  <Link to="/terms" className="text-[#855F06] font-medium underline hover:text-[#141414]">
                    Terms of Service
                  </Link>
                  .
                </p>
              </div>
            </div>

            {/* Banner Actions */}
            <div className="flex flex-wrap items-center justify-end gap-2.5 w-full lg:w-auto flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowPreferencesModal(true)}
                className="px-4 py-2.5 rounded-lg border border-[#EAE5DC] text-[#4A4A4A] hover:text-[#141414] hover:border-gray-400 bg-white text-xs uppercase tracking-wider font-semibold transition-colors flex items-center space-x-1.5 focus:outline-none focus:ring-2 focus:ring-[#B8860B]"
              >
                <Settings2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Preferences</span>
              </button>

              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="px-4 py-2.5 rounded-lg border border-[#EAE5DC] text-[#4A4A4A] hover:text-[#141414] hover:border-gray-400 bg-white text-xs uppercase tracking-wider font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8860B]"
              >
                Reject Non-Essential
              </button>

              <button
                type="button"
                onClick={handleAcceptAll}
                className="px-5 py-2.5 rounded-lg bg-[#B8860B] hover:bg-[#9E7307] text-white text-xs uppercase tracking-wider font-bold transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#B8860B]"
              >
                Accept All
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* 2. Granular Preferences Modal */}
      {showPreferencesModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-modal-title"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in text-[#141414]"
        >
          <div
            className="relative bg-white border border-[#EAE5DC] rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#EAE5DC]">
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="w-5 h-5 text-[#855F06]" aria-hidden="true" />
                <h2 id="cookie-modal-title" className="font-serif text-xl sm:text-2xl text-[#141414] font-medium">
                  Cookie & Privacy Preferences
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowPreferencesModal(false)}
                className="p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <p className="text-xs text-[#4A4A4A] font-light leading-relaxed">
              Customize which categories of cookies you consent to. You can adjust these settings at any time by clicking the "Cookie Settings" link in our website footer.
            </p>

            {/* Cookie Categories */}
            <div className="space-y-4 text-xs">
              {/* Category 1: Essential (Mandatory) */}
              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#EAE5DC] space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 font-semibold text-[#141414]">
                    <Lock className="w-3.5 h-3.5 text-[#855F06]" aria-hidden="true" />
                    <span>Strictly Essential Cookies</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                    Always Active
                  </span>
                </div>
                <p className="text-[#555555] font-light leading-relaxed">
                  Required for essential store features: keeping selected perfumes in your bag, authenticating client accounts, CSRF token security, and tokenizing advance payments through PCI-DSS Level 1 compliant Razorpay. Cannot be switched off.
                </p>
              </div>

              {/* Category 2: Performance & Analytics */}
              <div className="p-4 rounded-xl bg-white border border-[#EAE5DC] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-[#141414] block">Performance & Formulation Analytics</span>
                    <span className="text-[11px] text-[#555555] font-light">
                      Anonymous browsing insights to optimize page load speeds and inventory forecasting.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-3 flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) =>
                        setPreferences({ ...preferences, analytics: e.target.checked })
                      }
                      className="sr-only peer"
                      aria-label="Toggle Analytics Cookies"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#B8860B] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-[#B8860B]"></div>
                  </label>
                </div>
              </div>

              {/* Category 3: Marketing & Exclusive Drops */}
              <div className="p-4 rounded-xl bg-white border border-[#EAE5DC] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-[#141414] block">Marketing & VIP Scent Drops</span>
                    <span className="text-[11px] text-[#555555] font-light">
                      Enables tailored fragrance recommendations and private reserve announcement banners.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-3 flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) =>
                        setPreferences({ ...preferences, marketing: e.target.checked })
                      }
                      className="sr-only peer"
                      aria-label="Toggle Marketing Cookies"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#B8860B] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-[#B8860B]"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#EAE5DC]">
              <Link
                to="/data-deletion"
                onClick={() => setShowPreferencesModal(false)}
                className="text-xs text-[#855F06] hover:underline font-medium"
              >
                Request Personal Data Erasure →
              </Link>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleRejectNonEssential}
                  className="px-4 py-2 border border-[#EAE5DC] rounded-lg text-xs font-semibold text-[#4A4A4A] hover:text-[#141414] hover:bg-gray-50 transition-colors"
                >
                  Reject All Optional
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="px-5 py-2 bg-[#B8860B] hover:bg-[#9E7307] text-white rounded-lg text-xs uppercase tracking-wider font-bold transition-colors shadow-sm"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
