import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Mail, Instagram, ShieldCheck, Truck, Sparkles, Award } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const Footer: React.FC = () => {
  const { settings, getWhatsAppUrl } = useSettings();

  return (
    <footer className="bg-[#F6F2EB] border-t border-[#EAE4D9] text-[#444444] pt-16 pb-12">
      {/* Brand Pillars Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-[#E0D8CB]">
          <div className="flex flex-col items-center text-center p-3">
            <Sparkles className="w-6 h-6 text-[#B8860B] mb-3" />
            <h4 className="text-xs uppercase tracking-widest text-[#141414] font-medium mb-1">Haute Parfumerie</h4>
            <p className="text-[12px] text-[#666666] font-light">Masterfully crafted original blends</p>
          </div>
          <div className="flex flex-col items-center text-center p-3">
            <Truck className="w-6 h-6 text-[#B8860B] mb-3" />
            <h4 className="text-xs uppercase tracking-widest text-[#141414] font-medium mb-1">Pan-India Express</h4>
            <p className="text-[12px] text-[#666666] font-light">Discreet and secured shipping</p>
          </div>
          <div className="flex flex-col items-center text-center p-3">
            <ShieldCheck className="w-6 h-6 text-[#B8860B] mb-3" />
            <h4 className="text-xs uppercase tracking-widest text-[#141414] font-medium mb-1">100% Secure Checkout</h4>
            <p className="text-[12px] text-[#666666] font-light">Razorpay encrypted transactions</p>
          </div>
          <div className="flex flex-col items-center text-center p-3">
            <Award className="w-6 h-6 text-[#B8860B] mb-3" />
            <h4 className="text-xs uppercase tracking-widest text-[#141414] font-medium mb-1">Authentic Essence</h4>
            <p className="text-[12px] text-[#666666] font-light">Uncompromised quality & longevity</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Presentation */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <span className="font-serif text-2xl tracking-[0.25em] font-semibold text-[#141414] block">
                ALEEZ
              </span>
              <span className="text-[10px] tracking-[0.4em] text-[#B8860B] uppercase block -mt-1 font-medium">
                Perfumes
              </span>
            </Link>
            <p className="text-sm text-[#555555] font-light leading-relaxed max-w-sm">
              Discover your signature scent. We curate exquisite Eau de Parfum, pure artisanal attars, and aged oud compositions designed to leave a lasting impression of refined distinction.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white border border-[#E0D8CB] flex items-center justify-center text-[#444444] hover:text-[#B8860B] hover:border-[#B8860B] transition-colors shadow-sm"
                aria-label="WhatsApp"
              >
                <MessageSquare className="w-4 h-4 text-[#25D366]" />
              </a>
              <a
                href={`mailto:${settings.email}`}
                className="w-9 h-9 rounded-full bg-white border border-[#E0D8CB] flex items-center justify-center text-[#444444] hover:text-[#B8860B] hover:border-[#B8860B] transition-colors shadow-sm"
                aria-label="Email"
              >
                <Mail className="w-4 h-4 text-[#B8860B]" />
              </a>
              <a
                href={settings.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white border border-[#E0D8CB] flex items-center justify-center text-[#444444] hover:text-[#B8860B] hover:border-[#B8860B] transition-colors shadow-sm"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4 text-pink-600" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-[#141414]">Explore</h3>
            <ul className="space-y-2 text-sm text-[#555555] font-light">
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
                <Link to="/shop?filter=new" className="hover:text-[#B8860B] transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#B8860B] transition-colors">
                  About Aleez
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-[#141414]">Policies</h3>
            <ul className="space-y-2 text-sm text-[#555555] font-light">
              <li>
                <Link to="/shipping" className="hover:text-[#B8860B] transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/refund" className="hover:text-[#B8860B] transition-colors">
                  Refund & Returns
                </Link>
              </li>
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
                <Link to="/admin" className="hover:text-[#B8860B] transition-colors text-xs text-[#888888]">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Concierge Support */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-[#141414]">Concierge</h3>
            <div className="space-y-2.5 text-sm text-[#555555] font-light">
              <div>
                <span className="block text-[11px] uppercase tracking-wider text-[#888888]">WhatsApp Support</span>
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#141414] hover:text-[#B8860B] transition-colors font-mono text-xs font-medium"
                >
                  {settings.phone}
                </a>
              </div>
              <div>
                <span className="block text-[11px] uppercase tracking-wider text-[#888888]">Direct Email</span>
                <a
                  href={`mailto:${settings.email}`}
                  className="text-[#141414] hover:text-[#B8860B] transition-colors text-xs break-all"
                >
                  {settings.email}
                </a>
              </div>
              <div>
                <span className="block text-[11px] uppercase tracking-wider text-[#888888]">Instagram</span>
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#B8860B] hover:underline text-xs"
                >
                  {settings.instagram}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="pt-8 border-t border-[#E0D8CB] flex flex-col sm:flex-row items-center justify-between text-xs text-[#777777] space-y-3 sm:space-y-0">
          <p>© 2026 Aleez Perfumes. All rights reserved.</p>
          <p className="text-[11px] text-[#777777] text-center sm:text-right">
            Online luxury fragrance atelier. Online prepaid payments powered by Razorpay.
          </p>
        </div>
      </div>
    </footer>
  );
};
