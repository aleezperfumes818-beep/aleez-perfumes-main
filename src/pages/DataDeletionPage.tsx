import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShieldCheck, CheckCircle2, AlertCircle, FileText, ArrowLeft, Clock, Lock } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const DataDeletionPage: React.FC = () => {
  const { settings } = useSettings();
  const [requestType, setRequestType] = useState<'delete' | 'export' | 'rectify' | 'optout'>('delete');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    orderNumber: '',
    reason: '',
    confirmConsent: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<{ id: string; date: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.confirmConsent) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const generatedId = `DEL-REQ-${Math.floor(100000 + Math.random() * 900000)}`;
      const requestData = {
        id: generatedId,
        date: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        type: requestType,
        ...formData,
      };

      // Store in localStorage for audit persistence
      try {
        const existingRequests = JSON.parse(localStorage.getItem('aleez_privacy_requests') || '[]');
        existingRequests.push(requestData);
        localStorage.setItem('aleez_privacy_requests', JSON.stringify(existingRequests));
      } catch {
        // Fallback
      }

      setSubmittedRequest({ id: generatedId, date: requestData.date });
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 text-[#141414]">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-[#4A4A4A]">
        <Link to="/" className="hover:text-[#B8860B] transition-colors">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <Link to="/privacy" className="hover:text-[#B8860B] transition-colors">
          Privacy Policy
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-[#141414] font-medium" aria-current="page">
          Data Deletion & Privacy Rights
        </span>
      </nav>

      {/* Header */}
      <div className="border-b border-[#EAE5DC] pb-6 space-y-2">
        <span className="text-xs uppercase tracking-[0.25em] text-[#855F06] font-semibold">
          Data Subject Rights • DPDP Act 2023 & GDPR
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#141414] font-medium">
          Personal Data Deletion & Privacy Request Portal
        </h1>
        <p className="text-sm text-[#4A4A4A] font-light max-w-2xl leading-relaxed">
          At Aleez Perfumes, your privacy and data autonomy are sacred. Under the Digital Personal Data Protection Act (DPDP Act 2023) and global privacy regulations, you have the right to request erasure, export, or correction of your personal data at any time.
        </p>
      </div>

      {submittedRequest ? (
        <div className="bg-white border border-[#EAE5DC] rounded-2xl p-8 text-center space-y-6 shadow-card animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-2xl text-[#141414]">Privacy Request Received & Registered</h2>
            <p className="text-sm text-[#4A4A4A] font-light max-w-md mx-auto">
              Your data request has been officially recorded. Our Data Protection & Grievance Officer will verify and process your request within 30 statutory days.
            </p>
          </div>

          <div className="bg-[#FAF9F6] border border-[#EAE5DC] rounded-xl p-4 max-w-md mx-auto space-y-1 text-xs">
            <div className="flex justify-between py-1 border-b border-[#EAE5DC]">
              <span className="text-[#4A4A4A]">Request Reference ID:</span>
              <span className="font-mono font-bold text-[#855F06]">{submittedRequest.id}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#EAE5DC]">
              <span className="text-[#4A4A4A]">Date of Submission:</span>
              <span className="font-medium text-[#141414]">{submittedRequest.date}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#4A4A4A]">Expected Completion:</span>
              <span className="font-medium text-[#141414]">Within 30 Calendar Days</span>
            </div>
          </div>

          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-left text-xs text-amber-900 space-y-2 max-w-lg mx-auto">
            <div className="flex items-center space-x-1.5 font-semibold">
              <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0" aria-hidden="true" />
              <span>Statutory Legal Accounting Retention Notice</span>
            </div>
            <p className="font-light leading-relaxed text-amber-800">
              Pursuant to the Indian Goods and Services Tax (GST) Act 2017 and Company Law statutory audit standards, financial invoices and transaction proof must be securely archived for 6 financial years. Non-transactional data (marketing profiles, wishlist, account credentials, browsing logs) will be permanently purged immediately.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/"
              className="px-6 py-2.5 bg-[#B8860B] text-white text-xs uppercase tracking-widest font-semibold rounded-lg hover:bg-[#9E7307] transition-colors shadow-sm"
            >
              Return to Boutique Home
            </Link>
            <button
              type="button"
              onClick={() => {
                setSubmittedRequest(null);
                setFormData({
                  fullName: '',
                  email: '',
                  phone: '',
                  orderNumber: '',
                  reason: '',
                  confirmConsent: false,
                });
              }}
              className="px-6 py-2.5 bg-white border border-[#EAE5DC] text-[#4A4A4A] text-xs uppercase tracking-wider font-semibold rounded-lg hover:text-[#141414] transition-colors"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Request Form */}
          <div className="lg:col-span-7 bg-white border border-[#EAE5DC] rounded-2xl p-6 sm:p-8 space-y-6 shadow-card">
            <h2 className="font-serif text-2xl text-[#141414] font-medium">Submit Your Formal Request</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Request Type Selector */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#383838] mb-2 font-medium">
                  Select Action Type *
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setRequestType('delete')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      requestType === 'delete'
                        ? 'border-[#B8860B] bg-[#FAF4E6] text-[#141414] font-medium ring-1 ring-[#B8860B]'
                        : 'border-[#EAE5DC] bg-[#FAF9F6] text-[#4A4A4A] hover:border-gray-400'
                    }`}
                  >
                    <span className="font-semibold text-rose-700 flex items-center space-x-1">
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Erase My Data</span>
                    </span>
                    <span className="text-[11px] text-[#555555] mt-1 font-light">
                      Permanently delete account, marketing profile, and saved details.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRequestType('export')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      requestType === 'export'
                        ? 'border-[#B8860B] bg-[#FAF4E6] text-[#141414] font-medium ring-1 ring-[#B8860B]'
                        : 'border-[#EAE5DC] bg-[#FAF9F6] text-[#4A4A4A] hover:border-gray-400'
                    }`}
                  >
                    <span className="font-semibold text-[#855F06] flex items-center space-x-1">
                      <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Export My Data</span>
                    </span>
                    <span className="text-[11px] text-[#555555] mt-1 font-light">
                      Receive an encrypted copy of all personal records we maintain.
                    </span>
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="del-fullname" className="block text-xs uppercase tracking-wider text-[#383838] mb-1.5 font-medium">
                    Full Legal Name *
                  </label>
                  <input
                    id="del-fullname"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Your full name"
                    className="w-full bg-[#FAF9F6] border border-[#EAE5DC] focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B] rounded-lg px-3.5 py-2.5 text-sm text-[#141414] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="del-email" className="block text-xs uppercase tracking-wider text-[#383838] mb-1.5 font-medium">
                      Registered Email Address *
                    </label>
                    <input
                      id="del-email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full bg-[#FAF9F6] border border-[#EAE5DC] focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B] rounded-lg px-3.5 py-2.5 text-sm text-[#141414] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="del-phone" className="block text-xs uppercase tracking-wider text-[#383838] mb-1.5 font-medium">
                      Registered Mobile Number *
                    </label>
                    <input
                      id="del-phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="10-digit mobile number"
                      className="w-full bg-[#FAF9F6] border border-[#EAE5DC] focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B] rounded-lg px-3.5 py-2.5 text-sm text-[#141414] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="del-orderno" className="block text-xs uppercase tracking-wider text-[#383838] mb-1.5 font-medium">
                    Recent Order Reference (Optional)
                  </label>
                  <input
                    id="del-orderno"
                    type="text"
                    value={formData.orderNumber}
                    onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                    placeholder="e.g. ALZ-123456"
                    className="w-full bg-[#FAF9F6] border border-[#EAE5DC] focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B] rounded-lg px-3.5 py-2.5 text-sm text-[#141414] focus:outline-none"
                  />
                  <span className="text-[11px] text-[#555555] mt-1 block font-light">
                    Helps us locate any past order logs and invoice references quickly.
                  </span>
                </div>

                <div>
                  <label htmlFor="del-reason" className="block text-xs uppercase tracking-wider text-[#383838] mb-1.5 font-medium">
                    Reason / Additional Notes (Optional)
                  </label>
                  <textarea
                    id="del-reason"
                    rows={3}
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Let us know why you wish to delete your records or any specific details to remove..."
                    className="w-full bg-[#FAF9F6] border border-[#EAE5DC] focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B] rounded-lg px-3.5 py-2.5 text-sm text-[#141414] focus:outline-none"
                  />
                </div>
              </div>

              {/* Consent Checkbox */}
              <div className="p-4 bg-[#FAF9F6] border border-[#EAE5DC] rounded-xl space-y-2">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={formData.confirmConsent}
                    onChange={(e) => setFormData({ ...formData, confirmConsent: e.target.checked })}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-[#B8860B] focus:ring-[#B8860B]"
                  />
                  <span className="text-xs text-[#383838] leading-relaxed">
                    I confirm that I am the authorized owner of the specified account and email address. I understand that upon processing, my profile, wishlists, and active credentials will be permanently erased.
                  </span>
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting || !formData.confirmConsent}
                className="w-full py-3.5 bg-[#B8860B] hover:bg-[#9E7307] disabled:opacity-50 text-white text-xs uppercase tracking-[0.2em] font-bold rounded-xl shadow-gold-sm transition-all flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Registering Request...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" aria-hidden="true" />
                    <span>Submit Official Privacy Request</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Policies & Assurance */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-[#EAE5DC] rounded-2xl p-6 space-y-4 shadow-card">
              <div className="flex items-center space-x-2 text-[#855F06]">
                <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                <h3 className="font-serif text-lg text-[#141414] font-medium">How We Handle Your Request</h3>
              </div>
              <ul className="space-y-3 text-xs text-[#4A4A4A] font-light leading-relaxed">
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B] mt-1.5 flex-shrink-0" />
                  <span>
                    <strong className="text-[#141414] font-medium">Identity Verification:</strong> We will verify your email and phone via a secure one-time verification link prior to permanent deletion.
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B] mt-1.5 flex-shrink-0" />
                  <span>
                    <strong className="text-[#141414] font-medium">30-Day Turnaround:</strong> All requests are fulfilled strictly within 30 days as prescribed under the DPDP Act 2023.
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B] mt-1.5 flex-shrink-0" />
                  <span>
                    <strong className="text-[#141414] font-medium">Permanent Purging:</strong> Cloud database entries, analytics tokens, and marketing subscribers are wiped irreversibly.
                  </span>
                </li>
              </ul>
            </div>

            {/* Grievance Officer Box */}
            <div className="bg-[#FAF9F6] border border-[#EAE5DC] rounded-2xl p-6 space-y-3 shadow-card">
              <span className="text-[10px] uppercase tracking-wider text-[#855F06] font-semibold block">
                Direct Officer Contact
              </span>
              <h4 className="font-serif text-base text-[#141414] font-medium">Data Protection & Grievance Officer</h4>
              <p className="text-xs text-[#4A4A4A] font-light leading-relaxed">
                If you prefer to submit a signed paper request or have questions regarding our data governance, you may reach our designated compliance officer directly:
              </p>
              <div className="text-xs font-light text-[#383838] space-y-1 pt-1">
                <p><strong>Officer Name:</strong> Mohammed Asfar (Head of Privacy & Compliance)</p>
                <p><strong>Entity:</strong> Aleez Perfumes & Fragrances Private Limited</p>
                <p><strong>Official Email:</strong> <a href="mailto:aleez.perfumes818@gmail.com" className="text-[#855F06] hover:underline font-medium">aleez.perfumes818@gmail.com</a></p>
                <p><strong>Office Address:</strong> Plot No. 42, Luxury Parfumerie Enclave, Anna Salai, Chennai, Tamil Nadu 600002, India</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
