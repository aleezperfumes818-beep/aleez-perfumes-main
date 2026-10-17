import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Mail, Instagram, ShieldCheck, Truck, Sparkles, Award, Cookie } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const Footer: React.FC = () => {
  const { settings, getWhatsAppUrl } = useSettings();

  const handleOpenCookieSettings = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('openCookieSettings'));
  };

  return (
    <footer className="bg-white border-t border-neutral-200 text-neutral-800 pt-16 pb-12">
      {/* Brand Pillars Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-neutral-200">
          <div className="flex flex-col items-center text-center p-3">
            <Sparkles className="w-6 h-6 text-black mb-3" aria-hidden="true" />
            <h4 className="text-xs uppercase tracking-widest text-black font-semibold mb-1">Haute Parfumerie</h4>
            <p className="text-[12px] text-neutral-600 font-light">Masterfully crafted original blends</p>
          </div>
          <div className="flex flex-col items-center text-center p-3">
            <Truck className="w-6 h-6 text-black mb-3" aria-hidden="true" />
            <h4 className="text-xs uppercase tracking-widest text-black font-semibold mb-1">Pan-India Express</h4>
            <p className="text-[12px] text-neutral-600 font-light">Free delivery on orders over ₹999</p>
          </div>
          <div className="flex flex-col items-center text-center p-3">
            <ShieldCheck className="w-6 h-6 text-black mb-3" aria-hidden="true" />
            <h4 className="text-xs uppercase tracking-widest text-black font-semibold mb-1">100% Secure Checkout</h4>
            <p className="text-[12px] text-neutral-600 font-light">Razorpay PCI-DSS Level 1 protection</p>
          </div>
          <div className="flex flex-col items-center text-center p-3">
            <Award className="w-6 h-6 text-black mb-3" aria-hidden="true" />
            <h4 className="text-xs uppercase tracking-widest text-black font-semibold mb-1">Authentic Essence</h4>
            <p className="text-[12px] text-neutral-600 font-light">IFRA compliant skin-safe formulas</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Presentation */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block" aria-label="Aleez Perfumes Home">
              <span className="font-serif text-2xl tracking-[0.25em] font-semibold text-black block">
                ALEEZ
              </span>
              <span className="text-[10px] tracking-[0.4em] text-neutral-500 uppercase block -mt-1 font-semibold">
                Perfumes
              </span>
            </Link>
            <p className="text-sm text-neutral-600 font-light leading-relaxed max-w-sm">
              Discover your signature scent. We curate exquisite Eau de Parfum, pure artisanal attars, and aged oud compositions designed to leave a lasting impression of refined distinction.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-neutral-50 border border-neutral-300 flex items-center justify-center text-neutral-800 hover:text-black hover:border-black transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
                aria-label="Direct WhatsApp Concierge"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              </a>
              <a
                href={`mailto:${settings.email}`}
                className="w-9 h-9 rounded-full bg-neutral-50 border border-neutral-300 flex items-center justify-center text-neutral-800 hover:text-black hover:border-black transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
                aria-label="Email Customer Support"
              >
                <Mail className="w-4 h-4 text-neutral-800" aria-hidden="true" />
              </a>
              <a
                href={settings.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-neutral-50 border border-neutral-300 flex items-center justify-center text-neutral-800 hover:text-black hover:border-black transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-4 h-4 text-neutral-800" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-black">Explore</h3>
            <ul className="space-y-2 text-sm text-neutral-600 font-light">
              <li>
                <Link to="/shop" className="hover:text-black transition-colors">
                  All Fragrances
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-black transition-colors">
                  Fragrance Families
                </Link>
              </li>
              <li>
                <Link to="/shop?filter=bestseller" className="hover:text-black transition-colors">
                  Bestsellers
                </Link>
              </li>
              <li>
                <Link to="/create-your-fragrance" className="hover:text-black transition-colors">
                  Custom Fragrance Studio
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-black transition-colors">
                  About Aleez
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-black transition-colors">
                  Contact Concierge
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-black">Legal & Privacy</h3>
            <ul className="space-y-2 text-sm text-neutral-600 font-light">
              <li>
                <Link to="/privacy" className="hover:text-black transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-black transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/refund" className="hover:text-black transition-colors">
                  Refund & Replacement
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="hover:text-black transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/data-deletion" className="text-black font-medium hover:underline transition-colors flex items-center space-x-1">
                  <span>Data Deletion Request</span>
                </Link>
              </li>
              <li>
                <Link to="/unsubscribe" className="hover:text-black transition-colors">
                  Unsubscribe / Email Preferences
                </Link>
              </li>
              <li>
                <Link to="/licenses" className="hover:text-black transition-colors">
                  Font & Asset Licenses
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleOpenCookieSettings}
                  className="text-left hover:text-black transition-colors text-xs text-neutral-600 flex items-center space-x-1 focus:outline-none focus:underline"
                >
                  <Cookie className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Cookie Preferences</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Business Details & Support */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-black">Business Details</h3>
            <div className="space-y-2.5 text-xs text-neutral-600 font-light leading-relaxed">
              <div>
                <span className="font-semibold text-black block">Aleez Perfumes & Fragrances Pvt Ltd</span>
                <span className="text-[11px] text-neutral-500 block">
                  Plot No. 42, Luxury Parfumerie Enclave, Anna Salai, Chennai, Tamil Nadu 600002, India
                </span>
                <span className="text-[11px] font-mono text-neutral-700 block mt-0.5">
                  GSTIN: 33AAICA1234F1Z5
                </span>
              </div>

              <div className="pt-1 border-t border-neutral-200">
                <span className="block text-[11px] uppercase tracking-wider text-neutral-700 font-semibold">WhatsApp Support</span>
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black hover:text-neutral-600 transition-colors font-mono text-xs font-semibold"
                >
                  {settings.phone}
                </a>
              </div>

              <div>
                <span className="block text-[11px] uppercase tracking-wider text-neutral-700 font-semibold">Support & Grievance</span>
                <a
                  href={`mailto:${settings.email}`}
                  className="text-black hover:text-neutral-600 transition-colors text-xs break-all font-medium"
                >
                  {settings.email}
                </a>
              </div>

              <div>
                <span className="block text-[11px] uppercase tracking-wider text-neutral-700 font-semibold">Operating Hours</span>
                <span className="text-[11px] text-neutral-600">Mon – Sat: 9:30 AM – 7:30 PM IST</span>
              </div>

              <div className="pt-1">
                <Link to="/admin" className="text-neutral-400 hover:text-black transition-colors text-[11px]">
                  Store Admin Portal →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="pt-8 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 space-y-3 sm:space-y-0">
          <p>© 2026 Aleez Perfumes & Fragrances Private Limited. All rights reserved.</p>
          <p className="text-[11px] text-neutral-500 text-center sm:text-right">
            Online luxury fragrance atelier. All prices inclusive of GST. Prepaid online checkout secured with 256-bit Razorpay encryption.
          </p>
        </div>
      </div>
    </footer>
  );
};
