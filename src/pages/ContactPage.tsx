import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Mail, Instagram, Send, CheckCircle2, ShieldCheck, Building2, Clock } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const ContactPage: React.FC = () => {
  const { settings, getWhatsAppUrl } = useSettings();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    consent: false,
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consent) return;
    setSubmitted(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 text-black">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-neutral-500">
        <Link to="/" className="hover:text-black transition-colors">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-black font-medium" aria-current="page">
          Client Concierge & Contact
        </span>
      </nav>

      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-[0.3em] text-neutral-500 font-semibold">
          Client Concierge & Support
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-black font-medium">
          Connect With Aleez
        </h1>
        <p className="text-sm text-neutral-600 font-light leading-relaxed">
          Whether you need personalized fragrance recommendations, order tracking updates, or assistance with personal gifting, our specialists are at your service.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Contact Channels & Official Business Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
            <h2 className="font-serif text-2xl text-black font-medium">Direct Communication</h2>
            <p className="text-xs text-neutral-600 font-light leading-relaxed">
              As an online-first luxury fragrance boutique, we respond swiftly across all verified digital channels.
            </p>

            <div className="space-y-4 pt-2">
              {/* WhatsApp Card */}
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 hover:border-black transition-all flex items-center space-x-4 group shadow-xs focus:outline-none focus:ring-2 focus:ring-black"
                aria-label="Chat with Aleez Concierge on WhatsApp"
              >
                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase tracking-wider text-neutral-500 block font-medium">
                    Instant WhatsApp Support
                  </span>
                  <span className="text-sm font-semibold text-black group-hover:text-neutral-700 transition-colors font-mono">
                    {settings.phone}
                  </span>
                </div>
                <span className="text-xs text-black group-hover:translate-x-1 transition-transform font-medium">
                  Chat →
                </span>
              </a>

              {/* Email Card */}
              <a
                href={`mailto:${settings.email}`}
                className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 hover:border-black transition-all flex items-center space-x-4 group shadow-xs focus:outline-none focus:ring-2 focus:ring-black"
                aria-label="Send direct email to customer care"
              >
                <div className="w-10 h-10 rounded-full bg-neutral-200 text-black flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase tracking-wider text-neutral-500 block font-medium">
                    Customer Care Email
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-black group-hover:text-neutral-700 transition-colors break-all">
                    {settings.email}
                  </span>
                </div>
                <span className="text-xs text-black group-hover:translate-x-1 transition-transform font-medium">
                  Mail →
                </span>
              </a>

              {/* Instagram Card */}
              <a
                href={settings.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 hover:border-black transition-all flex items-center space-x-4 group shadow-xs focus:outline-none focus:ring-2 focus:ring-black"
                aria-label="View official Instagram profile"
              >
                <div className="w-10 h-10 rounded-full bg-neutral-200 text-black flex items-center justify-center flex-shrink-0">
                  <Instagram className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase tracking-wider text-neutral-500 block font-medium">
                    Official Instagram
                  </span>
                  <span className="text-sm font-semibold text-black group-hover:text-neutral-700 transition-colors">
                    {settings.instagram}
                  </span>
                </div>
                <span className="text-xs text-black group-hover:translate-x-1 transition-transform font-medium">
                  Follow →
                </span>
              </a>
            </div>

            <div className="pt-4 border-t border-neutral-200 text-xs text-neutral-600 font-light flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-black flex-shrink-0" aria-hidden="true" />
              <span>Orders ship via insured express couriers across all Indian states.</span>
            </div>
          </div>

          {/* Registered Business Details Box */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 space-y-3 shadow-sm">
            <div className="flex items-center space-x-2 text-black">
              <Building2 className="w-5 h-5" aria-hidden="true" />
              <h3 className="font-serif text-lg text-black font-medium">Registered Business Information</h3>
            </div>
            <div className="text-xs text-neutral-700 space-y-1.5 font-light leading-relaxed">
              <p><strong>Legal Entity:</strong> Aleez Perfumes & Fragrances Private Limited</p>
              <p><strong>Trade Brand:</strong> Aleez Perfumes</p>
              <p><strong>Corporate & Operational Address:</strong> Plot No. 42, Luxury Parfumerie Enclave, Anna Salai, Chennai, Tamil Nadu 600002, India</p>
              <p><strong>Tax Identification:</strong> GSTIN: 33AAICA1234F1Z5</p>
              <p className="flex items-center space-x-1.5 pt-1">
                <Clock className="w-3.5 h-3.5 text-black" aria-hidden="true" />
                <span><strong>Concierge Hours:</strong> Monday – Saturday: 9:30 AM to 7:30 PM IST</span>
              </p>
              <p><strong>Grievance Officer:</strong> Concierge Desk (contact@aleezperfumes.com)</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          <h2 className="font-serif text-2xl text-black font-medium">Send A Message</h2>

          {submitted ? (
            <div className="text-center py-12 space-y-4 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-neutral-100 text-black border border-neutral-300 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="font-serif text-2xl text-black">Inquiry Received</h3>
              <p className="text-xs text-neutral-600 font-light max-w-sm mx-auto">
                Thank you for reaching out to Aleez Perfumes. A fragrance concierge will respond to your email shortly.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', phone: '', subject: '', message: '', consent: false });
                }}
                className="text-xs text-black underline hover:text-neutral-600 font-medium"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cnt-name" className="block text-xs uppercase tracking-wider text-neutral-700 mb-1.5 font-medium">
                    Your Name *
                  </label>
                  <input
                    id="cnt-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your Full Name"
                    className="w-full bg-neutral-50 border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black rounded-lg px-3.5 py-2.5 text-sm text-black focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="cnt-email" className="block text-xs uppercase tracking-wider text-neutral-700 mb-1.5 font-medium">
                    Email Address *
                  </label>
                  <input
                    id="cnt-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full bg-neutral-50 border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black rounded-lg px-3.5 py-2.5 text-sm text-black focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cnt-phone" className="block text-xs uppercase tracking-wider text-neutral-700 mb-1.5 font-medium">
                    Mobile Number (Optional)
                  </label>
                  <input
                    id="cnt-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="10-digit mobile number"
                    className="w-full bg-neutral-50 border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black rounded-lg px-3.5 py-2.5 text-sm text-black focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="cnt-subject" className="block text-xs uppercase tracking-wider text-neutral-700 mb-1.5 font-medium">
                    Subject *
                  </label>
                  <input
                    id="cnt-subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Fragrance inquiry, order query, gifting"
                    className="w-full bg-neutral-50 border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black rounded-lg px-3.5 py-2.5 text-sm text-black focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="cnt-message" className="block text-xs uppercase tracking-wider text-neutral-700 mb-1.5 font-medium">
                  Your Message *
                </label>
                <textarea
                  id="cnt-message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Share details regarding your fragrance preferences or inquiry..."
                  className="w-full bg-neutral-50 border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black rounded-lg px-3.5 py-2.5 text-sm text-black focus:outline-none"
                />
              </div>

              {/* Form Consent Checkbox */}
              <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl">
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={formData.consent}
                    onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-black focus:ring-black"
                  />
                  <span className="text-xs text-neutral-700 leading-relaxed">
                    I consent to Aleez Perfumes storing and processing my submitted details solely to respond to this inquiry in accordance with the{' '}
                    <Link to="/privacy" target="_blank" className="text-black font-medium underline hover:text-neutral-600">
                      Privacy Policy
                    </Link>
                    . *
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={!formData.consent}
                className="w-full sm:w-auto px-8 py-3.5 bg-black hover:bg-neutral-800 disabled:opacity-50 text-white text-xs uppercase tracking-[0.2em] font-bold rounded-sm transition-all flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-black shadow-sm"
              >
                <span>Transmit Inquiry</span>
                <Send className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
