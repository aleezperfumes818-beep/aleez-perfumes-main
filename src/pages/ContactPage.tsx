import React, { useState } from 'react';
import { MessageSquare, Mail, Instagram, Send, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const ContactPage: React.FC = () => {
  const { settings, getWhatsAppUrl } = useSettings();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 text-[#141414]">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-[0.3em] text-[#B8860B] font-semibold">
          Client Concierge
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#141414] font-medium">
          Connect With Aleez
        </h1>
        <p className="text-sm text-[#555555] font-light leading-relaxed">
          Whether you need bespoke fragrance recommendations, order tracking updates, or assistance with personal gifting, our specialists are at your service.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Contact Channels */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#EAE5DC] rounded-2xl p-6 sm:p-8 space-y-6 shadow-card">
            <h2 className="font-serif text-2xl text-[#141414] font-medium">Direct Communication</h2>
            <p className="text-xs text-[#666666] font-light leading-relaxed">
              As an online-first luxury fragrance boutique, we respond swiftly across all verified digital channels.
            </p>

            <div className="space-y-4 pt-2">
              {/* WhatsApp Card */}
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl bg-[#FAF9F6] border border-[#EAE5DC] hover:border-[#25D366] transition-all flex items-center space-x-4 group shadow-xs"
              >
                <div className="w-10 h-10 rounded-full bg-[#25D366]/15 text-[#25D366] flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase tracking-wider text-[#777777] block font-medium">
                    Instant WhatsApp Support
                  </span>
                  <span className="text-sm font-semibold text-[#141414] group-hover:text-[#25D366] transition-colors font-mono">
                    {settings.phone}
                  </span>
                </div>
                <span className="text-xs text-[#B8860B] group-hover:translate-x-1 transition-transform font-medium">
                  Chat →
                </span>
              </a>

              {/* Email Card */}
              <a
                href={`mailto:${settings.email}`}
                className="p-4 rounded-xl bg-[#FAF9F6] border border-[#EAE5DC] hover:border-[#B8860B] transition-all flex items-center space-x-4 group shadow-xs"
              >
                <div className="w-10 h-10 rounded-full bg-[#B8860B]/10 text-[#B8860B] flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase tracking-wider text-[#777777] block font-medium">
                    Customer Care Email
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-[#141414] group-hover:text-[#B8860B] transition-colors break-all">
                    {settings.email}
                  </span>
                </div>
                <span className="text-xs text-[#B8860B] group-hover:translate-x-1 transition-transform font-medium">
                  Mail →
                </span>
              </a>

              {/* Instagram Card */}
              <a
                href={settings.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl bg-[#FAF9F6] border border-[#EAE5DC] hover:border-pink-500 transition-all flex items-center space-x-4 group shadow-xs"
              >
                <div className="w-10 h-10 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center flex-shrink-0">
                  <Instagram className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase tracking-wider text-[#777777] block font-medium">
                    Official Instagram
                  </span>
                  <span className="text-sm font-semibold text-[#141414] group-hover:text-pink-600 transition-colors">
                    {settings.instagram}
                  </span>
                </div>
                <span className="text-xs text-[#B8860B] group-hover:translate-x-1 transition-transform font-medium">
                  Follow →
                </span>
              </a>
            </div>

            <div className="pt-4 border-t border-[#EAE5DC] text-xs text-[#666666] font-light flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#B8860B] flex-shrink-0" />
              <span>Orders ship via insured express couriers across all Indian states.</span>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white border border-[#EAE5DC] rounded-2xl p-6 sm:p-8 space-y-6 shadow-card">
          <h2 className="font-serif text-2xl text-[#141414] font-medium">Send A Message</h2>

          {submitted ? (
            <div className="text-center py-12 space-y-4 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl text-[#141414]">Inquiry Received</h3>
              <p className="text-xs text-[#555555] font-light max-w-sm mx-auto">
                Thank you for reaching out to Aleez Perfumes. A fragrance concierge will respond to your email shortly.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
                }}
                className="text-xs text-[#B8860B] underline hover:text-[#141414] font-medium"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#444444] mb-1.5 font-medium">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ayesha"
                    className="w-full bg-[#FAF9F6] border border-[#EAE5DC] focus:border-[#B8860B] rounded-lg px-3.5 py-2.5 text-sm text-[#141414] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#444444] mb-1.5 font-medium">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. ayesha@example.com"
                    className="w-full bg-[#FAF9F6] border border-[#EAE5DC] focus:border-[#B8860B] rounded-lg px-3.5 py-2.5 text-sm text-[#141414] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#444444] mb-1.5 font-medium">
                    Mobile Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full bg-[#FAF9F6] border border-[#EAE5DC] focus:border-[#B8860B] rounded-lg px-3.5 py-2.5 text-sm text-[#141414] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#444444] mb-1.5 font-medium">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Fragrance inquiry, order query, gifting"
                    className="w-full bg-[#FAF9F6] border border-[#EAE5DC] focus:border-[#B8860B] rounded-lg px-3.5 py-2.5 text-sm text-[#141414] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#444444] mb-1.5 font-medium">
                  Your Message *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Share details regarding your fragrance preferences or inquiry..."
                  className="w-full bg-[#FAF9F6] border border-[#EAE5DC] focus:border-[#B8860B] rounded-lg px-3.5 py-2.5 text-sm text-[#141414] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 bg-[#B8860B] hover:bg-[#9E7307] text-white text-xs uppercase tracking-[0.2em] font-bold rounded-lg shadow-gold-sm transition-all flex items-center justify-center space-x-2"
              >
                <span>Transmit Inquiry</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
