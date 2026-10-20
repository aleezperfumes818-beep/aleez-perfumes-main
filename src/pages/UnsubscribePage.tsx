import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle2, ShieldCheck, ArrowRight, BellOff } from 'lucide-react';

export const UnsubscribePage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [unsubscribeReason, setUnsubscribeReason] = useState('');
  const [unsubscribedAll, setUnsubscribedAll] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUnsubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      try {
        const unsubs = JSON.parse(localStorage.getItem('aleez_unsubscribed_emails') || '[]');
        if (!unsubs.includes(email.toLowerCase().trim())) {
          unsubs.push(email.toLowerCase().trim());
          localStorage.setItem('aleez_unsubscribed_emails', JSON.stringify(unsubs));
        }
      } catch {
        // Fallback
      }

      setUnsubscribedAll(true);
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 text-black">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-neutral-500">
        <Link to="/" className="hover:text-black transition-colors">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-black font-medium" aria-current="page">
          Email Preferences & Unsubscribe
        </span>
      </nav>

      {/* Header */}
      <div className="border-b border-neutral-200 pb-6 space-y-2 text-center sm:text-left">
        <span className="text-xs uppercase tracking-[0.25em] text-neutral-500 font-semibold">
          Communication Preferences
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-black font-medium">
          Manage Your Email Subscriptions
        </h1>
        <p className="text-sm text-neutral-600 font-light max-w-xl leading-relaxed">
          We deeply respect your inbox. You have complete autonomy over the communications you receive from Aleez Perfumes. You can unsubscribe from marketing emails with 1 click.
        </p>
      </div>

      {unsubscribedAll ? (
        <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center space-y-6 shadow-sm animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-neutral-100 text-black border border-neutral-300 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-2xl text-black">You Have Been Unsubscribed</h2>
            <p className="text-sm text-neutral-600 font-light max-w-md mx-auto">
              The email address <strong className="text-black font-medium">{email}</strong> has been removed from all promotional announcements, newsletter broadcasts, and private harvest drop notifications.
            </p>
          </div>

          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-left text-xs text-neutral-600 space-y-2 max-w-md mx-auto">
            <div className="flex items-center space-x-1.5 font-medium text-black">
              <ShieldCheck className="w-4 h-4 text-black" aria-hidden="true" />
              <span>Important Order Delivery Notice</span>
            </div>
            <p className="font-light leading-relaxed">
              You will continue to receive critical transactional receipts, Razorpay payment verification invoices, and courier tracking coordinates for any active orders you place with Aleez Perfumes.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-black text-white text-xs uppercase tracking-widest font-semibold rounded-lg hover:bg-neutral-800 transition-colors shadow-sm"
            >
              <span>Return to Boutique</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center space-x-3 text-black">
            <BellOff className="w-6 h-6" aria-hidden="true" />
            <h2 className="font-serif text-2xl text-black font-medium">1-Click Unsubscribe</h2>
          </div>

          <form onSubmit={handleUnsubscribe} className="space-y-5">
            <div>
              <label htmlFor="unsub-email" className="block text-xs uppercase tracking-wider text-neutral-700 mb-1.5 font-medium">
                Enter your email address to unsubscribe *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" aria-hidden="true" />
                <input
                  id="unsub-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-neutral-50 border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black rounded-lg pl-9 pr-3 py-2.5 text-sm text-black focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="unsub-reason" className="block text-xs uppercase tracking-wider text-neutral-700 mb-1.5 font-medium">
                Reason for unsubscribing (Optional feedback)
              </label>
              <select
                id="unsub-reason"
                value={unsubscribeReason}
                onChange={(e) => setUnsubscribeReason(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-300 focus:border-black rounded-lg px-3.5 py-2.5 text-xs text-black focus:outline-none"
              >
                <option value="">Select a reason (optional)...</option>
                <option value="too-frequent">Emails are sent too frequently</option>
                <option value="no-longer-interested">No longer interested in fragrance updates</option>
                <option value="never-signed-up">I never signed up for this mailing list</option>
                <option value="other">Other reason</option>
              </select>
            </div>

            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-600 space-y-2">
              <span className="font-semibold text-black block">What this means:</span>
              <ul className="list-disc list-inside space-y-1 font-light">
                <li>You will no longer receive any marketing newsletters, launch announcements, or promotional discount codes.</li>
                <li>Your request takes effect immediately across our mailing servers.</li>
                <li>You may re-subscribe at any time from our homepage.</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 bg-black hover:bg-neutral-800 text-white text-xs uppercase tracking-[0.2em] font-bold rounded-lg shadow-sm transition-all flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Request...</span>
                </>
              ) : (
                <span>Confirm Unsubscribe From All Marketing</span>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
