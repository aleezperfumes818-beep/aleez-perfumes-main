import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Mail, Instagram, ShieldCheck, Truck, Sparkles, Award, Lock, Cookie, FileText } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const Footer: React.FC = () => {
  const { settings, getWhatsAppUrl } = useSettings();

  const handleOpenCookieSettings = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('openCookieSettings'));
  };

  return (
    <footer className="bg-[#F6F2EB] border-t border-[#EAE4D9] text-[#383838] pt-16 pb-12">
      {/* Brand Pillars Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-[#E0D8CB]">
          <div className="flex flex-col items-center text-center p-3">
            <Sparkles className="w-6 h-6 text-[#855F06] mb-3" aria-hidden="true" />
            <h4 className="text-xs uppercase tracking-widest text-[#141414] font-semibold mb-1">Haute Parfumerie</h4>
            <p className="text-[12px] text-[#4A4A4A] font-light">Masterfully crafted original blends</p>
          </div>
          <div className="flex flex-col items-center text-center p-3">
            <Truck className="w-6 h-6 text-[#855F06] mb-3" aria-hidden="true" />
            <h4 className="text-xs uppercase tracking-widest text-[#141414] font-semibold mb-1">Pan-India Express</h4>
            <p className="text-[12px] text-[#4A4A4A] font-light">Free delivery on orders over ₹999</p>
          </div>
          <div className="flex flex-col items-center text-center p-3">
            <ShieldCheck className="w-6 h-6 text-[#855F06] mb-3" aria-hidden="true" />
            <h4 className="text-xs uppercase tracking-widest text-[#141414] font-semibold mb-1">100% Secure Checkout</h4>
            <p className="text-[12px] text-[#4A4A4A] font-light">Razorpay PCI-DSS Level 1 protection</p>
          </div>
          <div className="flex flex-col items-center text-center p-3">
            <Award className="w-6 h-6 text-[#855F06] mb-3" aria-hidden="true" />
            <h4 className="text-xs uppercase tracking-widest text-[#141414] font-semibold mb-1">Authentic Essence</h4>
            <p className="text-[12px] text-[#4A4A4A] font-light">IFRA compliant skin-safe formulas</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Presentation */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block" aria-label="Aleez Perfumes Home">
              <span className="font-serif text-2xl tracking-[0.25em] font-semibold text-[#141414] block">
                ALEEZ
              </span>
              <span className="text-[10px] tracking-[0.4em] text-[#855F06] uppercase block -mt-1 font-semibold">
                Perfumes
              </span>
            </Link>
            <p className="text-sm text-[#4A4A4A] font-light leading-relaxed max-w-sm">
              Discover your signature scent. We curate exquisite Eau de Parfum, pure artisanal attars, and aged oud compositions designed to leave a lasting impression of refined distinction.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white border border-[#E0D8CB] flex items-center justify-center text-[#383838] hover:text-[#B8860B] hover:border-[#B8860B] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#B8860B]"
                aria-label="Direct WhatsApp Concierge"
              >
                <MessageSquare className="w-4 h-4 text-[#25D366]" aria-hidden="true" />
              </a>
              <a
                href={`mailto:${settings.email}`}
                className="w-9 h-9 rounded-full bg-white border border-[#E0D8CB] flex items-center justify-center text-[#383838] hover:text-[#B8860B] hover:border-[#B8860B] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#B8860B]"
                aria-label="Email Customer Support"
              >
                <Mail className="w-4 h-4 text-[#855F06]" aria-hidden="true" />
              </a>
              <a
                href={settings.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white border border-[#E0D8CB] flex items-center justify-center text-[#383838] hover:text-[#B8860B] hover:border-[#B8860B] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#B8860B]"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-4 h-4 text-pink-700" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#141414]">Explore</h3>
            <ul className="space-y-2 text-sm text-[#4A4A4A] font-light">
              <li>
                <Link to="/shop" className="hover:text-[#B8860B] transition-colors">
                  All Fragrances
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-[#B8860B] transition-colors">
                  Fragrance Families
                </Link>
              </li>
              <li>
                <Link to="/shop?filter=bestseller" className="hover:text-[#B8860B] transition-colors">
                  Bestsellers
                </Link>
              </li>
              <li>
                <Link to="/create-your-fragrance" className="hover:text-[#B8860B] transition-colors">
                  Bespoke Perfume Atelier
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#B8860B] transition-colors">
                  About Aleez
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#B8860B] transition-colors">
                  Contact Concierge
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#141414]">Legal & Privacy</h3>
            <ul className="space-y-2 text-sm text-[#4A4A4A] font-light">
              <li>
                <Link to="/privacy" className="hover:text-[#B8860B] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-[#B8860B] transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/refund" className="hover:text-[#B8860B] transition-colors">
                  Refund & Replacement
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="hover:text-[#B8860B] transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/data-deletion" className="text-[#855F06] font-medium hover:underline transition-colors flex items-center space-x-1">
                  <span>Data Deletion Request</span>
                </Link>
              </li>
              <li>
                <Link to="/unsubscribe" className="hover:text-[#B8860B] transition-colors">
                  Unsubscribe / Email Preferences
                </Link>
              </li>
              <li>
                <Link to="/licenses" className="hover:text-[#B8860B] transition-colors">
                  Font & Asset Licenses
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleOpenCookieSettings}
                  className="text-left hover:text-[#B8860B] transition-colors text-xs text-[#555555] flex items-center space-x-1 focus:outline-none focus:underline"
                >
                  <Cookie className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Cookie Preferences</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Business Details & Support */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#141414]">Business Details</h3>
            <div className="space-y-2.5 text-xs text-[#4A4A4A] font-light leading-relaxed">
              <div>
                <span className="font-semibold text-[#141414] block">Aleez Perfumes & Fragrances Pvt Ltd</span>
                <span className="text-[11px] text-[#555555] block">
                  Plot No. 42, Luxury Parfumerie Enclave, Anna Salai, Chennai, Tamil Nadu 600002, India
                </span>
                <span className="text-[11px] font-mono text-[#855F06] block mt-0.5">
                  GSTIN: 33AAICA1234F1Z5
                </span>
              </div>

              <div className="pt-1 border-t border-[#E0D8CB]">
                <span className="block text-[11px] uppercase tracking-wider text-[#4A4A4A] font-semibold">WhatsApp Support</span>
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#141414] hover:text-[#B8860B] transition-colors font-mono text-xs font-semibold"
                >
                  {settings.phone}
                </a>
              </div>

              <div>
                <span className="block text-[11px] uppercase tracking-wider text-[#4A4A4A] font-semibold">Support & Grievance</span>
                <a
                  href={`mailto:${settings.email}`}
                  className="text-[#141414] hover:text-[#B8860B] transition-colors text-xs break-all font-medium"
                >
                  {settings.email}
                </a>
              </div>

              <div>
                <span className="block text-[11px] uppercase tracking-wider text-[#4A4A4A] font-semibold">Operating Hours</span>
                <span className="text-[11px] text-[#4A4A4A]">Mon – Sat: 9:30 AM – 7:30 PM IST</span>
              </div>

              <div className="pt-1">
                <Link to="/admin" className="text-[#888888] hover:text-[#B8860B] transition-colors text-[11px]">
                  Store Admin Portal →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="pt-8 border-t border-[#E0D8CB] flex flex-col sm:flex-row items-center justify-between text-xs text-[#4A4A4A] space-y-3 sm:space-y-0">
          <p>© 2026 Aleez Perfumes & Fragrances Private Limited. All rights reserved.</p>
          <p className="text-[11px] text-[#555555] text-center sm:text-right">
            Online luxury fragrance atelier. All prices inclusive of GST. Prepaid online checkout secured with 256-bit Razorpay encryption.
          </p>
        </div>
      </div>
    </footer>
  );
};
